<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import StartButton from '@/components/StartButton.vue';

// Komponenten bara visar. Logiken ligger i useAccessFlow.
defineProps({
  state: { type: String, default: 'idle' }, // idle | scanning | granted | menu | result
  message: { type: String, default: '' }, // texten på skärmen när menyn inte visas
  progress: { type: Number, default: 0 }, // 0–1
  items: { type: Array, default: () => [] }, // [{ id, label }]
  selected: { type: Number, default: 0 }, // markerad rad i menyn
});
const emit = defineEmits(['up', 'down', 'ok', 'start']);

// Textstorleken följer panelens bredd, så att allt skalas med bilden
const panelEl = ref(null);
const panelWidth = ref(330);
let observer = null;

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    panelWidth.value = entry.contentRect.width;
  });
  observer.observe(panelEl.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    ref="panelEl"
    class="access-panel"
    :data-state="state"
    :style="{ '--pw': panelWidth + 'px' }"
  >
    <img
      src="../assets/images/panel.webp"
      alt="Kontrollpanel med skärm, fingeravtrycksscanner och röd knapp"
      draggable="false"
    />

    <!-- Skärmen -->
    <div class="monitor">
      <template v-if="state === 'menu'">
        <ul class="menu">
          <li v-for="(item, i) in items" :key="item.id" :class="{ sel: i === selected }">
            {{ item.label }}
          </li>
        </ul>
        <div class="arrows">
          <button type="button" aria-label="Upp" @click="emit('up')">▲</button>
          <button type="button" class="ok" aria-label="OK, välj" @click="emit('ok')">OK</button>
          <button type="button" aria-label="Ned" @click="emit('down')">▼</button>
        </div>
      </template>

      <template v-else>
        <div class="msg" :class="{ blink: state === 'idle' }" role="status" aria-live="polite">
          {{ message }}
        </div>
        <div class="bar" :class="{ visible: state === 'scanning' || state === 'granted' }">
          <span :style="{ width: progress * 100 + '%' }" />
        </div>
      </template>
    </div>

    <!-- Scanner-ytan. ThumbTest letar efter klassen .access-scanner -->
    <div class="access-scanner">
      <div class="glow" />
      <div class="line" />
    </div>

    <!-- Hela StartButton ligger ovanpå panelbildens röda knapp och döljer den.
         Den går bara att använda i vila. Under skanning och i menyn är den spärrad
         (menyn har sin egen OK-knapp på skärmen) -->
    <div class="start-slot">
      <StartButton @start="emit('start')" />
    </div>
  </div>
</template>

<style scoped>
.access-panel {
  --controls-z: 20; /* över tummen. Tummens zIndex-prop måste vara lägre */
  position: relative;
  width: 100%;
  aspect-ratio: 936 / 2000;
}

.access-panel img {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  filter: drop-shadow(0 10px 18px rgb(0 0 0 / 35%));
}

/* ---- Skärmen ---- */
.monitor {
  position: absolute;
  top: 6.5%;
  left: 20%;
  z-index: var(--controls-z);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--pw, 330px) * 0.04);
  width: 60%;
  height: 19%;
  padding: 0 2%;
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: calc(var(--pw, 330px) * 0.054);
  letter-spacing: 0.08em;
  text-align: center;
  color: #7dffb0;
  text-shadow: 0 0 8px rgb(125 255 176 / 70%);
  pointer-events: none; /* så att tummen går att ta tag i under texten */
}

.msg.blink {
  animation: blink 1.6s ease-in-out infinite;
  padding-top: 10%;
}
@keyframes blink {
  50% {
    opacity: 0.45;
  }
}

.bar {
  width: 80%;
  height: calc(var(--pw, 330px) * 0.012);
  background: rgb(125 255 176 / 18%);
  opacity: 0;
}
.bar.visible {
  opacity: 1;
}
.bar span {
  display: block;
  width: 0;
  height: 100%;
  background: #7dffb0;
  box-shadow: 0 0 8px #7dffb0;
}

/* ---- Menyn ---- */
.menu {
  display: flex;
  flex-direction: column;
  width: 62%;
  margin: 0 20% 0 0;
  padding: 0;
  list-style: none;
  text-align: left;
  white-space: pre;
}
.menu li {
  padding: 0.3em 0.4em;
  border: 1px solid transparent;
}
.menu li::before {
  content: '  ';
}
.menu li.sel {
  background: rgba(175, 201, 186, 0.18);
  border-color: #7dffb0;
}
.menu li.sel::before {
  content: '> ';
}

.arrows {
  position: absolute;
  top: 7.5%;
  right: 10%;
  bottom: 8%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.arrows button {
  all: unset;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: calc(var(--pw, 330px) * 0.1);
  height: calc(var(--pw, 330px) * 0.1);
  color: #7dffb0;
  cursor: pointer;
  background: rgb(125 255 176 / 8%);
  border: 1px solid #7dffb0;
  pointer-events: auto;
}
.arrows button:active {
  background: rgb(125 255 176 / 35%);
}
.arrows .ok {
  font-size: calc(var(--pw, 330px) * 0.04);
  letter-spacing: 0;
}
.arrows button:focus-visible {
  outline: 2px solid #7dffb0;
  outline-offset: 2px;
}

/* ---- Scanner-ytan över fingeravtrycket ---- */
.access-scanner {
  position: absolute;
  top: 35%;
  left: 28.85%;
  width: 42.2%;
  height: 21.25%;
  overflow: hidden;
  border-radius: 6%;
  pointer-events: none;
}
.glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgb(120 255 255 / 55%), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}
.line {
  position: absolute;
  top: 8%;
  right: 6%;
  left: 6%;
  height: 3px;
  background: #bff;
  box-shadow: 0 0 12px 3px #4ff;
  opacity: 0;
}
[data-state='scanning'] .glow {
  opacity: 1;
}
[data-state='scanning'] .line {
  opacity: 1;
  animation: sweep 0.9s ease-in-out infinite alternate;
}
[data-state='granted'] .glow {
  background: radial-gradient(circle, rgb(120 255 160 / 60%), transparent 70%);
  opacity: 1;
}
@keyframes sweep {
  to {
    top: 90%;
  }
}

/* ---- StartButton över den röda knappen ----
   Lådbilden har proportionerna 1226×1526. Den röda knappen i lådan sitter på ca 50 %
   av lådans bredd och höjd och är ca 41 % av lådans bredd. Knappen i panelbilden är ca 31 %
   av panelens bredd, därför blir lådan ca 76 % av panelens bredd. Top är räknad så att
   mittpunkterna sammanfaller (panelknappens mitt ligger på ca 76,5 % av höjden).
   z-index 5 ligger under tummen (10), så tummen kan dras över lådan utan att fastna bakom den. */
.start-slot {
  position: absolute;
  top: 49%;
  left: 2%;
  z-index: 5;
  width: 96%;
  /* Beskär lådan: inset(övre höger nedre vänster). Procenten räknas på lådans egen storlek */
  clip-path: inset(22% 15% 20% 16% round 2%);
}
</style>
