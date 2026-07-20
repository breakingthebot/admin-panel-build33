// src/app/app.routes.ts
// Configures route paths, lazy loading components, guards, and data breadcrumbs.
// Created: 2026-07-19

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Dashboard' }
  },
  { 
    path: 'users', 
    loadComponent: () => import('./components/users/users').then(m => m.UsersComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'User Management', role: 'Admin' }
  },
  { 
    path: 'logs', 
    loadComponent: () => import('./components/logs/logs').then(m => m.LogsComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Security Logs', role: 'Admin' }
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./components/settings/settings').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'System Settings', role: 'Admin' }
  },
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
