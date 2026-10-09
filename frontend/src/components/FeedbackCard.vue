<script setup>
defineProps({
  feedback: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['next-question']);

function goToNextQuestion() {
  emit('next-question');
}
</script>

<template>
  <section class="feedback-card">
    <h2>Vad hände?</h2>

    <p>{{ feedback }}</p>

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
