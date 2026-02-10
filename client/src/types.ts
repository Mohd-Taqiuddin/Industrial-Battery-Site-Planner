export type DeviceType = "MegapackXL" | "Megapack2" | "Megapack" | "PowerPack" | "Transformer";

export interface DeviceSpec {
  name: string;
  width: number;
  height: number;
  energy: number;
  cost: number;
}

export const DEVICE_SPECS: Record<DeviceType, DeviceSpec> = {
  MegapackXL: { name: "MegapackXL", width: 40, height: 10, energy: 4, cost: 120000 },
  Megapack2: { name: "Megapack2", width: 30, height: 10, energy: 3, cost: 80000 },
  Megapack: { name: "Megapack", width: 30, height: 10, energy: 2, cost: 50000 },
  PowerPack: { name: "PowerPack", width: 10, height: 10, energy: 1, cost: 10000 },
  Transformer: { name: "Transformer", width: 10, height: 10, energy: -0.5, cost: 10000 },
};