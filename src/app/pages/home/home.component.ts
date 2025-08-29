import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterLink } from '@angular/router';

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <goa-one-column-layout>
      <section slot="header">
        <goa-microsite-header type="live"></goa-microsite-header>
        <goa-app-header heading="Workspace Sandbox" url="/"> </goa-app-header>
      </section>

      <goa-page-block width="704px">
        <goa-text tag="h1" size="heading-xl">
          Welcome to GoA Workspace Demo
        </goa-text>

        <goa-text size="body-l" mb="l">
          This is your sandbox for building with GoA Design System components.
        </goa-text>

        <goa-text tag="h2" size="heading-l" mt="xl"> Getting Started </goa-text>

        <goa-text size="body-m">
          Start by creating new pages in the
          <code>src/app/pages/</code> directory and adding routes in
          <code>app.routes.ts</code>.
        </goa-text>

        <goa-block mt="xl">
          <goa-button type="primary" (click)="handleClick()">
            Example Button
          </goa-button>
          <goa-link routerLink="/clients" ml="m">
            View Clients Database →
          </goa-link>
        </goa-block>

        <goa-callout type="information" heading="Ready to Build" mt="xl">
          All GoA web components are available for use. Check the
          <a href="https://design.alberta.ca/components" target="_blank">
            component documentation
          </a>
          for details.
        </goa-callout>
      </goa-page-block>

      <section slot="footer">
        <goa-app-footer max-content-width="100%"> </goa-app-footer>
      </section>
    </goa-one-column-layout>
  `,
  styles: [
    `
      code {
        background: #f4f4f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }
    `,
  ],
})
export class HomeComponent {
  handleClick(): void {
    console.log("Button clicked!");
    alert("GoA Button clicked! Check the console.");
  }
}
