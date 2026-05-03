import { Play } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-bottom flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1QFtMonDKFdAr6xH3wMSGouoggTF0Zqso')" }}
    >
      <div className="absolute top-[10%] text-center">
        <h1 className="font-pixel text-5xl md:text-7xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest text-shadow-xl" style={{ textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}>
          <span className="text-red-500">M</span>
          <span className="text-blue-500">R</span>
          <span className="text-transparent">_</span>
          <span className="text-green-500">A</span>
          <span className="text-yellow-400">D</span>
          <span className="text-blue-500">V</span>
          <span className="text-green-500">E</span>
          <span className="text-red-500">N</span>
          <span className="text-yellow-400">T</span>
          <span className="text-blue-500">U</span>
          <span className="text-green-500">R</span>
          <span className="text-red-500">E</span>
        </h1>
        <p className="font-pixel text-xl md:text-2xl mt-4 text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
          "Mas Rusdi Adventure"
        </p>
      </div>

      {/* Character standing on ground */}
      <img 
        src="https://lh3.googleusercontent.com/d/1hIjytoG0YTSrfbqlROVC-zLEJ2xJAiXT" 
        alt="Mas Rusdi" 
        referrerPolicy="no-referrer"
        className="absolute bottom-[25%] left-[20%] w-24 md:w-32 rendering-pixelated" 
      />

      <div className="absolute bottom-[40%] md:bottom-[45%] left-1/2 -translate-x-1/2 text-center animate-bounce">
        <button 
          onClick={onStart} 
          className="bg-[#c2c2ff] border-4 border-red-500 p-4 px-8 md:px-12 hover:bg-[#a0a0ff] active:scale-95 transition-transform text-[#0000a0] font-pixel shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center gap-4"
        >
          <Play className="w-8 h-8 fill-current text-green-600" /> 
          <span className="text-xl">LANJUT</span>
        </button>
      </div>
    </div>
  );
}
