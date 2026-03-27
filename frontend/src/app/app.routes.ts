import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'tours',
    loadComponent: () => import('./features/public/tours/tours.component').then(c => c.ToursComponent)
  },
  {
    path: 'tours/:id',
    loadComponent: () => import('./features/public/tour-details/tour-details.component').then(c => c.TourDetailsComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/public/about/about.component').then(c => c.AboutComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    redirectTo: 'register/tourist',
    pathMatch: 'full'
  },
  {
    path: 'register/tourist',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register-tourist/register-tourist.component').then(c => c.RegisterTouristComponent)
  },
  {
    path: 'register/guide',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register-guide/register-guide.component').then(c => c.RegisterGuideComponent)
  },
  {
    path: 'guide',
    loadComponent: () => import('./features/guide/layout/layout.component').then(c => c.LayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'GUIDE' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/guide/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'my-tours', loadComponent: () => import('./features/guide/my-tours/my-tours.component').then(c => c.MyToursComponent) },
      { path: 'bookings', loadComponent: () => import('./features/guide/bookings/bookings.component').then(c => c.BookingsComponent) },
      { path: 'profile', loadComponent: () => import('./features/guide/profile/profile.component').then(c => c.ProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/layout.component').then(c => c.LayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(c => c.UsersComponent) },
      { path: 'bookings', loadComponent: () => import('./features/admin/bookings/bookings.component').then(c => c.BookingsComponent) },
      { path: 'tours', loadComponent: () => import('./features/admin/tours/tours.component').then(c => c.ToursComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories.component').then(c => c.CategoriesComponent) },
      { path: 'languages', loadComponent: () => import('./features/admin/languages/languages.component').then(c => c.LanguagesComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'tourist/my-bookings',
    loadComponent: () => import('./features/tourist/my-bookings/my-bookings.component').then(c => c.MyBookingsComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'TOURIST' }
  },
  {
    path: 'tourist/profile',
    loadComponent: () => import('./features/tourist/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'TOURIST' }
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile-redirect/profile-redirect.component').then(c => c.ProfileRedirectComponent)
  },
  { path: '**', redirectTo: '' }
];
