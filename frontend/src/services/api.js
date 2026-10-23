import axios from 'axios';

// Instancia base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición: inyecta el token JWT real desde localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: procesa y unifica los errores del backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Error inesperado del servidor';

    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.request) {
      message = 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    } else if (error.message) {
      message = error.message;
    }

    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizada');
      localStorage.removeItem('token');
    }

    const customError = new Error(message);
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }
);

export default api;
