import { useState, useEffect, useCallback } from 'react';
import { 
  type DeviceType, 
  type LayoutTab, 
  type SessionSummary, 
  type LayoutResponse 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const DEFAULT_CONFIG: Record<DeviceType, number> = { 
  MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0 
};

// KEYS FOR LOCAL STORAGE
const STORAGE_KEY = 'tesla-layout-tabs';
const ID_KEY = 'tesla-active-tab-id';

export function useSiteLayout() {
  // STATE INITIALIZATION (Load from LocalStorage)
  const [tabs, setTabs] = useState<LayoutTab[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    // Default fallback if storage is empty
    return [{ 
      id: 1, 
      name: 'Design 1', 
      config: { ...DEFAULT_CONFIG }, 
      layout: null,
      serverId: undefined 
    }];
  });

  const [activeTabId, setActiveTabId] = useState<number>(() => {
    const saved = localStorage.getItem(ID_KEY);
    return saved ? parseInt(saved) : 1;
  });

  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const config = activeTab.config;
  const layout = activeTab.layout; 

  // AUTO-SAVE EFFECT - Save to LocalStorage whenever tabs or activeTabId changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem(ID_KEY, activeTabId.toString());
  }, [tabs, activeTabId]);

  // FETCH LAYOUT
  const fetchLayout = useCallback(async () => {
    const totalItems = Object.values(config).reduce((sum, val) => sum + val, 0);

    if (totalItems === 0) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, layout: null } : t));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
      });
      
      if (res.ok) {
        const data: LayoutResponse = await res.json();
        setTabs(prev => prev.map(t => 
          t.id === activeTabId ? { ...t, layout: data } : t
        ));
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  }, [config, activeTabId]);

  useEffect(() => {
    const timer = setTimeout(fetchLayout, 300);
    return () => clearTimeout(timer);
  }, [fetchLayout]);

  // TAB MANAGEMENT
  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { 
      id: newId, 
      name: `Design ${newId}`, 
      config: { ...DEFAULT_CONFIG }, 
      layout: null,
      serverId: undefined 
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  const renameTab = (id: number, newName: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  // --- 5. CONFIG LOGIC ---
  const updateConfigLogic = (type: DeviceType, val: number) => {
    const safeVal = Math.max(0, val);
    const tempConfig = { ...config, [type]: safeVal };

    let totalBatteries = 0;
    (Object.keys(tempConfig) as DeviceType[]).forEach(k => {
      if (k !== 'Transformer') totalBatteries += tempConfig[k];
    });
    
    const requiredTransformers = Math.floor(totalBatteries / 2);
    
    if (type === 'Transformer' && safeVal < requiredTransformers) return;
    if (type !== 'Transformer') tempConfig.Transformer = requiredTransformers;

    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, config: tempConfig } : t
    ));
  };

  const updateConfig = (type: DeviceType, delta: number) => 
    updateConfigLogic(type, (config[type] || 0) + delta);

  const setDeviceCount = (type: DeviceType, value: number) => 
    updateConfigLogic(type, value);

  // CLEAR ALL DEVICES
  const clearAllDevices = () => {
    setTabs(prev => prev.map(tab => {
      if (tab.id !== activeTabId) return tab;
      return { 
        ...tab, 
        config: { MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0 },
        layout: null
      };
    }));
  };

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } else {
        setSessions([]);
      }
    } catch (e) { 
      console.error(e);
      setSessions([]);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const saveSession = async (forceNew: boolean = false): Promise<string | null> => {
    try {
      const idToSend = (activeTab.serverId && !forceNew) ? activeTab.serverId : "";
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idToSend, configs: config }),
      });
      
      const data = await res.json();
      const savedId = data.id;

      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, serverId: savedId, name: `Saved (${savedId})` } : t
      ));

      await fetchSessions();
      return savedId;
    } catch (err) { 
      console.error(err);
      return null; 
    }
  };

  const loadSession = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/load?id=${id}`);
      if (res.ok) {
        const loadedConfig: Record<DeviceType, number> = await res.json();
        setTabs(prev => prev.map(t => 
          t.id === activeTabId ? { ...t, config: loadedConfig, serverId: id, name: `Saved (${id})` } : t
        ));
        return true;
      }
      return false;
    } catch (err) { 
      console.error(err);
      return false;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await fetch(`${API_URL}/delete?id=${id}`, { method: 'DELETE' });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  return { 
    tabs, 
    activeTabId, 
    config, 
    layout, 
    sessions,
    setActiveTabId, 
    addTab, 
    closeTab, 
    renameTab, 
    updateConfig, 
    setDeviceCount, 
    saveSession, 
    loadSession, 
    deleteSession,
    clearAllDevices
  };
}