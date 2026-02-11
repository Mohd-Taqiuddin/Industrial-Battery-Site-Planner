import React from 'react';
import { type SessionSummary } from '../types';

interface SessionManagerProps {
  sessions: SessionSummary[];
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onSave, onLoad, onDelete, onNew }) => {
  return (
    <div className="session-manager" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Saved Layouts</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px', 
          margin: '20px 0',
          padding: '15px'
        }}>
          <button 
            onClick={onNew} 
            className="action-btn secondary"
          >
            + New 
          </button>

          <button 
            onClick={onSave} 
            className="action-btn primary"
          >
            Save 
          </button>
        </div>
      </div>

      <div className="session-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {(!sessions || sessions.length === 0) && (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
            No saved layouts.
          </div>
        )}
        
        {sessions?.map(s => (
          <div key={s.id} className="session-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-app)', marginBottom: '5px', borderRadius: '4px', alignItems: 'center' }}>
            <div onClick={() => onLoad(s.id)} style={{ cursor: 'pointer', flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{s.date}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.summary}</div>
            </div>
            <button onClick={() => onDelete(s.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
};