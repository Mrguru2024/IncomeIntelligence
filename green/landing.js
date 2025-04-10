/**
 * Landing Page for Stackr Finance GREEN version
 * This page serves as the main entry point for new users
 */

import { isAuthenticated } from './login.js';

/**
 * Render the landing page
 * @returns {HTMLElement} The landing page element
 */
export function renderLandingPage() {
  // Create page container
  const container = document.createElement('div');
  container.classList.add('landing-page');
  container.style.minHeight = '100vh';
  container.style.width = '100%';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  // Add navigation
  const navbar = createNavbar();
  container.appendChild(navbar);
  
  // Add hero section
  const heroSection = createHeroSection();
  container.appendChild(heroSection);
  
  // Add features section
  const featuresSection = createFeaturesSection();
  container.appendChild(featuresSection);
  
  // Add how it works section
  const howItWorksSection = createHowItWorksSection();
  container.appendChild(howItWorksSection);
  
  // Add testimonials section
  const testimonialsSection = createTestimonialsSection();
  container.appendChild(testimonialsSection);
  
  // Add pricing section teaser
  const pricingSection = createPricingSection();
  container.appendChild(pricingSection);
  
  // Add CTA section
  const ctaSection = createCTASection();
  container.appendChild(ctaSection);
  
  // Add footer
  const footer = createFooter();
  container.appendChild(footer);
  
  return container;
}

/**
 * Create the navigation bar
 * @returns {HTMLElement} The navbar element
 */
