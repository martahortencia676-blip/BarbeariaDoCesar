import React, { useState } from 'react';
import { initialBarbers, initialServices, initialProducts, initialCustomers, paymentMethods } from './constants/initialData.jsx';
import { useFirestoreCollection, useFirestoreSetting } from './hooks/useFirestore';
import Sidebar from './components/Sidebar';
import CoverScreen from './components/CoverScreen';
import DashboardView from './pages/DashboardView';
import AgendaView from './pages/AgendaView';
import POSView from './pages/POSView';
import ClientsView from './pages/ClientsView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import CouponsView from './pages/CouponsView';
import PerformanceView from './pages/PerformanceView';
import RodrigoPage from './pages/RodrigoPage';
import LoginScreen from './components/LoginScreen.jsx';
import { Menu, X } from 'lucide-react';

export default function App() {
  // --- ESTADOS DO SISTEMA ---
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword, passwordLoaded] = useFirestoreSetting('password', 'Bcesar@26');
  const [hideValues, setHideValues] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showCover, setShowCover] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Bancos de dados editáveis (sincronizados com Firebase)
  const [barbers] = useState(initialBarbers);
  const [services, setServices, servicesLoaded] = useFirestoreCollection('services', initialServices);
  const [products, setProducts, productsLoaded] = useFirestoreCollection('products', initialProducts);
  const [customers, setCustomers, customersLoaded] = useFirestoreCollection('customers', initialCustomers);
  
  // Operacional (sincronizado com Firebase)
  const [appointments, setAppointments, appointmentsLoaded] = useFirestoreCollection('appointments', []);
  const [standbyList, setStandbyList] = useState([]);
  
  // Financeiro (sincronizado com Firebase)
  const [activeTabs, setActiveTabs] = useState({});
  const [transactions, setTransactions, transactionsLoaded] = useFirestoreCollection('transactions', []);
  const [manualTransactions, setManualTransactions, manualLoaded] = useFirestoreCollection('manualTransactions', []);
  
  // Cupons (sincronizado com Firebase)
  const [coupons, setCoupons, couponsLoaded] = useFirestoreCollection('coupons', []);

  const dataLoaded = servicesLoaded && productsLoaded && customersLoaded && transactionsLoaded && passwordLoaded;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // --- TELA DE LOGIN ---
  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} currentPassword={password} />;
  }
  if (showCover) {
    return <CoverScreen onEnter={() => setShowCover(false)} />;
  }

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white font-bold uppercase tracking-wider text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL DO SISTEMA ---
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-zinc-100 font-sans text-black">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} lowStockCount={lowStockCount} />
      </div>

      <main className="flex-1 overflow-auto bg-zinc-100 min-w-0">
        {/* Top bar */}
        <div className="flex flex-wrap items-center p-3 md:p-4 gap-2">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden bg-black text-white p-2 rounded-lg mr-auto"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              onClick={() => setHideValues(v => !v)}
              className="bg-zinc-200 hover:bg-zinc-300 text-black font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider"
            >
              {hideValues ? 'Mostrar' : 'Ocultar'}
            </button>
            <button
              onClick={() => setShowChangePassword(v => !v)}
              className="bg-zinc-200 hover:bg-zinc-300 text-black font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider"
            >
              Alterar senha
            </button>
          </div>
          {showChangePassword && (
            <div className="w-full flex flex-wrap items-center gap-2 mt-2">
              <input
                type="password"
                placeholder="Nova senha"
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                className="p-2 border border-zinc-300 rounded font-bold focus:border-black outline-none text-sm"
              />
              <button
                onClick={() => {
                  if (newPasswordInput.length < 6) {
                    setPasswordMsg('Mínimo 6 caracteres');
                    return;
                  }
                  setPassword(newPasswordInput);
                  setNewPasswordInput('');
                  setShowChangePassword(false);
                  setPasswordMsg('Senha alterada!');
                  setTimeout(() => setPasswordMsg(''), 3000);
                }}
                className="bg-black text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider hover:bg-zinc-800"
              >
                Salvar
              </button>
              {passwordMsg && <span className="text-xs font-bold text-green-600">{passwordMsg}</span>}
            </div>
          )}
          {!showChangePassword && passwordMsg && <span className="text-xs font-bold text-green-600">{passwordMsg}</span>}
        </div>
        {activeTab === 'dashboard' && (
          <DashboardView
            customers={customers}
            transactions={transactions}
            barbers={barbers}
            products={products}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaView
            barbers={barbers}
            services={services}
            customers={customers}
            setCustomers={setCustomers}
            appointments={appointments}
            setAppointments={setAppointments}
            standbyList={standbyList}
            setStandbyList={setStandbyList}
            activeTabs={activeTabs}
            setActiveTabs={setActiveTabs}
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'pos' && (
          <POSView
            barbers={barbers}
            services={services}
            products={products}
            setProducts={setProducts}
            customers={customers}
            setCustomers={setCustomers}
            appointments={appointments}
            setAppointments={setAppointments}
            activeTabs={activeTabs}
            setActiveTabs={setActiveTabs}
            transactions={transactions}
            setTransactions={setTransactions}
            paymentMethods={paymentMethods}
            coupons={coupons}
            setCoupons={setCoupons}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            customers={customers}
            setCustomers={setCustomers}
            transactions={transactions}
          />
        )}

        {activeTab === 'coupons' && (
          <CouponsView
            coupons={coupons}
            setCoupons={setCoupons}
            customers={customers}
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsView
            barbers={barbers}
            transactions={transactions}
            paymentMethods={paymentMethods}
            manualTransactions={manualTransactions}
            setManualTransactions={setManualTransactions}
            services={services}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceView
            barbers={barbers}
            transactions={transactions}
            customers={customers}
            services={services}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'rodrigo' && (
          <RodrigoPage
            transactions={transactions}
            customers={customers}
            services={services}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsView
            services={services}
            setServices={setServices}
            products={products}
            setProducts={setProducts}
            customers={customers}
            setCustomers={setCustomers}
            transactions={transactions}
            setTransactions={setTransactions}
            appointments={appointments}
            setAppointments={setAppointments}
            coupons={coupons}
            setCoupons={setCoupons}
            manualTransactions={manualTransactions}
            setManualTransactions={setManualTransactions}
          />
        )}
      </main>
    </div>
  );
}
