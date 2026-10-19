<script setup>
defineProps({
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
</script>

<template>
  <div class="scenario-box content-card" :class="{ feedback: isFeedback }">
    <h3 v-if="isFeedback" class="feedback-title">Vad hände?</h3>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.scenario-box {
  height: 100%;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.5;
}

.scenario-box p {
  margin: 0;
}

/* Feedbacken får grå bakgrund och rubrik så att den skiljer sig från scenariot */
.scenario-box.feedback {
  background-color: var(--color-bg-gray);
}

.feedback-title {
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  font-size: 2.1rem;
  font-weight: normal;
  line-height: 1;
  margin-bottom: 8px;
}
</style>
