<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import QuizLayout from '@/components/game/QuizLayout.vue';
import EndCard from '../components/game/EndCard.vue';
import LockAnswerButton from '../components/game/LockAnswerButton.vue';
import ProgressDots from '../components/game/ProgressDots.vue';
import { useGame } from '../composables/useGame';
import QuitButton from '../components/game/QuitButton.vue';
import ScenarioBox from '../components/game/ScenarioBox.vue';
import QuestionBox from '../components/game/QuestionBox.vue';
import AnswerBox from '../components/game/AnswerBox.vue';
import HealthMeter from '../components/game/HealthMeter.vue';

const router = useRouter();

const {
  phase,
  sessionId,
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
  quit,
  selectedAnswerId,
  select,
  totalQuestions,
  answeredCount,
} = useGame();

onMounted(async () => {
  // Spelaren laddade om sidan på /game: försök återuppta, annars tillbaka hem
  if (phase.value === 'idle') {
    await resume();
    if (phase.value === 'idle') {
      router.push({ name: 'home' });
    }
  }
});

// quit() och misslyckade start() sätter phase till 'idle', och då ska spelaren tillbaka till startsidan
watch(phase, (newPhase) => {
  if (newPhase === 'idle') {
    router.push({ name: 'home' });
  }
});

// Omgången är redan avslutad i backend, så det räcker att byta vy
function goHome() {
  router.push({ name: 'home' });
}

// Id:t ligger i adressen, så att genomgången finns kvar vid omladdning (#205)
function showReview() {
  router.push({ name: 'review', params: { sessionId: sessionId.value } });
}
</script>

<template>
  <div class="content-wrapper">
    <p v-if="error">{{ error }}</p>
    <QuizLayout v-if="phase === 'feedback' || phase === 'question'">
      <template #health>
        <HealthMeter :health="health" />
      </template>
      <template #progress>
        <ProgressDots :total="totalQuestions" :answered="answeredCount" />
      </template>
      <template #story>
        <ScenarioBox
          :text="phase === 'feedback' ? feedback : question.scenario"
          :is-feedback="phase === 'feedback'"
        />
      </template>
      <template #question>
        <QuestionBox :text="question.text" />
      </template>
      <template #answers>
        <AnswerBox
          v-for="a in question.answers"
          :key="a.answer_id"
          :text="a.text"
          :selected="a.answer_id === selectedAnswerId"
          :disabled="submitting || phase === 'feedback'"
          @select="select(a.answer_id)"
        />
      </template>
      <template #submit>
        <QuitButton
          v-if="phase === 'question' || phase === 'feedback'"
          :disabled="submitting"
          @quit="quit"
        />
        <LockAnswerButton
          :has-selection="selectedAnswerId !== null"
          :submitting="submitting"
          :locked="phase === 'feedback'"
          :is-last-question="isLastQuestion"
          @lock="answer"
          @next="next"
        />
      </template>
    </QuizLayout>

    <p v-if="phase === 'loading'">Laddar...</p>

    <EndCard
      v-if="phase === 'finished'"
      :health="health"
      :is-alive="isAlive"
      @play-again="start"
      @go-home="goHome"
      @show-review="showReview"
    />
  </div>
</template>
