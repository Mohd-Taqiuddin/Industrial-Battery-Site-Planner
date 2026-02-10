import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';

interface Props {
  config: Record<DeviceType, number>;
  onUpdate: (type: DeviceType, delta: number) => void;
}

export const ConfigPanel: React.FC<Props> = ({ config, onUpdate }) => (
  <div className="panel">
    <div className="panel-header">Configuration</div>
    <div className="panel-content">
      {Object.keys(DEVICE_SPECS).map((key) => {
        const type = key as DeviceType;
        const spec = DEVICE_SPECS[type];
        if (type === 'Transformer') return null;

        return (
          <div key={type} className="config-row">
            <div>
              <div style={{fontWeight: 600}}>{spec.name}</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                {spec.width}x{spec.height}ft • {spec.energy}MWh
              </div>
            </div>
            <div className="stepper">
              <button onClick={() => onUpdate(type, -1)}>-</button>
              <span>{config[type]}</span>
              <button onClick={() => onUpdate(type, 1)}>+</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);