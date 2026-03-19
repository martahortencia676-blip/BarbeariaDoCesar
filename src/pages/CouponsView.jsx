import { useState } from 'react';
import { Ticket, Plus, Trash2, Users } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function CouponsView({
  coupons,
  setCoupons,
  customers
}) {
  const [cName, setCName] = useState('');
  const [cType, setCType] = useState('percentage');
  const [cValue, setCValue] = useState('');
  const [cCustomerId, setCCustomerId] = useState('');
  const [cDescription, setCDescription] = useState('');

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!cName || !cValue || !cCustomerId) return;

    const newCoupon = {
      id: generateId(),
      name: cName,
      type: cType,
      value: parseFloat(cValue),
      customerId: cCustomerId,
      description: cDescription,
      used: false,
      createdAt: new Date()
    };

    setCoupons([...coupons, newCoupon]);
    setCName('');
    setCValue('');
    setCCustomerId('');
    setCDescription('');
  };

  const handleDeleteCoupon = (couponId) => {
    setCoupons(coupons.filter(c => c.id !== couponId));
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Cliente não encontrado';
  };

  const activeCoupons = coupons.filter(c => !c.used);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-black mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
        <Ticket className="w-6 h-6" /> Cupons Personalizados
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criar Cupom */}
        <div>
          <h3 className="text-lg font-black mb-4 text-black uppercase flex items-center gap-2">
            <Plus className="w-5 h-5" /> Criar Novo Cupom
          </h3>
          <form onSubmit={handleAddCoupon} className="bg-white p-6 rounded-xl border border-zinc-300 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Nome do Cupom</label>
                <input
                  type="text"
                  value={cName}
                  onChange={e => setCName(e.target.value)}
                  placeholder="Ex: Desconto Aniversário"
                  className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Tipo de Desconto</label>
                <select
                  value={cType}
                  onChange={e => setCType(e.target.value)}
                  className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none"
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="free-service">Serviço Grátis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  Valor {cType === 'percentage' ? '(%)' : cType === 'fixed' ? '(R$)' : '(Serviço)'}
                </label>
                <input
                  type="number"
                  step={cType === 'percentage' ? '1' : '0.01'}
                  value={cValue}
                  onChange={e => setCValue(e.target.value)}
                  placeholder={cType === 'percentage' ? '10' : cType === 'fixed' ? '15.00' : 'Nome do serviço'}
                  className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Cliente</label>
                <select
                  value={cCustomerId}
                  onChange={e => setCCustomerId(e.target.value)}
                  className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">Descrição (Opcional)</label>
                <textarea
                  value={cDescription}
                  onChange={e => setCDescription(e.target.value)}
                  placeholder="Motivo do cupom..."
                  rows={3}
                  className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded uppercase tracking-wider hover:bg-zinc-800 transition-colors"
              >
                Criar Cupom
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Cupons */}
        <div>
          <h3 className="text-lg font-black mb-4 text-black uppercase flex items-center gap-2">
            <Users className="w-5 h-5" /> Cupons Ativos ({activeCoupons.length})
          </h3>
          <div className="bg-white rounded-xl border border-zinc-300 shadow-sm max-h-96 overflow-y-auto">
            {activeCoupons.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-bold uppercase text-sm">
                Nenhum cupom ativo
              </div>
            ) : (
              activeCoupons.map(coupon => (
                <div key={coupon.id} className="p-4 border-b border-zinc-200 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-black text-black text-lg">{coupon.name}</h4>
                      <p className="text-sm text-zinc-600 font-bold mb-2">
                        Cliente: {getCustomerName(coupon.customerId)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-bold px-2 py-1 rounded text-xs uppercase ${
                          coupon.type === 'percentage' ? 'bg-blue-100 text-blue-800' :
                          coupon.type === 'fixed' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` :
                           coupon.type === 'fixed' ? `R$ ${coupon.value.toFixed(2)} OFF` :
                           'Serviço Grátis'}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-zinc-500 mt-2 font-medium">{coupon.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-zinc-400 hover:text-red-600 ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}