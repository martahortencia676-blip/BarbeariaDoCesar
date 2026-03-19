// Formatar telefone para (83) 99999-9999
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length !== 11) return phone;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

// Remover formatação do telefone
export const unformatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

// Calcular idade
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Verificar se é aniversário hoje
export const isBirthdayToday = (birthDate) => {
  if (!birthDate) return false;
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
};

// Obter aniversariantes de um período
export const getUpcomingBirthdays = (customers, daysAhead = 7) => {
  const today = new Date();
  return customers.filter(customer => {
    if (!customer.birthDate) return false;
    const birth = new Date(customer.birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    // Se o aniversário já passou este ano, considera o próximo
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntilBirthday = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
    return daysUntilBirthday >= 0 && daysUntilBirthday <= daysAhead;
  }).sort((a, b) => {
    const birthA = new Date(a.birthDate);
    const birthB = new Date(b.birthDate);
    const dateA = new Date(new Date().getFullYear(), birthA.getMonth(), birthA.getDate());
    const dateB = new Date(new Date().getFullYear(), birthB.getMonth(), birthB.getDate());
    return dateA - dateB;
  });
};

// Gerar link de WhatsApp
export const generateWhatsAppLink = (phone, message) => {
  const cleanPhone = unformatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
};

// Formatar data para DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Obter mês em português
export const getMonthName = (month) => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[month];
};

// Contar cortes do mês atual
export const getMonthCutCount = (cutHistory) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return cutHistory.filter(cut => {
    const cutDate = new Date(cut.date);
    return cutDate.getMonth() === currentMonth && cutDate.getFullYear() === currentYear;
  }).length;
};
