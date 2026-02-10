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

// Request Payload (Added ID field for updates)
type LayoutRequest struct {
	ID      string             `json:"id,omitempty"` // Optional: If provided, we update this session
	Configs map[DeviceType]int `json:"configs"`
}

// Session Object
type Session struct {
	ID       string             `json:"id"`
	Config   map[DeviceType]int `json:"config"`
	Date     string             `json:"date"`
	Summary  string             `json:"summary"`
	UnixTime int64              `json:"unix_time"`
}

const DATA_FILE = "/data/sessions.json"
var fileMutex sync.Mutex

// --- HELPERS ---
func loadSessions() map[string]Session {
	store := make(map[string]Session)
	file, err := os.ReadFile(DATA_FILE)
	if err == nil {
		_ = json.Unmarshal(file, &store)
	}
	if store == nil { store = make(map[string]Session) }
	return store
}

func saveSessions(store map[string]Session) {
	fileMutex.Lock()
	defer fileMutex.Unlock()
	data, _ := json.MarshalIndent(store, "", "  ")
	os.WriteFile(DATA_FILE, data, 0644)
}

// --- SERVER ---
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

	// 2. SAVE (Create OR Update)
	mux.HandleFunc("/api/save", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }

		var req LayoutRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// LOGIC: If ID is provided, use it. Else, generate new.
		sessionID := req.ID
		if sessionID == "" {
			sessionID = fmt.Sprintf("SAVE-%d", rand.Intn(99999))
		}

		totalItems := 0
		for _, v := range req.Configs { totalItems += v }

		newSession := Session{
			ID:       sessionID,
			Config:   req.Configs,
			Date:     time.Now().Format("01/02/2006, 03:04 PM"),
			Summary:  fmt.Sprintf("%d Devices", totalItems),
			UnixTime: time.Now().Unix(),
		}

		store := loadSessions()
		store[sessionID] = newSession
		saveSessions(store)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"id": sessionID})
	})

	// 3. LIST SESSIONS
	mux.HandleFunc("/api/sessions", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		
		store := loadSessions()
		var list []Session
		for _, s := range store { list = append(list, s) }
		sort.Slice(list, func(i, j int) bool { return list[i].UnixTime > list[j].UnixTime })

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(list)
	})

	// 4. LOAD SESSION
	mux.HandleFunc("/api/load", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		
		id := r.URL.Query().Get("id")
		store := loadSessions()
		if session, exists := store[id]; exists {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(session.Config)
		} else {
			http.Error(w, "Not found", http.StatusNotFound)
		}
	})

	// 5. DELETE
	mux.HandleFunc("/api/delete", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == "OPTIONS" { return }
		if r.Method != "DELETE" { return }

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