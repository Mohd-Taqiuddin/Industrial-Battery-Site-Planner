package main

import (
	"fmt"
	"sort"
)

// --- SPECS ---
type DeviceSpec struct {
	Width  int
	Height int
	Cost   float64
	Energy float64
}

var Specs = map[DeviceType]DeviceSpec{
	MegapackXL:  {Width: 40, Height: 10, Cost: 120000, Energy: 4},
	Megapack2:   {Width: 30, Height: 10, Cost: 80000, Energy: 3},
	Megapack:    {Width: 30, Height: 10, Cost: 50000, Energy: 2},
	PowerPack:   {Width: 10, Height: 10, Cost: 10000, Energy: 1},
	Transformer: {Width: 10, Height: 10, Cost: 10000, Energy: -0.5},
}

// --- VALIDATION ---
func ValidateConfig(configs map[DeviceType]int) error {
	total := 0
	for k, v := range configs {
		if v < 0 {
			return fmt.Errorf("negative count for %s", k)
		}
		if v > 1000 {
			return fmt.Errorf("count for %s exceeds limit (1000)", k)
		}
		
		switch k {
		case MegapackXL, Megapack2, Megapack, PowerPack, Transformer:
			// OK
		default:
			return fmt.Errorf("unknown device type: %s", k)
		}
		total += v
	}
	if total == 0 {
		return fmt.Errorf("configuration is empty")
	}
	if total > 5000 {
		return fmt.Errorf("total devices exceed site limit (5000)")
	}
	return nil
}

// --- SMART LAYOUT ALGORITHM (First Fit Decreasing) ---
func GenerateLayout(config map[DeviceType]int) LayoutResponse {
	
	// 1. FLATTEN & PREPARE ITEMS
	type Item struct {
		ID   string
		Type DeviceType
		Spec DeviceSpec
	}
	var items []Item

	// Add Batteries
	count := 0
	for dType, qty := range config {
		if dType == Transformer { continue }
		spec := Specs[dType]
		for i := 0; i < qty; i++ {
			items = append(items, Item{
				ID: fmt.Sprintf("dev-%d", count),
				Type: dType, 
				Spec: spec,
			})
			count++
		}
	}

	// Add Transformers (1 per 2 batteries, or user override)
	reqTrans := count / 2
	if config[Transformer] > reqTrans { reqTrans = config[Transformer] }
	
	transSpec := Specs[Transformer]
	for i := 0; i < reqTrans; i++ {
		items = append(items, Item{
			ID: fmt.Sprintf("tr-%d", i),
			Type: Transformer, 
			Spec: transSpec,
		})
	}

	// 2. SORT ITEMS (Largest Width First)
	// This ensures big blocks are placed first, and small blocks backfill the gaps.
	sort.Slice(items, func(i, j int) bool {
		return items[i].Spec.Width > items[j].Spec.Width
	})

	// 3. PACKING LOGIC
	const MAX_WIDTH = 100
	const ROW_HEIGHT = 10 // Assuming all devices are 10ft tall for now
	
	var placedDevices []PlacedDevice
	var rows []int // Tracks used width for each row

	var totalCost float64 = 0
	var totalEnergy float64 = 0

	for _, item := range items {
		placed := false
		
		// Try to fit into an existing row (First Fit)
		for rIndex, usedWidth := range rows {
			if usedWidth + item.Spec.Width <= MAX_WIDTH {
				// Found a gap! Place it here.
				placedDevices = append(placedDevices, PlacedDevice{
					ID:     item.ID,
					Type:   item.Type,
					Width:  item.Spec.Width,
					Height: item.Spec.Height,
					Position: Position{
						X: usedWidth,      // Place after existing items
						Y: rIndex * ROW_HEIGHT,
					},
				})
				
				rows[rIndex] += item.Spec.Width // Update row usage
				placed = true
				break
			}
		}

		// If it didn't fit in any existing row, start a new one
		if !placed {
			newRowIndex := len(rows)
			placedDevices = append(placedDevices, PlacedDevice{
				ID:     item.ID,
				Type:   item.Type,
				Width:  item.Spec.Width,
				Height: item.Spec.Height,
				Position: Position{
					X: 0,
					Y: newRowIndex * ROW_HEIGHT,
				},
			})
			rows = append(rows, item.Spec.Width)
		}

		totalCost += item.Spec.Cost
		totalEnergy += item.Spec.Energy
	}

	// 4. CALCULATE FINAL DIMENSIONS
	finalWidth := 0
	finalHeight := len(rows) * ROW_HEIGHT

	for _, w := range rows {
		if w > finalWidth { finalWidth = w }
	}

	return LayoutResponse{
		PlacedDevices:     placedDevices,
		TotalWidth:        finalWidth,
		TotalHeight:       finalHeight,
		TotalCost:         totalCost,
		TotalEnergy:       totalEnergy,
		TransformersCount: reqTrans,
	}
}