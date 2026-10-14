import { computed, ref } from 'vue';
import { answerQuestion, getNextQuestion, getSession, startSession } from '../api/gameApi';

const STORAGE_KEY = 'braindead.sessionId';

// localStorage kan kasta fel (t.ex. privat läge), så spelet ska fungera även utan det
function loadSessionId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveSessionId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ingen sparad session, men spelet fungerar ändå
  }
}

function clearSessionId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Inget att rensa
  }
}

// Samlar spelloopen: starta omgång → fråga → svar → feedback → nästa fråga → slut.
// phase styr vad som visas: 'idle' | 'loading' | 'question' | 'feedback' | 'finished'
export function useGame() {
  const phase = ref('idle');
  const sessionId = ref(null);
  const question = ref(null);
  const feedback = ref('');
  const health = ref(1);
  // Hälsan innan senaste svaret, så att FeedbackCard kan visa förändringen
  const previousHealth = ref(1);
  const error = ref('');
  const submitting = ref(false);
  // true när senaste svaret avslutade omgången, så att FeedbackCard kan visa "Se resultat"
  const isLastQuestion = ref(false);
  const selectedAnswer = ref(null);

  // Nästa fråga kommer med i svaret från POST .../answer, så vi slipper ett extra anrop
  let nextQuestion = null;

  const isAlive = computed(() => health.value > 0);

  function showQuestion(data) {
    function showQuestion(data) {
      selectedAnswer.value = null;
    }
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
      saveSessionId(session.session_id);
      health.value = Number(session.current_health);
      showQuestion(await getNextQuestion(session.session_id));
    } catch (err) {
      error.value = err.message;
      phase.value = 'idle';
    }
  }

  // Återupptar en sparad omgång efter omladdning. Utan sparad omgång stannar spelet i 'idle'.
  async function resume() {
    const savedId = loadSessionId();
    if (!savedId) {
      return;
    }

    phase.value = 'loading';

    try {
      const session = await getSession(savedId);
      sessionId.value = session.session_id;
      health.value = Number(session.current_health);

      if (session.status === 'COMPLETED') {
        // Visa resultatet en gång till, men börja om från start vid nästa omladdning
        clearSessionId();
        phase.value = 'finished';
        return;
      }

      showQuestion(await getNextQuestion(session.session_id));
    } catch {
      // Omgången finns inte längre eller servern svarar inte, så spelaren får starta som vanligt
      clearSessionId();
      sessionId.value = null;
      phase.value = 'idle';
    }
  }

  // Markerar ett alternativ utan att skicka det. Går att byta fram till att svaret låses
  function select(answerId) {
    if (phase.value !== 'question' || submitting.value) {
      return;
    }
    selectedAnswerId.value = answerId;
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
      previousHealth.value = health.value;
      health.value = Number(data.session.current_health);
      nextQuestion = data.session.status === 'COMPLETED' ? null : data.next_question;
      isLastQuestion.value = !nextQuestion;
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
    previousHealth,
    error,
    submitting,
    isLastQuestion,
    isAlive,
    start,
    resume,
    answer,
    next,
  };
}
