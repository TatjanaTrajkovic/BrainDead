<script setup>
defineProps({
  text: { type: String, required: true },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['select']);
</script>

<template>
  <button
    type="button"
    class="answer-box"
    :class="{ selected }"
    :disabled="disabled"
    @click="emit('select')"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.answer-box {
  width: 100%;
  height: 100%;
  padding: var(--space-3, 12px);
  background: var(--color-answer-bg, #1e1e1e);
  border: 2px solid var(--color-border-light, #e8dfb0);
  border-radius: 8px;
  color: var(--color-text-light, #f3eedc);
  font-family: var(--font-typewriter, 'Courier New', monospace);
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
}

.answer-box.selected {
  background: var(--color-story-bg, #4b2d6b);
}

.answer-box:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
