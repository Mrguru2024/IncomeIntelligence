/**
 * Stackr Gig Resources - Freelance and side-hustle opportunities for service providers
 * Helps users find platforms and resources for earning additional income
 */

// Available gig categories with example platforms
export const gigCategories = [
  {
    id: 'freelance',
    name: 'Freelance Services',
    description: 'Offer your professional skills on freelance marketplaces',
    platforms: [
      {
        name: 'Upwork',
        url: 'https://www.upwork.com',
        description: 'The largest freelance marketplace with diverse project types',
        beginner_friendly: true
      },
      {
        name: 'Fiverr',
        url: 'https://www.fiverr.com',
        description: 'Package and sell your services as "gigs" starting at $5',
        beginner_friendly: true
      },
      {
        name: 'Freelancer',
        url: 'https://www.freelancer.com',
        description: 'Bid on projects posted by clients worldwide',
        beginner_friendly: true
      },
      {
        name: 'PeoplePerHour',
        url: 'https://www.peopleperhour.com',
        description: 'UK-based platform with fixed-price "hourlies"',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'Getting Started on Upwork',
        url: 'https://support.upwork.com/hc/en-us/articles/211063228-Getting-Started-on-Upwork',
        type: 'guide'
      },
      {
        title: 'How to Create a Winning Fiverr Gig',
        url: 'https://learn.fiverr.com/courses/how-to-create-a-winning-fiverr-gig/',
        type: 'course'
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Delivery Gigs',
    description: 'Deliver food, groceries, and packages on your own schedule',
    platforms: [
      {
        name: 'DoorDash',
        url: 'https://www.doordash.com/dasher/signup/',
        description: 'Deliver food from restaurants to customers',
        beginner_friendly: true
      },
      {
        name: 'Instacart',
        url: 'https://shoppers.instacart.com/',
        description: 'Shop for and deliver groceries',
        beginner_friendly: true
      },
      {
        name: 'Amazon Flex',
        url: 'https://flex.amazon.com/',
        description: 'Deliver Amazon packages with your own vehicle',
        beginner_friendly: true
      },
      {
        name: 'Roadie',
        url: 'https://www.roadie.com/drivers',
        description: 'Deliver items while you\'re already driving somewhere',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'DoorDash vs Instacart: Which Pays More?',
        url: 'https://www.ridesharingdriver.com/doordash-vs-instacart-comparison-delivery-drivers/',
        type: 'article'
      },
      {
        title: 'Delivery Driver Tax Guide',
        url: 'https://www.hrblock.com/tax-center/income/other-income/filing-taxes-for-doordash-drivers/',
        type: 'guide'
      }
    ]
  },
  {
    id: 'rideshare',
    name: 'Rideshare Driving',
    description: 'Drive people around using your own vehicle',
    platforms: [
      {
        name: 'Uber',
        url: 'https://www.uber.com/drive/',
        description: 'The largest ridesharing platform worldwide',
        beginner_friendly: true
      },
      {
        name: 'Lyft',
        url: 'https://www.lyft.com/driver',
        description: 'Driver-friendly alternative to Uber',
        beginner_friendly: true
      },
      {
        name: 'HopSkipDrive',
        url: 'https://www.hopskipdrive.com/driver',
        description: 'Rideshare service focused on transporting children',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'Rideshare Insurance Guide',
        url: 'https://www.nerdwallet.com/article/insurance/best-ridesharing-insurance',
        type: 'guide'
      },
      {
        title: 'Tax Deductions for Rideshare Drivers',
        url: 'https://turbotax.intuit.com/tax-tips/self-employment-taxes/tax-tips-for-uber-and-lyft-drivers/L7sbLCSc4',
        type: 'article'
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative Services',
    description: 'Sell creative work and digital products',
    platforms: [
      {
        name: 'Etsy',
        url: 'https://www.etsy.com/sell',
        description: 'Marketplace for handmade items, vintage goods, and craft supplies',
        beginner_friendly: true
      },
      {
        name: 'Redbubble',
        url: 'https://www.redbubble.com/artist-signup',
        description: 'Print-on-demand platform for artwork on various products',
        beginner_friendly: true
      },
      {
        name: 'Envato',
        url: 'https://author.envato.com',
        description: 'Digital marketplace for creative assets and templates',
        beginner_friendly: false
      },
      {
        name: 'Teachable',
        url: 'https://teachable.com',
        description: 'Platform for creating and selling online courses',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'Getting Started on Etsy',
        url: 'https://www.etsy.com/seller-handbook/article/beginner-s-guide-to-selling-on-etsy/5945057427',
        type: 'guide'
      },
      {
        title: 'Print-on-Demand Business Guide',
        url: 'https://www.shopify.com/blog/print-on-demand',
        type: 'guide'
      }
    ]
  },
  {
    id: 'virtual',
    name: 'Virtual Services',
    description: 'Provide support services remotely',
    platforms: [
      {
        name: 'Virtual Assistant Jobs',
        url: 'https://www.virtualassistantjobs.com',
        description: 'Job board for virtual assistant positions',
        beginner_friendly: true
      },
      {
        name: 'Time etc',
        url: 'https://timeetc.com/be-a-virtual-assistant',
        description: 'Platform connecting VAs with busy professionals',
        beginner_friendly: true
      },
      {
        name: 'Fancy Hands',
        url: 'https://www.fancyhands.com/job',
        description: 'Short task-based virtual assistant work',
        beginner_friendly: true
      },
      {
        name: 'Zirtual',
        url: 'https://www.zirtual.com/apply-to-be-a-zirtual-assistant',
        description: 'Premium virtual assistant service for entrepreneurs',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'How to Become a Virtual Assistant',
        url: 'https://www.thepennyhoarder.com/make-money/side-gigs/how-to-become-a-virtual-assistant/',
        type: 'guide'
      },
      {
        title: 'Virtual Assistant Skills in Demand',
        url: 'https://www.thebalancemoney.com/virtual-assistant-skills-4580488',
        type: 'article'
      }
    ]
  }
];

/**
 * Get platforms and resources by category
 * @param {string} categoryId - Category identifier
 * @returns {Object|null} Category object with platforms and resources
 */
export function getGigCategoryById(categoryId) {
  return gigCategories.find(category => category.id === categoryId) || null;
}

/**
 * Get all beginner-friendly platforms across categories
 * @returns {Array} Array of beginner-friendly platforms with category info
 */
export function getBeginnerFriendlyPlatforms() {
  const beginnerPlatforms = [];
  
  gigCategories.forEach(category => {
    category.platforms.forEach(platform => {
      if (platform.beginner_friendly) {
        beginnerPlatforms.push({
          ...platform,
          category: category.name,
          categoryId: category.id
        });
      }
    });
  });
  
  return beginnerPlatforms;
}

/**
 * Search for gig platforms by keyword
 * @param {string} query - Search term
 * @returns {Array} Matching platforms with category info
 */
export function searchGigPlatforms(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  gigCategories.forEach(category => {
    category.platforms.forEach(platform => {
      if (
        platform.name.toLowerCase().includes(lowerQuery) ||
        platform.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          ...platform,
          category: category.name,
          categoryId: category.id
        });
      }
    });
  });
  
  return results;
}

/**
 * Get all learning resources across categories
 * @returns {Array} Array of resources with category info
 */
export function getAllGigResources() {
  const allResources = [];
  
  gigCategories.forEach(category => {
    category.resources.forEach(resource => {
      allResources.push({
        ...resource,
        category: category.name,
        categoryId: category.id
      });
    });
  });
  
  return allResources;
}

/**
 * Render gig resources browser UI
 * @param {HTMLElement} container - Container to render UI into
 * @param {Object} appState - Application state
 */
export function renderGigResourcesBrowser(container, appState) {
  if (!container) return;
  
  container.innerHTML = '';
  
  // Create header section
  const header = document.createElement('div');
  header.className = 'gig-resources-header';
  header.innerHTML = `
    <h2 class="text-2xl font-semibold mb-2">Stackr Gig Resources</h2>
    <p class="text-gray-600 mb-6">Find platforms and resources for earning more income as a service provider</p>
  `;
  
  // Create search form
  const searchForm = document.createElement('form');
  searchForm.className = 'mb-6';
  searchForm.innerHTML = `
    <div class="relative">
      <input 
        type="text" 
        id="gig-search-input" 
        placeholder="Search for platforms..." 
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
      <button 
        type="submit" 
        class="absolute right-2 top-2 text-gray-500 hover:text-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>
  `;
  
  // Create tabs for categories
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mb-6 overflow-x-auto whitespace-nowrap pb-1';
  
  // Add "All Categories" tab
  const allCategoriesTab = document.createElement('button');
  allCategoriesTab.textContent = 'All Categories';
  allCategoriesTab.className = 'px-4 py-2 mr-2 rounded-md bg-primary text-white font-medium text-sm';
  allCategoriesTab.dataset.categoryId = 'all';
  tabsContainer.appendChild(allCategoriesTab);
  
  // Add tab for each category
  gigCategories.forEach(category => {
    const tab = document.createElement('button');
    tab.textContent = category.name;
    tab.className = 'px-4 py-2 mr-2 rounded-md bg-gray-100 hover:bg-gray-200 font-medium text-sm';
    tab.dataset.categoryId = category.id;
    tabsContainer.appendChild(tab);
  });
  
  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.id = 'gig-resources-content';
  
  // Add tab click handlers
  tabsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      // Update active tab
      tabsContainer.querySelectorAll('button').forEach(btn => {
        btn.className = 'px-4 py-2 mr-2 rounded-md bg-gray-100 hover:bg-gray-200 font-medium text-sm';
      });
      e.target.className = 'px-4 py-2 mr-2 rounded-md bg-primary text-white font-medium text-sm';
      
      // Display content for selected category
      const categoryId = e.target.dataset.categoryId;
      displayCategoryContent(contentContainer, categoryId);
    }
  });
  
  // Handle search form submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('gig-search-input');
    const query = searchInput.value.trim();
    
    if (query !== '') {
      displaySearchResults(contentContainer, query);
      
      // Reset all tabs to inactive
      tabsContainer.querySelectorAll('button').forEach(btn => {
        btn.className = 'px-4 py-2 mr-2 rounded-md bg-gray-100 hover:bg-gray-200 font-medium text-sm';
      });
    }
  });
  
  // Add elements to container
  container.appendChild(header);
  container.appendChild(searchForm);
  container.appendChild(tabsContainer);
  container.appendChild(contentContainer);
  
  // Display all categories by default
  displayCategoryContent(contentContainer, 'all');
}

