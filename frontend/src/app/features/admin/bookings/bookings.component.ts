import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponse } from '../../../core/models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css' // Note: Ensure this file exists or remove if not needed
})
export class BookingsComponent implements OnInit {
  
  // Array to hold the list of bookings
  bookings: BookingResponse[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    // You will call your service here manually later
  }

  /**
   * Returns the CSS classes for the booking status badge
   * @param status The current status of the booking
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold';
      case 'CANCELLED': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold';
      default: return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold';
    }
  }
}
