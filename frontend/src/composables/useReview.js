import { computed, ref } from 'vue';
import { getSessionReview } from '@/api/gameApi';

// Svaren efter en avslutad omgång (#205). State ligger inne i funktionen, eftersom bara
// ReviewView använder det och varje besök ska hämta sin egen omgång
export function useReview() {
  const review = ref(null);
  const isLoading = ref(true);
  const error = ref('');

  const correctCount = computed(
    () => review.value?.questions.filter((q) => q.is_correct).length ?? 0,
  );

  async function load(sessionId) {
    isLoading.value = true;
    error.value = '';
    try {
      review.value = await getSessionReview(sessionId);
    } catch (err) {
      // Backend skickar en svensk feltext för 403 och 404, men inte om servern är nere
      error.value = err.status ? err.message : 'Kunde inte nå servern';
    } finally {
      isLoading.value = false;
    }
  }

  return { review, isLoading, error, correctCount, load };
}
