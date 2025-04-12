// Minimal version of main.js with just the core functionality
// This is only a temporary file to help debug and fix syntax errors

console.log('Starting GREEN Firebase-free version of Stackr Finance');

// Global state
const appState = {
  user: { isAuthenticated: false },
  currentPage: 'landing',
  incomeEntries: [],
  financialMascot: null
};

// Core navigation function
function navigateTo(page) {
  appState.currentPage = page;
  window.location.hash = page;
  renderApp();
}

// Simplified placeholder for renderPageContent
function renderPageContent(container) {
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'welcome-message p-8 text-center';
  welcomeMsg.innerHTML = `
    <h1 class="text-3xl font-bold mb-4">Welcome to Stackr Finance</h1>
    <p class="mb-6">Your simplified financial management platform.</p>
    <p class="text-green-500 font-bold">Successfully loaded minimal version!</p>
  `;
  container.appendChild(welcomeMsg);
}

// Simplified layout creator
function createLayout() {
  const appElement = document.getElementById('app');
  if (!appElement) return;
  
  appElement.innerHTML = '';
  
  // Create simplified layout
  const layout = document.createElement('div');
  layout.className = 'layout flex flex-col min-h-screen';
  
  // Simple header
  const header = document.createElement('header');
  header.className = 'bg-white dark:bg-gray-800 border-b p-4';
  header.innerHTML = '<h1 class="text-lg font-bold">Stackr Finance (Minimal Mode)</h1>';
  
  // Main content area
  const main = document.createElement('main');
  main.className = 'flex-grow p-4';
  
  // Render the actual page content
  renderPageContent(main);
  
  // Add components to layout
  layout.appendChild(header);
  layout.appendChild(main);
  
  // Add layout to app
  appElement.appendChild(layout);
}

// Main render function
function renderApp() {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = '';
  
  // Create simplified app container
  const app = document.createElement('div');
  app.id = 'app';
  rootElement.appendChild(app);
  
  // Create the layout
  createLayout();
  
  console.log(`Page rendered: ${appState.currentPage}`);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '');
  // If no hash is provided, show landing page
  if (!hash) {
    appState.currentPage = 'landing';
  } else {
    appState.currentPage = hash;
  }
  
  // Render the initial state
  renderApp();
  
  console.log('GREEN Firebase-free version loaded successfully!');
});