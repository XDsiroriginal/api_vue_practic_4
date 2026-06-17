import { ref } from 'vue'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://lifestealer86.ru/api-shop',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('user_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function useApi() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (request) => {
    loading.value = true
    error.value = null
    data.value = null

    try {
      const response = await request()
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Произошла ошибка'
      console.error('API Error:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = (url, config = {}) => execute(() => apiClient.get(url, config))
  const post = (url, body, config = {}) => execute(() => apiClient.post(url, body, config))
  const put = (url, body, config = {}) => execute(() => apiClient.put(url, body, config))
  const del = (url, config = {}) => execute(() => apiClient.delete(url, config))

  return { data, loading, error, get, post, put, del }
}