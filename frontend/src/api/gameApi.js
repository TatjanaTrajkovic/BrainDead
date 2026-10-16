const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(data?.error || 'Något gick fel mot servern');
    err.status = response.status;
    throw err;
  }
  return data;
}

// forceNew: true pausar en pågående omgång och startar en ny (se README, POST /api/sessions)
export function startSession(forceNew = false) {
  return request('/sessions', {
    method: 'POST',
    body: JSON.stringify({ forceNew }),
  });
}

// Hämtar pågående omgång. Backend svarar 404 om ingen finns, då kastar request() ett fel.
export function getActiveSession() {
  return request('/sessions/active');
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

export function getSession(sessionId) {
  return request(`/sessions/${sessionId}`);
}

export function getHighScores() {
  return request('/highscores');
}
