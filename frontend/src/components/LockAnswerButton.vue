<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  // true när spelaren markerat ett alternativ
  hasSelection: {
    type: Boolean,
    default: false,
  },
  // true medan svaret skickas, så att spelaren inte kan låsa två gånger
  submitting: {
    type: Boolean,
    default: false,
  },
  // true när svaret är låst och feedbacken visas, då blir knappen "Nästa fråga"
  locked: {
    type: Boolean,
    default: false,
  },
  // true när omgången är slut, då leder knappen till slutskärmen
  isLastQuestion: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['lock', 'next']);

// "Lås svar" och "Nästa fråga" sitter på samma knapp, så ett dubbelklick
// skulle annars hoppa förbi feedbacken. Klick ignoreras en kort stund efter låsning
const justLocked = ref(false);

watch(
  () => props.locked,
  (locked) => {
    if (locked) {
      justLocked.value = true;
      setTimeout(() => {
        justLocked.value = false;
      }, 400);
    }
  },
);

const label = computed(() => {
  if (props.locked) {
    return props.isLastQuestion ? 'Se resultat' : 'Nästa fråga >';
  }
  return props.submitting ? 'Låser...' : 'Lås svar';
});

const isDisabled = computed(() => !props.locked && (!props.hasSelection || props.submitting));

function handleClick() {
  if (justLocked.value) {
    return;
  }
  emit(props.locked ? 'next' : 'lock');
}
</script>

<template>
  <button type="button" class="lock-button" :disabled="isDisabled" @click="handleClick">
    {{ label }}
  </button>
</template>

<style scoped>
.lock-button {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  background: var(--color-bg-gray, #22201f);
  border: 3px solid var(--color-border-outer, #c7bc90);
  border-radius: 8px;
  color: var(--color-text, #e7dcaa);
  font-family: var(--font-main, 'Special Elite', monospace);
  font-size: clamp(1rem, 2.8cqw, 1.45rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
}

.lock-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
