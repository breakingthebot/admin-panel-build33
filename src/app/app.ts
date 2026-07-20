// src/app/app.ts
// Root component managing shell structure, side navigation, and auth events.
// Created: 2026-07-19

import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    BreadcrumbsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    // Automatically redirect to login page if user becomes unauthenticated
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  keepSessionAlive(): void {
    this.authService.extendSession();
  }

  toggleDemoTimer(event: any): void {
    this.authService.toggleDemoMode(event.target.checked);
  }
}
