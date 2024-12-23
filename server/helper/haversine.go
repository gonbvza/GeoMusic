package helper

import (
	"math"
)

// Golang program to use
// the Haversine formula

func HaversineFormula(lat1 float64, long1 float64, lat2 float64, long2 float64) float64 {

	//Distane between latitudes and longitudes
	var dLat = (lat2 - lat1) * math.Pi / 180.0
	var dLon = (long2 - long1) * math.Pi / 180.0

	//Convert the latitudes in radians
	lat1 = (lat1) * math.Pi / 180.0
	lat2 = (lat2) * math.Pi / 180.0

	//Apply the Haversine formula
	var a = (math.Pow(math.Sin(dLat/2), 2) + math.Pow(math.Sin(dLon/2), 2)*math.Cos(lat1)*math.Cos(lat2))

	var rad = 6371.0

	var c = 2 * math.Asin(math.Sqrt(a))

	return rad * c
}
