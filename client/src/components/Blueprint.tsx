import React from 'react';
import { type LayoutResponse } from '../types';

interface BlueprintProps {
  layout: LayoutResponse | null;
}

export const Blueprint: React.FC<BlueprintProps> = ({ layout }) => {
  if (!layout) {
    return (
      <div className="blueprint-empty">
        <p>No configuration set. Add batteries to see the site layout.</p>
      </div>
    );
  }

  // Scale factor to convert 'feet' to 'pixels' for the UI
  const SCALE = 8; 

  return (
    <div 
      className="blueprint-grid" 
      style={{ 
        width: `${layout.total_width * SCALE}px`, 
        height: `${layout.total_height * SCALE}px`,
        position: 'relative',
        border: '2px solid var(--border)',
        background: 'var(--bg-app)',
        margin: '20px auto'
      }}
    >
      {layout.placed_devices.map((dev) => (
        <div
          key={dev.id}
          className={`placed-device ${dev.type}`}
          title={`${dev.type}: ${dev.width}x${dev.height}ft`}
          style={{
            position: 'absolute',
            left: dev.position.x * SCALE,
            top: dev.position.y * SCALE,
            width: dev.width * SCALE,
            height: dev.height * SCALE,
            backgroundColor: dev.type === 'Transformer' ? '#ff9800' : '#2196f3',
            border: '1px solid white',
            fontSize: '10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {dev.type === 'Transformer' ? 'TR' : dev.type.replace('Megapack', 'MP')}
        </div>
      ))}
    </div>
  );
};