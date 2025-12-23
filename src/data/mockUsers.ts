import { User, Operator, Order, Promotion } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '841234567',
    address: 'Av. Eduardo Mondlane, 123',
    role: 'customer',
  },
  {
    id: 'admin-1',
    name: 'Admin SAM',
    email: 'admin@sam.mz',
    phone: '840000001',
    role: 'admin',
  },
];

export const mockOperators: Operator[] = [
  {
    id: 'op-1',
    name: 'Carlos Machava',
    email: 'carlos@sam.mz',
    phone: '842222222',
    role: 'operator',
    isActive: true,
    deliveriesCompleted: 156,
  },
  {
    id: 'op-2',
    name: 'Maria Santos',
    email: 'maria@sam.mz',
    phone: '843333333',
    role: 'operator',
    isActive: true,
    deliveriesCompleted: 89,
  },
  {
    id: 'op-3',
    name: 'Pedro Nhaca',
    email: 'pedro@sam.mz',
    phone: '844444444',
    role: 'operator',
    isActive: false,
    deliveriesCompleted: 42,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [],
    total: 2500,
    status: 'received',
    paymentMethod: 'mpesa',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    customerName: 'João Silva',
    customerPhone: '841234567',
    customerAddress: 'Av. Eduardo Mondlane, 123',
  },
  {
    id: 'ORD-002',
    items: [],
    total: 1800,
    status: 'preparing',
    paymentMethod: 'emola',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    customerName: 'Ana Maputo',
    customerPhone: '845555555',
    customerAddress: 'Rua da Zambézia, 45',
    operatorId: 'op-1',
  },
  {
    id: 'ORD-003',
    items: [],
    total: 4200,
    status: 'on_the_way',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    customerName: 'Miguel Beira',
    customerPhone: '846666666',
    customerAddress: 'Av. Julius Nyerere, 789',
    operatorId: 'op-2',
  },
  {
    id: 'ORD-004',
    items: [],
    total: 3100,
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    customerName: 'Sofia Matola',
    customerPhone: '847777777',
    customerAddress: 'Rua do Jardim, 12',
    operatorId: 'op-1',
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Desconto Verão',
    description: '15% de desconto em toda a linha Namaacha',
    discountPercent: 15,
    productIds: ['namaacha-05', 'namaacha-15', 'namaacha-25', 'namaacha-5'],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: 'promo-2',
    name: 'Pack Família',
    description: '10% de desconto em garrafões',
    discountPercent: 10,
    productIds: ['natura-189', 'fonte-7', 'escolha-7'],
    startDate: new Date(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    isActive: false,
  },
];

// Mock auth - simula login baseado no email
export const mockLogin = (emailOrPhone: string): User | Operator | null => {
  if (emailOrPhone.includes('admin')) {
    return mockUsers.find(u => u.role === 'admin') || null;
  }
  if (emailOrPhone.includes('op') || emailOrPhone.includes('operador')) {
    return mockOperators[0];
  }
  return mockUsers.find(u => u.role === 'customer') || null;
};
