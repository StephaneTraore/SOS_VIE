import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status: number | undefined = err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      localStorage.removeItem('sos_token');
      localStorage.removeItem('sos_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    let message: string;
    if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
      message = data.message;
    } else if (data && typeof data === 'object' && Array.isArray((data as any).errors) && (data as any).errors[0]?.msg) {
      message = (data as any).errors[0].msg;
    } else if (!err.response) {
      message = err.code === 'ECONNABORTED'
        ? 'Délai d\'attente dépassé — réessayez.'
        : 'Serveur injoignable — vérifiez votre connexion Internet.';
    } else if (status === 400) {
      message = 'Données invalides — vérifiez votre saisie.';
    } else if (status === 401) {
      message = 'Session expirée — reconnectez-vous.';
    } else if (status === 403) {
      message = 'Accès refusé — vous n\'avez pas les droits nécessaires.';
    } else if (status === 404) {
      message = 'Ressource introuvable.';
    } else if (status === 409) {
      message = 'Conflit — cette ressource existe déjà.';
    } else if (status === 422) {
      message = 'Données invalides.';
    } else if (status === 429) {
      message = 'Trop de tentatives — patientez quelques instants.';
    } else if (status && status >= 500) {
      message = 'Erreur serveur — veuillez réessayer plus tard.';
    } else {
      message = 'Une erreur est survenue. Réessayez.';
    }

    const normalized: any = new Error(message);
    normalized.status = status;
    normalized.data = data;
    return Promise.reject(normalized);
  }
);

export default api;
