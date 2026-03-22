import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FeaturedToursComponent } from './featured-tours/featured-tours.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FeaturedToursComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
