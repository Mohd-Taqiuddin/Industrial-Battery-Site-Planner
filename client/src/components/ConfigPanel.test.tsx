import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfigPanel } from './ConfigPanel';
import type { DeviceType, LayoutTab } from '../types';

const createDefaultProps = () => {
  const defaultConfig: Record<DeviceType, number> = {
    MegapackXL: 0,
    Megapack2: 0,
    Megapack: 0,
    PowerPack: 0,
    Transformer: 0,
  };

  const defaultTab: LayoutTab = {
    id: 1,
    name: 'Design 1',
    config: defaultConfig,
    layout: null,
    serverId: undefined,
  };

  return {
    tabs: [defaultTab],
    activeTabId: 1,
    onSwitchTab: vi.fn(),
    onAddTab: vi.fn(),
    onCloseTab: vi.fn(),
    onRenameTab: vi.fn(),
    config: defaultConfig,
    onUpdate: vi.fn(),
    onSetCount: vi.fn(),
    onExport: vi.fn(),
    onSave: vi.fn().mockResolvedValue('test-id'),
    onLoad: vi.fn().mockResolvedValue(true),
    onDelete: vi.fn(),
    sessions: [],
    onClear: vi.fn(), 
  };
};

describe('ConfigPanel Component', () => {

  it('renders all device inputs', () => {
    const props = createDefaultProps();
    render(<ConfigPanel {...props} />);
    
    // Check for specific labels to be sure
    expect(screen.getByText('Megapack XL')).toBeInTheDocument();
    expect(screen.getByText('Transformer')).toBeInTheDocument();
  });

  it('calls onUpdate when + button is clicked', () => {
    const props = createDefaultProps();
    render(<ConfigPanel {...props} />);

    // Targeting the specific "+" button for MegapackXL
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[1]);

    expect(props.onUpdate).toHaveBeenCalledWith('MegapackXL', 1);
  });

  it('calls onSetCount when typing a number', () => {
    const props = createDefaultProps();
    render(<ConfigPanel {...props} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } });

    expect(props.onSetCount).toHaveBeenCalledWith('MegapackXL', 5);
  });

  it('triggers onSave when Save button is clicked', async () => {
    const props = createDefaultProps();
    render(<ConfigPanel {...props} />);

    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(props.onSave).toHaveBeenCalled();
  });

  it('displays the correct session name in the tab', () => {
    const props = createDefaultProps();
    // Override the name for this specific test
    props.tabs[0].name = "Project Alpha";
    render(<ConfigPanel {...props} />);

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const props = createDefaultProps();
    render(<ConfigPanel {...props} />);

    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
  });
});