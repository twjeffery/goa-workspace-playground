# GoA Workspace Demo

A sandbox Angular application for building and testing with GoA Design System components. This is a clean starting point for creating demos, prototypes, and exploring new patterns with the Government of Alberta Design System.

## Live Demo

**[View Live Demo](https://main--goa-workspace-playground.netlify.app/)**

## Purpose

This workspace serves as:
- **A sandbox environment** - Start from scratch and build freely
- **A demo application** - Test GoA components and create new patterns
- **A collaboration space** - Share work with team members via GitHub
- **An extension platform** - Build on top of GoA Design System components

## Core Principles

1. **GoA Design System First** - All UI starts with GoA web components
2. **Build and Extend** - Use GoA components as building blocks, extend as needed
3. **Clean Slate** - Minimal setup, maximum flexibility
4. **Team Sharing** - Easy to share and collaborate through Git

## Tech Stack

- **Angular 18** - Modern standalone components approach
- **GoA Web Components** - Direct usage of `<goa-*>` elements
- **TypeScript** - Type-safe development
- **Angular Router** - For multi-page navigation

## Project Structure

```
workspace-demo/
├── src/
│   ├── app/
│   │   ├── pages/          # Your demo pages go here
│   │   ├── components/     # Shared components
│   │   ├── layouts/        # Layout components (side nav, etc.)
│   │   └── app.component.ts
│   ├── styles.scss         # Global styles
│   └── main.ts
├── angular.json
├── package.json
└── README.md
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Visit http://localhost:4200
```

## Using GoA Components

This sandbox uses GoA web components directly:

```html
<!-- Example: Using GoA components in Angular templates -->
<goa-button type="primary" (click)="handleClick()">
  Click Me
</goa-button>

<goa-input 
  name="demo" 
  [(value)]="inputValue"
  [error]="showError">
</goa-input>

<goa-modal 
  [open]="modalOpen"
  heading="Demo Modal">
  Modal content here
</goa-modal>
```

## Adding New Pages

1. Create a new component in `src/app/pages/`
2. Add routing in `app.routes.ts`
3. Add navigation link (will be in side menu)

## Extending GoA Components

When GoA components don't meet specific needs:
1. Start with the GoA component
2. Wrap or extend as needed
3. Document the extension pattern
4. Share with the team for feedback

## Collaboration

- Push your demos to branches
- Share via pull requests
- Document patterns you discover
- Pull in work from teammates (like Vanessa's data table demos)

## Future Enhancements

- [ ] Side navigation menu
- [ ] Demo page templates
- [ ] Component playground area
- [ ] Pattern documentation
- [ ] Testing utilities

## Resources

- [GoA Design System](https://design.alberta.ca/)
- [Web Components Documentation](https://design.alberta.ca/components)
- [Angular Documentation](https://angular.io/)

## License

Government of Alberta