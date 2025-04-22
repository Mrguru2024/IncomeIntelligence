/**
 * Affiliate Program Hub for Stackr Finance GREEN Edition
 * This component renders a dashboard for managing affiliate programs
 */

import { 
  affiliatePrograms, 
  affiliateResources, 
  getProgramsByCategory, 
  getBeginnerFriendlyPrograms,
  searchPrograms
} from './affiliates.js';

// Affiliate program categories
const categories = [
  { id: 'all', name: 'All Programs' },
  { id: 'e-commerce', name: 'E-Commerce' },
  { id: 'tech', name: 'Technology' },
  { id: 'finance', name: 'Finance' },
  { id: 'creator economy', name: 'Creator Economy' },
  { id: 'education', name: 'Education' }
];

// Store user's affiliate data
let userAffiliates = [];
let activeCategory = 'all';
let searchQuery = '';

/**
 * Fetch user's affiliate program data
 * @param {number} userId - Current user ID
 * @returns {Promise<Array>} - User's affiliate program data
 */
async function fetchUserAffiliateData(userId) {
  try {
    const response = await fetch(`/api/user/${userId}/affiliates`);
    if (!response.ok) {
      return []; // Return empty array on error
    }
    
    const data = await response.json();
    userAffiliates = data;
    return data;
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return [];
  }
}

/**
 * Join an affiliate program
 * @param {number} userId - User ID
 * @param {string} programId - Affiliate program ID
 * @returns {Promise<Object>} - Result of joining
 */
async function joinAffiliateProgram(userId, programId) {
  try {
    const response = await fetch('/api/user/join-affiliate-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        programId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to join program');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error joining affiliate program:', error);
    throw error;
  }
}

/**
 * Create an affiliate program card
 * @param {Object} program - Program data
 * @param {boolean} isJoined - Whether user has joined
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Card element
 */
