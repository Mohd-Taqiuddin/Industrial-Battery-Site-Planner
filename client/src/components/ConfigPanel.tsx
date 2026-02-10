import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';

interface ConfigPanelProps {
  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
  onExport: () => void; // New Prop
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onUpdate, onExport }) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="panel compact">
      <div className="panel-header">Configuration</div>
      <div className="panel-content">
        {Object.keys(DEVICE_SPECS).map((key) => {
          const type = key as DeviceType;
          const spec = DEVICE_SPECS[type];
          
          return (
            <div key={type} className="config-row">
              <div>
                <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{spec.name}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                  {spec.width}x{spec.height}ft • {spec.energy}MWh
                </div>
                {type === 'Transformer' && (
                  <div style={{fontSize: '0.65rem', color: 'var(--accent)', marginTop: '2px'}}>
                    *Min 1 per 2 Batteries
                  </div>
                )}
              </div>
              
              <div className="stepper">
                <button onClick={() => onUpdate(type, -1)}>−</button>
                <span>{config[type]}</span>
                <button onClick={() => onUpdate(type, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION BUTTONS (Hidden on Print) */}
      <div className="print-hide" style={{
        padding: '1rem', 
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        gap: '10px'
      }}>
        <button 
          onClick={onExport}
          style={{
            flex: 1, padding: '8px', cursor: 'pointer',
            background: 'var(--bg-app)', border: '1px solid var(--border)', 
            borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600
          }}
        >
          Export CSV
        </button>
        <button 
          onClick={handlePrint}
          style={{
            flex: 1, padding: '8px', cursor: 'pointer',
            background: 'var(--accent)', border: 'none', 
            borderRadius: '6px', color: 'white', fontWeight: 600
          }}
        >
          Print
        </button>
      </div>
    </div>
  );
};