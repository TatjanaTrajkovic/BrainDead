<script setup>
import { computed } from 'vue';

const props = defineProps({
  feedback: {
    type: String,
    required: true,
  },
  healthBefore: {
    type: Number,
    required: true,
  },
  healthAfter: {
    type: Number,
    required: true,
  },
});

// Hälsan kommer som 0–1 från backend, visas som procent
const before = computed(() => Math.round(props.healthBefore * 100));
const after = computed(() => Math.round(props.healthAfter * 100));

const emit = defineEmits(['next-question']);

function goToNextQuestion() {
  emit('next-question');
}
</script>

<template>
  <section class="feedback-card">
    <h2>Vad hände?</h2>

    <p>{{ feedback }}</p>

    <p class="health">Hjärnkapacitet: {{ before }} % → {{ after }} %</p>

    <button type="button" @click="goToNextQuestion">Nästa fråga</button>
  </section>
</template>

<style scoped>
.feedback-card {
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  text-align: center;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
