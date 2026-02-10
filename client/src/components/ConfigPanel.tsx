import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';
import { type SavedSession, type LayoutTab } from '../hooks/useSiteLayout';
import { DeviceInputRow } from './DeviceInputRow';
import { SessionManager } from './SessionManager';
import { TabBar } from './TabBar';

interface ConfigPanelProps {
  // Tabs Props
  tabs: LayoutTab[];
  activeTabId: number;
  onSwitchTab: (id: number) => void;
  onAddTab: () => void;
  onCloseTab: (id: number) => void;

  // Config Props
  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
  onSetCount: (type: DeviceType, value: number) => void;
  
  // Actions
  onExport: () => void;
  onSave: (forceNew?: boolean) => Promise<string | null>; // Changed signature
  onLoad: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  sessions: SavedSession[];
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  tabs, activeTabId, onSwitchTab, onAddTab, onCloseTab,
  config, onUpdate, onSetCount, onExport, onSave, onLoad, onDelete, sessions 
}) => {
  
  const handlePrint = () => window.print();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 1. TAB BAR (Outside the panel box style) */}
      <TabBar 
        tabs={tabs} 
        activeId={activeTabId} 
        onSwitch={onSwitchTab} 
        onAdd={onAddTab} 
        onClose={onCloseTab} 
      />

      {/* 2. MAIN PANEL */}
      <div className="panel compact" style={{ borderTopLeftRadius: 0 }}>
        <div className="panel-header">Configuration</div>
        
        <div className="panel-content">
          {Object.keys(DEVICE_SPECS).map((key) => (
            <DeviceInputRow 
              key={key}
              type={key as DeviceType}
              count={config[key as DeviceType]}
              onUpdate={onUpdate}
              onSetCount={onSetCount}
            />
          ))}

          {/* Session Manager with Updated Save Logic */}
          <SessionManager 
            sessions={sessions}
            onSave={() => onSave(false)} // Default: Update Existing
            onLoad={onLoad}
            onDelete={onDelete}
            onNew={onAddTab} // New = Add Tab
          />

          {/* Explicit "Save Copy" Button (Optional, can be inside SessionManager too) */}
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            <button 
               onClick={() => onSave(true)} // Force New
               style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Save as new copy
            </button>
          </div>
        </div>
        
        <div className="print-hide" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <button onClick={onExport} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>Export CSV</button>
          <button onClick={handlePrint} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Print Report</button>
        </div>
      </div>
    </div>
  );
};