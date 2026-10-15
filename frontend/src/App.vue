<script setup>
import { onMounted } from 'vue';
import EndCard from './components/EndCard.vue';
import FeedbackCard from './components/FeedbackCard.vue';
import LockAnswerButton from './components/LockAnswerButton.vue';
import ProgressDots from './components/ProgressDots.vue';
import QuestionCard from './components/QuestionCard.vue';
import { useGame } from './composables/useGame';
import SessionMenu from './components/SessionMenu.vue';
import QuitButton from './components/QuitButton.vue';

const {
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

      <!-- TODO: ersätt med en riktig hälsomätare -->
      <p v-if="phase === 'question'">Hälsa: {{ Math.round(health * 100) }}%</p>

      <!-- TODO: flytta till #progress-sloten i QuizLayout (#64) -->
      <ProgressDots v-if="phase === 'question'" :total="totalQuestions" :answered="answeredCount" />

      <QuestionCard
        v-if="phase === 'question'"
        :question="question"
        :disabled="submitting"
        @answer-selected="select"
      />

      <LockAnswerButton
        v-if="phase === 'question'"
        :has-selection="selectedAnswerId !== null"
        :submitting="submitting"
        @lock="answer"
      />

      <FeedbackCard
        v-if="phase === 'feedback'"
        :feedback="feedback"
        :health-before="previousHealth"
        :health-after="health"
        :is-last-question="isLastQuestion"
        @next-question="next"
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
