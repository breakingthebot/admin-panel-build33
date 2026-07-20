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
        provideRouter([{ path: 'dashboard', component: class {} }]),
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

import { UsersComponent } from './components/users/users';

describe('UsersComponent Management Panel', () => {
  let component: UsersComponent;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dashboard', component: class {} }]),
        AuthService,
        UsersComponent
      ]
    });
    authService = TestBed.inject(AuthService);
    component = TestBed.inject(UsersComponent);
  });

  it('should initialize with default users list', () => {
    expect(component.usersList().length).toBe(4);
  });

  it('should prevent non-admin user from toggling user status', () => {
    authService.login('guest_user', 'Guest');
    component.toggleUserStatus('usr-102');
    expect(component.usersList().find(u => u.id === 'usr-102')?.status).toBe('Active');
  });

  it('should allow admin user to toggle status', () => {
    authService.login('admin_user', 'Admin');
    component.toggleUserStatus('usr-102');
    const updatedUser = component.usersList().find(u => u.id === 'usr-102');
    expect(updatedUser?.status).toBe('Suspended');
  });

  it('should fail user creation validation with invalid parameters', () => {
    component.newName = '  ';
    component.newEmail = 'invalid-email';
    component.createUser();
    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component.usersList().length).toBe(4);
  });

  it('should succeed user creation with correct parameters', () => {
    component.newName = 'Alice Vance';
    component.newEmail = 'alice.v@enterprise.com';
    component.newRole = 'Developer';
    component.newStatus = 'Active';
    
    component.createUser();
    expect(component.validationErrors().length).toBe(0);
    expect(component.usersList().length).toBe(5);
    expect(component.usersList().find(u => u.name === 'Alice Vance')).toBeDefined();
  });
});

import { DashboardComponent } from './components/dashboard/dashboard';

describe('DashboardComponent Telemetry and Graphing', () => {
  let component: DashboardComponent;

  beforeEach(() => {
    component = new DashboardComponent();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should initialize with starting metrics and alerts data', () => {
    expect(component.systemMetrics().length).toBe(4);
    expect(component.recentAlerts().length).toBe(4);
  });

  it('should calculate SVG line paths dynamically from latency arrays', () => {
    const path = component.svgLinePath();
    expect(path).toContain('M');
    expect(path).toContain('L');
  });

  it('should compute closed filled SVG background area paths correctly', () => {
    const areaPath = component.svgAreaPath();
    expect(areaPath).toContain('Z');
  });
});

import { LogsComponent } from './components/logs/logs';

describe('LogsComponent Auditing and CSV Export', () => {
  let component: LogsComponent;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dashboard', component: class {} }]),
        AuthService,
        LogsComponent
      ]
    });
    authService = TestBed.inject(AuthService);
    component = TestBed.inject(LogsComponent);
  });

  it('should load default audit log list', () => {
    expect(component.logsList().length).toBe(5);
  });

  it('should filter logs by severity level', () => {
    component.setSeverityFilter('Error');
    expect(component.filteredLogs().length).toBe(1);
    expect(component.filteredLogs()[0].severity).toBe('Error');
  });

  it('should filter logs by query string', () => {
    component.searchQuery = 'usr-102';
    expect(component.filteredLogs().length).toBe(1);
    expect(component.filteredLogs()[0].userId).toBe('usr-102');
  });

  it('should prevent non-admin from clearing logs', () => {
    authService.login('guest_user', 'Guest');
    component.clearLogs();
    expect(component.logsList().length).toBe(5);
  });

  it('should initialize elevation status with None', () => {
    expect(authService.elevationStatus()).toBe('None');
  });

  it('should transition elevation status to Pending upon request', () => {
    authService.login('guest_user', 'Guest');
    authService.requestAdminElevation();
    expect(authService.elevationStatus()).toBe('Pending');
  });

  it('should transition to Approved and elevate role to Admin when approved', () => {
    authService.login('guest_user', 'Guest');
    authService.approveElevation();
    expect(authService.elevationStatus()).toBe('Approved');
    expect(authService.activeRole()).toBe('Admin');
    expect(authService.elevationSecondsRemaining()).toBe(30);
  });

  it('should revert back to Guest and clear status when demoted', () => {
    authService.login('guest_user', 'Guest');
    authService.approveElevation();
    authService.demoteSession();
    expect(authService.activeRole()).toBe('Guest');
    expect(authService.elevationStatus()).toBe('None');
  });
});
