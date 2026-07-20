// src/app/services/auth.ts
// Handles user authentication state, active roles, token mocks, and temporary admin elevations.
// Created: 2026-07-19

import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'Admin' | 'Guest' | null;
export type ElevationStatus = 'None' | 'Pending' | 'Approved' | 'Denied';

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

  // Elevation state variables
  elevationStatus = signal<ElevationStatus>('None');
  elevationSecondsRemaining = signal<number>(0);
  private elevationTimerInterval: any = null;
  private approvalTimeout: any = null;

  private router = inject(Router);

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
    
    // Reset elevation variables on login
    this.resetElevation();

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
    this.resetElevation();
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
    
    const startSeconds = this.demoMode() ? 15 : this.sessionTimeoutMinutes() * 60;
    this.secondsRemaining.set(startSeconds);
    this.showExpiryWarning.set(false);

    this.timerInterval = setInterval(() => {
      if (this.secondsRemaining() > 0) {
        this.secondsRemaining.update(sec => sec - 1);
        
        const warningThreshold = this.demoMode() ? 8 : 60;
        if (this.secondsRemaining() <= warningThreshold) {
          this.showExpiryWarning.set(true);
        }
      } else {
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

  // Role Elevation logic
  requestAdminElevation(): void {
    if (this.isAdmin()) return;
    
    this.elevationStatus.set('Pending');
    
    // Simulate admin automated approval queue after 3 seconds
    this.approvalTimeout = setTimeout(() => {
      this.approveElevation();
    }, 3000);
  }

  approveElevation(): void {
    this.elevationStatus.set('Approved');
    this.activeRole.set('Admin');
    localStorage.setItem('@admin_panel/role', 'Admin');
    
    // Start temporary access 30s countdown
    this.elevationSecondsRemaining.set(30);
    
    if (this.elevationTimerInterval) {
      clearInterval(this.elevationTimerInterval);
    }
    
    this.elevationTimerInterval = setInterval(() => {
      if (this.elevationSecondsRemaining() > 0) {
        this.elevationSecondsRemaining.update(sec => sec - 1);
      } else {
        this.demoteSession();
      }
    }, 1000);
  }

  demoteSession(): void {
    this.resetElevation();
    
    // Demote back to Guest
    this.activeRole.set('Guest');
    localStorage.setItem('@admin_panel/role', 'Guest');
    
    // Alert the user and route back to dashboard overview
    alert('Temporary Admin Access Expired: Reverted back to Guest role.');
    this.router.navigate(['/dashboard']);
  }

  denyElevation(): void {
    this.resetElevation();
    this.elevationStatus.set('Denied');
    
    setTimeout(() => {
      this.elevationStatus.set('None');
    }, 3000);
  }

  private resetElevation(): void {
    if (this.elevationTimerInterval) {
      clearInterval(this.elevationTimerInterval);
      this.elevationTimerInterval = null;
    }
    if (this.approvalTimeout) {
      clearTimeout(this.approvalTimeout);
      this.approvalTimeout = null;
    }
    this.elevationStatus.set('None');
    this.elevationSecondsRemaining.set(0);
  }
}
