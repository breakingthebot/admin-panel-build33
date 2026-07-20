// src/app/components/dashboard/dashboard.ts
// Dashboard overview component visualizing stats and server activities.
// Created: 2026-07-19

import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
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

  // Real-time server latency array state
  latencyPoints = signal<number[]>([30, 45, 25, 60, 50, 40, 35, 75, 45, 55, 60, 50]);
  private intervalId: any = null;

  // Real-time live log stream
  liveLogs = signal<any[]>([
    { service: 'Database', message: 'Query SELECT * FROM users', latency: '40ms', time: 'Just now', status: 'success' },
    { service: 'Auth-Service', message: 'Session validation token match', latency: '12ms', time: '2s ago', status: 'success' },
    { service: 'Gateway-API', message: 'GET /api/v1/telemetry resolved', latency: '22ms', time: '4s ago', status: 'success' },
    { service: 'Cache-Manager', message: 'Redis connection keepalive check', latency: '2ms', time: '6s ago', status: 'success' }
  ]);

  // Computed signal to calculate SVG line path (Width: 600, Height: 160)
  svgLinePath = computed(() => {
    const points = this.latencyPoints();
    const width = 600;
    const height = 160;
    const padding = 10;
    const maxVal = 160;
    const xStep = (width - padding * 2) / (points.length - 1);
    
    return points.map((p, index) => {
      const x = padding + index * xStep;
      // Latency scale: map 0-160ms onto height-padding
      const y = height - padding - (p / maxVal) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  });

  // Computed signal to calculate SVG area background path
  svgAreaPath = computed(() => {
    const linePath = this.svgLinePath();
    if (!linePath) return '';
    const width = 600;
    const height = 160;
    const padding = 10;
    const points = this.latencyPoints();
    const xStep = (width - padding * 2) / (points.length - 1);
    const lastX = padding + (points.length - 1) * xStep;
    
    return `${linePath} L ${lastX.toFixed(1)} ${height} L ${padding} ${height} Z`;
  });

  ngOnInit(): void {
    const services = ['Database', 'Auth-Service', 'Gateway-API', 'Cache-Manager', 'Storage-Client'];
    const messages = [
      'Query SELECT * FROM active_sessions',
      'Session signature handshake check',
      'GET /api/v3/metrics resolved',
      'Redis cluster master heartbeat ping',
      'Object store metadata validation check',
      'Query UPDATE user_profiles SET status = "Active"',
      'JWT decryption secret key validation'
    ];

    this.intervalId = setInterval(() => {
      // Generate new latency point with occasional spikes
      const isSpike = Math.random() > 0.85;
      const newLatency = isSpike 
        ? Math.floor(Math.random() * 60) + 100 // 100-160ms spike
        : Math.floor(Math.random() * 30) + 20;  // 20-50ms baseline
      
      this.latencyPoints.update(points => {
        return [...points.slice(1), newLatency];
      });

      // Prepend a new live log event matching the latency
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const logStatus = newLatency > 90 ? 'warning' : 'success';
      const newLog = {
        service: randomService,
        message: randomMessage,
        latency: `${newLatency}ms`,
        time: 'Just now',
        status: logStatus
      };

      this.liveLogs.update(logs => {
        const updated = [newLog, ...logs.map(l => {
          if (l.time === 'Just now') return { ...l, time: '2s ago' };
          if (l.time === '2s ago') return { ...l, time: '4s ago' };
          if (l.time === '4s ago') return { ...l, time: '6s ago' };
          return { ...l, time: '8s ago' };
        }).slice(0, 4)];
        return updated;
      });
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
