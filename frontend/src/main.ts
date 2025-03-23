import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { reducers, metaReducers } from './app/store';
import { AuthEffects } from './app/store/auth/auth.effects';
import { ResourceEffects } from './app/store/resource/resource.effects';
import { AlertEffects } from './app/store/alert/alert.effects';

import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideRouter(routes, withComponentInputBinding()),
    provideStore(reducers, { metaReducers }),
    provideEffects([AuthEffects, ResourceEffects, AlertEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      connectInZone: true
    }),
    importProvidersFrom(HttpClientModule)
  ]
})
.catch(err => console.error(err));