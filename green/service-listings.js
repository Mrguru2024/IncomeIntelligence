/**
 * Service Listings Module
 * Enables service providers to list their services and users to find local services
 */

// Constants for service categories
export const SERVICE_CATEGORIES = [
  { id: "locksmith", name: "Locksmith", icon: "key" },
  { id: "plumber", name: "Plumber", icon: "droplet" },
  { id: "electrician", name: "Electrician", icon: "zap" },
  { id: "handyman", name: "Handyman", icon: "tool" },
  { id: "carpenter", name: "Carpenter", icon: "hammer" },
  { id: "painter", name: "Painter", icon: "brush" },
  { id: "landscaper", name: "Landscaper", icon: "tree" },
  { id: "hvac", name: "HVAC Technician", icon: "thermometer" },
  { id: "cleaner", name: "Cleaning Service", icon: "sprayCan" },
  { id: "tutor", name: "Tutor", icon: "bookOpen" },
  { id: "designer", name: "Designer", icon: "penTool" },
  { id: "developer", name: "Developer", icon: "code" },
  { id: "writer", name: "Writer", icon: "penSquare" },
  { id: "photographer", name: "Photographer", icon: "camera" },
  { id: "accountant", name: "Accountant", icon: "calculator" },
  { id: "consultant", name: "Consultant", icon: "briefcase" },
  { id: "personal_trainer", name: "Personal Trainer", icon: "activity" },
  { id: "pet_care", name: "Pet Care", icon: "paw" },
  { id: "other", name: "Other Service", icon: "moreHorizontal" }
];

// Helper function to get icon for a category
export function getCategoryIcon(categoryId) {
  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.icon : "moreHorizontal";
}

// Helper function to get category name
export function getCategoryName(categoryId) {
  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.name : "Other Service";
}

/**
 * Service Provider Listing Management
 * Renders the interface for service providers to create and manage their service listings
 */
export function renderServiceListingManager(container, appState) {
  // Clear the container
  container.innerHTML = '';
  
  // Create the manager container
  const managerContainer = document.createElement('div');
  managerContainer.className = 'service-listing-manager';
  managerContainer.style.maxWidth = '1200px';
  managerContainer.style.margin = '0 auto';
  managerContainer.style.padding = '20px';
  
  // Header
  const header = document.createElement('div');
  header.style.marginBottom = '32px';
  
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = 'My Service Listings';
  headerTitle.style.marginBottom = '8px';
  header.appendChild(headerTitle);
  
  const headerDescription = document.createElement('p');
  headerDescription.textContent = 'Create and manage your service listings to help clients find you.';
  headerDescription.style.color = '#666';
  header.appendChild(headerDescription);
  
  managerContainer.appendChild(header);
  
  // Main content area with tabs
  const contentArea = document.createElement('div');
  contentArea.className = 'content-area';
  
  // Tabs navigation
  const tabsNav = document.createElement('div');
  tabsNav.className = 'tabs-nav';
  tabsNav.style.display = 'flex';
  tabsNav.style.borderBottom = '1px solid #eee';
  tabsNav.style.marginBottom = '24px';
  
  const tabs = [
    { id: 'my-listings', label: 'My Listings' },
    { id: 'create-listing', label: 'Create New Listing' },
    { id: 'inquiries', label: 'Inquiries' },
    { id: 'analytics', label: 'Analytics' }
  ];
  
  tabs.forEach(tab => {
    const tabElement = document.createElement('button');
    tabElement.dataset.tabId = tab.id;
    tabElement.textContent = tab.label;
    tabElement.style.padding = '12px 16px';
    tabElement.style.backgroundColor = 'transparent';
    tabElement.style.border = 'none';
    tabElement.style.borderBottom = tab.id === 'my-listings' ? '2px solid #34A853' : '2px solid transparent';
    tabElement.style.color = tab.id === 'my-listings' ? '#34A853' : '#666';
    tabElement.style.fontWeight = tab.id === 'my-listings' ? 'bold' : 'normal';
    tabElement.style.cursor = 'pointer';
    tabElement.style.transition = 'all 0.2s';
    
    tabElement.addEventListener('mouseover', () => {
      if (tabElement.dataset.tabId !== appState.currentServiceTab) {
        tabElement.style.color = '#333';
      }
    });
    
    tabElement.addEventListener('mouseout', () => {
      if (tabElement.dataset.tabId !== appState.currentServiceTab) {
        tabElement.style.color = '#666';
      }
    });
    
    tabElement.addEventListener('click', () => {
      // Update active tab in appState
      appState.currentServiceTab = tab.id;
      
      // Update tab styling
      document.querySelectorAll('.tabs-nav button').forEach(t => {
        t.style.borderBottom = '2px solid transparent';
        t.style.color = '#666';
        t.style.fontWeight = 'normal';
      });
      
      tabElement.style.borderBottom = '2px solid #34A853';
      tabElement.style.color = '#34A853';
      tabElement.style.fontWeight = 'bold';
      
      // Render tab content
      renderTabContent(tab.id, contentArea, appState);
    });
    
    tabsNav.appendChild(tabElement);
  });
  
  contentArea.appendChild(tabsNav);
  
  // Tab content container
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  contentArea.appendChild(tabContent);
  
  managerContainer.appendChild(contentArea);
  container.appendChild(managerContainer);
  
  // Init the default tab (My Listings)
  appState.currentServiceTab = 'my-listings';
  renderTabContent('my-listings', contentArea, appState);
}

/**
 * Render the appropriate tab content
 */
function renderTabContent(tabId, container, appState) {
  const tabContent = container.querySelector('.tab-content');
  tabContent.innerHTML = '';
  
  switch (tabId) {
    case 'my-listings':
      renderMyListings(tabContent, appState);
      break;
    case 'create-listing':
      renderCreateListing(tabContent, appState);
      break;
    case 'inquiries':
      renderInquiries(tabContent, appState);
      break;
    case 'analytics':
      renderAnalytics(tabContent, appState);
      break;
  }
}

/**
 * Render My Listings tab content
 */
function renderMyListings(container, appState) {
  // Create container for listings
  const listingsContainer = document.createElement('div');
  
  // Loading state
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading';
  loadingElement.innerHTML = `
    <div style="display: flex; justify-content: center; margin: 40px 0;">
      <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>.spinner_z9k8{transform-origin:center;animation:spinner_StKS .75s step-end infinite}@keyframes spinner_StKS{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style>
        <g class="spinner_z9k8"><circle cx="12" cy="2.5" r="1.5" fill="#34A853"/><circle cx="16.5" cy="4" r="1.5" fill="#34A853" opacity=".8"/><circle cx="19.5" cy="7.5" r="1.5" fill="#34A853" opacity=".7"/><circle cx="20.5" cy="12" r="1.5" fill="#34A853" opacity=".6"/><circle cx="19.5" cy="16.5" r="1.5" fill="#34A853" opacity=".5"/><circle cx="16.5" cy="19.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="12" cy="20.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="7.5" cy="19.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="16.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="2.5" cy="12" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="7.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="7.5" cy="4" r="1.5" fill="#34A853" opacity=".5"/></g>
      </svg>
    </div>
    <p style="text-align: center; color: #666;">Loading your service listings...</p>
  `;
  listingsContainer.appendChild(loadingElement);
  
  // Simulate fetching listings from the server
  setTimeout(() => {
    loadingElement.remove();
    
    // Check if the user has any listings
    const mockListings = getMockServiceListings();
    
    if (mockListings.length === 0) {
      renderEmptyListings(listingsContainer, appState);
    } else {
      renderListingsGrid(listingsContainer, mockListings, appState);
    }
  }, 1000);
  
  container.appendChild(listingsContainer);
}

/**
 * Render empty state when no listings exist
 */
