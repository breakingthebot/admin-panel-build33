// src/app/components/dashboard/dashboard.ts
// Dashboard overview component visualizing stats and server activities.
// Created: 2026-07-19

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  systemMetrics = signal([
    { label: 'Total API Requests', value: '1.24M', change: '+12.4%', status: 'success', icon: '⚡' },
    { label: 'Active Sessions', value: '4,892', change: '+3.2%', status: 'success', icon: '👥' },
    { label: 'Database Health', value: '99.98%', change: 'Stable', status: 'info', icon: '💾' },
    { label: 'Server Memory Load', value: '42.6%', change: '-5.1%', status: 'warning', icon: '🧠' }
  ]);

  recentAlerts = signal([
    { service: 'Auth-Service', message: 'Rate limit threshold hit on route /oauth/token', time: '2 mins ago', severity: 'warning' },
    { service: 'Gateway-API', message: 'Failed database connection handshake retry resolved', time: '12 mins ago', severity: 'success' },
    { service: 'Billing-Processor', message: 'Partial failure on batch subscription renewal', time: '45 mins ago', severity: 'danger' },
    { service: 'DNS-Resolver', message: 'Primary edge cache revalidation completed', time: '1 hour ago', severity: 'success' }
  ]);
}
