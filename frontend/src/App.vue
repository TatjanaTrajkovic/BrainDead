<script setup>
import { ref } from 'vue';
import FeedbackCard from './components/FeedbackCard.vue';
import { answerQuestion } from './api/gameApi';

const feedback = ref('');
const error = ref('');
const selectedAnswerId = ref(null);
const loading = ref(false);
const sessionId = ref(null);
const currentHealth = ref(1);

// ANNIKAS POST-endpoint ska hit
// Skickar spelarens val till backend och hämtar feedback.
async function loadFeedback(answerId) {
  if (!sessionId.value) {
    error.value = 'Ingen aktiv spelomgång finns';
    return;
  }

  selectedAnswerId.value = answerId;
  feedback.value = '';
  error.value = '';
  loading.value = true;

  try {
    const data = await answerQuestion(sessionId.value, answerId);

    feedback.value = data.feedback;
    currentHealth.value = data.session.current_health;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// TODO: Koppla denna funktion till frågekomponentens svarsalternativ.
// Anropas med answer_id när spelaren väljer ett svar.
function handleAnswerSelected(answerId) {
  loadFeedback(answerId);
}

defineExpose({
  handleAnswerSelected,
});

// TODO: Koppla till frågeflödet när nästa fråga kan hämtas.
function handleNextQuestion() {
  feedback.value = '';
  selectedAnswerId.value = null;
  error.value = '';

  // Här ska nästa fråga visas.
}
</script>

<template>
  <main>
    <!-- TODO: Visa frågekomponenten här och koppla spelarens val
         till handleAnswerSelected(answerId). -->

    <p v-if="loading">Hämtar feedback...</p>

    <p v-if="error">{{ error }}</p>

    <FeedbackCard v-if="feedback" :feedback="feedback" @next-question="handleNextQuestion" />
  </main>
</template>
