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
