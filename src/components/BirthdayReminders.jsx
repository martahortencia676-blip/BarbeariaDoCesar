import { Gift, AlertCircle, MessageCircle } from 'lucide-react';
import { getUpcomingBirthdays, generateWhatsAppLink, formatDate, calculateAge } from '../utils/phoneAndDate';

export default function BirthdayReminders({ customers }) {
  const upcomingBirthdays = getUpcomingBirthdays(customers, 30);

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-300 shadow-sm">
      <h3 className="font-black text-black mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
        <Gift className="w-5 h-5" /> Aniversários do Mês
      </h3>
      
      {upcomingBirthdays.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-400 font-bold text-sm uppercase">Nenhum aniversário este mês</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {upcomingBirthdays.map(customer => {
            const birth = new Date(customer.birthDate);
            const today = new Date();
            const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
            if (thisYearBirthday < today) {
              thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }
            const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
            const age = calculateAge(customer.birthDate);

            return (
              <div key={customer.id} className={`p-3 rounded-lg border-2 transition-all ${
                daysUntil === 0 
                  ? 'bg-yellow-50 border-yellow-300 shadow-md' 
                  : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-black flex items-center gap-2">
                      {customer.name}
                      {daysUntil === 0 && <Gift className="w-4 h-4 text-yellow-500 animate-bounce" />}
                    </p>
                    <p className="text-xs text-zinc-600 font-medium">{formatDate(customer.birthDate)} ({age} anos)</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded ${
                    daysUntil === 0 
                      ? 'bg-yellow-200 text-yellow-900' 
                      : 'bg-zinc-200 text-zinc-900'
                  }`}>
                    {daysUntil === 0 ? '🎉 Hoje!' : `Em ${daysUntil}d`}
                  </span>
                </div>
                <a
                  href={generateWhatsAppLink(customer.phone, `🎉 Feliz Aniversário ${customer.name}! Aproveite seus ${age + 1} anos!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-green-600 hover:text-green-800 transition-colors flex items-center gap-1 mt-2"
                >
                  <MessageCircle className="w-3 h-3" /> Enviar mensagem
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
