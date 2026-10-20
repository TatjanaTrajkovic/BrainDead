<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  // Var repet hängs upp: andel av fönstret (0–1) ...
  anchorX: { type: Number, default: 0.5 },
  anchorY: { type: Number, default: 0 },
  // ... eller ett element, t.ex. '.home'. Har företräde.
  anchorTo: { type: String, default: '' },
  // Vilken sida av elementet spiken sitter vid: 'left' | 'center' | 'right'
  anchorSide: { type: String, default: 'center' },
  // Förskjutning i px från ankarpunkten (positivt = åt höger / neråt)
  anchorOffsetX: { type: Number, default: 0 },
  anchorOffsetY: { type: Number, default: 0 },
  // Spikbilden: visa den, hur bred den är, och var i bilden repet fästs
  // (0 = överkant, 0.5 = mitten, 1 = underkant)
  showNail: { type: Boolean, default: true },
  nailWidth: { type: Number, default: 28 },
  nailPivotY: { type: Number, default: 0.5 },
  // Replängd i px. 0 = automatisk (når scannern om den finns, annars 150 px).
  ropeLength: { type: Number, default: 0 },
  // Tummens bredd i px. Höjden följer bildens proportioner.
  thumbWidth: { type: Number, default: 80 },
  // CSS-selektor till scannern, t.ex. '.scanner'. Tom = ingen scanner.
  scannerSelector: { type: String, default: '' },
  // Hur länge man måste hålla tummen över scannern (ms)
  scanTime: { type: Number, default: 600 },
  // false = tummen ignorerar scannern (t.ex. när panelen redan visar sin meny)
  scanEnabled: { type: Boolean, default: true },
  // Lagerordning. Måste vara lägre än det som ska gå att klicka på ovanför tummen.
  zIndex: { type: Number, default: 9999 },
});
// scan-start    : tummen kom över scannern
// scan-progress : 0–1, skickas varje frame under scanningen
// scan-cancel   : tummen lämnade scannern eller släpptes innan det var klart
// scanned       : scanningen är klar
const emit = defineEmits(['scan-start', 'scan-progress', 'scan-cancel', 'scanned']);

/* =====================================================================
   SÅ FUNGERAR FYSIKEN (läs detta först)
   =====================================================================
   Repet är en rad små punkter, som pärlor på ett band. Tummen är en
   stel pinne som hänger i den sista punkten. Varje punkt har två
   positioner:

       x, y         = var punkten är nu
       oldX, oldY   = var den var förra framen

   Skillnaden mellan dem ÄR farten. Därför behövs inga hastighets-
   variabler: en punkt som flyttade sig 3 px åt höger sist fortsätter
   åt höger nästa gång, tills något stoppar den.

   Varje frame (ca 60 gånger per sekund) gör vi samma fyra saker:

     1. FLYTTA   Varje punkt fortsätter i sin fart och dras lite neråt
                 av gravitationen.
     2. RÄTTA    Punkterna har nu glidit isär eller tryckts ihop. Vi
                 går igenom varje par grannar och flyttar dem så att
                 avståndet blir rätt igen. Det görs flera varv, för
                 när man rättar ett par rubbar man grannparet.
     3. HÅLL     Om du håller i tummen flyttar vi den mot pekaren.
     4. RITA     Vi skriver ut punkternas positioner så att Vue ritar
                 om repet och tummen.

   Det är allt. Pendlingen, svängen och släpet uppstår av sig själva
   av dessa fyra steg.
   ===================================================================== */

// ---- Inställningar -------------------------------------------------
const ROPE_POINTS = 30; // antal punkter i repet. Fler = mjukare rep
const GRAVITY = 0.1; // hur många px per frame som punkterna dras neråt
const AIR_RESISTANCE = 0.995; // 1 = ingen luftmotstånd. Lägre = pendlar ut snabbare
const STIFFNESS = 30; // antal rättningsvarv per frame. Fler = stelare rep
const THUMB_GRAVITY_FACTOR = 1.5; // tummen är tyngre än repet
const GRIP_POINT = 0.7; // var på tummen som trycker på scannern (0 = toppen, 1 = spetsen)

// ---- Tillstånd -----------------------------------------------------
const imgEl = ref(null);
const ropePath = ref(''); // texten som SVG-linjen ritas från
const thumb = reactive({ x: 0, y: 0, angle: 0 }); // vad som ritas för tummen
const nailPos = reactive({ x: 0, y: 0 }); // var spiken ritas

const anchor = { x: 0, y: 0 }; // var repet sitter fast (spikens läge)
let linkLength = 5; // längd på varje replänk
let thumbLength = 95; // avstånd från repets ände till tummens spets

