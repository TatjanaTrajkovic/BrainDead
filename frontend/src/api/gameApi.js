import { request } from './request';

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

export function signup(username, password) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

//Nyckeln slutar gälla i backend, cookien tas bort.
export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

// Skapar en gästspelare, eller returnerar spelaren som redan finns om cookien är giltig
export function ensurePlayer() {
  return request('/auth/guest', { method: 'POST' });
}

// Hämtar spelaren som cookien hör till. Backend svarar 401 om det inte finns någon
export function getMe() {
  return request('/auth/me');
}