function createProgramCard(program, isJoined, userId) {
  const card = document.createElement('div');
  card.className = 'affiliate-program-card';
  card.style.border = '1px solid var(--color-border)';
  card.style.borderRadius = 'var(--radius-lg)';
  card.style.overflow = 'hidden';
  card.style.backgroundColor = 'var(--color-card)';
  card.style.marginBottom = '16px';
  card.style.transition = 'all 0.2s ease';
  card.style.boxShadow = 'var(--shadow-sm)';
  
  // Card header
  const header = document.createElement('div');
  header.style.padding = '16px';
  header.style.borderBottom = '1px solid var(--color-border)';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  
  const titleContainer = document.createElement('div');
  
  const title = document.createElement('h3');
  title.textContent = program.name;
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  titleContainer.appendChild(title);
  
  // Categories badges
  const categoriesContainer = document.createElement('div');
  categoriesContainer.style.display = 'flex';
  categoriesContainer.style.flexWrap = 'wrap';
  categoriesContainer.style.gap = '4px';
  categoriesContainer.style.marginTop = '6px';
  
  program.categories.forEach(category => {
    const badge = document.createElement('span');
    badge.textContent = category;
    badge.style.fontSize = '12px';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '4px';
    badge.style.backgroundColor = 'var(--color-primary-light)';
    badge.style.color = 'var(--color-primary-dark)';
    categoriesContainer.appendChild(badge);
  });
  
  titleContainer.appendChild(categoriesContainer);
  header.appendChild(titleContainer);
  
  // Beginner friendly badge if applicable
  if (program.beginner_friendly) {
    const beginnerBadge = document.createElement('span');
    beginnerBadge.textContent = 'Beginner Friendly';
    beginnerBadge.style.fontSize = '12px';
    beginnerBadge.style.padding = '4px 8px';
    beginnerBadge.style.borderRadius = '4px';
    beginnerBadge.style.backgroundColor = '#4caf50';
    beginnerBadge.style.color = 'white';
    header.appendChild(beginnerBadge);
  }
  
  card.appendChild(header);
  
  // Card content
  const content = document.createElement('div');
  content.style.padding = '16px';
  
  const description = document.createElement('p');
  description.textContent = program.description;
  description.style.marginTop = '0';
  description.style.color = 'var(--color-text-secondary)';
  content.appendChild(description);
  
  // Details list
  const detailsList = document.createElement('ul');
  detailsList.style.listStyle = 'none';
  detailsList.style.padding = '0';
  detailsList.style.margin = '16px 0';
  
  const commissionItem = document.createElement('li');
  commissionItem.style.display = 'flex';
  commissionItem.style.marginBottom = '8px';
  
  const commissionLabel = document.createElement('strong');
  commissionLabel.textContent = 'Commission: ';
  commissionLabel.style.marginRight = '8px';
  commissionLabel.style.minWidth = '100px';
  
  const commissionValue = document.createElement('span');
  commissionValue.textContent = program.commission;
  
  commissionItem.appendChild(commissionLabel);
  commissionItem.appendChild(commissionValue);
  detailsList.appendChild(commissionItem);
  
  const requirementsItem = document.createElement('li');
  requirementsItem.style.display = 'flex';
  requirementsItem.style.marginBottom = '8px';
  
  const requirementsLabel = document.createElement('strong');
  requirementsLabel.textContent = 'Requirements: ';
  requirementsLabel.style.marginRight = '8px';
  requirementsLabel.style.minWidth = '100px';
  
  const requirementsValue = document.createElement('span');
  requirementsValue.textContent = program.requirements;
  
  requirementsItem.appendChild(requirementsLabel);
  requirementsItem.appendChild(requirementsValue);
  detailsList.appendChild(requirementsItem);
  
  content.appendChild(detailsList);
  
  // Card actions
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '16px';
  
  const websiteButton = document.createElement('a');
  websiteButton.href = program.link;
  websiteButton.target = '_blank';
  websiteButton.textContent = 'Official Website';
  websiteButton.style.padding = '8px 16px';
  websiteButton.style.backgroundColor = 'transparent';
  websiteButton.style.border = '1px solid var(--color-primary)';
  websiteButton.style.borderRadius = 'var(--radius-md)';
  websiteButton.style.color = 'var(--color-primary)';
  websiteButton.style.textDecoration = 'none';
  websiteButton.style.fontSize = '14px';
  websiteButton.style.cursor = 'pointer';
  websiteButton.style.transition = 'all 0.2s ease';
  
  websiteButton.addEventListener('mouseenter', () => {
    websiteButton.style.backgroundColor = 'var(--color-primary-light)';
    websiteButton.style.color = 'var(--color-primary-dark)';
  });
  
  websiteButton.addEventListener('mouseleave', () => {
    websiteButton.style.backgroundColor = 'transparent';
    websiteButton.style.color = 'var(--color-primary)';
  });
  
  const joinButton = document.createElement('button');
  joinButton.textContent = isJoined ? 'Joined ✓' : 'Join Program';
  joinButton.style.padding = '8px 16px';
  joinButton.style.backgroundColor = isJoined ? '#e6f7e6' : 'var(--color-primary)';
  joinButton.style.border = 'none';
  joinButton.style.borderRadius = 'var(--radius-md)';
  joinButton.style.color = isJoined ? '#2e7d32' : 'white';
  joinButton.style.fontSize = '14px';
  joinButton.style.cursor = isJoined ? 'default' : 'pointer';
  joinButton.style.transition = 'all 0.2s ease';
  joinButton.disabled = isJoined;
  
  if (!isJoined) {
    joinButton.addEventListener('mouseenter', () => {
      joinButton.style.backgroundColor = 'var(--color-primary-dark)';
    });
    
    joinButton.addEventListener('mouseleave', () => {
      joinButton.style.backgroundColor = 'var(--color-primary)';
    });
    
    joinButton.addEventListener('click', async () => {
      try {
        joinButton.textContent = 'Joining...';
        joinButton.disabled = true;
        
        await joinAffiliateProgram(userId, program.id);
        
        joinButton.textContent = 'Joined ✓';
        joinButton.style.backgroundColor = '#e6f7e6';
        joinButton.style.color = '#2e7d32';
        
        // Add to user's affiliates
        userAffiliates.push({
          programId: program.id,
          joinedAt: new Date().toISOString(),
          status: 'active'
        });
      } catch (error) {
        joinButton.textContent = 'Failed to Join';
        joinButton.disabled = false;
        setTimeout(() => {
          joinButton.textContent = 'Join Program';
        }, 2000);
      }
    });
  }
  
  actions.appendChild(websiteButton);
  actions.appendChild(joinButton);
  content.appendChild(actions);
  
  card.appendChild(content);
  
  // Add hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = 'var(--shadow-md)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'var(--shadow-sm)';
  });
  
  return card;
}

