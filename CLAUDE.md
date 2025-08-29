# GoA Workspace Demo - Development Notes

This document captures important learnings and patterns from implementing the client management interface using the GoA Design System in Angular.

## Project Overview

**Current Implementation:** Comprehensive client management interface with advanced filtering, sorting, and action menus
- Tab-based filtering (All, To do, In progress, Complete)
- Search/filter with removable filter chips
- Sortable table columns (Status, Due date)
- Action popover menus with three options (Assign, Edit, Delete)
- Full GoA Design System compliance

## Key Technical Learnings

### GoA Web Components in Angular

**Critical Setup:**
- Use `CUSTOM_ELEMENTS_SCHEMA` in component to enable GoA web components
- GoA components work directly in Angular templates with `goa-` prefix
- Import: `import '@abgov/web-components'` (handled in main setup)

**Event Handling Patterns:**
- GoA components use `(_eventname)` syntax for custom events (underscore prefix)
- Standard DOM events use regular `(click)` syntax
- Examples:
  - `(_change)="handleInputChange($event)"` for goa-input
  - `(_click)="removeChip(chip)"` for goa-filter-chip
  - `(_sort)="handleSort($event)"` for goa-table sorting

### Table Sorting Implementation

**CRITICAL:** The table sorting pattern that actually works:

1. **Event binding:** `(_sort)="handleSort($event)"` on the `<goa-table>` element
2. **Header structure:** Just `<goa-table-sort-header name="columnName">Header Text</goa-table-sort-header>`
3. **Event data:** `{ sortBy: string, sortDir: number }` where sortDir is 1 (asc) or -1 (desc)
4. **Sort logic:** `(aValue > bValue ? 1 : -1) * sortDir`

**Common Mistakes to Avoid:**
- ❌ Putting event handlers on individual sort headers
- ❌ Using `(onSort)`, `(_onSort)`, or `(_onsort)` - correct is `(_sort)`
- ❌ Expecting direction strings - sort direction is numeric (1/-1)

### Component Property Validation

**Badge Component:**
- Valid types: `'information'`, `'success'`, `'important'`, `'emergency'`, `'dark'`, `'midtone'`, `'light'`
- ❌ INVALID: `'warning'` - will cause console warnings
- Always validate component props against MCP documentation

**Filter Chip Events:**
- Use `(_click)="removeChip(chip)"` not `(click)`
- Web components consistently use underscore prefix for custom events

### Input Event Handling

**GoA Input Components:**
```typescript
// Correct event structure handling
handleInputChange(event: any): void {
  const newValue = (event.detail?.value || event.target?.value || '').trim();
  this.inputValue = newValue;
}
```

**Pattern:** Always handle both `event.detail.value` and `event.target.value` for compatibility

### Popover Menu Implementation

**Structure that works:**
```html
<goa-popover position="below" maxwidth="150px" [padded]="false">
  <goa-icon-button icon="ellipsis-vertical" size="small" slot="target"></goa-icon-button>
  <div class="action-menu">
    <button class="action-item" (click)="action()">Action Text</button>
  </div>
</goa-popover>
```

**CSS for menu items:**
```css
.action-item {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: var(--goa-color-text-default);
  /* Ensures consistent typography with page */
}
```

## Data Patterns

### Tab-Based Filtering

**Implementation Pattern:**
```typescript
get filteredClients(): Client[] {
  // 1. Filter by active tab
  let tabFilteredClients = this.clients;
  if (this.activeTab !== 'all') {
    tabFilteredClients = this.clients.filter(client => client.category === this.activeTab);
  }

  // 2. Apply search filters
  let filteredData = this.getFilteredData(this.typedChips, tabFilteredClients);

  // 3. Apply sorting
  return this.getSortedData(filteredData);
}
```

**Tab Change Handling:**
- GoA tabs use 1-based indexing
- Map tab index to string values: `['all', 'todo', 'progress', 'complete'][tabIndex - 1]`

### Deep Object Search

**Recursive search pattern for filter chips:**
```typescript
checkNested(obj: object, chip: string): boolean {
  return Object.values(obj).some((value) =>
    typeof value === "object" && value !== null
      ? this.checkNested(value, chip)
      : typeof value === "string" && value.toLowerCase().includes(chip.toLowerCase())
  );
}
```

## Component Property Reference

### Table Component
- Width: `width="100%"` (component property, not CSS)
- Sort event: `(_sort)="handleSort($event)"`
- Sort headers: `name` attribute only, no event handlers

