import React from 'react';
import { type DeviceType } from '../types';

interface Props {
  devices: Array<{ id: string; type: DeviceType; width: number; height: number; position: { x: number; y: number } }>;
  totalWidth: number;
  totalHeight: number;
}

export const LayoutPreview: React.FC<Props> = ({ devices, totalWidth, totalHeight }) => {
  // Increased scale for better visibility and print-friendliness
  const PIXELS_PER_FT = 7; 
  
  const vizWidth = totalWidth * PIXELS_PER_FT;
  const vizHeight = Math.max(totalHeight, 100) * PIXELS_PER_FT;

  // Generate ticks for rulers (every 20ft)
  const xTicks = [];
  for (let i = 0; i <= totalWidth; i += 20) xTicks.push(i);

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
          
          <div style={{ 
            position: 'relative', 
            margin: 'auto', 
            padding: '40px', 
            display: 'inline-block' 
          }}>
            
            {/* X-AXIS RULER */}
            <div className="ruler-x" style={{ 
              width: `${vizWidth}px`, 
              height: '25px',
              position: 'absolute', 
              top: 15, 
              left: 40, 
              display: 'flex'
            }}>
              {xTicks.map(tick => (
                <div key={tick} style={{ 
                  position: 'absolute', 
                  left: `${tick * PIXELS_PER_FT}px`, 
                  transform: 'translateX(-50%)',
                  fontSize: '10px', fontWeight: 600
                }}>
                  {tick}'
                  <div className="ruler-tick" style={{height: '5px', width: '1px', margin: 'auto'}}></div>
                </div>
              ))}
            </div>

            {/* Y-AXIS RULER */}
            <div className="ruler-y" style={{ 
              height: `${vizHeight}px`, 
              width: '25px',
              position: 'absolute', 
              top: 40, 
              left: 15,
            }}>
              {yTicks.map(tick => (
                <div key={tick} style={{ 
                  position: 'absolute', 
                  top: `${tick * PIXELS_PER_FT}px`, 
                  width: '100%', 
                  textAlign: 'right', 
                  paddingRight: '4px',
                  transform: 'translateY(-50%)',
                  fontSize: '10px', fontWeight: 600
                }}>
                  {tick}
                  <div className="ruler-tick" style={{width: '5px', height: '1px', float: 'right', marginTop: '6px'}}></div>
                </div>
              ))}
            </div>

            {/* MAIN DRAWING BLUEPRINT */}
            <div style={{ 
              position: 'relative', 
              width: `${vizWidth}px`, 
              height: `${vizHeight}px`,
              background: 'var(--blueprint-bg)', 
              border: '1px solid var(--blueprint-border)', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)', // Softer shadow for cleaner look
              
              // FIX 1: Professional Engineering Grid Pattern
              backgroundImage: `
                linear-gradient(var(--blueprint-grid) 1px, transparent 1px), 
                linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px)
              `,
              backgroundSize: `${10 * PIXELS_PER_FT}px ${10 * PIXELS_PER_FT}px`, // 10ft Grid squares
            }}>
              
              {/* Optional: Major Grid Lines (Every 50ft) for texture */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
                `,
                backgroundSize: `${50 * PIXELS_PER_FT}px ${50 * PIXELS_PER_FT}px`
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
                    // Ensure flex centering is explicit here so the icon sits in the middle
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={`${d.type}\nDim: ${d.width}x${d.height}ft`}
                >
                  {/* LOGIC: IF Transformer -> Show Bolt. ELSE -> Show Text if wide enough */}
                  {d.type === 'Transformer' ? (
                    <span style={{ 
                      fontSize: '14px', 
                      lineHeight: 1,
                      color: 'white',
                      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' // Makes the bolt pop
                    }}>
                      ⚡
                    </span>
                  ) : (
                    d.width >= 10 && (
                      <span style={{ fontSize: d.width < 20 ? '9px' : '11px' }}>
                        {d.type === 'MegapackXL' ? 'MXL' : 
                        d.type === 'Megapack2' ? 'MP2' : 
                        d.type === 'PowerPack' ? 'PP' : 'MP'}
                      </span>
                    )
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