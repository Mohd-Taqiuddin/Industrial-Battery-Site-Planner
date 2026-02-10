package main

import (
	"fmt"
	"sort"
)

const MaxSiteWidth = 100

// Row represents a horizontal strip of the site
type Row struct {
	Y            int
	CurrentWidth int
	Height       int
	Items        []PlacedDevice
}

func GenerateLayout(config map[DeviceType]int) SiteLayout {
	// 1. Calculate Auto-Requirement (1 Transformer per 2 Batteries)
	totalBatteries := 0
	for dType, count := range config {
		if dType != Transformer {
			totalBatteries += count
		}
	}
	autoTransformers := int(float64(totalBatteries) / 2.0)

	// 2. Enforce Rule: Total cannot be less than Auto
	// If user requests 5 but needs 10, we give 10.
	// If user requests 15 but needs 10, we give 15 (Manual addition allowed).
	if config[Transformer] < autoTransformers {
		config[Transformer] = autoTransformers
	}
	finalTransformers := config[Transformer]

	// 3. Prepare Inventory
	var devicesToPlace []DeviceDef
	totalCost := 0
	totalEnergy := 0.0

	for dType, count := range config {
		spec := DeviceSpecs[dType]
		for i := 0; i < count; i++ {
			devicesToPlace = append(devicesToPlace, spec)
			totalCost += spec.Cost
			totalEnergy += spec.Energy
		}
	}

	// 4. Algorithm: First Fit Decreasing (Tetris Packing)
	// Sort by Width Descending (Widest items first)
	sort.Slice(devicesToPlace, func(i, j int) bool {
		return devicesToPlace[i].Width > devicesToPlace[j].Width
	})

	var rows []*Row

	for i, device := range devicesToPlace {
		placed := false
		
		// Try to fit in any existing row that has space
		for _, row := range rows {
			if row.CurrentWidth+device.Width <= MaxSiteWidth {
				// Fits!
				p := PlacedDevice{
					ID:     fmt.Sprintf("%s-%d", device.Name, i),
					Type:   device.Name,
					Width:  device.Width,
					Height: device.Height,
					Position: Position{
						X: row.CurrentWidth,
						Y: row.Y,
					},
				}
				row.Items = append(row.Items, p)
				row.CurrentWidth += device.Width
				if device.Height > row.Height { row.Height = device.Height } // Should remain 10
				placed = true
				break
			}
		}

		// New Row if it didn't fit anywhere
		if !placed {
			newY := 0
			if len(rows) > 0 {
				lastRow := rows[len(rows)-1]
				newY = lastRow.Y + lastRow.Height
			}

			rows = append(rows, &Row{
				Y:            newY,
				CurrentWidth: device.Width,
				Height:       device.Height,
				Items: []PlacedDevice{{
					ID:     fmt.Sprintf("%s-%d", device.Name, i),
					Type:   device.Name,
					Width:  device.Width,
					Height: device.Height,
					Position: Position{X: 0, Y: newY},
				}},
			})
		}
	}

	// Flatten Result
	var finalPlaced []PlacedDevice
	siteHeight := 0
	for _, row := range rows {
		finalPlaced = append(finalPlaced, row.Items...)
		if row.Y+row.Height > siteHeight {
			siteHeight = row.Y + row.Height
		}
	}

	if len(devicesToPlace) == 0 { siteHeight = 0 }

	return SiteLayout{
		PlacedDevices: finalPlaced,
		TotalWidth:    MaxSiteWidth,
		TotalHeight:   siteHeight,
		TotalCost:     totalCost,
		TotalEnergy:   totalEnergy,
		Transformers:  finalTransformers,
	}
}