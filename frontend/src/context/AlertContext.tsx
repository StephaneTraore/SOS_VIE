import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Alert, AlertStatus, AlertType, AlertPriority, ServiceType, User } from '../types';
import { alertService } from '../services/alertService';
import { useAuth } from './AuthContext';

interface CreateAlertData {
  type: AlertType;
  title: string;
  description: string;
  priority: AlertPriority;
  address: string;
  city: string;
  citizenId: string;
  citizenFirstName?: string;
  citizenLastName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  facilityId?: string;
}

interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  createAlert: (data: CreateAlertData) => Promise<Alert>;
  updateAlertStatus: (id: string, status: AlertStatus, notes?: string) => void;
  assignAlert: (alertId: string, responderId: string, responder?: User) => void;
  getMyAlerts: (userId: string) => Alert[];
  getActiveAlerts: () => Alert[];
  getAlertsByService: (service: ServiceType) => Alert[];
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = user.role === 'citizen'
        ? await alertService.getMy()
        : await alertService.getAll();
      setAlerts(data);
    } catch {
      // Backend not available — keep empty state silently
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (data: CreateAlertData): Promise<Alert> => {
    const alert = await alertService.create({
      type: data.type,
      title: data.title,
      description: data.description,
      priority: data.priority,
      address: data.address,
      city: data.city,
      facilityId: data.facilityId,
    });
    setAlerts(prev => [alert, ...prev]);
    return alert;
  }, []);

  const updateAlertStatus = useCallback((id: string, status: AlertStatus, notes?: string) => {
    const previous = alerts;
    // Optimistic update
    setAlerts(prev =>
      prev.map(a => a.id === id
        ? { ...a, status, notes: notes !== undefined ? notes : a.notes, updatedAt: new Date().toISOString() }
        : a)
    );
    alertService.updateStatus(id, status, notes)
      .then(updated => setAlerts(prev => prev.map(a => a.id === id ? updated : a)))
      .catch((err: any) => {
        setAlerts(previous);
        toast.error(err?.message || 'Impossible de mettre à jour le statut');
      });
  }, [alerts]);

  const assignAlert = useCallback((alertId: string, responderId: string, responder?: User) => {
    const previous = alerts;
    // Optimistic update
    setAlerts(prev =>
      prev.map(a => a.id === alertId
        ? { ...a, status: 'assigned' as AlertStatus, responder: responder ?? a.responder, updatedAt: new Date().toISOString() }
        : a)
    );
    alertService.assign(alertId, responderId)
      .then(updated => setAlerts(prev => prev.map(a => a.id === alertId ? updated : a)))
      .catch((err: any) => {
        setAlerts(previous);
        toast.error(err?.message || 'Impossible d\'assigner l\'alerte');
      });
  }, [alerts]);

  const getMyAlerts = useCallback((userId: string) =>
    alerts.filter(a => a.citizen.id === userId),
  [alerts]);

  const getActiveAlerts = useCallback(() =>
    alerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled'),
  [alerts]);

  const getAlertsByService = useCallback((service: ServiceType) =>
    alerts.filter(a => a.service === service),
  [alerts]);

  return (
    <AlertContext.Provider value={{
      alerts, isLoading,
      createAlert, updateAlertStatus, assignAlert,
      getMyAlerts, getActiveAlerts, getAlertsByService,
      refreshAlerts: fetchAlerts,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be inside AlertProvider');
  return ctx;
}
