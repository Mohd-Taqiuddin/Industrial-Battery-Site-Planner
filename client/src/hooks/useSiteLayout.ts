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

// NEW: Tab Definition
export interface LayoutTab {
  id: number;           // Local Tab ID (1, 2, 3)
  title: string;        // "Design 1"
  config: Record<DeviceType, number>;
  serverId: string | null; // "SAVE-1234" (if saved)
}

// USE ENVIRONMENT VARIABLE (Fallback to localhost for dev)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const DEFAULT_CONFIG = { MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0 };


export function useSiteLayout() {
  // State: List of Tabs
  const [tabs, setTabs] = useState<LayoutTab[]>([
    { id: 1, title: 'Design 1', config: { ...DEFAULT_CONFIG }, serverId: null }
  ]);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  
  // State: Visual Layout & Session History
  const [layout, setLayout] = useState<LayoutResponse | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  // Helper: Get Active Tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const config = activeTab.config;


  // --- FETCH LAYOUT ---
  const fetchLayout = useCallback(async () => {
    // 1. CALCULATE TOTAL ITEMS LOCALY
    let totalItems = 0;
    (Object.keys(config) as DeviceType[]).forEach(k => totalItems += config[k]);

    // 2. IF EMPTY, CLEAR LAYOUT IMMEDIATELY & RETURN
    if (totalItems === 0) {
      setLayout(null); // <--- This clears the blueprint!
      return;
    }

    // 3. OTHERWISE, CALL SERVER
    try {
      const res = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setLayout(data);
      } else {
        // If server validates error (e.g., negative numbers), keep old layout or handle error
        console.error("Server validation failed");
      }
    } catch (err) {
      console.error(err);
    }
  }, [config]);
  // --- TAB MANAGEMENT ---
  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { 
      id: newId, 
      title: `Design ${newId}`, 
      config: { ...DEFAULT_CONFIG }, 
      serverId: null 
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: number) => {
    if (tabs.length === 1) return; // Don't close last tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  const updateActiveTabConfig = (newConfig: Record<DeviceType, number>) => {
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, config: newConfig } : t
    ));
  };

  const renameTab = (id: number, newTitle: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  // --- LOAD HISTORY ---
  useEffect(() => { fetchSessions(); }, []);
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
  };

  // --- SAVE LOGIC (Update vs Create) ---
  const saveSession = async (forceNew: boolean = false): Promise<string | null> => {
    try {
      // Determine ID to send: if we have a serverId and !forceNew, use it.
      const idToSend = (activeTab.serverId && !forceNew) ? activeTab.serverId : "";

      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: idToSend, // Backend will update if this exists
          configs: config 
        }),
      });
      
      const data = await res.json();
      const savedId = data.id;

      // Update Tab State: It is now "Saved"
      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, serverId: savedId, title: `Saved (${savedId})` } : t
      ));

      await fetchSessions(); // Refresh history list
      return savedId;
    } catch (err) { return null; }
  };

  // --- LOAD LOGIC ---
  const loadSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/load?id=${sessionId}`);
      if (!res.ok) return false;
      const loadedConfig = await res.json();
      
      // Load into ACTIVE tab
      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, config: loadedConfig, serverId: sessionId, title: `Saved (${sessionId})` } : t
      ));
      return true;
    } catch (err) { return false; }
  };

  // --- CONFIG VALIDATION (Standard) ---
  const validateAndSetConfig = (type: DeviceType, newValue: number) => {
    const safeValue = Math.max(0, newValue);
    const tempConfig = { ...config, [type]: safeValue };

    let totalBatteries = 0;
    (Object.keys(tempConfig) as DeviceType[]).forEach(key => {
      if (key !== 'Transformer') totalBatteries += tempConfig[key];
    });
    const minTransformers = Math.floor(totalBatteries / 2);

    if (type === 'Transformer' && safeValue < minTransformers) return;
    if (type !== 'Transformer') tempConfig.Transformer = minTransformers;

    updateActiveTabConfig(tempConfig);
  };

  const updateConfig = (type: DeviceType, delta: number) => validateAndSetConfig(type, (config[type] || 0) + delta);
  const setDeviceCount = (type: DeviceType, value: number) => validateAndSetConfig(type, value);

  // --- FETCH LAYOUT ---
  // const fetchLayout = useCallback(async () => {
  //   try {
  //     const res = await fetch(`${API_URL}/calculate`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ configs: config }),
  //     });
  //     setLayout(await res.json());
  //   } catch (err) { console.error(err); }
  // }, [config]);

  useEffect(() => {
    const timer = setTimeout(fetchLayout, 300);
    return () => clearTimeout(timer);
  }, [fetchLayout]);

  return { 
    tabs, activeTabId, setActiveTabId, addTab, closeTab, renameTab, // Tab Exports
    config, layout, updateConfig, setDeviceCount, 
    saveSession, loadSession, deleteSession: async (id: string) => { 
        await fetch(`${API_URL}/delete?id=${id}`, { method: 'DELETE' }); 
        fetchSessions(); 
    }, 
    sessions 
  };
}