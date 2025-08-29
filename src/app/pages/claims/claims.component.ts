import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <goa-one-column-layout>
      <div class="workspace-container">
        <!-- Mobile menu overlay -->
        @if (showMobileMenu) {
          <div class="mobile-menu-overlay" (click)="toggleMobileMenu()"></div>
        }
        
        <!-- Sidebar Navigation -->
        <goa-side-menu class="side-menu" [class.mobile-menu-open]="showMobileMenu">
          <goa-spacer vspacing="m"></goa-spacer>
          <a href="/search">Search</a>
          <a href="/clients">My clients</a>
          <a href="/claims">Claims</a>
          <goa-spacer vspacing="m"></goa-spacer>
        </goa-side-menu>

        <!-- Main Content -->
        <main class="main-content">
          <goa-page-block width="100%">
            <!-- Header with Actions -->
            <div class="page-header">
              <div class="page-title">
                <goa-icon-button 
                  icon="menu" 
                  size="large"
                  variant="dark"
                  class="mobile-menu-button"
                  (click)="toggleMobileMenu()">
                </goa-icon-button>
                <goa-text tag="h1" size="heading-xl" mt="none" mb="none">Claims</goa-text>
              </div>
              <div class="header-actions">
                <goa-button type="primary" leadingicon="add">Start new claim</goa-button>
              </div>
            </div>

            <!-- Empty State Card -->
            <div class="empty-state-card">
              <div class="empty-state-content">
                <div class="empty-state-icon">
                  <goa-icon type="add" size="xlarge" theme="outline"></goa-icon>
                </div>
                <goa-text size="body-m" mt="m" mb="s">You haven't added any claims yet</goa-text>
                <goa-button type="tertiary">Start a new claim submission</goa-button>
              </div>
            </div>
          </goa-page-block>
        </main>
      </div>
    </goa-one-column-layout>
  `,
  styles: [`
    .workspace-container {
      display: flex;
      min-height: 100vh;
      height: 100vh;
    }

    goa-side-menu {
      min-width: 180px;
      background: white;
      border-right: 1px solid #ddd;
      height: 100vh;
      flex-shrink: 0;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background: white;
      min-width: 0;
      overflow-x: hidden;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-button {
      display: none;
      margin-top: 8px;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .empty-state-card {
      background: white;
      border-radius: 8px;
      padding: 4rem 2rem;
      text-align: center;
      border: 1px solid #e5e5e5;
    }

    .empty-state-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-state-icon {
      margin-bottom: 1.5rem;
      opacity: 0.6;
      display: flex;
      justify-content: center;
    }

    .empty-state-icon goa-icon {
      background-color: #E3EFFA;
      border-radius: 50%;
      padding: 1.75rem;
      width: 6rem;
      height: 6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6A94C5;
    }

    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    @media (max-width: 624px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    @media (max-width: 768px) {
      .mobile-menu-button {
        display: block !important;
      }

      goa-side-menu.side-menu {
        position: fixed;
        top: 0;
        left: -180px;
        width: 180px;
        height: 100vh;
        z-index: 1000;
        transition: left 0.3s ease;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      }

      goa-side-menu.side-menu.mobile-menu-open {
        left: 0;
      }
    }
  `]
})
export class ClaimsComponent {
  showMobileMenu = false;

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}