function createNavbar() {
  const navbar = document.createElement('nav');
  navbar.style.display = 'flex';
  navbar.style.justifyContent = 'space-between';
  navbar.style.alignItems = 'center';
  navbar.style.padding = '20px 40px';
  navbar.style.position = 'sticky';
  navbar.style.top = '0';
  navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  navbar.style.backdropFilter = 'blur(10px)';
  navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  navbar.style.zIndex = '1000';
  
  // Logo
  const logoLink = document.createElement('a');
  logoLink.href = '#';
  logoLink.style.textDecoration = 'none';
  logoLink.style.display = 'flex';
  logoLink.style.alignItems = 'center';
  
  const logo = document.createElement('div');
  logo.textContent = 'stackr';
  logo.style.fontSize = '24px';
  logo.style.fontWeight = 'bold';
  logo.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  logo.style.WebkitBackgroundClip = 'text';
  logo.style.WebkitTextFillColor = 'transparent';
  logo.style.color = 'var(--color-primary)';
  
  const logoSuffix = document.createElement('span');
  logoSuffix.textContent = 'finance';
  logoSuffix.style.marginLeft = '5px';
  logoSuffix.style.color = '#333';
  logoSuffix.style.fontWeight = '500';
  
  logoLink.appendChild(logo);
  logoLink.appendChild(logoSuffix);
  
  // Navigation links
  const navLinks = document.createElement('div');
  navLinks.style.display = 'flex';
  navLinks.style.gap = '30px';
  
  const links = [
    { text: 'Features', href: '#features' },
    { text: 'How It Works', href: '#how-it-works' },
    { text: 'Pricing', href: '#pricing' }
  ];
  
  links.forEach(link => {
    const navLink = document.createElement('a');
    navLink.textContent = link.text;
    navLink.href = link.href;
    navLink.style.textDecoration = 'none';
    navLink.style.color = 'var(--color-text)';
    navLink.style.fontWeight = '500';
    navLink.style.fontSize = '16px';
    navLink.style.transition = 'color 0.2s ease';
    
    navLink.onmouseenter = () => {
      navLink.style.color = 'var(--color-primary)';
    };
    
    navLink.onmouseleave = () => {
      navLink.style.color = 'var(--color-text)';
    };
    
    navLinks.appendChild(navLink);
  });
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.style.display = 'flex';
  actionButtons.style.gap = '15px';
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    const dashboardButton = document.createElement('a');
    dashboardButton.textContent = 'Dashboard';
    dashboardButton.href = '#dashboard';
    dashboardButton.style.padding = '10px 20px';
    dashboardButton.style.backgroundColor = 'var(--color-primary)';
    dashboardButton.style.color = 'white';
    dashboardButton.style.textDecoration = 'none';
    dashboardButton.style.borderRadius = '8px';
    dashboardButton.style.fontWeight = '600';
    dashboardButton.style.fontSize = '16px';
    dashboardButton.style.transition = 'all 0.2s ease';
    
    dashboardButton.onmouseenter = () => {
      dashboardButton.style.backgroundColor = 'var(--color-primary-dark)';
      dashboardButton.style.transform = 'translateY(-2px)';
    };
    
    dashboardButton.onmouseleave = () => {
      dashboardButton.style.backgroundColor = 'var(--color-primary)';
      dashboardButton.style.transform = 'translateY(0)';
    };
    
    actionButtons.appendChild(dashboardButton);
  } else {
    const loginButton = document.createElement('a');
    loginButton.textContent = 'Log In';
    loginButton.href = '#login';
    loginButton.style.padding = '10px 20px';
    loginButton.style.backgroundColor = 'transparent';
    loginButton.style.color = 'var(--color-primary)';
    loginButton.style.border = '2px solid var(--color-primary)';
    loginButton.style.textDecoration = 'none';
    loginButton.style.borderRadius = '8px';
    loginButton.style.fontWeight = '600';
    loginButton.style.fontSize = '16px';
    loginButton.style.transition = 'all 0.2s ease';
    
    loginButton.onmouseenter = () => {
      loginButton.style.backgroundColor = 'var(--color-primary-light)';
    };
    
    loginButton.onmouseleave = () => {
      loginButton.style.backgroundColor = 'transparent';
    };
    
    const signupButton = document.createElement('a');
    signupButton.textContent = 'Sign Up Free';
    signupButton.href = '#register';
    signupButton.style.padding = '10px 20px';
    signupButton.style.backgroundColor = 'var(--color-primary)';
    signupButton.style.color = 'white';
    signupButton.style.textDecoration = 'none';
    signupButton.style.borderRadius = '8px';
    signupButton.style.fontWeight = '600';
    signupButton.style.fontSize = '16px';
    signupButton.style.transition = 'all 0.2s ease';
    
    signupButton.onmouseenter = () => {
      signupButton.style.backgroundColor = 'var(--color-primary-dark)';
      signupButton.style.transform = 'translateY(-2px)';
    };
    
    signupButton.onmouseleave = () => {
      signupButton.style.backgroundColor = 'var(--color-primary)';
      signupButton.style.transform = 'translateY(0)';
    };
    
    actionButtons.appendChild(loginButton);
    actionButtons.appendChild(signupButton);
  }
  
  navbar.appendChild(logoLink);
  navbar.appendChild(navLinks);
  navbar.appendChild(actionButtons);
  
  // Mobile menu
  const mobileMenuButton = document.createElement('button');
  mobileMenuButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  mobileMenuButton.style.backgroundColor = 'transparent';
  mobileMenuButton.style.border = 'none';
  mobileMenuButton.style.cursor = 'pointer';
  mobileMenuButton.style.display = 'none';
  mobileMenuButton.style.padding = '5px';
  
  navbar.appendChild(mobileMenuButton);
  
  // Add responsive styling
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      nav {
        padding: 15px 20px;
      }
      
      .nav-links, .action-buttons {
        display: none;
      }
      
      .mobile-menu-button {
        display: block;
      }
    }
  `;
  document.head.appendChild(style);
  
  return navbar;
}

/**
 * Create the hero section
 * @returns {HTMLElement} The hero section element
 */
function createHeroSection() {
  const heroSection = document.createElement('section');
  heroSection.style.padding = '60px 40px';
  heroSection.style.display = 'flex';
  heroSection.style.flexDirection = 'column';
  heroSection.style.alignItems = 'center';
  heroSection.style.textAlign = 'center';
  heroSection.style.background = 'linear-gradient(170deg, var(--color-background) 0%, white 100%)';
  heroSection.style.position = 'relative';
  heroSection.style.overflow = 'hidden';
  
  // Background shapes (decorative)
  const shapes = document.createElement('div');
  shapes.style.position = 'absolute';
  shapes.style.top = '0';
  shapes.style.left = '0';
  shapes.style.right = '0';
  shapes.style.bottom = '0';
  shapes.style.zIndex = '0';
  shapes.style.opacity = '0.6';
  shapes.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:var(--color-primary);stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="150" fill="url(#grad1)" />
      <circle cx="1000" cy="200" r="200" fill="url(#grad1)" />
      <circle cx="300" cy="600" r="250" fill="url(#grad1)" />
      <circle cx="900" cy="700" r="100" fill="url(#grad1)" />
    </svg>
  `;
  
  // Hero content container
  const contentContainer = document.createElement('div');
  contentContainer.style.maxWidth = '900px';
  contentContainer.style.margin = '0 auto';
  contentContainer.style.position = 'relative';
  contentContainer.style.zIndex = '1';
  
  // Main heading
  const heading = document.createElement('h1');
  heading.textContent = 'Take control of your financial future';
  heading.style.fontSize = '48px';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '20px';
  heading.style.color = 'var(--color-text)';
  heading.style.lineHeight = '1.2';
  
  // Gradient highlight
  const highlight = document.createElement('span');
  highlight.textContent = 'financial future';
  highlight.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  highlight.style.WebkitBackgroundClip = 'text';
  highlight.style.WebkitTextFillColor = 'transparent';
  heading.innerHTML = heading.innerHTML.replace('financial future', highlight.outerHTML);
  
  // Subheading
  const subheading = document.createElement('p');
  subheading.textContent = 'Stackr helps service providers track income, plan expenses, and achieve financial goals with our powerful 40/30/30 allocation system.';
  subheading.style.fontSize = '20px';
  subheading.style.color = 'var(--color-text-secondary)';
  subheading.style.marginBottom = '40px';
  subheading.style.maxWidth = '700px';
  subheading.style.margin = '0 auto 40px';
  subheading.style.lineHeight = '1.6';
  
  // CTA buttons
  const ctaButtons = document.createElement('div');
  ctaButtons.style.display = 'flex';
  ctaButtons.style.justifyContent = 'center';
  ctaButtons.style.gap = '20px';
  ctaButtons.style.marginBottom = '60px';
  
  const primaryButton = document.createElement('a');
  primaryButton.textContent = 'Get Started — It's Free';
  primaryButton.href = '#register';
  primaryButton.style.padding = '16px 32px';
  primaryButton.style.backgroundColor = 'var(--color-primary)';
  primaryButton.style.color = 'white';
  primaryButton.style.textDecoration = 'none';
  primaryButton.style.borderRadius = '10px';
  primaryButton.style.fontWeight = '600';
  primaryButton.style.fontSize = '18px';
  primaryButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  primaryButton.style.transition = 'all 0.3s ease';
  
  primaryButton.onmouseenter = () => {
    primaryButton.style.backgroundColor = 'var(--color-primary-dark)';
    primaryButton.style.transform = 'translateY(-3px)';
    primaryButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
  };
  
  primaryButton.onmouseleave = () => {
    primaryButton.style.backgroundColor = 'var(--color-primary)';
    primaryButton.style.transform = 'translateY(0)';
    primaryButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  };
  
  const secondaryButton = document.createElement('a');
  secondaryButton.textContent = 'Watch Demo';
  secondaryButton.href = '#demo';
  secondaryButton.style.padding = '15px 30px';
  secondaryButton.style.backgroundColor = 'transparent';
  secondaryButton.style.color = 'var(--color-text)';
  secondaryButton.style.border = '2px solid var(--color-border)';
  secondaryButton.style.textDecoration = 'none';
  secondaryButton.style.borderRadius = '10px';
  secondaryButton.style.fontWeight = '600';
  secondaryButton.style.fontSize = '18px';
  secondaryButton.style.transition = 'all 0.3s ease';
  
  secondaryButton.onmouseenter = () => {
    secondaryButton.style.backgroundColor = 'var(--color-background)';
    secondaryButton.style.borderColor = 'var(--color-text)';
  };
  
  secondaryButton.onmouseleave = () => {
    secondaryButton.style.backgroundColor = 'transparent';
    secondaryButton.style.borderColor = 'var(--color-border)';
  };
  
  ctaButtons.appendChild(primaryButton);
  ctaButtons.appendChild(secondaryButton);
  
  // Hero image/mockup
  const mockupContainer = document.createElement('div');
  mockupContainer.style.maxWidth = '920px';
  mockupContainer.style.margin = '0 auto';
  mockupContainer.style.position = 'relative';
  
  // Dashboard mockup image (created with SVG for better performance)
  mockupContainer.innerHTML = `
    <svg width="100%" height="500" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Dashboard Frame -->
      <rect x="100" y="50" width="1000" height="500" rx="10" fill="white" stroke="#e0e0e0" stroke-width="2"/>
      
      <!-- Header -->
      <rect x="100" y="50" width="1000" height="60" rx="10" fill="#f8f9fa"/>
      <circle cx="140" cy="80" r="15" fill="var(--color-primary)"/>
      <text x="170" y="85" font-family="Arial" font-size="16" font-weight="bold">Stackr Finance</text>
      
      <!-- Sidebar -->
      <rect x="100" y="110" width="200" height="440" fill="#f8f9fa"/>
      <rect x="120" y="150" width="160" height="40" rx="5" fill="var(--color-primary)" opacity="0.1"/>
      <text x="150" y="175" font-family="Arial" font-size="14" fill="var(--color-primary)">Dashboard</text>
      
      <text x="150" y="225" font-family="Arial" font-size="14" fill="#333333">Income</text>
      <text x="150" y="275" font-family="Arial" font-size="14" fill="#333333">Expenses</text>
      <text x="150" y="325" font-family="Arial" font-size="14" fill="#333333">Goals</text>
      <text x="150" y="375" font-family="Arial" font-size="14" fill="#333333">Budgets</text>
      <text x="150" y="425" font-family="Arial" font-size="14" fill="#333333">Reports</text>
      
      <!-- Main content area -->
      <!-- Balance card -->
      <rect x="320" y="130" width="300" height="120" rx="10" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <text x="340" y="160" font-family="Arial" font-size="14" fill="#666666">Total Balance</text>
      <text x="340" y="200" font-family="Arial" font-size="24" font-weight="bold" fill="#333333">$12,540.00</text>
      
      <!-- Income card -->
      <rect x="640" y="130" width="200" height="120" rx="10" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <text x="660" y="160" font-family="Arial" font-size="14" fill="#666666">Monthly Income</text>
      <text x="660" y="200" font-family="Arial" font-size="20" font-weight="bold" fill="#00A389">$4,250.00</text>
      
      <!-- Expenses card -->
      <rect x="860" y="130" width="200" height="120" rx="10" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <text x="880" y="160" font-family="Arial" font-size="14" fill="#666666">Monthly Expenses</text>
      <text x="880" y="200" font-family="Arial" font-size="20" font-weight="bold" fill="#FF6B6B">$2,380.00</text>
      
      <!-- Allocation chart -->
      <rect x="320" y="270" width="450" height="250" rx="10" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <text x="340" y="300" font-family="Arial" font-size="16" font-weight="bold" fill="#333333">Income Allocation</text>
      
      <!-- Chart (simplified) -->
      <circle cx="450" cy="390" r="100" fill="transparent" stroke="#e0e0e0" stroke-width="20"/>
      <path d="M 450 390 L 450 290 A 100 100 0 0 1 536 348 Z" fill="var(--color-primary)" />
      <path d="M 450 390 L 536 348 A 100 100 0 0 1 492 478 Z" fill="#FFC107" />
      <path d="M 450 390 L 492 478 A 100 100 0 0 1 364 478 L 450 390 Z" fill="#00C4B4" />
      
      <text x="600" y="340" font-family="Arial" font-size="14" fill="#333333">● Needs (40%)</text>
      <text x="600" y="380" font-family="Arial" font-size="14" fill="#333333">● Investments (30%)</text>
      <text x="600" y="420" font-family="Arial" font-size="14" fill="#333333">● Savings (30%)</text>
      
      <!-- Recent transactions -->
      <rect x="790" y="270" width="270" height="250" rx="10" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <text x="810" y="300" font-family="Arial" font-size="16" font-weight="bold" fill="#333333">Recent Transactions</text>
      
      <rect x="810" y="320" width="230" height="1" fill="#e0e0e0"/>
      
      <text x="810" y="350" font-family="Arial" font-size="14" fill="#333333">Client Payment</text>
      <text x="980" y="350" font-family="Arial" font-size="14" font-weight="bold" fill="#00A389">+$850.00</text>
      
      <rect x="810" y="360" width="230" height="1" fill="#e0e0e0"/>
      
      <text x="810" y="390" font-family="Arial" font-size="14" fill="#333333">Rent</text>
      <text x="980" y="390" font-family="Arial" font-size="14" font-weight="bold" fill="#FF6B6B">-$1200.00</text>
      
      <rect x="810" y="400" width="230" height="1" fill="#e0e0e0"/>
      
      <text x="810" y="430" font-family="Arial" font-size="14" fill="#333333">Freelance Work</text>
      <text x="980" y="430" font-family="Arial" font-size="14" font-weight="bold" fill="#00A389">+$320.00</text>
      
      <rect x="810" y="440" width="230" height="1" fill="#e0e0e0"/>
      
      <text x="810" y="470" font-family="Arial" font-size="14" fill="#333333">Groceries</text>
      <text x="980" y="470" font-family="Arial" font-size="14" font-weight="bold" fill="#FF6B6B">-$85.50</text>
    </svg>
  `;
  
  // Add shadow and perspective to mockup
  mockupContainer.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
  mockupContainer.style.borderRadius = '10px';
  mockupContainer.style.transform = 'perspective(1000px) rotateX(5deg)';
  mockupContainer.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  
  // Assemble hero section
  contentContainer.appendChild(heading);
  contentContainer.appendChild(subheading);
  contentContainer.appendChild(ctaButtons);
  
  heroSection.appendChild(shapes);
  heroSection.appendChild(contentContainer);
  heroSection.appendChild(mockupContainer);
  
  return heroSection;
}

