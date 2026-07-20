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

  // Session Timeout variables
  sessionTimeoutMinutes = signal<number>(30);
  secondsRemaining = signal<number>(0);
  showExpiryWarning = signal<boolean>(false);
  demoMode = signal<boolean>(false);
  private timerInterval: any = null;

  constructor() {
    const cachedRole = localStorage.getItem('@admin_panel/role');
    const cachedUser = localStorage.getItem('@admin_panel/user');
    const cachedTimeout = localStorage.getItem('@admin_panel/timeout');

    if (cachedRole) {
      this.activeRole.set(cachedRole as UserRole);
      this.username.set(cachedUser || '');
    }
    if (cachedTimeout) {
      this.sessionTimeoutMinutes.set(Number(cachedTimeout));
    }

    if (this.isAuthenticated()) {
      this.startSessionTimer();
    }
  }

  login(user: string, role: UserRole): void {
    this.activeRole.set(role);
    this.username.set(user);
    if (role) {
      localStorage.setItem('@admin_panel/role', role);
      localStorage.setItem('@admin_panel/user', user);
      this.startSessionTimer();
    } else {
      this.logout();
    }
  }

  logout(): void {
    this.activeRole.set(null);
    this.username.set('');
    this.showExpiryWarning.set(false);
    this.secondsRemaining.set(0);
    this.stopSessionTimer();
    localStorage.removeItem('@admin_panel/role');
    localStorage.removeItem('@admin_panel/user');
  }

  isAdmin(): boolean {
    return this.activeRole() === 'Admin';
  }

  isAuthenticated(): boolean {
    return this.activeRole() !== null;
  }

  // Session Timeout logic
  startSessionTimer(): void {
    this.stopSessionTimer();
    
    // Set starting seconds: 15s in demo mode, otherwise timeout minutes * 60
    const startSeconds = this.demoMode() ? 15 : this.sessionTimeoutMinutes() * 60;
    this.secondsRemaining.set(startSeconds);
    this.showExpiryWarning.set(false);

    this.timerInterval = setInterval(() => {
      if (this.secondsRemaining() > 0) {
        this.secondsRemaining.update(sec => sec - 1);
        
        // Show warning if remaining seconds <= 10 (demo mode) or <= 60 (standard mode)
        const warningThreshold = this.demoMode() ? 8 : 60;
        if (this.secondsRemaining() <= warningThreshold) {
          this.showExpiryWarning.set(true);
        }
      } else {
        // Log out immediately when timer expires
        this.logout();
      }
    }, 1000);
  }

  stopSessionTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  extendSession(): void {
    this.startSessionTimer();
  }

  toggleDemoMode(enabled: boolean): void {
    this.demoMode.set(enabled);
    if (this.isAuthenticated()) {
      this.startSessionTimer();
    }
  }
}
