<script setup>
import { onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useGame } from '../composables/useGame';
import { useReview } from '../composables/useReview';
import QuestionBox from '../components/QuestionBox.vue';

const route = useRoute();
const router = useRouter();
const { start } = useGame();
const { review, isLoading, error, correctCount, load } = useReview();

onMounted(() => load(route.params.sessionId));

// health_change är hur mycket svaret drar, så ett negativt värde ger hälsa tillbaka
function healthText(change) {
  if (change === 0) {
    return '±0 %';
  }
  return change > 0 ? `−${change} %` : `+${-change} %`;
}

function isChosen(question, answer) {
  return answer.answer_id === question.chosen_answer_id;
}

// Märken och feedback visas bara för spelarens svar och det bästa, så att listan inte blir för lång
function isHighlighted(question, answer) {
  return isChosen(question, answer) || answer.is_best;
}

// start() sätter phase till 'loading' direkt, så GameView försöker inte återuppta en gammal omgång
function playAgain() {
  start();
  router.push({ name: 'game' });
}
</script>

<template>
  <div class="review-page">
    <!-- div och inte header: main.css stilar alla header, och i liggande läge flyttas de ut -->
    <div class="review-header">
      <RouterLink to="/" aria-label="Till startsidan">
        <img src="../assets/images/logo.webp" alt="BrainDead" class="review-logo" />
      </RouterLink>
    </div>

    <div class="content-wrapper review">
      <p v-if="isLoading" class="status">Hämtar svaren…</p>

      <section v-else-if="error" class="content-card status-card" role="alert">
        <p>{{ error }}</p>
        <RouterLink to="/" class="btn btn-gray">Till startsidan</RouterLink>
      </section>

      <template v-else>
        <section class="content-card summary">
          <h2>Svaren</h2>
          <p class="score">{{ correctCount }} av {{ review.questions.length }} rätt</p>
          <p>Hjärnkapacitet kvar: {{ review.current_health }} %</p>
          <!-- Hälsan tog slut innan alla frågor var besvarade -->
          <p v-if="review.questions.length < review.total_questions" class="note">
            Du hann svara på {{ review.questions.length }} av {{ review.total_questions }} frågor.
          </p>
        </section>

        <ol class="questions">
          <li
            v-for="(question, index) in review.questions"
            :key="question.question_id"
            class="content-card question"
          >
            <div class="question-head">
              <h3>Fråga {{ index + 1 }}</h3>
              <!-- Symbol och text, så att rätt/fel inte bara syns på färgen -->
              <span class="verdict" :class="question.is_correct ? 'right' : 'wrong'">
                {{ question.is_correct ? '✓ Rätt' : '✗ Fel' }}
              </span>
            </div>

            <p class="scenario">{{ question.scenario }}</p>
            <QuestionBox :text="question.text" />

            <ul class="answers">
              <li
                v-for="answer in question.answers"
                :key="answer.answer_id"
                class="answer"
                :class="{ chosen: isChosen(question, answer), best: answer.is_best }"
              >
                <div class="answer-row">
                  <span class="answer-text">{{ answer.text }}</span>
                  <span class="health">{{ healthText(answer.health_change) }}</span>
                </div>
                <div v-if="isHighlighted(question, answer)" class="tags">
                  <span v-if="isChosen(question, answer)" class="tag tag-chosen">Ditt svar</span>
                  <span v-if="answer.is_best" class="tag tag-best">Bästa svaret</span>
                </div>
                <p v-if="isHighlighted(question, answer)" class="feedback">
                  {{ answer.feedback }}
                </p>
              </li>
            </ul>
          </li>
        </ol>

        <div class="actions">
          <button type="button" class="btn btn-purple" @click="playAgain">Spela igen</button>
          <RouterLink to="/" class="btn btn-gray">Till startsidan</RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* fullPage-sidor ligger direkt i #app, som har overflow: hidden. Sidan scrollar därför själv */
.review-page {
  width: 100%;
  height: 100dvh;
  overflow-y: auto;
  padding: 0 16px 24px;
  text-align: center;
}

.review-header {
  width: clamp(240px, 70vw, 420px);
  margin: 1% auto 0.5rem;
}

.review-logo {
  width: 100%;
}

.review {
  gap: 16px;
  width: 100%;
}

.status {
  padding: 24px;
}

.status-card,
.summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 24px;
}

.summary h2 {
  font-size: 2rem;
  text-transform: uppercase;
}

.score {
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  font-size: 2.4rem;
  line-height: 1;
}

.note {
  opacity: 0.8;
  font-size: 0.9rem;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 0;
  list-style: none;
}

.question {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.question-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.question-head h3 {
  font-family: var(--font-handwritten);
  -webkit-text-stroke: var(--font-handwritten-stroke);
  font-size: 2.1rem;
  font-weight: normal;
  line-height: 1;
}

.verdict {
  padding: 6px 12px 4px;
  border-radius: 999px;
  font-size: 0.85rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.verdict.right {
  background-color: #2f5d34;
  color: #e3f2d9;
}

.verdict.wrong {
  background-color: #7a1f1f;
  color: #f8dede;
}

.scenario {
  font-size: 0.85rem;
  line-height: 1.5;
  opacity: 0.85;
}

/* QuestionBox är ett eget kort, här ligger det i ett kort och får grå bakgrund */
.question :deep(.question-box) {
  background-color: var(--color-bg-gray);
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  list-style: none;
}

/* Samma ram och grå färg som svarsknapparna i spelet, men det går inte att klicka */
.answer {
  border: 4px solid var(--color-border-outer);
  border-radius: 12px;
  padding: 12px;
  background-color: var(--color-bg-gray);
  opacity: 0.75;
}

.answer.chosen,
.answer.best {
  opacity: 1;
}

/* Spelarens svar är lila, som ett markerat svar i spelet */
.answer.chosen {
  background-color: var(--color-bg-purple);
}

.answer.best {
  border-color: #7fb069;
}

.answer-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.answer-text {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.health {
  white-space: nowrap;
  font-size: 0.85rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  padding: 4px 8px 2px;
  border-radius: 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.tag-chosen {
  background-color: var(--color-text);
  color: var(--color-bg-purple);
}

.tag-best {
  background-color: #2f5d34;
  color: #e3f2d9;
}

.feedback {
  margin-top: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

/* RouterLink blir en <a>, och länkar är understrukna annars */
a.btn {
  text-decoration: none;
}

@media (min-width: 768px) {
  .review-page {
    padding: 0 24px 32px;
  }

  .question {
    padding: 20px;
  }
}
</style>
