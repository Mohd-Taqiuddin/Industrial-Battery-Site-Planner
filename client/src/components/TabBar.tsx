import React from 'react';
import { type LayoutTab } from '../hooks/useSiteLayout';

interface Props {
  tabs: LayoutTab[];
  activeId: number;
  onSwitch: (id: number) => void;
  onAdd: () => void;
  onClose: (id: number) => void;
}

export const TabBar: React.FC<Props> = ({ tabs, activeId, onSwitch, onAdd, onClose }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px', marginBottom: '8px', overflowX: 'auto' }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        return (
          <div 
            key={tab.id}
            onClick={() => onSwitch(tab.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              background: isActive ? 'var(--bg-panel)' : 'var(--bg-app)',
              border: '1px solid var(--border)',
              borderBottom: isActive ? '1px solid var(--bg-panel)' : '1px solid var(--border)',
              marginBottom: '-1px', // Merge with panel below
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              minWidth: '80px',
              justifyContent: 'space-between'
            }}
          >
            <span style={{whiteSpace: 'nowrap'}}>{tab.title}</span>
            {tabs.length > 1 && (
              <span 
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                style={{ fontSize: '14px', lineHeight: 0.5, opacity: 0.6, padding: '2px' }}
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