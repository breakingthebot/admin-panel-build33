// src/app/components/users/users.ts
// User management component permitting role assignments, profile status updates, and user creation.
// Created: 2026-07-19

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Developer' | 'Analyst';
  status: 'Active' | 'Suspended';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent {
  searchQuery = '';
  
  // Standalone state controllers
  showCreateModal = signal<boolean>(false);
  newName = '';
  newEmail = '';
  newRole: 'Administrator' | 'Developer' | 'Analyst' = 'Analyst';
  newStatus: 'Active' | 'Suspended' = 'Active';
  validationErrors = signal<string[]>([]);

  usersList = signal<UserProfile[]>([
    { id: 'usr-101', name: 'Marcus Miller', email: 'marcus@enterprise.com', role: 'Administrator', status: 'Active' },
    { id: 'usr-102', name: 'Sarah Connor', email: 'sarah.c@skynet.net', role: 'Developer', status: 'Active' },
    { id: 'usr-103', name: 'John Doe', email: 'john.doe@gmail.com', role: 'Analyst', status: 'Active' },
    { id: 'usr-104', name: 'Ellen Ripley', email: 'ripley@weyland-yutani.corp', role: 'Developer', status: 'Suspended' }
  ]);

  constructor(public authService: AuthService) {
    const cachedUsers = localStorage.getItem('@admin_panel/users_list');
    if (cachedUsers) {
      this.usersList.set(JSON.parse(cachedUsers));
    } else {
      this.saveToStorage(this.usersList());
    }
  }

  filteredUsers = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    return this.usersList().filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  toggleUserStatus(id: string): void {
    if (!this.authService.isAdmin()) {
      alert('Access Denied: Only Administrators can toggle user status.');
      return;
    }

    this.usersList.update(list => {
      const updated: UserProfile[] = list.map(u => u.id === id ? { ...u, status: (u.status === 'Active' ? 'Suspended' : 'Active') as 'Active' | 'Suspended' } : u);
      this.saveToStorage(updated);
      return updated;
    });
  }

  updateUserRole(id: string, newRole: any): void {
    if (!this.authService.isAdmin()) {
      alert('Access Denied: Only Administrators can modify user roles.');
      return;
    }

    this.usersList.update(list => {
      const updated: UserProfile[] = list.map(u => u.id === id ? { ...u, role: newRole as 'Administrator' | 'Developer' | 'Analyst' } : u);
      this.saveToStorage(updated);
      return updated;
    });
  }

  openCreateModal(): void {
    this.newName = '';
    this.newEmail = '';
    this.newRole = 'Analyst';
    this.newStatus = 'Active';
    this.validationErrors.set([]);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createUser(): void {
    // Validate inputs
    const errors: string[] = [];
    if (!this.newName.trim() || this.newName.trim().length < 3) {
      errors.push('Full Name must be at least 3 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.newEmail.trim() || !emailRegex.test(this.newEmail)) {
      errors.push('Please enter a valid email address.');
    }

    if (errors.length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    // Success - add user
    const newId = `usr-${100 + this.usersList().length + 1}`;
    const newUser: UserProfile = {
      id: newId,
      name: this.newName.trim(),
      email: this.newEmail.trim(),
      role: this.newRole,
      status: this.newStatus
    };

    this.usersList.update(list => {
      const updated = [...list, newUser];
      this.saveToStorage(updated);
      return updated;
    });

    this.closeCreateModal();
    alert(`Success: User account ${newUser.name} created successfully!`);
  }

  private saveToStorage(list: UserProfile[]): void {
    localStorage.setItem('@admin_panel/users_list', JSON.stringify(list));
  }
}
