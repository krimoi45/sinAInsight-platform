import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Routes publiques (sans authentification)
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Routes protégées (nécessite authentification)
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
        title: 'Tableau de bord - SinAInsight'
      },
      {
        path: 'scenarios',
        loadChildren: () => import('./features/scenarios/scenarios.routes').then(m => m.SCENARIOS_ROUTES),
        title: 'Scénarios - SinAInsight'
      },
      {
        path: 'monitoring',
        loadChildren: () => import('./features/monitoring/monitoring.routes').then(m => m.MONITORING_ROUTES),
        title: 'Monitoring - SinAInsight'
      },
      {
        path: 'alerts',
        loadChildren: () => import('./features/alerts/alerts.routes').then(m => m.ALERTS_ROUTES),
        title: 'Alertes - SinAInsight'
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        title: 'Administration - SinAInsight'
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account/account.component').then(c => c.AccountComponent),
        title: 'Mon Compte - SinAInsight'
      }
    ]
  },
  
  // Route par défaut (page non trouvée)
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent),
    title: 'Page non trouvée - SinAInsight'
  }
];