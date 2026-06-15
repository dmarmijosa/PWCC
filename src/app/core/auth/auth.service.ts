import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly currentUserSignal = signal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
  );

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.initSession();
  }

  private async initSession(): Promise<void> {
    // Check initial session
    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      if (session?.user) {
        this.currentUserSignal.set(session.user.email ?? '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', session.user.email ?? '');
        }
      } else {
        this.currentUserSignal.set(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
        }
      }
    } catch (e) {
      console.error('Error getting initial session:', e);
    }

    // Listen to changes
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUserSignal.set(session.user.email ?? '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', session.user.email ?? '');
        }
      } else {
        this.currentUserSignal.set(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
        }
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Supabase login error:', error.message);
      return false;
    }
    if (data.user) {
      this.currentUserSignal.set(data.user.email ?? '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', data.user.email ?? '');
      }
      return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.client.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    this.currentUserSignal.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }
}
