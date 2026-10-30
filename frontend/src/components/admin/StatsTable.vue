<script setup>
import { computed, onMounted, ref } from 'vue';
import { getStats } from '@/api/adminApi';

const questions = ref([]);
const isLoading = ref(true);
const error = ref('');

const legend = [
  { level: 'none', label: '0' },
  { level: 'low', label: '1–15' },
  { level: 'mid', label: '16–25' },
  { level: 'high', label: '26+' },
];

const FEW_ANSWERS = 20;

const sortOptions = [
  { key: 'position', label: 'Ordning' },
  { key: 'averageDamage', label: 'Snittskada' },
  { key: 'deathRate', label: 'Andel som dog här' },
];

const sortKey = ref('position');

function totalDamage(question) {
  return question.answers.reduce(
    (sum, answer) => sum + answer.times_chosen * answer.health_change,
    0,
  );
}

function averageDamage(question) {
  if (question.times_answered === 0) {
    return null;
  }
  return totalDamage(question) / question.times_answered;
}

const playedDamages = computed(() =>
  questions.value.map(averageDamage).filter((damage) => damage !== null),
);

const maxAverageDamage = computed(() =>
  playedDamages.value.length > 0 ? Math.max(...playedDamages.value) : null,
);

const minAverageDamage = computed(() =>
  playedDamages.value.length > 0 ? Math.min(...playedDamages.value) : null,
);

const rows = computed(() =>
  questions.value.map((question) => {
    const played = question.times_answered > 0;
    const damage = averageDamage(question);
    const hasSpread = maxAverageDamage.value !== minAverageDamage.value;

    return {
      ...question,
      averageDamage: damage,
      deathRate: played ? question.deaths / question.times_answered : null,
      isUnplayed: !played,
      isInactive: question.status === 'INACTIVE',
      isFewAnswers: played && question.times_answered < FEW_ANSWERS,
      isHighestDamage: played && maxAverageDamage.value > 0 && damage === maxAverageDamage.value,
      isLowestDamage: played && hasSpread && damage === minAverageDamage.value,
    };
  }),
);

const sortedRows = computed(() => {
  const key = sortKey.value;
  return [...rows.value].sort((a, b) => {
    if (key === 'position') {
      return a.position - b.position;
    }
    if (a[key] === null && b[key] === null) return a.position - b.position;
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;
    return b[key] - a[key] || a.position - b.position;
  });
});

function positionsText(list) {
  return list.length > 0
    ? `Fråga ${list.map((q) => q.position).join(', ')}`
    : 'Ingen fråga sticker ut';
}

const summary = computed(() => {
  const highest = rows.value.filter((q) => q.isHighestDamage);
  const lowest = rows.value.filter((q) => q.isLowestDamage);
  const totalAnswered = questions.value.reduce((sum, q) => sum + q.times_answered, 0);
  const allDamage = questions.value.reduce((sum, q) => sum + totalDamage(q), 0);
  const unplayed = rows.value.filter((q) => q.isUnplayed).length;

  return [
    {
      label: 'Högst snittskada',
      value: formatDecimal(highest[0]?.averageDamage ?? null),
      detail: positionsText(highest),
    },
    {
      label: 'Lägst snittskada',
      value: formatDecimal(lowest[0]?.averageDamage ?? null),
      detail: positionsText(lowest),
    },
    {
      label: 'Snittskada, alla svar',
      value: formatDecimal(totalAnswered > 0 ? allDamage / totalAnswered : null),
      detail: `${totalAnswered} svar totalt`,
    },
    {
      label: 'Ej spelade',
      value: String(unplayed),
      detail: `av ${questions.value.length} frågor`,
    },
  ];
});

async function load() {
  isLoading.value = true;
  error.value = '';
  try {
    questions.value = await getStats();
  } catch (err) {
    error.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isLoading.value = false;
  }
}

function letter(index) {
  return String.fromCharCode(65 + index);
}

function percent(answer, question) {
  if (question.times_answered === 0) {
    return 0;
  }
  return Math.round((answer.times_chosen / question.times_answered) * 100);
}

function damageLevel(healthChange) {
  if (healthChange === 0) return 'none';
  if (healthChange <= 15) return 'low';
  if (healthChange <= 25) return 'mid';
  return 'high';
}

function damageText(healthChange) {
  return healthChange === 0 ? 'Ingen skada' : `−${healthChange} hälsa`;
}

