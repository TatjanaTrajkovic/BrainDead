<script setup>
import { ref } from 'vue';
import { useScrollArrows } from '../composables/useScrollArrows';

defineProps({
  // En sida i boken: { sections: [{ title:, subtitle:, text:, warning:, image: }] }. Alla fält är valfria
  page: { type: Object, required: true },
});

// Samma scrollpilar som i spelets textruta. Varje sida är en ny komponent (:key i HandbookOpen),
// så en ny sida börjar alltid från toppen
const scroller = ref(null);
const { canScrollUp, canScrollDown, updateArrows, scrollStep } = useScrollArrows(scroller);
</script>

<template>
  <div class="scroll-area">
    <!-- tabindex så att sidan går att scrolla med tangentbordet -->
    <div ref="scroller" class="scroller" tabindex="0" @scroll="updateArrows">
      <div class="page-content">
        <section
          v-for="(section, i) in page.sections"
          :key="i"
          :class="{ 'has-image': section.image }"
        >
          <h2 v-if="section.title">{{ section.title }}</h2>
          <h3 v-if="section.subtitle">{{ section.subtitle }}</h3>
          <p v-if="section.text">{{ section.text }}</p>
          <p v-if="section.warning" class="warning">{{ section.warning }}</p>
          <img v-if="section.image" :src="section.image.src" :alt="section.image.alt" />
        </section>
      </div>
    </div>

    <!-- Samma pil som i ScenarioBox, pekar uppåt och roteras nedåt med CSS -->
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
</template>

<style scoped>
/* Pilarna placeras i den här ytan, bara texten inuti scrollar */
.scroll-area {
  position: relative;
  height: 100%;
}

.scroller {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Döljer scrollbaren men behåller scrollningen, pilarna visar att det finns mer */
  scrollbar-width: none;
}

.scroller::-webkit-scrollbar {
  display: none;
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

/* margin mellan sections, men inte före det första */
section + section {
  margin-top: 1em;
}

h2 {
  font-size: max(1.35rem, 9cqi);
  text-transform: uppercase;
  margin: 0;
}

h3 {
  font-size: max(1.2rem, 8.5cqi);
  margin: 0;
}

p {
  font-size: max(1.05rem, 8cqi);
  line-height: 1.2;
  white-space: pre-line;
  margin: 0;
}

.warning {
  color: #750000;
  margin: 0;
}

/* container för img fyller hela .page */
.page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* section med bild fyller höjden */
section.has-image {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

img {
  display: block;
  flex: 1;
  min-height: 5em;
  width: 100%;
  object-fit: contain;
  margin: 0.5em 0;
  opacity: 0.8;
}
</style>
