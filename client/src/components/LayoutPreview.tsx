import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';

interface Props {
  devices: Array<{ id: string; type: DeviceType; width: number; height: number; position: { x: number; y: number } }>;
  totalWidth: number;
  totalHeight: number;
}

export const LayoutPreview: React.FC<Props> = ({ devices, totalWidth, totalHeight }) => (
  // CHANGED: Added 'fill' class (Should already be there, but verifying)
  <div className="panel fill">
    <div className="panel-header">
      Site Map
      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Constraint: ≤100ft Width</span>
    </div>

    <div className="legend">
      {Object.keys(DEVICE_SPECS).map(key => (
        <div key={key} className="legend-item">
          <span className={`dot bg-${key}`}></span>
          {key}
        </div>
      ))}
    </div>

    <div className="viz-panel-content">
      <div className="viz-container">
        <div style={{ 
          position: 'relative', 
          width: `${totalWidth * 5}px`, 
          height: `${Math.max(totalHeight, 100) * 5}px`,
          // Note: margin: auto is handled by flexbox in parent now
        }}>
          {devices.map((d) => (
            <div
              key={d.id}
              className={`device-node bg-${d.type}`}
              style={{
                left: `${d.position.x * 5}px`,
                top: `${d.position.y * 5}px`,
                width: `${d.width * 5}px`,
                height: `${d.height * 5}px`,
              }}
              title={`${d.type}: ${d.width}x${d.height}`}
            >
              {d.type === 'Transformer' ? 'T' : 
               d.type === 'MegapackXL' ? 'MXL' :
               d.type === 'Megapack2' ? 'M2' :
               d.type === 'Megapack' ? 'MP' :
               d.type === 'PowerPack' ? 'PP' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);