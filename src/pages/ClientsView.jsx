import { useState } from 'react';
import { Users, Plus, Trash2, Eye, Calendar, Phone, Mail, Gift } from 'lucide-react';
import { formatPhoneNumber, unformatPhoneNumber, calculateAge, isBirthdayToday, generateWhatsAppLink, getMonthCutCount } from '../utils/phoneAndDate';
import { generateId, formatDate } from '../utils/helpers';

export default function ClientsView({
  customers,
  setCustomers,
  transactions
}) {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Form para novo cliente
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setNewPhone(formatted);
  };

  const handleDeleteClient = (clientId) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      setCustomers(customers.filter(c => c.id !== clientId));
      setSelectedClientId(null);
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    
    // Validações
    const errors = [];
    if (!newName || newName.trim() === '') errors.push('Nome completo');
    if (!newPhone || newPhone.trim() === '') errors.push('Telefone');
    
    // Validar nome completo (nome e sobrenome)
    const nameParts = newName.trim().split(' ');
    if (nameParts.length < 2) {
      errors.push('Nome e sobrenome');
    }

    // Validar data de nascimento (ano mínimo 1900)
    if (newBirthDate && new Date(newBirthDate).getFullYear() < 1900) {
      errors.push('Data de nascimento deve ser a partir de 1900');
    }

    if (errors.length > 0) {
      alert(`Preencha os campos corretamente: ${errors.join(', ')}`);
      return;
    }

    const client = {
      id: generateId(),
      name: newName.trim(),
      phone: newPhone.trim(),
      birthDate: newBirthDate,
      email: newEmail.trim(),
      notes: newNotes.trim(),
      visits: 0,
      joinDate: new Date().toISOString().split('T')[0],
      cutHistory: []
    };

    setCustomers([...customers, client]);
    setNewName('');
    setNewPhone('');
    setNewBirthDate('');
    setNewEmail('');
    setNewNotes('');
    setShowNewClientForm(false);
  };

  const selectedClient = customers.find(c => c.id === selectedClientId);
  const clientCuts = selectedClient ? transactions.filter(t => t.customerId === selectedClient.id && t.items.some(i => i.type === 'service')) : [];
  const monthCutCount = selectedClient ? getMonthCutCount(clientCuts) : 0;
  const age = selectedClient && selectedClient.birthDate ? calculateAge(selectedClient.birthDate) : null;
  const isBirthday = selectedClient && isBirthdayToday(selectedClient.birthDate);

  return (
    <div className="p-3 md:p-6">
      <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2">Gestão de Clientes</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-black uppercase tracking-wide flex items-center gap-2"><Users className="w-5 h-5"/> Clientes</h3>
            <button
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="bg-black hover:bg-zinc-800 text-white px-3 py-2 rounded font-bold text-xs uppercase flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>

          {showNewClientForm && (
            <form onSubmit={handleAddClient} className="bg-white p-4 rounded-xl border-2 border-zinc-200 mb-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-medium text-sm"
                required
              />
              <input
                type="text"
                placeholder="(83) 99999-9999"
                value={newPhone}
                onChange={handlePhoneChange}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-medium text-sm"
                required
              />
              <input
                type="date"
                value={newBirthDate}
                onChange={e => setNewBirthDate(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-medium text-sm"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-medium text-sm"
              />
              <textarea
                placeholder="Notas..."
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-medium text-sm resize-none"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white py-2 rounded font-bold uppercase text-xs transition-colors"
                >
                  Cadastrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(false)}
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-black py-2 rounded font-bold uppercase text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {customers.length === 0 ? (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-8 text-center rounded-xl">
                <p className="text-zinc-500 font-bold uppercase text-sm">Nenhum cliente cadastrado</p>
              </div>
            ) : (
              customers.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedClientId === client.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-zinc-200 hover:border-black'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        {client.name}
                        {isBirthdayToday(client.birthDate) && <Gift className="w-4 h-4 text-yellow-500" />}
                      </p>
                      <p className={`text-xs font-medium ${selectedClientId === client.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {client.phone}
                      </p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded ${selectedClientId === client.id ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-black'}`}>
                      {client.visits} visitas
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detalhes do Cliente */}
        <div className="lg:col-span-2">
          {!selectedClient ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-12 text-center rounded-xl h-full flex items-center justify-center">
              <div>
                <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-bold uppercase text-sm">Selecione um cliente para ver detalhes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header do Cliente */}
              <div className="bg-black text-white p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-wider">{selectedClient.name}</h3>
                    {isBirthday && (
                      <p className="text-yellow-400 font-bold text-sm mt-1 flex items-center gap-1">
                        <Gift className="w-4 h-4" /> Aniversariante hoje!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="text-red-500 hover:text-red-400 p-2 hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 p-3 rounded-lg">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Visitas</p>
                    <p className="text-3xl font-black text-white mt-1">{selectedClient.visits}</p>
                  </div>
                  <div className="bg-zinc-900 p-3 rounded-lg">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Cortes (Mês)</p>
                    <p className="text-3xl font-black text-white mt-1">{monthCutCount}</p>
                  </div>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="bg-white p-6 rounded-xl border border-zinc-300">
                <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Informações Pessoais</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                    <Phone className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Telefone</p>
                      <a href={generateWhatsAppLink(selectedClient.phone, 'Olá! Tudo bem?')} target="_blank" rel="noopener noreferrer" className="font-bold text-black hover:text-green-600 transition-colors">
                        {selectedClient.phone} ↗
                      </a>
                    </div>
                  </div>

                  {selectedClient.birthDate && (
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                      <Calendar className="w-5 h-5 text-black" />
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Aniversário</p>
                        <p className="font-bold text-black">{formatDate(selectedClient.birthDate)} ({age} anos)</p>
                      </div>
                    </div>
                  )}

                  {selectedClient.email && (
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                      <Mail className="w-5 h-5 text-black" />
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Email</p>
                        <p className="font-bold text-black">{selectedClient.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Cadastrado em</p>
                    <p className="font-bold text-black">{formatDate(selectedClient.joinDate)}</p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="mt-4 pt-4 border-t border-zinc-200">
                    <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Notas</p>
                    <p className="text-sm text-zinc-700 bg-zinc-50 p-2 rounded">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* Histórico de Cortes */}
              <div className="bg-white p-6 rounded-xl border border-zinc-300">
                <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wider">Histórico de Cortes</h4>
                {clientCuts.length === 0 ? (
                  <p className="text-zinc-400 text-center py-6 font-bold uppercase text-sm">Nenhum corte registrado</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {clientCuts.slice().reverse().map((cut, index) => (
                      <div key={cut.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-black">{new Date(cut.date).toLocaleDateString('pt-BR')}</p>
                            <p className="text-xs text-zinc-600 font-medium">
                              {cut.items.filter(i => i.type === 'service').map(i => i.item.name).join(', ')}
                            </p>
                          </div>
                          <p className="font-black text-black">R$ {cut.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
