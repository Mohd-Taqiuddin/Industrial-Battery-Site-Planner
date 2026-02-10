package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", HandleCalculate)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:8000", "http://localhost:3000"},
		AllowedMethods: []string{"POST", "OPTIONS"},
	})

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }

	fmt.Printf("Server listening on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(mux)))
}