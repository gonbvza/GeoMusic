import {useEffect, useState} from 'react'
import ReactConfetti from 'react-confetti';

const Confetti = ({isRunning}: {isRunning: boolean}) => {
    const [windowDimensions, setWindowDimensions] = useState({width: window.innerWidth, height: window.innerHeight});

    const detectSize = () => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight}); 
    }

    useEffect(() => {
        window.addEventListener('resize', detectSize)

        return () => {
            window.removeEventListener('resize', detectSize)
        }
    }, [windowDimensions])

    return (
        <>
            {isRunning && <ReactConfetti width={windowDimensions.width} height={windowDimensions.height} tweenDuration={1000}/>}
        </>
    )
}

export default Confetti