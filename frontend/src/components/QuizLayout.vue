<template>
  <section class="quiz-layout">
    <aside class="progress"><slot name="progress" /></aside>
    <div class="story"><slot name="story" /></div>
    <div class="question"><slot name="question" /></div>
    <div class="answers"><slot name="answers" /></div>
    <div class="submit"><slot name="submit" /></div>
    <aside class="health"><slot name="health" /></aside>
  </section>
</template>

<style scoped>
.quiz-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr auto auto auto;
  grid-template-areas:
    'progress story    health'
    'progress question health'
    'progress answers  health'
    'progress submit   health';
  gap: var(--space-3, 12px);
  /* Fast höjd så att panelen inte ändrar storlek mellan frågor; story-raden tar resten av höjden */
  height: var(--quiz-panel-height, 520px);
  padding: var(--space-4, 16px);
  max-width: 640px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 16px;
}
.progress {
  grid-area: progress;
}
.story {
  grid-area: story;
  /* Långa scenarier scrollar i stället för att trycka ut svaren och knappen ur panelen */
  min-height: 0;
  overflow-y: auto;
}
.question {
  grid-area: question;
}
.answers {
  grid-area: answers;
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2×2-rutnätet för svaren */
  gap: var(--space-3, 12px);
}
.submit {
  grid-area: submit;
}
.health {
  grid-area: health;
}
</style>
