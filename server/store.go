package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// --- THREAD-SAFE STORAGE ---
var storeMutex sync.RWMutex

// Generate a secure, non-predictable ID
func GenerateID() string {
	bytes := make([]byte, 4) // 4 bytes = 8 hex chars
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("SAVE-%d", time.Now().UnixNano())
	}
	return "SAVE-" + hex.EncodeToString(bytes)
}

// Helper: Atomic Write (Prevents data corruption)
func atomicWriteFile(filename string, data []byte) error {
	dir := filepath.Dir(filename)
	
	// 1. Write to a temp file first
	tmpFile, err := os.CreateTemp(dir, "session-*.tmp")
	if err != nil { return err }
	defer os.Remove(tmpFile.Name()) // Cleanup if we fail

	if _, err := tmpFile.Write(data); err != nil { return err }
	if err := tmpFile.Close(); err != nil { return err }

	// 2. Atomic Rename (Instant switch)
	return os.Rename(tmpFile.Name(), filename)
}

func LoadSessions() map[string]Session {
	storeMutex.RLock() // Lock for READING
	defer storeMutex.RUnlock()

	store := make(map[string]Session)
	file, err := os.ReadFile(DATA_FILE)
	if err == nil {
		_ = json.Unmarshal(file, &store)
	}
	if store == nil { store = make(map[string]Session) }
	return store
}

func SaveSession(s Session) error {
	storeMutex.Lock() // Lock for WRITING
	defer storeMutex.Unlock()

	// 1. Load existing data inside the lock
	store := make(map[string]Session)
	file, err := os.ReadFile(DATA_FILE)
	if err == nil { _ = json.Unmarshal(file, &store) }
	if store == nil { store = make(map[string]Session) }

	// 2. Update
	store[s.ID] = s

	// 3. Serialize & Atomic Write
	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil { return err }

	return atomicWriteFile(DATA_FILE, data)
}

func DeleteSession(id string) error {
	storeMutex.Lock()
	defer storeMutex.Unlock()

	store := make(map[string]Session)
	file, err := os.ReadFile(DATA_FILE)
	if err == nil { json.Unmarshal(file, &store) }
	
	if _, exists := store[id]; exists {
		delete(store, id)
		data, _ := json.MarshalIndent(store, "", "  ")
		return atomicWriteFile(DATA_FILE, data)
	}
	return nil
}