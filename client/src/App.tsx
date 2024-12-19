import 'react'
import './App.css'
import Header from  './components/Header.tsx'
import MusicPlayer from './components/MusicPlayer.tsx'
import songSrc from './song/song.mp3';
import Guesser from './components/Guesser.tsx'

function App() {

  return (
    <>
      <Header/>
      <MusicPlayer audioSrc={songSrc}/>
      <Guesser/>
    </>
  )
}

export default App
