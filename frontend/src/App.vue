<script setup>
import { ref } from 'vue';
import FeedbackCard from './components/FeedbackCard.vue';

const feedback = ref('');
const error = ref('');
const selectedAnswerId = ref(null);
const loading = ref(false);

// Hämtar feedback för det svar som spelaren har valt.
async function loadFeedback(answerId) {
  selectedAnswerId.value = answerId;
  feedback.value = '';
  error.value = '';
  loading.value = true;

  try {
    const response = await fetch(`http://localhost:3000/api/answers/${answerId}/feedback`);

    if (!response.ok) {
      throw new Error('Kunde inte hämta feedback');
    }

    const data = await response.json();
    feedback.value = data.feedback;
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

<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue';
import TheWelcome from './components/TheWelcome.vue';
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style> -->
