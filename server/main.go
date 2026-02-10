package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"
)

type LayoutRequest struct {
	Configs map[DeviceType]int `json:"configs"`
}

// File path to store data
const DATA_FILE = "/data/sessions.json"

// Mutex to prevent crashing if two people save at the exact same time
var fileMutex sync.Mutex

// Helper: Load from Disk
func loadSessionsFromDisk() map[string]map[DeviceType]int {
	file, err := os.ReadFile(DATA_FILE)
	if err != nil {
		return make(map[string]map[DeviceType]int) // Return empty if file doesn't exist
	}
	var store map[string]map[DeviceType]int
	json.Unmarshal(file, &store)
	return store
}

// Helper: Save to Disk
func saveSessionsToDisk(store map[string]map[DeviceType]int) {
	fileMutex.Lock()
	defer fileMutex.Unlock()
	
	data, _ := json.MarshalIndent(store, "", "  ")
	os.WriteFile(DATA_FILE, data, 0644)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Ensure /data directory exists
	os.MkdirAll("/data", 0755)

	mux := http.NewServeMux()

	// 1. Calculate
	mux.HandleFunc("/api/calculate", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }

		var req LayoutRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		layout := GenerateLayout(req.Configs)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(layout)
	})

	// 2. SAVE (Persistent)
	mux.HandleFunc("/api/save", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		
		var req LayoutRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		sessionID := fmt.Sprintf("SAVE-%d", rand.Intn(99999))
		
		// Load, Update, Save
		store := loadSessionsFromDisk()
		store[sessionID] = req.Configs
		saveSessionsToDisk(store)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"id": sessionID})
	})

	// 3. LOAD (Persistent)
	mux.HandleFunc("/api/load", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }

		id := r.URL.Query().Get("id")
		store := loadSessionsFromDisk()
		
		if config, ok := store[id]; ok {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(config)
		} else {
			http.Error(w, "Session not found", http.StatusNotFound)
		}
	})

	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", mux)
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}