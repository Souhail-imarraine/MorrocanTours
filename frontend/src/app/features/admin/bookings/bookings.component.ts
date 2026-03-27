import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponse } from '../../../core/models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {

  bookingService = inject(BookingService)

  bookings = signal<BookingResponse[]>([]);

  ngOnInit(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (book) => {
        this.bookings.set(book)
      },
      error: (err) => {
        console.log(err);
      }
    })
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold';
      case 'CANCELLED': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold';
      default: return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold';
    }
  }
}
