// GREEN Edition - No dependencies on any external libraries - completely self-contained
// Simple single-page application with route handling

// Setup modern design system with CSS variables
function setupDesignSystem() {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', '#34A853');
  root.style.setProperty('--color-primary-dark', '#2E8545');
  root.style.setProperty('--color-primary-light', '#6FCF8A');
  root.style.setProperty('--color-accent', '#4285F4');
  root.style.setProperty('--color-accent-dark', '#3B77DB');
  root.style.setProperty('--color-secondary', '#FBBC05');
  root.style.setProperty('--color-error', '#EA4335');
  root.style.setProperty('--color-success', '#34A853');
  
  // Neutral colors
  root.style.setProperty('--color-background', '#FFFFFF');
  root.style.setProperty('--color-card', '#F9FAFB');
  root.style.setProperty('--color-text-primary', '#333333');
  root.style.setProperty('--color-text-secondary', '#6B7280');
  root.style.setProperty('--color-text-tertiary', '#9CA3AF');
  root.style.setProperty('--color-border', '#E5E7EB');
  
  // Dark mode colors
  root.style.setProperty('--color-background-dark', '#1F2937');
  root.style.setProperty('--color-card-dark', '#374151');
  root.style.setProperty('--color-text-primary-dark', '#F9FAFB');
  root.style.setProperty('--color-text-secondary-dark', '#D1D5DB');
  root.style.setProperty('--color-text-tertiary-dark', '#9CA3AF');
  root.style.setProperty('--color-border-dark', '#4B5563');
  
  // Spacing
  root.style.setProperty('--spacing-xs', '0.25rem');
  root.style.setProperty('--spacing-sm', '0.5rem');
  root.style.setProperty('--spacing-md', '1rem');
  root.style.setProperty('--spacing-lg', '1.5rem');
  root.style.setProperty('--spacing-xl', '2rem');
  root.style.setProperty('--spacing-xxl', '3rem');
  
  // Border radius
  root.style.setProperty('--radius-sm', '0.25rem');
  root.style.setProperty('--radius-md', '0.5rem');
  root.style.setProperty('--radius-lg', '1rem');
  root.style.setProperty('--radius-full', '9999px');
  
  // Shadows
  root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
  root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
  root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
  
  // Typography
  root.style.setProperty('--font-family', "'Inter', system-ui, -apple-system, sans-serif");
  root.style.setProperty('--font-size-xs', '0.75rem');
  root.style.setProperty('--font-size-sm', '0.875rem');
  root.style.setProperty('--font-size-md', '1rem');
  root.style.setProperty('--font-size-lg', '1.125rem');
  root.style.setProperty('--font-size-xl', '1.25rem');
  root.style.setProperty('--font-size-2xl', '1.5rem');
  root.style.setProperty('--font-size-3xl', '1.875rem');
  root.style.setProperty('--font-size-4xl', '2.25rem');
  
  // Set default font
  document.body.style.fontFamily = 'var(--font-family)';
  document.body.style.color = 'var(--color-text-primary)';
  document.body.style.backgroundColor = 'var(--color-background)';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.transition = 'background-color 0.3s ease';
}

// Application state
const appState = {
  currentPage: null,
  darkMode: localStorage.getItem('darkMode') === 'true',
  user: null,
  income: [],
  expenses: [],
  gigs: [],
  notifications: [],
  subscriptions: [],
  budgetAllocations: {
    needs: 40,
    investments: 30,
    wants: 30
  }
};

// Check if user is authenticated
function checkAuthentication() {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    appState.user = JSON.parse(storedUser);
    return true;
  }
  return false;
}

