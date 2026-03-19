import { Users, TrendingUp, Scissors, Award, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function PerformanceView({
  barbers,
  transactions,
  customers,
  services,
  hideValues = false
}) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calcular desempenho por barbeiro
  const barberPerformance = barbers.map(barber => {
    let totalServices = 0;
    let totalRevenue = 0;
    let serviceTypes = {};
    let clientsServed = new Set();
    let detailedServices = [];

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      if (isCurrentMonth) {
        t.items.forEach(item => {
          if (item.type === 'service' && item.barberId === barber.id) {
            totalServices += 1;
            totalRevenue += item.item.price;

            const serviceName = item.item.name;
            serviceTypes[serviceName] = (serviceTypes[serviceName] || 0) + 1;

            if (t.customerId) {
              clientsServed.add(t.customerId);
            }

            detailedServices.push({
              date: t.date,
              customerName: t.customerName || 'Desconhecido',
              customerId: t.customerId,
              serviceName: item.item.name,
              price: item.item.price,
              type: item.type,
            });
          }
        });
      }
    });

    // Ordenar por data mais recente
    detailedServices.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      ...barber,
      totalServices,
      totalRevenue,
      serviceTypes,
      clientsServed: clientsServed.size,
      avgPerService: totalServices > 0 ? (totalRevenue / totalServices).toFixed(2) : 0,
      detailedServices,
    };
  }).sort((a, b) => b.totalServices - a.totalServices);

  // Dados para gráfico de serviços
  const serviceChartData = barberPerformance.map(b => ({
    name: b.name,
    serviços: b.totalServices,
    clientes: b.clientsServed,
    receita: b.totalRevenue
  }));

  // Dados para gráfico de tipos de serviço (agregado)
  const allServiceTypes = {};
  barberPerformance.forEach(barber => {
    Object.entries(barber.serviceTypes).forEach(([service, count]) => {
      allServiceTypes[service] = (allServiceTypes[service] || 0) + count;
    });
  });

  const serviceTypeChartData = Object.entries(allServiceTypes).map(([name, value]) => ({
    name,
    value,
    fill: '#000000'
  }));

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

  // Calcular performance semanal
  const getWeeklyPerformance = (barber) => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];

      let count = 0;
      transactions.forEach(t => {
        if (t.date.toISOString().split('T')[0] === dateStr) {
          t.items.forEach(item => {
            if (item.type === 'service' && item.barberId === barber.id) {
              count += 1;
            }
          });
        }
      });

      return {
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        servicos: count
      };
    });

    return weekData;
  };

  const mask = v => hideValues ? '****' : v;

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-3 flex items-center gap-3">
            <Award className="w-7 h-7" />
            Desempenho dos Barbeiros
          </h2>
          <p className="text-sm text-zinc-600 font-medium mt-2">
            {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPIs por Barbeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {barberPerformance.map((barber, idx) => (
            <div key={barber.id} className={`rounded-2xl shadow-sm border p-6 ${
              idx === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
              idx === 1 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' :
              'bg-white border-zinc-300'
            }`}>
              <p className={`font-bold text-xs mb-2 uppercase tracking-widest ${
                idx === 0 ? 'text-yellow-700' :
                idx === 1 ? 'text-blue-700' :
                'text-zinc-600'
              }`}>
                {barber.name}
              </p>
              <div className={`text-3xl font-black mb-3 ${
                idx === 0 ? 'text-yellow-900' :
                idx === 1 ? 'text-blue-900' :
                'text-black'
              }`}>
                {barber.totalServices}
              </div>
              <div className="space-y-1 text-xs font-medium">
                <p className={idx === 0 ? 'text-yellow-700' : idx === 1 ? 'text-blue-700' : 'text-zinc-600'}>
                  👥 Clientes: {barber.clientsServed}
                </p>
                <p className={idx === 0 ? 'text-yellow-700' : idx === 1 ? 'text-blue-700' : 'text-zinc-600'}>
                  💰 R$ {mask(barber.totalRevenue.toFixed(2))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Serviços por Barbeiro */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
            <h3 className="text-lg font-black text-black mb-6 uppercase tracking-wider flex items-center gap-2">
              <Scissors className="w-6 h-6" />
              Serviços Realizados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData} margin={{ left: 0, right: 20, top: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="serviços" fill="#000000" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tipos de Cortes */}
          {serviceTypeChartData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
              <h3 className="text-lg font-black text-black mb-6 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Tipos de Serviços
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tabela Detalhada */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mb-8">
          <h3 className="text-lg font-black text-black mb-6 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Resumo Detalhado
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 font-black text-left">Barbeiro</th>
                  <th className="p-3 font-black text-center whitespace-nowrap">Serviços</th>
                  <th className="p-3 font-black text-center whitespace-nowrap">Clientes</th>
                  <th className="p-3 font-black text-right whitespace-nowrap">Receita</th>
                  <th className="p-3 font-black text-right whitespace-nowrap">Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {barberPerformance.map(barber => (
                  <tr key={barber.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-bold text-black">{barber.name}</td>
                    <td className="p-3 text-center font-bold text-zinc-600">{barber.totalServices}</td>
                    <td className="p-3 text-center font-bold text-zinc-600">{barber.clientsServed}</td>
                    <td className="p-3 text-right font-bold text-black whitespace-nowrap">R$ {mask(barber.totalRevenue.toFixed(2))}</td>
                    <td className="p-3 text-right font-black text-green-600 whitespace-nowrap">R$ {mask(barber.avgPerService)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Semanal por Barbeiro */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-black uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Desempenho Semanal
          </h3>
          {barberPerformance.map((barber, idx) => (
            <div key={barber.id} className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
              <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">{barber.name}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getWeeklyPerformance(barber)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="servicos" 
                    stroke={idx === 0 ? '#FCD34D' : idx === 1 ? '#3B82F6' : '#000000'}
                    strokeWidth={2}
                    dot={{ fill: idx === 0 ? '#FCD34D' : idx === 1 ? '#3B82F6' : '#000000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Serviços por Barbeiro */}
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-black text-black uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-6 h-6" />
            Serviços Realizados por Barbeiro
          </h3>
          {barberPerformance.map(barber => (
            <div key={barber.id} className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
              <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">{barber.name}</h4>
              {Object.keys(barber.serviceTypes).length === 0 ? (
                <p className="text-zinc-400 text-sm font-bold uppercase text-center py-4">Nenhum serviço realizado</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {Object.entries(barber.serviceTypes).map(([service, count]) => (
                      <div key={service} className="bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 rounded-lg border border-zinc-200">
                        <p className="text-xs font-black text-zinc-600 uppercase mb-2 truncate">{service}</p>
                        <p className="text-2xl font-black text-black">{count}</p>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="p-2 font-black text-zinc-600 uppercase">Data</th>
                          <th className="p-2 font-black text-zinc-600 uppercase">Horário</th>
                          <th className="p-2 font-black text-zinc-600 uppercase">Cliente</th>
                          <th className="p-2 font-black text-zinc-600 uppercase">Serviço</th>
                          <th className="p-2 font-black text-zinc-600 uppercase text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {barber.detailedServices.map((s, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50">
                            <td className="p-2 font-medium">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-2 font-medium">{new Date(s.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="p-2 font-medium">{s.customerName}</td>
                            <td className="p-2 font-bold">{s.serviceName}</td>
                            <td className="p-2 font-black text-right">R$ {mask(s.price.toFixed(2))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-zinc-100 font-black">
                          <td colSpan={4} className="p-2 uppercase text-xs">Total</td>
                          <td className="p-2 text-right">R$ {mask(barber.totalRevenue.toFixed(2))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
