import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor to extract clean error messages from the server responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred'
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message
      } else {
        message = `Request failed with status code ${error.response.status}`
      }
    } else if (error.request) {
      message = 'No response received from server. Please check your network connection.'
    } else {
      message = error.message
    }

    const customError = new Error(message)
    Object.defineProperty(customError, 'status', {
      value: error.response?.status,
      writable: true,
      enumerable: true,
      configurable: true,
    })

    return Promise.reject(customError)
  }
)

export default api