/**
 * Create resource card
 * @param {Object} resource - Resource data
 * @returns {HTMLElement} - Card element
 */
function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  card.style.padding = '16px';
  card.style.border = '1px solid var(--color-border)';
  card.style.borderRadius = 'var(--radius-md)';
  card.style.backgroundColor = 'var(--color-card)';
  card.style.marginBottom = '12px';
  
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '8px';
  
  const title = document.createElement('h4');
  title.textContent = resource.title;
  title.style.margin = '0';
  title.style.fontSize = '16px';
  title.style.fontWeight = 'bold';
  header.appendChild(title);
  
  // Difficulty badge
  const difficultyBadge = document.createElement('span');
  difficultyBadge.textContent = resource.difficulty;
  difficultyBadge.style.fontSize = '12px';
  difficultyBadge.style.padding = '2px 8px';
  difficultyBadge.style.borderRadius = '4px';
  
  // Style based on difficulty
  switch (resource.difficulty) {
    case 'beginner':
      difficultyBadge.style.backgroundColor = '#e6f7e6';
      difficultyBadge.style.color = '#2e7d32';
      break;
    case 'intermediate':
      difficultyBadge.style.backgroundColor = '#fff8e1';
      difficultyBadge.style.color = '#f57c00';
      break;
    case 'advanced':
      difficultyBadge.style.backgroundColor = '#ffebee';
      difficultyBadge.style.color = '#c62828';
      break;
    default:
      difficultyBadge.style.backgroundColor = '#e0e0e0';
      difficultyBadge.style.color = '#616161';
  }
  
  header.appendChild(difficultyBadge);
  card.appendChild(header);
  
  const description = document.createElement('p');
  description.textContent = resource.description;
  description.style.margin = '0';
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text-secondary)';
  card.appendChild(description);
  
  return card;
}

/**
 * Create category tabs
 * @param {Array} categories - List of categories
 * @param {string} activeCategory - Current active category
 * @param {Function} onSelect - Category selection callback
 * @returns {HTMLElement} - Tabs container
 */
function createCategoryTabs(categories, activeCategory, onSelect) {
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.overflowX = 'auto';
  tabsContainer.style.gap = '8px';
  tabsContainer.style.padding = '4px 0';
  tabsContainer.style.marginBottom = '24px';
  
  categories.forEach(category => {
    const tab = document.createElement('button');
    tab.textContent = category.name;
    tab.style.padding = '8px 16px';
    tab.style.borderRadius = 'var(--radius-md)';
    tab.style.border = 'none';
    tab.style.fontSize = '14px';
    tab.style.cursor = 'pointer';
    tab.style.whiteSpace = 'nowrap';
    
    // Style active/inactive state
    if (category.id === activeCategory) {
      tab.style.backgroundColor = 'var(--color-primary)';
      tab.style.color = 'white';
    } else {
      tab.style.backgroundColor = 'var(--color-background-alt, #f5f5f5)';
      tab.style.color = 'var(--color-text)';
    }
    
    tab.addEventListener('click', () => {
      onSelect(category.id);
    });
    
    tabsContainer.appendChild(tab);
  });
  
  return tabsContainer;
}

/**
 * Create search bar
 * @param {Function} onSearch - Search callback
 * @returns {HTMLElement} - Search form
 */
