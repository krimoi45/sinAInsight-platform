import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromAuth from './auth/auth.reducer';
import * as fromResource from './resource/resource.reducer';
import * as fromAlert from './alert/alert.reducer';
import * as fromScenario from './scenario/scenario.reducer';

export interface AppState {
  auth: fromAuth.State;
  resource: fromResource.State;
  alert: fromAlert.State;
  scenario: fromScenario.State;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.reducer,
  resource: fromResource.reducer,
  alert: fromAlert.reducer,
  scenario: fromScenario.reducer
};

export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];