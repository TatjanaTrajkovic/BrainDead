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
.progress {
  grid-area: progress;
}
.story {
  grid-area: story;
  /* Raden får krympa, så att långa scenarier inte trycker ut svaren och knappen ur panelen.
     Själva scrollen sker inne i ScenarioBox */
  min-height: 0;
}
.question {
  grid-area: question;
}
.submit {
  grid-area: submit;
}
.health {
  grid-area: health;
}

/* Stor skärm med mus: vågrät layout som växer,
   samma som HomeView och main.css */
@media (min-width: 768px) and (min-height: 501px) and (orientation: landscape) and (pointer: fine) {
  .quiz-layout {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr auto auto auto;
    grid-template-areas:
      'progress story    health'
      'progress question health'
      'progress answers  health'
      'progress submit   health';
    gap: clamp(8px, 1.5dvh, 16px);
    --panel-h: min(calc(100dvh - var(--header-h) - 2.5rem), 54rem);
    height: var(--panel-h);
    width: min(100%, var(--content-w));
    padding: clamp(8px, 1.5dvh, 16px);
  }
  .answers {
    grid-template-columns: 1fr 1fr; /* 2×2 */
  }
}

/* Liggande kompakt skärm (mobil och surfplatta med touch),
   samma vågräta layout men mindre */
@media (orientation: landscape) and (max-width: 767px),
  (orientation: landscape) and (pointer: coarse),
  (orientation: landscape) and (max-height: 500px) {
}
</style>
