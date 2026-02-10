import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';

interface Props {
  type: DeviceType;
  count: number;
  onUpdate: (type: DeviceType, delta: number) => void;
  onSetCount: (type: DeviceType, value: number) => void;
}

export const DeviceInputRow: React.FC<Props> = ({ type, count, onUpdate, onSetCount }) => {
  const spec = DEVICE_SPECS[type];

  return (
    <div className="config-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px dashed var(--border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{spec.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {spec.width}x{spec.height}ft • {spec.energy}MWh
        </div>
        {type === 'Transformer' && (
          <div style={{ fontSize: '0.65rem', color: 'var(--accent)', marginTop: '2px' }}>
            *Auto-adds 1 per 2 Batteries
          </div>
        )}
      </div>

      <div className="stepper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-app)', padding: '4px', borderRadius: '6px' }}>
        <button onClick={() => onUpdate(type, -1)} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', background: 'var(--bg-panel)', borderRadius: '4px', cursor: 'pointer' }}>−</button>
        
        <input
          type="number"
          value={count.toString()}
          onChange={(e) => onSetCount(type, parseInt(e.target.value) || 0)}
          style={{
            width: '40px',
            border: 'none',
            textAlign: 'center',
            background: 'transparent',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        
        <button onClick={() => onUpdate(type, 1)} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', background: 'var(--bg-panel)', borderRadius: '4px', cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
};