let rope = []; // repets punkter. rope[0] är vid spiken
const thumbTip = { x: 0, y: 0, oldX: 0, oldY: 0 }; // tummens spets

// grip = pekaren håller i tummen. Annars null.
//   along  = var på tummen man håller (0 = toppen, 1 = spetsen)
//   x, y   = var den punkten ska vara (pekarens läge)
let grip = null;

let scanState = 'idle'; // idle | scanning | finished
let scanStart = 0;
let animationFrame = 0;

// ---- Hjälpfunktioner för fysiken -----------------------------------

// 1. FLYTTA: låt en punkt fortsätta i sin fart och falla lite.
function movePoint(point, gravity) {
  const speedX = (point.x - point.oldX) * AIR_RESISTANCE;
  const speedY = (point.y - point.oldY) * AIR_RESISTANCE;

  point.oldX = point.x; // kom ihåg var den var
  point.oldY = point.y;

  point.x += speedX;
  point.y += speedY + gravity;
}

// 2. RÄTTA: få två punkter att hamna exakt `wantedLength` från varandra.
//    Är de för långt isär dras de ihop, är de för nära skjuts de isär.
//    `aCanMove` / `bCanMove` säger vilka som får flyttas (spiken får inte det).
function keepDistance(a, b, wantedLength, aCanMove, bCanMove) {
  if (!aCanMove && !bCanMove) return;

  const gapX = b.x - a.x;
  const gapY = b.y - a.y;
  const currentLength = Math.hypot(gapX, gapY) || 0.0001; // verkligt avstånd (Pythagoras)

  // Hur stor del av avståndet som är fel. Positivt = för långt isär.
  const error = (currentLength - wantedLength) / currentLength;

  // Får båda röra sig tar de hälften var av rättningen.
  const share = aCanMove && bCanMove ? 0.5 : 1;

  if (aCanMove) {
    a.x += gapX * error * share;
    a.y += gapY * error * share;
  }
  if (bCanMove) {
    b.x -= gapX * error * share;
    b.y -= gapY * error * share;
  }
}

// 3. HÅLL: dra den punkt på tummen som du håller i mot pekaren.
//    Håller du nära spetsen följer mest spetsen med, och håller du nära
//    toppen följer mest toppen med. Därför vrider sig tummen runt ditt grepp.
function pullGrippedPointToPointer() {
  const ropeEnd = rope[ROPE_POINTS - 1];
  const along = grip.along;

  // Var greppunkten är just nu, mitt emellan toppen och spetsen
  const gripX = ropeEnd.x + (thumbTip.x - ropeEnd.x) * along;
  const gripY = ropeEnd.y + (thumbTip.y - ropeEnd.y) * along;

  // Hur långt den är från pekaren
  const gapX = grip.x - gripX;
  const gapY = grip.y - gripY;

  const topShare = 1 - along; // toppen tar mest när du håller nära toppen
  const tipShare = along; // spetsen tar mest när du håller nära spetsen

  // Delarna måste räknas om så att greppunkten hamnar exakt på pekaren
  const normalize = topShare * topShare + tipShare * tipShare;

  ropeEnd.x += (gapX * topShare) / normalize;
  ropeEnd.y += (gapY * topShare) / normalize;
  thumbTip.x += (gapX * tipShare) / normalize;
  thumbTip.y += (gapY * tipShare) / normalize;
}

// Stoppa allt vid skärmens nederkant, utan studs.
function keepAboveFloor() {
  const floor = window.innerHeight - 4;
  for (const point of [...rope, thumbTip]) {
    if (point.y > floor) {
      point.y = floor;
      point.oldY = floor; // ingen fart kvar
    }
  }
}

// Hur många grader tummen ska lutas. 0 = hänger rakt ner.
// (atan2 ger vinkeln på linjen från toppen till spetsen, i radianer.)
function thumbAngleInDegrees() {
  const ropeEnd = rope[ROPE_POINTS - 1];
  const sideways = thumbTip.x - ropeEnd.x;
  const down = thumbTip.y - ropeEnd.y;
  const radians = Math.atan2(-sideways, down);
  return (radians * 180) / Math.PI;
}

