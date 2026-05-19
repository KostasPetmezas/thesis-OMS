import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {authConfig} from "./config/auth.config";

import {provideAuth, authInterceptor} from "angular-auth-oidc-client";


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),

    // 👇 2. ADD () TO EXECUTE THE BUILT-IN INTERCEPTOR 👇
    provideHttpClient(withInterceptors([authInterceptor()])),

    provideAuth(authConfig),
  ]
};
