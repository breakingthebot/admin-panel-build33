// src/app/components/settings/settings.ts
// Settings configuration controller permitting system-wide feature toggle mutations.
// Created: 2026-07-19

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  enableMfa = signal(true);
  enablePerformanceLogs = signal(false);
  maintenanceMode = signal(false);
  sessionTimeout = signal(30);
  apiKey = signal('pk_live_51M7Ew...redacted');

  constructor(public authService: AuthService) {
    const cachedMfa = localStorage.getItem('@admin_panel/mfa');
    const cachedPerf = localStorage.getItem('@admin_panel/perf');
    const cachedMaint = localStorage.getItem('@admin_panel/maint');
    const cachedTimeout = localStorage.getItem('@admin_panel/timeout');

    if (cachedMfa !== null) this.enableMfa.set(cachedMfa === 'true');
    if (cachedPerf !== null) this.enablePerformanceLogs.set(cachedPerf === 'true');
    if (cachedMaint !== null) this.maintenanceMode.set(cachedMaint === 'true');
    if (cachedTimeout !== null) this.sessionTimeout.set(Number(cachedTimeout));
  }

  saveConfig(): void {
    if (!this.authService.isAdmin()) {
      alert('Access Denied: Only Administrators can modify settings.');
      return;
    }
    
    localStorage.setItem('@admin_panel/mfa', String(this.enableMfa()));
    localStorage.setItem('@admin_panel/perf', String(this.enablePerformanceLogs()));
    localStorage.setItem('@admin_panel/maint', String(this.maintenanceMode()));
    localStorage.setItem('@admin_panel/timeout', String(this.sessionTimeout()));

    alert('Success: System configuration parameters updated successfully!');
  }
}
