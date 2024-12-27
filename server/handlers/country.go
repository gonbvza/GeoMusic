package handlers

import (
	"context"
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"server/models"
	"server/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CheckCountryHandler processes the checkCountry endpoint
func CheckCountryHandler(client *mongo.Client) http.HandlerFunc {
	return utils.EnableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method. Only POST is allowed.", http.StatusMethodNotAllowed)
			return
		}

		// Decode the request body
		var reqBody models.CountryRequest
		err := json.NewDecoder(r.Body).Decode(&reqBody)
		if err != nil {
			http.Error(w, "Invalid JSON body: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		// Check if the input country matches the global country
		if reqBody.Country == currentCountry.Name {
			response := map[string]string{
				"status": "Correct",
			}
			writeJSONResponse(w, response)
			return
		}

		// Calculate the distance to the global country
		countryCollection := client.Database("GeoMusic").Collection("Countries")
		var countryDoc bson.M
		err = countryCollection.FindOne(context.Background(), bson.M{"name": reqBody.Country}).Decode(&countryDoc)
		if err != nil {
			http.Error(w, "Country not found: "+err.Error(), http.StatusInternalServerError)
			return
		}

		lat := countryDoc["lat"].(float64)
		long := countryDoc["long"].(float64)
		distance := calculateDistance(currentCountry.Lat, currentCountry.Long, lat, long)

		response := map[string]string{
			"status":   "Incorrect",
			"distance": strconv.FormatFloat(distance, 'f', -1, 64),
		}
		writeJSONResponse(w, response)
	})
}

// Helper function to calculate distance using Haversine formula
func calculateDistance(lat1, long1, lat2, long2 float64) float64 {
	distance := utils.HaversineFormula(lat1, long1, lat2, long2)
	return math.Ceil(distance)
}

// Helper function to write JSON response
func writeJSONResponse(w http.ResponseWriter, response map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
