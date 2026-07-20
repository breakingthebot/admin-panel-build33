// src/app/guards/auth.ts
// Route protection guard restricting views to authenticated users or administrators.
// Created: 2026-07-19

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Functional Route Guard mapping authentication state checks.
 * Redirects to /login if unauthenticated, or to /dashboard if non-admin attempts admin-only routes.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Redirect to login if user is not authenticated
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Check if route requires Admin privileges
  const requiredRole = route.data['role'];
  if (requiredRole === 'Admin' && !authService.isAdmin()) {
    alert('Access Denied: Admin role required for this page.');
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
