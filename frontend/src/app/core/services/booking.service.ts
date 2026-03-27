import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BookingResponse, BookingRequest } from '../models/booking.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) { }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.apiUrl, request);
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/my-bookings`);
  }

  getBookingsByTour(tourId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/guide/tour/${tourId}`);
  }

  confirmBooking(bookingId: number): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.apiUrl}/guide/${bookingId}/confirm`, {});
  }

  rejectBooking(bookingId: number): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.apiUrl}/guide/${bookingId}/reject`, {});
  }

  countAllTotalBookings(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count-booking`);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/booking`);
  }
}
