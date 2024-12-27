package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"server/handlers"
	"server/utils"
)

func main() {
	client := utils.ConnectDB()

	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect MongoDB: %v", err)
		}
		fmt.Println("Disconnected from MongoDB.")
	}()

	// Start background routine for song updates
	handlers.UpdateCurrentSong(client)
	go handlers.UpdateSongAtMidnight(client)

	// Start HTTP server
	fmt.Println("Connected to MongoDB.")
	fmt.Println("Server is running on port 8090")

	// Handlers
	http.HandleFunc("/song", handlers.GetSongHandler(client))
	http.HandleFunc("/checkCountry", handlers.CheckCountryHandler(client))

	log.Fatal(http.ListenAndServe(":8090", nil))
}