// ---- En frame ------------------------------------------------------
function step(now) {
  const ropeEnd = rope[ROPE_POINTS - 1];

  // 1. FLYTTA. Punkt 0 är spiken och rör sig inte.
  for (let i = 1; i < ROPE_POINTS; i++) movePoint(rope[i], GRAVITY);
  movePoint(thumbTip, GRAVITY * THUMB_GRAVITY_FACTOR);

  // 2 + 3. RÄTTA och HÅLL, flera varv
  for (let pass = 0; pass < STIFFNESS; pass++) {
    // Spiken sitter fast
    rope[0].x = anchor.x;
    rope[0].y = anchor.y;

    // Varje replänk ska ha sin längd. Den första punkten (spiken) får inte flyttas.
    for (let i = 0; i < ROPE_POINTS - 1; i++) {
      const isNail = i === 0;
      keepDistance(rope[i], rope[i + 1], linkLength, !isNail, true);
    }

    // Tummen är en stel pinne: toppen och spetsen har alltid samma avstånd
    keepDistance(ropeEnd, thumbTip, thumbLength, true, true);

    if (grip) pullGrippedPointToPointer();
  }

  keepAboveFloor();
  updateScan(now);

  // 4. RITA
  ropePath.value = rope.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  thumb.x = ropeEnd.x;
  thumb.y = ropeEnd.y;
  thumb.angle = thumbAngleInDegrees();

  animationFrame = requestAnimationFrame(step);
}

// ---- Placering och mått --------------------------------------------
function getScannerCenter() {
  if (!props.scannerSelector) return null;
  const el = document.querySelector(props.scannerSelector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rect };
}

// Räkna ut var spiken ska sitta, och flytta repet med den om den ändrats.
function updateAnchor() {
  const el = props.anchorTo ? document.querySelector(props.anchorTo) : null;
  let x;
  let y;

  if (el) {
    const rect = el.getBoundingClientRect();
    const edge =
      props.anchorSide === 'right'
        ? rect.right
        : props.anchorSide === 'left'
          ? rect.left
          : rect.left + rect.width / 2;
    x = edge + props.anchorOffsetX;
    y = rect.top + props.anchorOffsetY;
  } else {
    x = window.innerWidth * props.anchorX + props.anchorOffsetX;
    y = window.innerHeight * props.anchorY + props.anchorOffsetY;
  }

  // Håll spiken inom skärmen, annars syns varken spik eller tumme
  const newX = Math.min(Math.max(x, 12), window.innerWidth - 12);
  const moveX = newX - anchor.x;
  const moveY = y - anchor.y;

  // Flytta hela repet och tummen lika mycket som spiken, både nuvarande och
  // gammal position. Då får de ingen fart av flytten och ingenting piskar iväg.
  if (rope.length && (moveX || moveY)) {
    for (const point of [...rope, thumbTip]) {
      point.x += moveX;
      point.y += moveY;
      point.oldX += moveX;
      point.oldY += moveY;
    }
  }

  anchor.x = newX;
  anchor.y = y;
  nailPos.x = newX;
  nailPos.y = y;
}

// Räkna ut mått från sidan: spikens plats, tummens längd, replängden.
function measure() {
  updateAnchor();
  thumbLength = imgEl.value?.offsetHeight || 95; // offsetHeight påverkas inte av rotation

  let totalLength = props.ropeLength;
  if (!totalLength) {
    const scanner = getScannerCenter();
    totalLength = scanner
      ? Math.max(
          160,
          (Math.hypot(scanner.x - anchor.x, scanner.y - anchor.y) - GRIP_POINT * thumbLength) *
            1.15,
        )
      : 150;
  }
  linkLength = totalLength / (ROPE_POINTS - 1);
}

// Sätt ut repet rakt nedåt från spiken, med en liten knuff så att det pendlar in.
function init() {
  measure();

  rope = Array.from({ length: ROPE_POINTS }, (_, i) => {
    const x = anchor.x + i * 0.5;
    const y = anchor.y + i * linkLength;
    return { x, y, oldX: x, oldY: y };
  });

  const tipY = anchor.y + (ROPE_POINTS - 1) * linkLength + thumbLength;
  Object.assign(thumbTip, { x: anchor.x, y: tipY, oldX: anchor.x, oldY: tipY });
}

// ---- Dra i tummen --------------------------------------------------
// Pekaren får inte dras längre bort än repet + tummen räcker.
function limitToReach(event, along) {
  const maxDistance = (ROPE_POINTS - 1) * linkLength + along * thumbLength;
  let dx = event.clientX - anchor.x;
  let dy = event.clientY - anchor.y;
  const distance = Math.hypot(dx, dy);
  if (distance > maxDistance) {
    dx *= maxDistance / distance;
    dy *= maxDistance / distance;
  }
  return { x: anchor.x + dx, y: anchor.y + dy };
}

