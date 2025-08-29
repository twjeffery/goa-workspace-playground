import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { GoabAccordion, GoabBadge } from '@abgov/angular-components';

interface Client {
  id: string;
  name: string;
  staff: string;
  dueDate: string;
  fileNumber: string;
  status: 'information' | 'success' | 'important' | 'emergency';
  statusText: string;
  category: 'todo' | 'progress' | 'complete';
}

interface ApplicationSection {
  id: string;
  title: string;
  status: 'complete' | 'incomplete' | 'pending';
  subtitle?: string;
  icon?: string;
}

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, GoabAccordion, GoabBadge],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <goa-one-column-layout>
      <div class="workspace-container">
        <!-- Mobile menu overlay -->
        @if (showMobileMenu) {
          <div class="mobile-menu-overlay" (click)="toggleMobileMenu()"></div>
        }
        
        <!-- Contextual Navigation for Client Record -->
        <goa-side-menu class="side-menu" [class.mobile-menu-open]="showMobileMenu">
          <goa-spacer vspacing="m"></goa-spacer>
          <a href="/clients">Back to all cases</a>
          <goa-spacer vspacing="s"></goa-spacer>
          <goa-side-menu-heading>Detail view</goa-side-menu-heading>
          <a href="/clients/{{clientId}}">Action plan</a>
          <a href="/clients/{{clientId}}/intake">Intake</a>
          <a href="/clients/{{clientId}}/personal">Personal</a>
          <a href="/clients/{{clientId}}/employment">Employment</a>
          <a href="/clients/{{clientId}}/education">Education</a>
          <a href="/clients/{{clientId}}/comments">Comments</a>
          <a href="/clients/{{clientId}}/reminders">Reminders</a>
          <goa-spacer vspacing="m"></goa-spacer>
        </goa-side-menu>

        <!-- Main Content -->
        <main class="main-content">
          <div class="detail-container">
        <!-- Header Section -->
        <div class="detail-header">
          <div class="header-content">
            <div class="title-section">
              <div class="title-row">
                <goa-icon-button 
                  icon="menu" 
                  size="large"
                  variant="dark"
                  class="mobile-menu-button"
                  (click)="toggleMobileMenu()">
                </goa-icon-button>
                <goa-text tag="h1" size="heading-xl" mt="xs" mb="none">{{ client?.name || 'Loading...' }}</goa-text>
                <div class="metadata">
                  <goa-badge type="emergency" content="Overdue"></goa-badge>
                  <goa-badge type="important" content="Approach with caution"></goa-badge>
                  <goa-block gap="xs" direction="row" alignment="center">
                    <goa-text size="body-m" mt="none" mb="none">{{ client?.fileNumber || '456 489 4894' }}</goa-text>
                    <goa-icon-button icon="copy" size="small" variant="color"></goa-icon-button>
                  </goa-block>
                </div>
              </div>
            </div>
            <goa-button-group alignment="end" gap="compact">
              <goa-button type="secondary" trailingicon="chevron-down" (click)="assignClient()">
                Assign
              </goa-button>
              <goa-button type="secondary" (_click)="openComments()">
                Comments
              </goa-button>
            </goa-button-group>
          </div>
        </div>

        <!-- Body Content -->
        <div class="detail-body">
          <!-- Tabs -->
          <goa-tabs initialtab="1" mb="l" (_change)="onTabChange($event)">
            <goa-tab heading="Current application">
              <!-- Main Content Area -->
              <div class="content-layout">
                <!-- Accordion List -->
                <div class="accordion-list">
                  <!-- Define the badge templates once, outside the loop -->
                  <ng-template #missingBadge>
                    <goab-badge type="important" content="Missing information"></goab-badge>
                  </ng-template>
                  <ng-template #completeBadge>
                    <goab-badge type="success" content="Complete"></goab-badge>
                  </ng-template>
                  <ng-template #noBadge>
                  </ng-template>
                  
                  @for (section of applicationSections; track section.id) {
                    <div class="accordion-wrapper" id="section-{{section.id}}">
                      <goab-accordion 
                        heading="{{section.title}}" 
                        [headingContent]="section.status === 'incomplete' ? missingBadge : (section.status === 'complete' ? completeBadge : noBadge)"
                        [open]="openSections[section.id] || section.id === 'primary'"
                        (onChange)="onAccordionChange(section.id, $event)">
                      
                      @if (section.id === 'primary') {
                        <goa-text mt="none"><strong>Full Name:</strong> Gilbert Barton</goa-text>
                        <goa-text><strong>Date of Birth:</strong> March 15, 1985</goa-text>
                        <goa-text><strong>Social Insurance Number:</strong> 123-456-789</goa-text>
                        <goa-text><strong>Phone:</strong> (403) 555-0123</goa-text>
                        <goa-text><strong>Email:</strong> gilbert.barton&#64;email.com</goa-text>
                        <goa-text mb="none"><strong>Preferred Language:</strong> English</goa-text>
                      } @else if (section.id === 'personal') {
                        <goa-text mt="none"><strong>Marital Status:</strong> Married</goa-text>
                        <goa-text><strong>Address:</strong> 1234 Main Street, Calgary, AB T2P 1J9</goa-text>
                        <goa-text><strong>Country of Birth:</strong> Canada</goa-text>
                        <goa-text><strong>Immigration Status:</strong> Canadian Citizen</goa-text>
                        <goa-text mb="none"><strong>Emergency Contact:</strong> Sarah Barton - (403) 555-0124</goa-text>
                      } @else if (section.id === 'spouse') {
                        <goa-text mt="none"><strong>Spouse Name:</strong> Sarah Michelle Barton</goa-text>
                        <goa-text><strong>Date of Birth:</strong> July 22, 1987</goa-text>
                        <goa-text><strong>Employment Status:</strong> Employed Full-time</goa-text>
                        <goa-text><strong>Annual Income:</strong> $65,000</goa-text>
                        <goa-text mb="none"><strong>Employer:</strong> Calgary Health Region</goa-text>
                      } @else if (section.id === 'dependant') {
                        <goa-text mt="none"><strong>Child 1:</strong> Emma Barton - Age 8</goa-text>
                        <goa-text><strong>Child 2:</strong> Liam Barton - Age 5</goa-text>
                        <goa-text><strong>Childcare Required:</strong> Yes - After school care needed</goa-text>
                        <goa-text><strong>Special Needs:</strong> Emma has Type 1 Diabetes</goa-text>
                        <goa-text mb="none"><strong>School District:</strong> Calgary Board of Education</goa-text>
                      } @else if (section.id === 'education') {
                        <goa-text mt="none"><strong>Highest Education:</strong> Bachelor of Business Administration</goa-text>
                        <goa-text><strong>Institution:</strong> University of Calgary</goa-text>
                        <goa-text><strong>Year Completed:</strong> 2007</goa-text>
                        <goa-text><strong>Additional Certifications:</strong> Project Management Professional (PMP)</goa-text>
                        <goa-text mb="none"><strong>Language Skills:</strong> English (Fluent), French (Conversational)</goa-text>
                      } @else if (section.id === 'employment') {
                        <goa-text mt="none"><strong>Current Employment:</strong> Unemployed (Laid off)</goa-text>
                        <goa-text><strong>Previous Position:</strong> Operations Manager</goa-text>
                        <goa-text><strong>Previous Employer:</strong> Alberta Energy Corp</goa-text>
                        <goa-text><strong>Years of Experience:</strong> 12 years in operations management</goa-text>
                        <goa-text><strong>Reason for Leaving:</strong> Company restructuring and layoffs</goa-text>
                        <goa-text mb="none"><strong>Last Day Worked:</strong> February 15, 2024</goa-text>
                      } @else if (section.id === 'health') {
                        <goa-text mt="none"><strong>Health Conditions:</strong> High blood pressure (controlled with medication)</goa-text>
                        <goa-text><strong>Medications:</strong> Lisinopril 10mg daily</goa-text>
                        <goa-text><strong>Physical Limitations:</strong> None that would affect employment</goa-text>
                        <goa-text><strong>Mental Health Support:</strong> Currently seeing counselor for job transition stress</goa-text>
                        <goa-text mb="none"><strong>Healthcare Provider:</strong> Dr. Jennifer Smith, Calgary Family Medicine</goa-text>
                      } @else if (section.id === 'needs') {
                        <goa-text mt="none"><strong>Primary Need:</strong> Employment assistance and job search support</goa-text>
                        <goa-text><strong>Training Interest:</strong> Digital marketing and social media management</goa-text>
                        <goa-text><strong>Transportation:</strong> Reliable vehicle, valid driver's license</goa-text>
                        <goa-text><strong>Childcare Needs:</strong> After school care for 2 children</goa-text>
                        <goa-text mb="none"><strong>Financial Assistance:</strong> Temporary income support during job search</goa-text>
                      } @else if (section.id === 'labour') {
                        <goa-text mt="none"><strong>Target Industries:</strong> Energy, Construction, Public Administration</goa-text>
                        <goa-text><strong>Preferred Locations:</strong> Calgary, Airdrie, Cochrane</goa-text>
                        <goa-text><strong>Salary Expectations:</strong> $70,000 - $85,000 annually</goa-text>
                        <goa-text><strong>Work Schedule:</strong> Full-time, Monday-Friday preferred</goa-text>
                        <goa-text mb="none"><strong>Skills Assessment:</strong> Strong leadership, budget management, process improvement</goa-text>
                      } @else if (section.id === 'decision') {
                        <goa-text mt="none"><strong>Application Status:</strong> Under Review</goa-text>
                        <goa-text><strong>Eligibility:</strong> Meets all primary criteria</goa-text>
                        <goa-text><strong>Recommended Services:</strong> Job search workshops, skills assessment, temporary financial support</goa-text>
                        <goa-text><strong>Case Worker:</strong> Frederick Spinka</goa-text>
                        <goa-text mb="none"><strong>Next Steps:</strong> Schedule intake appointment and skills assessment</goa-text>
                      } @else {
                        <goa-text mb="none">Section content for {{ section.title }}</goa-text>
                      }
                      </goab-accordion>
                    </div>
                  }
                </div>

                <!-- Progress Sidebar -->
                <div class="progress-sidebar">
                  <goa-container type="interactive">
                    <div class="progress-list">
                      @for (section of applicationSections; track section.id) {
                        <div class="progress-item" (click)="scrollToSection(section.id)">
                          <div class="status-indicator {{ section.status }}"></div>
                          <goa-text size="body-s" mt="none" mb="none">{{ section.title }}</goa-text>
                        </div>
                      }
                    </div>
                  </goa-container>
                </div>
              </div>
            </goa-tab>
            <goa-tab heading="Previous assessments (2)">
              <goa-container type="non-interactive">
                <goa-text>Previous assessments content would go here.</goa-text>
              </goa-container>
            </goa-tab>
          </goa-tabs>
        </div>
          </div>
        </main>
      </div>
    </goa-one-column-layout>
  `,
  styles: [`
    .workspace-container {
      display: flex;
      min-height: 100vh;
      height: 100vh;
      overflow-x: hidden;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background: white;
      min-width: 0;
      overflow-x: hidden;
      overflow-y: visible;
    }

    goa-side-menu {
      min-width: 180px;
      background: white;
      border-right: 1px solid #ddd;
      height: 100vh;
      margin: 0;
      padding: 0;
      position: relative;
      flex-shrink: 0;
    }

    .mobile-menu-button {
      display: none;
    }

    .back-link {
      font-weight: 500;
      color: #004f84;
      text-decoration: none;
      padding: 0.5rem 0;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    a.active {
      background-color: #f0f8ff;
      color: #004f84;
      font-weight: 500;
      padding: 0.5rem;
      margin: 0 -1rem;
      border-radius: 4px;
    }

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .detail-header {
      padding-bottom: 0;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 2rem;
    }

    .title-section {
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: baseline;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .metadata {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .detail-body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .content-layout {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      position: relative;
    }

    .accordion-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .progress-sidebar {
      width: 280px;
      flex-shrink: 0;
      position: sticky;
      top: 1rem;
      align-self: flex-start;
      height: fit-content;
      z-index: 10;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-indicator.complete {
      background-color: var(--goa-color-success-default, #006f4c);
    }

    .status-indicator.incomplete {
      background-color: var(--goa-color-warning-dark, #bf8d23);
    }

    .status-indicator.pending {
      background-color: var(--goa-color-greyscale-200, #e7e7e7);
      border: 1px solid var(--goa-color-greyscale-black, #474747);
    }

    .progress-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      margin: 0 -8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .progress-item:hover {
      background-color: var(--goa-color-greyscale-100, #f1f1f1);
    }

    @media (max-width: 1024px) {
      .content-layout {
        flex-direction: column;
      }

      .accordion-list {
        flex: none;
        width: 100%;
      }

      .progress-sidebar {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
        overflow-x: hidden;
        width: 100%; /* Take full width since side menu is hidden */
      }
      
      .workspace-container {
        min-height: auto;
        overflow-x: hidden;
        position: relative;
      }

      goa-side-menu.side-menu {
        position: fixed;
        top: 0;
        left: -260px; /* Hidden by default */
        width: 260px;
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
        margin-top: 16px;
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

      .detail-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .title-row {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
      }

      .metadata {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  clientId: string = '';
  activeTab = 'current';
  activeSection = 'action-plan'; // Default to action plan section
  showMobileMenu = false;
  openSections: { [key: string]: boolean } = {};
  
  applicationSections: ApplicationSection[] = [
    { id: 'primary', title: 'Primary applicant', status: 'complete' },
    { id: 'personal', title: 'Personal', status: 'incomplete', subtitle: 'Missing information' },
    { id: 'spouse', title: 'Spouse/Partner', status: 'incomplete', subtitle: 'Missing information' },
    { id: 'dependant', title: 'Dependant', status: 'incomplete', subtitle: 'Missing information' },
    { id: 'education', title: 'Education', status: 'incomplete', subtitle: 'Missing information' },
    { id: 'employment', title: 'Employment', status: 'incomplete', subtitle: 'Missing information' },
    { id: 'health', title: 'Health', status: 'pending' },
    { id: 'needs', title: 'Identified needs', status: 'pending' },
    { id: 'labour', title: 'Labour market', status: 'pending' },
    { id: 'decision', title: 'Decision', status: 'pending' }
  ];
  
  getSectionHeading(section: ApplicationSection): string {
    return section.title + (section.status === 'incomplete' ? ' ⚠️' : '');
  }

  // Sample data - in a real app this would come from a service
  private clients: Client[] = [
    {
      id: '1',
      name: 'Gilbert Barton',
      staff: 'Frederick Spinka',
      dueDate: 'Mar 16, 2024',
      fileNumber: '1234567890',
      status: 'important',
      statusText: 'Review needed',
      category: 'todo'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      staff: 'Michael Chen',
      dueDate: 'Sep 20, 2024',
      fileNumber: '2345678901',
      status: 'information',
      statusText: 'In progress',
      category: 'progress'
    },
    {
      id: '3',
      name: 'David Wilson',
      staff: 'Emily Rodriguez',
      dueDate: 'Nov 10, 2024',
      fileNumber: '3456789012',
      status: 'success',
      statusText: 'Completed',
      category: 'complete'
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      staff: 'James Parker',
      dueDate: 'Feb 25, 2024',
      fileNumber: '4567890123',
      status: 'emergency',
      statusText: 'Urgent',
      category: 'todo'
    },
    {
      id: '5',
      name: 'Robert Taylor',
      staff: 'Anna Martinez',
      dueDate: 'Dec 18, 2024',
      fileNumber: '5678901234',
      status: 'information',
      statusText: 'Processing',
      category: 'progress'
    },
    {
      id: '6',
      name: 'Jennifer Brown',
      staff: 'Daniel Lee',
      dueDate: 'Aug 12, 2024',
      fileNumber: '6789012345',
      status: 'success',
      statusText: 'Approved',
      category: 'complete'
    },
    {
      id: '7',
      name: 'Mark Davis',
      staff: 'Sophie Thompson',
      dueDate: 'Oct 22, 2024',
      fileNumber: '7890123456',
      status: 'important',
      statusText: 'Pending docs',
      category: 'todo'
    },
    {
      id: '8',
      name: 'Amanda Clark',
      staff: 'Ryan Williams',
      dueDate: 'Apr 14, 2024',
      fileNumber: '8901234567',
      status: 'information',
      statusText: 'Under review',
      category: 'progress'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Get client ID from route params
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      this.loadClient();
    });
  }

  loadClient(): void {
    // In a real app, this would be an API call
    this.client = this.clients.find(c => c.id === this.clientId) || null;
  }

  getCategoryLabel(category?: string): string {
    switch(category) {
      case 'todo': return 'To do';
      case 'progress': return 'In progress';
      case 'complete': return 'Complete';
      default: return '-';
    }
  }

  goBack(): void {
    this.location.back();
  }

  editClient(): void {
    console.log('Edit client:', this.clientId);
    // Navigate to edit page or open edit modal
  }

  assignClient(): void {
    console.log('Assign client:', this.clientId);
    // Implement assign logic
  }

  deleteClient(): void {
    console.log('Delete client:', this.clientId);
    // Implement delete logic with confirmation
  }

  onTabChange(event: any): void {
    const tabIndex = event.detail?.tab || event.tab;
    this.activeTab = tabIndex === 1 ? 'current' : 'previous';
    console.log('Tab changed to:', this.activeTab);
  }

  openComments(): void {
    console.log('Open comments for client:', this.clientId);
    // Implement comments functionality
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  onAccordionChange(sectionId: string, isOpen: boolean): void {
    this.openSections[sectionId] = isOpen;
  }

  scrollToSection(sectionId: string): void {
    // First, open the accordion
    this.openSections[sectionId] = true;
    
    // Then scroll to it with a small delay
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to allow accordion to open
  }
}