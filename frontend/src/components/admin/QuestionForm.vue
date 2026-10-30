<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createQuestion, getQuestions, updateQuestion } from '@/api/adminApi';

const route = useRoute();
const router = useRouter();

// Samma komponent för ny och redigerad fråga. Redigering har ett id i URL:en
const questionId = computed(() =>
  route.params.questionId ? Number(route.params.questionId) : null,
);
const isEdit = computed(() => questionId.value !== null);
const pageTitle = computed(() =>
  isEdit.value ? `Redigera fråga ${questionId.value}` : 'Ny fråga',
);

// Spelet förutsätter exakt fyra svar, samma som ANSWER_COUNT i backend
const ANSWER_COUNT = 4;
// Gränserna följer validateQuestion.js och databasens kolumner. Ändras de ska de ändras här också
const LIMITS = { scenario: 500, text: 255, answerText: 150, feedback: 500 };
const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

// Hälsoavdraget är tomt ('') tills admin skriver något, så att det måste fyllas i
const form = ref({
  scenario: '',
  text: '',
  answers: Array.from({ length: ANSWER_COUNT }, () => ({
    text: '',
    health_change: '',
    feedback: '',
  })),
});

const isLoading = ref(false);
const loadError = ref('');
// Visas som badge i rubriken vid redigering. Ändras i listan, inte här
const questionStatus = ref(null);

// Backend saknar en endpoint för en enskild fråga. Frågorna är få, så alla hämtas och
// rätt fråga letas upp. Formuläret hämtar själv i stället för att få frågan från listan,
// så att en omladdning fungerar
async function loadQuestion() {
  isLoading.value = true;
  loadError.value = '';
  try {
    const questions = await getQuestions();
    const question = questions.find((q) => q.question_id === questionId.value);
    if (!question) {
      loadError.value = 'Frågan finns inte';
      return;
    }
    questionStatus.value = question.status;
    // Svaren kopieras, så att listans data inte ändras medan admin skriver.
    // answer_id följer med, eftersom PUT kräver samma svar som finns i databasen
    form.value = {
      scenario: question.scenario,
      text: question.text,
      answers: question.answers.map((answer) => ({ ...answer })),
    };
  } catch (err) {
    // err.status saknas när servern inte svarar alls
    loadError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isLoading.value = false;
  }
}

function textError(value, label) {
  return value.trim() ? '' : `${label} saknas`;
}

function healthError(value) {
  if (value === '') return 'Hälsoavdrag saknas';
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    return 'Hälsoavdraget måste vara ett heltal mellan 0 och 100';
  }
  return '';
}

// Felet för varje fält, med fältets id som nyckel. Tom text betyder att fältet är rätt.
// För långa texter behöver inget fel, eftersom maxlength stoppar dem redan i fältet
const errors = computed(() => {
  const result = {
    scenario: textError(form.value.scenario, 'Scenario'),
    'question-text': textError(form.value.text, 'Frågetext'),
  };
  form.value.answers.forEach((answer, index) => {
    result[`answer-${index}-text`] = textError(answer.text, 'Svarstext');
    result[`answer-${index}-health`] = healthError(answer.health_change);
    result[`answer-${index}-feedback`] = textError(answer.feedback, 'Feedback');
  });
  return result;
});

// Spara är avstängd tills alla fält är rätt. Backend validerar ändå och svarar med error
const canSave = computed(() => Object.values(errors.value).every((error) => !error));

// Fält som admin har lämnat. Felen visas först då, så att ett tomt formulär inte är fullt av fel
const touched = ref(new Set());

function shownError(id) {
  return touched.value.has(id) ? errors.value[id] : '';
}

// Samma attribut på varje fält: id för label, felet kopplat för skärmläsare,
// och att fältet räknas som lämnat vid blur
function fieldAttrs(id) {
  const error = shownError(id);
  return {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    onBlur: () => touched.value.add(id),
  };
}

const isSaving = ref(false);
const saveError = ref('');

