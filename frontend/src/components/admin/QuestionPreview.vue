<script setup>
import ScenarioBox from '@/components/ScenarioBox.vue';
import QuestionBox from '@/components/QuestionBox.vue';
import AnswerBox from '@/components/AnswerBox.vue';

// Får formulärets objekt direkt. Det är reaktivt, så förhandsvisningen uppdateras när admin
// skriver. Komponenten läser bara och ändrar aldrig formuläret
defineProps({
  question: { type: Object, required: true },
});

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];
</script>

<template>
  <!-- Spelets färger och typsnitt kommer från base.css, som gäller hela appen -->
  <div class="game-frame">
    <div class="story">
      <ScenarioBox :text="question.scenario || 'Scenariot visas här'" />
    </div>

    <QuestionBox :text="question.text || 'Frågan visas här'" />

    <div class="answers">
      <!-- Index som nyckel: listan har alltid fyra svar, och nya svar saknar answer_id -->
      <AnswerBox
        v-for="(answer, i) in question.answers"
        :key="i"
        :text="answer.text || `Svar ${ANSWER_LETTERS[i]}`"
      />
    </div>
  </div>
</template>

<style scoped>
/* Spelets bakgrund, så att korten ser ut som i spelet */
.game-frame {
  grid-template-columns: minmax(0, 1fr);
  display: grid;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg) url('@/assets/images/background.webp') center / cover;
  border-radius: var(--admin-radius);
  overflow-wrap: anywhere;
  text-align: center;
}

/* Som i spelet: scenariot har fast höjd och scrollar inuti ScenarioBox */
.story {
  height: 10rem;
}

/* 2×2, som spelet på desktop */
.answers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
</style>
