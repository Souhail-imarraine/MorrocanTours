import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent {

  features = [
    { number: '500+', label: 'Local Guides', description: 'Certified and passionate local experts' },
    { number: '10K+', label: 'Happy Travelers', description: 'Unforgettable memories created' },
    { number: '50+', label: 'Destinations', description: "Across Morocco's diverse regions" },
    { number: '4.9★', label: 'Rating', description: 'Average satisfaction score' }
  ];

  services = [
    {
      icon: 'search',
      title: 'Easy Tour Discovery',
      description: 'Browse hundreds of curated tours filtered by city, category, price, and duration — all in one place.'
    },
    {
      icon: 'calendar',
      title: 'Instant Booking',
      description: 'Reserve your spot in seconds with our streamlined booking system. No back-and-forth emails needed.'
    },
    {
      icon: 'guide',
      title: 'Vetted Local Guides',
      description: 'Every guide is personally reviewed and approved by our admin team before they can publish tours.'
    },
    {
      icon: 'payment',
      title: 'Secure Payments',
      description: 'Your transactions are protected. Pay with confidence and receive instant booking confirmation.'
    },
    {
      icon: 'support',
      title: '24/7 Support',
      description: 'Our team is always available to assist you before, during, and after your Moroccan adventure.'
    },
    {
      icon: 'flexible',
      title: 'Flexible Policies',
      description: 'Life happens. Our guides offer flexible cancellation and rescheduling options to fit your needs.'
    }
  ];
}
