package utils

import (
	"context"
	"log"

	"server/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectDB establishes a connection to the MongoDB database
func ConnectDB() *mongo.Client {
	config.LoadEnv()
	uri := config.GetEnv("MONGODB_URI")

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	return client
}
