import { useState, useEffect } from 'react';
import './App.css';
import { useSiteLayout } from './hooks/useSiteLayout';
import { Navbar } from './components/Navbar';
import { ConfigPanel } from './components/ConfigPanel';
import { StatsPanel } from './components/StatsPanel';
import { LayoutPreview } from './components/LayoutPreview';

export default function App() {
  const { config, layout, updateConfig } = useSiteLayout();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // CSV Export Logic
  const handleExport = () => {
    if (!layout) return;

    const headers = "ID,Type,X (ft),Y (ft),Width (ft),Height (ft)\n";
    const rows = layout.placed_devices.map(d => 
      `${d.id},${d.type},${d.position.x},${d.position.y},${d.width},${d.height}`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tesla_site_layout.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="dashboard-grid">
        {/* Pass handleExport to ConfigPanel */}
        <ConfigPanel 
          config={config} 
          onUpdate={updateConfig} 
          onExport={handleExport} 
        />
        
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