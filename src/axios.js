import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
// Origin without the /api/v1 suffix — used to resolve relative /storage/... image paths
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = false
axios.defaults.headers.common['Accept'] = 'application/json'

// Restore token from localStorage on page load
const token = localStorage.getItem('auth_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Backend returns image paths like "/storage/products/foo.jpg" (relative to
// the Laravel app, not the API prefix). This turns them into absolute URLs
// the <img> tag can load, and leaves already-absolute URLs untouched.
export function resolveImageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}

export default axios
