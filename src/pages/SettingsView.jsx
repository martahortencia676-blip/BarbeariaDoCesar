import { useState } from 'react';
import { Scissors, Beer, Trash2, Cloud, Search, UserPlus, Users, Mail } from 'lucide-react';
import { toast } from '../components/Toast';
import { generateId } from '../utils/helpers';

export default function SettingsView({
  barbers,
  setBarbers,
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
  setManualTransactions,
  standbyList,
  recoveryEmail,
  setRecoveryEmail,
  darkMode
}) {
  const [sName, setSName] = useState('');
  const [sPrice, setSPrice] = useState('');
  const [sDur, setSDur] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bName, setBName] = useState('');
  const [bCommission, setBCommission] = useState('50');
  const [emailInput, setEmailInput] = useState('');

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
            <p className="text-sm text-blue-700 font-medium">Seus dados já ficam salvos automaticamente no Firebase. Use o botão abaixo para gerar um backup em PDF com todos os dados do sistema — serviços, produtos, clientes, transações, agendamentos, cupons e lista de espera.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                const fmt = (d) => {
                  if (!d) return '-';
                  const dt = d instanceof Date ? d : new Date(d);
                  if (isNaN(dt)) return '-';
                  return dt.toLocaleDateString('pt-BR');
                };
                const fmtH = (d) => {
                  if (!d) return '-';
                  const dt = d instanceof Date ? d : new Date(d);
                  if (isNaN(dt)) return '-';
                  return dt.toLocaleString('pt-BR');
                };
                const bName = (id) => (barbers || []).find(b => b.id === id)?.name || id || '-';
                const now = new Date();
                const dataStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
                
                const tbl = (headers, rows) => `
                  <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                  <tbody>${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="text-align:center;color:#999">Nenhum registro</td></tr>`}</tbody></table>`;

                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Backup Barbearia do César - ${fmt(now)}</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: Arial, sans-serif; font-size: 11px; color: #222; padding: 20px; }
                  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px; }
                  .sub { text-align: center; color: #666; margin-bottom: 20px; font-size: 10px; }
                  h2 { font-size: 13px; background: #222; color: #fff; padding: 5px 10px; margin: 16px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                  th { background: #f0f0f0; text-align: left; padding: 4px 6px; border: 1px solid #ccc; font-size: 10px; text-transform: uppercase; }
                  td { padding: 3px 6px; border: 1px solid #ddd; font-size: 10px; }
                  tr:nth-child(even) { background: #fafafa; }
                  .total-row { font-weight: bold; background: #f5f5f5; }
                  .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }
                  @media print { body { padding: 10px; } }
                </style></head><body>
                <h1>☆ Barbearia do César — Backup</h1>
                <p class="sub">Exportado em ${dataStr}</p>

                <h2>Serviços (${services.length})</h2>
                ${tbl(['Nome', 'Preço', 'Duração'], services.map(s => [s.name, 'R$ ' + s.price.toFixed(2), s.duration + ' min']))}

                <h2>Produtos (${products.length})</h2>
                ${tbl(['Nome', 'Preço', 'Estoque'], products.map(p => [p.name, 'R$ ' + p.price.toFixed(2), p.stock]))}

                <h2>Clientes (${customers.length})</h2>
                ${tbl(['Nome', 'Telefone', 'Nascimento', 'Visitas', 'Desde'], customers.map(c => [c.name, c.phone || '-', c.birthDate || '-', c.visits || 0, c.joinDate || '-']))}

                <h2>Transações (${transactions.length})</h2>
                ${tbl(['Data', 'Cliente', 'Itens', 'Total', 'Pagamento'], transactions.map(t => [
                  fmtH(t.date),
                  t.customerName || '-',
                  (t.items || []).map(i => i.item?.name || '?').join(', '),
                  'R$ ' + (t.total || 0).toFixed(2),
                  ({pix:'PIX', credit:'Crédito', debit:'Débito', cash:'Dinheiro'})[t.paymentMethod] || t.paymentMethod || '-'
                ]))}

                <h2>Fluxo Manual (${manualTransactions.length})</h2>
                ${tbl(['Data', 'Tipo', 'Descrição', 'Valor'], manualTransactions.map(m => [
                  fmtH(m.date),
                  m.type === 'in' ? '↑ Entrada' : '↓ Saída',
                  m.description || '-',
                  'R$ ' + (m.amount || 0).toFixed(2)
                ]))}

                <h2>Agendamentos (${appointments.length})</h2>
                ${tbl(['Data', 'Hora', 'Cliente', 'Serviço', 'Barbeiro', 'Status'], appointments.map(a => {
                  const srv = services.find(s => s.id === a.serviceId);
                  return [a.date, a.time, a.customerName, srv?.name || a.serviceId, bName(a.barberId), ({scheduled:'Agendado','in-service':'Atendendo',completed:'Concluído'})[a.status] || a.status];
                }))}

                <h2>Cupons (${coupons.length})</h2>
                ${tbl(['Nome', 'Tipo', 'Valor', 'Usado', 'Criado'], coupons.map(c => [
                  c.name,
                  ({percentage:'Porcentagem', fixed:'Fixo', 'free-service':'Serviço Grátis'})[c.type] || c.type,
                  c.type === 'percentage' ? c.value + '%' : 'R$ ' + (c.value || 0).toFixed(2),
                  c.used ? 'Sim' : 'Não',
                  fmtH(c.createdAt)
                ]))}

                <h2>Lista de Espera (${(standbyList || []).length})</h2>
                ${tbl(['Nome', 'Telefone', 'Registrado', 'Disponível às'], (standbyList || []).map(s => [
                  s.name, s.phone || '-', fmtH(s.registeredAt), s.availableAt || '-'
                ]))}

                <div class="footer">Barbearia do César — Backup gerado automaticamente pelo sistema</div>
                </body></html>`;

                const printWin = window.open('', '_blank');
                printWin.document.write(html);
                printWin.document.close();
                printWin.onload = () => printWin.print();
                toast('PDF aberto para impressão!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              Exportar Backup (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Gerenciar Barbeiros */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Users className="w-6 h-6" /> Gerenciar Barbeiros
        </h3>
        <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'}`}>
          <div className="space-y-3 mb-6">
            {barbers.map(b => (
              <div key={b.id} className={`flex justify-between items-center p-4 rounded-xl border ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                <div>
                  <p className={`font-black text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{b.name} {b.isOwner && <span className="text-xs bg-black text-white px-2 py-0.5 rounded ml-2">DONO</span>}</p>
                  <p className={`text-xs font-bold mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Comissão: {(b.commission * 100).toFixed(0)}%</p>
                </div>
                {!b.isOwner && (
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja remover ${b.name}? Essa ação não pode ser desfeita.`)) {
                        setBarbers(barbers.filter(x => x.id !== b.id));
                        toast(`${b.name} removido`);
                      }
                    }}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!bName) return;
            const comm = parseFloat(bCommission) / 100;
            if (isNaN(comm) || comm < 0 || comm > 1) { toast('Comissão inválida (0-100%)'); return; }
            setBarbers([...barbers, { id: 'b' + Date.now(), name: bName.trim(), commission: comm, isOwner: false }]);
            setBName('');
            setBCommission('50');
            toast('Barbeiro adicionado');
          }} className={`p-4 rounded-xl border flex flex-col gap-3 ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200'}`}>
            <div className="flex gap-3">
              <input type="text" placeholder="Nome do Barbeiro" value={bName} onChange={e => setBName(e.target.value)} className={`flex-1 p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} required />
              <input type="number" placeholder="Comissão %" min="0" max="100" value={bCommission} onChange={e => setBCommission(e.target.value)} className={`w-28 p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} />
            </div>
            <button type="submit" className="bg-black text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Adicionar Barbeiro
            </button>
          </form>
        </div>
      </div>

      {/* E-mail de Recuperação */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-6 h-6" /> E-mail de Recuperação
        </h3>
        <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'}`}>
          <div className={`border-l-4 p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-400'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Cadastre um e-mail para recuperar sua senha caso esqueça. Na tela de login, clique em "Esqueceu a senha?" e informe este e-mail.</p>
          </div>
          {recoveryEmail && (
            <p className={`text-sm font-bold mb-4 ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>E-mail atual: <span className={`${darkMode ? 'text-white' : 'text-black'}`}>{recoveryEmail}</span></p>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!emailInput) return;
            setRecoveryEmail(emailInput.trim());
            setEmailInput('');
            toast('E-mail de recuperação salvo!');
          }} className="flex gap-3">
            <input type="email" placeholder="seu@email.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} className={`flex-1 p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-900 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} required />
            <button type="submit" className="bg-black text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors">Salvar</button>
          </form>
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
