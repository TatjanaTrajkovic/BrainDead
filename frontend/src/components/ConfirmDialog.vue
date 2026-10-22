<script setup>
import { ref } from 'vue';

defineProps({
  title: { type: String, default: '' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: 'Avbryt' },
});

const emit = defineEmits(['confirm']);

// <dialog> med showModal() lägger rutan överst, även ovanpå spelmenyn, och stänger med Esc
const dialog = ref(null);

function open() {
  dialog.value.showModal();
}

function close() {
  dialog.value.close();
}

function confirm() {
  close();
  emit('confirm');
}

// Föräldern öppnar rutan med ref, t.ex. restartDialog.value.open()
defineExpose({ open });
</script>

<template>
  <!-- Klick på bakgrunden träffar själva dialogen och räknas som Avbryt -->
  <dialog ref="dialog" class="confirm-dialog" @click.self="close">
    <div class="confirm-content">
      <h2 v-if="title" class="confirm-title">{{ title }}</h2>
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-buttons">
        <!-- autofocus på Avbryt så att Enter inte råkar starta om -->
        <button type="button" class="btn btn-gray" autofocus @click="close">
          {{ cancelText }}
        </button>
        <button type="button" class="btn btn-purple" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog {
  margin: auto;
  padding: 0;
  max-width: min(480px, calc(100% - 2rem));
  background: var(--color-bg-gray);
  border: 3px solid var(--color-border-outer);
  border-radius: 1rem;
  color: var(--color-text);
  font-family: var(--font-main);
}

.confirm-dialog::backdrop {
  background: rgb(0 0 0 / 70%);
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2rem;
  text-align: center;
}

.confirm-title {
  font-size: 1.4rem;
  text-transform: uppercase;
}

.confirm-message {
  line-height: 1.5;
}

.confirm-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.confirm-buttons .btn {
  text-transform: uppercase;
}
</style>




