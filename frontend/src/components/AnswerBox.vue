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
  font-size: 0.8rem;
  text-transform: uppercase;
}

.answer-box:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
