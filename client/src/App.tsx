import { useState, useEffect } from 'react';
import './App.css';
import { useSiteLayout } from './hooks/useSiteLayout';
import { Navbar } from './components/Navbar';
import { ConfigPanel } from './components/ConfigPanel';
import { StatsPanel } from './components/StatsPanel';
import { LayoutPreview } from './components/LayoutPreview';

export default function App() {
  // Destructure all the logic hooks
  const { 
    tabs, activeTabId, setActiveTabId, addTab, closeTab, renameTab, // Tab Logic
    config, layout, updateConfig, setDeviceCount, 
    saveSession, loadSession, deleteSession, sessions 
  } = useSiteLayout();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Export CSV
  const handleExport = () => {
    if (!layout) return;
    const headers = "ID,Type,X (ft),Y (ft),Width (ft),Height (ft)\n";
    const rows = layout.placed_devices.map(d => 
      `${d.id},${d.type},${d.position.x},${d.position.y},${d.width},${d.height}`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "tesla_site_layout.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="dashboard-grid">
        {/* Left Panel: Configuration & Tabs */}
        <ConfigPanel 
          // Tab Props
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={setActiveTabId}
          onAddTab={addTab}
          onCloseTab={closeTab}
          onRenameTab={renameTab} // Pass the rename function

          // Config Props
          config={config} 
          onUpdate={updateConfig} 
          onSetCount={setDeviceCount} 
          
          // Action Props
          onExport={handleExport} 
          onSave={saveSession}
          onLoad={loadSession}
          onDelete={deleteSession}
          sessions={sessions}
        />
        
        {/* Middle Panel: Visual Blueprint */}
        <LayoutPreview 
          devices={layout?.placed_devices || []} 
          totalWidth={layout?.total_width || 100}
          totalHeight={layout?.total_height || 100}
        />

        {/* Right Panel: Metrics & BoM */}
        <StatsPanel layout={layout} config={config} />
      </div>
    </div>
  );
}