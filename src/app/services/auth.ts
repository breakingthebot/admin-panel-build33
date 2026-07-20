// src/app/services/auth.ts
// Handles user authentication state, active roles, and token mocks.
// Created: 2026-07-19

import { Injectable, signal } from '@angular/core';

export type UserRole = 'Admin' | 'Guest' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Standalone Signals for modern reactive states
  activeRole = signal<UserRole>(null);
  username = signal<string>('');

  constructor() {
    const cachedRole = localStorage.getItem('@admin_panel/role');
    const cachedUser = localStorage.getItem('@admin_panel/user');
    if (cachedRole) {
      this.activeRole.set(cachedRole as UserRole);
      this.username.set(cachedUser || '');
    }
  }

  login(user: string, role: UserRole): void {
    this.activeRole.set(role);
    this.username.set(user);
    if (role) {
      localStorage.setItem('@admin_panel/role', role);
      localStorage.setItem('@admin_panel/user', user);
    } else {
      this.logout();
    }
  }

  logout(): void {
    this.activeRole.set(null);
    this.username.set('');
    localStorage.removeItem('@admin_panel/role');
    localStorage.removeItem('@admin_panel/user');
  }

  isAdmin(): boolean {
    return this.activeRole() === 'Admin';
  }

  isAuthenticated(): boolean {
    return this.activeRole() !== null;
  }
}
