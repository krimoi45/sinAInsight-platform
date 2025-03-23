import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '@app/core/services/auth.service';
import { authActions } from './auth.actions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.login),
    exhaustMap(({ request }) => this.authService.login(request).pipe(
      map(response => {
        // Stocker le token dans le localStorage
        this.authService.setToken(response.token);
        this.authService.setRefreshToken(response.refreshToken);
        
        // Retourner l'action de succès
        return authActions.loginSuccess({ user: response.user });
      }),
      catchError(error => of(authActions.loginFailure({ 
        error: error.error?.message || 'Erreur lors de la connexion' 
      })))
    ))
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.loginSuccess),
    tap(() => {
      this.snackBar.open('Connexion réussie', 'Fermer', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    })
  ), { dispatch: false });

  loginFailure$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.loginFailure),
    tap(({ error }) => {
      this.snackBar.open(error, 'Fermer', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    })
  ), { dispatch: false });

  register$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.register),
    exhaustMap(({ request }) => this.authService.register(request).pipe(
      map(response => {
        // Stocker le token dans le localStorage
        this.authService.setToken(response.token);
        this.authService.setRefreshToken(response.refreshToken);
        
        // Retourner l'action de succès
        return authActions.registerSuccess({ user: response.user });
      }),
      catchError(error => of(authActions.registerFailure({ 
        error: error.error?.message || 'Erreur lors de l\'inscription' 
      })))
    ))
  ));

  registerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.registerSuccess),
    tap(() => {
      this.snackBar.open('Inscription réussie', 'Fermer', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    })
  ), { dispatch: false });

  registerFailure$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.registerFailure),
    tap(({ error }) => {
      this.snackBar.open(error, 'Fermer', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    })
  ), { dispatch: false });

  checkAuthStatus$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.checkAuthStatus),
    switchMap(() => this.authService.getCurrentUser().pipe(
      map(user => authActions.checkAuthStatusSuccess({ user })),
      catchError(() => {
        // Supprimer les tokens si la vérification échoue
        this.authService.clearTokens();
        return of(authActions.checkAuthStatusFailure());
      })
    ))
  ));

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.logout),
    tap(() => {
      this.authService.clearTokens();
      return authActions.logoutSuccess();
    })
  ));

  logoutSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.logoutSuccess),
    tap(() => {
      this.snackBar.open('Déconnexion réussie', 'Fermer', { duration: 3000 });
      this.router.navigate(['/auth/login']);
    })
  ), { dispatch: false });

  updateProfile$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.updateProfile),
    exhaustMap(({ request }) => this.authService.updateProfile(request).pipe(
      map(user => authActions.updateProfileSuccess({ user })),
      catchError(error => of(authActions.updateProfileFailure({ 
        error: error.error?.message || 'Erreur lors de la mise à jour du profil' 
      })))
    ))
  ));

  updateProfileSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.updateProfileSuccess),
    tap(() => {
      this.snackBar.open('Profil mis à jour avec succès', 'Fermer', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    })
  ), { dispatch: false });

  updateProfileFailure$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.updateProfileFailure),
    tap(({ error }) => {
      this.snackBar.open(error, 'Fermer', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    })
  ), { dispatch: false });
}