<script setup>
defineProps({
  // Antal frågor i omgången, en prick per fråga
  total: {
    type: Number,
    default: 0,
  },
  // Antal besvarade frågor. Pricken efter dem är frågan spelaren är på
  answered: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="progress-dots" role="img" :aria-label="`Fråga ${answered + 1} av ${total}`">
    <span
      v-for="n in total"
      :key="n"
      class="dot"
      :class="{ done: n <= answered, current: n === answered + 1 }"
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
  --dot-current: var(--color-text, #e7dcaa);

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

.dot.done {
  background: var(--dot-filled);
  border-color: var(--dot-filled);
}

/* Frågan spelaren är på, ifylld i krämgult med ett svagt sken */
.dot.current {
  background: var(--dot-current);
  border-color: var(--dot-current);
  box-shadow: 0 0 8px var(--dot-current);
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

/* Strecket ned från en besvarad eller pågående fråga leder till en besvarad prick */
.dot.done::after,
.dot.current::after {
  background: var(--dot-filled);
}
</style>
