import { useState } from 'react';
import { ClipboardList, Trash2, Pencil, Save, XCircle, Search } from 'lucide-react';
import { toast } from '../components/Toast';

const PAYMENT_LABELS = { pix: 'PIX', credit: 'Cartão de Crédito', debit: 'Cartão de Débito', cash: 'Dinheiro' };

export default function TransactionHistoryView({ transactions, setTransactions, customers, barbers, userRole }) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPayment, setEditPayment] = useState('');
  const [editItems, setEditItems] = useState([]);

  const getCustomerName = (t) => t.customerName || customers.find(c => c.id === t.customerId)?.name || 'Cliente avulso';
  const getBarberName = (barberId) => barbers.find(b => b.id === barberId)?.name || '—';

  // Ordenar por data mais recente
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = sorted.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = getCustomerName(t).toLowerCase();
    const dateStr = new Date(t.date).toLocaleDateString('pt-BR');
    return name.includes(q) || dateStr.includes(q);
  });

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditPayment(t.paymentMethod);
    setEditItems(t.items.map(i => ({ ...i, item: { ...i.item } })));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPayment('');
    setEditItems([]);
  };

  const saveEdit = (t) => {
    const newTotal = editItems.reduce((acc, i) => acc + i.item.price, 0) - (t.discount || 0);
    setTransactions(transactions.map(tx =>
      tx.id === t.id ? { ...tx, paymentMethod: editPayment, items: editItems, total: Math.max(0, newTotal) } : tx
    ));
    setEditingId(null);
    toast('Transação atualizada');
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      toast('Transação excluída');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-3 mb-8 flex items-center gap-3">
          <ClipboardList className="w-7 h-7" /> Histórico de Transações
        </h2>

        {/* Pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar por cliente ou data..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-zinc-300 rounded-xl focus:border-black focus:ring-2 focus:ring-black outline-none font-bold text-sm bg-white"
          />
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Total Transações</p>
            <p className="text-2xl font-black text-black">{transactions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Faturamento Total</p>
            <p className="text-2xl font-black text-black">R$ {transactions.reduce((a, t) => a + t.total, 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 col-span-2 md:col-span-1">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Exibindo</p>
            <p className="text-2xl font-black text-black">{filtered.length} <span className="text-sm text-zinc-400">resultados</span></p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-300 p-12 text-center">
              <p className="font-bold text-zinc-400 uppercase text-sm">Nenhuma transação encontrada</p>
            </div>
          ) : (
            filtered.map(t => {
              const isEditing = editingId === t.id;
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-zinc-300 shadow-sm overflow-hidden">
                  {/* Cabeçalho */}
                  <div className="flex flex-wrap items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50 gap-2">
                    <div>
                      <p className="font-black text-black text-sm">{getCustomerName(t)}</p>
                      <p className="text-xs text-zinc-500 font-medium">
                        {new Date(t.date).toLocaleDateString('pt-BR')} às {new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <select
                            value={editPayment}
                            onChange={e => setEditPayment(e.target.value)}
                            className="border border-zinc-300 rounded-lg px-3 py-1 font-bold text-xs focus:border-black outline-none"
                          >
                            {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                          <button onClick={() => saveEdit(t)} className="text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                          <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-600"><XCircle className="w-5 h-5" /></button>
                        </>
                      ) : (
                        <>
                          <span className="bg-zinc-200 text-zinc-700 font-bold text-xs px-3 py-1 rounded-lg uppercase">{PAYMENT_LABELS[t.paymentMethod] || t.paymentMethod}</span>
                          <span className="font-black text-black text-lg">R$ {t.total.toFixed(2)}</span>
                          <button onClick={() => startEdit(t)} className="text-zinc-400 hover:text-blue-600 transition-colors" title="Editar"><Pencil className="w-5 h-5" /></button>
                          {userRole === 'cesar' && (
                            <button onClick={() => handleDelete(t.id)} className="text-zinc-400 hover:text-red-600 transition-colors" title="Excluir"><Trash2 className="w-5 h-5" /></button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="divide-y divide-zinc-100">
                    {(isEditing ? editItems : t.items).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${item.type === 'service' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                            {item.type === 'service' ? 'Serviço' : 'Produto'}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-black">{item.item.name}</p>
                            {item.barberId && <p className="text-xs text-zinc-500 font-medium">Barbeiro: {getBarberName(item.barberId)}</p>}
                          </div>
                        </div>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.item.price}
                            onChange={e => {
                              const updated = [...editItems];
                              updated[idx] = { ...updated[idx], item: { ...updated[idx].item, price: parseFloat(e.target.value) || 0 } };
                              setEditItems(updated);
                            }}
                            className="w-24 text-right p-1 border border-zinc-300 rounded font-bold text-sm focus:border-black outline-none"
                          />
                        ) : (
                          <span className="font-black text-sm">R$ {item.item.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desconto */}
                  {t.discount > 0 && (
                    <div className="px-4 py-2 bg-green-50 text-green-700 font-bold text-xs uppercase flex justify-between">
                      <span>Desconto</span>
                      <span>- R$ {t.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
