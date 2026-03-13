/**
 * Types pour le module Clients
 */

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  idNumber?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  isActive?: boolean;
}
