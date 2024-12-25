import { useRef, useState, useEffect } from 'react';

const MusicPlayer = ({ audioSrc, numberGueses , countryGuessed}: { audioSrc: string, numberGueses: number, countryGuessed: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = () => {
        if (currentTime < (duration / (6 - numberGueses)) && !countryGuessed) {
            audioRef.current?.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };


    useEffect(() => {
        if (currentTime > (duration / (6 - numberGueses))) {
            setCurrentTime(0);
            handlePause();
        }
    }, [currentTime])
    
    useEffect(() => {
        if (countryGuessed) {
            handlePause();
        }
    }, [countryGuessed])
    
    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;

            const updateTime = () => setCurrentTime(audio.currentTime);
            const setAudioDuration = () => setDuration(audio.duration);
            // setNumberGueses(0);

            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', setAudioDuration);

            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', setAudioDuration);
            };
        }
    }, []);

    return (
        <div className="bodyPlayer">
            <div className="player-card">
                <div className="player">
                    <input
                        type="range"
                        value={currentTime}
                        max={duration || 0} 
                        onChange={handleSeek}
                    />
                    <button className='playButton' onClick={handlePlayPause}>
                        <span className="material-symbols-rounded">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                </div>
                <audio ref={audioRef} src={audioSrc} />
            </div>
        </div>
    );
};

export default MusicPlayer;
