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
    class="answer-box btn"
    :class="selected ? 'btn-purple' : 'btn-gray'"
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
  padding: clamp(5px, 1.5cqmin, 14px) clamp(8px, 2cqmin, 16px);
  font-size: clamp(1rem, 2.8cqmin, 1.5rem);
  line-height: 1.3;
  text-transform: uppercase;
}

.answer-box:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (orientation: landscape) and (pointer: coarse) {
  .answer-box {
    font-size: clamp(1rem, 3cqmin, 2rem);
  }
}
</style>
