package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)


func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins for simplicity; adjust as needed for production
		
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")


		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {

	if err := os.MkdirAll("./data", 0755); err != nil {
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

	// Logging Middleware
	loggingHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		mux.ServeHTTP(w, r)
		fmt.Printf("[%s] %s %s - %v\n", r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	})

	// WRAP THE HANDLER WITH CORS
	timeoutHandler := http.TimeoutHandler(loggingHandler, 5*time.Second, "Server Timeout")
	finalHandler := enableCORS(timeoutHandler) 

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: finalHandler,
		
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
	}

	fmt.Println("⚡ Tesla Industrial Battery Server running on :" + port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Printf("Server failed: %v\n", err)
	}
}