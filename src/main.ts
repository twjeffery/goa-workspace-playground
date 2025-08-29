import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import GoA Web Components
import '@abgov/web-components';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));