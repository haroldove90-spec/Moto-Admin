import { InventoryItem, OrderStatus, ServiceOrder, Transaction, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Carlos Admin', role: UserRole.ADMIN, email: 'admin@motoflow.com' },
  { id: 'u2', name: 'Ana Recepcion', role: UserRole.RECEPTIONIST, email: 'recepcion@motoflow.com' },
  { id: 'u3', name: 'Juan Mecanico', role: UserRole.MECHANIC, email: 'juan@motoflow.com' },
  { id: 'u4', name: 'Luis Almacen', role: UserRole.STOREKEEPER, email: 'luis@motoflow.com' },
  { id: 'u5', name: 'Pedro Cliente', role: UserRole.CLIENT, email: 'pedro@gmail.com' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'p1', sku: 'ACE-01', name: 'Aceite Sintético 10W40', category: 'Lubricantes', stock: 45, minStock: 10, costPrice: 12, sellPrice: 22, location: 'Pasillo A1' },
  { id: 'p2', sku: 'FRE-02', name: 'Pastillas Frano Delanteras', category: 'Frenos', stock: 12, minStock: 5, costPrice: 15, sellPrice: 35, location: 'Pasillo B2' },
  { id: 'p3', sku: 'CAD-03', name: 'Cadena de Arrastre 520', category: 'Transmisión', stock: 4, minStock: 5, costPrice: 45, sellPrice: 85, location: 'Estante C3' },
  { id: 'p4', sku: 'FIL-04', name: 'Filtro de Aire Deportivo', category: 'Filtros', stock: 8, minStock: 4, costPrice: 20, sellPrice: 45, location: 'Pasillo A2' },
  { id: 'p5', sku: 'BUJ-05', name: 'Bujía NGK Iridium', category: 'Eléctrico', stock: 25, minStock: 10, costPrice: 8, sellPrice: 18, location: 'Cajón D1' },
];

export const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: 'ORD-001',
    customerName: 'Roberto Gómez',
    bikeModel: 'Yamaha MT-07',
    plateNumber: 'ABC-123',
    status: OrderStatus.IN_PROGRESS,
    dateReceived: '2024-03-20',
    technicianId: 'u3',
    tasks: [
      { id: 't1', description: 'Cambio de aceite y filtro', isCompleted: true },
      { id: 't2', description: 'Tensión de cadena', isCompleted: false, mechanicNote: 'Cadena con desgaste excesivo' },
    ],
    partsRequested: [
      { id: 'r1', partId: 'p1', quantity: 3, status: 'APPROVED' },
    ],
    totalBudget: 1500,
    notes: 'Cliente reporta ruido en la cadena'
  },
  {
    id: 'ORD-002',
    customerName: 'Laura Pausini',
    bikeModel: 'Honda CB500X',
    plateNumber: 'XYZ-789',
    status: OrderStatus.RECEIVED,
    dateReceived: '2024-03-21',
    tasks: [
      { id: 't3', description: 'Revision general 10k km', isCompleted: false },
    ],
    partsRequested: [],
    totalBudget: 2500,
    notes: 'Mantenimiento preventivo completo'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', date: '2024-03-15', type: 'SALE', amount: 450, profit: 200, description: 'Venta mostrador: Kit arrastre' },
  { id: 'tr2', date: '2024-03-18', type: 'SERVICE', amount: 1200, profit: 600, description: 'Servicio ORD-001 abono' },
  { id: 'tr3', date: '2024-03-19', type: 'PURCHASE', amount: -2000, profit: 0, description: 'Compra mercancía mayorista' },
];
