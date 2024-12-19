import { useState } from 'react';

const Guesser = () => {
    const [guess, setGuess] = useState(""); 
    const [suggestions, setSuggestions] = useState<string[]>([]); 
    const [guessedCountries, setGuessedCountries] = useState<string[]>([]);

    const possibleGuesses = ["albania", "austria", "spain", "italy", "france", "russia", "china", "egypt"];

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

    const submitGuess = () => {
        if (guess && possibleGuesses.includes(guess.toLowerCase()) && !guessedCountries.includes(guess)) {
            setGuessedCountries((prev) => [...prev, guess]); 
            setGuess(""); 
            setSuggestions([]);
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
                                        {country} 
                                    </li>
                                    <span className='distance'>100km</span>
                                </div>
                            ))}
                        </ul>
                    )}
            </div>
        </div>
    );
};

export default Guesser;
