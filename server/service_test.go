package main

import (
	"testing"
)

func TestGenerateLayout_WidthConstraint(t *testing.T) {
	// Setup a heavy config that definitely exceeds 100ft if packed linearly
	config := map[DeviceType]int{
		MegapackXL: 5, // 5 * 40ft = 200ft
	}

	layout := GenerateLayout(config)

	// 3. Verify Width (Should be <= 100)
	if layout.TotalWidth > 100 {
		t.Errorf("Layout width %d exceeds max 100ft", layout.TotalWidth)
	}
}

func TestGenerateLayout_TransformerMath(t *testing.T) {
	// 10 Batteries -> Should auto-add 5 Transformers
	config := map[DeviceType]int{
		MegapackXL: 10,
	}

	layout := GenerateLayout(config)

	foundTransformers := 0
	for _, d := range layout.PlacedDevices {
		if d.Type == Transformer {
			foundTransformers++
		}
	}

	if foundTransformers != 5 {
		t.Errorf("Expected 5 transformers, found %d", foundTransformers)
	}
}

func TestValidateConfig_Negatives(t *testing.T) {
	config := map[DeviceType]int{
		MegapackXL: -1,
	}
	
	err := ValidateConfig(config)
	if err == nil {
		t.Error("Expected error for negative count, got nil")
	}
}


func TestGenerateLayout_Sorting(t *testing.T) {
	// Scenario: 1 Small PowerPack (10ft) and 1 Big MegapackXL (40ft).
	// The Algorithm MUST place the XL first at X=0, because it sorts by size.
	config := map[DeviceType]int{
		PowerPack:  1,
		MegapackXL: 1,
	}

	layout := GenerateLayout(config)

	// Find the XL device
	var xlPos, ppPos int
	for _, d := range layout.PlacedDevices {
		if d.Type == MegapackXL {
			xlPos = d.Position.X
		}
		if d.Type == PowerPack {
			ppPos = d.Position.X
		}
	}

	// Validation: XL should be at 0. PowerPack should be after it (at 40).
	if xlPos != 0 {
		t.Errorf("Expected MegapackXL at X=0 (First Fit Decreasing), but got %d", xlPos)
	}
	if ppPos < 40 {
		t.Errorf("Expected PowerPack to be placed after XL (>40), but got %d", ppPos)
	}
}

func TestGenerateLayout_TotalCost(t *testing.T) {
	// Scenario: 2 Megapack2 ($80k each) + 1 Transformer ($10k auto-added)
	// Total should be: 160k + 10k = 170k
	config := map[DeviceType]int{
		Megapack2: 2,
	}

	layout := GenerateLayout(config)

	var expectedCost float64 = (2 * 80000) + (1 * 10000)
	if layout.TotalCost != expectedCost {
		t.Errorf("Expected TotalCost %.0f, got %.0f", expectedCost, layout.TotalCost)
	}
}