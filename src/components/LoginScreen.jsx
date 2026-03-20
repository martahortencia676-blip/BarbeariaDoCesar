import { useState } from 'react';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      // onLogin será chamado pelo onAuthStateChanged no App.jsx
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSending(true);
    setForgotMsg('');
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.');
      setForgotEmail('');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setForgotMsg('E-mail não encontrado no sistema.');
      } else {
        setForgotMsg('Erro ao enviar. Verifique o e-mail e tente novamente.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo e Nome */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-zinc-700 shadow-2xl mb-4 bg-black">
            <img
              src={`${import.meta.env.BASE_URL}Barbearia%20do%20Cesar%20LOGO.jpg`}
              alt="Logo Barbearia do César"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                if (!e.target.src.includes('via.placeholder')) {
                  e.target.src = 'https://via.placeholder.com/150x150.png?text=LOGO';
                }
              }}
            />
          </div>
          <h1 className="text-white font-black text-2xl tracking-[0.3em] uppercase">Barbearia</h1>
          <p className="text-zinc-500 font-bold text-sm tracking-[0.5em] uppercase mt-1">Do César</p>
        </div>

        {/* Card de Login / Esqueci senha */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          {showForgot ? (
            <>
              <button onClick={() => { setShowForgot(false); setForgotMsg(''); }} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Voltar
              </button>
              <h2 className="text-white font-black text-lg uppercase tracking-wider mb-2">Recuperar Senha</h2>
              <p className="text-zinc-500 text-xs font-medium mb-6">Digite seu e-mail cadastrado. O Google enviará um link de recuperação diretamente para o seu Gmail.</p>
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    placeholder="E-mail de recuperação"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold focus:border-white outline-none text-sm placeholder-zinc-600"
                    required
                  />
                </div>
                {forgotMsg && (
                  <div className={`text-xs font-bold p-3 rounded-lg ${forgotMsg.includes('enviado') ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                    {forgotMsg}
                  </div>
                )}
                <button type="submit" disabled={sending} className="bg-white text-black font-black py-3 rounded-xl uppercase tracking-wider hover:bg-zinc-200 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar Link de Recuperação'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-white font-black text-lg uppercase tracking-wider mb-1 text-center">Acesso ao Sistema</h2>
              <p className="text-zinc-600 text-xs font-medium mb-6 text-center">Digite seu e-mail e senha para entrar</p>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold focus:border-white outline-none text-sm placeholder-zinc-600"
                    required
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold focus:border-white outline-none text-sm placeholder-zinc-600"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-400 text-xs font-bold bg-red-900/20 border border-red-800 p-2 rounded-lg text-center">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="bg-white text-black font-black py-3 rounded-xl uppercase tracking-wider hover:bg-zinc-200 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : 'Entrar'}
                </button>
              </form>
              <button
                onClick={() => setShowForgot(true)}
                className="w-full text-center text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-wider mt-4 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </>
          )}
        </div>

        <p className="text-zinc-800 text-[10px] text-center mt-6 font-medium tracking-wider">
          © {new Date().getFullYear()} BARBEARIA DO CÉSAR — TODOS OS DIREITOS RESERVADOS
        </p>
      </div>
    </div>
  );
}
