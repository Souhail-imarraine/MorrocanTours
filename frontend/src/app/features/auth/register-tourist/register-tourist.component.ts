import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-register-tourist',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, ReactiveFormsModule],
  templateUrl: './register-tourist.component.html'
})
export class RegisterTouristComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    city: [''],
    bio: ['']
  });

  showPassword = signal(false);
  loading = signal(false);
  success = signal(false);
  serverError = signal('');

  togglePassword = () => {
  this.showPassword.update(v => v ? false : true);
  };

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email']) return 'Please enter a valid email address.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    return 'Invalid value.';
  }

  onSubmit(): void {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }

    this.loading.set(true);
    this.serverError.set('');
    this.success.set(false);

    const formValues = this.form.value;

    this.authService.registerTourist({
      firstName: formValues.firstName?.trim() || '',
      lastName: formValues.lastName?.trim() || '',
      email: formValues.email?.trim() || '',
      password: formValues.password || '',
      phone: formValues.phone?.trim() || undefined,
      city: formValues.city?.trim() || undefined,
      bio: formValues.bio?.trim() || undefined
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message || err?.error?.error || 'Registration failed. Please try again.');
      }
    });
  }
}
