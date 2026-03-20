import { useState } from 'react';

export default function LoginScreen({ onLogin, cesarPassword, rodrigoPassword }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (input === cesarPassword) {
      setError('');
      onLogin('cesar');
    } else if (input === rodrigoPassword) {
      setError('');
      onLogin('rodrigo');
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xs">
        <h2 className="text-2xl font-black mb-6 text-black uppercase tracking-wider text-center">Barbearia Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Digite a senha"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full p-3 border border-zinc-300 rounded font-bold focus:border-black outline-none"
            required
          />
          {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
          <button type="submit" className="bg-black text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-zinc-800 transition-colors">Entrar</button>
        </form>
      </div>
    </div>
  );
}
