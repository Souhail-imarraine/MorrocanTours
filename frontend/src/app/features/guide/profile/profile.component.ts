import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageResponse } from '../../../core/models/language.model';

@Component({
  selector: 'app-guide-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
  readonly authService = inject(AuthService);

  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal('');

  uploadingImg = signal(false);
  previewUrl = signal<string | null>(null);
  profileImagePath = signal('');

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    city: [''],
    bio: [''],
    languageIds: [[] as number[], Validators.required],
    yearsOfExperience: [null as number | null, [Validators.min(0), Validators.max(60)]]
  });

  languages = signal<LanguageResponse[]>([]);
  languagesLoading = signal(true);
  languagesError = signal('');

  ngOnInit(): void {
    // Show cached image immediately
    this.previewUrl.set(this.authService.profileImage());

    this.loadLanguages();
    this.http.get<any>(`${environment.apiUrl}/users/profile`).subscribe({
      next: (p) => {
        this.form.patchValue({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          city: p.city || '',
          bio: p.bio || '',
          languageIds: (p.languages && Array.isArray(p.languages))
            ? p.languages.map((l: any) => Number(l.id))
            : [],
          yearsOfExperience: p.yearsOfExperience ?? null
        });
        if (p.profileImage) {
          const url = AuthService.getPhotoUrl(p.profileImage);
          this.previewUrl.set(url);
          this.profileImagePath.set(p.profileImage);
          this.authService.profileImage.set(url);
        }
      }
    });
  }

  private loadLanguages(): void {
    this.languagesLoading.set(true);
    this.languagesError.set('');
    this.languageService.getAll().subscribe({
      next: res => { this.languages.set(res); this.languagesLoading.set(false); },
      error: () => { this.languagesLoading.set(false); this.languagesError.set('Unable to load languages'); }
    });
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  getError(f: string): string {
    const c = this.form.get(f);
    if (!c?.errors || !(c.dirty || c.touched)) return '';
    if (c.errors['required']) return 'Required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['min']) return `Min ${c.errors['min'].min}.`;
    if (c.errors['max']) return `Max ${c.errors['max'].max}.`;
    return 'Invalid.';
  }

  isLanguageSelected(id: number): boolean {
    const selected = this.form.get('languageIds')?.value as number[];
    return Array.isArray(selected) && selected.includes(id);
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      this.previewUrl.set(url);
      this.authService.profileImage.set(url); // live update sidebar
    };
    reader.readAsDataURL(file);
    this.uploadingImg.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ path: string }>(`${environment.apiUrl}/auth/upload-profile`, fd).subscribe({
      next: res => { this.profileImagePath.set(res.path); this.uploadingImg.set(false); },
      error: () => this.uploadingImg.set(false)
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');
    const v = this.form.value;
    this.http.put(`${environment.apiUrl}/users/profile`, {
      ...v,
      ...(this.profileImagePath() ? { profileImagePath: this.profileImagePath() } : {})
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.authService.refreshCurrentUser();
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => { this.saving.set(false); this.saveError.set(err?.error?.message || 'Update failed.'); }
    });
  }
}
