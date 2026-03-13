/**
 * Types pour le module Véhicules
 */

export interface Truck {
  id: string;
  matricule: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
  isActive: boolean;
  assignments?: TruckAssignmentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface TruckAssignmentSummary {
  id: string;
  orderId: string;
  truckId: string;
  quantity?: number;
  driverName?: string | null;
  status: 'ASSIGNED' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export interface TruckMaintenance {
  id: string;
  truckId: string;
  type: string;
  description?: string;
  cost: number;
  date: string;
  nextDueDate?: string;
  documentUrl?: string;
}

export interface TruckFuel {
  id: string;
  truckId: string;
  quantity: number;
  cost: number;
  date: string;
  documentUrl?: string;
}

export interface TruckExpense {
  id: string;
  truckId: string;
  type: string;
  description?: string;
  cost: number;
  date: string;
  documentUrl?: string;
}

export interface TruckAssignment {
  id: string;
  orderId: string;
  truckId: string;
  truck?: Truck;
  quantity: number;
  driverName?: string | null;
  deliveryCost?: number | null;
  notes?: string | null;
  status: 'ASSIGNED' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTruckDto {
  matricule: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
}

export interface UpdateTruckDto extends Partial<CreateTruckDto> {
  isActive?: boolean;
}
