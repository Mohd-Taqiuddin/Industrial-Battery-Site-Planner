import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Import BOTH the Component and the Interface
import { ConfigPanel, type ConfigPanelProps } from './ConfigPanel'; 

// Define props using the exported interface
const defaultProps: ConfigPanelProps = {
  config: { MegapackXL: 0, Megapack2: 0, Megapack: 0, PowerPack: 0, Transformer: 0 },
  onUpdate: vi.fn(),
  onSetCount: vi.fn(),
  onExport: vi.fn(),
  onSave: vi.fn(),
  onLoad: vi.fn(),
  onDelete: vi.fn(),
  sessions: [],
  tabs: [],
  activeTabId: 1,
  onSwitchTab: vi.fn(),
  onAddTab: vi.fn(),
  onCloseTab: vi.fn(),
  onRenameTab: vi.fn(),
};

describe('ConfigPanel Component', () => {
  it('renders all device inputs', () => {
    // @ts-ignore - (Optional) If TS complains about missing specialized props, ignore for test
    render(<ConfigPanel {...defaultProps} />);
    expect(screen.getByText('Megapack XL')).toBeInTheDocument();
  });

  it('calls onUpdate when + button is clicked', () => {
    const onUpdateMock = vi.fn();
    // @ts-ignore
    render(<ConfigPanel {...defaultProps} onUpdate={onUpdateMock} />);
    
    // Find all "+" buttons
    const plusButtons = screen.getAllByText('+');
    // Click the first one
    fireEvent.click(plusButtons[1]);

    // Verify the mock was called
    expect(onUpdateMock).toHaveBeenCalled();
  });

  it('calls onSetCount when typing a number directly', () => {
    const onSetCountMock = vi.fn();
    // @ts-ignore
    render(<ConfigPanel {...defaultProps} onSetCount={onSetCountMock} />);

    // Find the input field for Megapack XL (it's the first number input)
    // We use 'spinbutton' role which maps to <input type="number" />
    const inputs = screen.getAllByRole('spinbutton');
    const xlInput = inputs[0];

    // Simulate user typing "5"
    fireEvent.change(xlInput, { target: { value: '5' } });

    // Verify it called the function with (Type, Value)
    expect(onSetCountMock).toHaveBeenCalledWith('MegapackXL', 5);
  });

  // Test 4: Save Button
  it('calls onSave when the Save button is clicked', () => {
    const onSaveMock = vi.fn();
    // @ts-ignore
    render(<ConfigPanel {...defaultProps} onSave={onSaveMock} />);

    // FIX: Look specifically for a BUTTON with the name "Save"
    // This ignores "Saved Layouts" text which is not a button
    const saveBtn = screen.getByRole('button', { name: 'Save' });

    fireEvent.click(saveBtn);

    expect(onSaveMock).toHaveBeenCalled();
  });
});