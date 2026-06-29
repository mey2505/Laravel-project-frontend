import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000/api/v1'
axios.defaults.withCredentials = false
axios.defaults.headers.common['Accept'] = 'application/json'

// Restore token from localStorage on page load
const token = localStorage.getItem('auth_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default axios