async function save() {
  // Enter skickar formuläret även när knappen är avstängd
  if (!canSave.value || isSaving.value) return;
  isSaving.value = true;
  saveError.value = '';
  try {
    if (isEdit.value) {
      await updateQuestion(questionId.value, form.value);
    } else {
      await createQuestion(form.value);
    }
    // Listan hämtar om frågorna när den visas, så den nya eller ändrade frågan syns direkt
    router.push({ name: 'admin-questions' });
  } catch (err) {
    saveError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  if (isEdit.value) loadQuestion();
});
</script>

<template>
  <section>
    <div class="admin-page-head">
      <div>
        <nav class="breadcrumb" aria-label="Brödsmulor">
          <RouterLink :to="{ name: 'admin-questions' }">Frågor</RouterLink>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{{ pageTitle }}</span>
        </nav>
        <h1 class="admin-title title-row">
          {{ pageTitle }}
          <span
            v-if="questionStatus"
            class="admin-badge"
            :class="{ 'admin-badge--success': questionStatus === 'ACTIVE' }"
          >
            {{ questionStatus === 'ACTIVE' ? 'Aktiv' : 'Inaktiv' }}
          </span>
        </h1>
      </div>
    </div>

    <p v-if="isLoading" class="admin-subtitle">Hämtar frågan…</p>

    <p v-else-if="loadError" class="admin-alert" role="alert">{{ loadError }}</p>

    <div v-else class="editor">
      <form class="question-form" @submit.prevent="save">
        <fieldset class="admin-card">
          <legend class="card-title">Fråga</legend>

          <div class="field">
            <div class="field-head">
              <label for="scenario">Scenario</label>
              <span class="counter">{{ form.scenario.length }} / {{ LIMITS.scenario }}</span>
            </div>
            <textarea
              v-model="form.scenario"
              v-bind="fieldAttrs('scenario')"
              rows="5"
              :maxlength="LIMITS.scenario"
            ></textarea>
            <p v-if="shownError('scenario')" id="scenario-error" class="field-error">
              {{ shownError('scenario') }}
            </p>
          </div>

          <div class="field">
            <div class="field-head">
              <label for="question-text">Frågetext</label>
              <span class="counter">{{ form.text.length }} / {{ LIMITS.text }}</span>
            </div>
            <input
              v-model="form.text"
              v-bind="fieldAttrs('question-text')"
              type="text"
              :maxlength="LIMITS.text"
            />
            <p v-if="shownError('question-text')" id="question-text-error" class="field-error">
              {{ shownError('question-text') }}
            </p>
          </div>
        </fieldset>

        <fieldset class="admin-card">
          <legend class="card-title">Svarsalternativ (alltid 4)</legend>
          <p class="hint">Hälsoavdrag 0 = bästa valet. Spelaren startar på 100.</p>

          <fieldset v-for="(answer, index) in form.answers" :key="index" class="answer">
            <legend class="answer-title">Svar {{ ANSWER_LETTERS[index] }}</legend>

            <div class="answer-row">
              <div class="field">
                <div class="field-head">
                  <label :for="`answer-${index}-text`">Svarstext</label>
                  <span class="counter">{{ answer.text.length }} / {{ LIMITS.answerText }}</span>
                </div>
                <input
                  v-model="answer.text"
                  v-bind="fieldAttrs(`answer-${index}-text`)"
                  type="text"
                  :maxlength="LIMITS.answerText"
                />
                <p
                  v-if="shownError(`answer-${index}-text`)"
                  :id="`answer-${index}-text-error`"
                  class="field-error"
                >
                  {{ shownError(`answer-${index}-text`) }}
                </p>
              </div>

              <div class="field">
                <div class="field-head">
                  <label :for="`answer-${index}-health`">Hälsoavdrag</label>
                </div>
                <input
                  v-model.number="answer.health_change"
                  v-bind="fieldAttrs(`answer-${index}-health`)"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  inputmode="numeric"
                />
                <p
                  v-if="shownError(`answer-${index}-health`)"
                  :id="`answer-${index}-health-error`"
                  class="field-error"
                >
                  {{ shownError(`answer-${index}-health`) }}
                </p>
              </div>
            </div>

            <div class="field">
              <div class="field-head">
                <label :for="`answer-${index}-feedback`">Feedback efter svar</label>
                <span class="counter">{{ answer.feedback.length }} / {{ LIMITS.feedback }}</span>
              </div>
              <textarea
                v-model="answer.feedback"
                v-bind="fieldAttrs(`answer-${index}-feedback`)"
                rows="2"
                :maxlength="LIMITS.feedback"
              ></textarea>
              <p
                v-if="shownError(`answer-${index}-feedback`)"
                :id="`answer-${index}-feedback-error`"
                class="field-error"
              >
                {{ shownError(`answer-${index}-feedback`) }}
              </p>
            </div>
          </fieldset>
        </fieldset>

        <div class="admin-card form-footer">
          <p v-if="saveError" class="admin-alert" role="alert">{{ saveError }}</p>
          <div class="form-buttons">
            <RouterLink :to="{ name: 'admin-questions' }" class="admin-button">Avbryt</RouterLink>
            <button
              type="submit"
              class="admin-button admin-button--primary"
              :disabled="!canSave || isSaving"
            >
              {{ isSaving ? 'Sparar…' : 'Spara fråga' }}
            </button>
          </div>
        </div>
      </form>

      <!-- Platshållare så att layouten är klar. QuestionPreview byggs i #179 och får form som prop -->
      <aside class="admin-card preview">
        <h2 class="card-title">Förhandsvisning</h2>
        <p class="hint">Så här ser spelaren frågan. Byggs i #179.</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
