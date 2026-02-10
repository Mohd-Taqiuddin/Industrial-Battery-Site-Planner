import React from 'react';
import type { DeviceType } from '../types';

interface Props {
  devices: Array<{ id: string; type: DeviceType; width: number; height: number; position: { x: number; y: number } }>;
  totalWidth: number;
  totalHeight: number;
}

export const LayoutPreview: React.FC<Props> = ({ devices, totalWidth, totalHeight }) => (
  <div className="panel">
    <div className="panel-header">
      Site Preview <span style={{float:'right', opacity: 0.7}}>Max Width: 100ft</span>
    </div>
    <div className="viz-container">
      <div style={{ 
        position: 'relative', 
        width: `${totalWidth * 5}px`, 
        height: `${Math.max(totalHeight, 100) * 5}px`,
        margin: '20px'
      }}>
        {devices?.map((d) => (
          <div
            key={d.id}
            className={`device-node bg-${d.type}`}
            style={{
              left: `${d.position.x * 5}px`,
              top: `${d.position.y * 5}px`,
              width: `${d.width * 5}px`,
              height: `${d.height * 5}px`,
            }}
          >
            {d.type === 'Transformer' ? 'T' : ''}
          </div>
        ))}
      </div>
    </div>
  </div>
);