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
  font-size: 1rem;
  font-weight: normal;
  line-height: 1.4;
}
</style>
