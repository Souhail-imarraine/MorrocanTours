import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-guide-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  private readonly router      = inject(Router);
  readonly authService         = inject(AuthService);

  sidebarOpen = signal(false);

  ngOnInit(): void {
    // Load profile image AFTER injection is fully complete (avoids circular dep)
    if (this.authService.currentUser()) {
      this.authService.refreshCurrentUser();
    }
  }

  toggleSidebar = () => this.sidebarOpen.update(v => !v);
  closeSidebar  = () => this.sidebarOpen.set(false);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
