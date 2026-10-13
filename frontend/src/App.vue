<script setup>
import { onMounted } from 'vue';
import EndCard from './components/EndCard.vue';
import FeedbackCard from './components/FeedbackCard.vue';
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

    <!-- TODO: ersätt med QuestionCard när feat/14-question-card är mergad -->
    <section v-if="phase === 'question'">
      <p>{{ question.scenario }}</p>
      <h2>{{ question.text }}</h2>
      <button
        v-for="option in question.answers"
        :key="option.answer_id"
        type="button"
        :disabled="submitting"
        @click="answer(option.answer_id)"
      >
        {{ option.text }}
      </button>
    </section>

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
