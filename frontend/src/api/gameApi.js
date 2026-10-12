const BASE_URL = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Något gick fel mot servern');
  }
  return data;
}

export function startSession() {
  return request('/sessions', { method: 'POST' });
}

export function getNextQuestion(sessionId) {
  return request(`/sessions/${sessionId}/question`);
}

export function answerQuestion(sessionId, answerId) {
  return request(`/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answerId }),
  });
}
