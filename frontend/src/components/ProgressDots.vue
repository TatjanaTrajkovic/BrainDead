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
  --dot-size: 32px;
  --dot-gap: 16px;
  --dot-border: 3px;
  --dot-empty: rgba(162, 162, 162, 0.4);
  --dot-filled: var(--color-progress, #5c2b78);

  display: flex;
  /* Fråga 1 längst ned, så att prickarna fylls nedifrån och upp mot IKEA */
  flex-direction: column-reverse;
  align-items: center;
  gap: var(--dot-gap);
  width: 48px;
  height: 100%;
}

.dot {
  position: relative;
  width: var(--dot-size);
  height: var(--dot-size);
  box-sizing: border-box;
  border: var(--dot-border) solid var(--dot-empty);
  border-radius: 50%;
}

.dot.filled {
  background: var(--dot-filled);
  border-color: var(--dot-filled);
}

/* Streck ned till pricken under. Den nedersta (fråga 1) har ingen under sig */
.dot:not(:first-child)::after {
  content: '';
  position: absolute;
  top: calc(100% + var(--dot-border));
  left: 50%;
  transform: translateX(-50%);
  width: var(--dot-border);
  height: var(--dot-gap);
  background: var(--dot-empty);
}

.dot.filled::after {
  background: var(--dot-filled);
}
</style>
