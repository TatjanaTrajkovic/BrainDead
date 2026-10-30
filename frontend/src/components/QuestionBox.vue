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
  font-size: clamp(1.2rem, 3cqw, 2rem);
  font-weight: normal;
  line-height: 1.4;
}
</style>
