package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"
)

func sendJSONError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// --- HTTP HANDLERS ---
func HandleCalculate(w http.ResponseWriter, r *http.Request) {

	// Limit Request Size to prevent Memory Exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, MAX_BODY_SIZE)

	var req LayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body: check your JSON format", http.StatusBadRequest)
		return
	}

	// Server-side validation (Security Gatekeeper)
	if err := ValidateConfig(req.Configs); err != nil {
		sendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	layout := GenerateLayout(req.Configs)
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(layout); err != nil {
		fmt.Printf("[ERROR] Failed to encode layout: %v\n", err)
	}
}

func HandleSave(w http.ResponseWriter, r *http.Request) {

	r.Body = http.MaxBytesReader(w, r.Body, MAX_BODY_SIZE)

	var req LayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if err := ValidateConfig(req.Configs); err != nil {
		sendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	sessionID := req.ID
	if sessionID == "" {
		for {
			sessionID = GenerateID()
			store, err := LoadSessions()
			if err != nil {
				sendJSONError(w, "Database access error during ID generation", http.StatusInternalServerError)
				return
			}
			if _, exists := store[sessionID]; !exists {
				break
			}
		}
	}

	totalItems := 0
	for _, v := range req.Configs {
		totalItems += v
	}

	newSession := Session{
		ID:       sessionID,
		Config:   req.Configs,
		Date:     time.Now().Format("01/02/2006, 03:04 PM"),
		Summary:  fmt.Sprintf("%d Devices", totalItems),
		UnixTime: time.Now().Unix(),
	}

	// Atomic save with error handling
	if err := SaveSession(newSession); err != nil {
		fmt.Printf("[ERROR] SaveSession failed: %v\n", err)
		sendJSONError(w, "Critical: Failed to save session to disk", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"id": sessionID})
}

func HandleListSessions(w http.ResponseWriter, r *http.Request) {

	store, err := LoadSessions()
	if err != nil {
		fmt.Printf("[ERROR] List Sessions failed: %v\n", err)
		sendJSONError(w, "Internal storage error: check server logs", http.StatusInternalServerError)
		return
	}

	var list []Session
	for _, s := range store {
		list = append(list, s)
	}

	// Sort by newest first
	sort.Slice(list, func(i, j int) bool {
		return list[i].UnixTime > list[j].UnixTime
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(list)
}

func HandleLoadSession(w http.ResponseWriter, r *http.Request) {

	id := r.URL.Query().Get("id")
	if id == "" {
		sendJSONError(w, "Missing session ID parameter", http.StatusBadRequest)
		return
	}

	store, err := LoadSessions()
	if err != nil {
		sendJSONError(w, "Failed to load session store", http.StatusInternalServerError)
		return
	}

	if session, exists := store[id]; exists {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(session.Config)
	} else {
		sendJSONError(w, "Configuration session not found", http.StatusNotFound)
	}
}

func HandleDeleteSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		sendJSONError(w, "Missing session ID", http.StatusBadRequest)
		return
	}

	if err := DeleteSession(id); err != nil {
		fmt.Printf("[ERROR] Deletion of %s failed: %v\n", id, err)
		sendJSONError(w, "Could not remove session from storage", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}