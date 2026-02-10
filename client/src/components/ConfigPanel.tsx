import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';
import { type SavedSession } from '../hooks/useSiteLayout';
import { DeviceInputRow } from './DeviceInputRow';
import { SessionManager } from './SessionManager';

interface ConfigPanelProps {
  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
  onSetCount: (type: DeviceType, value: number) => void;
  onExport: () => void;
  onSave: () => Promise<string | null>;
  onLoad: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  sessions: SavedSession[];
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, onUpdate, onSetCount, onExport, onSave, onLoad, onDelete, sessions 
}) => {
  
  const handlePrint = () => window.print();

  return (
    <div className="panel compact">
      <div className="panel-header">Configuration</div>
      
      <div className="panel-content">
        {/* 1. Device Inputs */}
        {Object.keys(DEVICE_SPECS).map((key) => (
          <DeviceInputRow 
            key={key}
            type={key as DeviceType}
            count={config[key as DeviceType]}
            onUpdate={onUpdate}
            onSetCount={onSetCount}
          />
        ))}

        {/* 2. Session Manager */}
        <SessionManager 
          sessions={sessions}
          onSave={onSave}
          onLoad={onLoad}
          onDelete={onDelete}
        />
      </div>
      
      {/* 3. Footer Actions */}
      <div className="print-hide" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
        <button 
          onClick={onExport} 
          style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Export CSV
        </button>
        <button 
          onClick={handlePrint} 
          style={{ flex: 1, padding: '10px', cursor: 'pointer', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Print Report
        </button>
      </div>
    </div>
  );
};