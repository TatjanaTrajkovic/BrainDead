<script setup>
import { computed, onMounted, ref } from 'vue';
import { getQuestions, moveQuestion, setQuestionStatus } from '@/api/adminApi';

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

// Bara en flytt åt gången. Två flyttar samtidigt kan röra samma frågor, och då kan
// listan visa en annan ordning än databasen
const isMoving = ref(false);

async function move(index, direction) {
  const question = visibleQuestions.value[index];
  const neighbour = visibleQuestions.value[direction === 'up' ? index - 1 : index + 1];
  isMoving.value = true;
  actionError.value = '';
  try {
    await moveQuestion(question.question_id, direction, neighbour.question_id);
  } catch (err) {
    // 409: någon annan har ändrat ordningen. Meddelandet säger att listan uppdateras
    actionError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    // Hämtas om även när flytten lyckas, så att ändringar från andra admins också syns
    await loadQuestions();
    isMoving.value = false;
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
    return (
      q.title.toLowerCase().includes(text) ||
      q.scenario.toLowerCase().includes(text) ||
      q.text.toLowerCase().includes(text)
    );
  });
});

// Med filter eller sökning är grannen i listan inte alltid grannen i den riktiga ordningen,
// så pilarna fungerar bara när alla frågor visas
const canReorder = computed(() => !filter.value && !search.value.trim());

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

    <div v-else-if="loadError" class="admin-alert admin-load-error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" class="admin-button" @click="loadQuestions">Försök igen</button>
    </div>

    <p v-else-if="questions.length === 0" class="admin-card">
      Inga frågor än. Skapa den första med Ny fråga.
    </p>

    <template v-else>
      <div class="admin-toolbar">
        <div class="admin-segmented" role="group" aria-label="Visa frågor">
          <button
            v-for="f in filters"
            :key="f.label"
            type="button"
            class="admin-segment"
            :class="{ 'is-active': filter === f.value }"
            :aria-pressed="filter === f.value"
            @click="filter = f.value"
          >
            {{ f.label }} ({{ f.count }})
          </button>
        </div>

        <label class="admin-search">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Sök i titel, scenario eller fråga"
            aria-label="Sök i titel, scenario eller fråga"
          />
        </label>
      </div>

      <p v-if="visibleQuestions.length === 0" class="admin-card">Inga frågor matchar.</p>

      <div v-else class="admin-list">
        <!-- Rubrikraden syns bara på desktop. På mobil förklarar korten sig själva -->
        <div class="admin-list-head" aria-hidden="true">
          <span>Ordning</span>
          <span>Fråga</span>
          <span>Svar</span>
          <span>Status</span>
          <span class="admin-align-end">Åtgärder</span>
        </div>

        <ul>
          <li
            v-for="(question, index) in visibleQuestions"
            :key="question.question_id"
            class="admin-row"
            :class="{ 'is-inactive': question.status === 'INACTIVE' }"
          >
            <div class="cell-order">
              <span class="position">{{ question.position }}</span>
              <button
                type="button"
                class="icon-button"
                :disabled="!canReorder || isMoving || index === 0"
                aria-label="Flytta upp"
                :title="canReorder ? 'Flytta upp' : 'Visa alla frågor för att ändra ordning'"
                @click="move(index, 'up')"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.75" fill="none" />
                </svg>
              </button>
              <button
                type="button"
                class="icon-button"
                :disabled="!canReorder || isMoving || index === visibleQuestions.length - 1"
                aria-label="Flytta ned"
                :title="canReorder ? 'Flytta ned' : 'Visa alla frågor för att ändra ordning'"
                @click="move(index, 'down')"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.75" fill="none" />
                </svg>
              </button>
            </div>

            <div class="cell-question">
              <p class="question-title">{{ question.title }}</p>
              <p class="scenario">{{ question.scenario }}</p>
              <p class="question-text">Fråga: {{ question.text }}</p>
            </div>

            <div class="cell-answers">
              {{ question.answers.length }}<span class="admin-mobile-label"> svar</span>
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
/* Mobile first: varje fråga är ett kort. Från 768 px blir samma rader en tabell med rubrikrad.
   Verktygsraden, listan och raderna kommer från admin-klasserna i AdminView, här finns bara
   kolumnerna och det som är unikt för frågorna */

.action-error {
  margin-bottom: 1rem;
}

/* Kort på mobil: ordning och status överst, sedan frågan, antal svar och knappen */
.admin-row {
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'order status'
    'question question'
    'answers answers'
    'actions actions';
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

.question-title {
  overflow-wrap: anywhere;
  font-weight: 600;
}

/* Scenariot kortas till två rader på mobil */
.scenario {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.question-text {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.admin-row.is-inactive .question-title,
.admin-row.is-inactive .scenario,
.admin-row.is-inactive .position {
  color: var(--admin-muted);
}

@media (min-width: 600px) {
  .cell-actions {
    justify-content: flex-end;
  }

  .cell-actions .admin-button {
    flex: none;
  }
}

/* Desktop: rubrikrad och raderna i samma kolumner */
@media (min-width: 768px) {
  /* Rubrikraden och raderna är separata grids, så alla kolumner utom frågan har fast bredd.
     Med auto skulle sista kolumnen få olika bredd i rubriken och raderna, och de andra
     kolumnerna förskjutas. Åtgärder rymmer Redigera och statusknappen */
  .admin-list-head,
  .admin-row {
    grid-template-columns: 6.5rem minmax(0, 1fr) 3.5rem 6.5rem 13.5rem;
    grid-template-areas: 'order question answers status actions';
  }

  .admin-row.is-inactive {
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

  .cell-status {
    justify-self: start;
  }

  .cell-actions {
    margin-top: 0;
  }

  /* Samma bredd för båda texterna, så att Redigera inte hoppar när texten byts */
  .status-button {
    min-width: 7.5rem;
  }
}
</style>