const decimalFormat = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat('sv-SE', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function formatDecimal(value) {
  return value === null ? '–' : decimalFormat.format(value);
}

function formatPercent(value) {
  return value === null ? '–' : percentFormat.format(value);
}

onMounted(load);
</script>

<template>
  <section class="stats">
    <div class="admin-page-head">
      <div>
        <h1 class="admin-title">Statistik per fråga</h1>
        <p class="admin-subtitle">
          Hitta frågor som är för svåra eller för lätta och justera hälsoavdraget.
        </p>
      </div>
    </div>

    <p v-if="isLoading" class="admin-subtitle">Hämtar statistiken…</p>
    <p v-else-if="error" class="stats-error" role="alert">{{ error }}</p>
    <p v-else-if="questions.length === 0" class="admin-subtitle">Det finns inga frågor än.</p>

    <template v-else>
      <dl class="stats-summary">
        <div v-for="item in summary" :key="item.label" class="admin-card stats-summary-item">
          <dt>{{ item.label }}</dt>
          <dd class="stats-summary-value">{{ item.value }}</dd>
          <dd class="stats-summary-detail">{{ item.detail }}</dd>
        </div>
      </dl>

      <details class="stats-help">
        <summary>Så läser du siffrorna</summary>
        <dl>
          <dt>Snittskada</dt>
          <dd>
            Hur mycket hälsa en spelare i snitt förlorar på frågan. Den påverkas inte av var frågan
            ligger i spelet, så använd den för att balansera hälsoavdraget.
          </dd>
          <dt>Högst och lägst snittskada</dt>
          <dd>Frågan kan vara för svår eller för lätt jämfört med de andra.</dd>
          <dt>Svarade</dt>
          <dd>Hur många som tog sig fram till frågan och svarade.</dd>
          <dt>Dog här</dt>
          <dd>
            Hur många omgångar som tog slut på frågan, alltså där hälsan nådde 0. Senare frågor får
            fler, eftersom spelarna då har mindre hälsa kvar. Tillsammans med Svarade visar det
            spelets svårighetskurva.
          </dd>
          <dt>Andel som dog här</dt>
          <dd>Dog här delat med Svarade.</dd>
          <dt>Staplarna</dt>
          <dd>Hur svaren fördelas, färgade efter hur mycket hälsa svaret kostar.</dd>
        </dl>
        <p>
          Admins egna omgångar räknas inte. Med färre än {{ FEW_ANSWERS }} svar är siffrorna osäkra.
        </p>
      </details>

      <div class="stats-toolbar">
        <div class="stats-sort" role="group" aria-label="Sortera frågorna">
          <span class="stats-sort-label" aria-hidden="true">Sortera:</span>
          <button
            v-for="option in sortOptions"
            :key="option.key"
            type="button"
            class="admin-button stats-sort-button"
            :aria-pressed="sortKey === option.key"
            @click="sortKey = option.key"
          >
            {{ option.label }}
          </button>
        </div>

        <ul class="stats-legend" aria-label="Färgförklaring för hälsoavdrag">
          <li class="stats-legend-title">Hälsoavdrag:</li>
          <li v-for="item in legend" :key="item.level" class="stats-legend-item">
            <span
              class="stats-swatch"
              :class="`stats-damage--${item.level}`"
              aria-hidden="true"
            ></span>
            {{ item.label }}
          </li>
        </ul>
      </div>

      <ol class="stats-list">
        <li
          v-for="question in sortedRows"
          :key="question.question_id"
          class="admin-card stats-card"
          :class="{
            'stats-card--highest': question.isHighestDamage,
            'stats-card--inactive': question.isInactive,
          }"
        >
          <div class="stats-card-head">
            <h2 class="stats-card-title">Fråga {{ question.position }}</h2>
            <span v-if="question.isHighestDamage" class="admin-badge stats-badge--danger">
              Högst snittskada
            </span>
            <span v-if="question.isLowestDamage" class="admin-badge stats-badge--info">
              Lägst snittskada
            </span>
            <span v-if="question.isInactive" class="admin-badge">Inaktiv</span>
            <span v-if="question.isUnplayed" class="admin-badge stats-badge--warning">
              Ej spelad
            </span>
          </div>
          <p class="stats-card-text">{{ question.text }}</p>

          <dl class="stats-numbers">
            <div class="stats-number stats-number--main">
              <dt>Snittskada</dt>
              <dd>{{ formatDecimal(question.averageDamage) }}</dd>
            </div>
            <div class="stats-number">
              <dt>Svarade</dt>
              <dd>{{ question.times_answered }}</dd>
            </div>
            <div class="stats-number">
              <dt>Dog här</dt>
              <dd>{{ question.deaths }}</dd>
            </div>
            <div class="stats-number">
              <dt>Andel som dog här</dt>
              <dd>{{ formatPercent(question.deathRate) }}</dd>
            </div>
          </dl>

          <p v-if="question.isFewAnswers" class="stats-note">
            Färre än {{ FEW_ANSWERS }} svar, tolka siffrorna försiktigt.
          </p>

          <ul class="stats-answers">
            <li
              v-for="(answer, index) in question.answers"
              :key="answer.answer_id"
              class="stats-answer"
            >
              <span class="stats-answer-letter">{{ letter(index) }}</span>
              <span class="stats-answer-text">
                {{ answer.text }}
                <span class="stats-answer-damage">{{ damageText(answer.health_change) }}</span>
              </span>
              <span class="stats-bar" aria-hidden="true">
                <span
                  class="stats-bar-fill"
                  :class="`stats-damage--${damageLevel(answer.health_change)}`"
                  :style="{ width: `${percent(answer, question)}%` }"
                ></span>
              </span>
              <span class="stats-answer-percent">{{ percent(answer, question) }} %</span>
            </li>
          </ul>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.stats {
  --stats-damage-none: #1f6feb;
  --stats-damage-low: #ffc48a;
  --stats-damage-mid: #e16f24;
  --stats-damage-high: #7a2e0b;
  --stats-warning-bg: #fff8c5;
  --stats-warning-text: #7d4e00;
}