function createSearchBar(onSearch) {
  const searchContainer = document.createElement('div');
  searchContainer.style.marginBottom = '24px';
  
  const searchForm = document.createElement('form');
  searchForm.style.display = 'flex';
  searchForm.style.gap = '8px';
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    onSearch(query);
  });
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search programs...';
  searchInput.style.flex = '1';
  searchInput.style.padding = '10px 12px';
  searchInput.style.border = '1px solid var(--color-border)';
  searchInput.style.borderRadius = 'var(--radius-md)';
  searchInput.style.fontSize = '14px';
  
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  searchButton.style.padding = '8px 16px';
  searchButton.style.backgroundColor = 'var(--color-primary)';
  searchButton.style.color = 'white';
  searchButton.style.border = 'none';
  searchButton.style.borderRadius = 'var(--radius-md)';
  searchButton.style.cursor = 'pointer';
  searchButton.style.display = 'flex';
  searchButton.style.alignItems = 'center';
  searchButton.style.justifyContent = 'center';
  
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  
  searchContainer.appendChild(searchForm);
  return searchContainer;
}

/**
 * Render the affiliate programs section
 * @param {Array} programs - List of programs to display
 * @param {Array} userAffiliates - User's joined programs
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Programs container
 */
function renderProgramsList(programs, userAffiliates, userId) {
  const container = document.createElement('div');
  container.className = 'programs-list';
  
  if (programs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '32px';
    emptyState.style.backgroundColor = 'var(--color-background-alt, #f5f5f5)';
    emptyState.style.borderRadius = 'var(--radius-lg)';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 15h8"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>';
    emptyIcon.style.marginBottom = '16px';
    emptyIcon.style.color = 'var(--color-text-secondary)';
    
    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'No programs found';
    emptyTitle.style.marginBottom = '8px';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'Try a different category or search term';
    emptyText.style.color = 'var(--color-text-secondary)';
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyTitle);
    emptyState.appendChild(emptyText);
    
    container.appendChild(emptyState);
    return container;
  }
  
  programs.forEach(program => {
    // Check if user has joined this program
    const isJoined = userAffiliates.some(
      affiliate => affiliate.programId === program.id && affiliate.status === 'active'
    );
    
    const card = createProgramCard(program, isJoined, userId);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Render the affiliate resources section
 * @param {Array} resources - List of resources
 * @returns {HTMLElement} - Resources container
 */
function renderResourcesList(resources) {
  const container = document.createElement('div');
  container.className = 'resources-list';
  
  const header = document.createElement('h3');
  header.textContent = 'Affiliate Marketing Resources';
  header.style.marginBottom = '16px';
  container.appendChild(header);
  
  resources.forEach(resource => {
    const card = createResourceCard(resource);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Render metrics card showing affiliate performance
 * @param {Array} userAffiliates - User's affiliates data 
 * @returns {HTMLElement} - Metrics card
 */
function renderMetricsCard(userAffiliates) {
  const card = document.createElement('div');
  card.className = 'metrics-card';
  card.style.backgroundColor = 'var(--color-card)';
  card.style.borderRadius = 'var(--radius-lg)';
  card.style.padding = '24px';
  card.style.marginBottom = '24px';
  card.style.boxShadow = 'var(--shadow-md)';
  
  const header = document.createElement('h3');
  header.textContent = 'Your Affiliate Performance';
  header.style.marginTop = '0';
  header.style.marginBottom = '16px';
  card.appendChild(header);
  
  // Active programs count 
  const activeCount = userAffiliates.filter(
    affiliate => affiliate.status === 'active'
  ).length;
  
  // Create metrics grid
  const metricsGrid = document.createElement('div');
  metricsGrid.style.display = 'grid';
  metricsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(160px, 1fr))';
  metricsGrid.style.gap = '16px';
  
  const createMetricItem = (label, value, suffix = '') => {
    const item = document.createElement('div');
    item.style.textAlign = 'center';
    
    const valueEl = document.createElement('div');
    valueEl.style.fontSize = '32px';
    valueEl.style.fontWeight = 'bold';
    valueEl.style.color = 'var(--color-primary)';
    valueEl.textContent = value + suffix;
    
    const labelEl = document.createElement('div');
    labelEl.style.fontSize = '14px';
    labelEl.style.color = 'var(--color-text-secondary)';
    labelEl.textContent = label;
    
    item.appendChild(valueEl);
    item.appendChild(labelEl);
    
    return item;
  };
  
  metricsGrid.appendChild(createMetricItem('Active Programs', activeCount));
  metricsGrid.appendChild(createMetricItem('Total Earnings', '$0.00'));
  metricsGrid.appendChild(createMetricItem('Click Conversions', '0%'));
  
  card.appendChild(metricsGrid);
  
  return card;
}

/**
 * Render the affiliate hub page
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Page container
 */
export function renderAffiliateHub(userId) {
  const container = document.createElement('div');
  container.className = 'affiliate-hub-page';
  
  // Page header
  const header = document.createElement('div');
  header.style.marginBottom = '32px';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Affiliate Program Hub';
  pageTitle.style.marginBottom = '8px';
  header.appendChild(pageTitle);
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Join affiliate programs to earn additional income by promoting products and services.';
  pageDescription.style.color = 'var(--color-text-secondary)';
  pageDescription.style.fontSize = '16px';
  pageDescription.style.maxWidth = '800px';
  header.appendChild(pageDescription);
  
  container.appendChild(header);
  
  // Placeholder for metrics card
  const metricsContainer = document.createElement('div');
  container.appendChild(metricsContainer);
  
  // Main content sections - two columns on desktop
  const contentSection = document.createElement('div');
  contentSection.style.display = 'flex';
  contentSection.style.flexDirection = 'column';
  contentSection.style.gap = '32px';
  
  // On desktop, use two columns
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  if (mediaQuery.matches) {
    contentSection.style.flexDirection = 'row';
  }
  
  // Programs column - takes 2/3 of space on desktop
  const programsColumn = document.createElement('div');
  programsColumn.style.flex = mediaQuery.matches ? '2' : '1';
  
  // Programs section title
  const programsTitle = document.createElement('h2');
  programsTitle.textContent = 'Available Programs';
  programsTitle.style.marginBottom = '16px';
  programsColumn.appendChild(programsTitle);
  
  // Search bar
  const searchBar = createSearchBar((query) => {
    searchQuery = query;
    updateProgramsList(userId);
  });
  programsColumn.appendChild(searchBar);
  
  // Category tabs
  const categoryTabs = createCategoryTabs(categories, activeCategory, (category) => {
    activeCategory = category;
    updateProgramsList(userId);
  });
  programsColumn.appendChild(categoryTabs);
  
  // Programs list container
  const programsListContainer = document.createElement('div');
  programsListContainer.className = 'programs-list-container';
  programsColumn.appendChild(programsListContainer);
  
  // Resources column - takes 1/3 of space on desktop
  const resourcesColumn = document.createElement('div');
  resourcesColumn.style.flex = mediaQuery.matches ? '1' : '1';
  
  // Resources are added separately to avoid layout shifts
  resourcesColumn.appendChild(renderResourcesList(affiliateResources));
  
  contentSection.appendChild(programsColumn);
  contentSection.appendChild(resourcesColumn);
  container.appendChild(contentSection);
  
  // Function to update programs list based on category and search
  function updateProgramsList(userId) {
    // Filter programs based on active category and search query
    let filteredPrograms = [];
    
    if (activeCategory === 'all') {
      filteredPrograms = affiliatePrograms;
    } else {
      filteredPrograms = getProgramsByCategory(activeCategory);
    }
    
    if (searchQuery) {
      filteredPrograms = filteredPrograms.filter(program => 
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Clear and repopulate programs list
    programsListContainer.innerHTML = '';
    programsListContainer.appendChild(renderProgramsList(filteredPrograms, userAffiliates, userId));
  }
  
  // Load data and render
  fetchUserAffiliateData(userId).then(data => {
    userAffiliates = data;
    
    // Render metrics
    metricsContainer.appendChild(renderMetricsCard(userAffiliates));
    
    // Initial programs list render
    updateProgramsList(userId);
  });
  
  return container;
}