package main

import (
	"fmt"
	"sort"
)

const MaxSiteWidth = 100

type Row struct {
	Y            int
	CurrentWidth int
	Height       int
	Items        []PlacedDevice
}

func GenerateLayout(config map[DeviceType]int) SiteLayout {
	// 1. Calculate Minimum Requirement (1 per 2 batteries)
	totalBatteries := 0
	for dType, count := range config {
		if dType != Transformer {
			totalBatteries += count
		}
	}
	minTransformers := totalBatteries / 2

	// 2. LOGIC FIX: Treat config[Transformer] as MANUAL OVERRIDE TARGET
	// If the user's input (config[Transformer]) is LESS than the minimum, we bump it up.
	// If the user's input is MORE than the minimum, we respect it.
	
	userRequested := config[Transformer]
	finalTransformersCount := userRequested

	// Force minimum compliance
	if finalTransformersCount < minTransformers {
		finalTransformersCount = minTransformers
	}

	// 3. Prepare Inventory
	var devicesToPlace []DeviceDef
	totalCost := 0
	totalEnergy := 0.0

	// Add Batteries
	for dType, count := range config {
		if dType == Transformer { continue }
		spec := DeviceSpecs[dType]
		for i := 0; i < count; i++ {
			devicesToPlace = append(devicesToPlace, spec)
			totalCost += spec.Cost
			totalEnergy += spec.Energy
		}
	}

	// Add Transformers (Use final count)
	transSpec := DeviceSpecs[Transformer]
	for i := 0; i < finalTransformersCount; i++ {
		devicesToPlace = append(devicesToPlace, transSpec)
		totalCost += transSpec.Cost
		totalEnergy += transSpec.Energy
	}

	// 4. Algorithm: Sort & Pack
	sort.Slice(devicesToPlace, func(i, j int) bool {
		return devicesToPlace[i].Width > devicesToPlace[j].Width
	})

	var rows []*Row

	for i, device := range devicesToPlace {
		placed := false
		for _, row := range rows {
			if row.CurrentWidth+device.Width <= MaxSiteWidth {
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
				if device.Height > row.Height { row.Height = device.Height }
				placed = true
				break
			}
		}

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

	var finalPlaced []PlacedDevice
	siteHeight := 0
	for _, row := range rows {
		finalPlaced = append(finalPlaced, row.Items...)
		if row.Y+row.Height > siteHeight {
			siteHeight = row.Y + row.Height
		}
	}
	if len(devicesToPlace) == 0 { siteHeight = 0 }

	// IMPORTANT: Return the calculated count so the UI knows the actual total
	return SiteLayout{
		PlacedDevices: finalPlaced,
		TotalWidth:    MaxSiteWidth,
		TotalHeight:   siteHeight,
		TotalCost:     totalCost,
		TotalEnergy:   totalEnergy,
		Transformers:  finalTransformersCount,
	}
}