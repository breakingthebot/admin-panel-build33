// src/app/app.ts
// Root component managing shell structure, side navigation, and auth events.
// Created: 2026-07-19

import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs';
import { filter } from 'rxjs/operators';

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

  // Mobile sidebar state
  mobileSidebarOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileSidebarOpen.set(false);
    });
  }

  logout(): void {
    this.authService.logout();
    this.mobileSidebarOpen.set(false);
  }

  keepSessionAlive(): void {
    this.authService.extendSession();
  }

  toggleDemoTimer(event: any): void {
    this.authService.toggleDemoMode(event.target.checked);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(val => !val);
  }
}
