<script setup>
defineProps({
  // Styr om "Återuppta omgång" går att klicka på
  hasActiveSession: { type: Boolean, default: false },
});

const emit = defineEmits(['start-new', 'resume', 'show-played']);
</script>

<template>
  <nav class="session-menu">
    <button type="button" @click="emit('start-new')">Initiera omgång</button>

    <button type="button" :disabled="!hasActiveSession" @click="emit('resume')">
      Återuppta omgång
    </button>

    <!-- Ingen endpoint för spelade omgångar än -->
    <button type="button" disabled title="Kommer snart" @click="emit('show-played')">
      Spelade omgångar
    </button>
  </nav>
</template>

<style scoped>
.session-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
  max-width: 240px;
}

button {
  padding: var(--space-3, 12px);
  background: var(--color-story-bg, #4b2d6b);
  border: 3px solid var(--color-border-light, #e8dfb0);
  border-radius: 6px;
  color: var(--color-text-light, #f3eedc);
  font-family: var(--font-typewriter, 'Courier New', monospace);
  text-transform: uppercase;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
