import React, { useState } from 'react';
import { type SavedSession } from '../hooks/useSiteLayout';

interface Props {
  sessions: SavedSession[];
  onSave: () => Promise<string | null>;
  onLoad: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export const SessionManager: React.FC<Props> = ({ sessions, onSave, onLoad, onDelete }) => {
  const [manualId, setManualId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

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
    setStatusMsg(success ? "Loaded!" : "Invalid ID");
    setTimeout(() => setStatusMsg(""), 2000);
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border)' }}>
      {/* Header */}
      <div className="panel-header" style={{ padding: '0 0 10px 0', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Saved Layouts</span>
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          style={{
            padding: '4px 10px', cursor: isSaving ? 'wait' : 'pointer',
            background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? "Saving..." : "+ Save Current"}
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {safeSessions.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
            No saved layouts found.
          </div>
        ) : (
          safeSessions.map(session => (
            session && session.id ? (
              <div key={session.id} style={{
                background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => onLoad(session.id)}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{session.date || "Unknown"}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{session.summary}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete?')) onDelete(session.id); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '0 8px' }}
                >
                  ×
                </button>
              </div>
            ) : null
          ))
        )}
      </div>

      {/* Manual Load */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '5px', alignItems: 'center' }}>
        <input
          placeholder="Or enter ID manually..."
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-main)' }}
        />
        <button onClick={handleLoadManual} style={{ padding: '6px 12px', cursor: 'pointer', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem' }}>
          Load
        </button>
      </div>

      {statusMsg && (
        <div style={{ fontSize: '0.75rem', color: statusMsg.includes("Error") ? '#ef4444' : 'var(--accent)', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
          {statusMsg}
        </div>
      )}
    </div>
  );
};