import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TourService } from '../../../core/services/tour.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { TourResponse } from '../../../core/models/tour.model';
import { environment } from '../../../../environments/environment';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink, MatSnackBarModule],
  templateUrl: './tour-details.component.html'
})
export class TourDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tourService = inject(TourService);
  private readonly bookingService = inject(BookingService);
  readonly authService = inject(AuthService);
  private readonly snack = inject(MatSnackBar);

  tour = signal<TourResponse | null>(null);
  loading = signal(true);
  error = signal('');

  participants = signal(1);
  booking = signal(false);
  bookingError = signal('');
  bookingOk = signal(false);

  bookingStep = signal<1 | 2>(1);
  contactEmail = signal('');
  contactPhone = signal('');

  isTourist = computed(() => this.authService.currentUser()?.role === 'TOURIST');
  isGuest = computed(() => !this.authService.currentUser());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/tours']);
      return;
    }
    this.loadTour(Number(id));
  }

  loadTour(id: number): void {
    this.loading.set(true);
    this.tourService.getTourById(id).subscribe({
      next: res => { this.tour.set(res); this.loading.set(false); },
      error: () => { this.error.set('Failed to load tour details.'); this.loading.set(false); }
    });
  }

  getPhotoUrl(path: string | undefined | null): string {
    return AuthService.getPhotoUrl(path);
  }

  formatLanguages(langs: any[] | undefined): string {
    if (!langs || !Array.isArray(langs)) return '';
    return langs.map(l => l.name).join(', ');
  }

  increment(): void {
    if (this.tour() && this.participants() < this.tour()!.availableSeats) {
      this.participants.update(v => v + 1);
    }
  }

  decrement(): void {
    if (this.participants() > 1) {
      this.participants.update(v => v - 1);
    }
  }

  nextStep(): void {
    if (this.isGuest()) {
      this.promptLoginToBook();
      return;
    }

    if (this.bookingStep() === 1) {
      const user = this.authService.currentUser();
      if (user && !this.contactEmail()) {
        this.contactEmail.set(user.email);
      }
      this.bookingStep.set(2);
    }
  }

  prevStep(): void {
    this.bookingStep.set(1);
  }

  bookTour(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.promptLoginToBook();
      return;
    }
    if (user.role !== 'TOURIST') {
      this.bookingError.set('Only tourists can book tours.');
      return;
    }

    if (!this.contactEmail() || !this.contactPhone()) {
      this.bookingError.set('Please provide your contact information.');
      return;
    }

    this.booking.set(true);
    this.bookingError.set('');

    this.bookingService.createBooking({
      tourId: this.tour()!.id,
      numberOfParticipants: this.participants(),

    }).subscribe({
      next: () => {
        this.booking.set(false);
        this.bookingOk.set(true);
        const currentTour = this.tour();
        if (currentTour) {
          this.tour.set({
            ...currentTour,
            availableSeats: currentTour.availableSeats - this.participants()
          });
        }
      },
      error: (err: any) => {
        this.booking.set(false);
        this.bookingError.set(err?.error?.message || 'Failed to book the tour. Please try again.');
      }
    });
  }

  private promptLoginToBook(): void {
    this.snack.open('Please sign in to book this tour.', 'Login', {
      duration: 3500,
      panelClass: ['snack-login'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { alert: 'login-to-book', returnUrl: this.router.url } });
    }, 600);
  }
}
