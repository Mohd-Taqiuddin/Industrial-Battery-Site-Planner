import React, { useState } from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';
import { type SavedSession } from '../hooks/useSiteLayout';

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
  
  const [manualId, setManualId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handlePrint = () => window.print();

  const handleSaveClick = async () => {
    setIsSaving(true);
    const id = await onSave();
    setIsSaving(false);
    
    if (id) {
      setStatusMsg("Saved!");
      setTimeout(() => setStatusMsg(""), 2000);
    } else {
      setStatusMsg("Error");
    }
  };

  const handleLoadManual = async () => {
    if (!manualId) return;
    const success = await onLoad(manualId);
    if (success) {
      setStatusMsg("Loaded!");
      setManualId("");
    } else {
      setStatusMsg("Invalid ID");
    }
    setTimeout(() => setStatusMsg(""), 2000);
  };

  // SAFETY: Ensure sessions is always an array to prevent crashes
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="panel compact">
      <div className="panel-header">Configuration</div>
      <div className="panel-content">
        
        {/* DEVICE CONFIGURATION INPUTS */}
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
                    *Auto-adds 1 per 2 Batteries
                  </div>
                )}
              </div>
              
              <div className="stepper">
                <button onClick={() => onUpdate(type, -1)}>−</button>
                <input 
                  type="number"
                  value={config[type].toString()}
                  onChange={(e) => onSetCount(type, parseInt(e.target.value) || 0)}
                  style={{
                    width: '50px',
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
                <button onClick={() => onUpdate(type, 1)}>+</button>
              </div>
            </div>
          );
        })}

        {/* SESSION MANAGER UI */}
        <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border)'}}>
           <div className="panel-header" style={{padding: '0 0 10px 0', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <span>Saved Layouts</span>
             <button 
               onClick={handleSaveClick} 
               disabled={isSaving}
               style={{
                 padding: '4px 10px', 
                 cursor: isSaving ? 'wait' : 'pointer', 
                 background: 'var(--accent)', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: '4px', 
                 fontSize: '0.75rem', 
                 fontWeight: 600,
                 opacity: isSaving ? 0.7 : 1
               }}
             >
               {isSaving ? "Saving..." : "+ Save Current"}
             </button>
           </div>

           {/* LIST OF SAVED SESSIONS */}
           <div style={{
             maxHeight: '180px', 
             overflowY: 'auto', 
             display: 'flex', 
             flexDirection: 'column', 
             gap: '8px',
             paddingRight: '4px' // Space for scrollbar
           }}>
             {safeSessions.length === 0 ? (
               <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px'}}>
                 No saved layouts found.
               </div>
             ) : (
               safeSessions.map(session => (
                 // CRITICAL: Check session validity before rendering
                 session && session.id ? (
                   <div key={session.id} style={{
                     background: 'var(--bg-app)', 
                     border: '1px solid var(--border)', 
                     borderRadius: '6px', 
                     padding: '8px',
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center',
                     transition: 'background 0.2s'
                   }}>
                     <div 
                       style={{cursor: 'pointer', flex: 1}} 
                       onClick={() => onLoad(session.id)}
                       title="Click to load this layout"
                     >
                       <div style={{fontSize: '0.8rem', fontWeight: 600}}>
                         {session.date || "Unknown Date"}
                       </div>
                       <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>
                         {session.summary || "No details"}
                       </div>
                       <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', opacity: 0.7}}>
                         ID: {session.id}
                       </div>
                     </div>
                     
                     <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent loading when clicking delete
                          if(window.confirm('Delete this saved layout?')) {
                            onDelete(session.id);
                          }
                        }}
                        style={{
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer', 
                          fontSize: '16px', 
                          padding: '0 8px',
                          lineHeight: 1
                        }}
                        title="Delete Session"
                     >
                       ×
                     </button>
                   </div>
                 ) : null
               ))
             )}
           </div>

           {/* MANUAL LOAD (Backup option) */}
           <div style={{marginTop: '15px', display: 'flex', gap: '5px', alignItems: 'center'}}>
             <input 
               placeholder="Or enter ID manually..."
               value={manualId}
               onChange={(e) => setManualId(e.target.value)}
               style={{
                 flex: 1, 
                 padding: '6px', 
                 borderRadius: '4px', 
                 border: '1px solid var(--border)', 
                 fontSize: '0.75rem', 
                 background: 'transparent', 
                 color: 'var(--text-main)'
               }}
             />
             <button 
               onClick={handleLoadManual} 
               style={{
                 padding: '6px 12px', 
                 cursor: 'pointer', 
                 background: 'var(--bg-panel)', 
                 border: '1px solid var(--border)', 
                 borderRadius: '4px', 
                 fontSize: '0.75rem'
               }}
             >
               Load
             </button>
           </div>
           
           {statusMsg && (
             <div style={{
               fontSize: '0.75rem', 
               color: statusMsg.includes("Error") ? '#ef4444' : 'var(--accent)', 
               marginTop: '8px', 
               textAlign: 'center', 
               fontWeight: 600
             }}>
               {statusMsg}
             </div>
           )}
        </div>
      </div>
      
      {/* FOOTER ACTION BUTTONS */}
      <div className="print-hide" style={{
        padding: '1rem', 
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        gap: '10px'
      }}>
        <button 
          onClick={onExport} 
          style={{
            flex: 1, 
            padding: '10px', 
            cursor: 'pointer', 
            background: 'var(--bg-app)', 
            border: '1px solid var(--border)', 
            borderRadius: '6px', 
            color: 'var(--text-main)', 
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Export CSV
        </button>
        <button 
          onClick={handlePrint} 
          style={{
            flex: 1, 
            padding: '10px', 
            cursor: 'pointer', 
            background: 'var(--accent)', 
            border: 'none', 
            borderRadius: '6px', 
            color: 'white', 
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Print Report
        </button>
      </div>
    </div>
  );
};