import { AlertType, AlertStatus, AlertPriority } from '../types';

export const alertTypeLabels: Record<AlertType, string> = {
  medical: 'Urgence Médicale',
  fire: 'Incendie',
  accident: 'Accident',
  violence: 'Violence',
  flood: 'Inondation',
  other: 'Autre',
};

export const alertTypeIcons: Record<AlertType, string> = {
  medical: '🏥',
  fire: '🔥',
  accident: '🚗',
  violence: '⚠️',
  flood: '🌊',
  other: '🆘',
};

export const alertTypeColors: Record<AlertType, string> = {
  medical: '#ef4444',
  fire: '#ea580c',
  accident: '#d97706',
  violence: '#7c3aed',
  flood: '#0096C7',
  other: '#64748b',
};

export const statusLabels: Record<AlertStatus, string> = {
  pending: 'En attente',
  assigned: 'Assignée',
  in_progress: 'En cours',
  resolved: 'Résolue',
  cancelled: 'Annulée',
};

export const statusColors: Record<AlertStatus, string> = {
  pending: '#d97706',
  assigned: '#0077B6',
  in_progress: '#0096C7',
  resolved: '#10b981',
  cancelled: '#94a3b8',
};

export const priorityLabels: Record<AlertPriority, string> = {
  low: 'Faible',
  medium: 'Modérée',
  high: 'Élevée',
  critical: 'Critique',
};

export const priorityColors: Record<AlertPriority, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ea580c',
  critical: '#ef4444',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}
