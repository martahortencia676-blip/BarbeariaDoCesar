import React, { useState, useEffect } from 'react';
import { initialBarbers, initialServices, initialProducts, initialCustomers, paymentMethods } from './constants/initialData.jsx';
import { useFirestoreCollection, useFirestoreSetting } from './hooks/useFirestore';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { auth } from './firebase';
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
import { Menu, X, LogOut, Moon, Sun } from 'lucide-react';

const SESSION_KEY = 'barbearia_session';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 min de inatividade

// Mapeamento de email → role (configurar com os emails reais dos usuários)
const EMAIL_ROLE_MAP = {
  // Adicione os emails cadastrados no Firebase Authentication aqui
  // exemplo: 'cesar@gmail.com': 'cesar', 'rodrigo@gmail.com': 'rodrigo'
};

function getRoleFromEmail(email) {
  if (!email) return null;
  const lower = email.toLowerCase();
  // Verifica mapeamento direto
  if (EMAIL_ROLE_MAP[lower]) return EMAIL_ROLE_MAP[lower];
  // Fallback: primeiro email cadastrado = cesar, demais = rodrigo
  if (lower.includes('cesar') || lower.includes('césar')) return 'cesar';
  if (lower.includes('rodrigo')) return 'rodrigo';
  return 'cesar'; // proprietário por padrão
}

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
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userRoles, setUserRoles] = useFirestoreSetting('userRoles', {});
  const [adminPin, setAdminPin, adminPinLoaded] = useFirestoreSetting('adminPin', '1234');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = sessionStorage.getItem('barbearia_darkMode');
    return saved === 'true';
  });
  const [hideValues, setHideValues] = useState(() => {
    const saved = sessionStorage.getItem('barbearia_hideValues');
    return saved === 'true';
  });

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        const role = userRoles[user.uid] || getRoleFromEmail(user.email);
        setUserRole(role);
        setLoggedIn(true);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, lastActivity: Date.now() }));
        
        // Rodrigo sempre inicia com valores ocultos por segurança
        if (role === 'rodrigo') {
          setHideValues(true);
          sessionStorage.setItem('barbearia_hideValues', 'true');
        }
      } else {
        setLoggedIn(false);
        setUserRole(null);
        sessionStorage.removeItem(SESSION_KEY);
      }
    });
    return () => unsubscribe();
  }, [userRoles]);

  // Persistir hideValues no sessionStorage
  useEffect(() => {
    sessionStorage.setItem('barbearia_hideValues', String(hideValues));
  }, [hideValues]);

  // Persistir dark mode
  useEffect(() => {
    sessionStorage.setItem('barbearia_darkMode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
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
        signOut(auth);
      }
    }, 10000);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [loggedIn]);

  // onAuthStateChanged já cuida do login, mas registramos log na primeira detecção
  useEffect(() => {
    if (loggedIn && userRole) {
      const tab = userRole === 'rodrigo' ? 'rodrigo' : (sessionStorage.getItem('barbearia_activeTab') || 'dashboard');
      setActiveTab(tab);
      sessionStorage.setItem('barbearia_activeTab', tab);
      window.history.replaceState({ tab }, '');
    }
  }, [loggedIn, userRole]);
  
  // Bancos de dados editáveis (sincronizados com Firebase)
  const [barbers, setBarbers, barbersLoaded] = useFirestoreCollection('barbers', initialBarbers);
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

  const dataLoaded = servicesLoaded && productsLoaded && customersLoaded && transactionsLoaded && barbersLoaded;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // --- TELA DE CARREGAMENTO AUTH ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white font-bold uppercase tracking-wider text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  // --- TELA DE LOGIN ---
  if (!loggedIn) {
    return <LoginScreen onLogin={() => {}} />;
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
    <div className={`flex h-screen font-sans ${darkMode ? 'dark bg-zinc-900 text-zinc-100' : 'bg-zinc-100 text-black'}`}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} lowStockCount={lowStockCount} userRole={userRole} onLogout={() => { setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole, action: 'logout', timestamp: new Date() }]); signOut(auth); }} />
      </div>

      <main className={`flex-1 overflow-auto min-w-0 ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
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
              onClick={() => setDarkMode(v => !v)}
              className={`font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 ${darkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-yellow-400' : 'bg-zinc-200 hover:bg-zinc-300 text-black'}`}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setLoginLogs(prev => [...prev, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), role: userRole, action: 'logout', timestamp: new Date() }]); signOut(auth); }}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          {userRole === 'cesar' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHideValues(v => !v)}
              className={`font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider ${darkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-200 hover:bg-zinc-300 text-black'}`}
            >
              {hideValues ? 'Mostrar' : 'Ocultar'}
            </button>
            <button
              onClick={() => setShowChangePassword(v => !v)}
              className={`font-bold py-2 px-3 md:px-4 rounded-lg text-xs uppercase tracking-wider ${darkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-200 hover:bg-zinc-300 text-black'}`}
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
                onClick={async () => {
                  if (newPasswordInput.length < 6) {
                    setPasswordMsg('Mínimo 6 caracteres');
                    return;
                  }
                  try {
                    await updatePassword(auth.currentUser, newPasswordInput);
                    setNewPasswordInput('');
                    setShowChangePassword(false);
                    setPasswordMsg('Senha alterada!');
                    setTimeout(() => setPasswordMsg(''), 3000);
                  } catch (err) {
                    if (err.code === 'auth/requires-recent-login') {
                      setPasswordMsg('Faça login novamente para alterar a senha');
                    } else {
                      setPasswordMsg('Erro ao alterar senha');
                    }
                    setTimeout(() => setPasswordMsg(''), 5000);
                  }
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
            userRole={userRole}
            loginLogs={loginLogs}
            setLoginLogs={setLoginLogs}
            cesarPassword={password}
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
            loginLogs={loginLogs}
            setLoginLogs={setLoginLogs}
            cesarPassword={adminPin}
          />
        )}

        {activeTab === 'loginlogs' && (
          <LoginLogsView loginLogs={loginLogs} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsView
            barbers={barbers}
            setBarbers={setBarbers}
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
            darkMode={darkMode}
            cesarPassword={adminPin}
            adminPin={adminPin}
            setAdminPin={setAdminPin}
            userRole={userRole}
            loginLogs={loginLogs}
            setLoginLogs={setLoginLogs}
          />
        )}
      </main>
      <ToastContainer />
    </div>
  );
}