// Load state from localStorage
function loadStateFromStorage() {
  // Load income data
  const storedIncome = localStorage.getItem('income');
  if (storedIncome) {
    appState.income = JSON.parse(storedIncome);
  }
  
  // Load expenses data
  const storedExpenses = localStorage.getItem('expenses');
  if (storedExpenses) {
    appState.expenses = JSON.parse(storedExpenses);
  }
  
  // Load gigs data
  const storedGigs = localStorage.getItem('gigs');
  if (storedGigs) {
    appState.gigs = JSON.parse(storedGigs);
  }
  
  // Load subscriptions data
  const storedSubscriptions = localStorage.getItem('subscriptions');
  if (storedSubscriptions) {
    appState.subscriptions = JSON.parse(storedSubscriptions);
  }
  
  // Load budget allocations
  const storedBudgetAllocations = localStorage.getItem('budgetAllocations');
  if (storedBudgetAllocations) {
    appState.budgetAllocations = JSON.parse(storedBudgetAllocations);
  }
  
  // Load dark mode preference
  if (appState.darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
}

// Save state to localStorage
function saveStateToStorage() {
  // Save important state pieces to localStorage
  localStorage.setItem('income', JSON.stringify(appState.income));
  localStorage.setItem('expenses', JSON.stringify(appState.expenses));
  localStorage.setItem('gigs', JSON.stringify(appState.gigs));
  localStorage.setItem('subscriptions', JSON.stringify(appState.subscriptions));
  localStorage.setItem('budgetAllocations', JSON.stringify(appState.budgetAllocations));
  localStorage.setItem('darkMode', appState.darkMode.toString());
  
  if (appState.user) {
    localStorage.setItem('user', JSON.stringify(appState.user));
  }
}

// Create application layout
function createLayout() {
  const app = document.getElementById('root');
  if (!app) return;
  
  app.innerHTML = '';
  
  // Create header
  const header = createHeader();
  app.appendChild(header);
  
  // Create main content container
  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = 'container mx-auto p-4';
  app.appendChild(main);
  
  // Create footer
  const footer = createFooter();
  app.appendChild(footer);
  
  return main;
}

// Fallback header for when auth is not available
function createFallbackHeader() {
  const header = document.createElement('header');
  header.className = 'bg-white dark:bg-gray-800 shadow-md p-4';
  
  const container = document.createElement('div');
  container.className = 'container mx-auto flex justify-between items-center';
  
  const logoContainer = document.createElement('div');
  logoContainer.className = 'flex items-center';
  logoContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mr-2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
    <span class="text-xl font-bold">Stackr</span>
  `;
  
  const nav = document.createElement('nav');
  nav.className = 'flex space-x-4';
  nav.innerHTML = `
    <a href="#" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Home</a>
    <a href="#login" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Login</a>
  `;
  
  container.appendChild(logoContainer);
  container.appendChild(nav);
  header.appendChild(container);
  
  return header;
}

// Create navigation header
function createHeader() {
  if (!appState.user) {
    return createFallbackHeader();
  }
  
  const header = document.createElement('header');
  header.className = 'bg-white dark:bg-gray-800 shadow-md p-4';
  
  const container = document.createElement('div');
  container.className = 'container mx-auto flex justify-between items-center';
  
  const logoContainer = document.createElement('div');
  logoContainer.className = 'flex items-center';
  logoContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mr-2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
    <span class="text-xl font-bold">Stackr</span>
  `;
  
  const nav = document.createElement('nav');
  nav.className = 'hidden md:flex space-x-4';
  
  const navItems = [
    { url: '#dashboard', text: 'Dashboard' },
    { url: '#income', text: 'Income' },
    { url: '#expenses', text: 'Expenses' },
    { url: '#gigs', text: 'Gigs' },
    { url: '#settings', text: 'Settings' }
  ];
  
  navItems.forEach(item => {
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.text;
    link.className = 'px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700';
    if (window.location.hash === item.url) {
      link.classList.add('bg-gray-100', 'dark:bg-gray-700');
    }
    nav.appendChild(link);
  });
  
  const userMenu = document.createElement('div');
  userMenu.className = 'relative ml-3';
  userMenu.innerHTML = `
    <div>
      <button type="button" class="flex text-sm rounded-full focus:outline-none" id="user-menu-button">
        <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
          ${appState.user.username.charAt(0).toUpperCase()}
        </div>
      </button>
    </div>
  `;
  
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none';
  darkModeToggle.innerHTML = appState.darkMode 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  
  darkModeToggle.addEventListener('click', () => {
    appState.darkMode = !appState.darkMode;
    if (appState.darkMode) {
      document.documentElement.classList.add('dark-mode');
      darkModeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
      document.documentElement.classList.remove('dark-mode');
      darkModeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
    saveStateToStorage();
  });
  
  const rightSection = document.createElement('div');
  rightSection.className = 'flex items-center';
  rightSection.appendChild(nav);
  rightSection.appendChild(darkModeToggle);
  rightSection.appendChild(userMenu);
  
  container.appendChild(logoContainer);
  container.appendChild(rightSection);
  
  header.appendChild(container);
  
  return header;
}

// Create footer with copyright and links
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'bg-white dark:bg-gray-800 py-6 mt-12 border-t border-gray-200 dark:border-gray-700';
  
  const container = document.createElement('div');
  container.className = 'container mx-auto px-4';
  
  const content = document.createElement('div');
  content.className = 'flex flex-col md:flex-row justify-between items-center';
  
  const copyright = document.createElement('div');
  copyright.className = 'text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0';
  copyright.innerHTML = `&copy; ${new Date().getFullYear()} Stackr Finance. All rights reserved.`;
  
  const links = document.createElement('div');
  links.className = 'flex space-x-6';
  links.innerHTML = `
    <a href="#" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Terms</a>
    <a href="#" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Privacy</a>
    <a href="#" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Help</a>
  `;
  
  content.appendChild(copyright);
  content.appendChild(links);
  container.appendChild(content);
  footer.appendChild(container);
  
  return footer;
}

// Create card component
function createCard(title, content, accent = false, icon = null) {
  const card = document.createElement('div');
  card.className = `bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${accent ? 'border-l-4 border-primary' : ''}`;
  
  let titleHtml = '';
  if (icon) {
    titleHtml = `
      <div class="flex items-center mb-4">
        <div class="rounded-full bg-primary-light dark:bg-primary-dark p-2 mr-3">
          ${icon}
        </div>
        <h3 class="text-lg font-semibold">${title}</h3>
      </div>
    `;
  } else {
    titleHtml = `<h3 class="text-lg font-semibold mb-4">${title}</h3>`;
  }
  
  card.innerHTML = `
    ${titleHtml}
    <div class="card-content">
      ${content}
    </div>
  `;
  
  return card;
}

// Create button component
function createButton(text, onClick, color = 'var(--color-primary)', icon = null, variant = 'filled') {
  const button = document.createElement('button');
  
  let className = 'px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors duration-200';
  if (variant === 'filled') {
    button.style.backgroundColor = color;
    button.style.color = '#ffffff';
    className += ' hover:opacity-90';
  } else if (variant === 'outline') {
    button.style.borderColor = color;
    button.style.borderWidth = '1px';
    button.style.borderStyle = 'solid';
    button.style.color = color;
    button.style.backgroundColor = 'transparent';
    className += ' hover:bg-opacity-10';
    button.style.setProperty('--hover-bg', applyColorOverlay(color, 'rgba(255,255,255,0.9)'));
  } else if (variant === 'text') {
    button.style.color = color;
    button.style.backgroundColor = 'transparent';
    className += ' hover:bg-opacity-10';
    button.style.setProperty('--hover-bg', applyColorOverlay(color, 'rgba(255,255,255,0.9)'));
  }
  
  button.className = className;
  
  if (icon) {
    button.innerHTML = `
      <div class="flex items-center">
        ${icon}
        <span class="ml-2">${text}</span>
      </div>
    `;
  } else {
    button.textContent = text;
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

// Apply color overlay (for hover effects)
function applyColorOverlay(baseColor, overlayColor) {
  // Simplified overlay for demo purposes
  return baseColor;
}

// Create input component 
function createInput(type, placeholder, value = '', onChange) {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.className = 'w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';
  
  if (onChange) {
    input.addEventListener('input', onChange);
  }
  
  return input;
}

// Create form group with label
function createFormGroup(labelText, inputElement) {
  const group = document.createElement('div');
  group.className = 'mb-4';
  
  const label = document.createElement('label');
  label.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  label.textContent = labelText;
  
  group.appendChild(label);
  group.appendChild(inputElement);
  
  return group;
}

// Create income split visualization
function createSplitVisualization(splitRatio) {
  const container = document.createElement('div');
  container.className = 'my-6';
  
  const barContainer = document.createElement('div');
  barContainer.className = 'h-8 rounded-lg overflow-hidden flex';
  
  const needs = document.createElement('div');
  needs.className = 'bg-primary';
  needs.style.width = `${splitRatio.needs}%`;
  needs.title = `Needs: ${splitRatio.needs}%`;
  
  const investments = document.createElement('div');
  investments.className = 'bg-accent';
  investments.style.width = `${splitRatio.investments}%`;
  investments.title = `Investments: ${splitRatio.investments}%`;
  
  const wants = document.createElement('div');
  wants.className = 'bg-secondary';
  wants.style.width = `${splitRatio.wants}%`;
  wants.title = `Wants: ${splitRatio.wants}%`;
  
  barContainer.appendChild(needs);
  barContainer.appendChild(investments);
  barContainer.appendChild(wants);
  
  const legend = document.createElement('div');
  legend.className = 'flex justify-between mt-2 text-sm';
  legend.innerHTML = `
    <div class="flex items-center">
      <div class="w-3 h-3 rounded-sm bg-primary mr-1"></div>
      <span>Needs (${splitRatio.needs}%)</span>
    </div>
    <div class="flex items-center">
      <div class="w-3 h-3 rounded-sm bg-accent mr-1"></div>
      <span>Investments (${splitRatio.investments}%)</span>
    </div>
    <div class="flex items-center">
      <div class="w-3 h-3 rounded-sm bg-secondary mr-1"></div>
      <span>Wants (${splitRatio.wants}%)</span>
    </div>
  `;
  
  container.appendChild(barContainer);
  container.appendChild(legend);
  
  return container;
}

// Calculate income statistics
function calculateIncomeStats() {
  if (!appState.income || appState.income.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0
    };
  }
  
  const amounts = appState.income.map(item => parseFloat(item.amount));
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const average = total / amounts.length;
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  
  return {
    total: total.toFixed(2),
    average: average.toFixed(2),
    highest: highest.toFixed(2),
    lowest: lowest.toFixed(2),
    count: amounts.length
  };
}

// Render dashboard page
function renderDashboardPage() {
  const container = document.createElement('div');
  
  // Welcome section
  const welcomeSection = document.createElement('div');
  welcomeSection.className = 'mb-8';
  welcomeSection.innerHTML = `
    <h1 class="text-3xl font-bold mb-2">Welcome back, ${appState.user?.username || 'User'}!</h1>
    <p class="text-gray-600 dark:text-gray-400">Here's an overview of your finances.</p>
  `;
  
  // Stats cards
  const statsSection = document.createElement('div');
  statsSection.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8';
  
  const incomeStats = calculateIncomeStats();
  
  const incomeCard = createCard('Total Income', `
    <div class="flex justify-between items-center">
      <span class="text-2xl font-bold">$${incomeStats.total}</span>
      <span class="text-sm text-green-600 bg-green-100 rounded-full px-2 py-1">+5.2%</span>
    </div>
    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">From ${incomeStats.count} sources</p>
  `, true, '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>');
  
  const expensesTotal = appState.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2);
  const expensesCard = createCard('Total Expenses', `
    <div class="flex justify-between items-center">
      <span class="text-2xl font-bold">$${expensesTotal}</span>
      <span class="text-sm text-red-600 bg-red-100 rounded-full px-2 py-1">-2.8%</span>
    </div>
    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">From ${appState.expenses.length} expenses</p>
  `, true, '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.414 5a1 1 0 01-1.414 1.414L12.293 4.707 11 6a1 1 0 01-1.414-1.414l2-2A1 1 0 0112 2zm0 10a1 1 0 01.707.293l.707.707L15.414 15a1 1 0 01-1.414 1.414l-1.707-1.707L11 16a1 1 0 01-1.414-1.414l2-2A1 1 0 0112 12z" clip-rule="evenodd" /></svg>');
  
  const balance = (parseFloat(incomeStats.total) - parseFloat(expensesTotal)).toFixed(2);
  const balanceCard = createCard('Current Balance', `
    <div class="flex justify-between items-center">
      <span class="text-2xl font-bold">$${balance}</span>
      <span class="text-sm text-green-600 bg-green-100 rounded-full px-2 py-1">Healthy</span>
    </div>
    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">As of ${new Date().toLocaleDateString()}</p>
  `, true, '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>');
  
  const gigsActive = appState.gigs.filter(gig => gig.status === 'active').length;
  const gigsCard = createCard('Active Gigs', `
    <div class="flex justify-between items-center">
      <span class="text-2xl font-bold">${gigsActive}</span>
      <span class="text-sm text-blue-600 bg-blue-100 rounded-full px-2 py-1">+ Add</span>
    </div>
    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">Out of ${appState.gigs.length} total gigs</p>
  `, true, '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>');
  
  statsSection.appendChild(incomeCard);
  statsSection.appendChild(expensesCard);
  statsSection.appendChild(balanceCard);
  statsSection.appendChild(gigsCard);
  
  // Income Split Section
  const splitSection = document.createElement('div');
  splitSection.className = 'mb-8';
  
  const splitSectionTitle = document.createElement('h2');
  splitSectionTitle.className = 'text-xl font-semibold mb-4';
  splitSectionTitle.textContent = 'Your 40/30/30 Split';
  
  const splitVisualization = createSplitVisualization(appState.budgetAllocations);
  
  splitSection.appendChild(splitSectionTitle);
  splitSection.appendChild(splitVisualization);
  
  // Quick Actions Section
  const quickActionsSection = document.createElement('div');
  quickActionsSection.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8';
  
  const addIncomeCard = createCard('Add Income', `
    <p class="text-gray-500 dark:text-gray-400 mb-4">Record your latest income source.</p>
    <div class="flex justify-end">
      <a href="#income/add" class="text-primary hover:text-primary-dark transition-colors">Add Now →</a>
    </div>
  `);
  
  const trackExpenseCard = createCard('Track Expense', `
    <p class="text-gray-500 dark:text-gray-400 mb-4">Log a new expense to keep your budget up to date.</p>
    <div class="flex justify-end">
      <a href="#expenses/add" class="text-primary hover:text-primary-dark transition-colors">Track Now →</a>
    </div>
  `);
  
  const findGigCard = createCard('Find Gigs', `
    <p class="text-gray-500 dark:text-gray-400 mb-4">Discover new income opportunities.</p>
    <div class="flex justify-end">
      <a href="#gigs/discover" class="text-primary hover:text-primary-dark transition-colors">Find Now →</a>
    </div>
  `);
  
  quickActionsSection.appendChild(addIncomeCard);
  quickActionsSection.appendChild(trackExpenseCard);
  quickActionsSection.appendChild(findGigCard);
  
  // Recent Activity Section
  const recentActivitySection = document.createElement('div');
  recentActivitySection.className = 'mb-8';
  
  const recentActivityTitle = document.createElement('h2');
  recentActivityTitle.className = 'text-xl font-semibold mb-4';
  recentActivityTitle.textContent = 'Recent Activity';
  
  const activityList = document.createElement('div');
  activityList.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden';
  
  // Combined and sorted recent activity
  const allActivity = [
    ...appState.income.map(item => ({ 
      ...item, 
      type: 'income',
      label: 'Income',
      color: 'green'
    })),
    ...appState.expenses.map(item => ({ 
      ...item, 
      type: 'expense',
      label: 'Expense',
      color: 'red'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  if (allActivity.length > 0) {
    const activityItems = allActivity.map(activity => {
      const date = new Date(activity.date).toLocaleDateString();
      return `
        <div class="border-b border-gray-200 dark:border-gray-700 last:border-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-${activity.color}-500" viewBox="0 0 20 20" fill="currentColor">
                  ${activity.type === 'income' 
                    ? '<path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />'
                    : '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />'
                  }
                </svg>
              </div>
              <div>
                <div class="font-medium">${activity.description}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${date}</div>
              </div>
            </div>
            <div class="text-${activity.color}-${activity.type === 'income' ? '600' : '500'} font-medium">
              ${activity.type === 'income' ? '+' : '-'}$${parseFloat(activity.amount).toFixed(2)}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    activityList.innerHTML = activityItems;
  } else {
    activityList.innerHTML = `
      <div class="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No recent activity to display.</p>
        <p class="mt-2 text-sm">Start by adding income or expenses!</p>
      </div>
    `;
  }
  
  recentActivitySection.appendChild(recentActivityTitle);
  recentActivitySection.appendChild(activityList);
  
  // Assemble the page
  container.appendChild(welcomeSection);
  container.appendChild(statsSection);
  container.appendChild(splitSection);
  container.appendChild(quickActionsSection);
  container.appendChild(recentActivitySection);
  
  return container;
}

// Render income page
function renderIncomePage() {
  const container = document.createElement('div');
  
  // Header section
  const headerSection = document.createElement('div');
  headerSection.className = 'flex justify-between items-center mb-6';
  
  const headerTitle = document.createElement('div');
  headerTitle.innerHTML = `
    <h1 class="text-2xl font-bold">Income Tracker</h1>
    <p class="text-gray-600 dark:text-gray-400">Manage and monitor your income sources</p>
  `;
  
  const addIncomeButton = createButton('Add Income', () => {
    window.location.hash = '#income/add';
  }, 'var(--color-primary)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>');
  
  headerSection.appendChild(headerTitle);
  headerSection.appendChild(addIncomeButton);
  
  // Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6';
  
  const incomeStats = calculateIncomeStats();
  
  const totalIncomeCard = createCard('Total Income', `<div class="text-2xl font-bold">$${incomeStats.total}</div>`);
  const averageIncomeCard = createCard('Average Income', `<div class="text-2xl font-bold">$${incomeStats.average}</div>`);
  const highestIncomeCard = createCard('Highest Income', `<div class="text-2xl font-bold">$${incomeStats.highest}</div>`);
  const lowestIncomeCard = createCard('Lowest Income', `<div class="text-2xl font-bold">$${incomeStats.lowest}</div>`);
  
  statsSection.appendChild(totalIncomeCard);
  statsSection.appendChild(averageIncomeCard);
  statsSection.appendChild(highestIncomeCard);
  statsSection.appendChild(lowestIncomeCard);
  
  // Income Split Section
  const splitSection = document.createElement('div');
  splitSection.className = 'mb-8';
  
  const splitSectionTitle = document.createElement('h2');
  splitSectionTitle.className = 'text-xl font-semibold mb-4';
  splitSectionTitle.textContent = 'Your 40/30/30 Split';
  
  const splitVisualization = createSplitVisualization(appState.budgetAllocations);
  
  const splitDescription = document.createElement('div');
  splitDescription.className = 'mt-4 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg text-sm';
  splitDescription.innerHTML = `
    <p class="mb-2">Based on your total income of <strong>$${incomeStats.total}</strong>, here's how your money should be allocated:</p>
    <ul class="list-disc list-inside space-y-1">
      <li><strong>Needs (${appState.budgetAllocations.needs}%):</strong> $${(incomeStats.total * appState.budgetAllocations.needs / 100).toFixed(2)} - Essential expenses like rent, utilities, groceries, and transportation</li>
      <li><strong>Investments (${appState.budgetAllocations.investments}%):</strong> $${(incomeStats.total * appState.budgetAllocations.investments / 100).toFixed(2)} - Long-term savings, investments, retirement accounts, and emergency fund</li>
      <li><strong>Wants (${appState.budgetAllocations.wants}%):</strong> $${(incomeStats.total * appState.budgetAllocations.wants / 100).toFixed(2)} - Discretionary spending on entertainment, dining out, subscriptions, and non-essential items</li>
    </ul>
  `;
  
  splitSection.appendChild(splitSectionTitle);
  splitSection.appendChild(splitVisualization);
  splitSection.appendChild(splitDescription);
  
  // Income List Section
  const incomeListSection = document.createElement('div');
  incomeListSection.className = 'mb-8';
  
  const incomeListTitle = document.createElement('h2');
  incomeListTitle.className = 'text-xl font-semibold mb-4';
  incomeListTitle.textContent = 'Income Sources';
  
  const incomeList = document.createElement('div');
  incomeList.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden';
  
  if (appState.income.length > 0) {
    const sortedIncome = [...appState.income].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const incomeItems = sortedIncome.map((income, index) => {
      const date = new Date(income.date).toLocaleDateString();
      return `
        <div class="border-b border-gray-200 dark:border-gray-700 last:border-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="font-medium">${income.description}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${date} • ${income.category}</div>
              </div>
            </div>
            <div class="text-green-600 font-medium">
              +$${parseFloat(income.amount).toFixed(2)}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    incomeList.innerHTML = incomeItems;
  } else {
    incomeList.innerHTML = `
      <div class="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No income sources found.</p>
        <p class="mt-2 text-sm">Click the "Add Income" button to get started!</p>
      </div>
    `;
  }
  
  incomeListSection.appendChild(incomeListTitle);
  incomeListSection.appendChild(incomeList);
  
  // Assemble the page
  container.appendChild(headerSection);
  container.appendChild(statsSection);
  container.appendChild(splitSection);
  container.appendChild(incomeListSection);
  
  return container;
}

// Render expenses page 
function renderExpensesPage() {
  const container = document.createElement('div');
  
  // Header section
  const headerSection = document.createElement('div');
  headerSection.className = 'flex justify-between items-center mb-6';
  
  const headerTitle = document.createElement('div');
  headerTitle.innerHTML = `
    <h1 class="text-2xl font-bold">Expense Tracker</h1>
    <p class="text-gray-600 dark:text-gray-400">Monitor and manage your spending</p>
  `;
  
  const addExpenseButton = createButton('Add Expense', () => {
    window.location.hash = '#expenses/add';
  }, 'var(--color-primary)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>');
  
  headerSection.appendChild(headerTitle);
  headerSection.appendChild(addExpenseButton);
  
  // Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6';
  
  // Calculate expense stats
  const expenses = appState.expenses || [];
  const expenseAmounts = expenses.map(expense => parseFloat(expense.amount));
  const totalExpenses = expenseAmounts.reduce((sum, amount) => sum + amount, 0);
  const averageExpense = expenseAmounts.length > 0 ? totalExpenses / expenseAmounts.length : 0;
  const highestExpense = expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0;
  const lowestExpense = expenseAmounts.length > 0 ? Math.min(...expenseAmounts) : 0;
  
  const totalExpensesCard = createCard('Total Expenses', `<div class="text-2xl font-bold">$${totalExpenses.toFixed(2)}</div>`);
  const averageExpenseCard = createCard('Average Expense', `<div class="text-2xl font-bold">$${averageExpense.toFixed(2)}</div>`);
  const highestExpenseCard = createCard('Highest Expense', `<div class="text-2xl font-bold">$${highestExpense.toFixed(2)}</div>`);
  const lowestExpenseCard = createCard('Lowest Expense', `<div class="text-2xl font-bold">$${lowestExpense.toFixed(2)}</div>`);
  
  statsSection.appendChild(totalExpensesCard);
  statsSection.appendChild(averageExpenseCard);
  statsSection.appendChild(highestExpenseCard);
  statsSection.appendChild(lowestExpenseCard);
  
  // Expense List Section
  const expenseListSection = document.createElement('div');
  expenseListSection.className = 'mb-8';
  
  const expenseListTitle = document.createElement('h2');
  expenseListTitle.className = 'text-xl font-semibold mb-4';
  expenseListTitle.textContent = 'Recent Expenses';
  
  const expenseList = document.createElement('div');
  expenseList.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden';
  
  if (expenses.length > 0) {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const expenseItems = sortedExpenses.map((expense, index) => {
      const date = new Date(expense.date).toLocaleDateString();
      return `
        <div class="border-b border-gray-200 dark:border-gray-700 last:border-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="font-medium">${expense.description}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${date} • ${expense.category}</div>
              </div>
            </div>
            <div class="text-red-500 font-medium">
              -$${parseFloat(expense.amount).toFixed(2)}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    expenseList.innerHTML = expenseItems;
  } else {
    expenseList.innerHTML = `
      <div class="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No expenses found.</p>
        <p class="mt-2 text-sm">Click the "Add Expense" button to get started!</p>
      </div>
    `;
  }
  
  expenseListSection.appendChild(expenseListTitle);
  expenseListSection.appendChild(expenseList);
  
  // Expense Categories Section
  const categoriesSection = document.createElement('div');
  categoriesSection.className = 'mb-8';
  
  const categoriesTitle = document.createElement('h2');
  categoriesTitle.className = 'text-xl font-semibold mb-4';
  categoriesTitle.textContent = 'Expense Categories';
  
  const categoriesContent = document.createElement('div');
  categoriesContent.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
  
  if (expenses.length > 0) {
    // Calculate expenses by category
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(expense.amount);
    });
    
    // Convert to array for sorting
    const categoriesArray = Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / totalExpenses) * 100
    })).sort((a, b) => b.amount - a.amount);
    
    const categoryBars = categoriesArray.map(category => {
      const percentage = category.percentage.toFixed(1);
      return `
        <div class="mb-4 last:mb-0">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium">${category.name}</span>
            <span class="text-sm font-medium">$${category.amount.toFixed(2)} (${percentage}%)</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');
    
    categoriesContent.innerHTML = categoryBars;
  } else {
    categoriesContent.innerHTML = `
      <div class="text-center text-gray-500 dark:text-gray-400">
        <p>No expense categories to display.</p>
        <p class="mt-2 text-sm">Add some expenses to see your spending breakdown!</p>
      </div>
    `;
  }
  
  categoriesSection.appendChild(categoriesTitle);
  categoriesSection.appendChild(categoriesContent);
  
  // Assemble the page
  container.appendChild(headerSection);
  container.appendChild(statsSection);
  container.appendChild(expenseListSection);
  container.appendChild(categoriesSection);
  
  return container;
}

// Render gigs page
function renderGigsPage() {
  const container = document.createElement('div');
  
  // Header section
  const headerSection = document.createElement('div');
  headerSection.className = 'flex justify-between items-center mb-6';
  
  const headerTitle = document.createElement('div');
  headerTitle.innerHTML = `
    <h1 class="text-2xl font-bold">Gig Opportunities</h1>
    <p class="text-gray-600 dark:text-gray-400">Find and manage your side hustles</p>
  `;
  
  const addGigButton = createButton('Add Gig', () => {
    window.location.hash = '#gigs/add';
  }, 'var(--color-primary)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>');
  
  headerSection.appendChild(headerTitle);
  headerSection.appendChild(addGigButton);
  
  // Gigs Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6';
  
  // Calculate gig stats
  const gigs = appState.gigs || [];
  const activeGigs = gigs.filter(gig => gig.status === 'active').length;
  const completedGigs = gigs.filter(gig => gig.status === 'completed').length;
  const totalEarned = gigs
    .filter(gig => gig.status === 'completed')
    .reduce((sum, gig) => sum + (parseFloat(gig.amount) || 0), 0);
  
  const activeGigsCard = createCard('Active Gigs', `<div class="text-2xl font-bold">${activeGigs}</div>`);
  const completedGigsCard = createCard('Completed Gigs', `<div class="text-2xl font-bold">${completedGigs}</div>`);
  const totalEarnedCard = createCard('Total Earned', `<div class="text-2xl font-bold">$${totalEarned.toFixed(2)}</div>`);
  
  statsSection.appendChild(activeGigsCard);
  statsSection.appendChild(completedGigsCard);
  statsSection.appendChild(totalEarnedCard);
  
  // Your Gigs Section
  const gigsSection = document.createElement('div');
  gigsSection.className = 'mb-8';
  
  const gigsTitle = document.createElement('h2');
  gigsTitle.className = 'text-xl font-semibold mb-4';
  gigsTitle.textContent = 'Your Gigs';
  
  const gigsList = document.createElement('div');
  gigsList.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  
  if (gigs.length > 0) {
    gigs.forEach(gig => {
      const statusColor = gig.status === 'active' ? 'green' : gig.status === 'pending' ? 'yellow' : 'gray';
      const statusText = gig.status.charAt(0).toUpperCase() + gig.status.slice(1);
      
      const gigCard = document.createElement('div');
      gigCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
      
      gigCard.innerHTML = `
        <div class="p-5">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-lg">${gig.title}</h3>
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900 dark:text-${statusColor}-200">
              ${statusText}
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${gig.description}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="font-medium">${gig.client || 'No client'}</span>
            <span class="font-bold text-primary">$${parseFloat(gig.amount || 0).toFixed(2)}</span>
          </div>
          ${gig.deadline ? `<div class="mt-3 text-xs text-gray-500 dark:text-gray-400">Deadline: ${new Date(gig.deadline).toLocaleDateString()}</div>` : ''}
        </div>
        <div class="bg-gray-50 dark:bg-gray-750 px-5 py-3 flex justify-end">
          <button class="text-sm text-primary hover:text-primary-dark transition-colors">Manage</button>
        </div>
      `;
      
      gigsList.appendChild(gigCard);
    });
  } else {
    const emptyState = document.createElement('div');
    emptyState.className = 'col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center';
    emptyState.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-medium mb-2">No gigs yet</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">You haven't added any gigs to track. Click the "Add Gig" button to get started!</p>
      <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Add Your First Gig</button>
    `;
    
    gigsList.appendChild(emptyState);
  }
  
  gigsSection.appendChild(gigsTitle);
  gigsSection.appendChild(gigsList);
  
  // Gig Opportunities Section
  const opportunitiesSection = document.createElement('div');
  opportunitiesSection.className = 'mb-8';
  
  const opportunitiesTitle = document.createElement('h2');
  opportunitiesTitle.className = 'text-xl font-semibold mb-4';
  opportunitiesTitle.textContent = 'Gig Opportunities';
  
  const opportunitiesList = document.createElement('div');
  opportunitiesList.className = 'grid grid-cols-1 gap-4';
  
  // Sample gig opportunities
  const opportunities = [
    {
      title: 'Freelance Content Writer',
      description: 'Create engaging blog posts and articles on personal finance topics.',
      platform: 'Remote',
      rate: '$25-35/hour',
      skill: 'Writing'
    },
    {
      title: 'Virtual Bookkeeper',
      description: 'Part-time bookkeeping services for small businesses.',
      platform: 'Remote',
      rate: '$20-30/hour',
      skill: 'Accounting'
    },
    {
      title: 'Social Media Manager',
      description: 'Manage and grow social media accounts for local businesses.',
      platform: 'Hybrid',
      rate: '$500-800/month',
      skill: 'Marketing'
    }
  ];
  
  opportunities.forEach(opportunity => {
    const opportunityCard = document.createElement('div');
    opportunityCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border-l-4 border-accent';
    
    opportunityCard.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-bold text-lg">${opportunity.title}</h3>
        <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          ${opportunity.platform}
        </span>
      </div>
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${opportunity.description}</p>
      <div class="flex justify-between items-center">
        <div>
          <span class="inline-block px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-2">
            ${opportunity.skill}
          </span>
          <span class="text-sm font-medium text-primary">${opportunity.rate}</span>
        </div>
        <button class="text-sm px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Apply
        </button>
      </div>
    `;
    
    opportunitiesList.appendChild(opportunityCard);
  });
  
  opportunitiesSection.appendChild(opportunitiesTitle);
  opportunitiesSection.appendChild(opportunitiesList);
  
  // Assemble the page
  container.appendChild(headerSection);
  container.appendChild(statsSection);
  container.appendChild(gigsSection);
  container.appendChild(opportunitiesSection);
  
  return container;
}

// Render settings page
function renderSettingsPage() {
  const container = document.createElement('div');
  
  // Header section
  const headerSection = document.createElement('div');
  headerSection.className = 'mb-6';
  
  const headerTitle = document.createElement('div');
  headerTitle.innerHTML = `
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-gray-600 dark:text-gray-400">Customize your Stackr experience</p>
  `;
  
  headerSection.appendChild(headerTitle);
  
  // Settings grid
  const settingsGrid = document.createElement('div');
  settingsGrid.className = 'grid grid-cols-1 md:grid-cols-3 gap-6';
  
  // Profile Settings
  const profileSection = document.createElement('div');
  profileSection.className = 'md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
  
  const profileTitle = document.createElement('h2');
  profileTitle.className = 'text-lg font-semibold mb-4';
  profileTitle.textContent = 'Profile Settings';
  
  const profileForm = document.createElement('form');
  profileForm.className = 'space-y-4';
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Update profile logic would go here
    const formData = new FormData(profileForm);
    const updatedProfile = {
      ...appState.user,
      username: formData.get('username'),
      email: formData.get('email')
    };
    
    appState.user = updatedProfile;
    saveStateToStorage();
    
    // Show success message
    createErrorMessage('Profile updated successfully!');
  });
  
  const usernameInput = createInput('text', 'Username', appState.user?.username || '');
  usernameInput.name = 'username';
  const usernameGroup = createFormGroup('Username', usernameInput);
  
  const emailInput = createInput('email', 'Email', appState.user?.email || '');
  emailInput.name = 'email';
  const emailGroup = createFormGroup('Email', emailInput);
  
  const submitButton = createButton('Save Changes', null, 'var(--color-primary)');
  submitButton.type = 'submit';
  
  profileForm.appendChild(usernameGroup);
  profileForm.appendChild(emailGroup);
  profileForm.appendChild(submitButton);
  
  profileSection.appendChild(profileTitle);
  profileSection.appendChild(profileForm);
  
  // Budget Settings
  const budgetSection = document.createElement('div');
  budgetSection.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
  
  const budgetTitle = document.createElement('h2');
  budgetTitle.className = 'text-lg font-semibold mb-4';
  budgetTitle.textContent = 'Budget Settings';
  
  const budgetSplit = document.createElement('div');
  budgetSplit.className = 'mb-4';
  budgetSplit.innerHTML = `
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Customize your budget allocation percentages:</p>
  `;
  
  const budgetForm = document.createElement('form');
  budgetForm.className = 'space-y-4';
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(budgetForm);
    const needs = parseInt(formData.get('needs') || '40');
    const investments = parseInt(formData.get('investments') || '30');
    const wants = parseInt(formData.get('wants') || '30');
    
    // Simple validation
    if (needs + investments + wants !== 100) {
      createErrorMessage('Percentages must add up to 100%');
      return;
    }
    
    appState.budgetAllocations = { needs, investments, wants };
    saveStateToStorage();
    
    // Show success message and update visualization
    createErrorMessage('Budget allocation updated!');
    budgetVisual.innerHTML = '';
    budgetVisual.appendChild(createSplitVisualization(appState.budgetAllocations));
  });
  
  const needsInput = createInput('number', 'Needs %', appState.budgetAllocations.needs.toString());
  needsInput.name = 'needs';
  needsInput.min = '0';
  needsInput.max = '100';
  const needsGroup = createFormGroup('Needs %', needsInput);
  
  const investmentsInput = createInput('number', 'Investments %', appState.budgetAllocations.investments.toString());
  investmentsInput.name = 'investments';
  investmentsInput.min = '0';
  investmentsInput.max = '100';
  const investmentsGroup = createFormGroup('Investments %', investmentsInput);
  
  const wantsInput = createInput('number', 'Wants %', appState.budgetAllocations.wants.toString());
  wantsInput.name = 'wants';
  wantsInput.min = '0';
  wantsInput.max = '100';
  const wantsGroup = createFormGroup('Wants %', wantsInput);
  
  const saveButton = createButton('Save Allocation', null, 'var(--color-primary)');
  saveButton.type = 'submit';
  
  budgetForm.appendChild(needsGroup);
  budgetForm.appendChild(investmentsGroup);
  budgetForm.appendChild(wantsGroup);
  budgetForm.appendChild(saveButton);
  
  const budgetVisual = document.createElement('div');
  budgetVisual.className = 'mt-6';
  budgetVisual.appendChild(createSplitVisualization(appState.budgetAllocations));
  
  budgetSection.appendChild(budgetTitle);
  budgetSection.appendChild(budgetSplit);
  budgetSection.appendChild(budgetForm);
  budgetSection.appendChild(budgetVisual);
  
  // Display Settings
  const displaySection = document.createElement('div');
  displaySection.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
  
  const displayTitle = document.createElement('h2');
  displayTitle.className = 'text-lg font-semibold mb-4';
  displayTitle.textContent = 'Display Settings';
  
  const darkModeToggle = document.createElement('div');
  darkModeToggle.className = 'flex items-center justify-between py-2';
  
  const darkModeLabel = document.createElement('span');
  darkModeLabel.textContent = 'Dark Mode';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = `relative inline-flex h-6 w-11 items-center rounded-full ${appState.darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`;
  toggleBtn.innerHTML = `
    <span class="sr-only">Toggle Dark Mode</span>
    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition ${appState.darkMode ? 'translate-x-6' : 'translate-x-1'}"></span>
  `;
  
  toggleBtn.addEventListener('click', () => {
    appState.darkMode = !appState.darkMode;
    if (appState.darkMode) {
      document.documentElement.classList.add('dark-mode');
      toggleBtn.classList.remove('bg-gray-300', 'dark:bg-gray-600');
      toggleBtn.classList.add('bg-primary');
      toggleBtn.querySelector('span:not(.sr-only)').classList.remove('translate-x-1');
      toggleBtn.querySelector('span:not(.sr-only)').classList.add('translate-x-6');
    } else {
      document.documentElement.classList.remove('dark-mode');
      toggleBtn.classList.remove('bg-primary');
      toggleBtn.classList.add('bg-gray-300', 'dark:bg-gray-600');
      toggleBtn.querySelector('span:not(.sr-only)').classList.remove('translate-x-6');
      toggleBtn.querySelector('span:not(.sr-only)').classList.add('translate-x-1');
    }
    saveStateToStorage();
  });
  
  darkModeToggle.appendChild(darkModeLabel);
  darkModeToggle.appendChild(toggleBtn);
  
  const currencySection = document.createElement('div');
  currencySection.className = 'mt-4';
  
  const currencyLabel = document.createElement('label');
  currencyLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  currencyLabel.textContent = 'Currency';
  
  const currencySelect = document.createElement('select');
  currencySelect.className = 'w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';
  
  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (CA$)' }
  ];
  
  currencies.forEach(currency => {
    const option = document.createElement('option');
    option.value = currency.code;
    option.textContent = currency.name;
    if (currency.code === 'USD') {
      option.selected = true;
    }
    currencySelect.appendChild(option);
  });
  
  currencySection.appendChild(currencyLabel);
  currencySection.appendChild(currencySelect);
  
  displaySection.appendChild(displayTitle);
  displaySection.appendChild(darkModeToggle);
  displaySection.appendChild(currencySection);
  
  // Account Actions
  const accountSection = document.createElement('div');
  accountSection.className = 'md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6';
  
  const accountTitle = document.createElement('h2');
  accountTitle.className = 'text-lg font-semibold mb-4';
  accountTitle.textContent = 'Account Actions';
  
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'grid grid-cols-1 md:grid-cols-3 gap-4';
  
  const exportDataBtn = createButton('Export Data', () => {
    const dataStr = JSON.stringify({
      income: appState.income,
      expenses: appState.expenses,
      gigs: appState.gigs,
      budgetAllocations: appState.budgetAllocations,
      user: {
        username: appState.user?.username,
        email: appState.user?.email
      }
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'stackr-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, 'var(--color-primary)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>');
  
  const clearDataBtn = createButton('Clear Data', () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.removeItem('income');
      localStorage.removeItem('expenses');
      localStorage.removeItem('gigs');
      localStorage.removeItem('subscriptions');
      
      appState.income = [];
      appState.expenses = [];
      appState.gigs = [];
      appState.subscriptions = [];
      
      createErrorMessage('All data has been cleared!');
    }
  }, 'var(--color-error)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>', 'outline');
  
  const logoutBtn = createButton('Logout', () => {
    localStorage.removeItem('user');
    appState.user = null;
    window.location.hash = '#login';
    window.location.reload();
  }, 'var(--color-error)', '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" /></svg>', 'text');
  
  actionsContainer.appendChild(exportDataBtn);
  actionsContainer.appendChild(clearDataBtn);
  actionsContainer.appendChild(logoutBtn);
  
  accountSection.appendChild(accountTitle);
  accountSection.appendChild(actionsContainer);
  
  // Add all sections to the grid
  settingsGrid.appendChild(profileSection);
  settingsGrid.appendChild(budgetSection);
  settingsGrid.appendChild(displaySection);
  settingsGrid.appendChild(accountSection);
  
  // Assemble the page
  container.appendChild(headerSection);
  container.appendChild(settingsGrid);
  
  return container;
}

// Key utility function to render page content
function renderPageContent(container) {
  const pageName = window.location.hash.replace('#', '') || 'dashboard';
  const [mainPage, subPage] = pageName.split('/');
  
  // Clear the container
  container.innerHTML = '';
  
  console.log('Rendering page:', mainPage, subPage);
  
  // Store the previous page and set current page
  appState.currentPage = mainPage;
  
  // Render the appropriate page based on the route
  switch (mainPage) {
    case 'dashboard':
      container.appendChild(renderDashboardPage());
      break;
      
    case 'income':
      container.appendChild(renderIncomePage());
      break;
      
    case 'expenses':
      container.appendChild(renderExpensesPage());
      break;
      
    case 'gigs':
      container.appendChild(renderGigsPage());
      break;
      
    case 'settings':
      container.appendChild(renderSettingsPage());
      break;
      
    case 'login':
      // Login page rendering
      const loginContainer = document.createElement('div');
      loginContainer.className = 'flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4';
      
      const loginCard = document.createElement('div');
      loginCard.className = 'w-full max-w-md overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl';
      
      loginCard.innerHTML = `
        <div class="px-8 py-6">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold">Welcome to Stackr</h2>
            <p class="text-gray-600 dark:text-gray-400">Sign in to continue</p>
          </div>
          <form id="login-form" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input type="text" id="username" name="username" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" id="password" name="password" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <button type="submit" class="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">Sign In</button>
            </div>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account? 
              <a href="#register" class="font-medium text-primary hover:text-primary-dark transition-colors">Register</a>
            </p>
          </div>
        </div>
      `;
      
      // Add login form handler
      loginContainer.appendChild(loginCard);
      container.appendChild(loginContainer);
      
      // Set up form submission handler after the form is in the DOM
      setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
          loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Demo login - in a real app this would validate with a backend
            appState.user = {
              id: 1,
              username,
              email: `${username}@example.com`,
              role: 'user'
            };
            
            localStorage.setItem('user', JSON.stringify(appState.user));
            window.location.hash = '#dashboard';
          });
        }
      }, 0);
      break;
      
    case 'register':
      // Registration page rendering
      const registerContainer = document.createElement('div');
      registerContainer.className = 'flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4';
      
      const registerCard = document.createElement('div');
      registerCard.className = 'w-full max-w-md overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl';
      
      registerCard.innerHTML = `
        <div class="px-8 py-6">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold">Create an Account</h2>
            <p class="text-gray-600 dark:text-gray-400">Sign up to get started</p>
          </div>
          <form id="register-form" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input type="text" id="username" name="username" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" id="email" name="email" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" id="password" name="password" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" required class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <button type="submit" class="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">Register</button>
            </div>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Already have an account? 
              <a href="#login" class="font-medium text-primary hover:text-primary-dark transition-colors">Sign In</a>
            </p>
          </div>
        </div>
      `;
      
      registerContainer.appendChild(registerCard);
      container.appendChild(registerContainer);
      
      // Set up form submission handler after the form is in the DOM
      setTimeout(() => {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
          registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
              createErrorMessage('Passwords do not match!');
              return;
            }
            
            // Demo registration - in a real app this would connect to a backend
            appState.user = {
              id: 1,
              username,
              email,
              role: 'user'
            };
            
            localStorage.setItem('user', JSON.stringify(appState.user));
            window.location.hash = '#dashboard';
          });
        }
      }, 0);
      break;
      
    case 'moneymentor':
      // Money Mentor page placeholder
      const moneyMentorPlaceholder = document.createElement('div');
      moneyMentorPlaceholder.className = 'text-center p-8';
      moneyMentorPlaceholder.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Money Mentor</h2>
        <p class="mb-4">Get personalized financial advice powered by AI.</p>
        <div class="animate-pulse inline-block p-4 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Coming soon!
        </div>
      `;
      container.appendChild(moneyMentorPlaceholder);
      break;
      
    case 'subscriptionsniper':
      // Subscription Sniper page placeholder
      const subscriptionSniperPlaceholder = document.createElement('div');
      subscriptionSniperPlaceholder.className = 'text-center p-8';
      subscriptionSniperPlaceholder.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Subscription Sniper</h2>
        <p class="mb-4">Track and manage your recurring subscriptions to save money.</p>
        <div class="animate-pulse inline-block p-4 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          Coming soon!
        </div>
      `;
      container.appendChild(subscriptionSniperPlaceholder);
      break;
      
    default:
      // 404 page
      const notFoundPage = document.createElement('div');
      notFoundPage.className = 'flex flex-col items-center justify-center min-h-[60vh] text-center p-4';
      notFoundPage.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 class="text-4xl font-bold mb-4">404</h1>
        <p class="text-xl mb-6">Page not found</p>
        <a href="#dashboard" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Go to Dashboard</a>
      `;
      container.appendChild(notFoundPage);
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create error message
function createErrorMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md transform transition-all duration-500 translate-y-20 opacity-0';
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0 mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <p class="font-medium">${message}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
  }, 50);
  
  // Animate out and remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
  
  return toast;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting GREEN Firebase-free version of Stackr Finance');
  
  // Setup design system
  setupDesignSystem();
  
  // Check authentication and load state
  checkAuthentication();
  loadStateFromStorage();
  
  // Create layout
  const mainContent = createLayout();
  
  // Render initial page
  renderPageContent(mainContent);
  
  // Handle route changes
  window.addEventListener('hashchange', () => {
    renderPageContent(mainContent);
  });
  
  // Save state on page unload
  window.addEventListener('beforeunload', () => {
    saveStateToStorage();
  });
});