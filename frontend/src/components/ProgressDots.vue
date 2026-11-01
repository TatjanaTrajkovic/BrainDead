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
  <div
    class="progress-dots"
    :style="{ '--n': total }"
    role="img"
    :aria-label="`Fråga ${answered + 1} av ${total}`"
  >
    <p>Liseberg</p>
    <template v-for="n in total" :key="n">
      <span
        class="dot"
        :class="{ done: n <= answered, current: n === answered + 1 }"
        aria-hidden="true"
      ></span>
      <!-- Streck till nästa prick, sista får inget streck -->
      <span
        v-if="n < total"
        class="link"
        :class="{ done: n <= answered }"
        aria-hidden="true"
      ></span>
    </template>
    <p>IKEA</p>
  </div>
</template>

<style scoped>
.progress-dots {
  --dot-size: clamp(16px, 4cqmin, 32px);
  --dot-gap: clamp(4px, 2cqmin, 18px);

  --dot-border: 0.5cqmin;
  --dot-empty: rgba(162, 162, 162, 0.4);
  --dot-filled: var(--color-progress, #5c2b78);
  --dot-current: var(--color-text, #e7dcaa);

  display: flex;
  flex-direction: row;
  align-items: center;

  width: 100%;
}

/* Start och mål lyser som neonskyltar, i krämgult med lila sken */
.progress-dots p {
  margin-inline: var(--dot-gap);
  white-space: nowrap;
  color: var(--dot-current);
  font-size: clamp(0.4rem, 3cqmin, 1.5rem);
  text-shadow:
    0 0 4px var(--dot-current),
    0 0 10px var(--dot-filled),
    0 0 16px var(--dot-filled);
}

.dot {
  width: var(--dot-size);
  height: var(--dot-size);
  box-sizing: border-box;
  border: var(--dot-border) solid var(--dot-empty);
  border-radius: 50%;
  flex-shrink: 0;
  min-width: var(--dot-size);
  min-height: var(--dot-size);
}

.link {
  flex: 1 1 0;
  height: var(--dot-border);
  min-width: 0;
  background: var(--dot-empty);
}

.dot.done,
.link.done {
  background: var(--dot-filled);
}

.dot.done {
  border-color: var(--dot-filled);
}

/* Frågan spelaren är på, ifylld i krämgult med ett svagt sken */
.dot.current {
  background: var(--dot-current);
  border-color: var(--dot-current);
  box-shadow: 0 0 8px var(--dot-current);
}

@media (orientation: landscape),
  (orientation: portrait) and (pointer: coarse) and (min-width: 768px) {
  .progress-dots {
    flex-direction: column-reverse;
    height: 100%;
    --dot-size: min(clamp(8px, 8cqmin, 40px), calc((100cqh - 6.5rem) / max(var(--n), 1)));
  }

  .progress-dots p {
    margin: var(--dot-gap) 0;
  }

  .link {
    width: var(--dot-border);
    height: auto;
    min-height: 0;
  }
}

/* Kompakt liggande: mindre prickar så strecken syns */
@media (orientation: landscape) and (max-width: 767px),
  (orientation: landscape) and (pointer: coarse),
  (orientation: landscape) and (max-height: 600.5px) {
  .progress-dots {
    --dot-size: min(clamp(8px, 5cqmin, 32px), calc((100cqh - 6.5rem) / max(var(--n), 1)));
  }
}
</style>
