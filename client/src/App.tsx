import React, { useState, useEffect } from 'react';
import './App.css';
import { useSiteLayout } from './hooks/useSiteLayout';
import { Navbar } from './components/Navbar';
import { ConfigPanel } from './components/ConfigPanel';
import { StatsPanel } from './components/StatsPanel';
import { LayoutPreview } from './components/LayoutPreview';

export default function App() {
  const { config, layout, updateConfig } = useSiteLayout();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      <div className="dashboard-grid">
        <ConfigPanel config={config} onUpdate={updateConfig} />
        <LayoutPreview 
          devices={layout?.placed_devices || []} 
          totalWidth={layout?.total_width || 100}
          totalHeight={layout?.total_height || 100}
        />
        <StatsPanel layout={layout} config={config} />
      </div>
    </div>
  );
}