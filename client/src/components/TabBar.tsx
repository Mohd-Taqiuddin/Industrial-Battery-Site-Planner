import React, { useState } from 'react';
import { type LayoutTab } from '../hooks/useSiteLayout';

interface Props {
  tabs: LayoutTab[];
  activeId: number;
  onSwitch: (id: number) => void;
  onAdd: () => void;
  onClose: (id: number) => void;
  onRename: (id: number, newTitle: string) => void;
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px', marginBottom: '0', overflowX: 'auto' }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        const isEditing = tab.id === editingId;

        return (
          <div 
            className="tab-scroll-container"
            key={tab.id}
            onClick={() => !isEditing && onSwitch(tab.id)}
            onDoubleClick={() => startEditing(tab.id, tab.title)}
            title="Double-click to rename"
            style={{
              padding: '8px 10px',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              background: isActive ? 'var(--bg-panel)' : 'var(--bg-app)',
              border: '1px solid var(--border)',
              borderBottom: isActive ? '1px solid var(--bg-panel)' : '1px solid var(--border)',
              marginBottom: '-1px', 
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              minWidth: '110px',
              maxWidth: '180px',
              justifyContent: 'space-between',
              position: 'relative',
              userSelect: 'none',
              transition: 'background 0.1s',
              zIndex: isActive ? 10 : 1,
              overflowY: 'auto'
            }}
          >
            {/* TAB TITLE / INPUT */}
            {isEditing ? (
              <input 
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', fontSize: '0.8rem', padding: '2px', 
                  border: '1px solid var(--accent)', borderRadius: '2px', outline: 'none'
                }}
              />
            ) : (
              <span style={{
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                flex: 1 // Push X to the right
              }}>
                {tab.title}
              </span>
            )}

            {/* INTEGRATED CLOSE BUTTON (X) */}
            {!isEditing && tabs.length > 1 && (
              <span 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onClose(tab.id); 
                }}
                className="close-tab-btn"
                style={{ 
                  fontSize: '14px', 
                  lineHeight: 1, 
                  opacity: 0.5, 
                  padding: '2px',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px'
                }}
                title="Close Tab"
              >
                ×
              </span>
            )}
          </div>
        );
      })}
      
      {/* ADD TAB BUTTON */}
      <button 
        onClick={onAdd}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '18px', fontWeight: 'bold', color: 'var(--text-muted)',
          padding: '0 8px', display: 'flex', alignItems: 'center'
        }}
        title="Add new Layout Tab"
      >
        +
      </button>
    </div>
  );
};