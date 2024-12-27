package models

// CountryRequest represents the body of a POST request to check a country
type CountryRequest struct {
	Country string `json:"country"`
}