/**
 * Create the features section
 * @returns {HTMLElement} The features section element
 */
function createFeaturesSection() {
  const featuresSection = document.createElement('section');
  featuresSection.id = 'features';
  featuresSection.style.padding = '80px 40px';
  featuresSection.style.backgroundColor = 'white';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.textAlign = 'center';
  sectionHeader.style.maxWidth = '700px';
  sectionHeader.style.margin = '0 auto 60px';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Designed for service providers';
  sectionTitle.style.fontSize = '36px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '20px';
  sectionTitle.style.color = 'var(--color-text)';
  
  const sectionDescription = document.createElement('p');
  sectionDescription.textContent = 'Stackr Finance brings together all the tools you need to manage your finances as a service provider, freelancer, or independent professional.';
  sectionDescription.style.fontSize = '18px';
  sectionDescription.style.color = 'var(--color-text-secondary)';
  sectionDescription.style.lineHeight = '1.6';
  
  sectionHeader.appendChild(sectionTitle);
  sectionHeader.appendChild(sectionDescription);
  
  // Features grid
  const featuresGrid = document.createElement('div');
  featuresGrid.style.display = 'grid';
  featuresGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  featuresGrid.style.gap = '40px';
  featuresGrid.style.maxWidth = '1200px';
  featuresGrid.style.margin = '0 auto';
  
  // Feature items
  const features = [
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      title: '40/30/30 Income Split',
      description: 'Automatically allocate your income into Needs, Investments, and Savings categories with our proven formula for financial success.'
    },
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      title: 'Real-Time Tracking',
      description: 'Monitor your income, expenses, and financial goals in real-time with automatic updates and notifications.'
    },
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      title: 'Goal Setting & Tracking',
      description: 'Set financial goals and track your progress with visual dashboards and milestone notifications.'
    },
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      title: 'Bank Integration',
      description: 'Connect your bank accounts securely with Plaid for automatic transaction imports and categorization.'
    },
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
      title: 'AI Financial Advice',
      description: 'Receive personalized financial insights and recommendations based on your income patterns and spending habits.'
    },
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      title: 'Income Generation Opportunities',
      description: 'Access exclusive gigs, affiliate programs, and income-generating opportunities tailored for service providers.'
    }
  ];
  
  features.forEach(feature => {
    const featureCard = document.createElement('div');
    featureCard.style.backgroundColor = 'white';
    featureCard.style.borderRadius = '10px';
    featureCard.style.padding = '30px';
    featureCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
    featureCard.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    featureCard.onmouseenter = () => {
      featureCard.style.transform = 'translateY(-5px)';
      featureCard.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    };
    
    featureCard.onmouseleave = () => {
      featureCard.style.transform = 'translateY(0)';
      featureCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
    };
    
    const iconContainer = document.createElement('div');
    iconContainer.style.backgroundColor = 'var(--color-primary-light)';
    iconContainer.style.color = 'var(--color-primary)';
    iconContainer.style.width = '60px';
    iconContainer.style.height = '60px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginBottom = '20px';
    iconContainer.innerHTML = feature.icon;
    
    const title = document.createElement('h3');
    title.textContent = feature.title;
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '15px';
    title.style.color = 'var(--color-text)';
    
    const description = document.createElement('p');
    description.textContent = feature.description;
    description.style.fontSize = '16px';
    description.style.color = 'var(--color-text-secondary)';
    description.style.lineHeight = '1.6';
    
    featureCard.appendChild(iconContainer);
    featureCard.appendChild(title);
    featureCard.appendChild(description);
    
    featuresGrid.appendChild(featureCard);
  });
  
  featuresSection.appendChild(sectionHeader);
  featuresSection.appendChild(featuresGrid);
  
  return featuresSection;
}

