import { computed, ref } from 'vue';
import { answerQuestion, getNextQuestion, startSession } from '../api/gameApi';

// Samlar spelloopen: starta omgång → fråga → svar → feedback → nästa fråga → slut.
// phase styr vad som visas: 'idle' | 'loading' | 'question' | 'feedback' | 'finished'
export function useGame() {
  const phase = ref('idle');
  const sessionId = ref(null);
  const question = ref(null);
  const feedback = ref('');
  const health = ref(1);
  const error = ref('');
  const submitting = ref(false);

  // Nästa fråga kommer med i svaret från POST .../answer, så vi slipper ett extra anrop
  let nextQuestion = null;

  const isAlive = computed(() => health.value > 0);

  function showQuestion(data) {
    // GET .../question svarar { finished: true } när inga frågor återstår
    if (!data || data.finished) {
      question.value = null;
      phase.value = 'finished';
      return;
    }
    question.value = data;
    phase.value = 'question';
  }

  // Startar en ny omgång, eller återupptar den pågående om en redan finns
  async function start() {
    error.value = '';
    feedback.value = '';
    phase.value = 'loading';

    try {
      const session = await startSession();
      sessionId.value = session.session_id;
      health.value = Number(session.current_health);
      showQuestion(await getNextQuestion(session.session_id));
    } catch (err) {
      error.value = err.message;
      phase.value = 'idle';
    }
  }

  async function answer(answerId) {
    if (phase.value !== 'question' || submitting.value) {
      return;
    }

    error.value = '';
    submitting.value = true;

    try {
      const data = await answerQuestion(sessionId.value, answerId);
      feedback.value = data.feedback;
      health.value = Number(data.session.current_health);
      nextQuestion = data.session.status === 'COMPLETED' ? null : data.next_question;
      phase.value = 'feedback';
    } catch (err) {
      error.value = err.message;
    } finally {
      submitting.value = false;
    }
  }

  function next() {
    if (phase.value !== 'feedback') {
      return;
    }

    feedback.value = '';
    showQuestion(nextQuestion);
    nextQuestion = null;
  }

  return {
    phase,
    question,
    feedback,
    health,
    error,
    submitting,
    isAlive,
    start,
    answer,
    next,
  };
}
