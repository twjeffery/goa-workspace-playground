import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface SearchResult {
  id: string;
  name: string;
  staff: string;
  dueDate: string;
  fileNumber: string;
  status: 'information' | 'success' | 'important' | 'emergency';
  statusText: string;
  type: 'client' | 'application' | 'document';
  selected: boolean;
}

@Component({
  selector: 'app-search',
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
                <goa-text tag="h1" size="heading-xl" mt="none" mb="none">Search</goa-text>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="search-section">
              <goa-form-item id="searchInput" [error]="inputError">
                <goa-block gap="xs" [direction]="isMobileView ? 'column' : 'row'" alignment="start">
                  <goa-input
                    name="searchInput"
                    aria-labelledby="searchInput"
                    [value]="inputValue"
                    maxlength="100"
                    size="large"
                    leadingicon="search"
                    width="100%"
                    placeholder="Search clients, applications, documents..."
                    (_change)="handleInputChange($event)"
                    (keypress)="handleInputKeyPress($event)">
                  </goa-input>
                  <goa-button
                    type="secondary"
                    (click)="applyFilter()"
                    leadingicon="search">
                    Search
                  </goa-button>
                </goa-block>
              </goa-form-item>
            </div>

            <!-- Active Filter Chips -->
            @if (typedChips.length > 0) {
              <div class="filter-chips-container">
                @for (typedChip of typedChips; track typedChip) {
                  <goa-filter-chip
                    [content]="typedChip"
                    (_click)="removeTypedChip(typedChip)">
                  </goa-filter-chip>
                }
                <goa-button type="tertiary" size="compact" (click)="removeAllTypedChips()">
                  Clear all
                </goa-button>
              </div>
            }

            <!-- Results Count -->
            @if (typedChips.length > 0) {
              <div class="results-info">
                <goa-text size="body-s" mt="none" mb="m">
                  {{ filteredResults.length }} results found
                </goa-text>
              </div>
            }

            <!-- Data Table -->
            <div class="table-container">
              <div class="table-scroll-wrapper">
                <goa-table width="100%" (_sort)="handleSort($event)">
              <thead>
                <tr>
                  <th>
                    <goa-checkbox 
                      name="selectAll"
                      [(value)]="allSelected">
                    </goa-checkbox>
                  </th>
                  <th>
                    <goa-table-sort-header name="status">
                      Status
                    </goa-table-sort-header>
                  </th>
                  <th>Name</th>
                  <th>Staff</th>
                  <th>
                    <goa-table-sort-header name="dueDate">
                      Due date
                    </goa-table-sort-header>
                  </th>
                  <th>File number</th>
                  <th>
                    <goa-table-sort-header name="type">
                      Type
                    </goa-table-sort-header>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (result of filteredResults; track result.id) {
                  <tr>
                    <td>
                      <goa-checkbox 
                        [name]="'select-' + result.id"
                        [(value)]="result.selected">
                      </goa-checkbox>
                    </td>
                    <td>
                      <goa-badge [type]="result.status" [content]="result.statusText"></goa-badge>
                    </td>
                    <td>
                      <goa-link (click)="navigateToResult(result)">{{ result.name }}</goa-link>
                    </td>
                    <td>
                      {{ result.staff }}
                    </td>
                    <td>
                      {{ result.dueDate }}
                    </td>
                    <td>
                      {{ result.fileNumber }}
                    </td>
                    <td>
                      <goa-badge 
                        [type]="result.type === 'client' ? 'information' : result.type === 'application' ? 'success' : 'midtone'" 
                        [content]="result.type === 'client' ? 'Client' : result.type === 'application' ? 'Application' : 'Document'">
                      </goa-badge>
                    </td>
                    <td class="actions-cell">
                      <div class="custom-dropdown" [class.open]="openDropdownId === result.id" [attr.data-result-id]="result.id">
                        <goa-icon-button 
                          icon="ellipsis-vertical" 
                          size="small"
                          (click)="toggleDropdown(result.id, $event)">
                        </goa-icon-button>
                        @if (openDropdownId === result.id) {
                          <div class="dropdown-menu">
                            <button class="action-item" (click)="assignResult(result.id)">
                              Assign
                            </button>
                            <button class="action-item" (click)="editResult(result.id)">
                              Edit
                            </button>
                            <button class="action-item action-danger" (click)="deleteResult(result.id)">
                              Delete
                            </button>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
              </goa-table>
              </div>
            </div>

            @if (filteredResults.length === 0 && searchResults.length > 0) {
              <goa-block mt="l" mb="l">
                No results found for your search criteria
              </goa-block>
            }

            @if (searchResults.length === 0 && typedChips.length === 0) {
              <goa-block mt="l" mb="l" alignment="center">
                <goa-text size="body-m" mt="none" mb="s">Start typing to search across all records</goa-text>
                <goa-text size="body-s" mt="none" mb="none">Search clients, applications, documents, and more</goa-text>
              </goa-block>
            }
          </goa-page-block>
        </main>
      </div>
    </goa-one-column-layout>
    
    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal) {
      <goa-modal 
        heading="Delete search result" 
        [open]="showDeleteModal"
        (_close)="cancelDelete()">
        <goa-text tag="p" mt="none" mb="none">
          Are you sure you want to delete this search result? This action cannot be undone.
        </goa-text>
        <goa-button-group slot="actions" alignment="end">
          <goa-button type="tertiary" (click)="cancelDelete()">
            Cancel
          </goa-button>
          <goa-button type="primary" variant="destructive" (click)="confirmDelete()">
            Delete
          </goa-button>
        </goa-button-group>
      </goa-modal>
    }
  `,
  styles: [`
    .workspace-container {
      display: flex;
      min-height: 100vh;
      height: 100vh;
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
    }

    .search-section {
      margin-bottom: 1.5rem;
    }

    .search-section goa-form-item {
      width: 100%;
    }

    .search-section goa-block {
      width: 100%;
    }

    .search-section goa-input {
      flex: 1;
      width: 100% !important;
    }

    .results-info {
      margin-bottom: 1rem;
    }

    /* Mobile responsive design */
    @media (max-width: 624px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
        overflow-x: hidden;
        width: 100%;
      }
      
      .workspace-container {
        min-height: auto;
        overflow-x: hidden;
      }

      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        max-width: calc(100vw - 2rem);
      }
      
      goa-table {
        min-width: 600px; /* Slightly wider due to Type column */
      }
    }

    goa-side-menu {
      min-width: 180px;
      background: white;
      border-right: 1px solid #ddd;
      height: 100vh;
      flex-shrink: 0;
    }

    /* Mobile menu overlay styles */
    @media (max-width: 768px) {
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

      .mobile-menu-button {
        display: block !important;
        margin-top: 8px;
      }

      .workspace-container {
        position: relative;
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
    }

    .table-container {
      margin-bottom: 1rem;
      width: 100%;
      max-width: 100%;
      position: relative;
    }

    .table-scroll-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }

    /* Ensure icon buttons have lower z-index than dropdown */
    .table-scroll-wrapper goa-icon-button,
    goa-table goa-icon-button {
      z-index: 1 !important;
    }

    goa-table {
      background: white;
      border-radius: 8px;
      min-width: 600px;
    }

    /* Zebra striping for better scannability */
    goa-table tbody tr:nth-child(odd) {
      background-color: #F8F8F8;
    }

    /* Adjust badge vertical alignment */
    goa-table tbody td goa-badge {
      vertical-align: middle;
      margin-top: -16px;
    }

    .filter-chips-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .action-menu {
      display: flex;
      flex-direction: column;
      min-width: 120px;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: var(--goa-color-text-default);
      border-bottom: 1px solid #f0f0f0;
    }

    .action-item:last-child {
      border-bottom: none;
    }

    .action-item:hover {
      background-color: #f8f9fa;
    }
    
    .action-item.action-danger {
      color: #d73502;
    }
    
    .action-item.action-danger:hover {
      background-color: #fef2f0;
    }

    /* Table column widths */
    goa-table th:nth-child(1) { /* Checkbox column */
      width: 60px;
    }

    goa-table th:nth-child(2) { /* Status column */
      width: 140px;
    }

    goa-table th:nth-child(3), /* Name column */
    goa-table th:nth-child(4) { /* Staff column */
      width: auto;
    }

    goa-table th:nth-child(5) { /* Due date column */
      width: 140px;
    }

    goa-table th:nth-child(6) { /* File number column */
      width: 140px;
    }

    goa-table th:nth-child(7) { /* Type column */
      width: 120px;
    }

    goa-table th:nth-child(8) { /* Actions column */
      width: 60px;
    }
    
    /* Custom dropdown menu that renders outside table flow */
    .actions-cell {
      position: relative;
    }
    
    .custom-dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-menu {
      position: fixed;
      z-index: 10000;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      min-width: 120px;
      max-width: 150px;
      width: max-content;
      /* Hide initially - JavaScript will position it */
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }
    
    .dropdown-menu.positioned {
      opacity: 1;
      pointer-events: auto;
    }
    
    .action-menu,
    .dropdown-menu {
      display: flex;
      flex-direction: column;
      min-width: 120px;
    }
  `]
})
export class SearchComponent implements OnInit {
  allSelected = false;
  
  // Mobile menu functionality
  showMobileMenu = false;
  isMobileView = false;
  
  // Custom dropdown menu functionality
  openDropdownId: string | null = null;
  
  // Modal functionality
  showDeleteModal = false;
  resultToDelete: string | null = null;

  constructor(private router: Router) {}
  
  // Filter chip functionality
  inputValue = '';
  inputError = '';
  typedChips: string[] = [];
  readonly errorEmpty = 'Empty filter';
  readonly errorDuplicate = 'Enter a unique filter';

  // Sorting functionality
  sortConfig = { key: '', direction: 'none' as 'asc' | 'desc' | 'none' };

  // System-wide search results (all records across the organization)
  searchResults: SearchResult[] = [
    // Clients assigned to Edna Mode (current user's clients)
    {
      id: '1',
      name: 'Gilbert Barton',
      staff: 'Edna Mode',
      dueDate: 'Mar 16, 2024',
      fileNumber: '1234567890',
      status: 'important',
      statusText: 'Review needed',
      type: 'client',
      selected: false
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      staff: 'Edna Mode',
      dueDate: 'Sep 20, 2024',
      fileNumber: '2345678901',
      status: 'information',
      statusText: 'In progress',
      type: 'client',
      selected: false
    },
    {
      id: '3',
      name: 'David Wilson',
      staff: 'Edna Mode',
      dueDate: 'Nov 10, 2024',
      fileNumber: '3456789012',
      status: 'success',
      statusText: 'Completed',
      type: 'client',
      selected: false
    },
    // Clients assigned to other staff
    {
      id: '20',
      name: 'Michael Thompson',
      staff: 'Emily Rodriguez',
      dueDate: 'Jan 15, 2024',
      fileNumber: '9876543210',
      status: 'information',
      statusText: 'Processing',
      type: 'client',
      selected: false
    },
    {
      id: '21',
      name: 'Jessica Martinez',
      staff: 'Daniel Lee',
      dueDate: 'Mar 20, 2024',
      fileNumber: '8765432109',
      status: 'success',
      statusText: 'Approved',
      type: 'client',
      selected: false
    },
    {
      id: '22',
      name: 'Robert Chen',
      staff: 'Anna Martinez',
      dueDate: 'May 18, 2024',
      fileNumber: '7654321098',
      status: 'important',
      statusText: 'Documentation required',
      type: 'client',
      selected: false
    },
    // Applications across the system
    {
      id: '10',
      name: 'Application #4521 - Commercial License',
      staff: 'Michael Chen',
      dueDate: 'Sep 20, 2024',
      fileNumber: 'APP4521',
      status: 'information',
      statusText: 'In progress',
      type: 'application',
      selected: false
    },
    {
      id: '11',
      name: 'Application #4522 - Residential Permit',
      staff: 'Anna Martinez',
      dueDate: 'Dec 18, 2024',
      fileNumber: 'APP4522',
      status: 'information',
      statusText: 'Processing',
      type: 'application',
      selected: false
    },
    {
      id: '12',
      name: 'Application #4523 - Industrial Zoning',
      staff: 'James Parker',
      dueDate: 'Nov 25, 2024',
      fileNumber: 'APP4523',
      status: 'emergency',
      statusText: 'Expedited review',
      type: 'application',
      selected: false
    },
    {
      id: '13',
      name: 'Application #4524 - Food Service License',
      staff: 'Sophie Thompson',
      dueDate: 'Oct 30, 2024',
      fileNumber: 'APP4524',
      status: 'success',
      statusText: 'Approved',
      type: 'application',
      selected: false
    },
    // Documents and templates
    {
      id: '30',
      name: 'Environmental Impact Report',
      staff: 'James Parker',
      dueDate: 'Feb 25, 2024',
      fileNumber: 'DOC789',
      status: 'emergency',
      statusText: 'Urgent review',
      type: 'document',
      selected: false
    },
    {
      id: '31',
      name: 'Compliance Checklist Template',
      staff: 'Sophie Thompson',
      dueDate: 'Oct 22, 2024',
      fileNumber: 'DOC101',
      status: 'important',
      statusText: 'Needs update',
      type: 'document',
      selected: false
    },
    {
      id: '32',
      name: 'Safety Protocol Guidelines',
      staff: 'Ryan Williams',
      dueDate: 'Jul 12, 2024',
      fileNumber: 'DOC202',
      status: 'success',
      statusText: 'Published',
      type: 'document',
      selected: false
    },
    {
      id: '33',
      name: 'Annual Audit Report 2024',
      staff: 'Michael Chen',
      dueDate: 'Dec 31, 2024',
      fileNumber: 'DOC303',
      status: 'information',
      statusText: 'In preparation',
      type: 'document',
      selected: false
    },
    {
      id: '34',
      name: 'Policy Update - Remote Work',
      staff: 'Emily Rodriguez',
      dueDate: 'Aug 15, 2024',
      fileNumber: 'DOC404',
      status: 'important',
      statusText: 'Review required',
      type: 'document',
      selected: false
    }
  ];

  get filteredResults(): SearchResult[] {
    // Apply filter chips
    let filteredData = this.getFilteredData(this.typedChips, this.searchResults);

    // Apply sorting
    return this.getSortedData(filteredData);
  }

  getFilteredData(typedChips: string[], data: SearchResult[] = this.searchResults): SearchResult[] {
    if (typedChips.length === 0) {
      return data;
    }
    return data.filter((item) =>
      typedChips.every((chip) => this.checkNested(item, chip))
    );
  }

  checkNested(obj: object, chip: string): boolean {
    return Object.values(obj).some((value) =>
      typeof value === "object" && value !== null
        ? this.checkNested(value, chip)
        : typeof value === "string" && value.toLowerCase().includes(chip.toLowerCase())
    );
  }

  handleInputChange(event: any): void {
    const newValue = (event.detail?.value || event.target?.value || '').trim();
    this.inputValue = newValue;
  }

  handleInputKeyPress(event: any): void {
    const key = event.detail?.key || event.key;
    if (key === "Enter") {
      this.applyFilter();
    }
  }

  applyFilter() {
    const trimmedValue = this.inputValue.trim();
    
    if (trimmedValue === "") {
      this.inputError = this.errorEmpty;
      return;
    }
    if (this.typedChips.includes(trimmedValue)) {
      this.inputError = this.errorDuplicate;
      return;
    }
    this.typedChips = [...this.typedChips, trimmedValue];
    this.inputValue = "";
    this.inputError = "";
  }

  removeTypedChip(chip: string) {
    this.typedChips = this.typedChips.filter((c) => c !== chip);
    this.inputError = "";
  }

  removeAllTypedChips() {
    this.typedChips = [];
    this.inputError = "";
  }

  getSortedData(data: SearchResult[]): SearchResult[] {
    if (this.sortConfig.direction === 'none' || !this.sortConfig.key) {
      return data;
    }

    const sortDir = this.sortConfig.direction === 'asc' ? 1 : -1;
    return [...data].sort((a: any, b: any) => {
      const aValue = a[this.sortConfig.key];
      const bValue = b[this.sortConfig.key];

      // Handle date sorting for dueDate
      if (this.sortConfig.key === 'dueDate') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return (aDate.getTime() > bDate.getTime() ? 1 : -1) * sortDir;
      }

      // Handle string sorting for other fields
      return (aValue > bValue ? 1 : -1) * sortDir;
    });
  }

  handleSort(event: any): void {
    const { sortBy, sortDir } = event.detail || event;
    this.sortConfig = { 
      key: sortBy, 
      direction: sortDir === 1 ? 'asc' : sortDir === -1 ? 'desc' : 'none' 
    };
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
  
  toggleDropdown(resultId: string, event?: MouseEvent): void {
    if (this.openDropdownId === resultId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = resultId;
      // Position the dropdown after it's rendered
      setTimeout(() => {
        const dropdown = document.querySelector(`[data-result-id="${resultId}"] .dropdown-menu`) as HTMLElement;
        if (dropdown && event) {
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          dropdown.style.top = `${rect.bottom + 4}px`;
          dropdown.style.left = `${rect.right - dropdown.offsetWidth}px`;
          dropdown.classList.add('positioned');
        }
      });
    }
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.openDropdownId = null;
    }
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 624;
  }

  navigateToResult(result: SearchResult): void {
    if (result.type === 'client') {
      this.router.navigate(['/clients', result.id]);
    } else if (result.type === 'application') {
      // Navigate to application detail page when implemented
      console.log('Navigate to application:', result.id);
    } else if (result.type === 'document') {
      // Navigate to document detail page when implemented
      console.log('Navigate to document:', result.id);
    }
  }

  viewResult(resultId: string): void {
    const result = this.searchResults.find(r => r.id === resultId);
    if (result) {
      this.navigateToResult(result);
    }
    this.openDropdownId = null; // Close dropdown
  }

  assignResult(resultId: string): void {
    console.log('Assign result:', resultId);
    this.openDropdownId = null; // Close dropdown
    // Implement assign logic here
  }

  editResult(resultId: string): void {
    console.log('Edit result:', resultId);
    this.openDropdownId = null; // Close dropdown
    // Implement edit logic here
  }
  
  deleteResult(resultId: string): void {
    this.resultToDelete = resultId;
    this.showDeleteModal = true;
    this.openDropdownId = null; // Close dropdown
  }
  
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.resultToDelete = null;
  }
  
  confirmDelete(): void {
    if (this.resultToDelete) {
      this.searchResults = this.searchResults.filter(result => result.id !== this.resultToDelete);
      console.log('Deleted result:', this.resultToDelete);
    }
    this.showDeleteModal = false;
    this.resultToDelete = null;
  }
}