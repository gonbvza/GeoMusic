import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import MusicPlayer from './components/MusicPlayer.tsx';
import Guesser from './components/Guesser.tsx';
import Confetti from './components/Confetti.tsx';
import WiningModal from './components/WiningModal.tsx';
import { useCookies } from 'react-cookie';

function App() {
  const [name, setName] = useState<string | null>(null);
  const [numberGueses, setNumberGueses] = useState<number>(0);
  const [countryGuessed, setCountryGuessed] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [guessedCountries, setGuessedCountries] = useState<[string, number][]>([]);
  const [cookies, setCookie] = useCookies(['guessedCountries']);

  // Retrieve guessed countries from cookies on mount
  useEffect(() => {
    const cookieValue = cookies.guessedCountries;
    if (cookieValue) {
      try {
        setGuessedCountries(cookieValue);
        setNumberGueses(cookieValue.length);
      } catch (error) {
        console.error('Error parsing guessedCountries cookie:', error);
      }
    }
  }, []); // Runs only once on mount

  // Update cookies when guessedCountries changes
  useEffect(() => {
    const setMidnightExpiration = () => {
      const now = new Date();
      const midnight = new Date();
  
      midnight.setDate(now.getDate() + 1); // Move to the next day
      midnight.setHours(0, 0, 0, 0); // Set time to 00:00:00
      
      console.log('Cookie expiration:', midnight);
      return midnight;
    };
  
    setCookie('guessedCountries', JSON.stringify(guessedCountries), {
      path: '/',
      expires: setMidnightExpiration(),
    });
  }, [guessedCountries, setCookie]);
  

  // Fetch song data
  useEffect(() => {
    fetch('http://localhost:8090/song', {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((json) => {
        console.log('Response received:', json); 
        if (json && json.index) {
          setName(json.index);
        } else {
          console.error('Invalid JSON structure:', json);
        }
      })
      .catch((error) => console.error('Fetch error:', error));
  }, []);

  return (
    <>
      <Header />
      {name ? (
        <MusicPlayer
          audioSrc={`/src/song/${name}.mp3`}
          numberGueses={numberGueses}
          countryGuessed={countryGuessed}
        />
      ) : (
        <p>Loading audio...</p>
      )}
      <Guesser
        setNumberGueses={setNumberGueses}
        setCountryGuessed={setCountryGuessed}
        setIsRunning={setIsRunning}
        guessedCountries={guessedCountries}
        setGuessedCountries={setGuessedCountries}
        numberGueses={numberGueses}
      />
      <Confetti isRunning={isRunning} />
      {isRunning && <WiningModal isRunning={isRunning} />}
    </>
  );
}

export default App;
