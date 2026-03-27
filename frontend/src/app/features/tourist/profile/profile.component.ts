import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tourist-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);

  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal('');


  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    city: ['']
  });

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/users/profile`).subscribe({
      next: (p) => {
        this.form.patchValue({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          city: p.city || ''
        });
      }
    });
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && (c.dirty || c.touched));
  }


  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');

    const v = this.form.value;
    this.http.put(`${environment.apiUrl}/users/profile`, v).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.authService.refreshCurrentUser();
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message || 'Update failed.');
      }
    });
  }
}
