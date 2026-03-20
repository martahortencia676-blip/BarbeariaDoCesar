import { useState } from 'react';
import { Shield, Clock, LogIn, LogOut as LogOutIcon, Trash2, AlertTriangle } from 'lucide-react';

const ACTION_LABELS = {
  login: { label: 'Login', color: 'bg-green-100 text-green-700' },
  logout: { label: 'Logout', color: 'bg-zinc-200 text-zinc-600' },
  delete_transaction: { label: 'Excluiu Transação', color: 'bg-red-100 text-red-700' },
  delete_client: { label: 'Excluiu Cliente', color: 'bg-red-100 text-red-700' },
  delete_barber: { label: 'Removeu Barbeiro', color: 'bg-orange-100 text-orange-700' },
  clear_all_data: { label: 'Limpou Dados', color: 'bg-red-200 text-red-800' },
};

export default function LoginLogsView({ loginLogs }) {
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Filtrar logs do Rodrigo no mês selecionado
  const rodrigoLogs = loginLogs
    .filter(log => {
      const d = new Date(log.timestamp);
      return log.role === 'rodrigo' && d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Criar pares login/logout para calcular tempo logado
  const sessions = [];
  const loginStack = [];

  const sortedAsc = [...loginLogs]
    .filter(l => l.role === 'rodrigo')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  sortedAsc.forEach(log => {
    if (log.action === 'login') {
      loginStack.push(log);
    } else if (log.action === 'logout' && loginStack.length > 0) {
      const loginLog = loginStack.pop();
      const loginTime = new Date(loginLog.timestamp);
      const logoutTime = new Date(log.timestamp);
      const durationMs = logoutTime - loginTime;
      const d = loginTime;
      if (d.getMonth() === filterMonth && d.getFullYear() === filterYear) {
        sessions.push({
          loginTime,
          logoutTime,
          durationMs,
          durationFormatted: formatDuration(durationMs),
        });
      }
    }
  });

  // Login sem logout (sessão ativa)
  loginStack.forEach(log => {
    const loginTime = new Date(log.timestamp);
    if (loginTime.getMonth() === filterMonth && loginTime.getFullYear() === filterYear) {
      sessions.push({
        loginTime,
        logoutTime: null,
        durationMs: Date.now() - loginTime,
        durationFormatted: 'Ativa',
      });
    }
  });

  sessions.sort((a, b) => b.loginTime - a.loginTime);

  const totalLogins = sessions.length;
  const totalDurationMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(filterYear, i);
    monthOptions.push({ value: i, label: d.toLocaleDateString('pt-BR', { month: 'long' }) });
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider border-b-4 border-black pb-3 mb-8 flex items-center gap-3">
          <Shield className="w-7 h-7" /> Registro de Acesso — Rodrigo
        </h2>

        {/* Filtro */}
        <div className="flex gap-3 mb-6">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2 font-bold text-sm focus:border-black outline-none"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))}
            className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2 font-bold text-sm focus:border-black outline-none"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">
              <LogIn className="w-4 h-4 inline" /> Total de Acessos
            </p>
            <div className="text-3xl font-black text-black">{totalLogins}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">neste mês</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">
              <Clock className="w-4 h-4 inline" /> Tempo Total Logado
            </p>
            <div className="text-3xl font-black text-black">{formatDuration(totalDurationMs)}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">no período</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 col-span-2 md:col-span-1">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Média por Sessão</p>
            <div className="text-3xl font-black text-black">{totalLogins > 0 ? formatDuration(totalDurationMs / totalLogins) : '—'}</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">duração média</p>
          </div>
        </div>

        {/* Tabela de sessões */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5" /> Sessões Detalhadas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 font-black">Data</th>
                  <th className="p-3 font-black">Login</th>
                  <th className="p-3 font-black">Logout</th>
                  <th className="p-3 font-black text-right">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sessions.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 font-bold text-zinc-400 uppercase">Nenhum acesso neste mês</td></tr>
                ) : (
                  sessions.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="p-3 font-medium">{s.loginTime.toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 font-medium">{s.loginTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                      <td className="p-3 font-medium">
                        {s.logoutTime
                          ? s.logoutTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : <span className="bg-green-100 text-green-700 font-bold text-xs px-2 py-0.5 rounded">Ativa</span>
                        }
                      </td>
                      <td className="p-3 font-black text-right">
                        {s.logoutTime ? s.durationFormatted : <span className="text-green-700">Ativa</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registro de Ações (exclusões, limpezas) */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-6 mt-8">
          <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Registro de Ações
          </h3>
          <p className="text-xs text-zinc-500 font-medium mb-4">Exclusões, limpezas e alterações importantes registradas pelo sistema.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 font-black">Data/Hora</th>
                  <th className="p-3 font-black">Usuário</th>
                  <th className="p-3 font-black">Ação</th>
                  <th className="p-3 font-black">Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {(() => {
                  const actionLogs = loginLogs
                    .filter(l => l.action && !['login', 'logout'].includes(l.action))
                    .filter(l => {
                      const d = new Date(l.timestamp);
                      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
                    })
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                  if (actionLogs.length === 0) {
                    return <tr><td colSpan={4} className="text-center py-8 font-bold text-zinc-400 uppercase">Nenhuma ação registrada neste mês</td></tr>;
                  }
                  return actionLogs.map((log, idx) => {
                    const d = new Date(log.timestamp);
                    const info = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-zinc-100 text-zinc-600' };
                    return (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="p-3 font-medium">{d.toLocaleDateString('pt-BR')} {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3 font-bold uppercase">{log.role === 'cesar' ? 'César' : 'Rodrigo'}</td>
                        <td className="p-3"><span className={`font-bold text-xs px-2 py-1 rounded ${info.color}`}>{info.label}</span></td>
                        <td className="p-3 font-medium text-zinc-600">{log.detail || '—'}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return '0min';
  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}
