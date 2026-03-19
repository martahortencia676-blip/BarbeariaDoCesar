import React from 'react';

export default function RodrigoView({ transactions, customers }) {
  // Filtrar apenas os serviços feitos por Rodrigo
  const RODRIGO_ID = 'rodrigo'; // Ajuste para o ID real de Rodrigo
  const rodrigoServices = transactions
    .filter(t => t.items.some(item => item.type === 'service' && item.barberId === RODRIGO_ID))
    .flatMap(t =>
      t.items
        .filter(item => item.type === 'service' && item.barberId === RODRIGO_ID)
        .map(item => ({
          ...item,
          date: t.date,
          customerId: t.customerId,
          transactionId: t.id,
        }))
    );

  // Obter dados do cliente
  const getCustomerName = id => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Desconhecido';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2">Rodrigo - Serviços Realizados</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-3 font-black">Data</th>
              <th className="p-3 font-black">Horário</th>
              <th className="p-3 font-black">Cliente</th>
              <th className="p-3 font-black">Serviço</th>
              <th className="p-3 font-black">Valor Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rodrigoServices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 font-bold text-zinc-400">Nenhum serviço encontrado</td></tr>
            ) : (
              rodrigoServices.map((item, idx) => (
                <tr key={item.transactionId + '-' + idx}>
                  <td className="p-3">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3">{getCustomerName(item.customerId)}</td>
                  <td className="p-3">{item.item.name}</td>
                  <td className="p-3">R$ {item.item.price.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
