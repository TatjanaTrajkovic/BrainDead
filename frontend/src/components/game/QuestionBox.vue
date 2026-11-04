<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="question-box content-card">
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.question-box p {
  font-size: clamp(1rem, 3.4cqmin, 2rem);
  font-weight: normal;
  line-height: 1.4;
}

@media (orientation: landscape) and (pointer: coarse) {
  .question-box p {
    font-size: clamp(1rem, 4.3cqmin, 2rem);
  }
}
</style>