function renderEmptyListings(container, appState) {
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.style.textAlign = 'center';
  emptyState.style.padding = '60px 20px';
  emptyState.style.backgroundColor = '#f9f9f9';
  emptyState.style.borderRadius = '8px';
  
  const emptyIcon = document.createElement('div');
  emptyIcon.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 12h8"></path>
      <path d="M12 8v8"></path>
    </svg>
  `;
  emptyState.appendChild(emptyIcon);
  
  const emptyTitle = document.createElement('h3');
  emptyTitle.textContent = 'No Service Listings Yet';
  emptyTitle.style.margin = '16px 0 8px';
  emptyTitle.style.color = '#333';
  emptyState.appendChild(emptyTitle);
  
  const emptyText = document.createElement('p');
  emptyText.textContent = 'Create your first service listing to start receiving inquiries from potential clients.';
  emptyText.style.color = '#666';
  emptyText.style.marginBottom = '24px';
  emptyState.appendChild(emptyText);
  
  const createButton = document.createElement('button');
  createButton.textContent = 'Create Your First Listing';
  createButton.style.padding = '12px 24px';
  createButton.style.backgroundColor = '#34A853';
  createButton.style.color = 'white';
  createButton.style.border = 'none';
  createButton.style.borderRadius = '4px';
  createButton.style.fontWeight = 'bold';
  createButton.style.cursor = 'pointer';
  createButton.style.transition = 'background-color 0.2s';
  
  createButton.addEventListener('mouseover', () => {
    createButton.style.backgroundColor = '#2E9748';
  });
  
  createButton.addEventListener('mouseout', () => {
    createButton.style.backgroundColor = '#34A853';
  });
  
  createButton.addEventListener('click', () => {
    // Switch to the create listing tab
    appState.currentServiceTab = 'create-listing';
    
    // Update tab styling
    document.querySelectorAll('.tabs-nav button').forEach(t => {
      t.style.borderBottom = '2px solid transparent';
      t.style.color = '#666';
      t.style.fontWeight = 'normal';
      
      if (t.dataset.tabId === 'create-listing') {
        t.style.borderBottom = '2px solid #34A853';
        t.style.color = '#34A853';
        t.style.fontWeight = 'bold';
      }
    });
    
    // Render create listing tab
    const tabContent = container.parentElement;
    renderCreateListing(tabContent, appState);
  });
  
  emptyState.appendChild(createButton);
  container.appendChild(emptyState);
}

/**
 * Render listings in a grid layout
 */
function renderListingsGrid(container, listings, appState) {
  const listingsHeader = document.createElement('div');
  listingsHeader.style.display = 'flex';
  listingsHeader.style.justifyContent = 'space-between';
  listingsHeader.style.alignItems = 'center';
  listingsHeader.style.marginBottom = '24px';
  
  const listingCount = document.createElement('div');
  listingCount.textContent = `${listings.length} Service Listing${listings.length !== 1 ? 's' : ''}`;
  listingCount.style.fontSize = '16px';
  listingCount.style.fontWeight = 'bold';
  listingsHeader.appendChild(listingCount);
  
  const actionsContainer = document.createElement('div');
  
  const createButton = document.createElement('button');
  createButton.textContent = 'Create New Listing';
  createButton.style.padding = '10px 16px';
  createButton.style.backgroundColor = '#34A853';
  createButton.style.color = 'white';
  createButton.style.border = 'none';
  createButton.style.borderRadius = '4px';
  createButton.style.cursor = 'pointer';
  
  createButton.addEventListener('click', () => {
    // Switch to create listing tab
    appState.currentServiceTab = 'create-listing';
    
    // Update tab styling
    document.querySelectorAll('.tabs-nav button').forEach(t => {
      t.style.borderBottom = '2px solid transparent';
      t.style.color = '#666';
      t.style.fontWeight = 'normal';
      
      if (t.dataset.tabId === 'create-listing') {
        t.style.borderBottom = '2px solid #34A853';
        t.style.color = '#34A853';
        t.style.fontWeight = 'bold';
      }
    });
    
    // Render create listing tab
    renderTabContent('create-listing', container.parentElement.parentElement, appState);
  });
  
  actionsContainer.appendChild(createButton);
  listingsHeader.appendChild(actionsContainer);
  
  container.appendChild(listingsHeader);
  
  // Create grid for listings
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
  grid.style.gap = '24px';
  
  // Add each listing to the grid
  listings.forEach(listing => {
    const card = createListingCard(listing, appState);
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}

/**
 * Create a card for an individual service listing
 */
function createListingCard(listing, appState) {
  const card = document.createElement('div');
  card.className = 'listing-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  card.style.overflow = 'hidden';
  card.style.transition = 'transform 0.2s, box-shadow 0.2s';
  
  // Card hover effect
  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  });
  
  // Status indicator
  const statusBar = document.createElement('div');
  statusBar.style.height = '4px';
  statusBar.style.width = '100%';
  
  // Set color based on status
  if (listing.isActive) {
    statusBar.style.backgroundColor = '#34A853'; // Green for active
  } else {
    statusBar.style.backgroundColor = '#9e9e9e'; // Gray for inactive
  }
  
  card.appendChild(statusBar);
  
  // Card content
  const content = document.createElement('div');
  content.style.padding = '20px';
  
  // Service title with category icon
  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.alignItems = 'center';
  titleRow.style.gap = '8px';
  titleRow.style.marginBottom = '12px';
  
  const categoryIcon = document.createElement('div');
  categoryIcon.innerHTML = getIconSvg(getCategoryIcon(listing.category));
  categoryIcon.style.display = 'flex';
  categoryIcon.style.alignItems = 'center';
  categoryIcon.style.justifyContent = 'center';
  categoryIcon.style.width = '32px';
  categoryIcon.style.height = '32px';
  categoryIcon.style.backgroundColor = '#f0f9f4';
  categoryIcon.style.borderRadius = '50%';
  titleRow.appendChild(categoryIcon);
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = listing.name;
  titleElement.style.margin = '0';
  titleElement.style.fontSize = '18px';
  titleElement.style.fontWeight = 'bold';
  titleRow.appendChild(titleElement);
  
  content.appendChild(titleRow);
  
  // Service category
  const category = document.createElement('div');
  category.textContent = getCategoryName(listing.category);
  category.style.color = '#666';
  category.style.fontSize = '14px';
  category.style.marginBottom = '12px';
  content.appendChild(category);
  
  // Location
  const location = document.createElement('div');
  location.style.display = 'flex';
  location.style.alignItems = 'center';
  location.style.marginBottom = '16px';
  
  const locationIcon = document.createElement('span');
  locationIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `;
  locationIcon.style.marginRight = '4px';
  location.appendChild(locationIcon);
  
  const locationText = document.createElement('span');
  locationText.textContent = listing.location;
  locationText.style.color = '#666';
  locationText.style.fontSize = '14px';
  location.appendChild(locationText);
  
  content.appendChild(location);
  
  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.display = 'flex';
  statsRow.style.gap = '16px';
  statsRow.style.marginBottom = '16px';
  
  // Views
  const views = document.createElement('div');
  views.style.display = 'flex';
  views.style.alignItems = 'center';
  
  const viewsIcon = document.createElement('span');
  viewsIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  viewsIcon.style.marginRight = '4px';
  views.appendChild(viewsIcon);
  
  const viewsText = document.createElement('span');
  viewsText.textContent = `${listing.views} views`;
  viewsText.style.color = '#666';
  viewsText.style.fontSize = '14px';
  views.appendChild(viewsText);
  
  statsRow.appendChild(views);
  
  // Inquiries
  const inquiries = document.createElement('div');
  inquiries.style.display = 'flex';
  inquiries.style.alignItems = 'center';
  
  const inquiriesIcon = document.createElement('span');
  inquiriesIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  inquiriesIcon.style.marginRight = '4px';
  inquiries.appendChild(inquiriesIcon);
  
  const inquiriesText = document.createElement('span');
  inquiriesText.textContent = `${listing.inquiries} inquiries`;
  inquiriesText.style.color = '#666';
  inquiriesText.style.fontSize = '14px';
  inquiries.appendChild(inquiriesText);
  
  statsRow.appendChild(inquiries);
  
  content.appendChild(statsRow);
  
  // Action buttons
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.flexWrap = 'wrap';
  
  // Preview button
  const previewButton = document.createElement('button');
  previewButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
    <span>Preview</span>
  `;
  previewButton.style.display = 'flex';
  previewButton.style.alignItems = 'center';
  previewButton.style.gap = '4px';
  previewButton.style.padding = '8px 12px';
  previewButton.style.backgroundColor = '#f0f0f0';
  previewButton.style.color = '#333';
  previewButton.style.border = 'none';
  previewButton.style.borderRadius = '4px';
  previewButton.style.cursor = 'pointer';
  previewButton.style.flex = '1';
  
  previewButton.addEventListener('click', () => {
    showListingPreview(listing, appState);
  });
  
  actions.appendChild(previewButton);
  
  // Edit button
  const editButton = document.createElement('button');
  editButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
    <span>Edit</span>
  `;
  editButton.style.display = 'flex';
  editButton.style.alignItems = 'center';
  editButton.style.gap = '4px';
  editButton.style.padding = '8px 12px';
  editButton.style.backgroundColor = '#f0f0f0';
  editButton.style.color = '#333';
  editButton.style.border = 'none';
  editButton.style.borderRadius = '4px';
  editButton.style.cursor = 'pointer';
  editButton.style.flex = '1';
  
  editButton.addEventListener('click', () => {
    openEditListingForm(listing, appState);
  });
  
  actions.appendChild(editButton);
  
  // Second row of buttons
  const actionsRow2 = document.createElement('div');
  actionsRow2.style.display = 'flex';
  actionsRow2.style.gap = '8px';
  actionsRow2.style.marginTop = '8px';
  actionsRow2.style.width = '100%';
  
  // Toggle status button
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = listing.isActive ?
    `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
      <circle cx="16" cy="12" r="3"></circle>
    </svg>
    <span>Pause</span>
    ` :
    `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
      <circle cx="8" cy="12" r="3"></circle>
    </svg>
    <span>Activate</span>
    `;
  
  toggleButton.style.display = 'flex';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.gap = '4px';
  toggleButton.style.padding = '8px 12px';
  toggleButton.style.backgroundColor = listing.isActive ? '#f0f0f0' : '#34A853';
  toggleButton.style.color = listing.isActive ? '#333' : 'white';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.flex = '1';
  
  toggleButton.addEventListener('click', () => {
    toggleListingStatus(listing, appState);
  });
  
  actionsRow2.appendChild(toggleButton);
  
  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    <span>Delete</span>
  `;
  deleteButton.style.display = 'flex';
  deleteButton.style.alignItems = 'center';
  deleteButton.style.gap = '4px';
  deleteButton.style.padding = '8px 12px';
  deleteButton.style.backgroundColor = '#fff0f0';
  deleteButton.style.color = '#d32f2f';
  deleteButton.style.border = '1px solid #ffcdd2';
  deleteButton.style.borderRadius = '4px';
  deleteButton.style.cursor = 'pointer';
  deleteButton.style.flex = '1';
  
  deleteButton.addEventListener('click', () => {
    confirmDeleteListing(listing, appState);
  });
  
  actionsRow2.appendChild(deleteButton);
  
  actions.appendChild(actionsRow2);
  
  content.appendChild(actions);
  
  card.appendChild(content);
  return card;
}

/**
 * Render Create Listing tab content
 */
function renderCreateListing(container, appState) {
  const formContainer = document.createElement('div');
  formContainer.className = 'create-listing-form';
  formContainer.style.maxWidth = '800px';
  formContainer.style.margin = '0 auto';
  
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Create a New Service Listing';
  formTitle.style.marginBottom = '24px';
  formContainer.appendChild(formTitle);
  
  // Create form
  const form = document.createElement('form');
  form.style.display = 'grid';
  form.style.gridTemplateColumns = 'repeat(2, 1fr)';
  form.style.gap = '24px';
  
  // Service Name
  const nameGroup = createFormGroup('Service Name', 'text', 'serviceName', 'e.g. Professional Plumbing Services');
  nameGroup.style.gridColumn = '1 / 3';
  form.appendChild(nameGroup);
  
  // Service Category
  const categoryGroup = createFormGroup('Service Category', 'select', 'serviceCategory');
  categoryGroup.style.gridColumn = '1 / 2';
  
  const categorySelect = categoryGroup.querySelector('select');
  SERVICE_CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  
  form.appendChild(categoryGroup);
  
  // Pricing Type
  const pricingTypeGroup = createFormGroup('Pricing Type', 'select', 'pricingType');
  pricingTypeGroup.style.gridColumn = '2 / 3';
  
  const pricingTypeSelect = pricingTypeGroup.querySelector('select');
  ['Hourly Rate', 'Fixed Price', 'Negotiable', 'Free Estimate'].forEach(type => {
    const option = document.createElement('option');
    option.value = type.toLowerCase().replace(/\s/g, '_');
    option.textContent = type;
    pricingTypeSelect.appendChild(option);
  });
  
  form.appendChild(pricingTypeGroup);
  
  // Rate
  const rateGroup = createFormGroup('Rate (USD)', 'number', 'rate', 'e.g. 50');
  rateGroup.style.gridColumn = '1 / 2';
  form.appendChild(rateGroup);
  
  // Location
  const locationGroup = createFormGroup('Service Location', 'text', 'location', 'e.g. Chicago, IL');
  locationGroup.style.gridColumn = '2 / 3';
  form.appendChild(locationGroup);
  
  // Service Radius
  const radiusGroup = createFormGroup('Service Radius (miles)', 'number', 'radius', 'e.g. 25');
  radiusGroup.style.gridColumn = '1 / 2';
  
  // Set default value
  const radiusInput = radiusGroup.querySelector('input');
  radiusInput.value = '25';
  
  form.appendChild(radiusGroup);
  
  // Is Remote Friendly?
  const remoteGroup = document.createElement('div');
  remoteGroup.className = 'form-group';
  remoteGroup.style.gridColumn = '2 / 3';
  remoteGroup.style.display = 'flex';
  remoteGroup.style.alignItems = 'center';
  
  const remoteLabel = document.createElement('label');
  remoteLabel.innerHTML = 'Remote Work Available?';
  remoteLabel.style.marginBottom = '8px';
  remoteLabel.style.display = 'block';
  remoteLabel.style.fontWeight = 'bold';
  remoteGroup.appendChild(remoteLabel);
  
  const remoteToggle = document.createElement('label');
  remoteToggle.className = 'toggle-switch';
  remoteToggle.style.position = 'relative';
  remoteToggle.style.display = 'inline-block';
  remoteToggle.style.width = '50px';
  remoteToggle.style.height = '24px';
  remoteToggle.style.marginLeft = '16px';
  
  const remoteInput = document.createElement('input');
  remoteInput.type = 'checkbox';
  remoteInput.id = 'remoteAvailable';
  remoteInput.name = 'remoteAvailable';
  remoteInput.style.opacity = '0';
  remoteInput.style.width = '0';
  remoteInput.style.height = '0';
  
  const slider = document.createElement('span');
  slider.className = 'slider';
  slider.style.position = 'absolute';
  slider.style.cursor = 'pointer';
  slider.style.top = '0';
  slider.style.left = '0';
  slider.style.right = '0';
  slider.style.bottom = '0';
  slider.style.backgroundColor = '#ccc';
  slider.style.transition = '.4s';
  slider.style.borderRadius = '34px';
  
  slider.innerHTML = `
    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
  `;
  
  remoteInput.addEventListener('change', function() {
    if (this.checked) {
      slider.style.backgroundColor = '#34A853';
      slider.querySelector('span').style.transform = 'translateX(26px)';
    } else {
      slider.style.backgroundColor = '#ccc';
      slider.querySelector('span').style.transform = 'translateX(0)';
    }
  });
  
  remoteToggle.appendChild(remoteInput);
  remoteToggle.appendChild(slider);
  remoteGroup.appendChild(remoteToggle);
  
  form.appendChild(remoteGroup);
  
  // Description
  const descriptionGroup = createFormGroup('Service Description', 'textarea', 'description', 'Describe your services, expertise, and what sets you apart...');
  descriptionGroup.style.gridColumn = '1 / 3';
  form.appendChild(descriptionGroup);
  
  // Skills
  const skillsGroup = createFormGroup('Skills and Specialties', 'text', 'skills', 'e.g. Residential plumbing, water heaters, leak repair');
  skillsGroup.style.gridColumn = '1 / 3';
  
  const skillsHelp = document.createElement('div');
  skillsHelp.textContent = 'Separate multiple skills with commas';
  skillsHelp.style.fontSize = '12px';
  skillsHelp.style.color = '#666';
  skillsHelp.style.marginTop = '4px';
  
  skillsGroup.appendChild(skillsHelp);
  form.appendChild(skillsGroup);
  
  // Contact Email
  const emailGroup = createFormGroup('Contact Email', 'email', 'contactEmail', 'e.g. your@email.com');
  emailGroup.style.gridColumn = '1 / 2';
  form.appendChild(emailGroup);
  
  // Contact Phone
  const phoneGroup = createFormGroup('Contact Phone', 'tel', 'contactPhone', 'e.g. (555) 555-5555');
  phoneGroup.style.gridColumn = '2 / 3';
  form.appendChild(phoneGroup);
  
  // Submit button
  const submitGroup = document.createElement('div');
  submitGroup.className = 'form-group';
  submitGroup.style.gridColumn = '1 / 3';
  submitGroup.style.marginTop = '16px';
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Create Listing';
  submitButton.style.padding = '12px 24px';
  submitButton.style.backgroundColor = '#34A853';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '4px';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.2s';
  
  submitButton.addEventListener('mouseover', () => {
    submitButton.style.backgroundColor = '#2E9748';
  });
  
  submitButton.addEventListener('mouseout', () => {
    submitButton.style.backgroundColor = '#34A853';
  });
  
  submitGroup.appendChild(submitButton);
  form.appendChild(submitGroup);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show success message
    form.innerHTML = '';
    
    const successMessage = document.createElement('div');
    successMessage.style.textAlign = 'center';
    successMessage.style.padding = '40px 20px';
    
    const successIcon = document.createElement('div');
    successIcon.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
    successMessage.appendChild(successIcon);
    
    const successTitle = document.createElement('h3');
    successTitle.textContent = 'Listing Created Successfully!';
    successTitle.style.margin = '16px 0 8px';
    successTitle.style.color = '#333';
    successMessage.appendChild(successTitle);
    
    const successText = document.createElement('p');
    successText.textContent = 'Your service listing has been created and is now visible to potential clients.';
    successText.style.color = '#666';
    successText.style.marginBottom = '24px';
    successMessage.appendChild(successText);
    
    const viewListingsButton = document.createElement('button');
    viewListingsButton.textContent = 'View My Listings';
    viewListingsButton.style.padding = '12px 24px';
    viewListingsButton.style.backgroundColor = '#34A853';
    viewListingsButton.style.color = 'white';
    viewListingsButton.style.border = 'none';
    viewListingsButton.style.borderRadius = '4px';
    viewListingsButton.style.fontWeight = 'bold';
    viewListingsButton.style.cursor = 'pointer';
    
    viewListingsButton.addEventListener('click', () => {
      // Switch to my listings tab
      appState.currentServiceTab = 'my-listings';
      
      // Update tab styling
      document.querySelectorAll('.tabs-nav button').forEach(t => {
        t.style.borderBottom = '2px solid transparent';
        t.style.color = '#666';
        t.style.fontWeight = 'normal';
        
        if (t.dataset.tabId === 'my-listings') {
          t.style.borderBottom = '2px solid #34A853';
          t.style.color = '#34A853';
          t.style.fontWeight = 'bold';
        }
      });
      
      // Render my listings tab
      renderTabContent('my-listings', container.parentElement, appState);
    });
    
    successMessage.appendChild(viewListingsButton);
    form.appendChild(successMessage);
    
    // In a real implementation, you would send this data to the server
    console.log('Form submitted:', data);
  });
  
  formContainer.appendChild(form);
  container.appendChild(formContainer);
}

/**
 * Render Inquiries tab content
 */
function renderInquiries(container, appState) {
  const inquiriesContainer = document.createElement('div');
  inquiriesContainer.className = 'inquiries-container';
  
  // Loading state
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading';
  loadingElement.innerHTML = `
    <div style="display: flex; justify-content: center; margin: 40px 0;">
      <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>.spinner_z9k8{transform-origin:center;animation:spinner_StKS .75s step-end infinite}@keyframes spinner_StKS{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style>
        <g class="spinner_z9k8"><circle cx="12" cy="2.5" r="1.5" fill="#34A853"/><circle cx="16.5" cy="4" r="1.5" fill="#34A853" opacity=".8"/><circle cx="19.5" cy="7.5" r="1.5" fill="#34A853" opacity=".7"/><circle cx="20.5" cy="12" r="1.5" fill="#34A853" opacity=".6"/><circle cx="19.5" cy="16.5" r="1.5" fill="#34A853" opacity=".5"/><circle cx="16.5" cy="19.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="12" cy="20.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="7.5" cy="19.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="16.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="2.5" cy="12" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="7.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="7.5" cy="4" r="1.5" fill="#34A853" opacity=".5"/></g>
      </svg>
    </div>
    <p style="text-align: center; color: #666;">Loading inquiries...</p>
  `;
  inquiriesContainer.appendChild(loadingElement);
  
  // Simulate loading
  setTimeout(() => {
    loadingElement.remove();
    
    // Mock inquiries
    const mockInquiries = getMockInquiries();
    
    if (mockInquiries.length === 0) {
      // No inquiries state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.style.textAlign = 'center';
      emptyState.style.padding = '60px 20px';
      emptyState.style.backgroundColor = '#f9f9f9';
      emptyState.style.borderRadius = '8px';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      emptyState.appendChild(emptyIcon);
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.textContent = 'No Inquiries Yet';
      emptyTitle.style.margin = '16px 0 8px';
      emptyTitle.style.color = '#333';
      emptyState.appendChild(emptyTitle);
      
      const emptyText = document.createElement('p');
      emptyText.textContent = 'You have not received any inquiries about your services yet. Check back later!';
      emptyText.style.color = '#666';
      emptyState.appendChild(emptyText);
      
      inquiriesContainer.appendChild(emptyState);
    } else {
      // Inquiries list
      const inquiriesList = document.createElement('div');
      inquiriesList.className = 'inquiries-list';
      
      // Header with count
      const header = document.createElement('div');
      header.style.marginBottom = '24px';
      
      const inquiryCount = document.createElement('h3');
      inquiryCount.textContent = `${mockInquiries.length} Inquir${mockInquiries.length === 1 ? 'y' : 'ies'}`;
      inquiryCount.style.margin = '0';
      header.appendChild(inquiryCount);
      
      inquiriesList.appendChild(header);
      
      // List of inquiries
      mockInquiries.forEach(inquiry => {
        const inquiryCard = createInquiryCard(inquiry);
        inquiriesList.appendChild(inquiryCard);
      });
      
      inquiriesContainer.appendChild(inquiriesList);
    }
  }, 1000);
  
  container.appendChild(inquiriesContainer);
}

/**
 * Create an inquiry card
 */
function createInquiryCard(inquiry) {
  const card = document.createElement('div');
  card.className = 'inquiry-card';
  card.style.backgroundColor = 'white';
  card.style.border = '1px solid #eee';
  card.style.borderRadius = '8px';
  card.style.padding = '20px';
  card.style.marginBottom = '16px';
  
  // Header with service and status
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.marginBottom = '12px';
  
  const serviceTitle = document.createElement('h4');
  serviceTitle.textContent = inquiry.serviceName;
  serviceTitle.style.margin = '0';
  serviceTitle.style.fontWeight = 'bold';
  serviceTitle.style.color = '#333';
  header.appendChild(serviceTitle);
  
  const statusBadge = document.createElement('span');
  statusBadge.textContent = inquiry.status;
  statusBadge.style.padding = '4px 8px';
  statusBadge.style.borderRadius = '12px';
  statusBadge.style.fontSize = '12px';
  statusBadge.style.fontWeight = 'bold';
  
  // Set color based on status
  if (inquiry.status === 'New') {
    statusBadge.style.backgroundColor = '#e3f2fd';
    statusBadge.style.color = '#1565c0';
  } else if (inquiry.status === 'Replied') {
    statusBadge.style.backgroundColor = '#e8f5e9';
    statusBadge.style.color = '#2e7d32';
  } else if (inquiry.status === 'Closed') {
    statusBadge.style.backgroundColor = '#f5f5f5';
    statusBadge.style.color = '#757575';
  }
  
  header.appendChild(statusBadge);
  card.appendChild(header);
  
  // Client info
  const clientInfo = document.createElement('div');
  clientInfo.style.display = 'flex';
  clientInfo.style.alignItems = 'center';
  clientInfo.style.marginBottom = '12px';
  
  const avatar = document.createElement('div');
  avatar.style.width = '36px';
  avatar.style.height = '36px';
  avatar.style.borderRadius = '50%';
  avatar.style.backgroundColor = '#f0f0f0';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.marginRight = '12px';
  avatar.style.fontSize = '16px';
  avatar.style.fontWeight = 'bold';
  avatar.style.color = '#666';
  avatar.textContent = inquiry.clientName.charAt(0).toUpperCase();
  clientInfo.appendChild(avatar);
  
  const clientDetails = document.createElement('div');
  
  const clientName = document.createElement('div');
  clientName.textContent = inquiry.clientName;
  clientName.style.fontWeight = 'bold';
  clientDetails.appendChild(clientName);
  
  const inquiryDate = document.createElement('div');
  inquiryDate.textContent = inquiry.date;
  inquiryDate.style.fontSize = '12px';
  inquiryDate.style.color = '#666';
  clientDetails.appendChild(inquiryDate);
  
  clientInfo.appendChild(clientDetails);
  card.appendChild(clientInfo);
  
  // Inquiry message
  const message = document.createElement('div');
  message.textContent = inquiry.message;
  message.style.backgroundColor = '#f9f9f9';
  message.style.padding = '12px';
  message.style.borderRadius = '4px';
  message.style.marginBottom = '16px';
  card.appendChild(message);
  
  // Action buttons
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  
  // Reply button
  const replyButton = document.createElement('button');
  replyButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 10h10a8 8 0 1 1-8 8v-3"></path>
      <path d="m1 18 3-3-3-3"></path>
    </svg>
    <span>Reply</span>
  `;
  replyButton.style.display = 'flex';
  replyButton.style.alignItems = 'center';
  replyButton.style.gap = '4px';
  replyButton.style.padding = '8px 12px';
  replyButton.style.backgroundColor = '#34A853';
  replyButton.style.color = 'white';
  replyButton.style.border = 'none';
  replyButton.style.borderRadius = '4px';
  replyButton.style.cursor = 'pointer';
  
  replyButton.addEventListener('click', () => {
    alert(`Reply to inquiry from ${inquiry.clientName}`);
  });
  
  actions.appendChild(replyButton);
  
  // Mark as button
  const markAsButton = document.createElement('button');
  markAsButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>Mark as ${inquiry.status === 'Closed' ? 'Open' : 'Closed'}</span>
  `;
  markAsButton.style.display = 'flex';
  markAsButton.style.alignItems = 'center';
  markAsButton.style.gap = '4px';
  markAsButton.style.padding = '8px 12px';
  markAsButton.style.backgroundColor = '#f0f0f0';
  markAsButton.style.color = '#333';
  markAsButton.style.border = 'none';
  markAsButton.style.borderRadius = '4px';
  markAsButton.style.cursor = 'pointer';
  
  markAsButton.addEventListener('click', () => {
    alert(`Mark inquiry as ${inquiry.status === 'Closed' ? 'Open' : 'Closed'}`);
  });
  
  actions.appendChild(markAsButton);
  
  card.appendChild(actions);
  
  return card;
}

/**
 * Render Analytics tab content
 */
function renderAnalytics(container, appState) {
  const analyticsContainer = document.createElement('div');
  analyticsContainer.className = 'analytics-container';
  
  const analyticsTitle = document.createElement('h3');
  analyticsTitle.textContent = 'Service Listing Analytics';
  analyticsTitle.style.marginBottom = '24px';
  analyticsContainer.appendChild(analyticsTitle);
  
  // Summary cards
  const summaryCards = document.createElement('div');
  summaryCards.style.display = 'grid';
  summaryCards.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  summaryCards.style.gap = '16px';
  summaryCards.style.marginBottom = '32px';
  
  // Summary metrics
  const metrics = [
    { label: 'Total Listings', value: '3', icon: 'clipboard', color: '#4285F4' },
    { label: 'Total Views', value: '127', icon: 'eye', color: '#EA4335' },
    { label: 'Inquiries', value: '14', icon: 'messageCircle', color: '#FBBC05' },
    { label: 'Conversion Rate', value: '11%', icon: 'barChart', color: '#34A853' }
  ];
  
  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.style.backgroundColor = 'white';
    card.style.borderRadius = '8px';
    card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    card.style.padding = '20px';
    card.style.textAlign = 'center';
    
    const iconContainer = document.createElement('div');
    iconContainer.style.width = '48px';
    iconContainer.style.height = '48px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = `${metric.color}1A`; // 10% opacity
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.margin = '0 auto 12px';
    
    const icon = document.createElement('div');
    icon.innerHTML = getIconSvg(metric.icon, metric.color);
    iconContainer.appendChild(icon);
    
    card.appendChild(iconContainer);
    
    const valueElement = document.createElement('div');
    valueElement.textContent = metric.value;
    valueElement.style.fontSize = '24px';
    valueElement.style.fontWeight = 'bold';
    valueElement.style.color = '#333';
    valueElement.style.marginBottom = '4px';
    card.appendChild(valueElement);
    
    const labelElement = document.createElement('div');
    labelElement.textContent = metric.label;
    labelElement.style.color = '#666';
    labelElement.style.fontSize = '14px';
    card.appendChild(labelElement);
    
    summaryCards.appendChild(card);
  });
  
  analyticsContainer.appendChild(summaryCards);
  
  // Performance chart placeholder
  const chartContainer = document.createElement('div');
  chartContainer.style.backgroundColor = 'white';
  chartContainer.style.borderRadius = '8px';
  chartContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  chartContainer.style.padding = '20px';
  chartContainer.style.marginBottom = '32px';
  
  const chartHeader = document.createElement('div');
  chartHeader.style.display = 'flex';
  chartHeader.style.justifyContent = 'space-between';
  chartHeader.style.alignItems = 'center';
  chartHeader.style.marginBottom = '16px';
  
  const chartTitle = document.createElement('h4');
  chartTitle.textContent = 'Listing Performance';
  chartTitle.style.margin = '0';
  chartHeader.appendChild(chartTitle);
  
  const timeSelector = document.createElement('select');
  timeSelector.style.padding = '8px';
  timeSelector.style.border = '1px solid #ddd';
  timeSelector.style.borderRadius = '4px';
  
  ['Last 7 days', 'Last 30 days', 'Last 90 days'].forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.toLowerCase().replace(/\s/g, '_');
    optionElement.textContent = option;
    timeSelector.appendChild(optionElement);
  });
  
  chartHeader.appendChild(timeSelector);
  chartContainer.appendChild(chartHeader);
  
  // Chart placeholder
  const chartPlaceholder = document.createElement('div');
  chartPlaceholder.style.height = '250px';
  chartPlaceholder.style.backgroundColor = '#f9f9f9';
  chartPlaceholder.style.borderRadius = '4px';
  chartPlaceholder.style.display = 'flex';
  chartPlaceholder.style.alignItems = 'center';
  chartPlaceholder.style.justifyContent = 'center';
  
  chartPlaceholder.innerHTML = `
    <div style="text-align: center; color: #666;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
      <p>Chart visualization would appear here</p>
    </div>
  `;
  
  chartContainer.appendChild(chartPlaceholder);
  analyticsContainer.appendChild(chartContainer);
  
  // Top performing listings
  const topListingsContainer = document.createElement('div');
  topListingsContainer.style.backgroundColor = 'white';
  topListingsContainer.style.borderRadius = '8px';
  topListingsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  topListingsContainer.style.padding = '20px';
  
  const topListingsTitle = document.createElement('h4');
  topListingsTitle.textContent = 'Top Performing Listings';
  topListingsTitle.style.marginTop = '0';
  topListingsTitle.style.marginBottom = '16px';
  topListingsContainer.appendChild(topListingsTitle);
  
  // Table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  
  // Table header
  const thead = document.createElement('thead');
  thead.style.borderBottom = '2px solid #eee';
  
  const headerRow = document.createElement('tr');
  
  ['Listing Name', 'Views', 'Inquiries', 'Conversion'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '12px 8px';
    th.style.textAlign = 'left';
    th.style.color = '#666';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  const mockTableData = [
    { name: 'Professional Plumbing Services', views: 72, inquiries: 8, conversion: '11.1%' },
    { name: 'Home Electrical Repairs', views: 45, inquiries: 5, conversion: '11.1%' },
    { name: 'Landscaping & Garden Design', views: 10, inquiries: 1, conversion: '10.0%' }
  ];
  
  mockTableData.forEach(row => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #eee';
    
    const nameCell = document.createElement('td');
    nameCell.textContent = row.name;
    nameCell.style.padding = '12px 8px';
    nameCell.style.fontWeight = 'bold';
    tr.appendChild(nameCell);
    
    const viewsCell = document.createElement('td');
    viewsCell.textContent = row.views;
    viewsCell.style.padding = '12px 8px';
    tr.appendChild(viewsCell);
    
    const inquiriesCell = document.createElement('td');
    inquiriesCell.textContent = row.inquiries;
    inquiriesCell.style.padding = '12px 8px';
    tr.appendChild(inquiriesCell);
    
    const conversionCell = document.createElement('td');
    conversionCell.textContent = row.conversion;
    conversionCell.style.padding = '12px 8px';
    tr.appendChild(conversionCell);
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  topListingsContainer.appendChild(table);
  
  analyticsContainer.appendChild(topListingsContainer);
  
  container.appendChild(analyticsContainer);
}

/**
 * Create form group element with label and input
 */
function createFormGroup(labelText, inputType, inputName, placeholder = '') {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '16px';
  
  const label = document.createElement('label');
  label.htmlFor = inputName;
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '8px';
  label.style.fontWeight = 'bold';
  group.appendChild(label);
  
  let input;
  
  if (inputType === 'textarea') {
    input = document.createElement('textarea');
    input.style.height = '120px';
    input.style.resize = 'vertical';
  } else if (inputType === 'select') {
    input = document.createElement('select');
  } else {
    input = document.createElement('input');
    input.type = inputType;
  }
  
  input.id = inputName;
  input.name = inputName;
  
  if (placeholder && inputType !== 'select') {
    input.placeholder = placeholder;
  }
  
  input.style.width = '100%';
  input.style.padding = '10px 12px';
  input.style.border = '1px solid #ddd';
  input.style.borderRadius = '4px';
  
  group.appendChild(input);
  
  return group;
}

/**
 * Get mock service listings data
 */
/**
 * Get user service listings from local storage or return mock data as fallback
 */
function getMockServiceListings() {
  try {
    // First check if we have listings in localStorage
    const storedListings = localStorage.getItem('stackr_service_listings');
    if (storedListings) {
      return JSON.parse(storedListings);
    }
    
    // If no listings found in localStorage, return mock data and save it
    const mockData = [
      {
        id: 1,
        name: 'Professional Plumbing Services',
        category: 'plumber',
        isActive: true,
        location: 'Chicago, IL',
        views: 72,
        inquiries: 8,
        description: 'Expert plumbing services for residential and commercial properties. Specializing in repairs, installations, and emergency services.',
        rate: 75,
        pricingType: 'hourly_rate',
        radius: 30,
        skills: 'Leak repairs, Water heater installation, Pipe replacements',
        contactEmail: 'plumbing@example.com',
        contactPhone: '(312) 555-7890',
        remoteAvailable: false
      },
      {
        id: 2,
        name: 'Home Electrical Repairs',
        category: 'electrician',
        isActive: true,
        location: 'Chicago, IL',
        views: 45,
        inquiries: 5,
        description: 'Licensed electrician providing reliable and safe electrical services for homes and small businesses.',
        rate: 85,
        pricingType: 'hourly_rate',
        radius: 25,
        skills: 'Wiring, Panel upgrades, Lighting installation',
        contactEmail: 'electrical@example.com',
        contactPhone: '(312) 555-1234',
        remoteAvailable: false
      },
      {
        id: 3,
        name: 'Landscaping & Garden Design',
        category: 'landscaper',
        isActive: false,
        location: 'Evanston, IL',
        views: 10,
        inquiries: 1,
        description: 'Transform your outdoor space with professional landscaping and garden design services.',
        rate: 60,
        pricingType: 'hourly_rate',
        radius: 15,
        skills: 'Garden design, Lawn care, Planting',
        contactEmail: 'gardens@example.com',
        contactPhone: '(847) 555-9876',
        remoteAvailable: false
      }
    ];
    
    // Save mock data to localStorage for future editing
    localStorage.setItem('stackr_service_listings', JSON.stringify(mockData));
    
    return mockData;
  } catch (error) {
    console.error('Error getting service listings:', error);
    return [];
  }
}

/**
 * Save service listings to localStorage
 */
function saveServiceListings(listings) {
  try {
    localStorage.setItem('stackr_service_listings', JSON.stringify(listings));
    return true;
  } catch (error) {
    console.error('Error saving service listings:', error);
    return false;
  }
}

/**
 * Show listing preview in a modal dialog
 */
function showListingPreview(listing, appState) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'service-preview-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'service-preview-content';
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '90%';
  modalContent.style.width = '700px';
  modalContent.style.maxHeight = '90%';
  modalContent.style.overflowY = 'auto';
  modalContent.style.position = 'relative';
  
  // Preview header
  const previewHeader = document.createElement('div');
  previewHeader.style.padding = '16px 24px';
  previewHeader.style.borderBottom = '1px solid #eee';
  previewHeader.style.display = 'flex';
  previewHeader.style.justifyContent = 'space-between';
  previewHeader.style.alignItems = 'center';
  
  const previewTitle = document.createElement('h3');
  previewTitle.textContent = 'Service Preview';
  previewTitle.style.margin = '0';
  previewHeader.appendChild(previewTitle);
  
  const previewDescription = document.createElement('p');
  previewDescription.textContent = 'This is how your listing appears to users';
  previewDescription.style.fontSize = '14px';
  previewDescription.style.color = '#666';
  previewDescription.style.margin = '4px 0 0 0';
  previewHeader.appendChild(previewDescription);
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '4px';
  closeButton.style.color = '#666';
  closeButton.style.position = 'absolute';
  closeButton.style.right = '16px';
  closeButton.style.top = '16px';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  previewHeader.appendChild(closeButton);
  modalContent.appendChild(previewHeader);
  
  // Preview content
  const previewContent = document.createElement('div');
  previewContent.style.padding = '24px';
  
  // Service details
  const serviceView = document.createElement('div');
  serviceView.className = 'service-listing-view';
  
  // Service header
  const serviceHeader = document.createElement('div');
  serviceHeader.style.display = 'flex';
  serviceHeader.style.gap = '16px';
  serviceHeader.style.marginBottom = '24px';
  
  // Service icon
  const serviceIcon = document.createElement('div');
  serviceIcon.innerHTML = getIconSvg(getCategoryIcon(listing.category));
  serviceIcon.style.display = 'flex';
  serviceIcon.style.alignItems = 'center';
  serviceIcon.style.justifyContent = 'center';
  serviceIcon.style.width = '60px';
  serviceIcon.style.height = '60px';
  serviceIcon.style.backgroundColor = '#f0f9f4';
  serviceIcon.style.borderRadius = '50%';
  serviceIcon.style.flexShrink = '0';
  serviceHeader.appendChild(serviceIcon);
  
  // Service title and info
  const serviceTitleBlock = document.createElement('div');
  
  const serviceTitle = document.createElement('h2');
  serviceTitle.textContent = listing.name;
  serviceTitle.style.margin = '0 0 4px 0';
  serviceTitle.style.fontWeight = 'bold';
  serviceTitleBlock.appendChild(serviceTitle);
  
  const serviceCategory = document.createElement('div');
  serviceCategory.textContent = getCategoryName(listing.category);
  serviceCategory.style.color = '#666';
  serviceCategory.style.marginBottom = '4px';
  serviceTitleBlock.appendChild(serviceCategory);
  
  const serviceLocation = document.createElement('div');
  serviceLocation.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
    <span style="vertical-align: middle;">${listing.location}</span>
  `;
  serviceLocation.style.color = '#666';
  serviceLocation.style.fontSize = '14px';
  serviceTitleBlock.appendChild(serviceLocation);
  
  serviceHeader.appendChild(serviceTitleBlock);
  serviceView.appendChild(serviceHeader);
  
  // Service description
  if (listing.description) {
    const descriptionSection = document.createElement('div');
    descriptionSection.style.marginBottom = '24px';
    
    const descriptionTitle = document.createElement('h4');
    descriptionTitle.textContent = 'About This Service';
    descriptionTitle.style.marginBottom = '8px';
    descriptionSection.appendChild(descriptionTitle);
    
    const description = document.createElement('p');
    description.textContent = listing.description;
    description.style.margin = '0';
    description.style.lineHeight = '1.6';
    description.style.color = '#333';
    descriptionSection.appendChild(description);
    
    serviceView.appendChild(descriptionSection);
  }
  
  // Pricing information
  const pricingSection = document.createElement('div');
  pricingSection.style.marginBottom = '24px';
  pricingSection.style.display = 'flex';
  pricingSection.style.gap = '24px';
  
  // Rate
  if (listing.rate) {
    const rateBox = document.createElement('div');
    rateBox.style.flexGrow = '1';
    rateBox.style.padding = '16px';
    rateBox.style.backgroundColor = '#f9f9f9';
    rateBox.style.borderRadius = '8px';
    
    const rateTitle = document.createElement('div');
    rateTitle.textContent = 'Rate';
    rateTitle.style.fontWeight = 'bold';
    rateTitle.style.marginBottom = '4px';
    rateBox.appendChild(rateTitle);
    
    const rateValue = document.createElement('div');
    rateValue.innerHTML = `<span style="font-size: 24px; font-weight: bold;">$${listing.rate}</span>`;
    
    // Add pricing type label
    if (listing.pricingType) {
      let pricingLabel = '';
      switch (listing.pricingType) {
        case 'hourly_rate':
          pricingLabel = '/hour';
          break;
        case 'fixed_price':
          pricingLabel = ' fixed';
          break;
        case 'negotiable':
          pricingLabel = ' negotiable';
          break;
        case 'free_estimate':
          pricingLabel = ' (free estimate)';
          break;
      }
      rateValue.innerHTML += `<span style="font-size: 14px; color: #666;">${pricingLabel}</span>`;
    }
    
    rateBox.appendChild(rateValue);
    pricingSection.appendChild(rateBox);
  }
  
  // Service area
  if (listing.radius) {
    const radiusBox = document.createElement('div');
    radiusBox.style.flexGrow = '1';
    radiusBox.style.padding = '16px';
    radiusBox.style.backgroundColor = '#f9f9f9';
    radiusBox.style.borderRadius = '8px';
    
    const radiusTitle = document.createElement('div');
    radiusTitle.textContent = 'Service Area';
    radiusTitle.style.fontWeight = 'bold';
    radiusTitle.style.marginBottom = '4px';
    radiusBox.appendChild(radiusTitle);
    
    const radiusValue = document.createElement('div');
    radiusValue.innerHTML = `<span style="font-size: 20px; font-weight: bold;">${listing.radius}</span><span style="font-size: 14px; color: #666;"> mile radius</span>`;
    radiusBox.appendChild(radiusValue);
    
    pricingSection.appendChild(radiusBox);
  }
  
  // Remote available
  if (listing.remoteAvailable) {
    const remoteBox = document.createElement('div');
    remoteBox.style.flexGrow = '1';
    remoteBox.style.padding = '16px';
    remoteBox.style.backgroundColor = '#f9f9f9';
    remoteBox.style.borderRadius = '8px';
    
    const remoteTitle = document.createElement('div');
    remoteTitle.textContent = 'Remote Service';
    remoteTitle.style.fontWeight = 'bold';
    remoteTitle.style.marginBottom = '4px';
    remoteBox.appendChild(remoteTitle);
    
    const remoteValue = document.createElement('div');
    remoteValue.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="font-size: 16px; vertical-align: middle; margin-left: 4px;">Available</span>
    `;
    remoteBox.appendChild(remoteValue);
    
    pricingSection.appendChild(remoteBox);
  }
  
  serviceView.appendChild(pricingSection);
  
  // Skills and specialties
  if (listing.skills) {
    const skillsSection = document.createElement('div');
    skillsSection.style.marginBottom = '24px';
    
    const skillsTitle = document.createElement('h4');
    skillsTitle.textContent = 'Skills & Specialties';
    skillsTitle.style.marginBottom = '12px';
    skillsSection.appendChild(skillsTitle);
    
    const skillsList = document.createElement('div');
    skillsList.style.display = 'flex';
    skillsList.style.flexWrap = 'wrap';
    skillsList.style.gap = '8px';
    
    const skills = listing.skills.split(',');
    skills.forEach(skill => {
      const skillTag = document.createElement('span');
      skillTag.textContent = skill.trim();
      skillTag.style.padding = '4px 12px';
      skillTag.style.backgroundColor = '#f0f0f0';
      skillTag.style.borderRadius = '16px';
      skillTag.style.fontSize = '14px';
      skillsList.appendChild(skillTag);
    });
    
    skillsSection.appendChild(skillsList);
    serviceView.appendChild(skillsSection);
  }
  
  // Contact information
  const contactSection = document.createElement('div');
  contactSection.style.marginBottom = '24px';
  
  const contactTitle = document.createElement('h4');
  contactTitle.textContent = 'Contact Information';
  contactTitle.style.marginBottom = '12px';
  contactSection.appendChild(contactTitle);
  
  const contactList = document.createElement('div');
  contactList.style.display = 'flex';
  contactList.style.flexDirection = 'column';
  contactList.style.gap = '8px';
  
  if (listing.contactEmail) {
    const emailItem = document.createElement('div');
    emailItem.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      <span style="vertical-align: middle;">${listing.contactEmail}</span>
    `;
    contactList.appendChild(emailItem);
  }
  
  if (listing.contactPhone) {
    const phoneItem = document.createElement('div');
    phoneItem.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
      <span style="vertical-align: middle;">${listing.contactPhone}</span>
    `;
    contactList.appendChild(phoneItem);
  }
  
  contactSection.appendChild(contactList);
  serviceView.appendChild(contactSection);
  
  // Request button
  const requestButton = document.createElement('button');
  requestButton.textContent = 'Request Service';
  requestButton.style.backgroundColor = '#34A853';
  requestButton.style.color = 'white';
  requestButton.style.border = 'none';
  requestButton.style.borderRadius = '4px';
  requestButton.style.padding = '12px 24px';
  requestButton.style.fontSize = '16px';
  requestButton.style.fontWeight = 'bold';
  requestButton.style.cursor = 'pointer';
  requestButton.style.width = '100%';
  
  requestButton.addEventListener('click', () => {
    alert('This is a preview. Users would be able to request your service here.');
  });
  
  serviceView.appendChild(requestButton);
  previewContent.appendChild(serviceView);
  
  modalContent.appendChild(previewContent);
  modal.appendChild(modalContent);
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Open edit form for a service listing
 */
function openEditListingForm(listing, appState) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'service-edit-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'service-edit-content';
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '90%';
  modalContent.style.width = '800px';
  modalContent.style.maxHeight = '90%';
  modalContent.style.overflowY = 'auto';
  modalContent.style.position = 'relative';
  
  // Edit form header
  const formHeader = document.createElement('div');
  formHeader.style.padding = '16px 24px';
  formHeader.style.borderBottom = '1px solid #eee';
  formHeader.style.display = 'flex';
  formHeader.style.justifyContent = 'space-between';
  formHeader.style.alignItems = 'center';
  
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Edit Service Listing';
  formTitle.style.margin = '0';
  formHeader.appendChild(formTitle);
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '4px';
  closeButton.style.color = '#666';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  formHeader.appendChild(closeButton);
  modalContent.appendChild(formHeader);
  
  // Form content
  const formContent = document.createElement('div');
  formContent.style.padding = '24px';
  
  // Create edit form - similar to create form but with values filled in
  const form = document.createElement('form');
  form.style.display = 'grid';
  form.style.gridTemplateColumns = 'repeat(2, 1fr)';
  form.style.gap = '24px';
  
  // Service Name
  const nameGroup = createFormGroup('Service Name', 'text', 'serviceName', 'e.g. Professional Plumbing Services');
  nameGroup.style.gridColumn = '1 / 3';
  const nameInput = nameGroup.querySelector('input');
  nameInput.value = listing.name || '';
  form.appendChild(nameGroup);
  
  // Service Category
  const categoryGroup = createFormGroup('Service Category', 'select', 'serviceCategory');
  categoryGroup.style.gridColumn = '1 / 2';
  
  const categorySelect = categoryGroup.querySelector('select');
  SERVICE_CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    if (category.id === listing.category) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });
  
  form.appendChild(categoryGroup);
  
  // Pricing Type
  const pricingTypeGroup = createFormGroup('Pricing Type', 'select', 'pricingType');
  pricingTypeGroup.style.gridColumn = '2 / 3';
  
  const pricingTypeSelect = pricingTypeGroup.querySelector('select');
  ['Hourly Rate', 'Fixed Price', 'Negotiable', 'Free Estimate'].forEach(type => {
    const option = document.createElement('option');
    option.value = type.toLowerCase().replace(/\s/g, '_');
    option.textContent = type;
    if (option.value === listing.pricingType) {
      option.selected = true;
    }
    pricingTypeSelect.appendChild(option);
  });
  
  form.appendChild(pricingTypeGroup);
  
  // Rate
  const rateGroup = createFormGroup('Rate (USD)', 'number', 'rate', 'e.g. 50');
  rateGroup.style.gridColumn = '1 / 2';
  const rateInput = rateGroup.querySelector('input');
  rateInput.value = listing.rate || '';
  form.appendChild(rateGroup);
  
  // Location
  const locationGroup = createFormGroup('Service Location', 'text', 'location', 'e.g. Chicago, IL');
  locationGroup.style.gridColumn = '2 / 3';
  const locationInput = locationGroup.querySelector('input');
  locationInput.value = listing.location || '';
  form.appendChild(locationGroup);
  
  // Service Radius
  const radiusGroup = createFormGroup('Service Radius (miles)', 'number', 'radius', 'e.g. 25');
  radiusGroup.style.gridColumn = '1 / 2';
  const radiusInput = radiusGroup.querySelector('input');
  radiusInput.value = listing.radius || '25';
  form.appendChild(radiusGroup);
  
  // Is Remote Friendly?
  const remoteGroup = document.createElement('div');
  remoteGroup.className = 'form-group';
  remoteGroup.style.gridColumn = '2 / 3';
  remoteGroup.style.display = 'flex';
  remoteGroup.style.alignItems = 'center';
  
  const remoteLabel = document.createElement('label');
  remoteLabel.innerHTML = 'Remote Work Available?';
  remoteLabel.style.marginBottom = '8px';
  remoteLabel.style.display = 'block';
  remoteLabel.style.fontWeight = 'bold';
  remoteGroup.appendChild(remoteLabel);
  
  const remoteToggle = document.createElement('label');
  remoteToggle.className = 'toggle-switch';
  remoteToggle.style.position = 'relative';
  remoteToggle.style.display = 'inline-block';
  remoteToggle.style.width = '50px';
  remoteToggle.style.height = '24px';
  remoteToggle.style.marginLeft = '16px';
  
  const remoteInput = document.createElement('input');
  remoteInput.type = 'checkbox';
  remoteInput.id = 'remoteAvailable';
  remoteInput.name = 'remoteAvailable';
  remoteInput.style.opacity = '0';
  remoteInput.style.width = '0';
  remoteInput.style.height = '0';
  remoteInput.checked = listing.remoteAvailable || false;
  
  const slider = document.createElement('span');
  slider.className = 'slider';
  slider.style.position = 'absolute';
  slider.style.cursor = 'pointer';
  slider.style.top = '0';
  slider.style.left = '0';
  slider.style.right = '0';
  slider.style.bottom = '0';
  slider.style.backgroundColor = remoteInput.checked ? '#34A853' : '#ccc';
  slider.style.transition = '.4s';
  slider.style.borderRadius = '34px';
  
  slider.innerHTML = `
    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; transform: ${remoteInput.checked ? 'translateX(26px)' : 'translateX(0)'}"></span>
  `;
  
  remoteInput.addEventListener('change', function() {
    if (this.checked) {
      slider.style.backgroundColor = '#34A853';
      slider.querySelector('span').style.transform = 'translateX(26px)';
    } else {
      slider.style.backgroundColor = '#ccc';
      slider.querySelector('span').style.transform = 'translateX(0)';
    }
  });
  
  remoteToggle.appendChild(remoteInput);
  remoteToggle.appendChild(slider);
  remoteGroup.appendChild(remoteToggle);
  
  form.appendChild(remoteGroup);
  
  // Description
  const descriptionGroup = createFormGroup('Service Description', 'textarea', 'description', 'Describe your services, expertise, and what sets you apart...');
  descriptionGroup.style.gridColumn = '1 / 3';
  const descriptionInput = descriptionGroup.querySelector('textarea');
  descriptionInput.value = listing.description || '';
  form.appendChild(descriptionGroup);
  
  // Skills
  const skillsGroup = createFormGroup('Skills and Specialties', 'text', 'skills', 'e.g. Residential plumbing, water heaters, leak repair');
  skillsGroup.style.gridColumn = '1 / 3';
  const skillsInput = skillsGroup.querySelector('input');
  skillsInput.value = listing.skills || '';
  
  const skillsHelp = document.createElement('div');
  skillsHelp.textContent = 'Separate multiple skills with commas';
  skillsHelp.style.fontSize = '12px';
  skillsHelp.style.color = '#666';
  skillsHelp.style.marginTop = '4px';
  
  skillsGroup.appendChild(skillsHelp);
  form.appendChild(skillsGroup);
  
  // Contact Email
  const emailGroup = createFormGroup('Contact Email', 'email', 'contactEmail', 'e.g. your@email.com');
  emailGroup.style.gridColumn = '1 / 2';
  const emailInput = emailGroup.querySelector('input');
  emailInput.value = listing.contactEmail || '';
  form.appendChild(emailGroup);
  
  // Contact Phone
  const phoneGroup = createFormGroup('Contact Phone', 'tel', 'contactPhone', 'e.g. (555) 555-5555');
  phoneGroup.style.gridColumn = '2 / 3';
  const phoneInput = phoneGroup.querySelector('input');
  phoneInput.value = listing.contactPhone || '';
  form.appendChild(phoneGroup);
  
  // Hidden ID field to identify which listing we're editing
  const idInput = document.createElement('input');
  idInput.type = 'hidden';
  idInput.name = 'id';
  idInput.value = listing.id;
  form.appendChild(idInput);
  
  // Submit button
  const submitGroup = document.createElement('div');
  submitGroup.className = 'form-group';
  submitGroup.style.gridColumn = '1 / 3';
  submitGroup.style.marginTop = '16px';
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Save Changes';
  submitButton.style.padding = '12px 24px';
  submitButton.style.backgroundColor = '#34A853';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '4px';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.2s';
  
  submitButton.addEventListener('mouseover', () => {
    submitButton.style.backgroundColor = '#2E9748';
  });
  
  submitButton.addEventListener('mouseout', () => {
    submitButton.style.backgroundColor = '#34A853';
  });
  
  submitGroup.appendChild(submitButton);
  form.appendChild(submitGroup);
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Update listing in storage
    updateListing(data, appState);
    
    // Close the modal
    document.body.removeChild(modal);
  });
  
  formContent.appendChild(form);
  modalContent.appendChild(formContent);
  modal.appendChild(modalContent);
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Toggle a listing's active status
 */
function toggleListingStatus(listing, appState) {
  // Get current listings
  const listings = getMockServiceListings();
  
  // Find and update the listing
  const updatedListings = listings.map(item => {
    if (item.id === listing.id) {
      return { ...item, isActive: !item.isActive };
    }
    return item;
  });
  
  // Save updated listings
  if (saveServiceListings(updatedListings)) {
    // Show success message
    const statusMessage = !listing.isActive ? 'activated' : 'paused';
    alert(`Listing has been ${statusMessage} successfully.`);
    
    // Refresh the listings display
    const tabContent = document.querySelector('.tab-content');
    renderMyListings(tabContent, appState);
  }
}

/**
 * Update a listing with form data
 */
function updateListing(formData, appState) {
  // Get current listings
  const listings = getMockServiceListings();
  
  // Find and update the listing
  const updatedListings = listings.map(item => {
    if (item.id === parseInt(formData.id)) {
      return {
        ...item,
        name: formData.serviceName,
        category: formData.serviceCategory,
        pricingType: formData.pricingType,
        rate: formData.rate ? parseFloat(formData.rate) : 0,
        location: formData.location,
        radius: formData.radius ? parseInt(formData.radius) : 25,
        remoteAvailable: formData.remoteAvailable === 'on',
        description: formData.description,
        skills: formData.skills,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone
      };
    }
    return item;
  });
  
  // Save updated listings
  if (saveServiceListings(updatedListings)) {
    // Show success message
    alert('Listing updated successfully.');
    
    // Refresh the listings display
    const tabContent = document.querySelector('.tab-content');
    renderMyListings(tabContent, appState);
  }
}

/**
 * Confirm and delete a service listing
 */
function confirmDeleteListing(listing, appState) {
  if (confirm(`Are you sure you want to delete the listing "${listing.name}"? This action cannot be undone.`)) {
    // Get current listings
    const listings = getMockServiceListings();
    
    // Remove the listing
    const updatedListings = listings.filter(item => item.id !== listing.id);
    
    // Save updated listings
    if (saveServiceListings(updatedListings)) {
      // Show success message
      alert('Listing deleted successfully.');
      
      // Refresh the listings display
      const tabContent = document.querySelector('.tab-content');
      renderMyListings(tabContent, appState);
    }
  }
}
}

/**
 * Get mock inquiries data
 */
function getMockInquiries() {
  return [
    {
      id: 1,
      serviceName: 'Professional Plumbing Services',
      clientName: 'John Smith',
      date: 'Apr 20, 2025',
      message: 'I have a leaking faucet in my kitchen that needs to be repaired. Are you available this week for an estimate?',
      status: 'New'
    },
    {
      id: 2,
      serviceName: 'Professional Plumbing Services',
      clientName: 'Maria Garcia',
      date: 'Apr 19, 2025',
      message: 'We need to replace our water heater. Do you offer installation services and what would be the approximate cost?',
      status: 'Replied'
    },
    {
      id: 3,
      serviceName: 'Home Electrical Repairs',
      clientName: 'David Johnson',
      date: 'Apr 18, 2025',
      message: 'I need to install some new outlets in my home office. Can you provide a quote?',
      status: 'Closed'
    }
  ];
}

/**
 * Service Finder - Allows users to search for local services
 * Renders the interface for users to find local service providers
 */
export function renderServiceFinder(container, appState) {
  // Clear the container
  container.innerHTML = '';
  
  // Create the finder container
  const finderContainer = document.createElement('div');
  finderContainer.className = 'service-finder';
  finderContainer.style.maxWidth = '1200px';
  finderContainer.style.margin = '0 auto';
  finderContainer.style.padding = '20px';
  
  // Header
  const header = document.createElement('div');
  header.style.marginBottom = '32px';
  header.style.textAlign = 'center';
  
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = 'Find Local Services';
  headerTitle.style.marginBottom = '8px';
  header.appendChild(headerTitle);
  
  const headerDescription = document.createElement('p');
  headerDescription.textContent = 'Discover skilled professionals in your area for the services you need.';
  headerDescription.style.color = '#666';
  headerDescription.style.maxWidth = '600px';
  headerDescription.style.margin = '0 auto';
  header.appendChild(headerDescription);
  
  finderContainer.appendChild(header);
  
  // Search section
  const searchSection = document.createElement('div');
  searchSection.className = 'search-section';
  searchSection.style.backgroundColor = 'white';
  searchSection.style.borderRadius = '8px';
  searchSection.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.1)';
  searchSection.style.padding = '24px';
  searchSection.style.marginBottom = '32px';
  
  const searchForm = document.createElement('form');
  searchForm.className = 'search-form';
  searchForm.style.display = 'grid';
  searchForm.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  searchForm.style.gap = '16px';
  
  // Category select
  const categoryGroup = document.createElement('div');
  categoryGroup.className = 'form-group';
  
  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Service Category';
  categoryLabel.style.display = 'block';
  categoryLabel.style.marginBottom = '8px';
  categoryLabel.style.fontWeight = 'bold';
  categoryGroup.appendChild(categoryLabel);
  
  const categorySelect = document.createElement('select');
  categorySelect.name = 'category';
  categorySelect.style.width = '100%';
  categorySelect.style.padding = '12px';
  categorySelect.style.border = '1px solid #ddd';
  categorySelect.style.borderRadius = '4px';
  
  // Add "All Categories" option
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Categories';
  categorySelect.appendChild(allOption);
  
  // Add category options
  SERVICE_CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  
  categoryGroup.appendChild(categorySelect);
  searchForm.appendChild(categoryGroup);
  
  // Location input
  const locationGroup = document.createElement('div');
  locationGroup.className = 'form-group';
  
  const locationLabel = document.createElement('label');
  locationLabel.textContent = 'Location';
  locationLabel.style.display = 'block';
  locationLabel.style.marginBottom = '8px';
  locationLabel.style.fontWeight = 'bold';
  locationGroup.appendChild(locationLabel);
  
  const locationInput = document.createElement('input');
  locationInput.type = 'text';
  locationInput.name = 'location';
  locationInput.placeholder = 'City, State or Zip Code';
  locationInput.style.width = '100%';
  locationInput.style.padding = '12px';
  locationInput.style.border = '1px solid #ddd';
  locationInput.style.borderRadius = '4px';
  
  // Add a "Use My Location" button
  const locationRow = document.createElement('div');
  locationRow.style.display = 'flex';
  locationRow.style.alignItems = 'center';
  locationRow.style.gap = '8px';
  
  locationRow.appendChild(locationInput);
  
  const locationButton = document.createElement('button');
  locationButton.type = 'button';
  locationButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  locationButton.style.width = '40px';
  locationButton.style.height = '40px';
  locationButton.style.display = 'flex';
  locationButton.style.justifyContent = 'center';
  locationButton.style.alignItems = 'center';
  locationButton.style.backgroundColor = '#f0f0f0';
  locationButton.style.border = 'none';
  locationButton.style.borderRadius = '4px';
  locationButton.style.cursor = 'pointer';
  locationButton.title = 'Use my location';
  
  locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
      locationInput.value = 'Finding your location...';
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          // Usually you would use a reverse geocoding service here
          // For this demo, we'll just use the coordinates
          locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          // Update hidden fields
          document.getElementById('latitude').value = latitude;
          document.getElementById('longitude').value = longitude;
        },
        error => {
          locationInput.value = '';
          alert('Unable to retrieve your location. Please enter it manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  });
  
  locationRow.appendChild(locationButton);
  locationGroup.appendChild(locationRow);
  
  // Hidden fields for coordinates
  const latitudeInput = document.createElement('input');
  latitudeInput.type = 'hidden';
  latitudeInput.id = 'latitude';
  latitudeInput.name = 'latitude';
  locationGroup.appendChild(latitudeInput);
  
  const longitudeInput = document.createElement('input');
  longitudeInput.type = 'hidden';
  longitudeInput.id = 'longitude';
  longitudeInput.name = 'longitude';
  locationGroup.appendChild(longitudeInput);
  
  searchForm.appendChild(locationGroup);
  
  // Radius select
  const radiusGroup = document.createElement('div');
  radiusGroup.className = 'form-group';
  
  const radiusLabel = document.createElement('label');
  radiusLabel.textContent = 'Distance';
  radiusLabel.style.display = 'block';
  radiusLabel.style.marginBottom = '8px';
  radiusLabel.style.fontWeight = 'bold';
  radiusGroup.appendChild(radiusLabel);
  
  const radiusSelect = document.createElement('select');
  radiusSelect.name = 'radius';
  radiusSelect.style.width = '100%';
  radiusSelect.style.padding = '12px';
  radiusSelect.style.border = '1px solid #ddd';
  radiusSelect.style.borderRadius = '4px';
  
  [5, 10, 25, 50, 100].forEach(miles => {
    const option = document.createElement('option');
    option.value = miles;
    option.textContent = `${miles} miles`;
    
    // Default to 25 miles
    if (miles === 25) {
      option.selected = true;
    }
    
    radiusSelect.appendChild(option);
  });
  
  radiusGroup.appendChild(radiusSelect);
  searchForm.appendChild(radiusGroup);
  
  // Search button
  const searchGroup = document.createElement('div');
  searchGroup.className = 'form-group';
  searchGroup.style.display = 'flex';
  searchGroup.style.alignItems = 'flex-end';
  
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.textContent = 'Search';
  searchButton.style.width = '100%';
  searchButton.style.padding = '12px';
  searchButton.style.backgroundColor = '#34A853';
  searchButton.style.color = 'white';
  searchButton.style.border = 'none';
  searchButton.style.borderRadius = '4px';
  searchButton.style.fontWeight = 'bold';
  searchButton.style.cursor = 'pointer';
  searchGroup.appendChild(searchButton);
  
  searchForm.appendChild(searchGroup);
  
  // Handle search submission
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(searchForm);
    const searchParams = Object.fromEntries(formData.entries());
    
    // Update state with search params
    appState.serviceSearch = searchParams;
    
    // Display results
    renderSearchResults(resultsContainer, searchParams);
  });
  
  searchSection.appendChild(searchForm);
  finderContainer.appendChild(searchSection);
  
  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';
  
  // Initial state - categories showcase
  renderCategoriesShowcase(resultsContainer);
  
  finderContainer.appendChild(resultsContainer);
  container.appendChild(finderContainer);
}

/**
 * Render categories showcase for initial state
 */
function renderCategoriesShowcase(container) {
  const showcaseContainer = document.createElement('div');
  showcaseContainer.className = 'categories-showcase';
  
  const title = document.createElement('h3');
  title.textContent = 'Browse Services by Category';
  title.style.textAlign = 'center';
  title.style.marginBottom = '24px';
  showcaseContainer.appendChild(title);
  
  // Categories grid
  const categoriesGrid = document.createElement('div');
  categoriesGrid.style.display = 'grid';
  categoriesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
  categoriesGrid.style.gap = '16px';
  
  // Popular services - just use a subset
  const popularServices = SERVICE_CATEGORIES.slice(0, 12);
  
  popularServices.forEach(category => {
    const categoryCard = document.createElement('div');
    categoryCard.className = 'category-card';
    categoryCard.style.backgroundColor = 'white';
    categoryCard.style.borderRadius = '8px';
    categoryCard.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    categoryCard.style.padding = '20px';
    categoryCard.style.textAlign = 'center';
    categoryCard.style.cursor = 'pointer';
    categoryCard.style.transition = 'transform 0.2s, box-shadow 0.2s';
    
    // Hover effect
    categoryCard.addEventListener('mouseover', () => {
      categoryCard.style.transform = 'translateY(-4px)';
      categoryCard.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
    });
    
    categoryCard.addEventListener('mouseout', () => {
      categoryCard.style.transform = 'translateY(0)';
      categoryCard.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    });
    
    // Click handler to auto-fill search
    categoryCard.addEventListener('click', () => {
      const categorySelect = document.querySelector('select[name="category"]');
      if (categorySelect) {
        categorySelect.value = category.id;
        // Scroll to search form
        document.querySelector('.search-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    const iconContainer = document.createElement('div');
    iconContainer.style.width = '48px';
    iconContainer.style.height = '48px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = '#f0f9f4';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.margin = '0 auto 12px';
    
    const icon = document.createElement('div');
    icon.innerHTML = getIconSvg(category.icon);
    iconContainer.appendChild(icon);
    
    categoryCard.appendChild(iconContainer);
    
    const name = document.createElement('div');
    name.textContent = category.name;
    name.style.fontWeight = 'bold';
    categoryCard.appendChild(name);
    
    categoriesGrid.appendChild(categoryCard);
  });
  
  showcaseContainer.appendChild(categoriesGrid);
  container.appendChild(showcaseContainer);
  
  // Featured service providers
  const featuredSection = document.createElement('div');
  featuredSection.className = 'featured-section';
  featuredSection.style.marginTop = '40px';
  
  const featuredTitle = document.createElement('h3');
  featuredTitle.textContent = 'Featured Service Providers';
  featuredTitle.style.textAlign = 'center';
  featuredTitle.style.marginBottom = '24px';
  featuredSection.appendChild(featuredTitle);
  
  // Featured providers grid
  const providersGrid = document.createElement('div');
  providersGrid.style.display = 'grid';
  providersGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  providersGrid.style.gap = '24px';
  
  // Mock featured providers
  const featuredProviders = [
    {
      name: 'Elite Plumbing Services',
      category: 'plumber',
      location: 'Chicago, IL',
      rating: 4.9,
      reviews: 124,
      description: 'Professional plumbing services for residential and commercial properties. Available 24/7 for emergencies.'
    },
    {
      name: 'Bright Sparks Electrical',
      category: 'electrician',
      location: 'Evanston, IL',
      rating: 4.7,
      reviews: 98,
      description: 'Licensed electricians specializing in residential wiring, lighting, and electrical panel upgrades.'
    },
    {
      name: 'Green Thumb Landscaping',
      category: 'landscaper',
      location: 'Oak Park, IL',
      rating: 4.8,
      reviews: 86,
      description: 'Complete landscaping services including garden design, maintenance, and seasonal clean-up.'
    }
  ];
  
  featuredProviders.forEach(provider => {
    const providerCard = createProviderCard(provider);
    providersGrid.appendChild(providerCard);
  });
  
  featuredSection.appendChild(providersGrid);
  container.appendChild(featuredSection);
}

/**
 * Render search results
 */
function renderSearchResults(container, searchParams) {
  // Clear container
  container.innerHTML = '';
  
  // Loading indicator
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.style.textAlign = 'center';
  loading.style.padding = '40px 0';
  
  loading.innerHTML = `
    <div style="display: flex; justify-content: center; margin-bottom: 16px;">
      <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>.spinner_z9k8{transform-origin:center;animation:spinner_StKS .75s step-end infinite}@keyframes spinner_StKS{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style>
        <g class="spinner_z9k8"><circle cx="12" cy="2.5" r="1.5" fill="#34A853"/><circle cx="16.5" cy="4" r="1.5" fill="#34A853" opacity=".8"/><circle cx="19.5" cy="7.5" r="1.5" fill="#34A853" opacity=".7"/><circle cx="20.5" cy="12" r="1.5" fill="#34A853" opacity=".6"/><circle cx="19.5" cy="16.5" r="1.5" fill="#34A853" opacity=".5"/><circle cx="16.5" cy="19.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="12" cy="20.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="7.5" cy="19.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="16.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="2.5" cy="12" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="7.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="7.5" cy="4" r="1.5" fill="#34A853" opacity=".5"/></g>
      </svg>
    </div>
    <p>Searching for service providers...</p>
  `;
  
  container.appendChild(loading);
  
  // Simulate API request delay
  setTimeout(() => {
    // Remove loading indicator
    loading.remove();
    
    // Results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'results-header';
    resultsHeader.style.marginBottom = '24px';
    
    const resultsTitle = document.createElement('h3');
    
    const locationText = searchParams.location || 'your area';
    const categoryText = searchParams.category ? 
      getCategoryName(searchParams.category) : 
      'All Services';
    
    resultsTitle.textContent = `${categoryText} in ${locationText}`;
    resultsHeader.appendChild(resultsTitle);
    
    const resultsCount = document.createElement('p');
    resultsCount.style.color = '#666';
    
    // Get mock results
    const results = getMockSearchResults(searchParams);
    
    resultsCount.textContent = `Found ${results.length} service providers within ${searchParams.radius || 25} miles${
      searchParams.latitude && searchParams.longitude ? ' of your location' : ''
    }`;
    
    resultsHeader.appendChild(resultsCount);
    container.appendChild(resultsHeader);
    
    if (results.length === 0) {
      // No results state
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.style.backgroundColor = 'white';
      noResults.style.borderRadius = '8px';
      noResults.style.padding = '40px 20px';
      noResults.style.textAlign = 'center';
      
      const noResultsIcon = document.createElement('div');
      noResultsIcon.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      `;
      noResults.appendChild(noResultsIcon);
      
      const noResultsTitle = document.createElement('h4');
      noResultsTitle.textContent = 'No Service Providers Found';
      noResultsTitle.style.margin = '16px 0 8px';
      noResults.appendChild(noResultsTitle);
      
      const noResultsMessage = document.createElement('p');
      noResultsMessage.textContent = 'Try adjusting your search criteria or expanding the search radius.';
      noResultsMessage.style.color = '#666';
      noResultsMessage.style.marginBottom = '24px';
      noResults.appendChild(noResultsMessage);
      
      const resetButton = document.createElement('button');
      resetButton.textContent = 'Reset Search';
      resetButton.style.padding = '10px 20px';
      resetButton.style.backgroundColor = '#f0f0f0';
      resetButton.style.border = 'none';
      resetButton.style.borderRadius = '4px';
      resetButton.style.cursor = 'pointer';
      
      resetButton.addEventListener('click', () => {
        // Reset form fields
        const categorySelect = document.querySelector('select[name="category"]');
        const locationInput = document.querySelector('input[name="location"]');
        const radiusSelect = document.querySelector('select[name="radius"]');
        
        if (categorySelect) categorySelect.value = '';
        if (locationInput) locationInput.value = '';
        if (radiusSelect) radiusSelect.value = '25';
        
        // Reset hidden fields
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');
        
        if (latitudeInput) latitudeInput.value = '';
        if (longitudeInput) longitudeInput.value = '';
        
        // Reset to categories showcase
        renderCategoriesShowcase(container);
      });
      
      noResults.appendChild(resetButton);
      
      container.appendChild(noResults);
    } else {
      // Results grid
      const resultsGrid = document.createElement('div');
      resultsGrid.style.display = 'grid';
      resultsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      resultsGrid.style.gap = '24px';
      
      // Add provider cards
      results.forEach(provider => {
        const card = createProviderCard(provider);
        resultsGrid.appendChild(card);
      });
      
      container.appendChild(resultsGrid);
    }
  }, 1500);
}

