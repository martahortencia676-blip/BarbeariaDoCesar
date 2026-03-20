import { useState } from 'react';
import { Scissors, Beer, Trash2, Cloud, Search, UserPlus, Users, Mail } from 'lucide-react';
import { toast } from '../components/Toast';
import { generateId } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';

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
  recoveryEmails,
  setRecoveryEmails,
  darkMode,
  cesarPassword,
  emailjsConfig,
  setEmailjsConfig,
  userRole,
  loginLogs,
  setLoginLogs
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
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletingBarber, setDeletingBarber] = useState(null);
  const [ejServiceId, setEjServiceId] = useState(emailjsConfig?.serviceId || '');
  const [ejTemplateId, setEjTemplateId] = useState(emailjsConfig?.templateId || '');
  const [ejPublicKey, setEjPublicKey] = useState(emailjsConfig?.publicKey || '');
  const [cleanupModal, setCleanupModal] = useState(false);

  const generateBarberPDF = (barber) => {
    const bTxns = transactions.filter(t => (t.items || []).some(i => i.barberId === barber.id));
    const fmtH = (d) => { const dt = d instanceof Date ? d : new Date(d); return isNaN(dt) ? '-' : dt.toLocaleString('pt-BR'); };
    const fmt = (d) => { const dt = d instanceof Date ? d : new Date(d); return isNaN(dt) ? '-' : dt.toLocaleDateString('pt-BR'); };
    const now = new Date();

    // Agrupar por dia, semana, mês e ano
    const byPeriod = (groupFn) => {
      const groups = {};
      bTxns.forEach(t => {
        const dt = t.date instanceof Date ? t.date : new Date(t.date);
        if (isNaN(dt)) return;
        const key = groupFn(dt);
        if (!groups[key]) groups[key] = { count: 0, total: 0 };
        const barberItems = (t.items || []).filter(i => i.barberId === barber.id);
        groups[key].count += barberItems.length;
        groups[key].total += barberItems.reduce((s, i) => s + (i.item?.price || 0), 0) * barber.commission;
      });
      return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    };

    const daily = byPeriod(d => d.toISOString().split('T')[0]);
    const weekly = byPeriod(d => { const s = new Date(d); s.setDate(s.getDate() - s.getDay()); return s.toISOString().split('T')[0]; });
    const monthly = byPeriod(d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    const yearly = byPeriod(d => `${d.getFullYear()}`);

    const totalServices = bTxns.reduce((s, t) => s + (t.items || []).filter(i => i.barberId === barber.id).length, 0);
    const totalRevenue = bTxns.reduce((s, t) => s + (t.items || []).filter(i => i.barberId === barber.id).reduce((ss, i) => ss + (i.item?.price || 0), 0), 0);
    const totalComm = totalRevenue * barber.commission;

    const tbl = (headers, rows) => `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="text-align:center;color:#999">Sem dados</td></tr>`}</tbody></table>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório ${barber.name}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:Arial,sans-serif; font-size:11px; color:#222; padding:20px; }
      h1 { font-size:18px; text-align:center; margin-bottom:4px; text-transform:uppercase; letter-spacing:2px; }
      .sub { text-align:center; color:#666; margin-bottom:20px; font-size:10px; }
      h2 { font-size:13px; background:#222; color:#fff; padding:5px 10px; margin:16px 0 6px; text-transform:uppercase; letter-spacing:1px; }
      table { width:100%; border-collapse:collapse; margin-bottom:10px; }
      th { background:#f0f0f0; text-align:left; padding:4px 6px; border:1px solid #ccc; font-size:10px; text-transform:uppercase; }
      td { padding:3px 6px; border:1px solid #ddd; font-size:10px; }
      tr:nth-child(even) { background:#fafafa; }
      .stats { display:flex; gap:20px; margin:10px 0 20px; }
      .stat { background:#f5f5f5; padding:10px 16px; border-radius:8px; text-align:center; flex:1; }
      .stat strong { display:block; font-size:16px; }
      .stat span { font-size:9px; text-transform:uppercase; color:#666; }
      .footer { text-align:center; margin-top:20px; font-size:9px; color:#999; border-top:1px solid #ddd; padding-top:8px; }
      @media print { body { padding:10px; } }
    </style></head><body>
    <h1>Relatório de Desempenho — ${barber.name}</h1>
    <p class="sub">Comissão: ${(barber.commission*100).toFixed(0)}% | Gerado em ${fmt(now)} às ${now.toLocaleTimeString('pt-BR')}</p>
    <div class="stats">
      <div class="stat"><strong>${totalServices}</strong><span>Serviços</span></div>
      <div class="stat"><strong>R$ ${totalRevenue.toFixed(2)}</strong><span>Faturamento</span></div>
      <div class="stat"><strong>R$ ${totalComm.toFixed(2)}</strong><span>Comissão Total</span></div>
      <div class="stat"><strong>${bTxns.length}</strong><span>Atendimentos</span></div>
    </div>
    <h2>Desempenho Diário</h2>
    ${tbl(['Data', 'Serviços', 'Comissão'], daily.slice(0, 60).map(([k, v]) => [fmt(new Date(k + 'T12:00:00')), v.count, 'R$ ' + v.total.toFixed(2)]))}
    <h2>Desempenho Semanal</h2>
    ${tbl(['Semana de', 'Serviços', 'Comissão'], weekly.map(([k, v]) => ['Semana de ' + fmt(new Date(k + 'T12:00:00')), v.count, 'R$ ' + v.total.toFixed(2)]))}
    <h2>Desempenho Mensal</h2>
    ${tbl(['Mês', 'Serviços', 'Comissão'], monthly.map(([k, v]) => [k, v.count, 'R$ ' + v.total.toFixed(2)]))}
    <h2>Desempenho Anual</h2>
    ${tbl(['Ano', 'Serviços', 'Comissão'], yearly.map(([k, v]) => [k, v.count, 'R$ ' + v.total.toFixed(2)]))}
    <h2>Últimas Transações (${Math.min(bTxns.length, 100)})</h2>
    ${tbl(['Data', 'Cliente', 'Serviço', 'Valor', 'Comissão'], bTxns.slice(-100).reverse().map(t => {
      const items = (t.items || []).filter(i => i.barberId === barber.id);
      return [fmtH(t.date), t.customerName || '-', items.map(i => i.item?.name || '?').join(', '), 'R$ ' + items.reduce((s,i) => s + (i.item?.price || 0), 0).toFixed(2), 'R$ ' + (items.reduce((s,i) => s + (i.item?.price || 0), 0) * barber.commission).toFixed(2)];
    }))}
    <div class="footer">Barbearia do César — Relatório gerado automaticamente</div>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  const handleDeleteBarber = (barber) => {
    setDeletingBarber(barber);
    setDeletePasswordInput('');
  };

  const confirmDeleteBarber = () => {
    if (deletePasswordInput !== cesarPassword) {
      toast('Senha incorreta');
      return;
    }
    generateBarberPDF(deletingBarber);
    if (setLoginLogs) {
      setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole || 'cesar', action: 'delete_barber', detail: `Barbeiro removido: ${deletingBarber.name}`, timestamp: new Date() }]);
    }
    setBarbers(barbers.filter(x => x.id !== deletingBarber.id));
    toast(`${deletingBarber.name} removido. PDF de desempenho gerado.`);
    setDeletingBarber(null);
    setDeletePasswordInput('');
  };

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
                    onClick={() => handleDeleteBarber(b)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Modal confirmação com senha */}
          {deletingBarber && (
            <div className={`p-4 mb-6 rounded-xl border-2 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300'}`}>
              <p className={`text-sm font-bold mb-3 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                Confirme sua senha para remover <strong>{deletingBarber.name}</strong>. Um PDF com o desempenho completo será gerado automaticamente.
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="password"
                  placeholder="Senha do César"
                  value={deletePasswordInput}
                  onChange={e => setDeletePasswordInput(e.target.value)}
                  className={`flex-1 p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500' : 'border-zinc-300'}`}
                />
                <button onClick={confirmDeleteBarber} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-xs uppercase transition-colors">Confirmar</button>
                <button onClick={() => setDeletingBarber(null)} className={`font-bold py-3 px-4 rounded-lg text-xs uppercase transition-colors ${darkMode ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-200 text-zinc-600'}`}>Cancelar</button>
              </div>
            </div>
          )}
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

      {/* E-mails de Recuperação */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-6 h-6" /> E-mails de Recuperação
        </h3>
        <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'}`}>
          <div className={`border-l-4 p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-400'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Cadastre e-mails para recuperação de senha. Quando clicar em "Esqueceu a senha?" na tela de login, a nova senha será enviada diretamente para o Gmail cadastrado.</p>
          </div>

          {/* Lista de emails cadastrados */}
          <div className="space-y-2 mb-4">
            {(recoveryEmails || []).length === 0 ? (
              <p className={`text-xs font-bold uppercase text-center py-3 border-2 border-dashed rounded-lg ${darkMode ? 'text-zinc-500 border-zinc-700' : 'text-zinc-400 border-zinc-200'}`}>Nenhum e-mail cadastrado</p>
            ) : (
              recoveryEmails.map(item => (
                <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                  <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{item.email}</span>
                  <button
                    onClick={() => { setRecoveryEmails(recoveryEmails.filter(x => x.id !== item.id)); toast('E-mail removido'); }}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Adicionar novo email */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!emailInput) return;
            const exists = (recoveryEmails || []).some(x => x.email.toLowerCase() === emailInput.toLowerCase().trim());
            if (exists) { toast('E-mail já cadastrado'); return; }
            setRecoveryEmails([...recoveryEmails, { id: 'e' + Date.now(), email: emailInput.trim() }]);
            setEmailInput('');
            toast('E-mail adicionado!');
          }} className="flex gap-3">
            <input type="email" placeholder="seu@gmail.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} className={`flex-1 p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-900 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} required />
            <button type="submit" className="bg-black text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors">Adicionar</button>
          </form>
        </div>
      </div>

      {/* Configuração EmailJS */}
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-black mb-6 text-black uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-6 h-6" /> Configuração de Envio de E-mail
        </h3>
        <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'}`}>
          <div className={`border-l-4 p-4 rounded-lg mb-6 ${darkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
            <p className={`text-sm font-bold uppercase mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>⚙ Como configurar</p>
            <ol className={`text-xs font-medium space-y-1 list-decimal list-inside ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
              <li>Acesse <strong>emailjs.com</strong> e crie uma conta gratuita</li>
              <li>Adicione seu Gmail como serviço de e-mail (Email Services → Add New Service → Gmail)</li>
              <li>Crie um template com as variáveis: <code>{'{{to_email}}'}</code>, <code>{'{{new_password}}'}</code>, <code>{'{{to_name}}'}</code></li>
              <li>Copie o <strong>Service ID</strong>, <strong>Template ID</strong> e <strong>Public Key</strong> e cole abaixo</li>
            </ol>
          </div>
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Service ID" value={ejServiceId} onChange={e => setEjServiceId(e.target.value)} className={`p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-900 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} />
            <input type="text" placeholder="Template ID" value={ejTemplateId} onChange={e => setEjTemplateId(e.target.value)} className={`p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-900 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} />
            <input type="text" placeholder="Public Key" value={ejPublicKey} onChange={e => setEjPublicKey(e.target.value)} className={`p-3 border rounded-lg font-bold text-sm outline-none ${darkMode ? 'bg-zinc-900 border-zinc-600 text-white placeholder-zinc-500 focus:border-white' : 'border-zinc-300 focus:border-black'}`} />
            <button
              onClick={() => {
                setEmailjsConfig({ serviceId: ejServiceId.trim(), templateId: ejTemplateId.trim(), publicKey: ejPublicKey.trim() });
                toast('Configuração salva!');
              }}
              className="bg-black text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              Salvar Configuração
            </button>
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
            onClick={() => setCleanupModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
          >
            Limpar Todos os Dados Operacionais
          </button>
        </div>
      </div>

      <ConfirmModal
        open={cleanupModal}
        onClose={() => setCleanupModal(false)}
        onConfirm={() => {
          setCustomers([]);
          setTransactions([]);
          setAppointments([]);
          setCoupons([]);
          setManualTransactions([]);
          if (setLoginLogs) {
            setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole || 'cesar', action: 'clear_all_data', detail: 'Limpeza total de dados operacionais', timestamp: new Date() }]);
          }
          toast('Dados limpos com sucesso!');
          setCleanupModal(false);
        }}
        title="Limpar Dados Operacionais"
        message="Tem certeza que deseja apagar TODOS os dados operacionais (clientes, transações, agendamentos, cupons e fluxo manual)? Essa ação NÃO pode ser desfeita."
        confirmText="Limpar Tudo"
        type="danger"
        requirePassword={true}
        passwordValue={cesarPassword}
      />
      </div>
    </div>
  );
}
