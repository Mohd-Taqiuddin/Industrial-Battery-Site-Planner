package main

import (
	"encoding/json"
	"net/http"
)

func HandleCalculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CalculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	layout := GenerateLayout(req.Configs)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(layout)
}