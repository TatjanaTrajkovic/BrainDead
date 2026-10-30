<script setup>
import { nextTick, ref, watch } from 'vue';
import { useScrollArrows } from '../composables/useScrollArrows';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  // true i feedback-fasen, då visas texten som ett svar på spelarens val
  isFeedback: {
    type: Boolean,
    default: false,
  },
});

const scroller = ref(null);
const { canScrollUp, canScrollDown, updateArrows, scrollStep, scrollToTop } =
  useScrollArrows(scroller);

// Ny text (nästa fråga eller feedback) börjar från toppen
watch(
  () => props.text,
  async () => {
    await nextTick();
    scrollToTop();
  },
);
</script>

<template>
  <div class="scenario-box">
    <div class="content-card" :class="{ feedback: isFeedback }">
      <h3 v-if="isFeedback" class="feedback-title">Vad hände?</h3>

      <div class="scroll-area">
        <!-- tabindex så att texten går att scrolla med tangentbordet -->
        <div ref="scroller" class="text" tabindex="0" @scroll="updateArrows">
          <p>{{ text }}</p>
        </div>

        <!-- Samma pil som i prologen, pekar uppåt och roteras nedåt med CSS -->
        <button
          v-if="canScrollUp"
          type="button"
          class="arrow arrow-up"
          aria-label="Scrolla upp"
          @click="scrollStep(-1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
        </button>

        <button
          v-if="canScrollDown"
          type="button"
          class="arrow arrow-down"
          aria-label="Scrolla ner"
          @click="scrollStep(1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-box {
  height: 100%;
  text-align: left;
  font-size: clamp(1.2rem, 3cqw, 5rem);
  line-height: 1.5;
}

/* Kortet fyller rutan och står still, bara texten inuti scrollar */
.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Pilarna placeras i den här ytan, så att uppåtpilen hamnar under rubriken i feedback-fasen */
.scroll-area {
  position: relative;
  flex: 1;
  min-height: 0;
}

.text {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Plats för pilarna, så att texten inte hamnar under dem */
  padding-right: 2.25rem;
  /* Döljer scrollbaren men behåller scrollningen, pilarna visar att det finns mer */
  scrollbar-width: none;
}

.text::-webkit-scrollbar {
  display: none;
}

.scenario-box p {
  margin: 0;
}

/* Feedbacken får grå bakgrund och rubrik så att den skiljer sig från scenariot */
.content-card.feedback {
  background-color: var(--color-bg-gray);
}

.feedback-title {
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  font-size: clamp(1.5rem, 4cqw, 5rem);
  font-weight: normal;
  line-height: 1;
  margin-bottom: 8px;
}

.arrow {
  position: absolute;
  right: 0;
  width: 1.75rem;
  color: currentColor;
  opacity: 0.8;
}

.arrow-up {
  top: 0;
}

.arrow-down {
  bottom: 0;
  transform: rotate(180deg);
}

.arrow:hover {
  opacity: 1;
}

.arrow:focus-visible {
  outline: 3px solid currentColor;
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
