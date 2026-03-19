import { Scissors } from 'lucide-react';

export default function CoverScreen({ onEnter }) {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl mb-8 flex items-center justify-center bg-black">
          <img 
            src="/Barbearia%20do%20Cesar%20LOGO.jpg" 
            alt="Barbearia do César" 
            className="w-full h-full object-cover scale-110"
            onError={(e) => { 
              if (!e.target.src.includes('via.placeholder')) {
                e.target.src = 'https://via.placeholder.com/400x400.png?text=BARBEARIA+DO+C%C3%89SAR'; 
              }
            }}
          />
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black mb-10 tracking-[0.2em] text-center uppercase">
          Sistema de Gestão
        </h1>
        <button 
          onClick={onEnter} 
          className="w-full bg-white text-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
        >
          Acessar Sistema <Scissors className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
