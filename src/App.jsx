import React, { useState, useEffect } from 'react';
import { initialBarbers, initialServices, initialProducts, initialCustomers, paymentMethods } from './constants/initialData.jsx';
import { useFirestoreCollection, useFirestoreSetting } from './hooks/useFirestore';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import DashboardView from './pages/DashboardView';
import AgendaView from './pages/AgendaView';
import POSView from './pages/POSView';
import ClientsView from './pages/ClientsView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import CouponsView from './pages/CouponsView';
import PerformanceView from './pages/PerformanceView';
import RodrigoPage from './pages/RodrigoPage';
import CesarPage from './pages/CesarPage';
import TransactionHistoryView from './pages/TransactionHistoryView';
import LoginLogsView from './pages/LoginLogsView';
import LoginScreen from './components/LoginScreen.jsx';
import { Menu, X, LogOut } from 'lucide-react';

const SESSION_KEY = 'barbearia_session';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 min de inatividade

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.lastActivity > INACTIVITY_TIMEOUT) return null;
    return data;
  } catch { return null; }
}

export default function App() {
  // --- ESTADOS DO SISTEMA ---
  const [loggedIn, setLoggedIn] = useState(() => !!getSession());
  const [userRole, setUserRole] = useState(() => getSession()?.role || null);
  const [password, setPassword, passwordLoaded] = useFirestoreSetting('password', 'Bcesar@26');
  const [hideValues, setHideValues] = useState(() => {
    const saved = sessionStorage.getItem('barbearia_hideValues');
    return saved === 'true';
  });

  // Persistir hideValues no sessionStorage
  useEffect(() => {
    sessionStorage.setItem('barbearia_hideValues', String(hideValues));
  }, [hideValues]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem('barbearia_activeTab');
    return saved || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persistir aba ativa e histórico do navegador
  useEffect(() => {
    sessionStorage.setItem('barbearia_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const onPopState = (e) => {
      if (e.state?.tab) {
        setActiveTab(e.state.tab);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    // Estado inicial no histórico
    if (!window.history.state?.tab) {
      window.history.replaceState({ tab: activeTab }, '');
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Auto-logout por inatividade (30 min sem interação)
  useEffect(() => {
    if (!loggedIn) return;
    const resetActivity = () => {
      const s = getSession();
      if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, lastActivity: Date.now() }));
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetActivity));
    const interval = setInterval(() => {
      if (!getSession()) {
        setLoggedIn(false);
        setUserRole(null);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }, 10000);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [loggedIn]);

  const handleLogin = (role) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, lastActivity: Date.now() }));
    setUserRole(role);
    setLoggedIn(true);
    const tab = role === 'rodrigo' ? 'rodrigo' : 'dashboard';
    setActiveTab(tab);
    sessionStorage.setItem('barbearia_activeTab', tab);
    window.history.replaceState({ tab }, '');
    // Rodrigo sempre inicia com valores ocultos por segurança
    if (role === 'rodrigo') {
      setHideValues(true);
      sessionStorage.setItem('barbearia_hideValues', 'true');
    }
    // Registrar log de login
    setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role, action: 'login', timestamp: new Date() }]);
  };
  
  // Bancos de dados editáveis (sincronizados com Firebase)
  const [barbers] = useState(initialBarbers);
  const [services, setServices, servicesLoaded] = useFirestoreCollection('services', initialServices);
  const [products, setProducts, productsLoaded] = useFirestoreCollection('products', initialProducts);
  const [customers, setCustomers, customersLoaded] = useFirestoreCollection('customers', initialCustomers);
  
  // Operacional (sincronizado com Firebase)
  const [appointments, setAppointments, appointmentsLoaded] = useFirestoreCollection('appointments', []);
  const [standbyList, setStandbyList] = useFirestoreCollection('standbyList', []);
  
  // Financeiro (sincronizado com Firebase)
  const [activeTabs, setActiveTabs] = useState({});
  const [transactions, setTransactions, transactionsLoaded] = useFirestoreCollection('transactions', []);
  const [manualTransactions, setManualTransactions, manualLoaded] = useFirestoreCollection('manualTransactions', []);
  
  // Cupons (sincronizado com Firebase)
  const [coupons, setCoupons, couponsLoaded] = useFirestoreCollection('coupons', []);

  // Login Logs (sincronizado com Firebase)
  const [loginLogs, setLoginLogs, loginLogsLoaded] = useFirestoreCollection('loginLogs', []);

  const dataLoaded = servicesLoaded && productsLoaded && customersLoaded && transactionsLoaded && passwordLoaded;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // --- TELA DE LOGIN ---
  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} cesarPassword={password} rodrigoPassword="Rodrigo10B26" />;
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
    if (tab !== activeTab) {
      window.history.pushState({ tab }, '');
    }
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
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} lowStockCount={lowStockCount} userRole={userRole} onLogout={() => { setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole, action: 'logout', timestamp: new Date() }]); sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); setUserRole(null); }} />
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
              onClick={() => { setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole, action: 'logout', timestamp: new Date() }]); sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); setUserRole(null); }}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          {userRole === 'cesar' && (
          <div className="flex flex-wrap items-center gap-2">
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
          )}
          </div>
          {userRole === 'cesar' && showChangePassword && (
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
          {userRole === 'cesar' && !showChangePassword && passwordMsg && <span className="text-xs font-bold text-green-600">{passwordMsg}</span>}
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
            hideServiceValues={userRole === 'rodrigo'}
          />
        )}

        {activeTab === 'cesar' && (
          <CesarPage
            transactions={transactions}
            customers={customers}
            services={services}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistoryView
            transactions={transactions}
            setTransactions={setTransactions}
            customers={customers}
            barbers={barbers}
            userRole={userRole}
            hideValues={hideValues}
          />
        )}

        {activeTab === 'loginlogs' && (
          <LoginLogsView loginLogs={loginLogs} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsView
            barbers={barbers}
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
            standbyList={standbyList}
          />
        )}
      </main>
      <ToastContainer />
    </div>
  );
}