/**
 * Create a provider card
 */
function createProviderCard(provider) {
  const card = document.createElement('div');
  card.className = 'provider-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  card.style.overflow = 'hidden';
  card.style.transition = 'transform 0.2s, box-shadow 0.2s';
  
  // Hover effect
  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  });
  
  // Category banner
  const banner = document.createElement('div');
  banner.style.height = '4px';
  banner.style.backgroundColor = '#34A853';
  card.appendChild(banner);
  
  // Card content
  const content = document.createElement('div');
  content.style.padding = '20px';
  
  // Provider name
  const nameRow = document.createElement('div');
  nameRow.style.display = 'flex';
  nameRow.style.alignItems = 'center';
  nameRow.style.gap = '8px';
  nameRow.style.marginBottom = '8px';
  
  const categoryIcon = document.createElement('span');
  categoryIcon.innerHTML = getIconSvg(getCategoryIcon(provider.category));
  categoryIcon.style.display = 'flex';
  categoryIcon.style.alignItems = 'center';
  categoryIcon.style.justifyContent = 'center';
  nameRow.appendChild(categoryIcon);
  
  const name = document.createElement('h4');
  name.textContent = provider.name;
  name.style.margin = '0';
  name.style.fontSize = '18px';
  name.style.fontWeight = 'bold';
  nameRow.appendChild(name);
  
  content.appendChild(nameRow);
  
  // Category
  const category = document.createElement('div');
  category.textContent = getCategoryName(provider.category);
  category.style.color = '#666';
  category.style.fontSize = '14px';
  category.style.marginBottom = '8px';
  content.appendChild(category);
  
  // Location
  const location = document.createElement('div');
  location.style.display = 'flex';
  location.style.alignItems = 'center';
  location.style.marginBottom = '12px';
  
  const locationIcon = document.createElement('span');
  locationIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `;
  locationIcon.style.marginRight = '4px';
  location.appendChild(locationIcon);
  
  const locationText = document.createElement('span');
  locationText.textContent = provider.location;
  locationText.style.color = '#666';
  locationText.style.fontSize = '14px';
  location.appendChild(locationText);
  
  content.appendChild(location);
  
  // Rating and reviews
  const ratingRow = document.createElement('div');
  ratingRow.style.display = 'flex';
  ratingRow.style.alignItems = 'center';
  ratingRow.style.marginBottom = '12px';
  
  // Stars
  const stars = document.createElement('div');
  stars.style.display = 'flex';
  stars.style.alignItems = 'center';
  stars.style.marginRight = '8px';
  
  const rating = Math.round(provider.rating * 10) / 10;
  
  // Generate 5 stars
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    
    if (i <= Math.floor(rating)) {
      // Full star
      star.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBC05" stroke="#FBBC05" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
    } else if (i - 0.5 <= rating) {
      // Half star
      star.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBC05" stroke="#FBBC05" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2v15.8z"/>
          <path d="M12 2v15.8l3.2 3.2-1.2-6.9 5-4.8-6.9-1L12 2z" fill="none"/>
        </svg>
      `;
    } else {
      // Empty star
      star.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBC05" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
    }
    
    stars.appendChild(star);
  }
  
  ratingRow.appendChild(stars);
  
  // Rating and reviews count
  const ratingText = document.createElement('span');
  ratingText.textContent = `${rating} (${provider.reviews} reviews)`;
  ratingText.style.color = '#666';
  ratingText.style.fontSize = '14px';
  ratingRow.appendChild(ratingText);
  
  content.appendChild(ratingRow);
  
  // Description
  const description = document.createElement('p');
  description.textContent = provider.description;
  description.style.margin = '0 0 16px 0';
  description.style.color = '#333';
  description.style.fontSize = '14px';
  description.style.lineHeight = '1.5';
  content.appendChild(description);
  
  // Contact button
  const contactButton = document.createElement('button');
  contactButton.textContent = 'Contact';
  contactButton.style.width = '100%';
  contactButton.style.padding = '10px';
  contactButton.style.backgroundColor = '#34A853';
  contactButton.style.color = 'white';
  contactButton.style.border = 'none';
  contactButton.style.borderRadius = '4px';
  contactButton.style.fontWeight = 'bold';
  contactButton.style.cursor = 'pointer';
  
  contactButton.addEventListener('click', () => {
    alert(`Contact ${provider.name}`);
  });
  
  content.appendChild(contactButton);
  
  card.appendChild(content);
  return card;
}

