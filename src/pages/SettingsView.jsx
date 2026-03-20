import { useState } from 'react';
import { Scissors, Beer, Trash2, Calendar, Cloud, Search } from 'lucide-react';
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

      {/* Integração Google Calendar */}
      <div className="mt-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-6 h-6" /> Google Calendar Sync
        </h3>
        <div className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-700 font-bold uppercase mb-3">≡ Configuração Necessária</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-2 font-medium">
              <li>Criar um projeto no Google Cloud Console</li>
              <li>Habilitar a Google Calendar API</li>
              <li>Configurar credenciais OAuth 2.0</li>
              <li>Adicionar o Client ID e Client Secret abaixo</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Client ID</label>
              <input
                type="text"
                placeholder="Seu Google Client ID"
                className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Client Secret</label>
              <input
                type="password"
                placeholder="Seu Google Client Secret"
                className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors">
              Conectar Google
            </button>
            <span className="text-sm text-zinc-500 font-medium">Status: Não conectado</span>
          </div>

          <div className="bg-zinc-50 p-4 rounded-lg">
            <h4 className="font-bold text-black mb-3 uppercase text-sm tracking-wider">Funcionalidades</h4>
            <ul className="text-sm text-zinc-600 space-y-2 list-disc list-inside font-medium">
              <li>Sincronização bidirecional de agendamentos</li>
              <li>Criação automática de eventos no Calendar</li>
              <li>Atualização de status automática</li>
              <li>Lembretes via Google Calendar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backup em Cloud */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Cloud className="w-6 h-6" /> Backup em Cloud
        </h3>
        <div className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700 font-bold uppercase mb-3">≈ Segurança dos Dados</p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-2 font-medium">
              <li>Backups automáticos diários</li>
              <li>Armazenamento seguro na nuvem</li>
              <li>Criptografia de dados</li>
              <li>Restauração fácil quando necessário</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Provedor de Cloud</label>
              <select className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm bg-white">
                <option>Firebase Firestore</option>
                <option>AWS S3</option>
                <option>Google Cloud Storage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">API Key</label>
              <input
                type="password"
                placeholder="Sua chave de API"
                className="w-full p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors">
              Configurar Backup
            </button>
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
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              Fazer Backup Agora
            </button>
            <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider cursor-pointer transition-colors">
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
                          alert('Backup restaurado com sucesso!');
                        }
                      } catch (error) {
                        alert('Erro ao restaurar backup: arquivo inválido');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-zinc-50 p-4 rounded-lg">
            <h4 className="font-bold text-black mb-3 uppercase text-sm tracking-wider">Incluir no Backup</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <label className="flex items-center p-2 hover:bg-zinc-100 rounded cursor-pointer">
                <input type="checkbox" className="mr-3 w-4 h-4 cursor-pointer" defaultChecked />
                <span className="text-zinc-700 font-medium">Clientes</span>
              </label>
              <label className="flex items-center p-2 hover:bg-zinc-100 rounded cursor-pointer">
                <input type="checkbox" className="mr-3 w-4 h-4 cursor-pointer" defaultChecked />
                <span className="text-zinc-700 font-medium">Agendamentos</span>
              </label>
              <label className="flex items-center p-2 hover:bg-zinc-100 rounded cursor-pointer">
                <input type="checkbox" className="mr-3 w-4 h-4 cursor-pointer" defaultChecked />
                <span className="text-zinc-700 font-medium">Transações</span>
              </label>
            </div>
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
