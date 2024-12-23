import React from 'react';

interface WiningModalProps {
  isRunning: boolean;
}

const WiningModal: React.FC<WiningModalProps> = ({ isRunning }) => {
  if (!isRunning) return null; 

  return (
    <>
      <div className="blur-background" /> 
      <div className="winning-modal">
        <h1>Congratulations!</h1>
        <p>You guessed the song correctly!</p>
        {/*<button onClick={() => window.location.reload()}>Play Again</button>*/}
      </div>
    </>
  );
};

export default WiningModal;
