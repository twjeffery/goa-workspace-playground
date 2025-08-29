import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Client {
  id: string;
  name: string;
  staff: string;
  dueDate: string;
  fileNumber: string;
  status: 'information' | 'success' | 'important' | 'emergency';
  statusText: string;
  priority: 'high' | 'medium' | 'low';
  jurisdiction: string;
  category: 'todo' | 'progress' | 'complete';
  selected: boolean;
}

@Component({
  selector: 'app-clients',
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
          <a href="/workflow">Workflow</a>
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
                <goa-text tag="h1" size="heading-xl" mt="none" mb="none">My clients</goa-text>
              </div>
              <div class="header-actions">
                <goa-button type="secondary">More</goa-button>
                <goa-button type="primary">Add application</goa-button>
              </div>
            </div>

            <!-- Tabs and Search Bar -->
            <div class="tabs-and-search">
              <goa-tabs initialtab="1" (_change)="onTabChange($event)">
                <goa-tab heading="All">
                  <!-- Content handled by filteredClients -->
                </goa-tab>
                <goa-tab heading="To do">
                  <!-- Content handled by filteredClients -->
                </goa-tab>
                <goa-tab heading="In progress">
                  <!-- Content handled by filteredClients -->
                </goa-tab>
                <goa-tab heading="Complete">
                  <!-- Content handled by filteredClients -->
                </goa-tab>
              </goa-tabs>

              <goa-form-item id="filterChipInput" [error]="inputError">
                <goa-block gap="xs" [direction]="isMobileView ? 'column' : 'row'" alignment="start">
                  <goa-input
                    name="filterChipInput"
                    aria-labelledby="filterChipInput"
                    [value]="inputValue"
                    maxlength="100"
                    size="large"
                    leadingicon="search"
                    width="100%"
                    (_change)="handleInputChange($event)"
                    (keypress)="handleInputKeyPress($event)">
                  </goa-input>
                  <goa-button
                    type="secondary"
                    (click)="applyFilter()"
                    leadingicon="filter">
                    Filter
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

            <!-- Data Table -->
            <div class="table-container">
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
                  <th>
                    <goa-table-sort-header name="dueDate">
                      Due date
                    </goa-table-sort-header>
                  </th>
                  <th>
                    <goa-table-sort-header name="jurisdiction">
                      Jurisdiction
                    </goa-table-sort-header>
                  </th>
                  <th>File number</th>
                  <th>
                    <goa-table-sort-header name="priority">
                      Priority
                    </goa-table-sort-header>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (client of filteredClients; track client.id) {
                  <tr>
                    <td>
                      <goa-checkbox 
                        [name]="'select-' + client.id"
                        [(value)]="client.selected">
                      </goa-checkbox>
                    </td>
                    <td>
                      <goa-badge [type]="client.status" [content]="client.statusText"></goa-badge>
                    </td>
                    <td>
                      <goa-link (click)="navigateToClient(client.id)">{{ client.name }}</goa-link>
                    </td>
                    <td>
                      {{ client.dueDate }}
                    </td>
                    <td>
                      {{ client.jurisdiction }}
                    </td>
                    <td>
                      {{ client.fileNumber }}
                    </td>
                    <td>
                      <goa-badge 
                        [type]="client.priority === 'high' ? 'important' : client.priority === 'medium' ? 'information' : 'midtone'" 
                        [content]="client.priority === 'high' ? 'High' : client.priority === 'medium' ? 'Medium' : 'Low'">
                      </goa-badge>
                    </td>
                    <td>
                      <goa-popover position="below" maxwidth="150px" [padded]="false">
                        <goa-icon-button 
                          icon="ellipsis-vertical" 
                          size="small"
                          slot="target">
                        </goa-icon-button>
                        <div class="action-menu">
                          <button class="action-item" (click)="assignClient(client.id)">
                            Assign
                          </button>
                          <button class="action-item" (click)="editClient(client.id)">
                            Edit
                          </button>
                          <button class="action-item action-danger" (click)="deleteClient(client.id)">
                            Delete
                          </button>
                        </div>
                      </goa-popover>
                    </td>
                  </tr>
                }
              </tbody>
              </goa-table>
            </div>

            @if (filteredClients.length === 0 && clients.length > 0) {
              <goa-block mt="l" mb="l">
                No results found
              </goa-block>
            }
          </goa-page-block>
        </main>
      </div>
    </goa-one-column-layout>

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal) {
      <goa-modal 
        heading="Delete client record" 
        [open]="showDeleteModal"
        (_close)="cancelDelete()">
        <goa-text tag="p" mt="none" mb="none">
          Are you sure you want to delete this client record? This action cannot be undone.
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

    <!-- Edit Client Drawer -->
    <goa-drawer 
      heading="Edit client"
      [open]="showEditDrawer"
      position="right"
      (_close)="cancelEdit()">
      <div class="edit-form">
        <goa-form-item label="First Name" mb="l">
          <goa-input 
            type="text"
            [value]="editForm.firstName"
            (_change)="updateEditForm('firstName', $event)">
          </goa-input>
        </goa-form-item>

        <goa-form-item label="Last Name" mb="l">
          <goa-input 
            type="text"
            [value]="editForm.lastName"
            (_change)="updateEditForm('lastName', $event)">
          </goa-input>
        </goa-form-item>

        <goa-form-item label="Staff" mb="l">
          <goa-dropdown 
            [value]="editForm.staff"
            (_change)="updateEditForm('staff', $event)">
            <goa-dropdown-item value="Frederick Spinka" label="Frederick Spinka"></goa-dropdown-item>
            <goa-dropdown-item value="Michael Chen" label="Michael Chen"></goa-dropdown-item>
            <goa-dropdown-item value="Emily Rodriguez" label="Emily Rodriguez"></goa-dropdown-item>
            <goa-dropdown-item value="James Parker" label="James Parker"></goa-dropdown-item>
            <goa-dropdown-item value="Anna Martinez" label="Anna Martinez"></goa-dropdown-item>
            <goa-dropdown-item value="Daniel Lee" label="Daniel Lee"></goa-dropdown-item>
            <goa-dropdown-item value="Sophie Thompson" label="Sophie Thompson"></goa-dropdown-item>
            <goa-dropdown-item value="Ryan Williams" label="Ryan Williams"></goa-dropdown-item>
            <goa-dropdown-item value="Sarah Johnson" label="Sarah Johnson"></goa-dropdown-item>
            <goa-dropdown-item value="Mark Davis" label="Mark Davis"></goa-dropdown-item>
          </goa-dropdown>
        </goa-form-item>

        <goa-form-item label="Due Date" mb="l">
          <goa-input 
            type="text"
            [value]="editForm.dueDate"
            (_change)="updateEditForm('dueDate', $event)">
          </goa-input>
        </goa-form-item>

        <goa-form-item label="Status" mb="l">
          <goa-dropdown 
            [value]="editForm.status"
            (_change)="updateEditForm('status', $event)">
            <goa-dropdown-item value="information" label="Information"></goa-dropdown-item>
            <goa-dropdown-item value="success" label="Success"></goa-dropdown-item>
            <goa-dropdown-item value="important" label="Important"></goa-dropdown-item>
            <goa-dropdown-item value="emergency" label="Emergency"></goa-dropdown-item>
          </goa-dropdown>
        </goa-form-item>

        <goa-form-item label="Status Text" mb="xl">
          <goa-input 
            type="text"
            [value]="editForm.statusText"
            (_change)="updateEditForm('statusText', $event)">
          </goa-input>
        </goa-form-item>

        <goa-button-group alignment="end">
          <goa-button type="tertiary" (click)="cancelEdit()">
            Cancel
          </goa-button>
          <goa-button type="primary" (click)="saveEdit()">
            Save changes
          </goa-button>
        </goa-button-group>
      </div>
    </goa-drawer>
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
      min-width: 0; /* Allow flex item to shrink below its content size */
      overflow-x: hidden; /* Prevent bleeding */
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .tabs-and-search {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 1.5rem 0 0 0;
      gap: 64px;
      flex-wrap: wrap;
    }

    .tabs-and-search goa-form-item {
      flex: 1;
      min-width: 200px;
    }

    .tabs-and-search goa-block {
      width: 100%;
    }

    .tabs-and-search goa-input {
      flex: 1;
      width: 100% !important;
    }

    /* Stack header buttons on smallest screens */
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

    /* Stack search above tabs when space is tight */
    @media (max-width: 1326px) {
      .tabs-and-search {
        flex-direction: column-reverse;
        gap: 1rem;
      }

      .tabs-and-search goa-tabs {
        width: 100%;
      }
      
      .tabs-and-search goa-form-item {
        width: 100%;
        flex: none;
      }

      .tabs-and-search goa-block {
        width: 100%;
        flex: none;
      }

      .tabs-and-search goa-input {
        flex: 1;
      }
    }

    /* Responsive design for smaller screens */
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
        overflow-x: hidden;
        width: 100%; /* Take full width since side menu is hidden */
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
        min-width: 800px;
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

      .mobile-menu-button {
        display: block !important;
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

    /* Only apply overflow on mobile when table needs to scroll */
    @media (max-width: 900px) {
      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    goa-table {
      background: white;
      border-radius: 8px;
      min-width: 800px; /* Minimum width to ensure columns don't get too squished */
    }

    /* Zebra striping for better scannability - start on first row */
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

    .filter-label {
      margin-top: 8px;
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


    goa-table th:nth-child(1) { /* Checkbox column */
      width: 60px;
    }

    goa-table th:nth-child(2) { /* Status column */
      width: 140px;
    }

    goa-table th:nth-child(3) { /* Name column */
      width: auto; /* Let this expand */
    }

    goa-table th:nth-child(4) { /* Due date column */
      width: 140px;
    }

    goa-table th:nth-child(5) { /* Jurisdiction column */
      width: 140px;
    }

    goa-table th:nth-child(6) { /* File number column */
      width: 140px;
    }

    goa-table th:nth-child(7) { /* Priority column */
      width: 100px;
    }

    goa-table th:nth-child(8) { /* Actions column */
      width: 60px;
    }
  `]
})
export class ClientsComponent implements OnInit {
  activeTab = 'all';
  allSelected = false;
  
  // Mobile menu functionality
  showMobileMenu = false;
  isMobileView = false;

  constructor(private router: Router) {}
  
  // Filter chip functionality
  inputValue = '';
  inputError = '';
  typedChips: string[] = [];
  readonly errorEmpty = 'Empty filter';
  readonly errorDuplicate = 'Enter a unique filter';

  // Sorting functionality
  sortConfig = { key: '', direction: 'none' as 'asc' | 'desc' | 'none' };

  // Modal functionality
  showDeleteModal = false;
  clientToDelete: string | null = null;

  // Drawer functionality
  showEditDrawer = false;
  clientToEdit: Client | null = null;
  editForm = {
    firstName: '',
    lastName: '',
    staff: '',
    dueDate: '',
    status: '' as 'information' | 'success' | 'important' | 'emergency',
    statusText: '',
    priority: '' as 'high' | 'medium' | 'low',
    jurisdiction: ''
  };


  clients: Client[] = [
    {
      id: '1',
      name: 'Gilbert Barton',
      staff: 'Edna Mode',
      dueDate: 'Mar 16, 2024',
      fileNumber: '1234567890',
      status: 'important',
      statusText: 'Review needed',
      priority: 'high',
      jurisdiction: 'Calgary',
      category: 'todo',
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
      priority: 'medium',
      jurisdiction: 'Edmonton',
      category: 'progress',
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
      priority: 'low',
      jurisdiction: 'Red Deer',
      category: 'complete',
      selected: false
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      staff: 'Edna Mode',
      dueDate: 'Feb 25, 2024',
      fileNumber: '4567890123',
      status: 'emergency',
      statusText: 'Urgent',
      priority: 'high',
      jurisdiction: 'Lethbridge',
      category: 'todo',
      selected: false
    },
    {
      id: '5',
      name: 'Robert Taylor',
      staff: 'Edna Mode',
      dueDate: 'Dec 18, 2024',
      fileNumber: '5678901234',
      status: 'information',
      statusText: 'Processing',
      priority: 'medium',
      jurisdiction: 'Medicine Hat',
      category: 'progress',
      selected: false
    },
    {
      id: '6',
      name: 'Jennifer Brown',
      staff: 'Edna Mode',
      dueDate: 'Aug 12, 2024',
      fileNumber: '6789012345',
      status: 'success',
      statusText: 'Approved',
      priority: 'low',
      jurisdiction: 'Fort McMurray',
      category: 'complete',
      selected: false
    },
    {
      id: '7',
      name: 'Mark Davis',
      staff: 'Edna Mode',
      dueDate: 'Oct 22, 2024',
      fileNumber: '7890123456',
      status: 'important',
      statusText: 'Pending docs',
      priority: 'high',
      jurisdiction: 'Grande Prairie',
      category: 'todo',
      selected: false
    },
    {
      id: '8',
      name: 'Amanda Clark',
      staff: 'Edna Mode',
      dueDate: 'Apr 14, 2024',
      fileNumber: '8901234567',
      status: 'information',
      statusText: 'Under review',
      priority: 'low',
      jurisdiction: 'Airdrie',
      category: 'progress',
      selected: false
    }
  ];

  get filteredClients(): Client[] {
    // First filter by active tab
    let tabFilteredClients = this.clients;
    if (this.activeTab !== 'all') {
      tabFilteredClients = this.clients.filter(client => client.category === this.activeTab);
    }

    // Then apply filter chips using the same logic as the example
    let filteredData = this.getFilteredData(this.typedChips, tabFilteredClients);

    // Finally apply sorting
    return this.getSortedData(filteredData);
  }

  getFilteredData(typedChips: string[], data: Client[] = this.clients): Client[] {
    if (typedChips.length === 0) {
      return data;
    }
    return data.filter((item) =>
      typedChips.every((chip) => this.checkNested(item, chip))
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log('Active tab changed to:', tab);
  }

  onTabChange(event: any): void {
    const tabIndex = event.detail?.tab || event.tab;
    const tabMap = ['all', 'todo', 'progress', 'complete'];
    this.activeTab = tabMap[tabIndex - 1] || 'all'; // Convert 1-based index to tab name
    console.log('Tab changed to:', this.activeTab, 'from index:', tabIndex);
  }

  assignClient(clientId: string): void {
    console.log('Assign client:', clientId);
    // Implement assign logic here
  }

  editClient(clientId: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      this.clientToEdit = client;
      const nameParts = client.name.split(' ');
      this.editForm = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        staff: client.staff,
        dueDate: client.dueDate,
        status: client.status,
        statusText: client.statusText,
        priority: client.priority,
        jurisdiction: client.jurisdiction
      };
      this.showEditDrawer = true;
    }
  }

  updateEditForm(field: string, event: any): void {
    const value = event.detail?.value || event.target?.value || '';
    (this.editForm as any)[field] = value;
  }

  cancelEdit(): void {
    this.showEditDrawer = false;
    this.clientToEdit = null;
    this.editForm = {
      firstName: '',
      lastName: '',
      staff: '',
      dueDate: '',
      status: 'information',
      statusText: '',
      priority: 'medium',
      jurisdiction: ''
    };
  }

  saveEdit(): void {
    if (this.clientToEdit) {
      const clientIndex = this.clients.findIndex(c => c.id === this.clientToEdit!.id);
      if (clientIndex !== -1) {
        const fullName = `${this.editForm.firstName} ${this.editForm.lastName}`.trim();
        this.clients[clientIndex] = {
          ...this.clients[clientIndex],
          name: fullName,
          staff: this.editForm.staff,
          dueDate: this.editForm.dueDate,
          status: this.editForm.status,
          statusText: this.editForm.statusText,
          priority: this.editForm.priority,
          jurisdiction: this.editForm.jurisdiction
        };
      }
    }
    this.cancelEdit();
  }

  deleteClient(clientId: string): void {
    this.clientToDelete = clientId;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  confirmDelete(): void {
    if (this.clientToDelete) {
      this.clients = this.clients.filter(client => client.id !== this.clientToDelete);
      console.log('Deleted client:', this.clientToDelete);
    }
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  // Match the example's method names and logic exactly
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

  getSortedData(data: Client[]): Client[] {
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

      // Handle string sorting for status and other fields
      return (aValue > bValue ? 1 : -1) * sortDir;
    });
  }

  getSortDirection(column: string): 'asc' | 'desc' | 'none' {
    return this.sortConfig.key === column ? this.sortConfig.direction : 'none';
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

  navigateToClient(clientId: string): void {
    this.router.navigate(['/clients', clientId]);
  }
}