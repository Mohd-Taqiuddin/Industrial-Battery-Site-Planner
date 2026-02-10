package main

import (
	"fmt"
	"math"
	"sort"
)

const MaxSiteWidth = 100

func GenerateLayout(config map[DeviceType]int) SiteLayout {
	// 1. Calculate required transformers (1 per 2 batteries)
	totalBatteries := 0
	for dType, count := range config {
		if dType != Transformer {
			totalBatteries += count
		}
	}
	requiredTransformers := int(math.Ceil(float64(totalBatteries) / 2.0))
	config[Transformer] = requiredTransformers

	// 2. Prepare inventory
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

	// 3. Layout Algorithm: Greedy Row Packing
	// Sort by width (descending) to optimize packing
	sort.Slice(devicesToPlace, func(i, j int) bool {
		return devicesToPlace[i].Width > devicesToPlace[j].Width
	})

	placed := make([]PlacedDevice, 0)
	currentX, currentY, currentRowH, siteHeight := 0, 0, 0, 0

	for i, device := range devicesToPlace {
		if currentX+device.Width > MaxSiteWidth {
			currentX = 0
			currentY += currentRowH
			currentRowH = 0
		}

		placed = append(placed, PlacedDevice{
			ID:     fmt.Sprintf("%s-%d", device.Name, i),
			Type:   device.Name,
			Width:  device.Width,
			Height: device.Height,
			Position: Position{X: currentX, Y: currentY},
		})

		currentX += device.Width
		if device.Height > currentRowH { currentRowH = device.Height }
		if currentY+device.Height > siteHeight { siteHeight = currentY + device.Height }
	}

	// Handle empty state
	if len(devicesToPlace) == 0 { siteHeight = 0 }

	return SiteLayout{
		PlacedDevices: placed,
		TotalWidth:    MaxSiteWidth,
		TotalHeight:   siteHeight,
		TotalCost:     totalCost,
		TotalEnergy:   totalEnergy,
		Transformers:  requiredTransformers,
	}
}