### Badge Component
- Valid types: `information`, `success`, `important`, `emergency`, `dark`, `midtone`, `light`
- Content: `[content]="text"` or `content="text"`

### Form Item & Input
- Input events: `(_change)="handler($event)"`
- Value binding: `[value]="property"`
- Error display: `[error]="errorMessage"`

### Popover Component
- Target slot: `slot="target"` on trigger element
- Positioning: `position="below"` (or "above", "auto")
- Padding control: `[padded]="false"` for clean menus

## Development Commands

```bash
# Start development server
npm start

# Access at http://localhost:4200
```

## Common Pitfalls

1. **Event naming:** Always check MCP docs for correct event names - GoA uses underscore prefix
2. **Component props:** Validate all properties against component documentation 
3. **TypeScript types:** Keep interfaces in sync with valid GoA component values
4. **CSS over-customization:** Use component properties instead of custom CSS when possible
5. **Icon components:** GoA icon syntax may differ from expectations - remove if causing spacing issues

## Future Enhancements

- [ ] Implement actual assign/edit/delete functionality
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement bulk actions with checkbox selection
- [ ] Add pagination for large datasets
- [ ] Consider adding export functionality

## MCP Integration

This project extensively uses the GoA Design System MCP for component documentation and patterns. Key resources:
- Component property validation
- Event handling patterns  
- Usage examples and best practices
- Accessibility compliance guidance

### MCP Feedback & Improvements Needed

Based on real implementation experience, these areas need updates in the MCP documentation:

#### Table Component Documentation Issues

**Missing Critical Information:**
- Table sorting example shows `(onSort)="handleSort($event)"` but actual implementation requires `(_sort)="handleSort($event)"`
- Documentation doesn't mention that sort event goes on the `<goa-table>` element, not individual headers
- Missing the critical detail that `sortDir` is numeric (1/-1) not string ('asc'/'desc')
- Angular example in MCP shows incorrect event binding syntax

**Recommendation:** Update table sorting examples to show:
```html
<!-- CORRECT (what actually works) -->
<goa-table (_sort)="handleSort($event)">
  <thead>
    <tr>
      <th><goa-table-sort-header name="column">Header</goa-table-sort-header></th>
    </tr>
  </thead>
</goa-table>
```

#### Badge Component Documentation

**Incorrect Valid Types:**
- Documentation states `'warning'` as valid badge type but this causes console warnings
- Should clarify that valid types are: `'information'`, `'success'`, `'important'`, `'emergency'`, `'dark'`, `'midtone'`, `'light'`

**Recommendation:** Remove `'warning'` from valid types list and examples

#### Event Handling Documentation

**Missing Universal Pattern:**
- Documentation doesn't consistently show that GoA web components use `(_eventname)` pattern
- Examples mix standard `(click)` with GoA `(_click)` without clear distinction
- Should document that web components use underscore prefix for custom events

**Recommendation:** Add section explaining:
- Standard DOM events: `(click)`, `(change)`, `(keypress)` 
- GoA custom events: `(_click)`, `(_change)`, `(_sort)`, etc.

#### Input Component Event Structure

**Missing Event Object Details:**
- Documentation doesn't show that input events may have value in `event.detail.value` OR `event.target.value`
- Examples assume one structure but real implementation needs to handle both

**Recommendation:** Show defensive event handling:
```typescript
handleInputChange(event: any): void {
  const value = event.detail?.value || event.target?.value || '';
}
```

#### Popover Component Angular Examples

**Missing Slot Syntax:**
- Angular examples show complex template reference patterns
- Web component slot syntax (`slot="target"`) works directly in Angular and is simpler
- Should show both approaches or prefer the simpler slot syntax

#### Filter Chip Component

**Missing Component Reference:**
- Filter chips are mentioned in examples but component details are not easily findable
- Should cross-reference to the actual filter-chip component documentation

#### Table Width Property

**Documentation Inconsistency:**
- Some examples show CSS `width: 100%` 
- Component actually has `width="100%"` property that should be preferred
- Should clarify when to use component properties vs CSS

#### Missing Framework-Specific Event Patterns

**Angular-Specific Guidance Needed:**
- Should document that Angular with CUSTOM_ELEMENTS_SCHEMA allows direct web component usage
- Web component events work directly without complex template references
- This is simpler than some Angular wrapper examples shown

**Recommendation:** Add section on "Direct Web Component Usage in Angular" showing the simpler patterns that actually work in practice.

#### Source Code Cross-Reference

