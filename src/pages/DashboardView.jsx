import { BarChart3, Gift, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import BirthdayReminders from '../components/BirthdayReminders';
import { getMonthCutCount } from '../utils/phoneAndDate';

export default function DashboardView({
  customers,
  transactions,
  barbers,
  products,
  hideValues = false
}) {
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalTransactions = transactions.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  // Top clientes por visitas
  const topClients = [...customers]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  // Produtos mais vendidos
  const productSales = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (item.type === 'product') {
        productSales[item.item.id] = (productSales[item.item.id] || 0) + 1;
      }
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([id, count]) => {
      const product = products.find(p => p.id === id);
      return { ...product, sold: count };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Serviços mais vendidos
  const serviceSales = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (item.type === 'service') {
        serviceSales[item.item.id] = (serviceSales[item.item.id] || 0) + 1;
      }
    });
  });

  const topServices = Object.entries(serviceSales)
    .map(([id, count]) => {
      const service = transactions[0]?.items.find(i => i.item.id === id)?.item;
      return { id, name: service?.name || 'Serviço', sold: count };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Performance por barbeiro
  const barberPerformance = barbers.map(barber => {
    let totalProduction = 0;
    let totalServices = 0;
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (item.type === 'service' && item.barberId === barber.id) {
          totalProduction += item.item.price;
          totalServices++;
        }
      });
    });
    return { ...barber, totalProduction, totalServices };
  });

  // Dados para gráficos de sazonalidade
  const getSeasonalityData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyData = last30Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date.toISOString().split('T')[0] === date);
      const appointments = dayTransactions.length;
      const revenue = dayTransactions.reduce((acc, t) => acc + t.total, 0);
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        appointments,
        revenue
      };
    });

    // Dados semanais (últimas 12 semanas)
    const weeklyData = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (11 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= weekStart && tDate <= weekEnd;
      });

      return {
        week: `Sem ${i + 1}`,
        appointments: weekTransactions.length,
        revenue: weekTransactions.reduce((acc, t) => acc + t.total, 0)
      };
    });

    // Dados mensais (últimos 12 meses)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (11 - i), 1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      return {
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        appointments: monthTransactions.length,
        revenue: monthTransactions.reduce((acc, t) => acc + t.total, 0)
      };
    });

    return { dailyData, weeklyData, monthlyData };
  };

  const { dailyData, weeklyData, monthlyData } = getSeasonalityData();

  const mask = v => hideValues ? '****' : v;

  return (
    <div className="p-3 md:p-6">
      <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2">Dashboard</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-black text-white p-4 md:p-6 rounded-xl shadow-lg">
          <p className="text-zinc-400 font-bold text-[10px] md:text-xs mb-1 uppercase tracking-wider">Receita Total</p>
          <div className="text-xl md:text-3xl font-black">R$ {mask(totalRevenue.toFixed(2))}</div>
          <p className="text-zinc-500 text-[10px] md:text-xs mt-1 md:mt-2 font-medium">{mask(totalTransactions)}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-zinc-300">
          <p className="text-zinc-500 font-bold text-[10px] md:text-xs mb-1 uppercase tracking-wider">Clientes</p>
          <div className="text-xl md:text-3xl font-black text-black">{customers.length}</div>
          <p className="text-zinc-600 text-[10px] md:text-xs mt-1 md:mt-2 font-medium">Cadastrados no total</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-zinc-300">
          <p className="text-zinc-500 font-bold text-[10px] md:text-xs mb-1 uppercase tracking-wider">Visitas Mês</p>
          <div className="text-xl md:text-3xl font-black text-black">
            {mask(customers.reduce((acc, c) => {
              const monthCuts = transactions.filter(t => 
                t.customerId === c.id && 
                new Date(t.date).getMonth() === new Date().getMonth()
              ).length;
              return acc + monthCuts;
            }, 0))}
          </div>
          <p className="text-zinc-600 text-xs mt-2 font-medium">Neste mês</p>
        </div>

        <div className={`p-4 md:p-6 rounded-xl shadow-sm border-2 ${
          lowStockProducts.length > 0 
            ? 'bg-red-50 border-red-300' 
            : 'bg-white border-zinc-300'
        }`}>
          <p className="text-zinc-500 font-bold text-[10px] md:text-xs mb-1 uppercase tracking-wider">Estoque Baixo</p>
          <div className={`text-xl md:text-3xl font-black ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-black'}`}>
            {mask(lowStockProducts.length)}
          </div>
          <p className="text-zinc-600 text-xs mt-2 font-medium">Produtos</p>
        </div>
      </div>

      {/* Gráficos de Sazonalidade */}
      <div className="mb-8">
        <h3 className="text-xl font-black mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Análise de Sazonalidade - Movimento
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Gráfico Diário */}
          <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Últimos 30 Dias</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#000000" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-zinc-500 mt-2 font-bold uppercase">Agendamentos por dia</p>
              <p className="text-xs text-zinc-500 mt-1 font-bold">Receita: R$ {mask(dailyData.reduce((acc, d) => acc + d.revenue, 0).toFixed(2))}</p>
          </div>

          {/* Gráfico Semanal */}
          <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Últimas 12 Semanas</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="appointments" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-zinc-500 mt-2 font-bold uppercase">Agendamentos por semana</p>
            <p className="text-xs text-zinc-500 mt-1 font-bold">Receita: R$ {mask(weeklyData.reduce((acc, d) => acc + d.revenue, 0).toFixed(2))}</p>
          </div>

          {/* Gráfico Mensal */}
          <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Últimos 12 Meses</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-zinc-500 mt-2 font-bold uppercase">Receita mensal (R$)</p>
            <p className="text-xs text-zinc-500 mt-1 font-bold">Total: R$ {mask(monthlyData.reduce((acc, d) => acc + d.revenue, 0).toFixed(2))}</p>
          </div>
        </div>
      </div>

      {/* Aniversários + Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
        <BirthdayReminders customers={customers} />

        {/* Top Clientes */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5" /> Clientes Frequentes
          </h3>
          <div className="space-y-2">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div>
                  <p className="font-bold text-black text-sm">{index + 1}. {client.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">{client.phone}</p>
                </div>
                <span className="font-black bg-black text-white px-3 py-1 rounded text-xs">{client.visits}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Top Serviços */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Serviços Populares
          </h3>
          <div className="space-y-2">
            {topServices.length === 0 ? (
              <p className="text-zinc-400 text-center py-6 font-bold text-sm uppercase">Nenhuma venda registrada</p>
            ) : (
              topServices.map((service, index) => (
                <div key={service.id} className="flex justify-between items-center p-2 border-b border-zinc-200 last:border-0">
                  <p className="text-sm font-bold text-black">{index + 1}. {service.name}</p>
                  <span className="text-xs font-black bg-zinc-100 p-1 px-2 rounded">{service.sold}x</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Produtos Vendidos
          </h3>
          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-zinc-400 text-center py-6 font-bold text-sm uppercase">Nenhuma venda registrada</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex justify-between items-center p-2 border-b border-zinc-200 last:border-0">
                  <p className="text-sm font-bold text-black">{index + 1}. {product.name}</p>
                  <span className="text-xs font-black bg-zinc-100 p-1 px-2 rounded">{product.sold}x</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Barbeiros */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-zinc-300 shadow-sm">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Produção</h3>
          <div className="space-y-2">
            {barberPerformance.map(barber => (
              <div key={barber.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-black text-sm">{barber.name}</p>
                  <span className="text-xs font-black text-white bg-black px-2 py-1 rounded">{barber.totalServices}</span>
                </div>
                <p className="text-xs text-zinc-600 font-bold">R$ {mask(barber.totalProduction.toFixed(2))}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
