// src/axios-config.js
import axios from 'axios';

// Créer une instance d'Axios avec une URL de base (modifiez-la selon votre configuration)
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000'
});

// Ajouter un intercepteur de requête pour inclure le token d'authentification dans le header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;