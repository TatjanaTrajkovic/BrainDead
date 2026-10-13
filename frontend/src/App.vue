<script setup>
import FeedbackCard from './components/FeedbackCard.vue';
import { useGame } from './composables/useGame';

const { phase, question, feedback, health, error, submitting, isAlive, start, answer, next } =
  useGame();
</script>

<template>
  <main>
    <p v-if="error">{{ error }}</p>

    <!-- TODO: ersätt med en riktig startskärm -->
    <button v-if="phase === 'idle'" type="button" @click="start">Starta</button>

    <p v-if="phase === 'loading'">Laddar...</p>

    <!-- TODO: ersätt med en riktig hälsomätare -->
    <p v-if="phase === 'question' || phase === 'feedback'">
      Hälsa: {{ Math.round(health * 100) }}%
    </p>

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

    <FeedbackCard v-if="phase === 'feedback'" :feedback="feedback" @next-question="next" />

    <!-- TODO: ersätt med en riktig slutskärm -->
    <section v-if="phase === 'finished'">
      <h2>{{ isAlive ? 'Du klarade dig till IKEA!' : 'Hjärndöd.' }}</h2>
      <p>Hälsa kvar: {{ Math.round(health * 100) }}%</p>
    </section>
  </main>
</template>
