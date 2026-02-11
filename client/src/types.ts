export type DeviceType = 'MegapackXL' | 'Megapack2' | 'Megapack' | 'PowerPack' | 'Transformer';

// Device specs for the frontend (dimensions, cost, etc.)
export const DEVICE_SPECS: Record<DeviceType, { name: string; width: number; height: number; cost: number; energy: number }> = {
  MegapackXL: { name: "Megapack XL", width: 40, height: 10, cost: 120000, energy: 4 },
  Megapack2:  { name: "Megapack 2",  width: 30, height: 10, cost: 80000,  energy: 3 },
  Megapack:   { name: "Megapack",    width: 30, height: 10, cost: 50000,  energy: 2 },
  PowerPack:  { name: "PowerPack",   width: 10, height: 10, cost: 20000,  energy: 1 },
  Transformer:{ name: "Transformer", width: 10, height: 10, cost: 10000,  energy: 0 },
};

// --- API RESPONSE TYPES ---

export interface Position {
  x: number;
  y: number;
}

export interface PlacedDevice {
  id: string;
  type: DeviceType;
  width: number;
  height: number;
  position: Position;
}

export interface LayoutResponse {
  placed_devices: PlacedDevice[]; // Strict array, NO any[]
  total_width: number;
  total_height: number;
  total_cost: number;
  total_energy: number;
  transformers_count: number;
}

export interface LayoutTab {
  id: number;
  name: string;
  config: Record<DeviceType, number>;
  layout: LayoutResponse | null;
}

export interface SessionSummary {
  id: string;
  config: Record<DeviceType, number>;
  date: string;
  summary: string;
  unix_time: number;
}