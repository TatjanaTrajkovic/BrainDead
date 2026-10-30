<script setup>
defineProps({
  // Spärrar knappen medan ett svar skickas
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['quit']);
</script>

<template>
  <button type="button" class="btn btn-gray" :disabled="disabled" @click="emit('quit')">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-door-stairwell preview-icon"
    >
      <path d="M12 17v-3a1 1 0 011-1h6" />
      <path d="M19 17h-9a1 1 0 00-1 1v3" />
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
      <path d="M19 9h-3a1 1 0 00-1 1v3" />
      <path d="M22 21H2" />
    </svg>
  </button>
</template>

<style scoped>
.btn {
  display: flex;
  flex-direction: row;
  padding: 0.2rem;
}

.btn svg {
  width: auto;
  height: auto;
}

/* Övrig stil kommer från .btn och .btn-gray i base.css */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}
</style>
