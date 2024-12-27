import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import MusicPlayer from './components/MusicPlayer.tsx';
import Guesser from './components/Guesser.tsx';
import Confetti from './components/Confetti.tsx';
import WiningModal from './components/WiningModal.tsx';
import { useCookies } from 'react-cookie';
import { getSong } from './api/requestSongApi.ts';

function App() {

  const [name, setName] = useState<string | null>(null);
  const [numberGueses, setNumberGueses] = useState<number>(0);
  const [countryGuessed, setCountryGuessed] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [guessedCountries, setGuessedCountries] = useState<[string, number][]>([]);
  const [cookies, setCookie] = useCookies(['guessedCountries', 'isRunning']);
  const [correctGuess, setCorrectGuess] = useState<string>("");

  // Helpers
  const setMidnightExpiration = () => {
    const now = new Date();
    const midnight = new Date();

    midnight.setDate(now.getDate() + 1); 
    midnight.setHours(0, 0, 0, 0); 
    
    console.log('Cookie expiration:', midnight);
    return midnight;
  };


  // Retrieve guessed countries from cookies on mount
  useEffect(() => {
    const cookieGuessedCountries = cookies.guessedCountries;
    if (cookieGuessedCountries) {
      try {
        setGuessedCountries(cookieGuessedCountries);
        setNumberGueses(cookieGuessedCountries.length);
      } catch (error) {
        console.error('Error parsing guessedCountries cookie:', error);
      }
    }

    const cookieIsRunning = cookies.isRunning;
    if (cookieIsRunning) {
      try {
        setIsRunning(cookieIsRunning);
      } catch (error) {
        console.error('Error parsing isRunning cookie:', error);
      }
    }
  }, []); 

  // Update cookies when guessedCountries changes
  useEffect(() => {  
    setCookie('guessedCountries', JSON.stringify(guessedCountries), {
      path: '/',
      expires: setMidnightExpiration(),
    });
  }, [guessedCountries, setCookie]);
  
  useEffect(() => {
    setCookie('isRunning', isRunning, {
      path: '/',
      expires: setMidnightExpiration(),
    });
  }, [isRunning]);

  // Fetch song data
  useEffect(() => {
    getSong()
      .then((json) => setName(json.index))
      .catch((error) => console.error('Failed to fetch song:', error));
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
        setCorrectGuess={setCorrectGuess}
      />
      <Confetti isRunning={isRunning} />
      {isRunning && <WiningModal isRunning={isRunning} guessedCountries={guessedCountries} correctGuess={correctGuess}/>}
    </>
  );
}

export default App;
