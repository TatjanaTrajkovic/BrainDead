// Gränserna följer kolumnerna i db/schema.sql. Ändras schemat ska de ändras här också
const SCENARIO_MIN_LENGTH = 1;
const SCENARIO_MAX_LENGTH = 500;
const TEXT_MIN_LENGTH = 1;
const TEXT_MAX_LENGTH = 255;
const ANSWER_TEXT_MIN_LENGTH = 1;
const ANSWER_TEXT_MAX_LENGTH = 150;
const FEEDBACK_MIN_LENGTH = 1;
const FEEDBACK_MAX_LENGTH = 500;

// Spelet förutsätter att varje fråga har exakt fyra svarsalternativ
const ANSWER_COUNT = 4;

// Returnerar ett felmeddelande, eller null om texten är godkänd.
// Längden räknas efter trim, så att bara mellanslag räknas som tomt
function checkText(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `${label} saknas`;
  }
  const length = value.trim().length;
  if (length < min) {
    return `${label} måste vara minst ${min} tecken`;
  }
  if (length > max) {
    return `${label} får vara max ${max} tecken`;
  }
  return null;
}

// Returnerar ett felmeddelande, eller null om frågan är godkänd.
// requireAnswerId används vid redigering, där varje svar redan har ett id
function validateQuestion(question, { requireAnswerId = false } = {}) {
  if (typeof question !== 'object' || question === null) {
    return 'Fråga saknas';
  }

  const scenarioError = checkText(
    question.scenario,
    'Scenariot',
    SCENARIO_MIN_LENGTH,
    SCENARIO_MAX_LENGTH,
  );
  if (scenarioError) {
    return scenarioError;
  }

  const textError = checkText(question.text, 'Frågetexten', TEXT_MIN_LENGTH, TEXT_MAX_LENGTH);
  if (textError) {
    return textError;
  }

  if (!Array.isArray(question.answers)) {
    return 'Svar saknas';
  }
  if (question.answers.length !== ANSWER_COUNT) {
    return `Frågan måste ha ${ANSWER_COUNT} svar`;
  }

  for (let i = 0; i < question.answers.length; i++) {
    const answer = question.answers[i];
    const prefix = `Svar ${i + 1}`;

    if (typeof answer !== 'object' || answer === null) {
      return `${prefix} saknas`;
    }
    if (requireAnswerId && !Number.isInteger(answer.answer_id)) {
      return `${prefix}: answer_id saknas`;
    }

    const answerTextError = checkText(
      answer.text,
      `${prefix}: texten`,
      ANSWER_TEXT_MIN_LENGTH,
      ANSWER_TEXT_MAX_LENGTH,
    );
    if (answerTextError) {
      return answerTextError;
    }

    const feedbackError = checkText(
      answer.feedback,
      `${prefix}: feedback`,
      FEEDBACK_MIN_LENGTH,
      FEEDBACK_MAX_LENGTH,
    );
    if (feedbackError) {
      return feedbackError;
    }

    if (!Number.isInteger(answer.health_change)) {
      return `${prefix}: health_change måste vara ett heltal`;
    }
  }

  return null;
}

module.exports = {
  SCENARIO_MAX_LENGTH,
  TEXT_MAX_LENGTH,
  ANSWER_TEXT_MAX_LENGTH,
  FEEDBACK_MAX_LENGTH,
  ANSWER_COUNT,
  validateQuestion,
};
