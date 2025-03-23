import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';

import { CoreLayoutComponent } from './core/layouts/core-layout/core-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { LoaderService } from './core/services/loader.service';
import { AuthService } from './core/services/auth.service';
import { selectIsLoggedIn } from './store/auth/auth.selectors';
import { authActions } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatProgressBarModule,
    CoreLayoutComponent,
    AuthLayoutComponent
  ],
  template: `
    <mat-progress-bar
      *ngIf="showLoader"
      mode="indeterminate"
      color="accent"
      class="global-loader">
    </mat-progress-bar>

    <ng-container *ngIf="isLoggedIn$ | async; else authLayout">
      <app-core-layout></app-core-layout>
    </ng-container>
    
    <ng-template #authLayout>
      <app-auth-layout></app-auth-layout>
    </ng-template>
  `,
  styles: [`
    .global-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
  `]
})
export class AppComponent implements OnInit {
  showLoader = false;
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  constructor(
    private loaderService: LoaderService,
    private authService: AuthService,
    private store: Store
  ) {}

  ngOnInit(): void {
    // Observer pour le loader global
    this.loaderService.isLoading$.subscribe(isLoading => {
      this.showLoader = isLoading;
    });

    // Vérifier si l'utilisateur est déjà connecté (token en localStorage)
    const token = this.authService.getToken();
    if (token) {
      this.store.dispatch(authActions.checkAuthStatus());
    }
  }
}