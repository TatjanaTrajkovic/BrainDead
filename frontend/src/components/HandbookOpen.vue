<script setup>
import HandbookPage from './HandbookPage.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useMediaQuery } from '../composables/useMediaQuery';

const props = defineProps({
  // Sidorna i boken, t.ex. handbookPages från data/handbook.js. Varje sida är { sections: [...] }
  pages: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);

// Samma brytpunkt som @media i CSS:en nedan. Ändras den ena måste den andra ändras också
const isDesktop = useMediaQuery('(orientation: landscape)');
// På smal skärm visas en sida i taget, annars ett uppslag med två sidor
const isSinglePage = computed(() => !isDesktop.value);
const pagesPerView = computed(() => (isSinglePage.value ? 1 : 2));

// Index för sidan spelaren senast bläddrade till
const pageIndex = ref(0);

// Första sidan som visas. Ett uppslag börjar alltid på en jämn sida (0, 2, 4 …), så när skärmen
// växer från en till två sidor hamnar sidan spelaren läste i rätt uppslag
const firstPageIndex = computed(() =>
  isSinglePage.value ? pageIndex.value : pageIndex.value - (pageIndex.value % 2),
);

const leftPage = computed(() => props.pages[firstPageIndex.value]);
// undefined på sista uppslaget om antalet sidor är udda
const rightPage = computed(() =>
  isSinglePage.value ? undefined : props.pages[firstPageIndex.value + 1],
);

const isFirst = computed(() => firstPageIndex.value === 0);
const isLast = computed(() => firstPageIndex.value + pagesPerView.value >= props.pages.length);

function previous() {
  if (!isFirst.value) {
    pageIndex.value = firstPageIndex.value - pagesPerView.value;
  }
}

function next() {
  if (!isLast.value) {
    pageIndex.value = firstPageIndex.value + pagesPerView.value;
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close');
  } else if (event.key === 'ArrowLeft') {
    previous();
  } else if (event.key === 'ArrowRight') {
    next();
  }
}

// Lyssnaren ligger på window och lever längre än komponenten, så den måste tas bort när boken stängs
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <!-- Teleport flyttar modalen till <body> så att föräldrarnas CSS inte påverkar den -->
  <Teleport to="body">
    <!-- .self: stäng bara vid klick på själva bakgrunden, inte på boken -->
    <div class="overlay" @click.self="emit('close')">
      <section class="handbook" role="dialog" aria-modal="true" aria-label="Handbok för överlevare">
        <div class="page page-left">
          <Transition name="page-fade" mode="out-in">
            <HandbookPage v-if="leftPage" :key="firstPageIndex" :page="leftPage" />
          </Transition>
        </div>

        <div v-if="!isSinglePage" class="page page-right">
          <Transition name="page-fade" mode="out-in">
            <HandbookPage v-if="rightPage" :key="firstPageIndex + 1" :page="rightPage" />
          </Transition>
        </div>

        <nav class="controls">
          <!-- Samma pil som pekar uppåt, roteras åt vänster eller höger med CSS -->
          <button
            type="button"
            class="arrow arrow-previous"
            aria-label="Föregående sida"
            :disabled="isFirst"
            @click="previous"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
          </button>

          <button type="button" class="close" aria-label="Stäng handboken" @click="emit('close')">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 8 L16 16 M16 8 L8 16" />
            </svg>
          </button>

          <button
            type="button"
            class="arrow arrow-next"
            aria-label="Nästa sida"
            :disabled="isLast"
            @click="next"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
          </button>
        </nav>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgb(0 0 0 / 70%);
}

.handbook {
  position: relative;
  /* Mobil: en sida i taget — lika bred som fönstret men aldrig högre än det */
  width: min(100%, calc((100dvh - 2rem) * 1000 / 1552));
  aspect-ratio: 1000 / 1552;
  /* Visa bara vänstra halvan av uppslagsbilden */
  background: url('../assets/images/handbook_open.webp') left center / 200% 100% no-repeat;
  /* Gör att cqi nedan räknas i procent av bokens bredd, så texten skalar med boken */
  container-type: inline-size;
  color: var(--color-ink);
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  text-align: left;
}

/* Textytan, uppmätt i procent av bilden så att den följer med när boken skalas */
.page {
  position: absolute;
  top: 8%;
  bottom: 14%;
  overflow-y: auto;
  container-type: inline-size;
}

/* Mobil: textytan täcker den synliga halvan */
.page-left {
  left: 18%;
  right: 8%;
}

/* Klasserna sätts av <Transition name="page-fade">: -enter när texten kommer in, -leave när den går */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Respektera spelare som stängt av animationer i operativsystemet */
@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }
}

/* Navigering med föregående, stäng och nästa, stäng i mitten */
.controls {
  position: absolute;
  left: 18%;
  right: 8%;
  bottom: 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.arrow,
.close {
  /* Större grepp på mobil där boken är smal */
  width: 11cqi;
  color: var(--color-ink);
}

.close {
  opacity: 0.6;
}

.arrow-previous {
  transform: rotate(-90deg);
}

.arrow-next {
  transform: rotate(90deg);
}

.arrow:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.close:hover,
.arrow:hover:not(:disabled) {
  opacity: 1;
  filter: brightness(1.6);
}

.close:focus-visible,
.arrow:focus-visible {
  outline: 3px solid var(--color-ink);
  outline-offset: 3px;
}

svg {
  display: block;
  width: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Desktop: hela uppslaget med två sidor */
@media (orientation: landscape) {
  .handbook {
    width: min(100%, calc((90dvh - 2rem) * 2000 / 1552));
    aspect-ratio: 2000 / 1552;
    background-size: 100% 100%;
    background-position: center;
  }

  .page-left {
    left: 9%;
    right: 54%;
  }

  .page-right {
    left: 55%;
    right: 8%;
  }

  .controls {
    left: 20%;
    right: 20%;
  }

  .arrow,
  .close {
    width: 6cqi;
  }
}
</style>
