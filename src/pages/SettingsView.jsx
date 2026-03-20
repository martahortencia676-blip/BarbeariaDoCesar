import { useState } from 'react';
import { Scissors, Beer, Trash2, Cloud, Search } from 'lucide-react';
import { toast } from '../components/Toast';
import { generateId } from '../utils/helpers';

export default function SettingsView({
  services,
  setServices,
  products,
  setProducts,
  customers,
  setCustomers,
  transactions,
  setTransactions,
  appointments,
  setAppointments,
  coupons,
  setCoupons,
  manualTransactions,
  setManualTransactions
}) {
  const [sName, setSName] = useState('');
  const [sPrice, setSPrice] = useState('');
  const [sDur, setSDur] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddService = (e) => {
    e.preventDefault();
    if (!sName || !sPrice) return;
    setServices([...services, { id: generateId(), name: sName, price: parseFloat(sPrice), duration: parseInt(sDur || 30), type: 'service', commissionable: true }]);
    setSName('');
    setSPrice('');
    setSDur('');
    toast('Serviço adicionado');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!pName || !pPrice) return;
    setProducts([...products, { id: generateId(), name: pName, price: parseFloat(pPrice), stock: parseInt(pStock || 0), minStock: 5, type: 'product' }]);
    setPName('');
    setPPrice('');
    setPStock('');
    toast('Produto adicionado');
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-3 mb-8">Configurações & Tabela de Preços</h2>
        
        {/* Pesquisa unificada */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar serviços e produtos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-zinc-300 rounded-xl focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm bg-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-black mb-4 text-black uppercase tracking-wider flex items-center gap-2"><Scissors className="w-5 h-5"/> Tabela de Serviços</h3>
          <form onSubmit={handleAddService} className="bg-white p-6 rounded-xl border border-zinc-300 mb-4 flex flex-col gap-4">
            <input type="text" placeholder="Nome do Serviço" value={sName} onChange={e=>setSName(e.target.value)} className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" required />
            <div className="flex gap-3">
              <input type="number" placeholder="Preço (R$)" step="0.01" value={sPrice} onChange={e=>setSPrice(e.target.value)} className="w-1/2 p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" required />
              <input type="number" placeholder="Tempo (min)" value={sDur} onChange={e=>setSDur(e.target.value)} className="w-1/2 p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
            </div>
            <button type="submit" className="bg-black text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors">Adicionar Serviço</button>
          </form>
          <div className="bg-white rounded-xl border border-zinc-300 overflow-hidden max-h-96 overflow-y-auto">
            {(() => {
              const filtered = services.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
              return filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <p className="font-bold text-sm uppercase">{searchQuery ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}</p>
              </div>
            ) : (
              filtered.map(s => (
                <div key={s.id} className="flex justify-between items-center p-4 border-b border-zinc-200 last:border-0 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-bold text-black text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-500 font-bold mt-1">{s.duration} min</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-black text-sm whitespace-nowrap">R$ {s.price.toFixed(2)}</span>
                    <button onClick={() => { setServices(services.filter(x => x.id !== s.id)); toast('Serviço removido'); }} className="text-zinc-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))
            );
            })()}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black mb-4 text-black uppercase tracking-wider flex items-center gap-2"><Beer className="w-5 h-5"/> Estoque & Vendas</h3>
          <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl border border-zinc-300 mb-4 flex flex-col gap-4">
            <input type="text" placeholder="Nome do Produto" value={pName} onChange={e=>setPName(e.target.value)} className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" required />
            <div className="flex gap-3">
              <input type="number" placeholder="Preço (R$)" step="0.01" value={pPrice} onChange={e=>setPPrice(e.target.value)} className="w-1/2 p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" required />
              <input type="number" placeholder="Estoque Inicial" value={pStock} onChange={e=>setPStock(e.target.value)} className="w-1/2 p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
            </div>
            <button type="submit" className="bg-black text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors">Adicionar Produto</button>
          </form>
          <div className="bg-white rounded-xl border border-zinc-300 overflow-hidden max-h-96 overflow-y-auto">
            {(() => {
              const filtered = products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
              return filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <p className="font-bold text-sm uppercase">{searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
              </div>
            ) : (
              filtered.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 border-b border-zinc-200 last:border-0 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-bold text-black text-sm">{p.name}</p>
                    <p className="text-xs text-zinc-500 font-bold mt-1">Estoque: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-black text-sm whitespace-nowrap">R$ {p.price.toFixed(2)}</span>
                    <button onClick={() => { setProducts(products.filter(x => x.id !== p.id)); toast('Produto removido'); }} className="text-zinc-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))
            );
            })()}
          </div>
        </div>
      </div>

      {/* Backup Local */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Cloud className="w-6 h-6" /> Backup dos Dados
        </h3>
        <div className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700 font-bold uppercase mb-2">ℹ Como funciona</p>
            <p className="text-sm text-blue-700 font-medium">Seus dados já ficam salvos automaticamente no Firebase. Use as opções abaixo para exportar um backup local (arquivo JSON) ou restaurar dados de um backup anterior.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                const data = {
                  services,
                  products,
                  customers,
                  transactions,
                  appointments,
                  coupons,
                  manualTransactions,
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup-barbearia-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast('Backup exportado!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              Exportar Backup
            </button>
            <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider cursor-pointer transition-colors text-center">
              Restaurar Backup
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
                          setServices(data.services || []);
                          setProducts(data.products || []);
                          setCustomers(data.customers || []);
                          setTransactions(data.transactions || []);
                          setAppointments(data.appointments || []);
                          setCoupons(data.coupons || []);
                          setManualTransactions(data.manualTransactions || []);
                          toast('Backup restaurado com sucesso!');
                        }
                      } catch (error) {
                        toast('Erro ao restaurar: arquivo inválido', 'error');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Limpar Dados do Firebase */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-6 h-6" /> Limpar Dados
        </h3>
        <div className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-bold uppercase mb-2">⚠ Atenção</p>
            <p className="text-sm text-red-700 font-medium">Essa ação apaga todos os dados operacionais (clientes, transações, agendamentos, cupons e fluxo manual). Os serviços e produtos serão mantidos.</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja apagar TODOS os dados operacionais? Essa ação não pode ser desfeita.')) {
                setCustomers([]);
                setTransactions([]);
                setAppointments([]);
                setCoupons([]);
                setManualTransactions([]);
                toast('Dados limpos com sucesso!');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
          >
            Limpar Todos os Dados Operacionais
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
