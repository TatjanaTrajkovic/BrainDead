<script setup>
defineProps({
  // Frågan från backend: { question_id, scenario, text, answers: [{ answer_id, text }] }
  question: {
    type: Object,
    required: true,
  },
  // Sätts till true medan svaret skickas, så att spelaren inte kan klicka två gånger
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['answer-selected']);

function selectAnswer(answerId) {
  emit('answer-selected', answerId);
}
</script>

<template>
  <section class="question-card">
    <p class="scenario">{{ question.scenario }}</p>

    <h2>{{ question.text }}</h2>

    <ul class="answers">
      <li v-for="answer in question.answers" :key="answer.answer_id">
        <button type="button" :disabled="disabled" @click="selectAnswer(answer.answer_id)">
          {{ answer.text }}
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.question-card {
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  text-align: center;
}

.scenario {
  margin-bottom: 20px;
}

.answers {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  padding: 0;
  list-style: none;
}

button {
  width: 100%;
  padding: 10px 20px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}
</style>
