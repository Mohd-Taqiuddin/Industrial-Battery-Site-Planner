import React, { useState } from 'react';
import { type LayoutTab } from '../types';

interface TabBarProps {
  tabs: LayoutTab[];
  activeId: number;
  onSwitch: (id: number) => void;
  onAdd: () => void;
  onClose: (id: number, e: React.MouseEvent) => void;
  onRename: (id: number, name: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeId, onSwitch, onAdd, onClose, onRename }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = () => {
    if (editingId !== null) {
      onRename(editingId, editName);
      setEditingId(null);
    }
  };

  return (
    <div className="tab-bar" style={{ display: 'flex', overflowX: 'auto', background: 'transparent', padding: '5px 5px 0 5px', gap: '4px' }}>
      {tabs.map(tab => (
        <div 
          key={tab.id}
          onClick={() => onSwitch(tab.id)}
          className={`tab ${tab.id === activeId ? 'active' : ''}`}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            background: tab.id === activeId ? 'var(--bg-panel)' : 'transparent',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            border: tab.id === activeId ? '1px solid var(--border)' : 'none',
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '100px',
            color: tab.id === activeId ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: tab.id === activeId ? 600 : 400
          }}
        >
          {editingId === tab.id ? (
            <input 
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              style={{ width: '80px', padding: '2px' }}
            />
          ) : (
            <span onDoubleClick={() => startEdit(tab.id, tab.name)}>
              {tab.name}
            </span>
          )}
          
          <button 
            onClick={(e) => onClose(tab.id, e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2em', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      ))}
      <button onClick={onAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 10px', color: 'var(--text-muted)' }}>+</button>
    </div>
  );
};