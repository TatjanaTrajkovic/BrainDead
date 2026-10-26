import { ref } from 'vue';
import { getHighScores } from '@/api/gameApi';

// Utanför funktionen, så startsidans highscore och overlayen delar samma lista
const entries = ref([]);
const isLoading = ref(true);
const error = ref('');
// Hindrar att samtidig montering hämtar var sin gång
let pending = null;

async function load() {
  if (pending) {
    return pending;
  }
  pending = (async () => {
    try {
      entries.value = await getHighScores();
      error.value = '';
    } catch (err) {
      error.value = err.status ? err.message : 'Kunde inte nå servern';
    } finally {
      isLoading.value = false;
      pending = null;
    }
  })();
  return pending;
}

export function useHighScores() {
  return { entries, isLoading, error, load };
}
