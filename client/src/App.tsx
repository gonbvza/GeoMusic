import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import MusicPlayer from './components/MusicPlayer.tsx';
import Guesser from './components/Guesser.tsx';
import Confetti from './components/Confetti.tsx';
import WiningModal from './components/WiningModal.tsx';

function App() {
  const [name, setName] = useState(null);
  const [numberGueses, setNumberGueses] = useState(0);
  const [countryGuessed, setCountryGuessed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8090/song', {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
      })
      .then((json) => {
        console.log('Response received:', json); 
        if (json && json.index) {
          setName(json.index); // Set the 'index' property from JSON
        } else {
          console.error('Invalid JSON structure:', json);
        }
      })
      .catch((error) => console.error('Fetch error:', error));
  }, []);
  

  console.log('Song Name:', name);
  console.log('Audio Source:', `/src/song/${name}.mp3`);

  return (
    <>
      <Header />
      {/* Render MusicPlayer only if name is available */}
      {name ? (
        <MusicPlayer audioSrc={`/src/song/${name}.mp3`} numberGueses={numberGueses} countryGuessed = {countryGuessed} />
      ) : (
        <p>Loading audio...</p>
      )}
      <Guesser  setNumberGueses={setNumberGueses} setCountryGuessed={setCountryGuessed} setIsRunning = {setIsRunning} numberGueses = {numberGueses}/> 
      <Confetti isRunning = {isRunning} />
      {isRunning && <WiningModal isRunning = {isRunning}/>}
    </>
  );
}

export default App;
