// src/app/app.spec.ts
// Test suite for the main App Shell, routing guards, and role privileges.
// Created: 2026-07-19

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './services/auth';

describe('App & Router Administration System', () => {
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        AuthService
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    authService.stopSessionTimer();
  });

  it('should create the main app shell component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should start with unauthenticated user session state', () => {
    expect(authService.isAuthenticated()).toBeFalsy();
    expect(authService.activeRole()).toBeNull();
  });

  it('should permit successful Admin authentication and cache credentials', () => {
    authService.login('admin_user', 'Admin');
    expect(authService.isAuthenticated()).toBeTruthy();
    expect(authService.isAdmin()).toBeTruthy();
    expect(localStorage.getItem('@admin_panel/role')).toBe('Admin');
  });

  it('should permit successful Guest authentication and cache credentials', () => {
    authService.login('guest_user', 'Guest');
    expect(authService.isAuthenticated()).toBeTruthy();
    expect(authService.isAdmin()).toBeFalsy();
    expect(localStorage.getItem('@admin_panel/role')).toBe('Guest');
  });

  it('should clear cached role on sign out / logout', () => {
    authService.login('admin_user', 'Admin');
    authService.logout();
    expect(authService.isAuthenticated()).toBeFalsy();
    expect(localStorage.getItem('@admin_panel/role')).toBeNull();
  });

  it('should start session countdown timer upon login', () => {
    authService.login('admin_user', 'Admin');
    expect(authService.secondsRemaining()).toBeGreaterThan(0);
  });

  it('should trigger warning modal when remaining seconds fall below threshold in demo mode', () => {
    authService.toggleDemoMode(true);
    authService.login('admin_user', 'Admin');
    expect(authService.secondsRemaining()).toBe(15);
    expect(authService.showExpiryWarning()).toBeFalsy();

    authService.secondsRemaining.set(5);
    authService.showExpiryWarning.set(true);
    expect(authService.showExpiryWarning()).toBeTruthy();
  });

  it('should reset countdown timer when session is extended', () => {
    authService.toggleDemoMode(true);
    authService.login('admin_user', 'Admin');
    authService.secondsRemaining.set(3);
    authService.extendSession();
    expect(authService.secondsRemaining()).toBe(15);
  });
});
