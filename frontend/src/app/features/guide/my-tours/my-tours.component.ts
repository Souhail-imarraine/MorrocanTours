import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TourService } from '../../../core/services/tour.service';
import { CategoryService } from '../../../core/services/category.service';
import { TourResponse } from '../../../core/models/tour.model';
import { CategoryResponse } from '../../../core/models/category.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const now = new Date();
  
  if (selectedDate < now) {
    return { pastDate: true };
  }
  return null;
}

export function endDateAfterStartValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  if (!start || !end) return null;

  if (new Date(end) <= new Date(start)) {
    group.get('endDate')?.setErrors({ beforeStart: true });
    return { beforeStart: true };
  }
  return null;
}

@Component({
  selector: 'app-my-tours',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-tours.component.html',
  providers: [DatePipe]
})
export class MyToursComponent implements OnInit {
  private readonly tourService     = inject(TourService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb              = inject(FormBuilder);
  private readonly datePipe        = inject(DatePipe);
  readonly authService = inject(AuthService);

  tours      = signal<TourResponse[]>([]);
  categories = signal<CategoryResponse[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  showModal  = signal(false);
  saveError  = signal('');
  saveSuccess= signal(false);

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    title:             ['', [Validators.required, Validators.minLength(3)]],
    description:       ['', [Validators.required, Validators.minLength(20)]],
    price:             [null as number | null, [Validators.required, Validators.min(1)]],
    durationHours:     [null as number | null, [Validators.required, Validators.min(1)]],
    city:              ['', Validators.required],
    maxParticipants:   [null as number | null, [Validators.required, Validators.min(1)]],
    categoryId:        [null as number | null, Validators.required],
    startLocationName: ['', Validators.required],
    endLocationName:   ['', Validators.required],
    startDate:         ['', [Validators.required, futureDateValidator]],
    endDate:           ['', [Validators.required]]
  }, { validators: endDateAfterStartValidator });

  ngOnInit(): void { this.loadTours(); this.loadCategories(); }

  loadTours(): void {
    this.loading.set(true);
    this.tourService.getMyTours().subscribe({
      next:  res => { this.tours.set(res); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: res => this.categories.set(res)
    });
  }

  openModal():  void { 
    this.form.reset(); 
    this.selectedFile = null;
    this.imagePreview = null;
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
    if (!c?.errors || !(c.dirty || c.touched)) return '';
    if (c.errors['required'])  return 'Required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['min'])       return `Min ${c.errors['min'].min}.`;
    if (c.errors['pastDate'])  return 'Date cannot be in the past.';
    if (c.errors['beforeStart']) return 'End date must be after start date.';
    return 'Invalid.';
  }

  formatDateForBackend(dateString: string): string {
    const d = new Date(dateString);
    return this.datePipe.transform(d, "yyyy-MM-dd'T'HH:mm:ss") || '';
  }

  getPhotoUrl(path: string | undefined | null): string {
    return AuthService.getPhotoUrl(path);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    
    if (!this.selectedFile) {
      this.saveError.set('Please select an image for your tour.');
      return;
    }

    if (this.form.invalid) {
      this.saveError.set('Please fix the errors in the form.');
      return;
    }
    
    this.saving.set(true);
    this.saveError.set('');
    const v = this.form.value;

    this.tourService.createTour({
      title:             v.title!,
      description:       v.description!,
      price:             v.price!,
      durationHours:     v.durationHours!,
      city:              v.city!,
      maxParticipants:   v.maxParticipants!,
      categoryId:        v.categoryId!,
      startLocationName: v.startLocationName!,
      endLocationName:   v.endLocationName!,
      startDate:         this.formatDateForBackend(v.startDate!),
      endDate:           this.formatDateForBackend(v.endDate!)
    }).subscribe({
      next: (tourRes) => { 
        // Tour created, now upload image
        this.tourService.uploadTourImage(tourRes.id, this.selectedFile!).subscribe({
          next: () => {
            this.saving.set(false); 
            this.saveSuccess.set(true); 
            this.loadTours(); 
            setTimeout(() => this.closeModal(), 1500); 
          },
          error: () => {
            this.saving.set(false); 
            this.saveError.set('Tour created, but image upload failed. Please contact support.');
            this.loadTours();
          }
        });
      },
      error: (err: any) => { 
        this.saving.set(false); 
        this.saveError.set(err?.error?.message || 'Failed to create tour. Please verify all details.'); 
      }
    });
  }

  deleteTour(id: number): void {
    if (!confirm('Delete this tour?')) return;
    this.tourService.deleteTour(id).subscribe(() => this.loadTours());
  }

  publishTour(id: number): void {
    this.tourService.publishTour(id).subscribe(() => this.loadTours());
  }

  statusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'DRAFT':     return 'bg-gray-100 text-gray-600';
      case 'PENDING':   return 'bg-yellow-100 text-yellow-700';
      default:          return 'bg-gray-100 text-gray-500';
    }
  }
}