/* Mobile first: en kolumn på mobil, svarstext och hälsoavdrag bredvid varandra från 600 px,
   formulär och förhandsvisning bredvid varandra från 1024 px */

.breadcrumb {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.breadcrumb a {
  color: var(--admin-accent);
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.editor {
  display: grid;
  gap: 1rem;
}

.question-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* fieldset har egen ram och marginal i webbläsaren, admin-card ger ramen i stället */
fieldset {
  min-width: 0;
  margin: 0;
}

/* float får legend att bete sig som en vanlig rubrik. Annars ritar webbläsaren den
   ovanpå ramen, och det går inte att ändra med vanlig CSS */
.card-title {
  float: left;
  width: 100%;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.hint {
  clear: both;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.field {
  clear: both;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.field-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
}

.counter {
  font-weight: 400;
  color: var(--admin-muted);
}

input,
textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font: inherit;
  color: var(--admin-text);
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

input:focus,
textarea:focus {
  border-color: var(--admin-accent);
  outline: 2px solid color-mix(in srgb, var(--admin-accent) 25%, transparent);
}

textarea {
  resize: vertical;
}

/* Röd ram på fält med fel, även med fokus. aria-invalid är true bara när felet visas */
[aria-invalid='true'],
[aria-invalid='true']:focus {
  border-color: var(--admin-danger);
  outline-color: color-mix(in srgb, var(--admin-danger) 25%, transparent);
}

.field-error {
  font-size: 0.8125rem;
  color: var(--admin-danger);
}

.answer {
  padding: 0.75rem 1rem 0.25rem;
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
}

.answer + .answer {
  margin-top: 0.75rem;
}

.answer-title {
  padding: 0 0.25rem;
  font-weight: 600;
}

/* Mobil: svarstext och hälsoavdrag under varandra */
.answer-row {
  display: grid;
}

.form-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (min-width: 600px) {
  /* Hälsoavdraget behöver bara plats för tre siffror */
  .answer-row {
    grid-template-columns: minmax(0, 1fr) 7rem;
    column-gap: 0.75rem;
  }
}

/* Desktop: formuläret till vänster och förhandsvisningen till höger. Två kolumner först
   från 1024 px, eftersom formuläret behöver bredd för svarstext och hälsoavdrag på samma rad.
   Förhandsvisningen stannar kvar när formuläret scrollas, så att den syns medan admin skriver.
   56 px är topprarens höjd i AdminView */
@media (min-width: 1024px) {
  .editor {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    align-items: start;
  }

  .preview {
    position: sticky;
    top: calc(56px + 1rem);
  }
}
</style>
