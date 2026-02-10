package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"
)

func HandleCalculate(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" { return }

	r.Body = http.MaxBytesReader(w, r.Body, MAX_BODY_SIZE)

	var req LayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if err := ValidateConfig(req.Configs); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	layout := GenerateLayout(req.Configs)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(layout)
}

func HandleSave(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" { return }

	r.Body = http.MaxBytesReader(w, r.Body, MAX_BODY_SIZE)

	var req LayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	
	if err := ValidateConfig(req.Configs); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sessionID := req.ID
	// Auto-generate ID if missing, retry on collision
	if sessionID == "" {
		for {
			sessionID = GenerateID()
			store := LoadSessions()
			if _, exists := store[sessionID]; !exists { break }
		}
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

	if err := SaveSession(newSession); err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": sessionID})
}

func HandleListSessions(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" { return }

	store := LoadSessions()
	var list []Session
	for _, s := range store { list = append(list, s) }
	sort.Slice(list, func(i, j int) bool { return list[i].UnixTime > list[j].UnixTime })

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func HandleLoadSession(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" { return }

	id := r.URL.Query().Get("id")
	store := LoadSessions()
	if session, exists := store[id]; exists {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session.Config)
	} else {
		http.Error(w, "Not found", http.StatusNotFound)
	}
}

func HandleDeleteSession(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" { return }
	if r.Method != "DELETE" { return }

	id := r.URL.Query().Get("id")
	if err := DeleteSession(id); err != nil {
		http.Error(w, "Failed to delete", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}