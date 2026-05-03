import { GameMode } from "../App";
import { ArrowLeft } from "lucide-react";

interface ModeScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

export default function ModeScreen({ onSelectMode, onBack }: ModeScreenProps) {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-bottom flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1QFtMonDKFdAr6xH3wMSGouoggTF0Zqso')" }}
    >
      <div className="bg-black/80 p-8 pt-10 rounded-xl border-4 border-white text-center flex flex-col items-center w-[90%] max-w-lg mx-4 relative shadow-[8px_8px_0_rgba(0,0,0,1)]">
        
        <button 
          onClick={onBack}
          className="absolute top-[-20px] left-[-20px] bg-red-600 border-4 border-white rounded-full p-2 text-white hover:bg-red-700 hover:scale-110 transition-transform shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={32} />
        </button>

        <h2 className="font-pixel text-2xl md:text-3xl text-yellow-400 mb-10 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
          PILIH MODE
        </h2>
        
        <button 
          onClick={() => onSelectMode('numerasi')} 
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 border-4 border-white rounded-lg p-6 mb-6 text-white font-pixel text-xl shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
        >
          NUMERASI
        </button>
        
        <button 
          onClick={() => onSelectMode('literasi')} 
          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 border-4 border-white rounded-lg p-6 text-white font-pixel text-xl shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
        >
          LITERASI
        </button>
      </div>
    </div>
  );
}
