<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import HighScoreBoard from '@/components/HighScoreBoard.vue';

const emit = defineEmits(['close']);

const closeButton = ref(null);

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close');
  }
}

// Lyssnaren ligger på window och lever längre än komponenten, så den måste tas bort vid stängning
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  closeButton.value.focus();
});
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Topplista">
        <HighScoreBoard />

        <button
          ref="closeButton"
          type="button"
          class="close"
          aria-label="Stäng topplistan"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 8 L16 16 M16 8 L8 16" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgb(0 0 0 / 70%);
}

.sheet {
  position: relative;
  width: min(100%, calc((90dvh - 2rem) * 1232 / 1552));
}

/* Procent av pappret, så X:et skalar med det. */
.close {
  position: absolute;
  top: 3%;
  right: 10%;
  width: 7%;
  /* På mobil blir 7% bara ca 23px, för litet att träffa med fingret */
  min-width: 2rem;
  color: var(--color-ink);
  opacity: 0.6;
}

.close:hover {
  opacity: 1;
  filter: brightness(1.6);
}

.close:focus-visible {
  outline: 3px solid var(--color-ink);
  outline-offset: 3px;
}

svg {
  display: block;
  width: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
