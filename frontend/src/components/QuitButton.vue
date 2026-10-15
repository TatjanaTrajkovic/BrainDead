<script setup>
defineProps({
  // Spärrar knappen medan ett svar skickas
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['quit']);
</script>

<template>
  <button type="button" class="btn btn-gray" :disabled="disabled" @click="emit('quit')">
    Avbryt omgång
  </button>
</template>

<style scoped>
/* Övrig stil kommer från .btn och .btn-gray i base.css */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}
</style>
