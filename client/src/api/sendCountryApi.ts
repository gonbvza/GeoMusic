
const API_BASE_URL = "http://localhost:8090";

/**
 * Check from backend if country is correct.
 * @returns {JSON} Status of the guess.
 * @throws Will throw an error if the fetch fails or response is invalid.
 */
export async function sendCountry(country: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/checkCountry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country }),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const json = await response.json();
        console.log("Response received:", json);
        return json; // Explicitly assert the type
    } catch (error) {
        console.error("Error in sendCountry:", error);
        throw error;
    }
}
