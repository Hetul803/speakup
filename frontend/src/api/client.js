import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 120000 })
api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(new Error(err.response?.data?.detail || err.message || 'Request failed'))
)

export const childrenAPI = {
  list: () => api.get('/children/'),
  get: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children/', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
  addNote: (id, note, category) => api.post(`/children/${id}/notes`, { child_id: id, note, category })
}

export const interactionsAPI = {
  predict: (data) => api.post('/interactions/predict', data),
  describeImage: (child_id, image_b64) => api.post('/interactions/describe-image', { child_id, image_b64 }),
  confirm: (interaction_id, confirmed_intent, was_correct) =>
    api.post('/interactions/confirm', { interaction_id, confirmed_intent, was_correct }),
  history: (child_id, limit = 20) => api.get(`/interactions/history/${child_id}?limit=${limit}`)
}

export const memoryAPI = {
  get: (child_id) => api.get(`/memory/${child_id}`),
  patterns: (child_id) => api.get(`/memory/${child_id}/patterns`)
}

export const dashboardAPI = { get: (child_id) => api.get(`/dashboard/${child_id}`) }

export const demoAPI = {
  seed: () => api.post('/demo/seed')
}

export default api
