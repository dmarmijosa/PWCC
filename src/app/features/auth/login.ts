import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Form group
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Password visibility state
  protected readonly showPassword = signal(false);
  
  // Login error message signal
  protected readonly loginError = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  async onSubmitLogin(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value || '';
      const password = this.loginForm.get('password')?.value || '';

      const success = await this.authService.login(email, password);
      if (success) {
        this.loginError.set(null);
        this.router.navigate(['/admin/dashboard/datos']);
      } else {
        this.loginError.set('Credenciales inválidas. Por favor, verifique e intente de nuevo.');
      }
    }
  }
}
