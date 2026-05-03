import { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode } from '../App';
import { questionsNumerasi, questionsLiterasi, Question } from '../data/questions';
import { Heart, Coins, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface GameScreenProps {
  mode: GameMode;
  onHome: () => void;
}

// Simple physics and game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 6;
const GROUND_Y = 25; // Percentage from bottom

let audioCtx: AudioContext | null = null;
const playExplosionSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

export default function GameScreen({ mode, onHome }: GameScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Player state
  const [playerX, setPlayerX] = useState(20);
  const [playerY, setPlayerY] = useState(0); // 0 is on ground
  const [playerVelocityY, setPlayerVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  
  // Game stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4);
  const [time, setTime] = useState(300);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Question popup state
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState<'none' | 'correct' | 'wrong'>('none');
  const [feedbackPos, setFeedbackPos] = useState({x: 50, y: 50});
  const [bgScroll, setBgScroll] = useState(0);
  
  // Enemies (Mice replacing Snakes)
  const [enemyX, setEnemyX] = useState(120);
  const [enemyState, setEnemyState] = useState<'alive' | 'dead'>('alive');
  const [boxX, setBoxX] = useState(100);
  const [boxY] = useState(40);
  
  const isBoxActive = currentQuestionIndex % 2 === 0;
  const isEnemyActive = currentQuestionIndex % 2 === 1;

  const [playingQuestions, setPlayingQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Generate randomized questions and options when mode changes
    const sourceQuestions = mode === 'numerasi' ? questionsNumerasi : questionsLiterasi;
    
    const randomized = sourceQuestions.map(q => {
      const optionsWithStatus = q.opsi.map((opt, i) => ({ text: opt, isCorrect: i === q.jawabanBenar }));
      // Shuffle options
      const shuffledOptions = optionsWithStatus.sort(() => Math.random() - 0.5);
      return {
        ...q,
        opsi: shuffledOptions.map(o => o.text),
        jawabanBenar: shuffledOptions.findIndex(o => o.isCorrect)
      };
    }).sort(() => Math.random() - 0.5);

    setPlayingQuestions(randomized);
  }, [mode]);

  const currentQuestion = playingQuestions[currentQuestionIndex] || playingQuestions[0];
  
  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.code] = true;
    if ((e.code === 'KeyZ' || e.code === 'ArrowUp') && !isJumping && !showQuestion && !isAnimating) {
      setPlayerVelocityY(JUMP_FORCE);
      setIsJumping(true);
    }
    // Start game on any move key
    if (!isPlaying && !showQuestion && !isAnimating && ['ArrowRight', 'ArrowLeft', 'KeyZ', 'Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      setIsPlaying(true);
      setShowControls(false);
    }
  }, [isJumping, isPlaying, showQuestion, isAnimating]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.code] = false;
  }, []);

  const handleTouchStart = (action: string) => {
    if (!isPlaying && !showQuestion && !isAnimating) {
      setIsPlaying(true);
      setShowControls(false);
    }
    
    if (action === 'left') {
      keysPressed.current['ArrowLeft'] = true;
    } else if (action === 'right') {
      keysPressed.current['ArrowRight'] = true;
    } else if (action === 'down') {
      keysPressed.current['ArrowDown'] = true;
    } else if (action === 'jump' || action === 'up') {
      keysPressed.current[action === 'up' ? 'ArrowUp' : 'KeyZ'] = true;
      if (!isJumping && !showQuestion && !isAnimating) {
        setPlayerVelocityY(JUMP_FORCE);
        setIsJumping(true);
      }
    }
  };

  const handleTouchEnd = (action: string) => {
    if (action === 'left') {
      keysPressed.current['ArrowLeft'] = false;
    } else if (action === 'right') {
      keysPressed.current['ArrowRight'] = false;
    } else if (action === 'down') {
      keysPressed.current['ArrowDown'] = false;
    } else if (action === 'jump' || action === 'up') {
      keysPressed.current[action === 'up' ? 'ArrowUp' : 'KeyZ'] = false;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || showQuestion || isAnimating) return;

    let lastTime = performance.now();

    const update = (timestamp: number) => {
      const dt = timestamp - lastTime;
      lastTime = timestamp;

      setPlayerX(prev => {
        let newX = prev;
        if (keysPressed.current['ArrowRight']) {
          newX += MOVE_SPEED * (dt / 16);
          setFacingRight(true);
        }
        if (keysPressed.current['ArrowLeft']) {
          newX -= MOVE_SPEED * (dt / 16);
          setFacingRight(false);
        }
        
        // Scrolling boundaries
        const MAX_X = 50;
        if (newX > MAX_X && keysPressed.current['ArrowRight']) {
           const scrollAmt = MOVE_SPEED * (dt/16);
           setBgScroll(bg => bg - scrollAmt);
           setBoxX(b => b < -20 ? 120 : b - scrollAmt);
           setEnemyX(e => e < -20 && enemyState === 'alive' ? 120 : e - scrollAmt);
           return MAX_X;
        }

        if (newX < 5) newX = 5;
        if (newX > 99) newX = 99;
        return newX;
      });

      setPlayerY(prev => {
        let newY = prev - playerVelocityY * (dt/16);
        setPlayerVelocityY(v => v + GRAVITY * (dt/16));
        
        // Hit ground (which is y=0 in our logic, visually translated)
        if (newY <= 0) {
          newY = 0;
          setIsJumping(false);
          setPlayerVelocityY(0);
        }
        return newY;
      });

      // Collision detection with Question Box
      if (isBoxActive && playerY >= boxY - 20 && playerY <= boxY + 20 && Math.abs(playerX - boxX) < 8) {
         if (!showQuestion) { 
             setShowQuestion(true);
             setIsPlaying(false);
         }
      }

      // Collision with enemy (mouse) triggers question
      if (isEnemyActive && enemyState === 'alive' && playerY < 20 && Math.abs(playerX - enemyX) < 8) {
          if (!showQuestion) {
             setShowQuestion(true);
             setIsPlaying(false);
          }
      }

      // Simple enemy movement
      if (isEnemyActive && enemyState === 'alive') {
        setEnemyX(prev => {
            let nx = prev - 0.25 * (dt/16); // smooth slow walking speed
            if (nx < -20) return 120; 
            return nx;
        });
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, showQuestion, isAnimating, playerVelocityY, playerY, playerX, boxX, boxY, enemyX, isBoxActive, isEnemyActive, enemyState]);

  // Timer
  useEffect(() => {
    if (!isPlaying || showQuestion) return;
    const interval = setInterval(() => {
      setTime(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, showQuestion]);

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsAnimating(true);
    setShowQuestion(false);

    if (selectedAnswer === currentQuestion.jawabanBenar) {
      setAnswerStatus('correct');
      setScore(s => s + 500);
      setFeedbackEffect('correct');
      setFeedbackPos({x: Math.min(90, Math.max(10, isEnemyActive ? enemyX : boxX)), y: isEnemyActive ? 25 : boxY + 10});

      if (isEnemyActive) {
         setEnemyState('dead');
         playExplosionSound();
      } else {
         playExplosionSound(); // A bump sound for box would be better, but exploding is fine for now
      }

      // Spawn new question after animation
      setTimeout(() => {
         setFeedbackEffect('none');
         resumeGame(true);
      }, 2500);
    } else {
      setAnswerStatus('wrong');
      setLives(l => l - 1);
      setFeedbackEffect('wrong');
      setFeedbackPos({x: Math.min(90, Math.max(10, playerX)), y: playerY + 25});

      setTimeout(() => {
         setFeedbackEffect('none');
         resumeGame(false);
      }, 2500);
    }
  };

  const resumeGame = (wasCorrect: boolean) => {
    setSelectedAnswer(null);
    setAnswerStatus('idle');
    setIsPlaying(true);
    setIsAnimating(false);
    
    if (lives <= 0 && !wasCorrect) {
       // GAME OVER
       alert("Game Over!!");
       onHome();
       return;
    }
    
    if (wasCorrect) {
      if (currentQuestionIndex + 1 < playingQuestions.length) {
         const nextIdx = currentQuestionIndex + 1;
         setCurrentQuestionIndex(nextIdx);
         if (nextIdx % 2 === 0) {
             // Spawn box ahead
             const nextBoxX = 100;
             setBoxX(nextBoxX);
         } else {
             // Spawn enemy far away
             setEnemyX(120);
             setEnemyState('alive');
         }
      } else {
         // WON
         alert(`Selamat! Anda berhasil menyelesaikan semua soal!\nSkor Akhir: ${score}`);
         onHome();
      }
    }
  };

  // Render SVG Mouse instead of using image to ensure we have a mouse
  const TikusPixel = () => (
      <svg width="40" height="24" viewBox="0 0 40 24" className="rendering-pixelated drop-shadow-md">
        {/* Body */}
        <rect x="10" y="10" width="20" height="12" fill="#757575" />
        {/* Head */}
        <rect x="0" y="12" width="10" height="10" fill="#757575" />
        <rect x="4" y="14" width="2" height="2" fill="black" /> {/* Eye */}
        {/* Ears */}
        <rect x="6" y="8" width="4" height="4" fill="#616161" />
        <rect x="8" y="10" width="2" height="2" fill="#E0E0E0" />
        {/* Tail */}
        <rect x="30" y="18" width="8" height="2" fill="#9E9E9E" />
        {/* Legs */}
        <rect x="12" y="22" width="4" height="2" fill="#424242" />
        <rect x="24" y="22" width="4" height="2" fill="#424242" />
      </svg>
  );

  if (!currentQuestion) {
    return <div className="absolute inset-0 bg-black flex items-center justify-center text-white font-pixel">Loading...</div>;
  }

  return (
    <div className="absolute inset-0 font-pixel pointer-events-auto overflow-hidden bg-black">
      {/* Background Layer */}
      {currentQuestionIndex < 10 ? (
         // Level 1: Overworld
         <div 
            className="absolute inset-0 transition-all duration-1000 bg-sky-300"
         >
            {/* Simple simple clouds */}
            <div className="absolute top-10 left-10 w-32 h-10 bg-white/80 rounded-full blur-md" style={{ transform: `translateX(${(bgScroll * 0.5) % 100}vw)` }}></div>
            <div className="absolute top-24 right-20 w-40 h-16 bg-white/70 rounded-full blur-md" style={{ transform: `translateX(${(bgScroll * 0.3) % 100}vw)` }}></div>
            <div className="absolute top-8 left-1/2 w-48 h-12 bg-white/60 rounded-full blur-md" style={{ transform: `translateX(${(bgScroll * 0.4) % 100}vw)` }}></div>
         </div>
      ) : currentQuestionIndex < 20 ? (
         // Level 2: Sunset
         <div 
            className="absolute inset-0 transition-all duration-1000"
            style={{ 
                background: "linear-gradient(to bottom, #f97316 0%, #fcd34d 100%)",
            }}
         >
            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-orange-200/50 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[25%] w-full h-32 bg-orange-800/80 rounded-t-[100%] scale-150 blur-sm"></div>
         </div>
      ) : (
         // Level 3: Night/Castle
         <div 
            className="absolute inset-0 transition-all duration-1000 bg-indigo-950"
         >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
            <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-100 rounded-full blur-sm"></div>
            <div className="absolute bottom-0 w-full h-1/3 bg-indigo-600/30 blur-xl animate-pulse"></div>
         </div>
      )}
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex w-[95%] mx-auto justify-between items-start text-white text-lg md:text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-10" style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
        
        <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2">
               <Heart className="w-6 h-6 fill-red-500 text-red-500" />
               <span>x0{Math.max(0, lives)}</span>
            </div>
            <div className="mt-2">SCORE</div>
            <div className="text-yellow-400">{score.toString().padStart(5, '0')}</div>
        </div>

        <div className="flex flex-col gap-1 items-center">
            <div className="border-4 border-yellow-500 bg-black/50 px-6 py-2 rounded-lg text-yellow-500">
               {mode === 'numerasi' ? 'NUMERASI' : 'LITERASI'}
            </div>
            <div className="mt-2 text-sm text-yellow-300">Level {currentQuestionIndex + 1}/{playingQuestions.length}</div>
        </div>

        <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-2">
               <Coins className="w-6 h-6 fill-yellow-400 text-yellow-500" />
               <span>x00</span>
            </div>
            <div className="mt-2">TIME</div>
            <div className="text-yellow-400">{time}</div>
        </div>

      </div>

      {/* Controls Help */}
      {showControls && !showQuestion && !isAnimating && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] flex flex-col items-center gap-4 z-10" style={{ textShadow: "2px 2px 0 #000" }}>
            <h3 className="text-lg mb-4">CONTROLS</h3>
            <div className="flex gap-12">
               <div className="flex flex-col items-center">
                   <div className="flex bg-blue-900 border-2 border-white p-2 rounded text-white mb-2">Z</div>
                   <div className="text-sm">JUMP</div>
               </div>
               <div className="flex flex-col items-center">
                   <div className="flex gap-1 mb-2">
                      <div className="flex bg-blue-900 border-2 border-white p-2 rounded text-white">&lt;</div>
                      <div className="flex bg-blue-900 border-2 border-white p-2 rounded text-white">&gt;</div>
                   </div>
                   <div className="text-sm">MOVE</div>
               </div>
            </div>
        </div>
      )}

      {/* Game World (relative positioning for objects) */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden">
        
        {/* Ground padding to match visual */}
        <div className={`absolute bottom-0 w-full h-[25%] ${
             currentQuestionIndex < 10 ? 'bg-amber-100 border-t-8 border-green-500' 
           : currentQuestionIndex < 20 ? 'bg-orange-100 border-t-8 border-orange-500'
           : 'bg-indigo-100 border-t-8 border-indigo-500'
        }`} style={{ backgroundPosition: `${bgScroll}px 0` }}>
            {/* White ground texture patterns/plants */}
            {currentQuestionIndex < 10 && (
               <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(#ccc 15%, transparent 16%)", backgroundSize: "15px 15px", backgroundPosition: `${bgScroll}px 0` }}></div>
            )}
        </div> 

        {/* Decorative elements that scroll */}
        <div className="absolute inset-0 pointer-events-none transition-transform w-[200%]" style={{ transform: `translateX(${(bgScroll * 0.5) % 50}%)` }}>
          {currentQuestionIndex < 10 && (
              <>
                 {/* Bushes - repeated for scrolling */}
                 <div className="absolute w-12 h-16 bg-green-500 rounded-t-full bottom-[25%] left-[5%] border-4 border-black"></div>
                 <div className="absolute w-16 h-12 bg-green-600 rounded-t-full bottom-[25%] left-[22%] border-4 border-black"></div>
                 <div className="absolute w-8 h-10 bg-green-400 rounded-t-full bottom-[25%] left-[40%] border-4 border-black"></div>
                 
                 <div className="absolute w-12 h-16 bg-green-500 rounded-t-full bottom-[25%] left-[55%] border-4 border-black"></div>
                 <div className="absolute w-16 h-12 bg-green-600 rounded-t-full bottom-[25%] left-[72%] border-4 border-black"></div>
                 <div className="absolute w-8 h-10 bg-green-400 rounded-t-full bottom-[25%] left-[90%] border-4 border-black"></div>

                 {/* Floating Bricks */}
                 <div className="absolute w-24 h-8 bg-amber-700 bottom-[55%] left-[30%] border-y-2 border-black grid grid-cols-3">
                    <div className="border-x-2 border-black"></div>
                    <div className="border-x-2 border-black"></div>
                    <div className="border-x-2 border-black"></div>
                 </div>
                 
                 <div className="absolute w-24 h-8 bg-amber-700 bottom-[55%] left-[80%] border-y-2 border-black grid grid-cols-3">
                    <div className="border-x-2 border-black"></div>
                    <div className="border-x-2 border-black"></div>
                    <div className="border-x-2 border-black"></div>
                 </div>

                 {/* Pipe */}
                 <div className="absolute w-16 h-20 bg-green-500 bottom-[25%] left-[45%] border-4 border-black flex flex-col justify-end">
                    <div className="w-[110%] h-8 bg-green-500 border-4 border-black -ml-1"></div>
                 </div>
                 
                 <div className="absolute w-16 h-20 bg-green-500 bottom-[25%] left-[95%] border-4 border-black flex flex-col justify-end">
                    <div className="w-[110%] h-8 bg-green-500 border-4 border-black -ml-1"></div>
                 </div>
              </>
          )}
          {currentQuestionIndex >= 10 && currentQuestionIndex < 20 && (
              <>
                 <div className="absolute w-10 h-10 bg-orange-500 rounded-lg bottom-[25%] left-[30%] border-4 border-black rotate-45 transform origin-bottom"></div>
              </>
          )}
          
          {/* Goal Pole when finishing */}
          {currentQuestionIndex === playingQuestions.length - 1 && (
             <div className="absolute w-2 h-64 bg-gray-300 bottom-[25%] left-[110%] border-4 border-black flex items-start justify-end">
                <div className="w-12 h-8 bg-green-500 border-4 border-black -mr-12 rounded-r animate-pulse text-[10px] text-white flex items-center justify-center font-bold">GOAL</div>
             </div>
          )}
        </div>

        {/* Player */}
        <img 
            src="https://lh3.googleusercontent.com/d/1hIjytoG0YTSrfbqlROVC-zLEJ2xJAiXT" 
            alt="Player"
            referrerPolicy="no-referrer"
            className="absolute w-16 md:w-20 rendering-pixelated transition-transform"
            style={{
                left: `${playerX}%`,
                bottom: `calc(25% + ${playerY}px)`,
                transform: `translateX(-50%) ${facingRight ? 'scaleX(1)' : 'scaleX(-1)'}`
            }}
        />

        {/* Question Box */}
        {isBoxActive && (
          <div 
             className="absolute w-12 h-12 bg-amber-400 border-[3px] border-amber-900 border-b-amber-800 rounded-sm flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)] animate-bounce z-10"
             style={{
                 left: `${boxX}%`,
                 bottom: `calc(25% + ${boxY}px)`,
                 transform: `translateX(-50%)`,
                 boxShadow: 'inset -3px -3px 0px rgba(0,0,0,0.4), inset 3px 3px 0px rgba(255,255,255,0.4), 4px 4px 0 rgba(0,0,0,0.5)'
             }}
          >
              <span className="text-2xl text-amber-900 font-bold drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">?</span>
          </div>
        )}

        {/* Enemy (Tikus) */}
        {(isEnemyActive || enemyState === 'dead') && (
           <div 
              className="absolute transition-all z-10"
              style={{
                  left: `${enemyX}%`,
                  bottom: `25%`,
                  transform: `translateX(-50%)`,
                  animation: enemyState === 'alive' ? `gameWalk 0.5s infinite` : 'none'
              }}
           >
              {enemyState === 'alive' ? (
                 <img 
                    src="https://lh3.googleusercontent.com/d/1F12wPo9AH4XUQiLnYi5hvZyHUUf4YPzP" 
                    referrerPolicy="no-referrer"
                    className="w-12 rendering-pixelated drop-shadow-md object-contain" 
                    alt="Tikus" 
                 />
              ) : (
                 <div className="w-16 h-16 rounded-full flex justify-center items-center text-white font-pixel font-bold text-[10px]" style={{}}></div>
              )}
           </div>
        )}

        {/* Feedback Animation (Koruptor Kalah / Semangat) */}
        {feedbackEffect !== 'none' && (
           <div 
              className="absolute z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-1000 ease-out"
              style={{
                 left: `${feedbackPos.x}%`, 
                 bottom: `calc(25% + ${feedbackPos.y + 10}px)`, 
                 transform: 'translate(-50%, 0)',
                 animation: 'feedbackRise 2.5s ease-out forwards'
              }}
           >
              <div className={`text-xl md:text-3xl font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,1)] whitespace-nowrap px-4 py-2 rounded ${feedbackEffect === 'correct' ? 'text-yellow-300 bg-green-600/80' : 'text-white bg-red-600/80'}`}>
                 {feedbackEffect === 'correct' ? (isEnemyActive ? 'Koruptor Kalah!' : 'Kotak Terbuka!') : 'Semangat Lawan Koruptor!'}
              </div>
              <style>{`
                @keyframes gameWalk {
                   0% { transform: translateX(-50%) rotate(-5deg); }
                   50% { transform: translateX(-50%) rotate(5deg) translateY(-2px); }
                   100% { transform: translateX(-50%) rotate(-5deg); }
                }
                @keyframes feedbackRise {
                   0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; }
                   20% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
                   40% { transform: translate(-50%, -10px) scale(1); opacity: 1; }
                   80% { transform: translate(-50%, -30px); opacity: 1; }
                   100% { transform: translate(-50%, -50px); opacity: 0; }
                }
                @keyframes sprinklePop {
                   0% { transform: scale(0); opacity: 1; }
                   50% { transform: scale(1.5); opacity: 1; }
                   100% { transform: scale(0); opacity: 0; }
                }
              `}</style>
              {/* Sprinkles container */}
              <div className="absolute top-1/2 left-1/2 w-0 h-0">
                 {Array.from({length: 8}).map((_, i) => (
                    <div 
                       key={i}
                       className="absolute w-3 h-3 rounded-full"
                       style={{
                          backgroundColor: feedbackEffect === 'correct' ? ['#fcd34d', '#34d399', '#60a5fa'][i%3] : ['#ef4444', '#f87171', '#fca5a5'][i%3],
                          top: Math.sin(i * Math.PI / 4) * 40 - 6,
                          left: Math.cos(i * Math.PI / 4) * 40 - 6,
                          animation: `sprinklePop 1s ease-out infinite`
                       }}
                    />
                 ))}
                 
                 {/* Boom visual if enemy killed */}
                 {feedbackEffect === 'correct' && isEnemyActive && (
                    <div className="absolute -top-10 -left-10 w-20 h-20 bg-red-500 rounded-full flex justify-center items-center animate-ping text-white font-pixel font-bold text-xs" style={{ background: 'radial-gradient(circle, #ff0, #f00)' }}>BOOM!</div>
                 )}
              </div>
           </div>
        )}

      </div>

      {/* Interactive Question Modal */}
      {showQuestion && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-2 md:p-4 z-50 pointer-events-auto">
             <div className="bg-blue-900 border-4 border-white p-3 md:p-8 rounded-xl max-w-3xl w-full max-h-[96vh] flex flex-col text-white shadow-[8px_8px_0_rgba(0,0,0,1)]">
                 <div className="flex justify-between items-center bg-blue-950 p-2 md:p-3 rounded border-b-4 border-white mb-2 md:mb-6 shrink-0">
                    <h3 className="text-yellow-400 font-pixel text-xs md:text-base">TANTANGAN MAS RUSDI !</h3>
                    <div className="text-xs md:text-sm font-sans font-bold bg-white text-blue-900 px-2 py-1 rounded-full uppercase">{mode}</div>
                 </div>
                 
                 <div className="font-sans mb-2 md:mb-6 bg-white/10 p-3 md:p-4 rounded text-sm md:text-lg border-l-4 border-yellow-400 shadow-inner overflow-y-auto shrink-0 max-h-[35vh]">
                    <p className="mb-2 md:mb-4 text-gray-200 leading-snug md:leading-relaxed font-medium">{currentQuestion.narasi}</p>
                    <p className="font-bold text-base md:text-xl text-yellow-300 drop-shadow-md">{currentQuestion.pertanyaan}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 font-sans font-semibold overflow-y-auto">
                    {currentQuestion.opsi.map((opt, i) => {
                       const isSelected = selectedAnswer === i;
                       const isCorrect = answerStatus !== 'idle' && i === currentQuestion.jawabanBenar;
                       const isWrong = answerStatus === 'wrong' && isSelected;

                       let btnClasses = "p-2 md:p-4 rounded-lg border-b-4 text-left transition-all flex items-center justify-between text-sm md:text-base ";
                       
                       if (answerStatus === 'idle') {
                           btnClasses += isSelected 
                              ? "bg-yellow-500 text-blue-900 border-yellow-700 " 
                              : "bg-blue-800 text-white border-blue-950 hover:bg-blue-700 hover:translate-y-1 hover:border-b-2 ";
                       } else {
                           if (isCorrect) {
                               btnClasses += "bg-green-500 text-white border-green-700 scale-[1.02] md:scale-105 ";
                           } else if (isWrong) {
                               btnClasses += "bg-red-500 text-white border-red-700 opacity-50 ";
                           } else {
                               btnClasses += "bg-blue-800 text-white border-blue-950 opacity-50 ";
                           }
                       }

                       return (
                           <button 
                              key={i} 
                              disabled={answerStatus !== 'idle'}
                              onClick={() => setSelectedAnswer(i)}
                              className={btnClasses}
                           >
                              <span className="flex items-center gap-2 md:gap-3">
                                 <span className="bg-black/20 w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center text-xs md:text-sm">{['A', 'B', 'C', 'D'][i]}</span>
                                 <span>{opt}</span>
                              </span>
                              {isCorrect && <CheckCircle2 className="text-white shrink-0 ml-2 w-5 h-5 md:w-6 md:h-6" />}
                              {isWrong && <XCircle className="text-white shrink-0 ml-2 w-5 h-5 md:w-6 md:h-6" />}
                           </button>
                       )
                    })}
                 </div>

                 {answerStatus === 'idle' && (
                     <div className="mt-4 md:mt-8 flex justify-end shrink-0">
                         <button 
                             disabled={selectedAnswer === null}
                             onClick={handleAnswerSubmit}
                             className={`font-pixel py-2 px-6 md:py-3 md:px-8 rounded border-4 transition-all flex items-center gap-2 text-sm md:text-base ${selectedAnswer !== null ? 'bg-green-500 border-white text-white hover:bg-green-600 hover:scale-105 shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'bg-gray-500 border-gray-400 text-gray-300 opacity-50 cursor-not-allowed'}`}
                         >
                             JAWAB <ArrowRight size={20} />
                         </button>
                     </div>
                 )}

                 {answerStatus === 'wrong' && (
                     <div className="mt-4 md:mt-6 text-center animate-bounce shrink-0">
                         <p className="font-pixel text-red-400 text-base md:text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">YAH SALAH! NYAWA -1</p>
                     </div>
                 )}
                 {answerStatus === 'correct' && (
                     <div className="mt-4 md:mt-6 text-center animate-bounce shrink-0">
                         <p className="font-pixel text-green-400 text-base md:text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">BENAR! SCORE +500</p>
                     </div>
                 )}

             </div>
          </div>
      )}

      {/* Mobile Controls Overlay */}
      {(!showQuestion && !isAnimating) && (
         <div className="absolute bottom-4 left-4 right-4 flex justify-between z-50 md:hidden opacity-75 select-none touch-none pointer-events-auto">
            <div className="relative w-40 h-40">
               <div className="absolute w-14 h-14 bg-black/60 border-2 border-white rounded flex justify-center items-center text-white top-0 left-1/2 -translate-x-1/2 active:bg-white/40"
                  onPointerDown={(e) => {
                     (e.target as HTMLElement).setPointerCapture(e.pointerId);
                     handleTouchStart('up');
                  }}
                  onPointerUp={(e) => {
                     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                     handleTouchEnd('up');
                  }}
                  onPointerCancel={() => handleTouchEnd('up')}
                  onContextMenu={(e) => e.preventDefault()}
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
               </div>
               <div className="absolute w-14 h-14 bg-black/60 border-2 border-white rounded flex justify-center items-center text-white bottom-0 left-1/2 -translate-x-1/2 active:bg-white/40"
                  onPointerDown={(e) => {
                     (e.target as HTMLElement).setPointerCapture(e.pointerId);
                     handleTouchStart('down');
                  }}
                  onPointerUp={(e) => {
                     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                     handleTouchEnd('down');
                  }}
                  onPointerCancel={() => handleTouchEnd('down')}
                  onContextMenu={(e) => e.preventDefault()}
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
               </div>
               <div className="absolute w-14 h-14 bg-black/60 border-2 border-white rounded flex justify-center items-center text-white left-0 top-1/2 -translate-y-1/2 active:bg-white/40"
                  onPointerDown={(e) => {
                     (e.target as HTMLElement).setPointerCapture(e.pointerId);
                     handleTouchStart('left');
                  }}
                  onPointerUp={(e) => {
                     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                     handleTouchEnd('left');
                  }}
                  onPointerCancel={() => handleTouchEnd('left')}
                  onContextMenu={(e) => e.preventDefault()}
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </div>
               <div className="absolute w-14 h-14 bg-black/60 border-2 border-white rounded flex justify-center items-center text-white right-0 top-1/2 -translate-y-1/2 active:bg-white/40"
                  onPointerDown={(e) => {
                     (e.target as HTMLElement).setPointerCapture(e.pointerId);
                     handleTouchStart('right');
                  }}
                  onPointerUp={(e) => {
                     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                     handleTouchEnd('right');
                  }}
                  onPointerCancel={() => handleTouchEnd('right')}
                  onContextMenu={(e) => e.preventDefault()}
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
               </div>
            </div>
            
            <div className="flex gap-4 items-end pb-4 pr-2">
               <button 
                  type="button"
                  onPointerDown={(e) => {
                     (e.target as HTMLElement).setPointerCapture(e.pointerId);
                     handleTouchStart('jump');
                  }}
                  onPointerUp={(e) => {
                     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                     handleTouchEnd('jump');
                  }}
                  onPointerCancel={() => handleTouchEnd('jump')}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-20 h-20 bg-black/60 border-2 border-white rounded-full flex items-center justify-center text-white backdrop-blur-sm font-pixel text-2xl active:bg-white/40 active:scale-95 transition-transform shadow-lg"
               >
                  Z
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
