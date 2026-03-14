import { UserResponse } from './user.model';
import { CategoryResponse } from './category.model';

export interface TourImageResponse {
  id: number;
  imageUrl: string;
  displayOrder?: number;
}

export interface TourResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  durationHours: number;
  city: string;
  maxParticipants: number;
  availableSeats: number;
  status: string;
  guide: UserResponse;
  category: CategoryResponse;
  images?: TourImageResponse[];
}

export interface TourRequest {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  city: string;
  maxParticipants: number;
  categoryId: number;
  startLocationName: string;
  endLocationName: string;
  startDate: string;
  endDate: string;
}
