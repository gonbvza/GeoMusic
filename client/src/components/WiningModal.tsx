import React from 'react';

interface WiningModalProps {
  isRunning: boolean;
  guessedCountries: [string, number][];
  correctGuess: string;
}

const WiningModal: React.FC<WiningModalProps> = ({ isRunning,  guessedCountries, correctGuess}) => {
  if (!isRunning) return null; 

  return (
    <>
      <div className="blur-background" /> 
      <div className="winning-modal">
        <h1>Congratulations!</h1>
        <p>You guessed the song correctly!</p>
        {guessedCountries.length > 0 && (
          <ul className="winningModalGuessedCountries">
              {guessedCountries.map((country, index) => (
                  <div className='winningModalCountryShow'>
                      <p className='emojiCross'>❌</p>
                      <li key={index}>
                          {country[0]} 
                      </li>
                  </div>
              ))}
              <div className='winningModalCountryShow'>
                      <p className='emojiCross'>✅</p>
                      <li >
                          {correctGuess} 
                      </li>
                  </div>
          </ul>
        )}
      </div>
    </>
  );
};

export default WiningModal;
