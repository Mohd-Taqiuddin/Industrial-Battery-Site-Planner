import { useState, useEffect, useCallback } from 'react';
import { type DeviceType } from '../types';

interface LayoutResponse {
  placed_devices: any[];
  total_width: number;
  total_height: number;
  total_cost: number;
  total_energy: number;
  transformers_count: number;
}

// Simple structure for our history list
export interface SavedSession {
  id: string;
  date: string;
  summary: string; // e.g. "50 Batteries"
}

const API_URL = "http://localhost:8080/api";

export function useSiteLayout() {
  const [config, setConfig] = useState<Record<DeviceType, number>>({
    MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0,
  });

  const [layout, setLayout] = useState<LayoutResponse | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  // Load Config & Session History on Mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('tesla-site-config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const savedHistory = localStorage.getItem('tesla-site-history');
    if (savedHistory) setSessions(JSON.parse(savedHistory));
  }, []);

  // --- SAVE LOGIC (Updated) ---
  const saveSession = async (): Promise<string | null> => {
    try {
      // 1. Save to Server
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
      });
      const data = await res.json();
      const newId = data.id;

      // 2. Create Session Record
      const totalItems = Object.values(config).reduce((a, b) => a + b, 0);
      const newSession: SavedSession = {
        id: newId,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        summary: `${totalItems} Devices`
      };

      // 3. Update Local History
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('tesla-site-history', JSON.stringify(updatedSessions));

      return newId;
    } catch (err) {
      console.error("Save failed", err);
      return null;
    }
  };

  // --- LOAD LOGIC ---
  const loadSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/load?id=${sessionId}`);
      if (!res.ok) return false;
      
      const loadedConfig = await res.json();
      setConfig(loadedConfig); // Updates state
      return true;
    } catch (err) {
      console.error("Load failed", err);
      return false;
    }
  };

  // --- DELETE LOGIC (Local only) ---
  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('tesla-site-history', JSON.stringify(updated));
  }

  // --- VALIDATION LOGIC (Existing) ---
  const validateAndSetConfig = (type: DeviceType, newValue: number, currentConfig: Record<DeviceType, number>) => {
    const safeValue = Math.max(0, newValue);
    const tempConfig = { ...currentConfig, [type]: safeValue };

    let totalBatteries = 0;
    (Object.keys(tempConfig) as DeviceType[]).forEach(key => {
      if (key !== 'Transformer') totalBatteries += tempConfig[key];
    });

    const minTransformers = Math.floor(totalBatteries / 2);

    if (type === 'Transformer') {
      if (safeValue < minTransformers) return currentConfig;
    } else {
      tempConfig.Transformer = minTransformers;
    }

    localStorage.setItem('tesla-site-config', JSON.stringify(tempConfig));
    return tempConfig;
  };

  const updateConfig = (type: DeviceType, delta: number) => {
    setConfig(prev => validateAndSetConfig(type, (prev[type] || 0) + delta, prev));
  };

  const setDeviceCount = (type: DeviceType, value: number) => {
    setConfig(prev => validateAndSetConfig(type, value, prev));
  };

  const fetchLayout = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
      });
      const data = await res.json();
      setLayout(data);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  useEffect(() => {
    const timer = setTimeout(fetchLayout, 300);
    return () => clearTimeout(timer);
  }, [fetchLayout]);

  return { config, layout, updateConfig, setDeviceCount, saveSession, loadSession, deleteSession, sessions };
}