/**
 * Create the how it works section
 * @returns {HTMLElement} The how it works section element
 */
function createHowItWorksSection() {
  const howItWorksSection = document.createElement('section');
  howItWorksSection.id = 'how-it-works';
  howItWorksSection.style.padding = '80px 40px';
  howItWorksSection.style.backgroundColor = 'var(--color-background)';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.textAlign = 'center';
  sectionHeader.style.maxWidth = '700px';
  sectionHeader.style.margin = '0 auto 60px';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'How Stackr Works';
  sectionTitle.style.fontSize = '36px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '20px';
  sectionTitle.style.color = 'var(--color-text)';
  
  const sectionDescription = document.createElement('p');
  sectionDescription.textContent = 'Our simple process helps you manage your finances efficiently in just a few steps.';
  sectionDescription.style.fontSize = '18px';
  sectionDescription.style.color = 'var(--color-text-secondary)';
  sectionDescription.style.lineHeight = '1.6';
  
  sectionHeader.appendChild(sectionTitle);
  sectionHeader.appendChild(sectionDescription);
  
  // Steps container
  const stepsContainer = document.createElement('div');
  stepsContainer.style.maxWidth = '900px';
  stepsContainer.style.margin = '0 auto';
  
  // Steps
  const steps = [
    {
      number: '1',
      title: 'Connect your accounts',
      description: 'Link your bank accounts securely using Plaid to automatically import transactions.'
    },
    {
      number: '2',
      title: 'Set up your income split',
      description: 'Configure your 40/30/30 income allocation for Needs, Investments, and Savings.'
    },
    {
      number: '3',
      title: 'Track your expenses',
      description: 'Categorize expenses automatically and see where your money is going.'
    },
    {
      number: '4',
      title: 'Set financial goals',
      description: 'Create personalized financial goals and track your progress over time.'
    }
  ];
  
  steps.forEach((step, index) => {
    const stepItem = document.createElement('div');
    stepItem.style.display = 'flex';
    stepItem.style.alignItems = 'flex-start';
    stepItem.style.marginBottom = '40px';
    stepItem.style.position = 'relative';
    
    if (index < steps.length - 1) {
      // Add connecting line
      const connector = document.createElement('div');
      connector.style.position = 'absolute';
      connector.style.top = '60px';
      connector.style.left = '30px';
      connector.style.width = '2px';
      connector.style.height = '100px';
      connector.style.backgroundColor = 'var(--color-primary-light)';
      connector.style.zIndex = '0';
      stepItem.appendChild(connector);
    }
    
    const stepNumber = document.createElement('div');
    stepNumber.textContent = step.number;
    stepNumber.style.backgroundColor = 'var(--color-primary)';
    stepNumber.style.color = 'white';
    stepNumber.style.width = '60px';
    stepNumber.style.height = '60px';
    stepNumber.style.borderRadius = '50%';
    stepNumber.style.display = 'flex';
    stepNumber.style.alignItems = 'center';
    stepNumber.style.justifyContent = 'center';
    stepNumber.style.fontWeight = 'bold';
    stepNumber.style.fontSize = '24px';
    stepNumber.style.marginRight = '30px';
    stepNumber.style.flexShrink = '0';
    stepNumber.style.zIndex = '1';
    stepNumber.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    
    const stepContent = document.createElement('div');
    
    const stepTitle = document.createElement('h3');
    stepTitle.textContent = step.title;
    stepTitle.style.fontSize = '22px';
    stepTitle.style.fontWeight = '600';
    stepTitle.style.marginBottom = '10px';
    stepTitle.style.color = 'var(--color-text)';
    
    const stepDescription = document.createElement('p');
    stepDescription.textContent = step.description;
    stepDescription.style.fontSize = '16px';
    stepDescription.style.color = 'var(--color-text-secondary)';
    stepDescription.style.lineHeight = '1.6';
    
    stepContent.appendChild(stepTitle);
    stepContent.appendChild(stepDescription);
    
    stepItem.appendChild(stepNumber);
    stepItem.appendChild(stepContent);
    
    stepsContainer.appendChild(stepItem);
  });
  
  howItWorksSection.appendChild(sectionHeader);
  howItWorksSection.appendChild(stepsContainer);
  
  return howItWorksSection;
}

