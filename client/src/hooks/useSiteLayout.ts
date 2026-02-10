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

const API_URL = "http://localhost:8080/api/calculate";

export function useSiteLayout() {
  const [config, setConfig] = useState<Record<DeviceType, number>>({
    MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0,
  });

  const [layout, setLayout] = useState<LayoutResponse | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tesla-site-config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  // --- FIXED VALIDATION LOGIC ---
  const validateAndSetConfig = (type: DeviceType, newValue: number, currentConfig: Record<DeviceType, number>) => {
    const safeValue = Math.max(0, newValue);
    
    // Create a temporary config with the NEW value applied
    const tempConfig = { ...currentConfig, [type]: safeValue };

    // 1. Calculate Total Batteries based on this NEW state
    let totalBatteries = 0;
    (Object.keys(tempConfig) as DeviceType[]).forEach(key => {
      if (key !== 'Transformer') {
        totalBatteries += tempConfig[key];
      }
    });

    // 2. Calculate the STRICT Minimum Required
    const minTransformers = Math.floor(totalBatteries / 2);

    // 3. APPLY LOGIC BASED ON WHAT CHANGED
    if (type === 'Transformer') {
      // CASE A: User is manually adjusting Transformers
      // Allow change ONLY if it meets the minimum
      if (safeValue < minTransformers) {
        return currentConfig; // Block the change (undo)
      }
      // Otherwise, accept the manual override (e.g., user wants 5 but only needs 2)
    } else {
      // CASE B: User changed a Battery (Added or Removed)
      // STRICT SYNC: Force Transformers to match the new requirement exactly.
      // This fixes the bug: Removing batteries now instantly drops transformers.
      tempConfig.Transformer = minTransformers;
    }

    // 4. Save & Return
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

  useEffect(() => {
    const timer = setTimeout(fetchLayout, 300);
    return () => clearTimeout(timer);
  }, [fetchLayout]);

  return { config, layout, updateConfig, setDeviceCount };
}