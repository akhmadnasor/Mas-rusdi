import { Play } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-bottom flex flex-col items-center justify-center pointer-events-auto overflow-hidden px-4"
      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1QFtMonDKFdAr6xH3wMSGouoggTF0Zqso')" }}
    >
      <div className="z-10 text-center flex flex-col items-center mb-8 md:mb-16">
        <h1 className="font-pixel text-[2rem] sm:text-5xl md:text-7xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8" style={{ textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}>
          <div>
            <span className="text-red-500">M</span>
            <span className="text-blue-500">R</span>
          </div>
          <div>
            <span className="text-green-500">A</span>
            <span className="text-yellow-400">D</span>
            <span className="text-blue-500">V</span>
            <span className="text-green-500">E</span>
            <span className="text-red-500">N</span>
            <span className="text-yellow-400">T</span>
            <span className="text-blue-500">U</span>
            <span className="text-green-500">R</span>
            <span className="text-red-500">E</span>
          </div>
        </h1>
        <p className="font-pixel text-base sm:text-xl md:text-2xl mt-4 max-w-full truncate text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
          "Mas Rusdi Adventure"
        </p>
      </div>

      <div className="z-10 text-center animate-bounce">
        <button 
          onClick={onStart} 
          className="bg-[#c2c2ff] border-4 border-red-500 p-3 px-6 md:p-4 md:px-12 hover:bg-[#a0a0ff] active:scale-95 transition-transform text-[#0000a0] font-pixel shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center gap-3 md:gap-4"
        >
          <Play className="w-6 h-6 md:w-8 md:h-8 fill-current text-green-600" /> 
          <span className="text-lg md:text-xl">LANJUT</span>
        </button>
      </div>

      {/* Character standing on ground */}
      <img 
        src="https://lh3.googleusercontent.com/d/1hIjytoG0YTSrfbqlROVC-zLEJ2xJAiXT" 
        alt="Mas Rusdi" 
        referrerPolicy="no-referrer"
        className="absolute bottom-[20%] md:bottom-[25%] left-[5%] md:left-[20%] w-20 sm:w-24 md:w-32 rendering-pixelated z-0" 
      />
    </div>
  );
}
