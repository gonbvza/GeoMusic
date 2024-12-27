
const API_BASE_URL = "http://localhost:8090";

/**
 * Fetch song data from the backend.
 * @returns {JSON} The song data with index.
 * @throws Will throw an error if the fetch fails or response is invalid.
 */
export async function getSong() {
    try {
        const response = await fetch(`${API_BASE_URL}/song`, {
        method: "GET",
        });

        if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const json = await response.json();
        console.log("Song API Response:", json);

        if (!json || !json.index) {
        throw new Error("Invalid JSON structure: 'index' property missing");
        }

        return json 
    } catch (error) {
        console.error("Error fetching song data:", error);
        throw error;
    }
}
  