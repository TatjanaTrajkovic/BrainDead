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

function validateQuestion(question) {
  if (typeof question !== 'object' || question === null) {
    return 'Fråga saknas';
  }
  if (typeof question.scenario !== 'string' || question.scenario.trim().length === 0) {
    return 'Scenariot saknas';
  }
  if (typeof question.feedback !== 'string' || question.feedback.trim().length === 0) {
    return 'Feedback saknas';
  }
  if (typeof question.text !== 'string' || question.text.trim().length === 0) {
    return 'Text saknas';
  }
  if (!Array.isArray(question.answers)) {
    return 'Svar saknas';
  }
  if (question.answers.length !== ANSWER_COUNT) {
    return 'Fel antal svar';
  }
  if (question.scenario.length > SCENARIO_MAX_LENGTH) {
    return `Scenariot får max vara ${SCENARIO_MAX_LENGTH} tecken`;
  }
  if (question.scenario.length < SCENARIO_MIN_LENGTH) {
    return `Scenariot måste vara minst ${SCENARIO_MIN_LENGTH} tecken`;
  }
  if (question.text.length > TEXT_MAX_LENGTH) {
    return `Texten får max vara ${TEXT_MAX_LENGTH} tecken`;
  }
  if (question.text.length < TEXT_MIN_LENGTH) {
    return `Texten måste vara minst ${TEXT_MIN_LENGTH} tecken`;
  }
  if (answer.text.length > ANSWER_TEXT_MAX_LENGTH) {
    return `Svaret får maximalt vara ${ANSWER_TEXT_MAX_LENGTH} tecken`;
  }
  if (answer.text.length < ANSWER_TEXT_MIN_LENGTH) {
    return `Svaret måste vara minst ${ANSWER_TEXT_MIN_LENGTH} tecken`;
  }
  if (answer.feedback.length > FEEDBACK_MAX_LENGTH) {
    return `Feedback får maximalt vara ${FEEDBACK_MAX_LENGTH} tecken`;
  }
  if (answer.feedback.length < FEEDBACK_MIN_LENGTH) {
    return `Feedback måste vara minst ${FEEDBACK_MIN_LENGTH} tecken`;
  }
  if (!Number.isInteger(answer.health_change)) {
    return 'Fel format på hjärnkapaciteten';
  }

  return null;
}

function checkText(value, label, min, max) {
  if (typeof value !== 'string || value.trim().length === 0') {
    return `${label} saknas`;
  }
  const length = value.trim().length;
}
