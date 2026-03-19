import { useState, useEffect } from 'react';
import { ShoppingCart, Scissors, Beer, Check, Award, Trash2, Search } from 'lucide-react';
import { generateId, getCustomer } from '../utils/helpers';
import CheckoutModal from '../components/CheckoutModal';

export default function POSView({
  barbers,
  services,
  products,
  setProducts,
  customers,
  setCustomers,
  appointments,
  setAppointments,
  activeTabs,
  setActiveTabs,
  transactions,
  setTransactions,
  paymentMethods,
  coupons,
  setCoupons
}) {
  const [selectedApptId, setSelectedApptId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0].id);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const activeClients = appointments.filter(a => a.status === 'in-service');
  const currentAppt = activeClients.find(a => a.id === selectedApptId);
  const currentTab = currentAppt ? (activeTabs[currentAppt.id] || { items: [], discount: 0 }) : { items: [], discount: 0 };

  // Ao trocar de cliente, ajustar o barbeiro selecionado para o do agendamento
  useEffect(() => {
    if (currentAppt?.barberId) {
      setSelectedBarberId(currentAppt.barberId);
    }
  }, [selectedApptId]);
  
  const customerRecord = currentAppt?.customerId ? getCustomer(currentAppt.customerId, customers) : null;
  const isEligibleForFreeCut = customerRecord && (customerRecord.visits + 1) % 10 === 0;

  // Cupons disponíveis para o cliente atual
  const availableCoupons = currentAppt?.customerId ? 
    coupons.filter(c => c.customerId === currentAppt.customerId && !c.used) : [];

  const subtotal = currentTab.items.reduce((acc, curr) => acc + curr.item.price, 0);
  
  // Calcular desconto do cupom
  const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
  let couponDiscount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.type === 'percentage') {
      couponDiscount = subtotal * (selectedCoupon.value / 100);
    } else if (selectedCoupon.type === 'fixed') {
      couponDiscount = Math.min(selectedCoupon.value, subtotal);
    } else if (selectedCoupon.type === 'free-service') {
      // Serviço mais barato grátis
      const serviceItems = currentTab.items.filter(i => i.type === 'service');
      if (serviceItems.length > 0) {
        couponDiscount = Math.min(...serviceItems.map(i => i.item.price));
      }
    }
  }

  const total = Math.max(0, subtotal - currentTab.discount - couponDiscount);

  useEffect(() => {
    if (!selectedApptId && activeClients.length > 0) {
      setSelectedApptId(activeClients[0].id);
    }
  }, [activeClients, selectedApptId]);

  const handleAddItem = (item, type) => {
    if (!currentAppt) return;
    
    if (type === 'product') {
      const productData = products.find(p => p.id === item.id);
      if (productData.stock <= 0) {
        alert("Estoque esgotado para " + item.name);
        return;
      }
      setProducts(products.map(p => p.id === item.id ? { ...p, stock: p.stock - 1 } : p));
    }

    const newItem = {
      id: generateId(),
      item: item,
      type: type,
      barberId: type === 'service' ? selectedBarberId : null
    };

    setActiveTabs({
      ...activeTabs,
      [currentAppt.id]: {
        ...currentTab,
        items: [...currentTab.items, newItem]
      }
    });
  };

  const handleRemoveItem = (indexToRemove) => {
    const itemToRemove = currentTab.items[indexToRemove];
    
    if (itemToRemove.type === 'product') {
      setProducts(products.map(p => p.id === itemToRemove.item.id ? { ...p, stock: p.stock + 1 } : p));
    }

    const newItems = currentTab.items.filter((_, index) => index !== indexToRemove);
    setActiveTabs({
      ...activeTabs,
      [currentAppt.id]: { ...currentTab, items: newItems }
    });
  };

  const applyLoyaltyDiscount = () => {
    if (!isEligibleForFreeCut) return;
    const servicesInTab = currentTab.items.filter(i => i.type === 'service');
    if (servicesInTab.length > 0) {
      const discountValue = servicesInTab[0].item.price;
      setActiveTabs({
        ...activeTabs,
        [currentAppt.id]: { ...currentTab, discount: discountValue }
      });
    }
  };

  const handleCheckout = () => {
    const transaction = {
      id: generateId(),
      date: new Date(),
      customerId: currentAppt.customerId,
      customerName: currentAppt.customerName,
      total: total,
      paymentMethod: paymentMethod,
      items: currentTab.items,
      discount: currentTab.discount + couponDiscount,
      couponId: selectedCouponId || null
    };
    setTransactions([...transactions, transaction]);

    if (currentAppt.customerId) {
      setCustomers(customers.map(c => 
        c.id === currentAppt.customerId ? { ...c, visits: c.visits + 1 } : c
      ));
    }

    // Marcar cupom como usado
    if (selectedCouponId) {
      setCoupons(coupons.map(c => 
        c.id === selectedCouponId ? { ...c, used: true } : c
      ));
    }

    setAppointments(appointments.map(a => a.id === currentAppt.id ? { ...a, status: 'completed' } : a));
    
    const newTabs = { ...activeTabs };
    delete newTabs[currentAppt.id];
    setActiveTabs(newTabs);

    setCheckoutModalOpen(false);
    setSelectedApptId('');
    setSelectedCouponId('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-zinc-100">
      <div className="flex-1 p-6 overflow-y-auto">
        
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-zinc-300">
          <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">Profissional Adicional (Extras)</label>
          <div className="flex gap-3">
            {barbers.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBarberId(b.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all border-2 ${
                  selectedBarberId === b.id 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-zinc-200 hover:border-black'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-300 pb-2">
          <Scissors className="w-5 h-5" /> Adicionar Serviços
        </h3>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar serviço..."
            value={serviceSearch}
            onChange={e => setServiceSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-xl font-bold focus:border-black outline-none text-sm bg-white"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {services
            .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
            .map(service => (
            <button
              key={service.id}
              onClick={() => handleAddItem(service, 'service')}
              className="bg-white hover:border-black border-2 border-zinc-200 p-4 rounded-xl text-left transition-all group hover:shadow-md"
            >
              <div className="font-bold text-black text-sm">{service.name}</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">{service.duration} min</div>
              <div className="mt-2 text-lg font-black text-black">R$ {service.price.toFixed(2)}</div>
            </button>
          ))}
          {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
            <p className="col-span-full text-center text-zinc-400 font-bold text-sm py-4">Nenhum serviço encontrado</p>
          )}
        </div>

        <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-300 pb-2">
          <Beer className="w-5 h-5" /> Consumo & Produtos
        </h3>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-xl font-bold focus:border-black outline-none text-sm bg-white"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {products
            .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
            .map(product => (
            <button
              key={product.id}
              onClick={() => handleAddItem(product, 'product')}
              disabled={product.stock <= 0}
              className={`p-4 rounded-xl text-left transition-all border-2 ${
                product.stock <= 0 
                ? 'bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed' 
                : 'bg-white hover:border-black border-zinc-200 group'
              }`}
            >
              <div className={`font-bold ${product.stock <= 0 ? 'text-zinc-500' : 'text-black'}`}>{product.name}</div>
              <div className={`text-sm mt-1 font-medium ${product.stock <= product.minStock && product.stock > 0 ? 'text-black bg-zinc-200 inline-block px-1 rounded' : 'text-zinc-500'}`}>
                Estoque: {product.stock}
              </div>
              <div className="mt-3 text-lg font-black text-black">R$ {product.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar da Comanda */}
      <div className="w-96 bg-white border-l-2 border-zinc-300 flex flex-col z-10">
        <div className="p-4 border-b border-zinc-800 bg-black text-white">
          <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-wider"><ShoppingCart className="w-5 h-5" /> Comanda</h2>
          
          <div className="mt-4">
            <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider font-bold">Cliente em Atendimento</label>
            <select 
              value={selectedApptId}
              onChange={(e) => setSelectedApptId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded p-2 focus:ring-2 focus:ring-white outline-none font-bold"
            >
              <option value="" disabled>Selecione um cliente da agenda</option>
              {activeClients.map(a => (
                <option key={a.id} value={a.id}>{a.customerName} - {a.time}</option>
              ))}
            </select>
          </div>
        </div>

        {!currentAppt ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 font-bold uppercase tracking-wider gap-4">
            <p>Nenhum atendimento iniciado.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
              {currentTab.items.length === 0 ? (
                <p className="text-zinc-400 text-center mt-10 font-bold uppercase text-sm">Comanda vazia</p>
              ) : (
                currentTab.items.map((entry, index) => (
                  <div key={entry.id} className="flex justify-between items-start bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                    <div>
                      <p className="font-bold text-black">{entry.item.name}</p>
                      {entry.type === 'service' && (
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                          Barbeiro: {barbers.find(b => b.id === entry.barberId)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-black">R$ {entry.item.price.toFixed(2)}</span>
                      <button onClick={() => handleRemoveItem(index)} className="text-zinc-400 hover:text-black text-xs mt-2 flex items-center gap-1 font-bold">
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t-2 border-zinc-200 bg-white">
              {isEligibleForFreeCut && currentTab.discount === 0 && (
                <div className="bg-black text-white p-3 rounded-lg mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1 uppercase tracking-wider"><Award className="w-4 h-4" /> 10º Corte!</p>
                    <p className="text-xs text-zinc-300">Serviço grátis disponível.</p>
                  </div>
                  <button onClick={applyLoyaltyDiscount} className="bg-white text-black text-xs px-3 py-1 rounded font-black hover:bg-zinc-200 uppercase">Aplicar</button>
                </div>
              )}

              {/* Seletor de Cupons */}
              {availableCoupons.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs text-zinc-600 mb-2 uppercase tracking-wider font-bold">Cupom de Desconto</label>
                  <select
                    value={selectedCouponId}
                    onChange={e => setSelectedCouponId(e.target.value)}
                    className="w-full bg-zinc-100 border border-zinc-300 text-black rounded p-2 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                  >
                    <option value="">Selecionar cupom</option>
                    {availableCoupons.map(coupon => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.name} - {
                          coupon.type === 'percentage' ? `${coupon.value}% OFF` :
                          coupon.type === 'fixed' ? `R$ ${coupon.value.toFixed(2)} OFF` :
                          'Serviço Grátis'
                        }
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between text-zinc-600 mb-2 font-bold text-sm uppercase">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {currentTab.discount > 0 && (
                <div className="flex justify-between text-black mb-2 font-bold text-sm uppercase">
                  <span>Desconto Fidelidade</span>
                  <span>- R$ {currentTab.discount.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 mb-2 font-bold text-sm uppercase">
                  <span>Desconto Cupom</span>
                  <span>- R$ {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black text-black mb-6 pb-4 border-b border-zinc-200">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => setCheckoutModalOpen(true)}
                disabled={currentTab.items.length === 0}
                className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 text-white py-4 rounded-xl font-black text-lg transition-colors flex justify-center items-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-6 h-6" /> Cobrar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de Pagamento */}
      {checkoutModalOpen && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          onCheckout={handleCheckout}
          customerName={currentAppt?.customerName}
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}
