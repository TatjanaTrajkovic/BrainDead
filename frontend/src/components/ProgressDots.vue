<script setup>
defineProps({
  // Antal frågor i omgången, en prick per fråga
  total: {
    type: Number,
    default: 0,
  },
  // Antal besvarade frågor, så många prickar blir ifyllda
  answered: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="progress-dots" role="img" :aria-label="`${answered} av ${total} frågor besvarade`">
    <span
      v-for="n in total"
      :key="n"
      class="dot"
      :class="{ filled: n <= answered }"
      aria-hidden="true"
    ></span>
  </div>
</template>

<style scoped>
.progress-dots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid var(--color-border-outer, #c7bc90);
  border-radius: 50%;
}

.dot.filled {
  background: var(--color-border-outer, #c7bc90);
}
</style>
