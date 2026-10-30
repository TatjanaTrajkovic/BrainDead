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
    <p>Liseberg</p>
    <span
      v-for="n in total"
      :key="n"
      class="dot"
      :class="{ done: n <= answered, current: n === answered + 1 }"
      aria-hidden="true"
    ></span>
    <p>IKEA</p>
  </div>
</template>

<style scoped>
.progress-dots {
  --dot-size: clamp(16px, 4cqw, 32px);
  --dot-gap: clamp(8px, 2cqw, 18px);

  --dot-border: 0.2cqw;
  --dot-empty: rgba(162, 162, 162, 0.4);
  --dot-filled: var(--color-progress, #5c2b78);
  --dot-current: var(--color-text, #e7dcaa);

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: var(--dot-gap);
  width: 100%;
}

/* Start och mål lyser som neonskyltar, i krämgult med lila sken */
.progress-dots p {
  margin: 0;
  white-space: nowrap;
  color: var(--dot-current);
  font-size: clamp(0.4rem, 3cqw, 1.5rem);
  text-shadow:
    0 0 4px var(--dot-current),
    0 0 10px var(--dot-filled),
    0 0 16px var(--dot-filled);
}

.dot {
  position: relative;
  width: var(--dot-size);
  height: var(--dot-size);
  box-sizing: border-box;
  border: var(--dot-border) solid var(--dot-empty);
  border-radius: 50%;
  flex-shrink: 0;
  min-width: var(--dot-size);
  min-height: var(--dot-size);
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

.dot + .dot::after {
  content: '';
  position: absolute;
  top: 50%;
  right: calc(100% + var(--dot-border));
  transform: translateY(-50%);
  width: var(--dot-gap);
  height: var(--dot-border);
  background: var(--dot-empty);
}

.dot.done::after,
.dot.current::after {
  background: var(--dot-filled);
}

/* Liggande skärm, lodrät pelare som tidigare */
@media (orientation: landscape) {
  /* Start och mål lyser som neonskyltar, i krämgult med lila sken */
  .progress-dots {
    flex-direction: column-reverse;
    height: 100%;
    --dot-size: clamp(20px, 5cqh, 34px);
    --dot-gap: clamp(12px, 3cqh, 18px);
  }

  /* Streck ned till pricken under. Bara prickar med en prick före sig i DOM:en får ett,
   så den nedersta (fråga 1) får inget streck ned till Liseberg */
  .dot + .dot::after {
    top: calc(100% + var(--dot-border));
    left: 50%;
    transform: translateX(-50%);
    width: var(--dot-border);
    height: var(--dot-gap);
  }
}
</style>
