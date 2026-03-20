import { useState } from 'react';
import { Plus, Clock, Calendar, Trash2, Play } from 'lucide-react';
import { toast } from '../components/Toast';
import { generateId, getCustomer, checkTimeConflict, formatDate } from '../utils/helpers';
import { formatPhoneNumber, unformatPhoneNumber } from '../utils/phoneAndDate';

export default function AgendaView({ 
  barbers, 
  services, 
  customers, 
  setCustomers, 
  appointments, 
  setAppointments, 
  standbyList, 
  setStandbyList, 
  activeTabs, 
  setActiveTabs,
  setActiveTab
}) {
  const [newApptName, setNewApptName] = useState('');
  const [newApptPhone, setNewApptPhone] = useState('');
  const [newApptBirthDate, setNewApptBirthDate] = useState('');
  const [newApptNotes, setNewApptNotes] = useState('');
  const [newApptDate, setNewApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [newApptTime, setNewApptTime] = useState('');
  const [newApptBarber, setNewApptBarber] = useState(barbers[0]?.id || '');
  const [newApptService, setNewApptService] = useState(services[0]?.id || '');
  const [apptError, setApptError] = useState('');
  const [standbyName, setStandbyName] = useState('');
  const [standbyPhone, setStandbyPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const handleApptPhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setNewApptPhone(formatted);
  };

  const handleStandbyPhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setStandbyPhone(formatted);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(newApptName.toLowerCase()) ||
    c.phone.toLowerCase().includes(newApptName.toLowerCase())
  ).slice(0, 5);

  const handleSelectCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setNewApptName(customer.name);
      setNewApptPhone(customer.phone);
      setNewApptBirthDate(customer.birthDate || '');
      setNewApptNotes(customer.notes || '');
      setSelectedCustomerId(customerId);
    }
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    setApptError('');
    
    // Validações
    const errors = [];
    if (!newApptName || newApptName.trim() === '') errors.push('Nome completo do cliente');
    if (!newApptTime || newApptTime.trim() === '') errors.push('Horário');
    if (!newApptBarber || newApptBarber.trim() === '') errors.push('Profissional');
    if (!newApptService || newApptService.trim() === '') errors.push('Serviço');

    // Validar nome completo (nome e sobrenome)
    const nameParts = newApptName.trim().split(' ');
    if (nameParts.length < 2) {
      errors.push('Nome e sobrenome do cliente');
    }

    // Validar data não pode ser no passado
    const today = new Date().toISOString().split('T')[0];
    if (newApptDate < today) {
      errors.push('Data não pode ser no passado');
    }

    // Validar horário não pode ser no passado para o dia de hoje
    if (newApptDate === today && newApptTime) {
      const now = new Date();
      const [h, m] = newApptTime.split(':').map(Number);
      const apptMinutes = h * 60 + m;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (apptMinutes <= nowMinutes) {
        errors.push('Horário já passou. Escolha um horário futuro');
      }
    }

    // Validar data de nascimento (ano mínimo 1900)
    if (newApptBirthDate && new Date(newApptBirthDate).getFullYear() < 1900) {
      errors.push('Data de nascimento deve ser a partir de 1900');
    }

    if (errors.length > 0) {
      setApptError(`Preencha os campos obrigatórios: ${errors.join(', ')}`);
      return;
    }

    const newApptData = {
      barberId: newApptBarber,
      date: newApptDate,
      time: newApptTime,
      serviceId: newApptService,
    };

    if (checkTimeConflict(newApptData, appointments, services)) {
      setApptError('Conflito! O profissional já possui um atendimento neste período.');
      return;
    }

    let customer = customers.find(c => c.id === selectedCustomerId);
    
    if (!customer && newApptPhone) {
      customer = { 
        id: generateId(), 
        name: newApptName, 
        phone: formatPhoneNumber(newApptPhone), 
        birthDate: newApptBirthDate,
        visits: 0,
        email: '',
        notes: newApptNotes,
        joinDate: new Date().toISOString().split('T')[0],
        cutHistory: []
      };
      setCustomers([...customers, customer]);
    }

    const newAppt = {
      id: generateId(),
      customerName: customer ? customer.name : newApptName,
      customerId: customer ? customer.id : null,
      phone: customer ? customer.phone : newApptPhone,
      date: newApptDate,
      time: newApptTime,
      barberId: newApptBarber,
      serviceId: newApptService,
      status: 'scheduled'
    };

    const updatedAppts = [...appointments, newAppt].sort((a, b) => a.time.localeCompare(b.time));
    setAppointments(updatedAppts);
    toast('Agendamento criado com sucesso!');
    
    setNewApptName('');
    setNewApptPhone('');
    setNewApptBirthDate('');
    setNewApptNotes('');
    setNewApptTime('');
    setSelectedCustomerId('');
    setShowCustomerDropdown(false);
    
    setTimeout(() => setApptError(''), 3000);
  };

  const cancelAppointment = (apptId) => {
    setAppointments(appointments.filter(a => a.id !== apptId));
    toast('Agendamento cancelado');
  };

  const handleAddStandby = (e) => {
    e.preventDefault();
    if (!standbyName) return;
    setStandbyList([...standbyList, { id: generateId(), name: standbyName, phone: standbyPhone }]);
    setStandbyName('');
    setStandbyPhone('');
    toast('Adicionado à lista de espera');
  };

  const promoteStandbyToAppt = (standby) => {
    setNewApptName(standby.name);
    setNewApptPhone(standby.phone);
    setStandbyList(standbyList.filter(s => s.id !== standby.id));
    setApptError('Dados preenchidos. Escolha o horário e confirme o agendamento acima.');
  };

  const startService = (apptId) => {
    setAppointments(appointments.map(a => a.id === apptId ? { ...a, status: 'in-service' } : a));
    
    const appt = appointments.find(a => a.id === apptId);
    const scheduledService = services.find(s => s.id === appt.serviceId);
    
    const comandaInicial = scheduledService ? [{
      id: generateId(),
      item: scheduledService,
      type: 'service',
      barberId: appt.barberId
    }] : [];

    setActiveTabs({
      ...activeTabs,
      [apptId]: { items: comandaInicial, discount: 0 }
    });
    toast('Atendimento iniciado');
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.date === today && a.status !== 'completed');

  return (
    <div className="p-3 md:p-6">
      <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-black uppercase tracking-wider border-b-2 border-black pb-2">Agenda de Horários</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Lado Esquerdo: Formulários */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-black text-black mb-4 uppercase tracking-wide flex items-center gap-2"><Plus className="w-5 h-5"/> Novo Agendamento</h3>
          <form onSubmit={handleAddAppointment} className="bg-white p-5 rounded-xl shadow-sm border-2 border-zinc-200 flex flex-col gap-4">
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={newApptName} 
                  onChange={e => {
                    setNewApptName(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  placeholder="Nome completo do cliente (Nome Sobrenome)..." 
                  className="w-full p-2 border border-zinc-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-sm" 
                  required
                />
                {showCustomerDropdown && newApptName && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-zinc-300 rounded mt-1 shadow-lg z-20 max-h-40 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            handleSelectCustomer(c.id);
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 text-xs font-bold text-black transition-colors"
                        >
                          👤 {c.name} • {c.phone}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-zinc-500 font-bold flex justify-between items-center">
                        <span>Nenhum cliente encontrado com esse nome. Preencha os dados abaixo para criar um novo cliente.</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomerDropdown(false)}
                          className="ml-2 text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-100 rounded transition-colors"
                          title="Fechar"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">WhatsApp (Opcional)</label>
              <input type="text" value={newApptPhone} onChange={handleApptPhoneChange} placeholder="(DD) 90000-0000" className="w-full p-2 border border-zinc-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Data de Nascimento (Opcional)</label>
              <input 
                type="date" 
                value={newApptBirthDate} 
                onChange={e => setNewApptBirthDate(e.target.value)} 
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-zinc-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Observações (Opcional)</label>
              <textarea 
                value={newApptNotes} 
                onChange={e => setNewApptNotes(e.target.value)} 
                placeholder="Ex: Corte para filho, cliente prefere horário da manhã, etc." 
                className="w-full p-2 border border-zinc-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none font-bold text-sm resize-none" 
                rows="2"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Data</label>
                <input 
                  type="date" 
                  value={newApptDate} 
                  onChange={e=>setNewApptDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm" 
                  required 
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Horário</label>
                <input type="time" value={newApptTime} onChange={e=>setNewApptTime(e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Profissional</label>
              <select value={newApptBarber} onChange={e=>setNewApptBarber(e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm bg-white" required>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Serviço Principal</label>
              <select value={newApptService} onChange={e=>setNewApptService(e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm bg-white" required>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price.toFixed(2)}</option>)}
              </select>
            </div>

            {apptError && (
              <div className={`p-3 rounded text-sm font-bold uppercase tracking-wider ${apptError.includes('Conflito') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {apptError}
              </div>
            )}

            <button type="submit" className="bg-black hover:bg-zinc-800 text-white py-3 rounded-lg font-black uppercase tracking-widest mt-2 transition-colors">
              Agendar Horário
            </button>
          </form>

          {/* Lista de Espera */}
          <div className="mt-8">
            <h3 className="text-lg font-black text-black mb-4 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-5 h-5"/> Lista de Espera (Encaixe)
            </h3>
            <form onSubmit={handleAddStandby} className="bg-white p-4 rounded-xl shadow-sm border-2 border-zinc-200 flex flex-col gap-3 mb-4">
              <input type="text" placeholder="Nome do Cliente" value={standbyName} onChange={e=>setStandbyName(e.target.value)} className="p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm" required />
              <input type="text" placeholder="WhatsApp" value={standbyPhone} onChange={handleStandbyPhoneChange} className="p-2 border border-zinc-300 rounded focus:border-black outline-none font-bold text-sm" />
              <button type="submit" className="bg-zinc-200 hover:bg-zinc-300 text-black font-bold py-2 rounded uppercase tracking-wider text-xs transition-colors">Adicionar à Espera</button>
            </form>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {standbyList.map(s => (
                <div key={s.id} className="bg-white p-3 rounded-lg border border-zinc-200 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-black text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-500 font-medium">{s.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => promoteStandbyToAppt(s)} className="text-xs bg-black hover:bg-zinc-800 text-white px-3 py-1 rounded font-black uppercase transition-colors">Agendar</button>
                    <button onClick={() => setStandbyList(standbyList.filter(x => x.id !== s.id))} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
              {standbyList.length === 0 && <p className="text-xs text-zinc-400 font-bold uppercase text-center py-4 border-2 border-dashed border-zinc-200 rounded-lg">Ninguém na espera</p>}
            </div>
          </div>
        </div>

        {/* Lado Direito: Agendamentos do Dia */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-black uppercase tracking-wide flex items-center gap-2"><Calendar className="w-5 h-5"/> Hoje ({formatDate(today)})</h3>
          </div>

          <div className="space-y-4">
            {todaysAppointments.length === 0 ? (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-10 text-center rounded-xl">
                <p className="text-zinc-500 font-bold uppercase tracking-wider">Nenhum agendamento para hoje</p>
              </div>
            ) : (
              todaysAppointments.map((appt) => {
                const srv = services.find(s => s.id === appt.serviceId);
                const brb = barbers.find(b => b.id === appt.barberId);
                const isInService = appt.status === 'in-service';

                return (
                  <div key={appt.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isInService ? 'bg-black text-white border-black' : 'bg-white border-zinc-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-black px-3 py-1 rounded ${isInService ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                        {appt.time}
                      </div>
                      <div>
                        <h4 className={`font-black text-lg ${isInService ? 'text-white' : 'text-black'}`}>{appt.customerName}</h4>
                        <p className={`text-sm font-medium flex gap-2 ${isInService ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <span>{srv?.name}</span> • <span>{brb?.name}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {isInService ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 animate-pulse">Em Atendimento</span>
                          <button onClick={() => setActiveTab('pos')} className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded font-black uppercase text-xs transition-colors">
                            Comanda
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => cancelAppointment(appt.id)} className="text-zinc-400 hover:text-red-600 p-2 border border-zinc-200 hover:border-red-500 hover:bg-red-50 rounded bg-white transition-all" title="Cancelar Agendamento">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => startService(appt.id)} className="bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded flex items-center gap-2 font-black uppercase text-xs transition-colors">
                            <Play className="w-4 h-4" fill="currentColor" /> Iniciar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
