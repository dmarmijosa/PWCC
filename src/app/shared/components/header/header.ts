import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
    <nav class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-none">
      <!-- Left: Logo & Brand Name -->
      <div class="flex items-center gap-4">
        <a routerLink="/" class="flex items-center gap-3">
          <img 
            ngSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBodC-HlfX9DNx4VPQmKnuC6_6zWaO_uKKPD2AlNxRZ9Dw1IxbmYvbnseE8DSS6KpDqhET1ZE2Z7xq0seZ3_Is07ClEbpdrDUTGP7IdMQegke4bUNwoQVotEAHTHxqUG8ghO4GPZqylxl-Cxt11-CdABk1D96mSqnuuJtE_IQ_5jSoOA4dgga-P-Nbk2jaiQGtJsDw2D8E4FLJqtIvGH4t96TDcYlX9vgNVCMMC6iT5qMyPFg6SLTOOl80BRTYed3jReiVm_fIcDFU" 
            alt="Logo" 
            width="48" 
            height="48" 
            class="h-12 w-auto object-contain"
            priority>
          <span class="hidden sm:block font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Confraternidad Carcelaria
          </span>
        </a>
      </div>

      <!-- Center: Desktop Navigation Links -->
      <div class="hidden lg:flex items-center gap-8">
        <a 
          routerLink="/quienes-somos" 
          routerLinkActive="text-primary font-bold border-b-2 border-primary pb-1" 
          [routerLinkActiveOptions]="{exact: true}"
          class="text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md">
          Quiénes Somos
        </a>
        <a 
          routerLink="/programas" 
          routerLinkActive="text-primary font-bold border-b-2 border-primary pb-1" 
          [routerLinkActiveOptions]="{exact: true}"
          class="text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md">
          Programas
        </a>
        <a 
          routerLink="/impacto" 
          routerLinkActive="text-primary font-bold border-b-2 border-primary pb-1" 
          [routerLinkActiveOptions]="{exact: true}"
          class="text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md">
          Impacto
        </a>
      </div>

      <!-- Right: Buttons -->
      <div class="hidden lg:flex items-center gap-4">
        <button 
          (click)="openDonationLink()"
          class="px-6 py-2 bg-primary-container text-on-primary-container font-label-md text-label-md rounded shadow-sm hover:brightness-90 transition-all font-semibold cursor-pointer">
          Donar
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        (click)="toggleMobileMenu()"
        class="lg:hidden flex items-center justify-center p-2 text-secondary hover:text-primary transition-colors"
        aria-label="Abrir menú">
        <span class="material-symbols-outlined text-[28px]">
          {{ isMobileMenuOpen() ? 'close' : 'menu' }}
        </span>
      </button>

      <!-- Mobile Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="absolute top-20 left-0 w-full bg-surface border-b border-outline-variant shadow-lg flex flex-col p-6 gap-6 z-50 lg:hidden">
          <a 
            routerLink="/quienes-somos" 
            (click)="closeMobileMenu()"
            class="text-secondary hover:text-primary font-label-md text-label-md py-2 border-b border-outline-variant/30">
            Quiénes Somos
          </a>
          <a 
            routerLink="/programas" 
            (click)="closeMobileMenu()"
            class="text-secondary hover:text-primary font-label-md text-label-md py-2 border-b border-outline-variant/30">
            Programas
          </a>
          <a 
            routerLink="/impacto" 
            (click)="closeMobileMenu()"
            class="text-secondary hover:text-primary font-label-md text-label-md py-2 border-b border-outline-variant/30">
            Impacto
          </a>

          <div class="flex flex-col gap-4 mt-2">
            <button 
              (click)="openDonationLink(); closeMobileMenu()"
              class="w-full py-3 bg-primary-container text-on-primary-container font-label-md text-label-md rounded hover:brightness-90 transition-all font-semibold">
              Donar
            </button>
          </div>
        </div>
      }
    </nav>
  `,
  styles: []
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  protected readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openDonationLink(): void {
    if (typeof window !== 'undefined') {
      const email = this.dataService.datosBancarios()?.email || 'donaciones@confraternidad.org.ec';
      const subject = encodeURIComponent('Deseo realizar un donativo');
      const body = encodeURIComponent('Hola, deseo realizar un donativo a la Confraternidad Carcelaria de Ecuador.');
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
  }
}
