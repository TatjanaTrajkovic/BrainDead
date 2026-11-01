<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  // Prologens sidor, t.ex. prologuePages från data/prologue.js. Varje sida är en textsträng
  pages: {
    type: Array,
    required: true,
  },
  popup: {
    type: Boolean,
    default: false,
  },
});

const pageIndex = ref(0);

const expanded = ref(false);

const isFirst = computed(() => pageIndex.value === 0);
const isLast = computed(() => pageIndex.value === props.pages.length - 1);

// Sidnummer med romerska siffror som i Figma, t.ex. "III/VII"
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const pageLabel = computed(
  () => `${ROMAN[pageIndex.value]}/${ROMAN[props.pages.length - 1] ?? props.pages.length}`,
);

function previous() {
  if (!isFirst.value) {
    pageIndex.value--;
  }
}

function next() {
  if (!isLast.value) {
    pageIndex.value++;
  }
}

function expand(event) {
  if (props.popup && !expanded.value && !event.target.closest('button')) {
    expanded.value = true;
  }
}

function collapse() {
  expanded.value = false;
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    collapse();
  }
}

watch(expanded, (isExpanded) => {
  if (isExpanded) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

watch(
  () => props.popup,
  (isPopup) => {
    if (!isPopup) {
      expanded.value = false;
    }
  },
);
</script>

<template>
  <Teleport to="body" :disabled="!expanded">
    <!-- wrap-div för tryck på bakgrund stänger -->
    <div class="wrap" :class="{ expanded }" @click.self="collapse">
      <section
        class="notebook"
        :class="{ clickable: popup && !expanded }"
        aria-label="Prolog"
        @click="expand"
      >
        <h2 class="title">prolog</h2>
        <p class="page-number">{{ pageLabel }}</p>

        <!-- :key ändras vid bläddring, så Vue kör toningen mellan sidorna -->
        <Transition name="page-fade" mode="out-in">
          <p :key="pageIndex" class="text" aria-live="polite">{{ pages[pageIndex] }}</p>
        </Transition>

        <p class="footer">Vässa sinnet – rädda skinnet!</p>

        <!-- Samma pil som pekar uppåt, roteras nedåt med CSS för nästa sida -->
        <button
          v-if="!isFirst"
          type="button"
          class="arrow arrow-previous"
          aria-label="Föregående sida"
          @click="previous"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
        </button>

        <button
          v-if="!isLast"
          type="button"
          class="arrow arrow-next"
          aria-label="Nästa sida"
          @click="next"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 L12 7 L19 16" /></svg>
        </button>
      </section>
      <button
        v-if="expanded"
        type="button"
        class="close-corner"
        aria-label="Stäng"
        @click="collapse"
      >
        ✕
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.wrap {
  display: contents;
}

.wrap.expanded {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 85%);
}

.expanded .notebook {
  width: min(92vw, calc((100dvh - 1rem) * 1640 / 2292));
}

.clickable {
  cursor: pointer;
}

.notebook {
  position: relative;
  /* Bildens proportioner, max 410px bred som i Figma */
  width: 100%;
  aspect-ratio: 1640 / 2292;
  background: url('../assets/images/prologue_notebook.webp') center / contain no-repeat;
  /* Gör att cqi nedan räknas i procent av blockets bredd, så texten skalar med blocket */
  container-type: inline-size;
  color: var(--color-ink);
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  text-align: left;
}

.title {
  position: absolute;
  top: 10%;
  left: 0;
  right: 0;
  font-size: 11cqi;
  font-weight: normal;
  line-height: 1;
  text-align: center;
}

.page-number {
  position: absolute;
  top: 17%;
  left: 0;
  right: 0;
  font-size: 5.5cqi;
  line-height: 1;
  text-align: center;
  text-decoration: underline overline;
}

/* Textytan, uppmätt i procent av bilden så att den följer med när blocket skalar */
.text {
  position: absolute;
  top: 23%;
  bottom: 18%;
  left: 9%;
  right: 9%;
  overflow-y: auto;
  font-size: 7.5cqi;
  line-height: 1.15;
  white-space: pre-line;
}

.footer {
  position: absolute;
  bottom: 9%;
  left: 0;
  right: 0;
  font-size: 4cqi;
  text-align: center;
  text-transform: uppercase;
}

/* Klasserna sätts av <Transition name="page-fade"> */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }
}

.arrow {
  position: absolute;
  right: 7%;
  width: 9%;
  color: var(--color-ink);
  opacity: 0.8;
}

.arrow-previous {
  top: 11%;
}

.arrow-next {
  bottom: 13%;
  transform: rotate(180deg);
}

.arrow:hover {
  opacity: 1;
}

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
