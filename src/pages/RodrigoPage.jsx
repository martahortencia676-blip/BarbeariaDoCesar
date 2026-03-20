import { useState } from 'react';
import { Scissors, Calendar, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const RODRIGO_ID = 'b2';

export default function RodrigoPage({ transactions, customers, services, hideServiceValues = false }) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const getCustomerName = id => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Cliente avulso';
  };

  // Todos os itens do Rodrigo no mês selecionado
  const monthItems = [];
  transactions.forEach(t => {
    const tDate = new Date(t.date);
    if (tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear) {
      t.items.forEach(item => {
        if (item.barberId === RODRIGO_ID) {
          monthItems.push({
            date: t.date,
            customerName: t.customerName || getCustomerName(t.customerId),
            name: item.item.name,
            price: item.item.price,
            type: item.type,
          });
        }
      });
    }
  });

  // Ordenar por data mais recente
  monthItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Separar serviços e produtos
  const serviceItems = monthItems.filter(i => i.type === 'service');
  const productItems = monthItems.filter(i => i.type === 'product');

  const totalServices = serviceItems.reduce((acc, i) => acc + i.price, 0);
  const totalProducts = productItems.reduce((acc, i) => acc + i.price, 0);
  const rodrigoCommission = totalServices * 0.5;
  const totalClients = new Set(monthItems.map(i => i.customerName)).size;

  // Tipos de serviços
  const serviceTypes = {};
  serviceItems.forEach(i => {
    serviceTypes[i.name] = (serviceTypes[i.name] || 0) + 1;
  });

  // Dados para gráfico semanal
  const getWeeklyData = () => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];

      let count = 0;
      let revenue = 0;
      transactions.forEach(t => {
        if (new Date(t.date).toISOString().split('T')[0] === dateStr) {
          t.items.forEach(item => {
            if (item.type === 'service' && item.barberId === RODRIGO_ID) {
              count++;
              revenue += item.item.price;
            }
          });
        }
      });

      return {
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        servicos: count,
        valor: revenue * 0.5,
      };
    });
    return weekData;
  };

  const weeklyData = getWeeklyData();

  // Gerar opções de meses
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(selectedYear, i);
    monthOptions.push({ value: i, label: d.toLocaleDateString('pt-BR', { month: 'long' }) });
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-3 flex items-center gap-3">
            <Scissors className="w-7 h-7" />
            Rodrigo — Meu Desempenho
          </h2>
        </div>

        {/* Filtro de Mês */}
        <div className="flex gap-3 mb-6">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2 font-bold text-sm focus:border-black outline-none"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2 font-bold text-sm focus:border-black outline-none"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <p className="text-green-700 font-bold text-xs uppercase tracking-widest mb-1">
              <DollarSign className="w-4 h-4 inline" /> Minha Comissão (50%)
            </p>
            <div className="text-3xl font-black text-green-900">R$ {rodrigoCommission.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">{serviceItems.length} serviços</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Serviços Realizados</p>
            <div className="text-3xl font-black text-black">{serviceItems.length}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">neste mês</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Clientes Atendidos</p>
            <div className="text-3xl font-black text-black">{totalClients}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">diferentes</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Produtos Vendidos</p>
            <div className="text-3xl font-black text-black">{productItems.length}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">R$ {totalProducts.toFixed(2)} total</p>
          </div>
        </div>

        {/* Gráfico Semanal */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v, name) => name === 'valor' ? `R$ ${v.toFixed(2)}` : v} />
              <Bar dataKey="servicos" fill="#000000" radius={[6, 6, 0, 0]} name="Serviços" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de Serviço */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Resumo por Tipo de Serviço
          </h3>
          {Object.keys(serviceTypes).length === 0 ? (
            <p className="text-zinc-400 text-sm font-bold uppercase text-center py-4">Nenhum serviço neste mês</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(serviceTypes).map(([name, count]) => (
                <div key={name} className="bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 rounded-lg border border-zinc-200">
                  <p className="text-xs font-black text-zinc-600 uppercase mb-2 truncate">{name}</p>
                  <p className="text-2xl font-black text-black">{count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabela Detalhada de Serviços */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <Scissors className="w-5 h-5" /> Serviços Detalhados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 font-black">Data</th>
                  <th className="p-3 font-black">Horário</th>
                  <th className="p-3 font-black">Cliente</th>
                  <th className="p-3 font-black">Serviço</th>
                  {!hideServiceValues && <th className="p-3 font-black text-right">Valor Serviço</th>}
                  <th className="p-3 font-black text-right">{hideServiceValues ? 'Minha Comissão' : 'Minha Parte (50%)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {serviceItems.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 font-bold text-zinc-400">Nenhum serviço este mês</td></tr>
                ) : (
                  serviceItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="p-3 font-medium">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-medium">{new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 font-medium">{item.customerName}</td>
                      <td className="p-3 font-bold">{item.name}</td>
                      {!hideServiceValues && <td className="p-3 font-bold text-right">R$ {item.price.toFixed(2)}</td>}
                      <td className="p-3 font-black text-right text-green-700">R$ {(item.price * 0.5).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {serviceItems.length > 0 && (
                <tfoot>
                  <tr className="bg-zinc-100 font-black text-sm">
                    <td colSpan={4} className="p-3 uppercase">Total do Mês</td>
                    {!hideServiceValues && <td className="p-3 text-right">R$ {totalServices.toFixed(2)}</td>}
                    <td className="p-3 text-right text-green-700">R$ {rodrigoCommission.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Produtos Vendidos */}
        {productItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
            <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
              Produtos Vendidos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="p-3 font-black text-zinc-600 uppercase">Data</th>
                    <th className="p-3 font-black text-zinc-600 uppercase">Cliente</th>
                    <th className="p-3 font-black text-zinc-600 uppercase">Produto</th>
                    <th className="p-3 font-black text-zinc-600 uppercase text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {productItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="p-3 font-medium">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-medium">{item.customerName}</td>
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3 font-black text-right">R$ {item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-100 font-black text-sm">
                    <td colSpan={3} className="p-3 uppercase">Total Produtos</td>
                    <td className="p-3 text-right">R$ {totalProducts.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-xs text-zinc-500 mt-3 font-medium italic">* A comissão de produtos fica a critério do barbeiro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
