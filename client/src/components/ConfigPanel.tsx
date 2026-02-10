import React, { useState } from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';
import { type SavedSession } from '../hooks/useSiteLayout'; // Import type

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

  const handlePrint = () => window.print();

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave();
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="panel compact">
      <div className="panel-header">Configuration</div>
      <div className="panel-content">
        {/* INPUTS */}
        {Object.keys(DEVICE_SPECS).map((key) => {
          const type = key as DeviceType;
          const spec = DEVICE_SPECS[type];
          return (
            <div key={type} className="config-row">
              <div>
                <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{spec.name}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{spec.width}x{spec.height}ft • {spec.energy}MWh</div>
                {type === 'Transformer' && <div style={{fontSize: '0.65rem', color: 'var(--accent)', marginTop: '2px'}}>*Auto-adds 1 per 2 batts</div>}
              </div>
              <div className="stepper">
                <button onClick={() => onUpdate(type, -1)}>−</button>
                <input 
                  type="number" value={config[type].toString()} 
                  onChange={(e) => onSetCount(type, parseInt(e.target.value) || 0)}
                  style={{width: '50px', border: 'none', textAlign: 'center', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none'}}
                />
                <button onClick={() => onUpdate(type, 1)}>+</button>
              </div>
            </div>
          );
        })}

        {/* --- NEW SAVED SESSIONS UI --- */}
        <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border)'}}>
           <div className="panel-header" style={{padding: '0 0 10px 0', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <span>Saved Layouts</span>
             <button 
               onClick={handleSaveClick} 
               disabled={isSaving}
               style={{
                 padding: '4px 10px', cursor: 'pointer', background: 'var(--accent)', 
                 color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
               }}
             >
               {isSaving ? "Saving..." : "+ Save Current"}
             </button>
           </div>

           {/* LIST OF SAVED ITEMS */}
           <div style={{maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px'}}>
             {sessions.length === 0 && (
               <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px'}}>
                 No saved layouts yet.
               </div>
             )}
             
             {sessions.map(session => (
               <div key={session.id} style={{
                 background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px',
                 display: 'flex', justifyContent: 'space-between', alignItems: 'center'
               }}>
                 <div style={{cursor: 'pointer'}} onClick={() => onLoad(session.id)}>
                   <div style={{fontSize: '0.8rem', fontWeight: 600}}>{session.date}</div>
                   <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{session.summary} • ID: {session.id}</div>
                 </div>
                 <button 
                    onClick={() => onDelete(session.id)}
                    style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '0 5px'}}
                    title="Delete"
                 >
                   ✕
                 </button>
               </div>
             ))}
           </div>

           {/* Manual Restore (Hidden behind details/accordion style, or just small input) */}
           <div style={{marginTop: '15px', display: 'flex', gap: '5px', alignItems: 'center'}}>
             <input 
               placeholder="Or enter ID manually..."
               value={manualId}
               onChange={(e) => setManualId(e.target.value)}
               style={{flex: 1, padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.7rem', background: 'transparent', color: 'var(--text-main)'}}
             />
             <button onClick={() => onLoad(manualId)} style={{padding: '4px 8px', cursor: 'pointer', background: 'var(--accent)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.7rem'}}>Load</button>
           </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="print-hide" style={{padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px'}}>
        <button onClick={onExport} style={{flex: 1, padding: '8px', cursor: 'pointer', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600}}>Export CSV</button>
        <button onClick={handlePrint} style={{flex: 1, padding: '8px', cursor: 'pointer', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600}}>Print</button>
      </div>
    </div>
  );
};