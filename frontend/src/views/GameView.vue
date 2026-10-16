<script setup>
import { onMounted, ref } from 'vue';
import QuizLayout from '@/components/QuizLayout.vue';
import EndCard from '../components/EndCard.vue';
import LockAnswerButton from '../components/LockAnswerButton.vue';
import ProgressDots from '../components/ProgressDots.vue';
import { useGame } from '../composables/useGame';
import SessionMenu from '../components/SessionMenu.vue';
import QuitButton from '../components/QuitButton.vue';
import ScenarioBox from '../components/ScenarioBox.vue';
import QuestionBox from '../components/QuestionBox.vue';
import AnswerBox from '../components/AnswerBox.vue';
import HealthMeter from '../components/HealthMeter.vue';
import HandbookOpen from '../components/HandbookOpen.vue';
import { handbookPages } from '../data/handbook';

// Styr om den uppslagna handboken visas. Sätts till true när spelaren klickar på handboken på startsidan
const isHandbookOpen = ref(false);

// Fråga först om spelaren har en pågående omgång, eftersom forceNew pausar den
function handleStartNew() {
  if (hasActiveSession.value && !window.confirm('Du har en pågående omgång. Vill du börja om?')) {
    return;
  }
  start(true);
}

const {
  phase,
  question,
  feedback,
  health,
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
  quit,
  selectedAnswerId,
  select,
  totalQuestions,
  answeredCount,
} = useGame();
onMounted(checkActiveSession);
</script>

<template>
  <main>
    <div class="content-wrapper">
      <p v-if="error">{{ error }}</p>
      <QuizLayout v-if="phase === 'feedback' || phase === 'question'">
        <template #progress>
          <ProgressDots :total="totalQuestions" :answered="answeredCount" />
        </template>
        <template #story>
          <ScenarioBox :text="phase === 'feedback' ? feedback : question.scenario" />
        </template>
        <template #question>
          <QuestionBox :text="question.text" />
        </template>
        <template #answers>
          <AnswerBox
            v-for="a in question.answers"
            :key="a.answer_id"
            :text="a.text"
            :selected="a.answer_id === selectedAnswerId"
            :disabled="submitting || phase === 'feedback'"
            @select="select(a.answer_id)"
          />
        </template>
        <template #submit>
          <LockAnswerButton
            :has-selection="selectedAnswerId !== null"
            :submitting="submitting"
            :locked="phase === 'feedback'"
            :is-last-question="isLastQuestion"
            @lock="answer"
            @next="next"
          />
        </template>
        <template #health>
          <HealthMeter :health="health" />
        </template>
      </QuizLayout>

      <SessionMenu
        v-if="phase === 'idle'"
        :has-active-session="hasActiveSession"
        @start-new="handleStartNew"
        @resume="resume"
      />

      <!-- TODO: tillfällig knapp tills den stängda handboken på startsidan finns -->
      <button v-if="phase === 'idle'" type="button" @click="isHandbookOpen = true">
        Öppna handbok
      </button>

      <HandbookOpen v-if="isHandbookOpen" :pages="handbookPages" @close="isHandbookOpen = false" />

      <p v-if="phase === 'loading'">Laddar...</p>

      <QuitButton
        v-if="phase === 'question' || phase === 'feedback'"
        :disabled="submitting"
        @quit="quit"
      />

      <EndCard
        v-if="phase === 'finished'"
        :health="health"
        :is-alive="isAlive"
        @play-again="start"
      />
    </div>
  </main>
</template>
