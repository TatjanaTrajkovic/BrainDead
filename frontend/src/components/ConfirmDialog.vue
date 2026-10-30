<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: 'Avbryt' },
  // 'game' har spelets utseende, 'admin' adminsidans neutrala (#183). Standard är 'game',
  // så att rutan på startsidan inte påverkas
  variant: {
    type: String,
    default: 'game',
    validator: (value) => ['game', 'admin'].includes(value),
  },
  // Röd bekräfta-knapp för åtgärder som är svåra att ångra, t.ex. bann. Bara för admin
  danger: { type: Boolean, default: false },
});

const isAdmin = computed(() => props.variant === 'admin');

// Admin använder klasserna från AdminView. Rutan ligger kvar i DOM:en under .admin
// även när showModal() lyfter den överst, så klasserna och --admin-variablerna gäller
const cancelClass = computed(() => (isAdmin.value ? 'admin-button' : 'btn btn-gray'));
const confirmClass = computed(() => {
  if (!isAdmin.value) return 'btn btn-purple';
  return ['admin-button', props.danger ? 'admin-button--danger' : 'admin-button--primary'];
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
  <dialog
    ref="dialog"
    class="confirm-dialog"
    :class="{ 'confirm-dialog--admin': isAdmin }"
    @click.self="close"
  >
    <div class="confirm-content">
      <h2 v-if="title" class="confirm-title">{{ title }}</h2>
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-buttons">
        <!-- autofocus på Avbryt så att Enter inte råkar starta om -->
        <button type="button" :class="cancelClass" autofocus @click="close">
          {{ cancelText }}
        </button>
        <button type="button" :class="confirmClass" @click="confirm">
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

/* Admin: samma ruta, men med adminsidans färger och typsnitt, vänsterställd text
   och knapparna till höger som i de flesta verktyg */
.confirm-dialog--admin {
  max-width: min(420px, calc(100% - 2rem));
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  color: var(--admin-text);
  font-family: inherit;
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
}

.confirm-dialog--admin::backdrop {
  background: rgb(0 0 0 / 40%);
}

.confirm-dialog--admin .confirm-content {
  align-items: stretch;
  gap: 1rem;
  padding: 1.5rem;
  text-align: left;
}

.confirm-dialog--admin .confirm-title {
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: none;
}

.confirm-dialog--admin .confirm-buttons {
  justify-content: flex-end;
  gap: 0.5rem;
}

/* --danger i AdminView är bara röd text. I bekräftelsen fylls knappen,
   så att det syns vilken knapp som gör något som är svårt att ångra */
.confirm-dialog--admin .admin-button--danger {
  color: #ffffff;
  background: var(--admin-danger);
  border-color: var(--admin-danger);
}

.confirm-dialog--admin .admin-button--danger:hover {
  background: color-mix(in srgb, var(--admin-danger) 85%, #000000);
}
</style>