/**
 * Create the testimonials section
 * @returns {HTMLElement} The testimonials section element
 */
function createTestimonialsSection() {
  const testimonialsSection = document.createElement('section');
  testimonialsSection.style.padding = '80px 40px';
  testimonialsSection.style.backgroundColor = 'white';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.textAlign = 'center';
  sectionHeader.style.maxWidth = '700px';
  sectionHeader.style.margin = '0 auto 60px';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'What our users say';
  sectionTitle.style.fontSize = '36px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '20px';
  sectionTitle.style.color = 'var(--color-text)';
  
  sectionHeader.appendChild(sectionTitle);
  
  // Testimonials container
  const testimonialsContainer = document.createElement('div');
  testimonialsContainer.style.display = 'flex';
  testimonialsContainer.style.flexWrap = 'wrap';
  testimonialsContainer.style.justifyContent = 'center';
  testimonialsContainer.style.gap = '30px';
  testimonialsContainer.style.maxWidth = '1200px';
  testimonialsContainer.style.margin = '0 auto';
  
  // Testimonials
  const testimonials = [
    {
      quote: "Stackr has completely transformed how I manage my freelance income. The 40/30/30 split helps me stay disciplined and save consistently.",
      name: "Sarah Johnson",
      title: "Graphic Designer",
      avatar: "👩🏽‍🎨"
    },
    {
      quote: "As a consultant with irregular income, I struggled to budget effectively. Stackr makes it easy to allocate funds and track progress toward my financial goals.",
      name: "Michael Torres",
      title: "Business Consultant",
      avatar: "👨🏻‍💼"
    },
    {
      quote: "The income generation features helped me find new clients and boost my monthly revenue by 20%. The ROI on Stackr Pro has been incredible.",
      name: "Emma Wilson",
      title: "Web Developer",
      avatar: "👩🏼‍💻"
    }
  ];
  
  testimonials.forEach(testimonial => {
    const testimonialCard = document.createElement('div');
    testimonialCard.style.backgroundColor = 'white';
    testimonialCard.style.borderRadius = '10px';
    testimonialCard.style.padding = '30px';
    testimonialCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
    testimonialCard.style.maxWidth = '350px';
    testimonialCard.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    testimonialCard.onmouseenter = () => {
      testimonialCard.style.transform = 'translateY(-5px)';
      testimonialCard.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    };
    
    testimonialCard.onmouseleave = () => {
      testimonialCard.style.transform = 'translateY(0)';
      testimonialCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
    };
    
    // Quote
    const quoteIcon = document.createElement('div');
    quoteIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-primary-light)" stroke="none"><path d="M3.691 6.292C5.094 4.771 7.217 4 10.062 4H10.5v2.5h-.438c-1.938 0-3.3 .471-4.085 1.414S5 10.353 5 12v1h5v7H3V12c0-2.217 .229-4.188 .691-5.708zm11 0C16.094 4.771 18.217 4 21.062 4H21.5v2.5h-.438c-1.938 0-3.3 .471-4.085 1.414S16 10.353 16 12v1h5v7H14V12c0-2.217 .229-4.188 .691-5.708z"></path></svg>';
    quoteIcon.style.marginBottom = '15px';
    quoteIcon.style.display = 'block';
    
    const quoteText = document.createElement('p');
    quoteText.textContent = testimonial.quote;
    quoteText.style.fontSize = '16px';
    quoteText.style.color = 'var(--color-text)';
    quoteText.style.lineHeight = '1.6';
    quoteText.style.marginBottom = '20px';
    quoteText.style.fontStyle = 'italic';
    
    // Author
    const authorContainer = document.createElement('div');
    authorContainer.style.display = 'flex';
    authorContainer.style.alignItems = 'center';
    
    const avatar = document.createElement('div');
    avatar.textContent = testimonial.avatar;
    avatar.style.fontSize = '30px';
    avatar.style.marginRight = '15px';
    avatar.style.backgroundColor = 'var(--color-primary-light)';
    avatar.style.width = '50px';
    avatar.style.height = '50px';
    avatar.style.borderRadius = '50%';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    
    const authorInfo = document.createElement('div');
    
    const authorName = document.createElement('h4');
    authorName.textContent = testimonial.name;
    authorName.style.fontSize = '18px';
    authorName.style.fontWeight = '600';
    authorName.style.marginBottom = '5px';
    authorName.style.color = 'var(--color-text)';
    
    const authorTitle = document.createElement('p');
    authorTitle.textContent = testimonial.title;
    authorTitle.style.fontSize = '14px';
    authorTitle.style.color = 'var(--color-text-secondary)';
    
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(authorTitle);
    
    authorContainer.appendChild(avatar);
    authorContainer.appendChild(authorInfo);
    
    // Assemble testimonial card
    testimonialCard.appendChild(quoteIcon);
    testimonialCard.appendChild(quoteText);
    testimonialCard.appendChild(authorContainer);
    
    testimonialsContainer.appendChild(testimonialCard);
  });
  
  testimonialsSection.appendChild(sectionHeader);
  testimonialsSection.appendChild(testimonialsContainer);
  
  return testimonialsSection;
}