/**
 * Get mock search results based on search parameters
 */
function getMockSearchResults(params) {
  // Generate 10 mock results
  const allResults = [
    {
      name: 'Elite Plumbing Services',
      category: 'plumber',
      location: 'Chicago, IL',
      rating: 4.9,
      reviews: 124,
      description: 'Professional plumbing services for residential and commercial properties. Available 24/7 for emergencies.'
    },
    {
      name: 'Bright Sparks Electrical',
      category: 'electrician',
      location: 'Evanston, IL',
      rating: 4.7,
      reviews: 98,
      description: 'Licensed electricians specializing in residential wiring, lighting, and electrical panel upgrades.'
    },
    {
      name: 'Green Thumb Landscaping',
      category: 'landscaper',
      location: 'Oak Park, IL',
      rating: 4.8,
      reviews: 86,
      description: 'Complete landscaping services including garden design, maintenance, and seasonal clean-up.'
    },
    {
      name: 'Master Lock Solutions',
      category: 'locksmith',
      location: 'Chicago, IL',
      rating: 4.6,
      reviews: 72,
      description: 'Residential and commercial locksmith services including emergency lockouts, rekeying, and security upgrades.'
    },
    {
      name: 'Handy Home Repairs',
      category: 'handyman',
      location: 'Skokie, IL',
      rating: 4.5,
      reviews: 64,
      description: 'General handyman services for all your home repair and maintenance needs.'
    },
    {
      name: 'Fresh Coat Painters',
      category: 'painter',
      location: 'Chicago, IL',
      rating: 4.7,
      reviews: 58,
      description: 'Interior and exterior painting services with attention to detail and quality finishes.'
    },
    {
      name: 'Precision HVAC Solutions',
      category: 'hvac',
      location: 'Naperville, IL',
      rating: 4.8,
      reviews: 112,
      description: 'Heating, ventilation, and air conditioning services including installation, repair, and maintenance.'
    },
    {
      name: 'Sparkling Clean Services',
      category: 'cleaner',
      location: 'Chicago, IL',
      rating: 4.6,
      reviews: 92,
      description: 'Professional cleaning services for homes and businesses with eco-friendly options available.'
    },
    {
      name: 'Excel Math Tutoring',
      category: 'tutor',
      location: 'Evanston, IL',
      rating: 4.9,
      reviews: 48,
      description: 'Specialized math tutoring for students of all ages, from elementary to college level.'
    },
    {
      name: 'Creative Web Designs',
      category: 'designer',
      location: 'Chicago, IL',
      rating: 4.8,
      reviews: 76,
      description: 'Professional web design services for businesses and individuals with modern, responsive designs.'
    }
  ];
  
  // Filter by category if provided
  let filteredResults = params.category ? 
    allResults.filter(result => result.category === params.category) : 
    allResults;
  
  // In a real app, you would filter by location using coordinates
  // For this demo, we'll just return the filtered results
  return filteredResults;
}

