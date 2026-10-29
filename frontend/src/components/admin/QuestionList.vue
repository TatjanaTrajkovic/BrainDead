<script setup>
import { computed, onMounted, ref } from 'vue';
import { getQuestions, setQuestionStatus } from '@/api/adminApi';

const questions = ref([]);
const isLoading = ref(true);
const loadError = ref('');

// Hämtas varje gång listan visas, så att en fråga som sparats i formuläret syns direkt
// när admin kommer tillbaka
async function loadQuestions() {
  isLoading.value = true;
  loadError.value = '';
  try {
    questions.value = await getQuestions();
  } catch (err) {
    // err.status saknas när servern inte svarar alls
    loadError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isLoading.value = false;
  }
}

// Id:n för frågor vars status sparas just nu. Knappen är avstängd under anropet,
// så att ett dubbelklick inte skickar två ändringar
const busyIds = ref(new Set());
const actionError = ref('');

async function toggleStatus(question) {
  const newStatus = question.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  busyIds.value.add(question.question_id);
  actionError.value = '';
  try {
    const result = await setQuestionStatus(question.question_id, newStatus);
    question.status = result.status;
  } catch (err) {
    actionError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    busyIds.value.delete(question.question_id);
  }
}

// Filtrets värde är statusen som ska visas, null visar alla
const filter = ref(null);
const search = ref('');

const counts = computed(() => {
  const active = questions.value.filter((q) => q.status === 'ACTIVE').length;
  return { all: questions.value.length, active, inactive: questions.value.length - active };
});

const filters = computed(() => [
  { value: null, label: 'Alla', count: counts.value.all },
  { value: 'ACTIVE', label: 'Aktiva', count: counts.value.active },
  { value: 'INACTIVE', label: 'Inaktiva', count: counts.value.inactive },
]);

// Alla frågor hämtas på en gång eftersom de är få, så filter och sökning sker här
const visibleQuestions = computed(() => {
  const text = search.value.trim().toLowerCase();
  return questions.value.filter((q) => {
    if (filter.value && q.status !== filter.value) return false;
    if (!text) return true;
    return q.scenario.toLowerCase().includes(text) || q.text.toLowerCase().includes(text);
  });
});

onMounted(loadQuestions);
</script>

