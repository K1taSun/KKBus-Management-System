import { apiGet, apiPost, apiDelete } from './api';

export interface DriverSchedule {
  id: number;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  registration_number: string;
  stops?: string[];
}

export interface ManifestPassenger {
  seat_number: number;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
}

export interface PassengerManifest {
  scheduleId: number;
  totalPassengers: number;
  passengers: ManifestPassenger[];
}

export interface SubmitReportDto {
  scheduleId: number;
  fuelLiters: number;
  fuelCost: number;
  distanceKm: number;
  presentUserIds: string[];
  absentUserIds: string[];
}

export interface AvailabilityStatus {
  available_date: string;
  status: 'Dostępny' | 'Niedostępny' | 'Urlop' | 'Zwolnienie';
  created_at: string;
}

export async function getDriverSchedules(): Promise<DriverSchedule[]> {
  return apiGet<DriverSchedule[]>('/driver/schedules');
}

export async function getPassengerManifest(scheduleId: string): Promise<PassengerManifest> {
  return apiGet<PassengerManifest>(`/driver/schedules/${scheduleId}/manifest`);
}

export async function submitDriverReport(dto: SubmitReportDto): Promise<{ message: string, metrics: { costPerKm: string, totalFuelCost: number } }> {
  return apiPost('/driver/reports', dto);
}

export async function getDriverAvailability(): Promise<AvailabilityStatus[]> {
  return apiGet<AvailabilityStatus[]>('/driver/availability');
}

export async function setDriverAvailability(dto: { availableDate: string, status: string }): Promise<{ message: string }> {
  return apiPost('/driver/availability', dto);
}

export async function deleteDriverAvailability(availableDate: string): Promise<{ message: string }> {
  return apiDelete(`/driver/availability?date=${availableDate}`);
}
