<script setup>
import { onMounted } from 'vue';
import EndCard from './components/EndCard.vue';
import FeedbackCard from './components/FeedbackCard.vue';
import LockAnswerButton from './components/LockAnswerButton.vue';
import ProgressDots from './components/ProgressDots.vue';
import QuestionCard from './components/QuestionCard.vue';
import { useGame } from './composables/useGame';

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
  selectedAnswerId,
  select,
  totalQuestions,
  answeredCount,
} = useGame();

onMounted(resume);
</script>

<template>
  <main>
    <p v-if="error">{{ error }}</p>

    <!-- TODO: ersätt med en riktig startskärm -->
    <button v-if="phase === 'idle'" type="button" @click="start">Starta</button>

    <p v-if="phase === 'loading'">Laddar...</p>

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

    <EndCard v-if="phase === 'finished'" :health="health" :is-alive="isAlive" @play-again="start" />
  </main>
</template>