/**
 * Create the pricing section
 * @returns {HTMLElement} The pricing section element
 */
function createPricingSection() {
  const pricingSection = document.createElement('section');
  pricingSection.id = 'pricing';
  pricingSection.style.padding = '80px 40px';
  pricingSection.style.backgroundColor = 'var(--color-background)';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.textAlign = 'center';
  sectionHeader.style.maxWidth = '700px';
  sectionHeader.style.margin = '0 auto 40px';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Simple, Transparent Pricing';
  sectionTitle.style.fontSize = '36px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '20px';
  sectionTitle.style.color = 'var(--color-text)';
  
  const sectionDescription = document.createElement('p');
  sectionDescription.textContent = 'Choose the plan that works best for your financial goals.';
  sectionDescription.style.fontSize = '18px';
  sectionDescription.style.color = 'var(--color-text-secondary)';
  sectionDescription.style.lineHeight = '1.6';
  
  sectionHeader.appendChild(sectionTitle);
  sectionHeader.appendChild(sectionDescription);
  
  // Pricing teaser
  const pricingTeaser = document.createElement('div');
  pricingTeaser.style.display = 'flex';
  pricingTeaser.style.justifyContent = 'center';
  pricingTeaser.style.alignItems = 'center';
  pricingTeaser.style.gap = '30px';
  pricingTeaser.style.flexWrap = 'wrap';
  pricingTeaser.style.maxWidth = '1000px';
  pricingTeaser.style.margin = '0 auto';
  pricingTeaser.style.marginBottom = '40px';
  
  // Pricing highlights
  const pricingCards = [
    {
      title: 'Free',
      price: '$0',
      description: 'Get started with basic financial tracking',
      features: ['Income tracking', 'Basic expense categorization', 'Single bank connection']
    },
    {
      title: 'Pro',
      price: '$9/mo',
      description: 'Advanced tools for financial growth',
      features: ['Everything in Free', 'Unlimited bank connections', 'AI financial advice', 'Export data']
    },
    {
      title: 'Lifetime',
      price: '$99',
      description: 'One-time payment, lifetime access',
      features: ['Everything in Pro', 'One-time payment', 'Early access to new features']
    }
  ];
  
  pricingCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.style.backgroundColor = 'white';
    cardElement.style.borderRadius = '10px';
    cardElement.style.padding = '30px';
    cardElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
    cardElement.style.width = '300px';
    cardElement.style.textAlign = 'center';
    
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = card.title;
    cardTitle.style.fontSize = '22px';
    cardTitle.style.fontWeight = 'bold';
    cardTitle.style.marginBottom = '10px';
    cardTitle.style.color = 'var(--color-text)';
    
    const cardPrice = document.createElement('div');
    cardPrice.textContent = card.price;
    cardPrice.style.fontSize = '28px';
    cardPrice.style.fontWeight = 'bold';
    cardPrice.style.marginBottom = '10px';
    cardPrice.style.color = 'var(--color-primary)';
    
    const cardDescription = document.createElement('p');
    cardDescription.textContent = card.description;
    cardDescription.style.fontSize = '15px';
    cardDescription.style.color = 'var(--color-text-secondary)';
    cardDescription.style.marginBottom = '20px';
    
    const featuresList = document.createElement('ul');
    featuresList.style.listStyleType = 'none';
    featuresList.style.padding = '0';
    featuresList.style.textAlign = 'left';
    featuresList.style.marginBottom = '20px';
    
    card.features.forEach(feature => {
      const featureItem = document.createElement('li');
      featureItem.style.marginBottom = '10px';
      featureItem.style.display = 'flex';
      featureItem.style.alignItems = 'center';
      
      const checkIcon = document.createElement('span');
      checkIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      checkIcon.style.marginRight = '10px';
      
      featureItem.appendChild(checkIcon);
      featureItem.appendChild(document.createTextNode(feature));
      
      featuresList.appendChild(featureItem);
    });
    
    cardElement.appendChild(cardTitle);
    cardElement.appendChild(cardPrice);
    cardElement.appendChild(cardDescription);
    cardElement.appendChild(featuresList);
    
    pricingTeaser.appendChild(cardElement);
  });
  
  // View all plans button
  const viewAllButton = document.createElement('a');
  viewAllButton.textContent = 'View Detailed Plans';
  viewAllButton.href = '#subscriptions';
  viewAllButton.style.display = 'block';
  viewAllButton.style.width = 'fit-content';
  viewAllButton.style.margin = '0 auto';
  viewAllButton.style.padding = '14px 28px';
  viewAllButton.style.backgroundColor = 'var(--color-primary)';
  viewAllButton.style.color = 'white';
  viewAllButton.style.textDecoration = 'none';
  viewAllButton.style.borderRadius = '8px';
  viewAllButton.style.fontWeight = '600';
  viewAllButton.style.fontSize = '16px';
  viewAllButton.style.transition = 'all 0.2s ease';
  viewAllButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  
  viewAllButton.onmouseenter = () => {
    viewAllButton.style.backgroundColor = 'var(--color-primary-dark)';
    viewAllButton.style.transform = 'translateY(-2px)';
    viewAllButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
  };
  
  viewAllButton.onmouseleave = () => {
    viewAllButton.style.backgroundColor = 'var(--color-primary)';
    viewAllButton.style.transform = 'translateY(0)';
    viewAllButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  };
  
  pricingSection.appendChild(sectionHeader);
  pricingSection.appendChild(pricingTeaser);
  pricingSection.appendChild(viewAllButton);
  
  return pricingSection;
}