/**
 * Display content for selected category
 * @param {HTMLElement} container - Content container
 * @param {string} categoryId - Selected category ID or 'all'
 */
function displayCategoryContent(container, categoryId) {
  container.innerHTML = '';
  
  if (categoryId === 'all') {
    // Display all categories
    const beginner = document.createElement('div');
    beginner.className = 'mb-8';
    beginner.innerHTML = `
      <h3 class="text-xl font-semibold mb-4">Beginner-Friendly Platforms</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 beginner-platforms">
        ${getBeginnerFriendlyPlatforms().slice(0, 6).map(platform => createPlatformCard(platform)).join('')}
      </div>
    `;
    container.appendChild(beginner);
    
    // Display each category
    gigCategories.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.className = 'mb-8';
      categorySection.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">${category.name}</h3>
          <a href="#" class="text-primary text-sm font-medium view-all" data-category="${category.id}">View all</a>
        </div>
        <p class="text-gray-600 mb-4">${category.description}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 platforms">
          ${category.platforms.slice(0, 3).map(platform => createPlatformCard({...platform, categoryId: category.id})).join('')}
        </div>
      `;
      container.appendChild(categorySection);
    });
    
    // Add event listeners for "View all" links
    container.querySelectorAll('.view-all').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryId = e.target.dataset.category;
        // Find and activate the correct tab
        document.querySelector(`button[data-category-id="${categoryId}"]`).click();
      });
    });
    
    // Add resources section
    const resources = document.createElement('div');
    resources.className = 'mb-8';
    resources.innerHTML = `
      <h3 class="text-xl font-semibold mb-4">Learning Resources</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${getAllGigResources().slice(0, 6).map(resource => createResourceCard(resource)).join('')}
      </div>
    `;
    container.appendChild(resources);
    
  } else {
    // Display specific category
    const category = getGigCategoryById(categoryId);
    if (!category) return;
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'mb-6';
    categoryHeader.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${category.name}</h3>
      <p class="text-gray-600 mb-4">${category.description}</p>
    `;
    container.appendChild(categoryHeader);
    
    // Display platforms
    const platformsSection = document.createElement('div');
    platformsSection.className = 'mb-8';
    platformsSection.innerHTML = `
      <h4 class="text-lg font-medium mb-4">Available Platforms</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${category.platforms.map(platform => createPlatformCard({...platform, categoryId: category.id})).join('')}
      </div>
    `;
    container.appendChild(platformsSection);
    
    // Display resources
    if (category.resources && category.resources.length > 0) {
      const resourcesSection = document.createElement('div');
      resourcesSection.className = 'mb-8';
      resourcesSection.innerHTML = `
        <h4 class="text-lg font-medium mb-4">Learning Resources</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${category.resources.map(resource => createResourceCard({...resource, categoryId: category.id})).join('')}
        </div>
      `;
      container.appendChild(resourcesSection);
    }
  }
}

