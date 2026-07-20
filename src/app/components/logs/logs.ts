// src/app/components/logs/logs.ts
// Audit logs component tracking system mutations and security events.
// Created: 2026-07-19

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

export interface AuditLog {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  severity: 'Info' | 'Warning' | 'Error';
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class LogsComponent {
  searchQuery = '';
  severityFilter = signal<'All' | 'Info' | 'Warning' | 'Error'>('All');

  logsList = signal<AuditLog[]>([
    { timestamp: '2026-07-19T23:10:00Z', userId: 'usr-101', action: 'ROLE_UPDATE', resource: 'user:usr-103', severity: 'Info' },
    { timestamp: '2026-07-19T23:08:12Z', userId: 'usr-102', action: 'DATABASE_BACKUP_FAIL', resource: 'db:main', severity: 'Error' },
    { timestamp: '2026-07-19T23:02:45Z', userId: 'usr-103', action: 'LOGIN_ATTEMPT', resource: 'auth:portal', severity: 'Warning' },
    { timestamp: '2026-07-19T22:58:30Z', userId: 'usr-101', action: 'CONFIGURATION_MUTATED', resource: 'config:api_keys', severity: 'Info' },
    { timestamp: '2026-07-19T22:50:11Z', userId: 'usr-104', action: 'ACCESS_DENIED', resource: 'settings:billing', severity: 'Warning' }
  ]);

  constructor(public authService: AuthService) {}

  filteredLogs = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    const filter = this.severityFilter();

    return this.logsList().filter(log => {
      const matchesQuery = 
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query);

      const matchesSeverity = filter === 'All' || log.severity === filter;

      return matchesQuery && matchesSeverity;
    });
  });

  setSeverityFilter(filter: 'All' | 'Info' | 'Warning' | 'Error'): void {
    this.severityFilter.set(filter);
  }

  clearLogs(): void {
    if (!this.authService.isAdmin()) {
      alert('Access Denied: Only Administrators can clear audit logs.');
      return;
    }

    if (confirm('Are you sure you want to permanently delete all system audit logs?')) {
      this.logsList.set([]);
    }
  }

  exportToCSV(): void {
    const logs = this.filteredLogs();
    if (logs.length === 0) {
      alert('No logs available to export.');
      return;
    }

    // CSV Headers
    const headers = ['Timestamp', 'User ID', 'Action', 'Resource Affected', 'Severity'];
    
    // CSV Rows
    const rows = logs.map(log => [
      log.timestamp,
      log.userId,
      log.action,
      log.resource,
      log.severity
    ]);

    // Format fields with quotes to handle commas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create file blob and trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