/**
 * Create the CTA section
 * @returns {HTMLElement} The CTA section element
 */
function createCTASection() {
  const ctaSection = document.createElement('section');
  ctaSection.style.padding = '80px 40px';
  ctaSection.style.backgroundColor = 'var(--color-primary)';
  ctaSection.style.color = 'white';
  ctaSection.style.textAlign = 'center';
  
  // Section content
  const ctaContent = document.createElement('div');
  ctaContent.style.maxWidth = '700px';
  ctaContent.style.margin = '0 auto';
  
  const ctaTitle = document.createElement('h2');
  ctaTitle.textContent = 'Ready to take control of your finances?';
  ctaTitle.style.fontSize = '36px';
  ctaTitle.style.fontWeight = 'bold';
  ctaTitle.style.marginBottom = '20px';
  
  const ctaDescription = document.createElement('p');
  ctaDescription.textContent = 'Join thousands of service providers who are growing their wealth with Stackr Finance.';
  ctaDescription.style.fontSize = '18px';
  ctaDescription.style.opacity = '0.9';
  ctaDescription.style.marginBottom = '40px';
  ctaDescription.style.lineHeight = '1.6';
  
  // CTA button
  const ctaButton = document.createElement('a');
  ctaButton.textContent = 'Get Started For Free';
  ctaButton.href = '#register';
  ctaButton.style.display = 'inline-block';
  ctaButton.style.padding = '16px 32px';
  ctaButton.style.backgroundColor = 'white';
  ctaButton.style.color = 'var(--color-primary)';
  ctaButton.style.textDecoration = 'none';
  ctaButton.style.borderRadius = '8px';
  ctaButton.style.fontWeight = '600';
  ctaButton.style.fontSize = '18px';
  ctaButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  ctaButton.style.transition = 'all 0.3s ease';
  
  ctaButton.onmouseenter = () => {
    ctaButton.style.transform = 'translateY(-3px)';
    ctaButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
  };
  
  ctaButton.onmouseleave = () => {
    ctaButton.style.transform = 'translateY(0)';
    ctaButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  };
  
  ctaContent.appendChild(ctaTitle);
  ctaContent.appendChild(ctaDescription);
  ctaContent.appendChild(ctaButton);
  
  ctaSection.appendChild(ctaContent);
  
  return ctaSection;
}

