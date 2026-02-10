import React, { useState } from 'react';
import { type LayoutTab } from '../hooks/useSiteLayout';

interface Props {
  tabs: LayoutTab[];
  activeId: number;
  onSwitch: (id: number) => void;
  onAdd: () => void;
  onClose: (id: number) => void;
  onRename: (id: number, newTitle: string) => void; // <--- NEW PROP
}

export const TabBar: React.FC<Props> = ({ tabs, activeId, onSwitch, onAdd, onClose, onRename }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const saveEdit = () => {
    if (editingId !== null && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px', marginBottom: '8px', overflowX: 'auto' }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        const isEditing = tab.id === editingId;

        return (
          <div 
            key={tab.id}
            onClick={() => !isEditing && onSwitch(tab.id)}
            onDoubleClick={() => startEditing(tab.id, tab.title)} // <--- DOUBLE CLICK TRIGGER
            title="Double-click to rename"
            style={{
              padding: '6px 12px',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              background: isActive ? 'var(--bg-panel)' : 'var(--bg-app)',
              border: '1px solid var(--border)',
              borderBottom: isActive ? '1px solid var(--bg-panel)' : '1px solid var(--border)',
              marginBottom: '-1px', 
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              minWidth: '100px',
              justifyContent: 'space-between',
              position: 'relative',
              userSelect: 'none'
            }}
          >
            {isEditing ? (
              <input 
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                style={{
                  width: '80px', fontSize: '0.75rem', padding: '2px', 
                  border: '1px solid var(--accent)', borderRadius: '2px', outline: 'none'
                }}
              />
            ) : (
              <span style={{whiteSpace: 'nowrap'}}>{tab.title}</span>
            )}

            {/* Close Button (Only show if not editing and more than 1 tab) */}
            {!isEditing && tabs.length > 1 && (
              <span 
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                style={{ fontSize: '14px', lineHeight: 0.5, opacity: 0.6, padding: '2px', marginLeft: '5px' }}
              >×</span>
            )}
          </div>
        );
      })}
      
      <button 
        onClick={onAdd}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)',
          padding: '0 8px'
        }}
        title="Add new Layout Tab"
      >
        +
      </button>
    </div>
  );
};