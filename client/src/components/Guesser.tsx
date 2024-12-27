import { useState } from 'react';
import possibleGuesses from '../countries/countries.js';
import { sendCountry } from '../api/sendCountryApi.ts';

interface GuesserProps {
    setNumberGueses: React.Dispatch<React.SetStateAction<number>>;
    setCountryGuessed: React.Dispatch<React.SetStateAction<boolean>>;
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
    guessedCountries: [string, number][];
    setGuessedCountries: React.Dispatch<React.SetStateAction<[string, number][]>>;
    numberGueses: number;
    setCorrectGuess: React.Dispatch<React.SetStateAction<string>>;
}

const Guesser = ({ setNumberGueses , setCountryGuessed, setIsRunning, guessedCountries, setGuessedCountries, numberGueses, setCorrectGuess}: GuesserProps) => {

    const [guess, setGuess] = useState(""); 
    const [suggestions, setSuggestions] = useState<string[]>([]); 
    
    function correctGuess() {
        setCorrectGuess(guess);
        setGuess("")
        setCountryGuessed(true);
        setIsRunning(true);
        console.log("Correct guess")
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGuess(value);

        if (value) {
            const filteredSuggestions = possibleGuesses.filter((item) =>
                item.toLowerCase().includes(value.toLowerCase()) 
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]); 
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setGuess(suggestion); 
        setSuggestions([]); 
    };

    const submitGuess = async () => {
        if (
            guess && 
            possibleGuesses.includes(guess.toLowerCase()) && 
            !guessedCountries.some(([country]) => country.toLowerCase() === guess.toLowerCase()) &&
            numberGueses < 6

        ) {
            try {
                const status = await sendCountry(guess); // Await the JSON response
                console.log("The received status is: ", status);
    
                if (status && typeof status === "object") {
                    if(status.status == "Incorrect"  && "distance" in status){
                        setGuessedCountries((prev) => [
                        ...prev, 
                        [guess, status.distance] ]);

                        setGuess(""); 
                        setSuggestions([]);
                        setNumberGueses((prev) => prev + 1);
                    } else {
                        correctGuess();
                    }
                    
                } else {
                    console.warn("Invalid JSON response or missing 'distance' property");
                }
    
               
            } catch (error) {
                console.error("Failed to send country or process response:", error);
            }
        }
    };
    

    // Handle key press (Enter key to submit guess)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitGuess();
        }
    };

    

    return (
        <div className='guesser'>
            <div className="guesser-body">
                <input
                    className='guess-input'
                    type="text"
                    value={guess}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}  
                    placeholder="Enter your guess"
                />
                <button className='submit-button' onClick={submitGuess}>
                    Submit
                </button>

                {suggestions.length > 0 && (
                    <ul className="suggestions">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}


                    {guessedCountries.length > 0 && (
                        <ul className="guessedCountries">
                            {guessedCountries.map((country, index) => (
                                <div className='countryShow'>
                                    <p className='emojiCross'>❌</p>
                                    <li key={index}>
                                        {country[0]} 
                                    </li>
                                    <span className='distance'>{country[1]} km</span>
                                </div>
                            ))}
                        </ul>
                    )}
            </div>
        </div>
    );
};

export default Guesser;