/**
 * Display search results for query
 * @param {HTMLElement} container - Content container
 * @param {string} query - Search query
 */
function displaySearchResults(container, query) {
  container.innerHTML = '';
  
  const results = searchGigPlatforms(query);
  
  const resultsHeader = document.createElement('div');
  resultsHeader.className = 'mb-6';
  resultsHeader.innerHTML = `
    <h3 class="text-xl font-semibold mb-2">Search Results for "${query}"</h3>
    <p class="text-gray-600">Found ${results.length} platforms</p>
  `;
  container.appendChild(resultsHeader);
  
  if (results.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'text-center py-8';
    noResults.innerHTML = `
      <div class="mb-4 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
      <h4 class="text-lg font-medium mb-2">No results found</h4>
      <p class="text-gray-600">Try different keywords or browse by category</p>
    `;
    container.appendChild(noResults);
    return;
  }
  
  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  resultsGrid.innerHTML = results.map(platform => createPlatformCard(platform)).join('');
  container.appendChild(resultsGrid);
}

/**
 * Create HTML for platform card
 * @param {Object} platform - Platform object
 * @returns {string} HTML string for platform card
 */
function createPlatformCard(platform) {
  return `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div class="p-5">
        <div class="flex justify-between items-start mb-2">
          <h4 class="text-lg font-semibold">${platform.name}</h4>
          ${platform.beginner_friendly ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Beginner Friendly</span>' : ''}
        </div>
        ${platform.category ? `<div class="text-sm text-primary-600 mb-2">${platform.category}</div>` : ''}
        <p class="text-gray-600 mb-4">${platform.description}</p>
        <a href="${platform.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm font-medium text-primary hover:underline">
          Visit Platform
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    </div>
  `;
}

/**
 * Create HTML for resource card
 * @param {Object} resource - Resource object
 * @returns {string} HTML string for resource card
 */
function createResourceCard(resource) {
  const typeBadge = {
    guide: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Guide</span>',
    article: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Article</span>',
    course: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Course</span>',
    video: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Video</span>'
  }[resource.type] || '';

  return `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div class="p-5">
        <div class="flex justify-between items-start mb-2">
          <h4 class="text-lg font-medium">${resource.title}</h4>
          ${typeBadge}
        </div>
        ${resource.category ? `<div class="text-sm text-primary-600 mb-2">${resource.category}</div>` : ''}
        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm font-medium text-primary hover:underline mt-2">
          View Resource
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    </div>
  `;
}