.stats-error {
  color: var(--admin-danger);
}

.stats-help {
  margin-bottom: 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.stats-help summary {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  font-weight: 600;
  cursor: pointer;
}

.stats-help summary:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}

.stats-help dl,
.stats-help p {
  padding: 0 1rem;
}

.stats-help dt {
  font-weight: 600;
}

.stats-help dd {
  margin: 0 0 0.75rem;
  color: var(--admin-muted);
}

.stats-help p {
  padding-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.stats-note {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--stats-warning-text);
  background: var(--stats-warning-bg);
  border-radius: var(--admin-radius);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0 0 1rem;
}

.stats-summary-item dt {
  font-size: 0.8125rem;
  color: var(--admin-muted);
}

.stats-summary-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stats-summary-detail {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--admin-muted);
}

.stats-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stats-sort {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.stats-sort-label {
  grid-column: 1 / -1;
  font-size: 0.875rem;
  font-weight: 600;
}

.stats-sort-button {
  min-height: 44px;
  padding: 0.25rem 0.5rem;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.stats-sort-button[aria-pressed='true'] {
  color: var(--admin-accent);
  background: color-mix(in srgb, var(--admin-accent) 10%, var(--admin-surface));
  border-color: var(--admin-accent);
}

.stats-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 1rem;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: var(--admin-muted);
}

.stats-legend-title {
  font-weight: 600;
  color: var(--admin-text);
}

.stats-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.stats-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.stats-card-title {
  font-size: 1rem;
  font-weight: 700;
}

.stats-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.5rem;
}

.stats-badge--danger {
  color: var(--admin-danger);
  background: color-mix(in srgb, var(--admin-danger) 10%, var(--admin-surface));
}

.stats-badge--info {
  color: var(--admin-accent);
  background: color-mix(in srgb, var(--admin-accent) 10%, var(--admin-surface));
}

.stats-badge--warning {
  color: var(--stats-warning-text);
  background: var(--stats-warning-bg);
}

.stats-card--highest {
  border-color: var(--admin-danger);
}

.stats-card--inactive {
  background: var(--admin-bg);
}

.stats-card-text {
  color: var(--admin-muted);
}

.stats-numbers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1.5rem;
  margin: 0.75rem 0;
}

.stats-number--main dd {
  color: var(--admin-accent);
}

.stats-numbers dt {
  font-size: 0.75rem;
  color: var(--admin-muted);
}

.stats-numbers dd {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stats-answers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.stats-answer {
  display: grid;
  grid-template-columns: 1.25rem 1fr 3rem;
  grid-template-areas:
    'letter text text'
    '. bar percent';
  align-items: center;
  gap: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.stats-answer-letter {
  grid-area: letter;
  align-self: start;
  font-weight: 700;
}

.stats-answer-text {
  grid-area: text;
}

.stats-answer-damage {
  display: block;
  font-size: 0.75rem;
  color: var(--admin-muted);
}

.stats-bar {
  grid-area: bar;
  height: 10px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--admin-neutral-bg);
}

.stats-bar-fill {
  display: block;
  height: 100%;
}

.stats-answer-percent {
  grid-area: percent;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.stats-damage--none {
  background: var(--stats-damage-none);
}

.stats-damage--low {
  background: var(--stats-damage-low);
}

.stats-damage--mid {
  background: var(--stats-damage-mid);
}

.stats-damage--high {
  background: var(--stats-damage-high);
}

@media (min-width: 600px) {
  .stats-numbers {
    grid-template-columns: repeat(4, auto);
    justify-content: start;
  }
}

@media (min-width: 768px) {
  .stats-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .stats-toolbar {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }

  .stats-sort {
    display: flex;
    align-items: center;
  }

  .stats-sort-button {
    min-height: 36px;
    padding: 0 0.875rem;
    white-space: nowrap;
  }

  .stats-list {
    gap: 1rem;
  }

  .stats-card {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    grid-template-rows: auto auto auto 1fr;
    grid-template-areas:
      'head answers'
      'text answers'
      'numbers answers'
      'note answers';
    column-gap: 2rem;
    padding: 1.25rem;
  }

  .stats-card-head {
    grid-area: head;
  }

  .stats-card-text {
    grid-area: text;
  }

  .stats-numbers {
    grid-area: numbers;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-note {
    grid-area: note;
    align-self: start;
  }

  .stats-answers {
    grid-area: answers;
  }

  .stats-answer {
    grid-template-columns: 1.25rem minmax(0, 1fr) 8rem 3rem;
    grid-template-areas: 'letter text bar percent';
    column-gap: 0.75rem;
  }
}
</style>
