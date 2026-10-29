import { request } from './request';

export function getQuestions() {
  return request('/admin/questions');
}

export function createQuestion(question) {
  return request('/admin/questions', { method: 'POST', body: JSON.stringify(question) });
}

export function updateQuestion(questionId, question) {
  return request(`/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(question),
  });
}

export function getUsers({ type, search } = {}) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (search) params.set('search', search);
  const query = params.toString();
  return request(`/admin/users${query ? `?${query}` : ''}`);
}

export function setQuestionStatus(questionId, status) {
  return request(`/admin/questions/${questionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Statistik per fråga: hur många gånger varje svar valts och antal dödsfall
export function getStats() {
  return request('/admin/stats');
}

// En spelares omgångar, nyast först, med answered_count och total_questions
export function getUserSessions(userId) {
  return request(`/admin/users/${userId}/sessions`);
}

// role: 'PLAYER' eller 'ADMIN'. Egen roll, gäst eller bannad ger 400
export function setUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// status: 'ACTIVE' (avbanna) eller 'BANNED'. Egen status, admin eller gäst ger 400
export function setUserStatus(userId, status) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}