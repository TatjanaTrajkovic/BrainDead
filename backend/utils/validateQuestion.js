// Gränserna följer kolumnerna i schema.sql, så att databasen aldrig behöver korta av något
const SCENARIO_MAX_LENGTH = 500;
const QUESTION_TEXT_MAX_LENGTH = 255;
const ANSWER_TEXT_MAX_LENGTH = 150;
const FEEDBACK_MAX_LENGTH = 500;
const ANSWER_COUNT = 4;

// trim tar bort mellanslag som råkat följa med i kanterna. Allt som inte är en sträng lämnas
// orört, så att validateQuestion kan säga vilket fält som är fel
function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeQuestion(body) {
  const { scenario, text, answers } = body ?? {};
  return {
    scenario: trimString(scenario),
    text: trimString(text),
    answers: Array.isArray(answers)
      ? answers.map((answer) => ({
          text: trimString(answer?.text),
          health_change: answer?.health_change,
          feedback: trimString(answer?.feedback),
        }))
      : answers,
  };
}

function validateText(value, label, maxLength) {
  if (typeof value !== 'string' || value.length === 0) {
    return `${label} saknas`;
  }
  if (value.length > maxLength) {
    return `${label} får vara max ${maxLength} tecken`;
  }
  return null;
}

// Returnerar ett felmeddelande, eller null om frågan är godkänd.
// Anropa med den normaliserade frågan
function validateQuestion(question) {
  const scenarioError = validateText(question.scenario, 'Scenario', SCENARIO_MAX_LENGTH);
  if (scenarioError) return scenarioError;

  const textError = validateText(question.text, 'Frågetext', QUESTION_TEXT_MAX_LENGTH);
  if (textError) return textError;

  if (!Array.isArray(question.answers) || question.answers.length !== ANSWER_COUNT) {
    return `Frågan måste ha exakt ${ANSWER_COUNT} svar`;
  }

  for (const [index, answer] of question.answers.entries()) {
    const label = `Svar ${index + 1}`;
    const answerTextError = validateText(answer.text, `${label}: text`, ANSWER_TEXT_MAX_LENGTH);
    if (answerTextError) return answerTextError;

    const feedbackError = validateText(answer.feedback, `${label}: feedback`, FEEDBACK_MAX_LENGTH);
    if (feedbackError) return feedbackError;

    if (!Number.isInteger(answer.health_change)) {
      return `${label}: health_change måste vara ett heltal`;
    }
  }
  return null;
}

module.exports = {
  SCENARIO_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  ANSWER_TEXT_MAX_LENGTH,
  FEEDBACK_MAX_LENGTH,
  ANSWER_COUNT,
  normalizeQuestion,
  validateQuestion,
};
