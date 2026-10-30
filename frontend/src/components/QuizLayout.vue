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
  --panel-h: min(calc(100dvh - var(--header-h) - 2rem));

  display: grid;
  grid-template-columns: 1fr;
  /* story-raden tar just nu resten av höjden (ändras till något som ser bra ut) och scrollar inne i ScenarioBox */
  grid-template-rows: auto auto auto auto auto auto;
  grid-template-areas:
    'progress'
    'health'
    'story'
    'question'
    'answers'
    'submit';

  gap: clamp(4px, 1.5dvh, 10px);
  height: var(--panel-h);
  width: 100%;
  padding: clamp(6px, 1dvh, 14px);
  /* på riktigt låga skärmar scrollar istället
  för att klippa innehållet */
  overflow: auto;
  /* se till att innenhållet kan utgå från quiz-layouts dimensioner */
  container-type: size;
}
.answers {
  grid-area: answers;
  display: grid;
  grid-template-columns: 1fr; /* 1x1 */
  gap: 8px;
}
.progress {
  grid-area: progress;
}
.story {
  grid-area: story;
  /* Raden får krympa, så att långa scenarier inte trycker ut svaren och knappen ur panelen.
     Själva scrollen sker inne i ScenarioBox */
  min-height: 100px;
}
.question {
  grid-area: question;
}
.submit {
  display: flex;
  grid-area: submit;
  gap: 10px;
}
.health {
  grid-area: health;
}

/* Stor skärm med mus: vågrät layout som växer,
   samma som HomeView och main.css */
@media (min-width: 768px) and (min-height: 501px) and (orientation: landscape) and (pointer: fine) {
  .quiz-layout {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr auto auto auto;
    grid-template-areas:
      'progress story    health'
      'progress question health'
      'progress answers  health'
      'progress submit   health';
    gap: clamp(8px, 1.5dvh, 16px);
    --panel-h: min(76dvh, 54rem);
    height: var(--panel-h);
    width: min(100%, var(--content-w));
    padding: clamp(8px, 1.5dvh, 16px);
  }
  .answers {
    grid-template-columns: 1fr 1fr; /* 2×2 */
  }
  .progress {
    flex-direction: column;
    justify-content: space-between;
    justify-items: center;
  }
}

/* Liggande kompakt skärm (mobil och surfplatta med touch),
   samma vågräta layout men mindre */
@media (orientation: landscape) and (max-width: 767px),
  (orientation: landscape) and (pointer: coarse),
  (orientation: landscape) and (max-height: 500px) {
  .quiz-layout {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr auto auto auto;
    grid-template-areas:
      'progress story    health'
      'progress question health'
      'progress answers  health'
      'progress submit   health';
    gap: 6px;
    --panel-h: min(calc(100dvh - var(--header-h) - 2rem), 34rem);
    height: var(--panel-h);
    width: min(100%, var(--content-w));
    padding: 6px;
  }
  .answers {
    grid-template-columns: 1fr 1fr; /* 2x2 */
  }
}
</style>
