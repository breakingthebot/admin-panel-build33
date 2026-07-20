// src/app/components/login/login.ts
// Controller for the login view where users choose their role and authenticate.
// Created: 2026-07-19

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  selectedRole: UserRole = 'Guest';
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login(): void {
    if (!this.username.trim()) {
      this.errorMessage.set('Username is required.');
      return;
    }
    this.errorMessage.set('');
    this.authService.login(this.username.trim(), this.selectedRole);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  quickFill(role: 'Admin' | 'Guest'): void {
    if (role === 'Admin') {
      this.username = 'admin_user';
      this.selectedRole = 'Admin';
    } else {
      this.username = 'guest_user';
      this.selectedRole = 'Guest';
    }
    this.login();
  }
}
