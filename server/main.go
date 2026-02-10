package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

// --- MISSING STRUCT DEFINITION ---
type LayoutRequest struct {
	Configs map[DeviceType]int `json:"configs"`
}

// In-Memory Database for Sessions
var sessionStore = make(map[string]map[DeviceType]int)

func main() {
	// Seed random generator
	rand.Seed(time.Now().UnixNano())

	mux := http.NewServeMux()

	// 1. Calculate Layout Endpoint
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

	// 2. SAVE Endpoint
	mux.HandleFunc("/api/save", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req LayoutRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Generate simple ID (e.g., "SAVE-9482")
		sessionID := fmt.Sprintf("SAVE-%d", rand.Intn(99999))
		sessionStore[sessionID] = req.Configs

		response := map[string]string{"id": sessionID}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// 3. LOAD Endpoint
	mux.HandleFunc("/api/load", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		
        // Get ID from query param ?id=SAVE-123
        id := r.URL.Query().Get("id")
        if id == "" {
            http.Error(w, "Missing id parameter", http.StatusBadRequest)
            return
        }

        // Look up
        config, exists := sessionStore[id]
        if !exists {
            http.Error(w, "Session not found", http.StatusNotFound)
            return
        }

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(config)
	})

	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", mux)
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}