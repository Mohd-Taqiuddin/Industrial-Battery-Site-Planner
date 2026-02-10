package main

type DeviceType string

const (
	MegapackXL  DeviceType = "MegapackXL"
	Megapack2   DeviceType = "Megapack2"
	Megapack    DeviceType = "Megapack"
	PowerPack   DeviceType = "PowerPack"
	Transformer DeviceType = "Transformer"
)

type DeviceDef struct {
	Name   DeviceType
	Width  int
	Height int
	Energy float64
	Cost   int
}

// Global Spec Registry
var DeviceSpecs = map[DeviceType]DeviceDef{
	MegapackXL:  {Name: MegapackXL, Width: 40, Height: 10, Energy: 4.0, Cost: 120000},
	Megapack2:   {Name: Megapack2, Width: 30, Height: 10, Energy: 3.0, Cost: 80000},
	Megapack:    {Name: Megapack, Width: 30, Height: 10, Energy: 2.0, Cost: 50000},
	PowerPack:   {Name: PowerPack, Width: 10, Height: 10, Energy: 1.0, Cost: 10000},
	Transformer: {Name: Transformer, Width: 10, Height: 10, Energy: -0.5, Cost: 10000},
}

// API DTOs
type CalculateRequest struct {
	Configs map[DeviceType]int `json:"configs"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type PlacedDevice struct {
	ID       string     `json:"id"`
	Type     DeviceType `json:"type"`
	Width    int        `json:"width"`
	Height   int        `json:"height"`
	Position Position   `json:"position"`
}

type SiteLayout struct {
	PlacedDevices []PlacedDevice `json:"placed_devices"`
	TotalWidth    int            `json:"total_width"`
	TotalHeight   int            `json:"total_height"`
	TotalCost     int            `json:"total_cost"`
	TotalEnergy   float64        `json:"total_energy"`
	Transformers  int            `json:"transformers_count"`
}