function onPointerDown(event) {
  event.currentTarget.setPointerCapture(event.pointerId);

  // Var längs tummen tog du tag? Vi projicerar pekaren på linjen toppen→spetsen.
  const ropeEnd = rope[ROPE_POINTS - 1];
  const thumbDx = thumbTip.x - ropeEnd.x;
  const thumbDy = thumbTip.y - ropeEnd.y;
  const pointerDx = event.clientX - ropeEnd.x;
  const pointerDy = event.clientY - ropeEnd.y;
  const along =
    (pointerDx * thumbDx + pointerDy * thumbDy) / (thumbDx * thumbDx + thumbDy * thumbDy);
  const alongClamped = Math.min(1, Math.max(0, along)); // 0 = toppen, 1 = spetsen

  grip = { along: alongClamped, ...limitToReach(event, alongClamped) };
}

function onPointerMove(event) {
  if (grip) {
    Object.assign(grip, limitToReach(event, grip.along));
  }
}

function onPointerUp() {
  grip = null; // släpper man tummen avbryts en pågående scanning (se updateScan)
}

// ---- Scanning ------------------------------------------------------
// Körs varje frame. Scanningen pågår bara så länge du HÅLLER tummen över scannern.
function updateScan(now) {
  let isOver = false;

  if (grip && props.scanEnabled) {
    const scanner = getScannerCenter();
    if (scanner) {
      // Var på skärmen ligger tummens tryckpunkt?
      const ropeEnd = rope[ROPE_POINTS - 1];
      const pressX = ropeEnd.x + (thumbTip.x - ropeEnd.x) * GRIP_POINT;
      const pressY = ropeEnd.y + (thumbTip.y - ropeEnd.y) * GRIP_POINT;

      // Lite marginal under pågående scanning, så att ett litet skak inte avbryter
      const margin = scanState === 'scanning' ? 12 : 0;
      const r = scanner.rect;
      isOver =
        pressX > r.left - margin &&
        pressX < r.right + margin &&
        pressY > r.top - margin &&
        pressY < r.bottom + margin;
    }
  }

  if (!isOver) {
    if (scanState === 'scanning') emit('scan-cancel');
    scanState = 'idle';
    return;
  }

  if (scanState === 'idle') {
    scanState = 'scanning';
    scanStart = now;
    emit('scan-start');
  }

  if (scanState === 'scanning') {
    const progress = Math.min(1, (now - scanStart) / props.scanTime);
    emit('scan-progress', progress);
    if (progress >= 1) {
      scanState = 'finished'; // klar. Startar inte om förrän tummen lämnat scannern
      emit('scanned');
    }
  }
}

// ---- Livscykel -----------------------------------------------------
let resizeObserver = null;

onMounted(() => {
  init();
  window.addEventListener('resize', updateAnchor);
  window.addEventListener('scroll', updateAnchor, { passive: true });

  // Layouten kan ändras efter första renderingen (bilder, typsnitt), så följ elementet
  const el = props.anchorTo ? document.querySelector(props.anchorTo) : null;
  if (el) {
    resizeObserver = new ResizeObserver(updateAnchor);
    resizeObserver.observe(el);
  }

  animationFrame = requestAnimationFrame(step);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  cancelAnimationFrame(animationFrame);
  window.removeEventListener('resize', updateAnchor);
  window.removeEventListener('scroll', updateAnchor);
});
</script>

<template>
  <Teleport to="body">
    <div class="thumb-layer" :style="{ zIndex }">
      <img
        v-if="showNail"
        src="../assets/images/nail.webp"
        class="nail"
        alt=""
        draggable="false"
        :style="{
          width: nailWidth + 'px',
          transform: `translate(${nailPos.x}px, ${nailPos.y}px) translate(-50%, ${-nailPivotY * 100}%)`,
        }"
      />
      <svg class="rope" aria-hidden="true">
        <polyline
          :points="ropePath"
          fill="none"
          stroke="#2D1D00"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <img
        ref="imgEl"
        src="../assets/images/thumb_illustrated.webp"
        class="thumb"
        alt=""
        draggable="false"
        :style="{
          width: thumbWidth + 'px',
          marginLeft: -thumbWidth / 2 + 'px',
          transform: `translate(${thumb.x}px, ${thumb.y}px) rotate(${thumb.angle}deg)`,
        }"
        @load="init"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.thumb-layer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none; /* så att sidan under går att klicka på */
}

.nail {
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  pointer-events: none;
  user-select: none;
}

.rope {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.thumb {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top center; /* pivot = repets ände */
  pointer-events: auto; /* bara tummen fångar pekaren */
  touch-action: none; /* sidan scrollar inte när man drar */
  cursor: grab;
  user-select: none;
}
.thumb:active {
  cursor: grabbing;
}
</style>
