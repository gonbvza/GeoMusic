package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	haversine "server/helper"
)

// Song struct with proper JSON tags
type song struct {
	Name       string    `json:"name"`
	Index      string    `json:"index"`
	StoredDate time.Time `json:"storedDate"`
}

type currentCountry struct {
	name string  `json:"name"`
	lat  float64 `json:"lat"`
	long float64 `json:"long"`
}

type test_struct struct {
	Country string `json:"country"`
}

var globalVar song = song{}
var globalCountry currentCountry = currentCountry{}

// Middleware to handle CORS
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func connect() *mongo.Client {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	uri := os.Getenv("MONGODB_URI")

	if uri == "" {
		log.Fatal("MONGODB_URI is not set")
	}

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))

	if err != nil {
		panic(err)
	}

	return client
}

func updateCurrentSong(client *mongo.Client) {
	collection := client.Database("GeoMusic").Collection("GeoMusic")
	countryCollection := client.Database("GeoMusic").Collection("Countries")

	// Fetch the next song that hasn't been played
	filter := bson.D{{"played", "False"}}
	var result bson.M
	err := collection.FindOne(context.TODO(), filter).Decode(&result)
	if result == nil {
		// Reset all songs to unplayed
		_, err = collection.UpdateMany(context.TODO(), bson.D{{}}, bson.D{{"$set", bson.D{{"played", "False"}}}})
		if err != nil {
			log.Printf("Failed to reset all songs: %v\n", err)
			return
		}

		// Fetch the next song that hasn't been played
		err = collection.FindOne(context.TODO(), filter).Decode(&result)
	} else if err != nil {
		log.Printf("Failed to find a song: %v\n", err)
		return
	}

	// Update the song to played
	songIndex := result["index"].(string)
	updateFilter := bson.D{{"index", songIndex}}
	_, err = collection.UpdateOne(context.TODO(), updateFilter, bson.D{{"$set", bson.D{{"played", "True"}}}})
	if err != nil {
		log.Printf("Failed to update a song: %v\n", err)
		return
	}

	// Fetch the associated country details
	countryFilter := bson.D{{"name", result["country"].(string)}}
	var countryResult bson.M
	errCountry := countryCollection.FindOne(context.TODO(), countryFilter).Decode(&countryResult)
	if errCountry != nil {
		log.Printf("Failed to find a country: %v\n", errCountry)
		return
	}

	// Update global variables
	globalVar = song{
		Name:       result["name"].(string),
		Index:      result["index"].(string),
		StoredDate: time.Now(),
	}

	globalCountry = currentCountry{
		name: countryResult["name"].(string),
		lat:  countryResult["lat"].(float64),
		long: countryResult["long"].(float64),
	}

	fmt.Printf("Song updated: %v\n", globalVar)
	fmt.Printf("Country updated: %v\n", globalCountry)
}

func updateSongAtMidnight(client *mongo.Client) {

	now := time.Now()
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	durationUntilMidnight := time.Until(nextMidnight)

	fmt.Printf("time until midnight: %v\n", durationUntilMidnight)

	fmt.Printf("Waiting until midnight: %v\n", nextMidnight)
	time.Sleep(durationUntilMidnight)

	fmt.Println("Midnight reached: Updating the song...")
	updateCurrentSong(client)

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("Routine triggered: Updating the song...")
			updateCurrentSong(client)
		}
	}
}

func getSong(client *mongo.Client) http.HandlerFunc {
	return enableCORS(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(globalVar)
	})
}

func checkSong(client *mongo.Client) http.HandlerFunc {
	return enableCORS(func(w http.ResponseWriter, req *http.Request) {
		// Ensure the method is POST
		if req.Method != http.MethodPost {
			http.Error(w, "Invalid request method. Only POST is allowed.", http.StatusMethodNotAllowed)
			return
		}

		// Decode JSON body
		var t test_struct
		decoder := json.NewDecoder(req.Body)
		err := decoder.Decode(&t)
		if err != nil {
			http.Error(w, "Invalid JSON body: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer req.Body.Close() // Close the request body

		if t.Country == globalCountry.name {
			// Send a success response
			w.Header().Set("Content-Type", "application/json")
			response := map[string]string{
				"status": "Correct",
			}
			json.NewEncoder(w).Encode(response)
		} else {
			countryCollection := client.Database("GeoMusic").Collection("Countries")
			countryFilter := bson.D{{"name", t.Country}}
			var countryResult bson.M
			errCountry := countryCollection.FindOne(context.TODO(), countryFilter).Decode(&countryResult)
			if errCountry != nil {
				http.Error(w, "Failed to find a country: "+err.Error(), http.StatusInternalServerError)
				return
			}

			fmt.Printf("The lat of the input country is %v\n", countryResult["lat"].(float64))
			fmt.Printf("The long of the input country is %v\n", countryResult["long"].(float64))

			haversineDistance := haversine.HaversineFormula(globalCountry.lat, globalCountry.long, countryResult["lat"].(float64), countryResult["long"].(float64))
			haversineDistance = math.Ceil(haversineDistance)
			fmt.Printf("The distance is %v\n", haversineDistance)

			w.Header().Set("Content-Type", "application/json")
			response := map[string]string{
				"status":   "Incorrect",
				"distance": strconv.FormatFloat(haversineDistance, 'f', -1, 64),
			}
			json.NewEncoder(w).Encode(response)
		}

	})
}

func icon(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func main() {
	client := connect()

	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect MongoDB: %v", err)
		}
		fmt.Println("Disconnected from MongoDB.")
	}()

	updateCurrentSong(client)

	// Start the background routine
	go updateSongAtMidnight(client)

	// Start the HTTP server
	fmt.Println("Connected to MongoDB.")
	fmt.Println("Server is running on port 8090")
	http.HandleFunc("/favicon.ico", icon)
	http.HandleFunc("/song", getSong(client))
	http.HandleFunc("/checkCountry", checkSong(client))
	log.Fatal(http.ListenAndServe(":8090", nil))
}
