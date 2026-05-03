import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import ModeScreen from './components/ModeScreen';
import GameScreen from './components/GameScreen';
import { Smartphone } from 'lucide-react';

export type GameState = 'START' | 'MODE' | 'GAME';
export type GameMode = 'numerasi' | 'literasi';

function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [mode, setMode] = useState<GameMode>('numerasi');
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isPortrait) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white font-pixel leading-relaxed">
        <Smartphone className="w-24 h-24 mb-8 text-yellow-400 animate-pulse rotate-90" />
        <p className="text-xl text-yellow-400">Tolong putar layar perangkat Anda</p>
        <p className="mt-8 text-xs text-gray-400 leading-loose">Game ini harus dimainkan menggunakan mode Landscape agar mendapatkan pengalaman terbaik.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans filter">
      {gameState === 'START' && (
        <StartScreen onStart={() => setGameState('MODE')} />
      )}
      
      {gameState === 'MODE' && (
        <ModeScreen 
          onSelectMode={(selectedMode) => {
            setMode(selectedMode);
            setGameState('GAME');
          }} 
          onBack={() => setGameState('START')} 
        />
      )}

      {gameState === 'GAME' && (
        <GameScreen mode={mode} onHome={() => setGameState('START')} />
      )}
    </div>
  );
}

export default App;
