import { Calendar, ShoppingCart, BarChart3, Settings, Users, LayoutGrid, Ticket, Award, User } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, lowStockCount }) {
  return (
    <nav className="w-64 md:w-20 lg:w-64 bg-black text-white flex flex-col h-full shadow-xl">
      <div className="p-4 lg:p-6 flex flex-col items-center gap-3 border-b border-zinc-800">
        <div className="w-16 h-16 md:w-12 md:h-12 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-white bg-black shrink-0 flex items-center justify-center">
          <img 
            src={`${import.meta.env.BASE_URL}Barbearia%20do%20Cesar%20LOGO.jpg`}
            alt="Logo" 
            className="w-full h-full object-cover scale-110"
            onError={(e) => { 
              if (!e.target.src.includes('via.placeholder')) {
                e.target.src = 'https://via.placeholder.com/150x150.png?text=LOGO'; 
              }
            }}
          />
        </div>
        <h1 className="text-white font-black text-xl md:hidden lg:block tracking-widest text-center uppercase">
          Barbearia <br/><span className="text-zinc-500 text-sm">Do César</span>
        </h1>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <LayoutGrid className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Dashboard</span>
        </button>

        <button onClick={() => setActiveTab('agenda')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'agenda' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <Calendar className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Agenda</span>
        </button>
        
        <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'pos' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <ShoppingCart className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Comanda</span>
        </button>

        <button onClick={() => setActiveTab('clients')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'clients' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <Users className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Clientes</span>
        </button>

        <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'coupons' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <Ticket className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Cupons</span>
        </button>

        <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'reports' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <BarChart3 className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Caixa</span>
        </button>

        <button onClick={() => setActiveTab('performance')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'performance' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <Award className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Desempenho</span>
        </button>

        <button onClick={() => setActiveTab('rodrigo')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'rodrigo' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <User className="w-5 h-5 shrink-0" /><span className="md:hidden lg:block">Rodrigo</span>
        </button>

        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-colors relative ${activeTab === 'settings' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <div className="relative shrink-0">
            <Settings className="w-5 h-5" />
            {lowStockCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>}
          </div>
          <span className="md:hidden lg:block">Ajustes</span>
        </button>
      </div>
    </nav>
  );
}
