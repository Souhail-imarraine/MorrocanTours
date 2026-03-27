import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponse } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb              = inject(FormBuilder);

  categories  = signal<CategoryResponse[]>([]);
  loading     = signal(true);
  showModal   = signal(false);
  saving      = signal(false);
  deletingId  = signal<number | null>(null);
  saveError   = signal('');
  saveSuccess = signal(false);
  editMode        = signal(false);
  editId          = signal<number | null>(null);
  showDeleteModal = signal(false);
  deleteError     = signal('');
  categoryToDelete = signal<CategoryResponse | null>(null);

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAllCategories().subscribe({
      next:  res => { this.categories.set(res); this.loading.set(false); },
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

  openEdit(cat: CategoryResponse): void {
    this.editMode.set(true);
    this.editId.set(cat.id);
    this.form.patchValue({ name: cat.name, description: cat.description || '' });
    this.saveError.set('');
    this.saveSuccess.set(false);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  confirmDelete(cat: CategoryResponse): void {
    this.categoryToDelete.set(cat);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.categoryToDelete.set(null);
    this.deleteError.set('');
  }

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
    const v = this.form.value;
    const payload = { name: v.name!, description: v.description || '' };

    const req = this.editMode()
      ? this.categoryService.updateCategory(this.editId()!, payload)
      : this.categoryService.createCategory(payload);

    req.subscribe({
      next:  () => { this.saving.set(false); this.saveSuccess.set(true); this.loadCategories(); setTimeout(() => this.closeModal(), 1200); },
      error: (err: any) => { this.saving.set(false); this.saveError.set(err?.error?.message || 'Operation failed.'); }
    });
  }

  onDeleteConfirmed(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;
    
    this.deletingId.set(cat.id);
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.closeDeleteModal();
        this.loadCategories();
      },
      error: (err: any) => {
        this.deletingId.set(null);
        this.deleteError.set(err?.error?.message || 'Deletion failed. This category might be in use.');
      }
    });
  }
}
