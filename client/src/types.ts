export type DeviceType = 'MegapackXL' | 'Megapack2' | 'Megapack' | 'PowerPack' | 'Transformer';

export const DEVICE_SPECS: Record<DeviceType, { name: string; width: number; height: number; cost: number; energy: number }> = {
  MegapackXL: { name: "Megapack XL", width: 40, height: 10, cost: 120000, energy: 4 },
  Megapack2:  { name: "Megapack 2",  width: 30, height: 10, cost: 80000,  energy: 3 },
  Megapack:   { name: "Megapack",    width: 30, height: 10, cost: 50000,  energy: 2 },
  PowerPack:  { name: "PowerPack",   width: 10, height: 10, cost: 20000,  energy: 1 },
  Transformer:{ name: "Transformer", width: 10, height: 10, cost: 10000,  energy: 0 },
};

// INTERFACE FOR API RESPONSE
export interface PlacedDevice {
  id: string;
  type: DeviceType;
  width: number;
  height: number;
  position: { x: number; y: number };
}

export interface LayoutResponse {
  placed_devices: PlacedDevice[];
  total_width: number;
  total_height: number;
  total_cost: number;
  total_energy: number;
  transformers_count: number;
}