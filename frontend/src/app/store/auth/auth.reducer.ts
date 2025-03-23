import { createReducer, on } from '@ngrx/store';
import { User } from '@app/core/models/user.model';
import { authActions } from './auth.actions';

export interface State {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialState: State = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  
  // Login
  on(authActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(authActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoggedIn: true,
    isLoading: false,
    error: null
  })),
  on(authActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Registration
  on(authActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(authActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoggedIn: true,
    isLoading: false,
    error: null
  })),
  on(authActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Check Auth Status
  on(authActions.checkAuthStatus, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(authActions.checkAuthStatusSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoggedIn: true,
    isLoading: false,
    error: null
  })),
  on(authActions.checkAuthStatusFailure, (state) => ({
    ...state,
    user: null,
    isLoggedIn: false,
    isLoading: false,
    error: null
  })),
  
  // Logout
  on(authActions.logout, (state) => ({
    ...state,
    isLoading: true
  })),
  on(authActions.logoutSuccess, () => ({
    ...initialState
  })),
  
  // Update User Profile
  on(authActions.updateProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(authActions.updateProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),
  on(authActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);