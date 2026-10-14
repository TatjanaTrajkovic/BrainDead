<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="scenario-box">
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.scenario-box {
  height: 100%;
  box-sizing: border-box;
  padding: var(--space-4, 16px);
  background: var(--color-story-bg, #4b2d6b);
  border: 3px solid var(--color-border-light, #e8dfb0);
  border-radius: 12px;
  color: var(--color-text-light, #f3eedc);
  font-family: var(--font-typewriter, 'Courier New', monospace);
  font-size: 0.9rem;
  line-height: 1.5;
}

.scenario-box p {
  margin: 0;
}
</style>
