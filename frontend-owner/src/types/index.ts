export interface StopDto {
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: number;
  name: string;
  total_distance_km: number;
  is_active: boolean;
  stops: StopDto[];
}
