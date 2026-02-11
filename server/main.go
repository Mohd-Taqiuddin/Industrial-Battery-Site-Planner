package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	if err := os.MkdirAll("/data", 0755); err != nil {
		fmt.Printf("Fatal: Could not create data directory: %v\n", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	// Routes
	mux.HandleFunc("/api/calculate", HandleCalculate)
	mux.HandleFunc("/api/save", HandleSave)
	mux.HandleFunc("/api/sessions", HandleListSessions)
	mux.HandleFunc("/api/load", HandleLoadSession)
	mux.HandleFunc("/api/delete", HandleDeleteSession)

	// Logging
	loggingHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		fmt.Printf("[%s] %s %s\n", r.Method, r.URL.Path, r.RemoteAddr)
		
		mux.ServeHTTP(w, r)
		
		fmt.Printf("   └─ Completed in %v\n", time.Since(start))
	})

	server := &http.Server{
		Addr: ":8080",
		Handler: http.TimeoutHandler(loggingHandler, 5*time.Second, "Server Timeout"),
		
		// TCP/HTTP Level Timeouts
		ReadTimeout:       5 * time.Second,  // Max time to read the whole request
		WriteTimeout:      10 * time.Second, // Max time to write the response
		IdleTimeout:       120 * time.Second, // Max time to keep an idle connection open
		ReadHeaderTimeout: 2 * time.Second,  // Max time to read just the headers (prevents Slowloris)
	}

	fmt.Println(" Tesla Industrial Battery Server running on :8080")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Printf("Server failed: %v\n", err)
	}
}