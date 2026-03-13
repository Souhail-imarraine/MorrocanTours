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

  uploadingImg = signal(false);
  previewUrl = signal<string | null>(null);
  profileImagePath = signal('');

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
        if (p.profileImage) {
          const base = environment.baseUrl;
          const path = p.profileImage.replace(/^\/+/, '');
          const url = path.startsWith('uploads/') ? `${base}/${path}` : `${base}/uploads/${path}`;
          this.previewUrl.set(url);
          this.profileImagePath.set(p.profileImage);
          this.authService.profileImage.set(url);
        }
      }
    });
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      this.previewUrl.set(url);
      this.authService.profileImage.set(url);
    };
    reader.readAsDataURL(file);
    this.uploadingImg.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/images/upload`, fd).subscribe({
      next: res => { this.profileImagePath.set(res.imageUrl); this.uploadingImg.set(false); },
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
      profileImage: this.profileImagePath()
    }).subscribe({
      next: () => { 
        this.saving.set(false); 
        this.saveSuccess.set(true); 
        setTimeout(() => this.saveSuccess.set(false), 3000); 
      },
      error: (err: any) => { 
        this.saving.set(false); 
        this.saveError.set(err?.error?.message || 'Update failed.'); 
      }
    });
  }
}
