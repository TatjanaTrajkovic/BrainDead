<script setup>
import HandbookPage from './HandbookPage.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  // Sidorna i boken, t.ex. handbookPages från data/handbook.js. Varje sida är { sections: [...] }
  pages: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);

// Samma brytpunkt som @media i CSS:en nedan. Ändras den ena måste den andra ändras också
const mobileQuery = window.matchMedia('(max-width: 767px)');
// På smal skärm visas en sida i taget, annars ett uppslag med två sidor
const isSinglePage = ref(mobileQuery.matches);
const pagesPerView = computed(() => (isSinglePage.value ? 1 : 2));

// Index för sidan spelaren senast bläddrade till
const pageIndex = ref(0);

// Första sidan som visas. Ett uppslag börjar alltid på en jämn sida (0, 2, 4 …), så när skärmen
// växlar från en till två sidor hamnar sidan spelaren läste i rätt uppslag
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

function handleScreenChange(event) {
  isSinglePage.value = event.matches;
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

// Lyssnarna ligger på window och lever längre än komponenten, så de måste tas bort när boken stängs
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  mobileQuery.addEventListener('change', handleScreenChange);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  mobileQuery.removeEventListener('change', handleScreenChange);
});
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
  /* Lika bred som fönstret, max 1000px, och aldrig högre än fönstret */
  width: min(100%, 1000px, calc((100dvh - 2rem) * 2000 / 1552));
  aspect-ratio: 2000 / 1552;
  background: url('../assets/images/handbook_open.webp') center / contain no-repeat;
  /* Gör att cqi nedan räknas i procent av bokens bredd, så texten skalar med boken */
  container-type: inline-size;
  color: var(--color-ink);
  font-family: var(--font-handwritten);
  text-align: left;
}

/* Textytorna, uppmätta i procent av bilden så att de följer med när boken skalar */
.page {
  position: absolute;
  top: 8%;
  bottom: 14%;
  overflow-y: auto;
}

.page-left {
  left: 9%;
  right: 54%;
}

.page-right {
  left: 55%;
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
  left: 20%;
  right: 20%;
  bottom: 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.arrow,
.close {
  width: 6cqi;
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

/* En sida i taget: visa bara vänstra halvan av bokbilden */
@media (max-width: 767px) {
  .handbook {
    width: min(100%, calc((100dvh - 2rem) * 1000 / 1552));
    aspect-ratio: 1000 / 1552;
    background-size: 200% 100%;
    background-position: left;
  }

  .page {
    top: 8%;
  }

  .page-left {
    left: 18%;
    right: 8%;
  }

  .controls {
    left: 18%;
    right: 8%;
  }

  .arrow,
  .close {
    width: 11cqi;
  }
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
</style>
