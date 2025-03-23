import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './auth.reducer';

export const selectAuthState = createFeatureSelector<State>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state) => state.isLoggedIn
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsAdmin = createSelector(
  selectUser,
  (user) => user?.role === 'admin'
);

export const selectUserName = createSelector(
  selectUser,
  (user) => user?.name || ''
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email || ''
);

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id || ''
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role || ''
);