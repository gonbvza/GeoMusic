package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"server/models"
	"server/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var currentSong models.Song
var currentCountry models.Country

// GetSongHandler returns the current song
func GetSongHandler(client *mongo.Client) http.HandlerFunc {
	return utils.EnableCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(currentSong)
	})
}

// UpdateCurrentSong updates the global song and country variables
func UpdateCurrentSong(client *mongo.Client) {
	fmt.Println("Updating current song...")
	collection := client.Database("GeoMusic").Collection("GeoMusic")
	countryCollection := client.Database("GeoMusic").Collection("Countries")

	// Fetch next unplayed song
	filter := bson.M{"played": "False"}
	var songDoc bson.M
	err := collection.FindOne(context.Background(), filter).Decode(&songDoc)

	if err != nil {
		resetSongs(collection)
		collection.FindOne(context.Background(), filter).Decode(&songDoc)
	}

	// Mark song as played
	collection.UpdateOne(context.Background(), bson.M{"index": songDoc["index"]}, bson.M{"$set": bson.M{"played": "True"}})

	// Fetch associated country
	var countryDoc bson.M
	countryFilter := bson.M{"name": songDoc["country"]}
	err = countryCollection.FindOne(context.Background(), countryFilter).Decode(&countryDoc)

	// Update global state
	currentSong = models.Song{
		Name:       songDoc["name"].(string),
		Index:      songDoc["index"].(string),
		StoredDate: time.Now(),
	}

	currentCountry = models.Country{
		Name: countryDoc["name"].(string),
		Lat:  countryDoc["lat"].(float64),
		Long: countryDoc["long"].(float64),
	}
}

func resetSongs(collection *mongo.Collection) {
	_, err := collection.UpdateMany(context.Background(), bson.M{}, bson.M{"$set": bson.M{"played": "False"}})
	if err != nil {
		fmt.Printf("Failed to reset songs: %v\n", err)
	}
}

// UpdateSongAtMidnight runs the song update at midnight daily
func UpdateSongAtMidnight(client *mongo.Client) {
	fmt.Println("Starting background routine for song updates...")
	now := time.Now()
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	time.Sleep(time.Until(nextMidnight))

	UpdateCurrentSong(client)
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		UpdateCurrentSong(client)
	}
}
