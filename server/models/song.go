package models

import "time"

// Song represents a song in the GeoMusic database
type Song struct {
	Name       string    `json:"name"`
	Index      string    `json:"index"`
	StoredDate time.Time `json:"storedDate"`
}
