import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="w-full py-12 px-6 md:px-12 bg-secondary text-on-primary text-center">
      <div class="max-w-7xl mx-auto">
        <h3 class="font-headline-md text-headline-md font-bold mb-4">
          Fundación Confraternidad Carcelaria de Ecuador
        </h3>
        <p class="max-w-2xl mx-auto text-on-primary/80 mb-8 text-sm">
          Institución con Personería Jurídica trabajando por la dignidad y restauración integral en el sistema penitenciario ecuatoriano.
          <br>RUC: 179XXXXXXX001
        </p>
        <div class="flex justify-center gap-6 mb-8 text-on-primary/70 font-label-md text-sm flex-wrap">
          <a href="#" class="hover:text-on-primary transition-colors">Privacidad</a>
          <a href="#" class="hover:text-on-primary transition-colors">Términos</a>
          <a href="#" class="hover:text-on-primary transition-colors">Contacto</a>
          <a href="#" class="hover:text-on-primary transition-colors">Transparencia</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/admin/dashboard" class="hover:text-on-primary transition-colors font-semibold">Panel de administración</a>
          } @else {
            <a routerLink="/admin/login" class="hover:text-on-primary transition-colors font-semibold">Acceso al portal</a>
          }
        </div>
        <div class="border-t border-on-primary/20 pt-8 text-on-primary/60 text-xs">
          © {{ currentYear }} Fundación Confraternidad Carcelaria de Ecuador. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  protected readonly authService = inject(AuthService);
  protected readonly currentYear = new Date().getFullYear();
}
