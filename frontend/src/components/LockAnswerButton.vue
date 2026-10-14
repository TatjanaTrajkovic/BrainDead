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
    return props.isLastQuestion ? 'Se resultat ' : 'Nästa fråga > ';
  }
  return props.submitting ? 'Låser...' : 'Lås svar';
});
</script>
