<script setup>
defineProps({
  // Styr om "Återuppta omgång" går att klicka på
  hasActiveSession: { type: Boolean, default: false },
});

const emit = defineEmits(['start-new', 'resume', 'show-played']);
</script>

<template>
  <nav class="session-menu">
    <button type="button" class="btn btn-large" @click="emit('start-new')">
      <span>Initiera omgång</span>
    </button>
    <button
      type="button"
      class="btn btn-large"
      :disabled="!hasActiveSession"
      :title="hasActiveSession ? undefined : 'Du har ingen pågående omgång'"
      @click="emit('resume')"
    >
      <span>Återuppta omgång</span>
    </button>
    <!-- Ingen endpoint för spelade omgångar än -->
    <!-- <button
      type="button"
      class="btn btn-large bottom-btn"
      disabled
      title="Kommer snart"
      @click="emit('show-played')"
    >
      <span>Spelade omgångar</span>
    </button> -->
  </nav>
</template>

<style scoped>
.session-menu {
  display: grid;
  width: min(200px, 100vw - 4rem);
  gap: var(--space-3, 20px);
  grid-template-columns: minmax(0, 1fr);
  container-type: inline-size;
}

.bottom-btn {
  grid-column: 1 / -1; /* Sträcker sig över alla kolumner (hamnar i mitten) */
  justify-self: center;
}

@media (orientation: landscape) {
  .session-menu {
    width: min(768px, 100vw - 4rem);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3, 60px);
  }
}
</style>
