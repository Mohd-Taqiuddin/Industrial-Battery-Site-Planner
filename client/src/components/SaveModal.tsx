import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOverwrite: () => void;
  onSaveNew: () => void;
  currentId: string | null;
}

export const SaveModal: React.FC<Props> = ({ isOpen, onClose, onOverwrite, onSaveNew, currentId }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Save Configuration</h3>
        <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
          You are editing an existing saved layout <strong>({currentId})</strong>.
        </p>
        <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
          Do you want to update the existing save, or create a new copy?
        </p>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onSaveNew}>Save as New</button>
          <button className="btn-primary" onClick={onOverwrite}>Overwrite</button>
        </div>
        <div style={{textAlign: 'center', marginTop: '10px'}}>
             <span onClick={onClose} style={{fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', color: 'var(--text-muted)'}}>Cancel</span>
        </div>
      </div>
    </div>
  );
};