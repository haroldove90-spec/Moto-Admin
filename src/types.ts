/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  MECHANIC = 'MECHANIC',
  STOREKEEPER = 'STOREKEEPER',
  CLIENT = 'CLIENT'
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_PARTS = 'AWAITING_PARTS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  location: string;
  primaryImage?: string;
  secondaryImages?: string[];
}

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  mechanicNote?: string;
}

export interface PartRequest {
  id: string;
  partId: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}

export interface ServiceOrder {
  id: string;
  customerName: string;
  bikeModel: string;
  plateNumber: string;
  status: OrderStatus;
  dateReceived: string;
  technicianId?: string;
  tasks: Task[];
  partsRequested: PartRequest[];
  totalBudget: number;
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'SALE' | 'SERVICE' | 'PURCHASE';
  amount: number;
  profit: number;
  description: string;
}
