// src/app/services/theme.ts
// Handles system appearance color theme toggling and cache storage.
// Created: 2026-07-20

import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  activeTheme = signal<AppTheme>('dark');

  constructor() {
    const cachedTheme = localStorage.getItem('@admin_panel/theme') as AppTheme;
    if (cachedTheme) {
      this.setTheme(cachedTheme);
    } else {
      this.setTheme('dark');
    }
  }

  setTheme(theme: AppTheme): void {
    this.activeTheme.set(theme);
    localStorage.setItem('@admin_panel/theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme(): void {
    const nextTheme = this.activeTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }
}
