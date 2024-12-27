package models

// Country represents a country in the GeoMusic database
type Country struct {
	Name string  `json:"name" bson:"name"`
	Lat  float64 `json:"lat" bson:"lat"`
	Long float64 `json:"long" bson:"long"`
}
