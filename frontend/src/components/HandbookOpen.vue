<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  // Sidorna i boken, t.ex. handbookPages från data/handbook.js. Varje sida är { title, text }
  pages: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);

// Vilket uppslag som visas. Ett uppslag är två sidor: uppslag 0 = sida 0 och 1, uppslag 1 = sida 2 och 3
const spreadIndex = ref(0);

const spreadCount = computed(() => Math.ceil(props.pages.length / 2));
const leftPage = computed(() => props.pages[spreadIndex.value * 2]);
// undefined på sista uppslaget om antalet sidor är udda
const rightPage = computed(() => props.pages[spreadIndex.value * 2 + 1]);

const isFirst = computed(() => spreadIndex.value === 0);
const isLast = computed(() => spreadIndex.value >= spreadCount.value - 1);

function previous() {
  if (!isFirst.value) {
    spreadIndex.value--;
  }
}

function next() {
  if (!isLast.value) {
    spreadIndex.value++;
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
          <template v-if="leftPage">
            <h2>{{ leftPage.title }}</h2>
            <p>{{ leftPage.text }}</p>
          </template>
        </div>

        <div class="page page-right">
          <template v-if="rightPage">
            <h2>{{ rightPage.title }}</h2>
            <p>{{ rightPage.text }}</p>
          </template>
        </div>

        <button type="button" class="close" aria-label="Stäng handboken" @click="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 8 L16 16 M16 8 L8 16" />
          </svg>
        </button>

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

        <button
          type="button"
          class="arrow arrow-next"
          aria-label="Nästa sida"
          :disabled="isLast"
          @click="next"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
        </button>
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
  left: 10%;
  right: 54%;
}

.page-right {
  left: 55%;
  right: 10%;
}

.page h2 {
  margin-bottom: 0.5em;
  font-size: max(1.5rem, 4cqi);
  text-transform: uppercase;
}

.page p {
  font-size: max(1.25rem, 3cqi);
  line-height: 1.2;
}

.close {
  position: absolute;
  top: 4%;
  right: 7%;
  width: 7%;
  color: var(--color-ink);
  opacity: 0.6;
}

.arrow {
  position: absolute;
  bottom: 4%;
  width: 6%;
  color: var(--color-ink);
}

.arrow-previous {
  left: 10%;
  transform: rotate(-90deg);
}

.arrow-next {
  right: 10%;
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
</style>
