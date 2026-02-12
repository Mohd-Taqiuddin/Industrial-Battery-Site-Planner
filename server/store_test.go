package main

import (
	"os"
	"testing"
)

func TestGenerateID(t *testing.T) {
	id1 := GenerateID()
	id2 := GenerateID()
	
	if id1 == id2 {
		t.Error("IDs should be unique")
	}
	
	if id1[:5] != "SAVE-" {
		t.Error("ID should start with SAVE-")
	}
}

func TestSaveAndLoadSession(t *testing.T) {
	defer os.Remove("./data/sessions.json")
	
	session := Session{
		ID:      "test-123",
		Config:  map[DeviceType]int{MegapackXL: 5},
		Date:    "01/01/2024",
		Summary: "Test",
	}
	
	if err := SaveSession(session); err != nil {
		t.Fatalf("Save failed: %v", err)
	}
	
	sessions, err := LoadSessions()
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}
	
	loaded, exists := sessions[session.ID]
	if !exists {
		t.Fatal("Session not found")
	}
	
	if loaded.Summary != session.Summary {
		t.Errorf("Expected %s, got %s", session.Summary, loaded.Summary)
	}
}