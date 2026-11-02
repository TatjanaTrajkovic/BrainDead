<script setup>
import { computed, ref } from 'vue';
import ScenarioBox from '@/components/ScenarioBox.vue';
import QuestionBox from '@/components/QuestionBox.vue';
import AnswerBox from '@/components/AnswerBox.vue';

// Får formulärets objekt direkt. Det är reaktivt, så förhandsvisningen uppdateras när admin
// skriver. Komponenten läser bara och ändrar aldrig formuläret
const props = defineProps({
  question: { type: Object, required: true },
});

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

// Klick på ett svar visar dess feedback, som när spelaren har låst sitt svar. Klick på samma
// svar igen visar scenariot. Index i stället för answer_id, eftersom nya svar saknar id
const selectedIndex = ref(null);
const selectedAnswer = computed(() =>
  selectedIndex.value === null ? null : props.question.answers[selectedIndex.value],
);

function toggleAnswer(index) {
  selectedIndex.value = selectedIndex.value === index ? null : index;
}

// Hälsoavdraget är '' tills admin fyller i det, se form i QuestionForm
const healthText = computed(() => {
  const change = selectedAnswer.value?.health_change;
  if (change === '' || change === null || change === undefined) {
    return 'Hälsoavdraget är inte ifyllt';
  }
  return change === 0 ? 'Ingen hälsa dras av' : `${change} hälsa dras av`;
});
</script>

<template>
  <div>
    <!-- Spelets färger och typsnitt kommer från base.css, som gäller hela appen -->
    <div class="game-frame">
      <div class="story">
        <ScenarioBox
          v-if="selectedAnswer"
          :text="selectedAnswer.feedback || 'Feedbacken visas här'"
          is-feedback
        />
        <ScenarioBox v-else :text="question.scenario || 'Scenariot visas här'" />
      </div>

      <QuestionBox :text="question.text || 'Frågan visas här'" />

      <div class="answers">
        <!-- Index som nyckel: listan har alltid fyra svar, och nya svar saknar answer_id -->
        <AnswerBox
          v-for="(answer, i) in question.answers"
          :key="i"
          :text="answer.text || `Svar ${ANSWER_LETTERS[i]}`"
          :selected="i === selectedIndex"
          @select="toggleAnswer(i)"
        />
      </div>
    </div>

    <!-- aria-live: skärmläsare läser upp texten när admin väljer ett annat svar -->
    <p class="preview-note" aria-live="polite">
      <template v-if="selectedAnswer">
        Svar {{ ANSWER_LETTERS[selectedIndex] }}: {{ healthText }}. Klicka på svaret igen för att se
        scenariot.
      </template>
      <template v-else>Klicka på ett svar för att se feedbacken.</template>
    </p>
  </div>
</template>

<style scoped>
/* Spelets bakgrund, så att korten ser ut som i spelet */
.game-frame {
  display: grid;
  /* minmax(0, 1fr): kolumnen får krympa i stället för att växa med innehållet */
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  padding: 12px;
  background: var(--color-bg) url('@/assets/images/background.webp') center / cover;
  border-radius: var(--admin-radius);
  /* Långa ord utan mellanslag bryts i stället för att trycka ut rutan */
  overflow-wrap: anywhere;
  /* Spelet ärver centrerad text från main i main.css, adminsidan ärver vänster */
  text-align: center;
}

/* Som i spelet: scenariot har fast höjd och scrollar inuti ScenarioBox */
.story {
  height: 10rem;
}

/* 2×2, som spelet på desktop. minmax(0, 1fr) av samma skäl som ovan */
.answers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.preview-note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}
</style>
