import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStatsResponse } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-guide-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats   = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);
  error   = signal('');

  ngOnInit(): void {
    this.dashboardService.getGuideStats().subscribe({
      next:  res => { this.stats.set(res); this.loading.set(false); },
      error: ()  => { this.error.set('Failed to load stats.'); this.loading.set(false); }
    });
  }
}
