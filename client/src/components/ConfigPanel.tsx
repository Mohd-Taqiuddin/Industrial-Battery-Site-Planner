
import React, { useState } from 'react';
import { type DeviceType, DEVICE_SPECS, type SessionSummary, type LayoutTab } from '../types';
import { DeviceInputRow } from './DeviceInputRow';
import { SessionManager } from './SessionManager';
import { TabBar } from './TabBar';
import { SaveModal } from './SaveModal';

export interface ConfigPanelProps {
  // TABS
  tabs: LayoutTab[];
  activeTabId: number;
  onSwitchTab: (id: number) => void;
  onAddTab: () => void;
  onCloseTab: (id: number, e: React.MouseEvent) => void;
  onRenameTab: (id: number, name: string) => void;

  // CONFIG
  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
  onSetCount: (type: DeviceType, value: number) => void;
  
  // ACTIONS
  onExport: () => void;
  onSave: (forceNew?: boolean) => Promise<string | null>;
  onLoad: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  
  // SESSIONS
  sessions: SessionSummary[];
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  tabs, activeTabId, onSwitchTab, onAddTab, onCloseTab, onRenameTab,
  config, onUpdate, onSetCount, onExport, onSave, onLoad, onDelete, sessions 
}) => {
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handlePrint = () => window.print();

  const handleSaveClick = async () => {
    // If it's a new unsaved design (no serverId), just save it.
    if (!activeTab?.serverId) {
      await onSave(true); 
    } else {
      // If it has an ID, ask the user: "Overwrite or New?"
      setShowSaveModal(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 1. TAB BAR */}
      <TabBar 
        tabs={tabs} 
        activeId={activeTabId} 
        onSwitch={onSwitchTab} 
        onAdd={onAddTab} 
        onClose={onCloseTab}
        onRename={onRenameTab}
      />

      <div className="panel compact" style={{ borderTopLeftRadius: 0, flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}>
        <div className="panel-header" style={{ padding: '10px 15px', fontWeight: 'bold', borderBottom: '1px solid var(--border)' }}>
          Configuration
        </div>
        
        <div className="panel-content" style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
          
          {/* 2. DEVICE INPUTS */}
          {Object.keys(DEVICE_SPECS).map((key) => (
            <DeviceInputRow 
              key={key}
              type={key as DeviceType}
              count={config[key as DeviceType]}
              onUpdate={onUpdate}
              onSetCount={onSetCount}
            />
          ))}

          {/* 3. SESSION MANAGER */}
          <SessionManager 
            sessions={sessions}
            onSave={handleSaveClick}
            onLoad={onLoad}
            onDelete={onDelete}
            onNew={onAddTab}
          />
        </div>
        
        {/* 4. BOTTOM ACTIONS */}
        <div className="print-hide" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--bg-panel)' }}>
          <button onClick={onExport} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>
            Export CSV
          </button>
          <button onClick={handlePrint} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
            Print Report
          </button>
        </div>
      </div>

      {/* 5. MODAL (Pop-up) */}
      <SaveModal 
        isOpen={showSaveModal}
        currentId={activeTab?.serverId || ""}
        onClose={() => setShowSaveModal(false)}
        onOverwrite={() => {
          onSave(false);
          setShowSaveModal(false);
        }}
        onSaveNew={() => {
          onSave(true);
          setShowSaveModal(false);
        }}
      />
    </div>
  );
};