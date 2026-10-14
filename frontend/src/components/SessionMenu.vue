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
  background: var(--color-bg-purple, #5c2b78);
  border: 3px solid var(--color-border-outer, #c7bc90);
  border-radius: 6px;
  color: var(--color-text, #e7dcaa);
  font-family: var(--font-main, 'Special Elite', monospace);
  text-transform: uppercase;
  cursor: pointer;
}

button:hover:not(:disabled) {
  filter: brightness(1.2);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
