import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || '/api' // Use environment variable or default to '/api' 
  // environment variable name to add in env file: VITE_API_BASE_URL=http://localhost:5000/api
})

export default api