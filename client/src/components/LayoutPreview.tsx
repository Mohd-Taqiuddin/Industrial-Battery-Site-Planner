import React from 'react';
import { type DeviceType } from '../types';

interface Props {
  devices: Array<{ id: string; type: DeviceType; width: number; height: number; position: { x: number; y: number } }>;
  totalWidth: number;
  totalHeight: number;
}

export const LayoutPreview: React.FC<Props> = ({ devices, totalWidth, totalHeight }) => {
  const PIXELS_PER_FT = 5;
  const vizWidth = totalWidth * PIXELS_PER_FT;
  const vizHeight = Math.max(totalHeight, 100) * PIXELS_PER_FT;

  // Generate ticks for rulers (every 20ft)
  const xTicks = [];
  for (let i = 0; i <= 100; i += 20) xTicks.push(i);

  const yTicks = [];
  for (let i = 0; i <= Math.max(totalHeight, 100); i += 20) yTicks.push(i);

  return (
    <div className="panel fill">
      <div className="panel-header" style={{ borderBottom: 'none' }}>
        Site Layout Blueprint
        <span style={{ fontSize: '0.7rem', opacity: 0.7, fontFamily: 'monospace' }}>Scale: 10ft grid</span>
      </div>

      <div className="viz-panel-content">
        <div className="viz-container">
          
          {/* CANVAS WRAPPER with Rulers */}
          <div style={{ position: 'relative', margin: 'auto', paddingLeft: '25px', paddingTop: '25px' }}>
            
            {/* X-AXIS RULER */}
            <div className="ruler-x" style={{ width: `${vizWidth}px`, position: 'absolute', top: 0, left: 25 }}>
              {xTicks.map(tick => (
                <div key={tick} style={{ 
                  position: 'absolute', 
                  left: `${tick * PIXELS_PER_FT}px`, 
                  transform: 'translateX(-50%)' 
                }}>
                  {tick}'
                  <div style={{height: '5px', width: '1px', background: '#ccc', margin: 'auto'}}></div>
                </div>
              ))}
            </div>

            {/* Y-AXIS RULER */}
            <div className="ruler-y" style={{ height: `${vizHeight}px`, position: 'absolute', top: 25, left: 0 }}>
              {yTicks.map(tick => (
                <div key={tick} style={{ 
                  position: 'absolute', 
                  top: `${tick * PIXELS_PER_FT}px`, 
                  width: '100%', 
                  textAlign: 'right', 
                  paddingRight: '2px',
                  transform: 'translateY(-50%)' 
                }}>
                  {tick}
                  <div style={{width: '5px', height: '1px', background: '#ccc', float: 'right'}}></div>
                </div>
              ))}
            </div>

            {/* MAIN DRAWING AREA */}
            <div style={{ 
              position: 'relative', 
              width: `${vizWidth}px`, 
              height: `${vizHeight}px`,
              background: 'white', // Blueprint Paper Color
              boxShadow: '0 0 20px rgba(0,0,0,0.05)', // Subtle elevation
              border: '1px solid #ddd'
            }}>
              
              {/* Grid Lines Overlay (Optional, enhances blueprint feel) */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>

              {devices.map((d) => (
                <div
                  key={d.id}
                  className={`device-node bg-${d.type}`}
                  style={{
                    left: `${d.position.x * PIXELS_PER_FT}px`,
                    top: `${d.position.y * PIXELS_PER_FT}px`,
                    width: `${d.width * PIXELS_PER_FT}px`,
                    height: `${d.height * PIXELS_PER_FT}px`,
                  }}
                  title={`${d.type}\nDim: ${d.width}ft x ${d.height}ft\nPos: (${d.position.x}, ${d.position.y})`}
                >
                  {/* Smart Labeling: Only show text if box is wide enough */}
                  {d.width >= 10 && d.type !== 'Transformer' && (
                     <span style={{ fontSize: d.width < 20 ? '8px' : '10px' }}>
                       {d.type === 'MegapackXL' ? 'MXL' : 
                        d.type === 'Megapack2' ? 'MP2' : 
                        d.type === 'PowerPack' ? 'PP' : 'MP'}
                     </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};