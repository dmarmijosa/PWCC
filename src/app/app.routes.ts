import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Public Section (Wrapped in Public Layout with Header and Footer)
  {
    path: '',
    loadComponent: () => import('./shared/components/public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'quienes-somos',
        loadComponent: () => import('./features/about/about').then(m => m.AboutComponent)
      },
      {
        path: 'programas',
        loadComponent: () => import('./features/programs/programs').then(m => m.ProgramsComponent)
      },
      {
        path: 'impacto',
        loadComponent: () => import('./features/impact/impact').then(m => m.ImpactComponent)
      }
    ]
  },

  // Admin Authentication (Full screen)
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent)
  },

  // Protected Admin Dashboard (Sidebar Layout)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'datos',
        pathMatch: 'full'
      },
      {
        path: 'datos',
        loadComponent: () => import('./features/admin/datos/admin-datos').then(m => m.AdminDatosComponent)
      },
      {
        path: 'programas',
        loadComponent: () => import('./features/admin/programs/admin-programs').then(m => m.AdminProgramsComponent)
      },
      {
        path: 'donaciones',
        loadComponent: () => import('./features/admin/donaciones/admin-donaciones').then(m => m.AdminDonacionesComponent)
      }
    ]
  },

  // Fallback redirect
  {
    path: '**',
    redirectTo: ''
  }
];
