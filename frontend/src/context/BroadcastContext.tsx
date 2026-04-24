import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Broadcast } from '../types';
import { broadcastService } from '../services/broadcastService';
import { useAuth } from './AuthContext';

interface BroadcastContextType {
  broadcasts: Broadcast[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export function BroadcastProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setBroadcasts([]); return; }
    setLoading(true);
    try {
      const list = await broadcastService.list();
      setBroadcasts(list);
    } catch {
      // keep old state silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll every 2 minutes while signed in
  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => { refresh().catch(() => {}); }, 120_000);
    return () => window.clearInterval(id);
  }, [user, refresh]);

  return (
    <BroadcastContext.Provider value={{ broadcasts, isLoading, refresh }}>
      {children}
    </BroadcastContext.Provider>
  );
}

export function useBroadcasts() {
  const ctx = useContext(BroadcastContext);
  if (!ctx) throw new Error('useBroadcasts must be inside BroadcastProvider');
  return ctx;
}
