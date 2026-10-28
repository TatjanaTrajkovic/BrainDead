import { request } from './request';

export function getQuestions() {
  return request('/admin/questions');
}