**Missing Implementation Details:**
- When documentation is unclear, developers need to reference source code
- Should document where to find web component source (e.g., `ui-components/libs/web-components/src/components/`)
- Example: Table.svelte shows the actual `_sort` event name on line 112

**Recommendation:** Add "When in doubt, check the source" section with file paths for each component.

## Mobile Navigation Patterns - Session 3 Learnings

### Mobile Menu Implementation with GoA Components

**Issue:** Need to implement mobile-responsive side menu that hides on mobile and shows hamburger menu button
**Solution Pattern:**
```css
/* Desktop side menu */
goa-side-menu {
  min-width: 180px;
  background: white;
  border-right: 1px solid #ddd;
  height: 100vh;
}

/* Mobile overlay menu */
@media (max-width: 768px) {
  goa-side-menu.side-menu {
    position: fixed;
    top: 0;
    left: -180px; /* Hidden by default */
    width: 180px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  goa-side-menu.side-menu.mobile-menu-open {
    left: 0; /* Show when open */
  }
}
```

**Key Learning:** Use fixed positioning with negative left offset to hide menu off-screen, then transition to `left: 0` when open.

### Mobile Menu Button Integration

**Working Pattern:**
```html
<div class="page-title">
  <goa-icon-button 
    icon="menu" 
    size="medium"
    variant="dark"
    class="mobile-menu-button"
    (click)="toggleMobileMenu()">
  </goa-icon-button>
  <goa-text tag="h1" size="heading-xl" mt="m">My clients</goa-text>
</div>
```

**CSS for proper alignment:**
```css
.mobile-menu-button {
  display: none; /* Hidden on desktop */
}

@media (max-width: 768px) {
  .mobile-menu-button {
    display: block !important;
  }
}
```

**Key Learning:** Use `variant="dark"` for better contrast, and adjust text margins rather than button margins for alignment.

### Mobile Menu Overlay Pattern

**Complete Implementation:**
```html
<!-- Mobile menu overlay -->
@if (showMobileMenu) {
  <div class="mobile-menu-overlay" (click)="toggleMobileMenu()"></div>
}
```

```css
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999; /* Below menu but above content */
}
```

**Key Learning:** Overlay should be below the menu (z-index: 999 vs 1000) and clicking it should close the menu.

### GoA Side Menu Component Usage

**Correct Interactive Pattern:**
```html
<goa-side-menu>
  <goa-spacer vspacing="m"></goa-spacer>
  <a href="/search">Search</a>
  <a href="/clients">My clients</a>
  <a href="/workflow">Workflow</a>
  <goa-spacer vspacing="m"></goa-spacer>
</goa-side-menu>
```

**Critical Mistake to Avoid:**
- ❌ `<goa-side-menu-heading>` for interactive items (these are non-interactive section headers)
- ✅ Use plain `<a>` elements for clickable navigation items

**Icon Limitations:**
- Current GoA side menu doesn't support icons on basic anchor links
- Icons only available on `goa-side-menu-heading` (non-interactive) and `goa-side-menu-group` components
- Don't try to wrap anchor links in `goa-link` components within side menu

### Responsive Breakpoint Strategy

**GoA Design System Official Breakpoints:**
- **Small**: `<624px` (mobile)
- **Medium**: `624px–1024px` (tablet)
- **Large**: `>1024px` (desktop)

**Implementation Pattern:**
```css
/* Stack buttons at smallest GoA breakpoint */
@media (max-width: 624px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Mobile menu at tablet/mobile boundary */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: block !important;
  }
}
```

**Key Learning:** Use GoA official breakpoints (624px) for layout changes, existing patterns for menu behavior.

### Advanced Responsive Layout Patterns

**Complex Tab/Search Layout:**
```html
<!-- HTML Order for proper stacking -->
<div class="tabs-and-search">
  <goa-tabs>...</goa-tabs>  <!-- First in HTML -->
  <goa-form-item>
    <goa-input width="100%">...</goa-input>  <!-- Component property for width -->
  </goa-form-item>
</div>
```

```css
.tabs-and-search {
  display: flex;
  justify-content: space-between; /* Side-by-side on wide screens */
}

@media (max-width: 1326px) {
  .tabs-and-search {
    flex-direction: column-reverse; /* Reverses HTML order when stacked */
    gap: 1rem;
  }
  
  .tabs-and-search goa-form-item,
  .tabs-and-search goa-block {
    width: 100%;
  }
  
  .tabs-and-search goa-input {
    flex: 1; /* Grow to fill available space */
  }
}
```

