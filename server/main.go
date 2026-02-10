package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	
	os.MkdirAll("/data", 0755)

	mux := http.NewServeMux()

	// Register Routes
	mux.HandleFunc("/api/calculate", HandleCalculate)
	mux.HandleFunc("/api/save", HandleSave)
	mux.HandleFunc("/api/sessions", HandleListSessions)
	mux.HandleFunc("/api/load", HandleLoadSession)
	mux.HandleFunc("/api/delete", HandleDeleteSession)

	server := &http.Server{
		Addr:         ":8080",
		Handler:      http.TimeoutHandler(mux, 10*time.Second, "Server Timeout"),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	fmt.Println("Server running on :8080")
	server.ListenAndServe()
}