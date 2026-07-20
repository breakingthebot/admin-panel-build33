// src/app/components/users/users.ts
// User management component permitting role assignments and profile status updates.
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
  
  usersList = signal<UserProfile[]>([
    { id: 'usr-101', name: 'Marcus Miller', email: 'marcus@enterprise.com', role: 'Administrator', status: 'Active' },
    { id: 'usr-102', name: 'Sarah Connor', email: 'sarah.c@skynet.net', role: 'Developer', status: 'Active' },
    { id: 'usr-103', name: 'John Doe', email: 'john.doe@gmail.com', role: 'Analyst', status: 'Active' },
    { id: 'usr-104', name: 'Ellen Ripley', email: 'ripley@weyland-yutani.corp', role: 'Developer', status: 'Suspended' }
  ]);

  constructor(public authService: AuthService) {}

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

    this.usersList.update(list => 
      list.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u)
    );
  }

  updateUserRole(id: string, newRole: any): void {
    if (!this.authService.isAdmin()) {
      alert('Access Denied: Only Administrators can modify user roles.');
      return;
    }

    this.usersList.update(list => 
      list.map(u => u.id === id ? { ...u, role: newRole } : u)
    );
  }
}
