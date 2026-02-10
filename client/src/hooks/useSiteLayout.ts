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

export interface SavedSession {
  id: string;
  date: string;
  summary: string;
}

const API_URL = "http://localhost:8080/api";

export function useSiteLayout() {
  const [config, setConfig] = useState<Record<DeviceType, number>>({
    MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0,
  });

  const [layout, setLayout] = useState<LayoutResponse | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  // 1. Initial Load: Get Config AND Session List from Server
  useEffect(() => {
    // Load local config (optional, keeps your current workspace)
    const savedConfig = localStorage.getItem('tesla-site-config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    // FETCH HISTORY FROM SERVER (Fixes the cache clear issue)
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data); // The server is now the source of truth
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  // 2. Save Logic (Refreshes list after save)
  const saveSession = async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
      });
      const data = await res.json();
      
      // Refresh list from server to get the new item with server-generated date
      await fetchSessions();
      
      return data.id;
    } catch (err) {
      console.error("Save failed", err);
      return null;
    }
  };

  // 3. Load Logic
  const loadSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/load?id=${sessionId}`);
      if (!res.ok) return false;
      const loadedConfig = await res.json();
      setConfig(loadedConfig);
      return true;
    } catch (err) {
      return false;
    }
  };

  // 4. Delete Logic
  const deleteSession = async (id: string) => {
    try {
        await fetch(`${API_URL}/delete?id=${id}`, { method: 'DELETE' });
        await fetchSessions(); // Refresh list
    } catch (err) {
        console.error(err);
    }
  };

  // --- CONFIG HELPERS ---
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