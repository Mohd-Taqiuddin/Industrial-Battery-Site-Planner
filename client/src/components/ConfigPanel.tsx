import React, { useState } from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';
import { type SavedSession, type LayoutTab } from '../hooks/useSiteLayout';
import { DeviceInputRow } from './DeviceInputRow';
import { SessionManager } from './SessionManager';
import { TabBar } from './TabBar';
import { SaveModal } from './SaveModal'; // <--- Import Modal

interface ConfigPanelProps {
  tabs: LayoutTab[];
  activeTabId: number;
  onSwitchTab: (id: number) => void;
  onAddTab: () => void;
  onCloseTab: (id: number) => void;
  onRenameTab: (id: number, title: string) => void; // <--- Rename Prop

  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
  onSetCount: (type: DeviceType, value: number) => void;
  
  onExport: () => void;
  onSave: (forceNew?: boolean) => Promise<string | null>;
  onLoad: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  sessions: SavedSession[];
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  tabs, activeTabId, onSwitchTab, onAddTab, onCloseTab, onRenameTab,
  config, onUpdate, onSetCount, onExport, onSave, onLoad, onDelete, sessions 
}) => {
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handlePrint = () => window.print();

  // RESET Logic
  // const handleNewLayout = () => {
  //   Object.keys(DEVICE_SPECS).forEach(key => onSetCount(key as DeviceType, 0));
  // };

  // SAVE CLICK Logic
  const handleSaveClick = async () => {
    // If it's a new unsaved design, just save it (creates new ID)
    if (!activeTab?.serverId) {
      return await onSave(true); // <--- RETURN THE ID
    } else {
      // If it has an ID, ask the user what to do
      setShowSaveModal(true);
      return null; // <--- RETURN NULL (Action deferred to modal)
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <TabBar 
        tabs={tabs} 
        activeId={activeTabId} 
        onSwitch={onSwitchTab} 
        onAdd={onAddTab} 
        onClose={onCloseTab}
        onRename={onRenameTab} // <--- Pass Rename
      />

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

          <SessionManager 
            sessions={sessions}
            onSave={handleSaveClick} // <--- Intercept Save Click
            onLoad={onLoad}
            onDelete={onDelete}
            onNew={onAddTab}
          />
        </div>
        
        <div className="print-hide" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <button onClick={onExport} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>Export CSV</button>
          <button onClick={handlePrint} style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Print Report</button>
        </div>
      </div>

      {/* POPUP MODAL */}
      <SaveModal 
        isOpen={showSaveModal}
        currentId={activeTab?.serverId || ""}
        onClose={() => setShowSaveModal(false)}
        onOverwrite={() => {
          onSave(false); // Update existing
          setShowSaveModal(false);
        }}
        onSaveNew={() => {
          onSave(true); // Create new ID
          setShowSaveModal(false);
        }}
      />
    </div>
  );
};