/**
 * Get SVG for an icon
 * Basic set of icons for demo purposes
 */
function getIconSvg(iconName, color = '#34A853') {
  const icons = {
    key: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>`,
    droplet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    tool: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    hammer: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="M17.64 15L22 10.64"></path><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"></path></svg>`,
    brush: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path></svg>`,
    tree: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14v7M7 14v7M3 3l18 14H3L21 3"></path></svg>`,
    thermometer: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>`,
    sprayCan: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h.01"></path><path d="M7 5h.01"></path><path d="M11 7h.01"></path><path d="M3 7h.01"></path><path d="M7 9h.01"></path><path d="M3 11h.01"></path><rect x="13" y="11" width="8" height="12" rx="2"></rect><path d="m19 11-2-8h-2l-2 8"></path></svg>`,
    bookOpen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    penTool: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
    code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    penSquare: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    camera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    calculator: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>`,
    briefcase: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    activity: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
    paw: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3a4 4 0 0 0 4.5-5.7 4 4 0 0 0-7.3 1.7c-.3 1 0 2.8 1.3 3.5A2 2 0 0 0 5.8 11Z"></path><path d="M16 21.9a6.3 6.3 0 0 0 5.7-6.6 6.2 6.2 0 0 0-5.7-5.5 6 6 0 0 0-6.3 5c-.4 2.1.4 4.3 2 5.6.8.7 1.8 1.2 2.8 1.4"></path><path d="M8.6 10.5a3.5 3.5 0 0 0-.9-3.9c-.7-.6-1.8-.9-2.7-.5a4 4 0 0 0-2.4 2.7c-.3 1.3 0 2.8.9 3.9.7.4 1.3.5 2 .5"></path><path d="M18.4 10.3a4 4 0 0 0-4.7-5.7 4 4 0 0 0-2.4 4.2c.3.3.7 1.1 1.3 1.8a4 4 0 0 0 4.1.9c.5-.2 1-.5 1.4-1"></path></svg>`,
    moreHorizontal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>`,
    // Analytics icons
    clipboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    eye: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    messageCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    barChart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
  };
  
  return icons[iconName] || icons.moreHorizontal;
}