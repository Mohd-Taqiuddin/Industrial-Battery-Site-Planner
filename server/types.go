package main

// --- CONFIGURATION ---
const (
	DATA_FILE     = "/data/sessions.json"
	MAX_BODY_SIZE = 1024 * 1024 // 1MB Limit
)

// --- TYPES ---
type DeviceType string

const (
	MegapackXL  DeviceType = "MegapackXL"
	Megapack2   DeviceType = "Megapack2"
	Megapack    DeviceType = "Megapack"
	PowerPack   DeviceType = "PowerPack"
	Transformer DeviceType = "Transformer"
)

// Request Payload
type LayoutRequest struct {
	ID      string             `json:"id,omitempty"`
	Configs map[DeviceType]int `json:"configs"`
}

// Session Object
type Session struct {
	ID       string             `json:"id"`
	Config   map[DeviceType]int `json:"config"`
	Date     string             `json:"date"`
	Summary  string             `json:"summary"`
	UnixTime int64              `json:"unix_time"`
}

// --- NEW: RESPONSE STRUCTURES ---

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

type LayoutResponse struct {
	PlacedDevices     []PlacedDevice `json:"placed_devices"`
	TotalWidth        int            `json:"total_width"`
	TotalHeight       int            `json:"total_height"`
	TotalCost         int            `json:"total_cost"`
	TotalEnergy       int            `json:"total_energy"`
	TransformersCount int            `json:"transformers_count"`
}