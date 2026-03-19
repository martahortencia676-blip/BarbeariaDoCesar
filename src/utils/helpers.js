export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getCustomer = (nameOrId, customers) => {
  return customers.find(c => c.id === nameOrId || c.name.toLowerCase() === nameOrId.toLowerCase());
};

export const getMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const checkTimeConflict = (newAppt, appointments, services) => {
  return appointments.some(a => {
    if (a.barberId !== newAppt.barberId || a.date !== newAppt.date || a.status !== 'scheduled') return false;
    
    const newStart = getMins(newAppt.time);
    const newServiceObj = services.find(s => s.id === newAppt.serviceId);
    const newEnd = newStart + (newServiceObj ? newServiceObj.duration : 30);
    
    const existingStart = getMins(a.time);
    const existingServiceObj = services.find(s => s.id === a.serviceId);
    const existingEnd = existingStart + (existingServiceObj ? existingServiceObj.duration : 30);
    
    return newStart < existingEnd && newEnd > existingStart;
  });
};

export const formatDate = (dateString) => {
  return dateString.split('-').reverse().join('/');
};
