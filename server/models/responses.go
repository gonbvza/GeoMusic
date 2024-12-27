package models

// CheckCountryResponse represents the response for the /checkCountry endpoint
type CheckCountryResponse struct {
	Status   string  `json:"status"`
	Distance float64 `json:"distance,omitempty"` // Omit when not present
}
