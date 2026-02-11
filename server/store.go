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

// GenerateID creates a secure, non-predictable ID
func GenerateID() string {
	bytes := make([]byte, 4) // 8 hex characters
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("SAVE-%d", time.Now().UnixNano())
	}
	return "SAVE-" + hex.EncodeToString(bytes)
}

// Internal helper: Reads the file WITHOUT locking. 
// Only call this when you ALREADY hold the mutex!
func loadSessionsRaw() (map[string]Session, error) {
	store := make(map[string]Session)
	file, err := os.ReadFile(DATA_FILE)
	if err != nil {
		if os.IsNotExist(err) {
			return store, nil // Return empty store if file hasn't been created yet
		}
		return nil, fmt.Errorf("read file error: %w", err)
	}

	if err := json.Unmarshal(file, &store); err != nil {
		return nil, fmt.Errorf("data corruption: failed to parse sessions JSON: %w", err)
	}
	return store, nil
}

// LoadSessions is the public, thread-safe way to get all data
func LoadSessions() (map[string]Session, error) {
	storeMutex.RLock()
	defer storeMutex.RUnlock()
	return loadSessionsRaw()
}

// SaveSession validates, loads, updates, and writes atomically
func SaveSession(s Session) error {
	storeMutex.Lock()
	defer storeMutex.Unlock()

	// 1. Load existing data (using the internal helper because we already have the lock)
	store, err := loadSessionsRaw()
	if err != nil {
		return err
	}

	// 2. Update the map
	store[s.ID] = s

	// 3. Serialize
	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize session: %w", err)
	}

	// 4. Perform atomic write
	return atomicWriteFile(DATA_FILE, data)
}

// DeleteSession safely removes an entry
func DeleteSession(id string) error {
	storeMutex.Lock()
	defer storeMutex.Unlock()

	store, err := loadSessionsRaw()
	if err != nil {
		return err
	}

	if _, exists := store[id]; exists {
		delete(store, id)
		data, err := json.MarshalIndent(store, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to serialize after delete: %w", err)
		}
		return atomicWriteFile(DATA_FILE, data)
	}
	return nil
}

// atomicWriteFile ensures the file is never "half-written"
func atomicWriteFile(filename string, data []byte) error {
	dir := filepath.Dir(filename)
	
	// Create a temporary file in the same directory
	tmpFile, err := os.CreateTemp(dir, "session-*.tmp")
	if err != nil {
		return fmt.Errorf("could not create temp file: %w", err)
	}
	// If something goes wrong, make sure we clean up the temp file
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.Write(data); err != nil {
		tmpFile.Close()
		return fmt.Errorf("write to temp file failed: %w", err)
	}

	if err := tmpFile.Close(); err != nil {
		return fmt.Errorf("failed to close temp file: %w", err)
	}

	// Rename is an atomic operation in most OSs
	if err := os.Rename(tmpFile.Name(), filename); err != nil {
		return fmt.Errorf("atomic swap failed: %w", err)
	}

	return nil
}