/**
 * Create the footer
 * @returns {HTMLElement} The footer element
 */
function createFooter() {
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#f8f9fa';
  footer.style.padding = '60px 40px 30px';
  
  // Footer content
  const footerContent = document.createElement('div');
  footerContent.style.maxWidth = '1200px';
  footerContent.style.margin = '0 auto';
  
  // Top section with columns
  const topSection = document.createElement('div');
  topSection.style.display = 'flex';
  topSection.style.flexWrap = 'wrap';
  topSection.style.justifyContent = 'space-between';
  topSection.style.marginBottom = '40px';
  
  // Column 1: Logo and about
  const column1 = document.createElement('div');
  column1.style.maxWidth = '300px';
  column1.style.marginBottom = '30px';
  
  const footerLogo = document.createElement('div');
  footerLogo.textContent = 'Stackr Finance';
  footerLogo.style.fontSize = '24px';
  footerLogo.style.fontWeight = 'bold';
  footerLogo.style.marginBottom = '15px';
  footerLogo.style.color = 'var(--color-primary)';
  
  const footerAbout = document.createElement('p');
  footerAbout.textContent = 'The ultimate financial management platform for service providers, helping you track income, plan expenses, and achieve your financial goals.';
  footerAbout.style.fontSize = '14px';
  footerAbout.style.color = 'var(--color-text-secondary)';
  footerAbout.style.lineHeight = '1.6';
  
  column1.appendChild(footerLogo);
  column1.appendChild(footerAbout);
  
  // Columns 2-4: Links
  const columns = [
    {
      title: 'Features',
      links: [
        { text: 'Income Tracking', href: '#features' },
        { text: '40/30/30 Split', href: '#features' },
        { text: 'Goal Setting', href: '#features' },
        { text: 'Bank Integration', href: '#features' },
        { text: 'AI Financial Advice', href: '#features' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { text: 'Blog', href: '#blog' },
        { text: 'Help Center', href: '#help' },
        { text: 'Tutorials', href: '#tutorials' },
        { text: 'FAQs', href: '#faq' },
        { text: 'Contact Us', href: '#contact' }
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '#about' },
        { text: 'Careers', href: '#careers' },
        { text: 'Privacy Policy', href: '#privacy' },
        { text: 'Terms of Service', href: '#terms' }
      ]
    }
  ];
  
  columns.forEach(column => {
    const columnDiv = document.createElement('div');
    columnDiv.style.marginBottom = '30px';
    columnDiv.style.minWidth = '160px';
    
    const columnTitle = document.createElement('h4');
    columnTitle.textContent = column.title;
    columnTitle.style.fontSize = '18px';
    columnTitle.style.fontWeight = 'bold';
    columnTitle.style.marginBottom = '20px';
    columnTitle.style.color = 'var(--color-text)';
    
    const linksList = document.createElement('ul');
    linksList.style.listStyleType = 'none';
    linksList.style.padding = '0';
    
    column.links.forEach(link => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '10px';
      
      const linkElement = document.createElement('a');
      linkElement.textContent = link.text;
      linkElement.href = link.href;
      linkElement.style.textDecoration = 'none';
      linkElement.style.color = 'var(--color-text-secondary)';
      linkElement.style.fontSize = '14px';
      linkElement.style.transition = 'color 0.2s ease';
      
      linkElement.onmouseenter = () => {
        linkElement.style.color = 'var(--color-primary)';
      };
      
      linkElement.onmouseleave = () => {
        linkElement.style.color = 'var(--color-text-secondary)';
      };
      
      listItem.appendChild(linkElement);
      linksList.appendChild(listItem);
    });
    
    columnDiv.appendChild(columnTitle);
    columnDiv.appendChild(linksList);
    
    topSection.appendChild(columnDiv);
  });
  
  // Bottom section with copyright
  const bottomSection = document.createElement('div');
  bottomSection.style.borderTop = '1px solid var(--color-border)';
  bottomSection.style.paddingTop = '30px';
  bottomSection.style.display = 'flex';
  bottomSection.style.flexWrap = 'wrap';
  bottomSection.style.justifyContent = 'space-between';
  bottomSection.style.alignItems = 'center';
  
  const copyright = document.createElement('p');
  copyright.textContent = `© ${new Date().getFullYear()} Stackr Finance. All rights reserved.`;
  copyright.style.fontSize = '14px';
  copyright.style.color = 'var(--color-text-secondary)';
  
  const socialLinks = document.createElement('div');
  socialLinks.style.display = 'flex';
  socialLinks.style.gap = '15px';
  
  const socialIcons = [
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>'
  ];
  
  socialIcons.forEach(icon => {
    const socialLink = document.createElement('a');
    socialLink.href = '#';
    socialLink.style.color = 'var(--color-text-secondary)';
    socialLink.style.transition = 'color 0.2s ease';
    socialLink.innerHTML = icon;
    
    socialLink.onmouseenter = () => {
      socialLink.style.color = 'var(--color-primary)';
    };
    
    socialLink.onmouseleave = () => {
      socialLink.style.color = 'var(--color-text-secondary)';
    };
    
    socialLinks.appendChild(socialLink);
  });
  
  bottomSection.appendChild(copyright);
  bottomSection.appendChild(socialLinks);
  
  // Assemble footer
  topSection.appendChild(column1);
  footerContent.appendChild(topSection);
  footerContent.appendChild(bottomSection);
  footer.appendChild(footerContent);
  
  return footer;
}