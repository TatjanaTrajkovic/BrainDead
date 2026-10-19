import { computed, ref } from 'vue';
import {
  answerQuestion,
  getActiveSession,
  getNextQuestion,
  getSession,
  startSession,
  ensurePlayer,
} from '../api/gameApi';

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

// Delat state: ligger utanför useGame() så att alla vyer som anropar den ser samma spel,
// och så att spelet finns kvar när man byter vy.
// phase styr vad som visas: 'idle' | 'loading' | 'question' | 'feedback' | 'finished'
const phase = ref('idle');
const sessionId = ref(null);
const question = ref(null);
const feedback = ref('');
const health = ref(1);
const previousHealth = ref(1);
const error = ref('');
const submitting = ref(false);
// Sant när backend har en pågående omgång som spelaren kan återuppta
const hasActiveSession = ref(false);
const isLastQuestion = ref(false);
// Svaret spelaren markerat men inte låst än. null = inget valt
const selectedAnswerId = ref(null);

// Nästa fråga kommer med i svaret från POST .../answer, så vi slipper ett extra anrop
let nextQuestion = null;

export function useGame() {
  const isAlive = computed(() => health.value > 0);

  // Till ProgressDots. Följer med varje fråga från backend, så de stämmer även efter omladdning
  const totalQuestions = computed(() => question.value?.total_questions ?? 0);
  const answeredCount = computed(() => question.value?.answered_count ?? 0);

  function showQuestion(data) {
    selectedAnswerId.value = null;
    // GET .../question svarar { finished: true } när inga frågor återstår
    if (!data || data.finished) {
      question.value = null;
      phase.value = 'finished';
      return;
    }
    question.value = data;
    phase.value = 'question';
  }

  // Startar en ny omgång. Med forceNew = true pausas en pågående omgång först.
  async function start(forceNew = false) {
    error.value = '';
    feedback.value = '';
    phase.value = 'loading';

    try {
      // Utloggade spelare blir gäster först här, så den som bara tittar på startsidan inte skapar någon användare
      await ensurePlayer();
      const session = await startSession(forceNew);
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

  // Frågar backend om det finns en pågående omgång, så att menyn vet om "Återuppta" ska gå att klicka på
  async function checkActiveSession() {
    error.value = '';
    try {
      const session = await getActiveSession();
      hasActiveSession.value = true;
      saveSessionId(session.session_id); // befintliga resume() hittar rätt omgång när spelaren klickar "Återuppta"
    } catch (err) {
      hasActiveSession.value = false;
      // 404 = ingen omgång pågår, 401 = ingen spelare än (ny besökare). Allt annat är ett riktigt fel
      if (err.status !== 404 && err.status !== 401) {
        // Är servern helt nere kastar fetch ett fel utan status
        error.value = err.status ? err.message : 'Kunde inte nå servern';
      }
    }
  }

  // Avbryter omgången. phase blir 'idle', och då skickar GameView spelaren till startsidan.
  // Omgången ligger kvar som pågående i backend, så spelaren kan fortsätta med "Återuppta omgång".
  async function quit() {
    if (submitting.value) {
      return;
    }

    question.value = null;
    feedback.value = '';
    selectedAnswerId.value = null;
    nextQuestion = null;
    phase.value = 'idle';

    // Kollar med backend om omgången fortfarande pågår (den är avslutad om sista frågan var besvarad)
    await checkActiveSession();
  }

  // Markerar ett alternativ utan att skicka det. Går att byta fram till att svaret låses
  function select(answerId) {
    if (phase.value !== 'question' || submitting.value) {
      return;
    }
    selectedAnswerId.value = answerId;
  }

  async function answer() {
    if (phase.value !== 'question' || submitting.value || selectedAnswerId.value === null) {
      return;
    }

    error.value = '';
    submitting.value = true;

    try {
      const data = await answerQuestion(sessionId.value, selectedAnswerId.value);
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
    hasActiveSession,
    checkActiveSession,
    selectedAnswerId,
    select,
    quit,
    totalQuestions,
    answeredCount,
  };
}
