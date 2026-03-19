import { Banknote, CreditCard, Wallet } from 'lucide-react';

export const initialBarbers = [
  { id: 'b1', name: 'César', commission: 1.0, isOwner: true },
  { id: 'b2', name: 'Rodrigo', commission: 0.50, isOwner: false },
];

export const initialServices = [
  { id: 's1', name: 'Corte Degradê', price: 45, cost: 5, duration: 30, type: 'service', commissionable: true },
  { id: 's2', name: 'Barba Terapia', price: 35, cost: 3, duration: 25, type: 'service', commissionable: true },
  { id: 's3', name: 'Sobrancelha', price: 15, cost: 1, duration: 10, type: 'service', commissionable: true },
    // CABELOS
    { id: 's4', name: 'Pezinho', price: 12, duration: 10, type: 'service', commissionable: true },
    { id: 's5', name: 'Militar (máquina)', price: 22, duration: 30, type: 'service', commissionable: true },
    { id: 's6', name: 'Social (máquina e tesoura)', price: 23, duration: 30, type: 'service', commissionable: true },
    { id: 's7', name: 'Tesoura', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's8', name: 'Mullet', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's9', name: 'Surfista', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's10', name: 'Degradê', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's11', name: 'Americano', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's12', name: 'Moicano', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's13', name: 'Low Fade', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's14', name: 'Do Jaca', price: 28, duration: 30, type: 'service', commissionable: true },
    { id: 's15', name: 'Navalhado', price: 30, duration: 30, type: 'service', commissionable: true },
    // BARBAS
    { id: 's16', name: 'Barba Lisa', price: 17, duration: 20, type: 'service', commissionable: true },
    { id: 's17', name: 'Barba Desenhada', price: 17, duration: 20, type: 'service', commissionable: true },
    { id: 's18', name: 'Barba Degradê', price: 20, duration: 20, type: 'service', commissionable: true },
    { id: 's19', name: 'Barba Italiana', price: 20, duration: 20, type: 'service', commissionable: true },
    { id: 's20', name: 'Barba Premium', price: 30, duration: 25, type: 'service', commissionable: true },
    // SOBRANCELHA
    { id: 's21', name: 'Sobrancelha Navalha', price: 12, duration: 10, type: 'service', commissionable: true },
    { id: 's22', name: 'Sobrancelha Pinça', price: 15, duration: 10, type: 'service', commissionable: true },
    // PIGMENTAÇÃO
    { id: 's23', name: 'Corte Pimentado', price: 60, duration: 60, type: 'service', commissionable: true },
    // COMBOS
    { id: 's24', name: 'Combo Social: Corte social, sobrancelha + barba lisa ou desenhada', price: 45, duration: 60, type: 'service', commissionable: true },
    { id: 's25', name: 'Combo Degradê: Corte degradê, sobrancelha + barba lisa ou desenhada', price: 50, duration: 60, type: 'service', commissionable: true },
    { id: 's26', name: 'Combo Navalhado: Corte navalhado, sobrancelha + barba lisa ou desenhada', price: 55, duration: 60, type: 'service', commissionable: true },
    // Obs: combos não incluem barbas italianas, degradês e sobrancelhas na pinça
  { id: 's5', name: 'Pacote Completo (Corte + Barba)', price: 70, cost: 7, duration: 50, type: 'service', commissionable: true },
];

export const initialProducts = [
  { id: 'p1', name: 'Cerveja Heineken', price: 12, stock: 24, minStock: 10, type: 'product' },
  { id: 'p2', name: 'Refrigerante Lata', price: 7, stock: 30, minStock: 12, type: 'product' },
  { id: 'p3', name: 'Pomada Modeladora', price: 40, stock: 4, minStock: 5, type: 'product' },
    { id: 'p4', name: 'Navalha colorida', price: 40, stock: 10, minStock: 3, type: 'product' },
    { id: 'p5', name: 'Óleo e balm para barba', price: 55, stock: 10, minStock: 3, type: 'product' },
    { id: 'p6', name: 'Navalhete comum', price: 32, stock: 10, minStock: 3, type: 'product' },
    { id: 'p7', name: 'Pente de bolso', price: 5, stock: 20, minStock: 5, type: 'product' },
    { id: 'p8', name: 'Cortador de unha', price: 10, stock: 20, minStock: 5, type: 'product' },
];

export const initialCustomers = [];

export const paymentMethods = [
  { id: 'pix', name: 'PIX', icon: <Banknote className="w-5 h-5" /> },
  { id: 'credit', name: 'Cartão de Crédito', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'debit', name: 'Cartão de Débito', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'cash', name: 'Dinheiro', icon: <Wallet className="w-5 h-5" /> },
];
