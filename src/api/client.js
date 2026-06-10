import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — har bir so'rovga token qo'shadi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — 401 bo'lsa token yangilaydi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login:    (data) => api.post('/auth/login/', data),
  logout:   (data) => api.post('/auth/logout/', data),
  profile:  ()     => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
}

// ── Restaurants ───────────────────────────────────
export const restaurantAPI = {
  list:   (params) => api.get('/restaurants/', { params }),
  detail: (id)     => api.get(`/restaurants/${id}/`),
  create: (data)   => api.post('/restaurants/', data),
  update: (id, data) => api.patch(`/restaurants/${id}/`, data),
  delete: (id)     => api.delete(`/restaurants/${id}/`),
  tables: (id, params) => api.get(`/restaurants/${id}/tables/`, { params }),
  myRestaurants: () => api.get('/restaurants/my-restaurants/'),
}

// ── Tables ────────────────────────────────────────
export const tableAPI = {
  list:   (params) => api.get('/tables/', { params }),
  create: (data)   => api.post('/tables/', data),
  update: (id, data) => api.patch(`/tables/${id}/`, data),
  delete: (id)     => api.delete(`/tables/${id}/`),
}

// ── Reservations ──────────────────────────────────
export const reservationAPI = {
  list:    (params) => api.get('/reservations/', { params }),
  create:  (data)   => api.post('/reservations/', data),
  detail:  (id)     => api.get(`/reservations/${id}/`),
  cancel:  (id)     => api.post(`/reservations/${id}/cancel/`),
  confirm: (id)     => api.post(`/reservations/${id}/confirm/`),
}

export default api
