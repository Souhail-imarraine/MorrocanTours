import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageResponse } from '../../../core/models/language.model';

@Component({
  selector: 'app-register-guide',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, ReactiveFormsModule],
  templateUrl: './register-guide.component.html'
})
export class RegisterGuideComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly http        = inject(HttpClient);
  private readonly languageService = inject(LanguageService);

  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  form: FormGroup = this.fb.group({
    firstName:         ['', [Validators.required, Validators.minLength(2)]],
    lastName:          ['', [Validators.required, Validators.minLength(2)]],
    email:             ['', [Validators.required, Validators.email]],
    password:          ['', [Validators.required, Validators.minLength(6)]],
    phone:             ['', [Validators.required, Validators.minLength(6)]],
    city:              ['', [Validators.required, Validators.minLength(2)]],
    yearsOfExperience: [null, [Validators.required, Validators.min(0), Validators.max(60)]],
    languageIds:       [[], [Validators.required]],
    bio:               ['']
  });

  // UI state signals
  showPassword     = signal(false);
  loading          = signal(false);
  uploadingImg     = signal(false);
  success          = signal(false);
  serverError      = signal('');
  previewUrl       = signal<string | null>(null);
  profileImagePath = signal('');
  languages        = signal<LanguageResponse[]>([]);
  languagesLoading = signal(true);
  languagesError   = signal('');

  togglePassword = () => this.showPassword.update(v => !v);

  ngOnInit(): void {
    this.loadLanguages();
  }

  // Convenience getters for template
  get f() { return this.form.controls; }

  private loadLanguages(): void {
    this.languagesLoading.set(true);
    this.languagesError.set('');
    this.languageService.getAll().subscribe({
      next: res => { this.languages.set(res); this.languagesLoading.set(false); },
      error: () => { this.languagesLoading.set(false); this.languagesError.set('Failed to load languages.'); }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['email'])     return 'Please enter a valid email address.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    if (ctrl.errors['min'])       return 'Value must be 0 or more.';
    if (ctrl.errors['max'])       return 'Value must be 60 or less.';
    return 'Invalid value.';
  }

  isLanguageSelected(id: number): boolean {
    const selected = this.form.get('languageIds')?.value as number[];
    return Array.isArray(selected) && selected.includes(id);
  }

  toggleLanguage(id: number): void {
    const ctrl = this.form.get('languageIds');
    if (!ctrl) return;
    const current = Array.isArray(ctrl.value) ? [...ctrl.value] as number[] : [];
    const idx = current.indexOf(id);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    ctrl.setValue(current);
    ctrl.markAsDirty();
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset signals so guestGuard allows login page
    this.authService.currentUser.set(null as any);
    this.authService.profileImage.set(null);
  }

  // Profile photo upload
  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingImg.set(true);
    this.serverError.set('');
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ path: string }>(`${environment.apiUrl}/auth/upload-profile`, fd).subscribe({
      next:  res => { this.profileImagePath.set(res.path); this.uploadingImg.set(false); },
      error: ()  => { this.uploadingImg.set(false); this.serverError.set('Image upload failed — you can still register without a photo.'); }
    });
  }

  onSubmit(): void {
    // Mark all fields touched → shows errors on every invalid field
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');
    this.clearErrorTimer();

    const v = this.form.value;
    this.authService.registerGuide({
      firstName:         v.firstName.trim(),
      lastName:          v.lastName.trim(),
      email:             v.email.trim(),
      password:          v.password,
      phone:             v.phone?.trim(),
      city:              v.city?.trim(),
      bio:               v.bio?.trim()      || undefined,
      languageIds:       Array.isArray(v.languageIds) ? v.languageIds : [],
      yearsOfExperience: v.yearsOfExperience ?? undefined,
      profileImagePath:  this.profileImagePath() || undefined
    }).subscribe({
      next:  () => {
        this.loading.set(false);
        this.success.set(true);
        this.clearSession();
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { pending: 'guide' } });
        }, 3000);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message || err?.error?.error || 'Registration failed. Please try again.');
        this.scheduleErrorClear();
      }
    });
  }

  private scheduleErrorClear(): void {
    this.clearErrorTimer();
    this.errorTimer = setTimeout(() => this.serverError.set(''), 4500);
  }

  private clearErrorTimer(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
  }
}
