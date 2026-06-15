import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <!-- Shared Header -->
      <app-header></app-header>
      
      <!-- Content Area -->
      <div class="flex-grow">
        <router-outlet></router-outlet>
      </div>
      
      <!-- Shared Footer -->
      <app-footer></app-footer>
    </div>
  `
})
export class PublicLayoutComponent {}
