import { Component, inject, OnInit } from '@angular/core';
import {
  OidcSecurityService,
  PublicEventsService, // <-- NEW IMPORT
  EventTypes           // <-- NEW IMPORT
} from "angular-auth-oidc-client";
import { RouterModule } from "@angular/router";
import { HeaderComponent } from "./shared/header/header.component";
import { filter } from 'rxjs/operators'; // <-- NEW IMPORT

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'microservices-shop-frontend';

  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly eventService = inject(PublicEventsService); // <-- NEW INJECTION

  ngOnInit(): void {
    this.oidcSecurityService
      .checkAuth()
      .subscribe(({isAuthenticated}) => {
        console.log('app authenticated', isAuthenticated);
      });

    //event listener for the time-out
    this.eventService
      .registerForEvents()
      .pipe(filter((notification) => notification.type === EventTypes.TokenExpired))
      .subscribe(() => {

        // Display the pop-up
        alert('Time out! Your session has expired due to inactivity. Please log in again.');

        // Force the app to clear out the expired token and send them back to login
        this.oidcSecurityService.logoff();
      });
  }
}
