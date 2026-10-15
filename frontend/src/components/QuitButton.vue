<script setup>
defineProps({
  // Spärrar knappen medan ett svar skickas
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['quit']);
</script>

<template>
  <button type="button" class="quit-button" :disabled="disabled" @click="emit('quit')">
    Avbryt omgång
  </button>
</template>

<style scoped>
.quit-button {
  padding: 8px 16px;
  background: var(--color-bg-gray, #22201f);
  border: 2px solid var(--color-border-outer, #c7bc90);
  border-radius: 6px;
  color: var(--color-text, #e7dcaa);
  font-family: var(--font-main, 'Special Elite', monospace);
  text-transform: uppercase;
  cursor: pointer;
}

.quit-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