**Key Pattern:** Use `column-reverse` to achieve desired stacking order while maintaining logical HTML order.

### Component Property vs CSS Approach

**Best Practice Learned:**
1. **Always try component properties first** before CSS overrides
2. **GoA components have width properties** - use `width="100%"` on `goa-input`
3. **Combine approaches when needed** - component property + CSS flex for optimal results

**Working Pattern:**
```html
<goa-input width="100%" ...>  <!-- Component property -->
```
```css
.tabs-and-search goa-input {
  flex: 1;  /* CSS for flexbox behavior */
}
```

**Key Learning:** Component properties work better than CSS overrides with `!important`. Always check component API first.

### Mobile Navigation State Management

**Angular Implementation:**
```typescript
export class ClientsComponent {
  showMobileMenu = false;

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
```

**Template Conditional Logic:**
```html
[class.mobile-menu-open]="showMobileMenu"  <!-- CSS class binding -->
@if (showMobileMenu) { ... }  <!-- Angular control flow -->
```

**Key Learning:** Use Angular's control flow syntax (`@if`) for conditional elements, class binding for CSS state.

### Side Menu Width Optimization

**User Feedback Process:**
- Original: 240px → too wide
- Reduced to: 140px → too narrow  
- Adjusted to: 200px → still too wide
- Final: 180px → optimal balance

**Key Learning:** Iterative adjustment based on user feedback. 180px provides good balance between usability and space efficiency.

### Visual Alignment and Spacing

**Text Alignment Pattern:**
```html
<goa-text tag="h1" size="heading-xl" mt="m">My clients</goa-text>
```

**Key Learning:** 
- Adjust text margins (`mt="m"`) rather than button margins for alignment
- Use GoA spacing tokens (`m` = 16px) for consistent spacing
- Remove custom margins once proper component spacing is applied

## Responsive Design Patterns - Session 2 Learnings

### Table Horizontal Scrolling Implementation

**Issue:** Tables bleeding off the page horizontally instead of scrolling
**Solution Pattern:**
```css
.main-content {
  min-width: 0; /* CRITICAL: Allow flex item to shrink below content size */
  overflow-x: hidden;
}

.table-container {
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

goa-table {
  min-width: 800px; /* Force scrolling when needed */
}
```

**Key Learning:** The `min-width: 0` on flex containers is essential to prevent content bleeding.

### Mobile Layout Patterns

**Side Menu Responsive Behavior:**
```css
@media (max-width: 768px) {
  .workspace-container {
    flex-direction: column;
    min-height: auto;
  }
  
  goa-side-menu {
    height: auto !important; /* Override 100vh on mobile */
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}
```

**Critical Pattern:** Always override fixed heights on mobile and add appropriate borders for visual separation.

### Flex Layout Stacking Issues

**Problem:** CSS `order` properties don't work reliably with GoA web components
**Solution:** Change HTML order instead of relying on CSS order

**Working Pattern:**
```html
<!-- Put search first in HTML for proper stacking -->
<div class="tabs-and-search">
  <goa-form-item><!-- Search --></goa-form-item>
  <goa-tabs><!-- Tabs --></goa-tabs>
</div>
```

```css
.tabs-and-search {
  display: flex;
  justify-content: space-between; /* Side-by-side on wide screens */
}

@media (max-width: 900px) {
  .tabs-and-search {
    flex-direction: column; /* Stack on narrow screens */
  }
}
```

**Key Learning:** HTML order is more reliable than CSS order properties with GoA components.

### GoA Popover Complex State Management

**Issue:** GoA popovers auto-close on click, making complex interactions difficult
**Learning:** Don't try to fight the popover's natural behavior with complex state management

**Better Approach:** Use simple modal or drawer for complex interactions instead of trying to keep popovers open with custom state logic.

### Responsive Breakpoint Strategy

**Flexible Approach:** Use content-aware breakpoints rather than device-specific ones
- Use `900px` for search/tabs stacking (based on actual content width needed)
- Use `768px` for mobile layout changes (side menu, padding adjustments)

**Pattern:** Multiple breakpoints for different UI concerns rather than one "mobile" breakpoint.

### Container Constraint Patterns

**Essential Pattern for Preventing Bleeding:**
```css
.container {
  min-width: 0; /* On flex items */
  overflow-x: hidden; /* On parent containers */
}

.scrollable-content {
  overflow-x: auto; /* On immediate content wrapper */
  max-width: 100%; /* Respect parent bounds */
}
```

**Key Learning:** Layer these properties correctly - hidden on parents, auto on content, min-width on flex items.