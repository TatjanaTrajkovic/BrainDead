<script setup>
import { onMounted } from 'vue';
import EndCard from './components/EndCard.vue';
import LockAnswerButton from './components/LockAnswerButton.vue';
import ProgressDots from './components/ProgressDots.vue';
import { useGame } from './composables/useGame';
import SessionMenu from './components/SessionMenu.vue';
import QuitButton from './components/QuitButton.vue';
import ScenarioBox from './components/ScenarioBox.vue';
import QuestionBox from './components/QuestionBox.vue';
import AnswerBox from './components/AnswerBox.vue';
import HealthMeter from './components/HealthMeter.vue';

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

// onMounted(resume); spelaren hoppar in direkt i spelet
onMounted(checkActiveSession); //här får spelaren välja i menyn i stället

// Fråga först om spelaren har en pågående omgång, eftersom forceNew pausar den
function handleStartNew() {
  if (hasActiveSession.value && !window.confirm('Du har en pågående omgång. Vill du börja om?')) {
    return;
  }
  start(true);
}
</script>

<template>
  <main>
    <header>
      <img src="./assets/images/logo.webp" alt="BrainDead" class="logo" />
    </header>

    <div class="content-wrapper">
      <QuizLayout v-if="phase === 'feedback' || phase === 'question'">
        <template #progress>
          <ProgressDots
            v-if="phase === 'question'"
            :total="totalQuestions"
            :answered="answeredCount"
          />
        </template>
        <template #story>
          <ScenarioBox :text="phase === 'feedback' ? feedback : question.scenario" />
        </template>
        <template #question>
          <QuestionBox :text="question.text" />
        </template>
        <template #answers>
          <AnswerBox
            v-for="answer in question.answers"
            :key="answer.answer_id"
            :text="answer.text"
            :selected="answer.answer_id === selectedAnswerId"
            :disabled="submitting || phase === 'feedback'"
            @select="select(answer.answer_id)"
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
      <p v-if="error">{{ error }}</p>

      <SessionMenu
        v-if="phase === 'idle'"
        :has-active-session="hasActiveSession"
        @start-new="handleStartNew"
        @resume="resume"
      />

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
