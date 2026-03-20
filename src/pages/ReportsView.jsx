import { useState } from 'react';
import { Wallet, Scissors, ArrowUpCircle, ArrowDownCircle, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { toast } from '../components/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { generateId, formatDate } from '../utils/helpers';

export default function ReportsView({
  barbers,
  transactions,
  paymentMethods,
  manualTransactions,
  setManualTransactions,
  services,
  hideValues = false
}) {
  const [manualType, setManualType] = useState('in');
  const [manualDesc, setManualDesc] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [selectedView, setSelectedView] = useState('today');

  const handleAddManualTransaction = (e) => {
    e.preventDefault();
    if (!manualDesc || !manualValue) return;
    
    const newTrans = {
      id: generateId(),
      type: manualType,
      description: manualDesc,
      amount: parseFloat(manualValue),
      date: new Date()
    };
    setManualTransactions([...manualTransactions, newTrans]);
    setManualDesc('');
    setManualValue('');
    toast('Registro adicionado');
  };

  // Data atual
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentWeek = Math.floor((today.getDate() - today.getDay() + 6) / 7);

  // Helper para calcular lucro por período
  const calculateRodrigoProfit = (periodType) => {
    const rodrigo = barbers.find(b => b.name === 'Rodrigo');
    if (!rodrigo) return { profit: 0, count: 0 };

    let totalProduction = 0;
    let serviceCount = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      let isInPeriod = false;

      if (periodType === 'week') {
        const tWeek = Math.floor((tDate.getDate() - tDate.getDay() + 6) / 7);
        isInPeriod = tWeek === currentWeek && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      } else if (periodType === 'month') {
        isInPeriod = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      } else if (periodType === 'today') {
        isInPeriod = t.date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
      }

      if (isInPeriod) {
        t.items.forEach(item => {
          if (item.type === 'service' && item.barberId === rodrigo.id && item.item.commissionable !== false) {
            totalProduction += item.item.price * rodrigo.commission;
            serviceCount += 1;
          }
        });
      }
    });

    return { profit: totalProduction, count: serviceCount };
  };

  // Cálculos
  const pdvTotal = transactions.reduce((acc, t) => acc + t.total, 0);
  const manualIn = manualTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const manualOut = manualTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  
  const finalCaixa = (pdvTotal + manualIn) - manualOut;

  // Cálculos por período
  const todayProfit = calculateRodrigoProfit('today');
  const weekProfit = calculateRodrigoProfit('week');
  const monthProfit = calculateRodrigoProfit('month');

  const byMethod = paymentMethods.map(method => ({
    name: method.name,
    total: transactions.filter(t => t.paymentMethod === method.id).reduce((acc, t) => acc + t.total, 0)
  }));

  const commissions = barbers.map(barber => {
    let totalServices = 0;
    let commissionEarned = 0;
    transactions.forEach(t => {
      t.items.forEach(entry => {
        if (entry.type === 'service' && entry.barberId === barber.id) {
          // Se for dono, conta todos os serviços e ganha 100%
          if (barber.isOwner) {
            totalServices += entry.item.price;
            commissionEarned += entry.item.price; // 100% para o dono
          } 
          // Se for funcionário, conta apenas serviços comissionáveis
          else if (entry.item.commissionable !== false) {
            totalServices += entry.item.price;
            commissionEarned += (entry.item.price * barber.commission);
          }
        }
      });
    });
    return { ...barber, totalServices, commissionEarned };
  });

  // Cálculos de margem de lucro por serviço
  const serviceProfitMargins = services.map(service => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalSold = 0;

    transactions.forEach(t => {
      t.items.forEach(item => {
        if (item.type === 'service' && item.item.id === service.id) {
          totalRevenue += item.item.price;
          totalCost += service.cost || 0;
          totalSold += 1;
        }
      });
    });

    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      ...service,
      totalRevenue,
      totalCost,
      profit,
      margin,
      totalSold
    };
  }).sort((a, b) => b.profit - a.profit);

  // Dados para gráfico de pizza de lucratividade
  const profitabilityChartData = serviceProfitMargins.map(service => ({
    name: service.name,
    value: service.profit,
    revenue: service.totalRevenue,
    cost: service.totalCost
  }));

  const COLORS = ['#000000', '#666666', '#999999', '#CCCCCC', '#EEEEEE'];

  // Função utilitária para mascarar valores
  const mask = v => hideValues ? '****' : v;

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-2 flex items-center gap-3">
            <Wallet className="w-7 h-7" />
            Caixa & Relatórios
          </h2>
          <p className="text-sm text-zinc-600 font-medium mt-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-black text-white p-6 rounded-2xl shadow-lg border border-zinc-800">
            <p className="text-zinc-400 font-bold text-xs mb-2 uppercase tracking-widest">Saldo do Caixa</p>
            <div className="text-3xl md:text-4xl font-black">{mask(`R$ ${finalCaixa.toFixed(2)}`)}</div>
            <p className="text-zinc-400 text-xs mt-3 font-medium">PDV: {mask(`R$ ${pdvTotal.toFixed(2)}`)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-300">
            <p className="text-zinc-500 font-bold text-xs mb-2 uppercase tracking-widest">Entrada Manual</p>
            <div className="text-3xl md:text-4xl font-black text-green-600">{mask(`R$ ${manualIn.toFixed(2)}`)}</div>
            <p className="text-zinc-500 text-xs mt-3 font-medium">{manualTransactions.filter(t => t.type === 'in').length} registros</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-300">
            <p className="text-zinc-500 font-bold text-xs mb-2 uppercase tracking-widest">Saída Manual</p>
            <div className="text-3xl md:text-4xl font-black text-red-600">{mask(`R$ ${manualOut.toFixed(2)}`)}</div>
            <p className="text-zinc-500 text-xs mt-3 font-medium">{manualTransactions.filter(t => t.type === 'out').length} registros</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-300">
            <p className="text-zinc-500 font-bold text-xs mb-2 uppercase tracking-widest">Transações</p>
            <div className="text-3xl md:text-4xl font-black text-black">{transactions.length}</div>
            <p className="text-zinc-500 text-xs mt-3 font-medium">Total do PDV</p>
          </div>
        </div>

        {/* Lucro do Rodrigo */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Lucro de Rodrigo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
              <p className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-2">Hoje</p>
              <div className="text-3xl font-black text-blue-900">{mask(`R$ ${todayProfit.profit.toFixed(2)}`)}</div>
              <p className="text-blue-600 text-xs font-medium mt-2">{todayProfit.count} serviços</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
              <p className="text-purple-700 font-bold text-xs uppercase tracking-widest mb-2">Esta Semana</p>
              <div className="text-3xl font-black text-purple-900">{mask(`R$ ${weekProfit.profit.toFixed(2)}`)}</div>
              <p className="text-purple-600 text-xs font-medium mt-2">{weekProfit.count} serviços</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
              <p className="text-green-700 font-bold text-xs uppercase tracking-widest mb-2">Este Mês</p>
              <div className="text-3xl font-black text-green-900">{mask(`R$ ${monthProfit.profit.toFixed(2)}`)}</div>
              <p className="text-green-600 text-xs font-medium mt-2">{monthProfit.count} serviços</p>
            </div>
          </div>
        </div>

        {/* Recebimentos por Método */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-wider mb-6">Recebimentos (PDV)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {byMethod.map(m => (
              <div key={m.name} className="bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 rounded-xl border border-zinc-200 text-center">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-wider mb-2">{m.name}</div>
                <div className="text-2xl font-black text-black">{mask(`R$ ${m.total.toFixed(2)}`)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fluxo Manual e Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
            <h3 className="text-lg font-black text-black uppercase tracking-wider mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Registar Fluxo
            </h3>
            <form onSubmit={handleAddManualTransaction} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setManualType('in')} 
                  className={`flex-1 py-3 rounded-lg font-bold uppercase text-sm transition-all ${manualType === 'in' ? 'bg-black text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                >
                  Entrada
                </button>
                <button 
                  type="button" 
                  onClick={() => setManualType('out')} 
                  className={`flex-1 py-3 rounded-lg font-bold uppercase text-sm transition-all ${manualType === 'out' ? 'bg-black text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                >
                  Saída
                </button>
              </div>
              <input 
                type="text" 
                value={manualDesc} 
                onChange={e => setManualDesc(e.target.value)} 
                placeholder="Descrição (ex: Aluguel)" 
                className="p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-medium text-sm"
              />
              <input 
                type="number" 
                step="0.01" 
                value={manualValue} 
                onChange={e => setManualValue(e.target.value)} 
                placeholder="Valor R$" 
                className="p-3 border border-zinc-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none font-medium text-sm"
              />
              <button 
                type="submit" 
                className="bg-black hover:bg-zinc-800 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors"
              >
                Registrar
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
            <h3 className="text-lg font-black text-black uppercase tracking-wider mb-6">Histórico</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {manualTransactions.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p className="font-bold text-sm uppercase">Nenhum registro</p>
                </div>
              ) : (
                manualTransactions.slice().reverse().map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {t.type === 'in' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-black text-sm truncate">{t.description}</p>
                        <p className="text-xs text-zinc-500 font-medium">{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : 'Hoje'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm whitespace-nowrap ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'in' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </span>
                      <button onClick={() => { setManualTransactions(manualTransactions.filter(x => x.id !== t.id)); toast('Registro removido'); }} className="text-zinc-400 hover:text-red-600 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Comissões */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8 overflow-x-auto">
          <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <Scissors className="w-6 h-6" />
            Comissões
          </h3>
          <table className="w-full text-left border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 font-black">Profissional</th>
                <th className="p-4 font-black text-center">% Comissão</th>
                <th className="p-4 font-black text-right">Produção</th>
                <th className="p-4 font-black text-right">A Receber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {commissions.map(barber => (
                <tr key={barber.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-bold text-black">{barber.name}</td>
                  <td className="p-4 text-center font-bold text-zinc-600">
                    {barber.isOwner ? (
                      <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-black">Dono - 100%</span>
                    ) : (
                      <span className="bg-zinc-100 text-black px-3 py-1 rounded-lg text-xs font-black">{(barber.commission * 100).toFixed(0)}%</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-zinc-600">R$ {barber.totalServices.toFixed(2)}</td>
                  <td className="p-4 text-right font-black text-black">R$ {barber.commissionEarned.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Margem de Lucro */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Margem de Lucro por Serviço
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-3 font-black text-left">Serviço</th>
                    <th className="p-3 font-black text-center">Vendidos</th>
                    <th className="p-3 font-black text-right whitespace-nowrap">Receita</th>
                    <th className="p-3 font-black text-right whitespace-nowrap">Lucro</th>
                    <th className="p-3 font-black text-right">Margem %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {serviceProfitMargins.map(service => (
                    <tr key={service.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-bold text-black text-left">{service.name}</td>
                      <td className="p-3 text-center font-bold text-zinc-600">{service.totalSold}</td>
                      <td className="p-3 text-right font-bold text-zinc-600 whitespace-nowrap">R$ {service.totalRevenue.toFixed(2)}</td>
                      <td className="p-3 text-right font-black text-black whitespace-nowrap">R$ {service.profit.toFixed(2)}</td>
                      <td className="p-3 text-right font-black text-green-600">{service.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Gráfico */}
            <div>
              <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Distribuição de Lucro</h4>
              {profitabilityChartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-zinc-400 font-bold text-sm uppercase">Sem dados</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={profitabilityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {profitabilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico comparativo */}
        {serviceProfitMargins.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
            <h4 className="font-black text-black mb-6 uppercase text-sm tracking-wider">Receita vs Custo por Serviço</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceProfitMargins} margin={{ left: 0, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="totalRevenue" fill="#000000" name="Receita" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalCost" fill="#CCCCCC" name="Custo" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
