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
  }
});

const emit = defineEmits(['lock', 'next']);

