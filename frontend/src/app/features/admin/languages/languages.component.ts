import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageResponse } from '../../../core/models/language.model';

@Component({
  selector: 'app-admin-languages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './languages.component.html'
})
export class LanguagesComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly fb               = inject(FormBuilder);

  languages  = signal<LanguageResponse[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  saving     = signal(false);
  deletingId = signal<number | null>(null);
  saveError  = signal('');
  saveSuccess = signal(false);
  editMode   = signal(false);
  editId     = signal<number | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void { this.loadLanguages(); }

  loadLanguages(): void {
    this.loading.set(true);
    this.languageService.getAll().subscribe({
      next: res => { this.languages.set(res); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.editId.set(null);
    this.form.reset();
    this.saveError.set('');
    this.saveSuccess.set(false);
    this.showModal.set(true);
  }

  openEdit(language: LanguageResponse): void {
    this.editMode.set(true);
    this.editId.set(language.id);
    this.form.patchValue({ name: language.name });
    this.saveError.set('');
    this.saveSuccess.set(false);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  getError(f: string): string {
    const c = this.form.get(f);
    if (!c?.errors) return '';
    if (c.errors['required'])  return 'Required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    return 'Invalid.';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveError.set('');
    const payload = { name: this.form.value.name!.trim() };

    const req = this.editMode()
      ? this.languageService.update(this.editId()!, payload)
      : this.languageService.create(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.loadLanguages();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message || 'Operation failed.');
      }
    });
  }

  deleteLanguage(id: number): void {
    if (!confirm('Delete this language?')) return;
    this.deletingId.set(id);
    this.languageService.delete(id).subscribe({
      next: () => { this.deletingId.set(null); this.loadLanguages(); },
      error: () => this.deletingId.set(null)
    });
  }
}
