// Read the Vite environment variable; fall back to localhost API when missing
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export default API_BASE;