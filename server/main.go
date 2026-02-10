package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"
)

// Request Payload
type LayoutRequest struct {
	Configs map[DeviceType]int `json:"configs"`
}

// Session Object (Stores everything needed for the list)
type Session struct {
	ID      string             `json:"id"`
	Config  map[DeviceType]int `json:"config"`
	Date    string             `json:"date"`
	Summary string             `json:"summary"`
	UnixTime int64             `json:"unix_time"` // For sorting
}

const DATA_FILE = "/data/sessions.json"
var fileMutex sync.Mutex

// --- FILE OPERATIONS ---

func loadSessions() map[string]Session {
	file, err := os.ReadFile(DATA_FILE)
	if err != nil {
		return make(map[string]Session)
	}
	var store map[string]Session
	json.Unmarshal(file, &store)
	return store
}

func saveSessions(store map[string]Session) {
	fileMutex.Lock()
	defer fileMutex.Unlock()
	data, _ := json.MarshalIndent(store, "", "  ")
	os.WriteFile(DATA_FILE, data, 0644)
}

func main() {
	rand.Seed(time.Now().UnixNano())
	os.MkdirAll("/data", 0755)

	mux := http.NewServeMux()

	// 1. CALCULATE
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

		// Create Session Data
		id := fmt.Sprintf("SAVE-%d", rand.Intn(99999))
		totalItems := 0
		for _, v := range req.Configs { totalItems += v }
		
		session := Session{
			ID:      id,
			Config:  req.Configs,
			Date:    time.Now().Format("01/02/2006, 03:04 PM"),
			UnixTime: time.Now().Unix(),
			Summary: fmt.Sprintf("%d Devices", totalItems),
		}

		// Save to Disk
		store := loadSessions()
		store[id] = session
		saveSessions(store)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"id": id})
	})

	// 3. LIST ALL (New Endpoint!)
	mux.HandleFunc("/api/sessions", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }

		store := loadSessions()
		
		// Convert Map to Slice for JSON
		var list []Session
		for _, s := range store {
			list = append(list, s)
		}

		// Sort by Newest First
		sort.Slice(list, func(i, j int) bool {
			return list[i].UnixTime > list[j].UnixTime
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(list)
	})

	// 4. LOAD SINGLE
	mux.HandleFunc("/api/load", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }

		id := r.URL.Query().Get("id")
		store := loadSessions()
		
		if session, ok := store[id]; ok {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(session.Config)
		} else {
			http.Error(w, "Session not found", http.StatusNotFound)
		}
	})
    
    // 5. DELETE
    mux.HandleFunc("/api/delete", func(w http.ResponseWriter, r *http.Request) {
        enableCors(w)
        if r.Method == "OPTIONS" { return }
        
        id := r.URL.Query().Get("id")
        store := loadSessions()
        delete(store, id)
        saveSessions(store)
        
        w.WriteHeader(http.StatusOK)
    })

	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", mux)
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}