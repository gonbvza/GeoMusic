package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnv loads environment variables from a .env file
func LoadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables.")
	}
}

// GetEnv fetches the value of a key from the environment
func GetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("%s is not set", key)
	}
	return value
}
