export default function CheckoutModal({
  isOpen,
  onClose,
  onCheckout,
  customerName,
  total,
  paymentMethod,
  setPaymentMethod,
  paymentMethods
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-black">
        <div className="bg-black p-6 text-white text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">Pagamento</h2>
          <p className="text-zinc-400 font-bold mt-1">{customerName}</p>
          <div className="text-5xl font-black mt-4">R$ {total.toFixed(2)}</div>
        </div>
        
        <div className="p-6">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wide text-center">Forma de Recebimento</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                  paymentMethod === method.id 
                  ? 'border-black bg-black text-white' 
                  : 'border-zinc-200 bg-white text-black hover:border-black'
                }`}
              >
                {method.icon}
                <span className="text-sm">{method.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-200 hover:bg-zinc-300 text-black font-black rounded-xl transition-colors uppercase"
            >
              Voltar
            </button>
            <button 
              onClick={onCheckout}
              className="flex-[2] py-3 px-4 bg-black hover:bg-zinc-800 text-white font-black rounded-xl transition-colors uppercase"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
