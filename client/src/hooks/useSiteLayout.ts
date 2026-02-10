import { useState, useEffect, useCallback } from 'react';
import type { DeviceType } from '../types';

interface LayoutResponse {
  placed_devices: Array<{
    id: string;
    type: DeviceType;
    width: number;
    height: number;
    position: { x: number; y: number };
  }>;
  total_width: number;
  total_height: number;
  total_cost: number;
  total_energy: number;
  transformers_count: number;
}

const API_URL = "http://localhost:8080/api/calculate";

export function useSiteLayout() {
  const [config, setConfig] = useState<Record<DeviceType, number>>({
    MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0,
  });
  const [layout, setLayout] = useState<LayoutResponse | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('tesla-site-config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const updateConfig = (type: DeviceType, delta: number) => {
    setConfig(prev => {
      const newVal = Math.max(0, (prev[type] || 0) + delta);
      const newConfig = { ...prev, [type]: newVal };
      localStorage.setItem('tesla-site-config', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const fetchLayout = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
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

  // Debounce
  useEffect(() => {
    const timer = setTimeout(fetchLayout, 300);
    return () => clearTimeout(timer);
  }, [fetchLayout]);

  return { config, layout, updateConfig };
}