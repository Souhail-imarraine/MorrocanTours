import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);

  private infoTimer: ReturnType<typeof setTimeout> | null = null;
  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = signal(false);
  loading      = signal(false);
  serverError  = signal('');
  infoMessage  = signal('');

  togglePassword = () => this.showPassword.update(v => !v);

  ngOnInit(): void {
    const pending = this.route.snapshot.queryParamMap.get('pending');
    if (pending === 'guide') {
      this.infoMessage.set('Your guide application was submitted. Please wait for an admin to approve your account. You can sign in once approved.');
      this.scheduleInfoClear();
    }

    const alert = this.route.snapshot.queryParamMap.get('alert');
    if (alert === 'login-to-book') {
      this.infoMessage.set('Please sign in to book your tour.');
      this.scheduleInfoClear();
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['email'])     return 'Please enter a valid email address.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    return 'Invalid value.';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');
    this.clearErrorTimer();

    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: res => {
        this.loading.set(false);
        const role = res.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'GUIDE') {
          this.router.navigate(['/guide/dashboard']);
        } else {
          this.router.navigate(['/tourist/profile']);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message || err?.error?.error || 'Invalid credentials. Please try again.');
        this.scheduleErrorClear();
      }
    });
  }

  private scheduleInfoClear(): void {
    this.clearInfoTimer();
    this.infoTimer = setTimeout(() => this.infoMessage.set(''), 4500);
  }

  private scheduleErrorClear(): void {
    this.clearErrorTimer();
    this.errorTimer = setTimeout(() => this.serverError.set(''), 4500);
  }

  private clearInfoTimer(): void {
    if (this.infoTimer) {
      clearTimeout(this.infoTimer);
      this.infoTimer = null;
    }
  }

  private clearErrorTimer(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
  }
}