<template>
  <section>
    <div class="admin-page-head">
      <div>
        <h1 class="admin-title">Frågor</h1>
        <p class="admin-subtitle">
          <!-- Antalen döljs under hämtningen, annars syns "0 frågor" en kort stund -->
          <template v-if="!isLoading && !loadError">
            {{ counts.all }} frågor, {{ counts.active }} aktiva.
          </template>
          Ändringar gäller bara nya omgångar, pågående omgångar behåller sina frågor.
        </p>
      </div>
      <RouterLink :to="{ name: 'admin-question-new' }" class="admin-button admin-button--primary">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.75" fill="none" />
        </svg>
        Ny fråga
      </RouterLink>
    </div>

    <p v-if="actionError" class="admin-alert action-error" role="alert">{{ actionError }}</p>

    <p v-if="isLoading" class="admin-subtitle">Hämtar frågor…</p>

    <div v-else-if="loadError" class="admin-alert load-error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" class="admin-button" @click="loadQuestions">Försök igen</button>
    </div>

    <p v-else-if="questions.length === 0" class="admin-card">
      Inga frågor än. Skapa den första med Ny fråga.
    </p>

    <template v-else>
      <div class="toolbar">
        <div class="segmented" role="group" aria-label="Visa frågor">
          <button
            v-for="f in filters"
            :key="f.label"
            type="button"
            class="segment"
            :class="{ 'is-active': filter === f.value }"
            :aria-pressed="filter === f.value"
            @click="filter = f.value"
          >
            {{ f.label }} ({{ f.count }})
          </button>
        </div>

        <label class="search">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Sök i scenario eller fråga"
            aria-label="Sök i scenario eller fråga"
          />
        </label>
      </div>

      <p v-if="visibleQuestions.length === 0" class="admin-card">Inga frågor matchar.</p>

      <div v-else class="list">
        <!-- Rubrikraden syns bara på desktop. På mobil förklarar korten sig själva -->
        <div class="list-head" aria-hidden="true">
          <span>Ordning</span>
          <span>Fråga</span>
          <span>Svar</span>
          <span>Status</span>
          <span class="align-end">Åtgärder</span>
        </div>

        <ul>
          <li
            v-for="question in visibleQuestions"
            :key="question.question_id"
            class="row"
            :class="{ 'is-inactive': question.status === 'INACTIVE' }"
          >
            <div class="cell-order">
              <span class="position">{{ question.position }}</span>
              <!-- Ordningen kan inte ändras än, det saknas en endpoint för position -->
              <button
                type="button"
                class="icon-button"
                disabled
                aria-label="Flytta upp"
                title="Ordningen kan inte ändras än"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.75" fill="none" />
                </svg>
              </button>
              <button
                type="button"
                class="icon-button"
                disabled
                aria-label="Flytta ned"
                title="Ordningen kan inte ändras än"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.75" fill="none" />
                </svg>
              </button>
            </div>

            <div class="cell-question">
              <p class="scenario">{{ question.scenario }}</p>
              <p class="question-text">Fråga: {{ question.text }}</p>
            </div>

            <div class="cell-answers">
              {{ question.answers.length }}<span class="mobile-label"> svar</span>
            </div>

            <div class="cell-status">
              <span
                class="admin-badge"
                :class="{ 'admin-badge--success': question.status === 'ACTIVE' }"
              >
                {{ question.status === 'ACTIVE' ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </div>

            <div class="cell-actions">
              <RouterLink
                :to="{ name: 'admin-question-edit', params: { questionId: question.question_id } }"
                class="admin-button"
              >
                Redigera
              </RouterLink>
              <button
                type="button"
                class="admin-button status-button"
                :disabled="busyIds.has(question.question_id)"
                @click="toggleStatus(question)"
              >
                {{ question.status === 'ACTIVE' ? 'Inaktivera' : 'Återaktivera' }}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Mobile first: varje fråga är ett kort. Från 768 px blir samma rader en tabell med rubrikrad */

.action-error {
  margin-bottom: 1rem;
}

.load-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* Filterknapparna ser ut som en sammanhängande knapprad */
.segmented {
  display: flex;
  padding: 0.1875rem;
  background: var(--admin-neutral-bg);
  border-radius: var(--admin-radius);
}

.segment {
  flex: 1;
  min-height: 36px;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
  white-space: nowrap;
  border-radius: calc(var(--admin-radius) - 2px);
}

.segment.is-active {
  color: var(--admin-text);
  background: var(--admin-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

/* Ramen sitter på label, så att ikonen hamnar inuti fältet */
.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0 0.75rem;
  color: var(--admin-muted);
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.search:focus-within {
  border-color: var(--admin-accent);
  outline: 2px solid color-mix(in srgb, var(--admin-accent) 25%, transparent);
}

.search input {
  flex: 1;
  min-width: 0;
  font: inherit;
  color: var(--admin-text);
  background: none;
  border: none;
  outline: none;
}

.list ul {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.list-head {
  display: none;
}

/* Kort på mobil: ordning och status överst, sedan frågan, antal svar och knappen */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'order status'
    'question question'
    'answers answers'
    'actions actions';
  gap: 0.5rem;
  padding: 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.cell-order {
  grid-area: order;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.position {
  min-width: 1.5rem;
  font-weight: 600;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--admin-text);
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.icon-button:disabled {
  color: var(--admin-border);
  cursor: not-allowed;
}

/* min-width: 0 låter texten krympa i griden, annars fungerar inte ellipsen */
.cell-question {
  grid-area: question;
  min-width: 0;
}

.cell-answers {
  grid-area: answers;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.cell-status {
  grid-area: status;
  justify-self: end;
}

.cell-actions {
  grid-area: actions;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.cell-actions .admin-button {
  flex: 1;
}

/* Scenariot kortas till två rader på mobil */
.scenario {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font-weight: 500;
}

.question-text {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.row.is-inactive .scenario,
.row.is-inactive .position {
  color: var(--admin-muted);
}

@media (min-width: 600px) {
  .cell-actions {
    justify-content: flex-end;
  }

  .cell-actions .admin-button {
    flex: none;
  }

  .toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .segment {
    flex: none;
  }

  .search {
    width: 250px;
  }
}

/* Desktop: rubrikrad och raderna i samma kolumner */
@media (min-width: 768px) {
  .list {
    overflow: hidden;
    background: var(--admin-surface);
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
  }

  /* Rubrikraden och raderna är separata grids, så alla kolumner utom frågan har fast bredd.
     Med auto skulle sista kolumnen få olika bredd i rubriken och raderna, och de andra
     kolumnerna förskjutas. Åtgärder rymmer Redigera och statusknappen */
  .list-head,
  .row {
    display: grid;
    grid-template-columns: 6.5rem minmax(0, 1fr) 3.5rem 6.5rem 13.5rem;
    grid-template-areas: 'order question answers status actions';
    align-items: center;
    column-gap: 1rem;
    padding: 0.75rem 1rem;
  }

  .list-head {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--admin-muted);
    border-bottom: 1px solid var(--admin-border);
  }

  .list ul {
    gap: 0;
  }

  .row {
    border: none;
    border-bottom: 1px solid var(--admin-border);
    border-radius: 0;
  }

  .row:last-child {
    border-bottom: none;
  }

  .row.is-inactive {
    background: var(--admin-bg);
  }

  /* En rad med ellips i tabellen */
  .scenario {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cell-answers {
    font-size: inherit;
    color: var(--admin-text);
  }

  .mobile-label {
    display: none;
  }

  .cell-status {
    justify-self: start;
  }

  .cell-actions {
    margin-top: 0;
  }

  .align-end {
    text-align: right;
  }

  /* Samma bredd för båda texterna, så att Redigera inte hoppar när texten byts */
  .status-button {
    min-width: 7.5rem;
  }
}
</style>
