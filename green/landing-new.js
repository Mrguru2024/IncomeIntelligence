/**
 * Landing Page for Stackr Finance GREEN version
 * High-conversion landing page to drive signups and subscriptions
 */

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
  container.style.color = '#333';
  container.style.overflowX = 'hidden';
  
  // Add navigation
  const navbar = createNavbar();
  container.appendChild(navbar);
  
  // Add hero section
  const heroSection = createHeroSection();
  container.appendChild(heroSection);
  
  // Add social proof section
  const socialProofSection = createSocialProofSection();
  container.appendChild(socialProofSection);
  
  // Add features section
  const featuresSection = createFeaturesSection();
  container.appendChild(featuresSection);
  
  // Add income split visualization section
  const incomeSplitSection = createIncomeSplitSection();
  container.appendChild(incomeSplitSection);
  
  // Add testimonials section
  const testimonialsSection = createTestimonialsSection();
  container.appendChild(testimonialsSection);
  
  // Add income opportunities section
  const incomeOpportunitiesSection = createIncomeOpportunitiesSection();
  container.appendChild(incomeOpportunitiesSection);
  
  // Add pricing section
  const pricingSection = createPricingSection();
  container.appendChild(pricingSection);
  
  // Add FAQ section
  const faqSection = createFAQSection();
  container.appendChild(faqSection);
  
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
  navbar.style.padding = '1rem 5%';
  navbar.style.backgroundColor = 'white';
  navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
  navbar.style.position = 'sticky';
  navbar.style.top = '0';
  navbar.style.zIndex = '100';
  
  // Logo
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.cursor = 'pointer';
  
  // Stackr logo icon with stacked elements
  const logoIcon = document.createElement('div');
  logoIcon.style.marginRight = '10px';
  logoIcon.style.display = 'flex';
  logoIcon.style.flexDirection = 'column';
  logoIcon.style.alignItems = 'center';
  logoIcon.style.justifyContent = 'center';
  logoIcon.style.width = '32px';
  logoIcon.style.height = '32px';
  
  // Create stacked blocks for logo
  const blocks = ['#4CAF50', '#2196F3', '#FFC107'];
  blocks.forEach((color, index) => {
    const block = document.createElement('div');
    block.style.width = `${32 - index * 4}px`;
    block.style.height = '6px';
    block.style.backgroundColor = color;
    block.style.borderRadius = '2px';
    block.style.marginBottom = '2px';
    logoIcon.appendChild(block);
  });
  
  logoContainer.appendChild(logoIcon);
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr';
  logo.style.margin = '0';
  logo.style.fontSize = '1.6rem';
  logo.style.fontWeight = 'bold';
  logo.style.background = 'linear-gradient(90deg, #4CAF50 0%, #2196F3 50%, #FFC107 100%)';
  logo.style.WebkitBackgroundClip = 'text';
  logo.style.WebkitTextFillColor = 'transparent';
  logo.style.backgroundClip = 'text';
  logo.style.color = 'transparent';
  logoContainer.appendChild(logo);
  
  // Navigation links
  const navLinks = document.createElement('div');
  navLinks.style.display = 'flex';
  navLinks.style.gap = '2rem';
  
  const links = [
    { text: 'Features', href: '#features' },
    { text: 'Income Tools', href: '#income-opportunities' },
    { text: 'Pricing', href: '#pricing' },
    { text: 'FAQ', href: '#faq' }
  ];
  
  links.forEach(link => {
    const a = document.createElement('a');
    a.textContent = link.text;
    a.href = link.href;
    a.style.textDecoration = 'none';
    a.style.color = '#333';
    a.style.fontWeight = '500';
    a.style.fontSize = '0.95rem';
    a.style.transition = 'color 0.2s ease';
    
    a.addEventListener('mouseover', () => {
      a.style.color = '#4CAF50';
    });
    
    a.addEventListener('mouseout', () => {
      a.style.color = '#333';
    });
    
    navLinks.appendChild(a);
  });
  
  // Auth buttons
  const authButtons = document.createElement('div');
  authButtons.style.display = 'flex';
  authButtons.style.gap = '1rem';
  authButtons.style.alignItems = 'center';
  
  const loginButton = document.createElement('button');
  loginButton.textContent = 'Log In';
  loginButton.style.backgroundColor = 'transparent';
  loginButton.style.color = '#4CAF50';
  loginButton.style.border = '1px solid #4CAF50';
  loginButton.style.borderRadius = '4px';
  loginButton.style.padding = '0.6rem 1.2rem';
  loginButton.style.fontWeight = '600';
  loginButton.style.fontSize = '0.9rem';
  loginButton.style.cursor = 'pointer';
  loginButton.style.transition = 'all 0.2s ease';
  
  loginButton.addEventListener('mouseover', () => {
    loginButton.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
  });
  
  loginButton.addEventListener('mouseout', () => {
    loginButton.style.backgroundColor = 'transparent';
  });
  
  loginButton.addEventListener('click', () => {
    window.location.hash = 'login';
  });
  
  const signupButton = document.createElement('button');
  signupButton.textContent = 'Start Free';
  signupButton.style.backgroundColor = '#4CAF50';
  signupButton.style.color = 'white';
  signupButton.style.border = 'none';
  signupButton.style.borderRadius = '4px';
  signupButton.style.padding = '0.6rem 1.2rem';
  signupButton.style.fontWeight = '600';
  signupButton.style.fontSize = '0.9rem';
  signupButton.style.cursor = 'pointer';
  signupButton.style.transition = 'all 0.2s ease';
  signupButton.style.boxShadow = '0 4px 10px rgba(76, 175, 80, 0.2)';
  
  signupButton.addEventListener('mouseover', () => {
    signupButton.style.backgroundColor = '#43A047';
    signupButton.style.transform = 'translateY(-2px)';
    signupButton.style.boxShadow = '0 6px 15px rgba(76, 175, 80, 0.25)';
  });
  
  signupButton.addEventListener('mouseout', () => {
    signupButton.style.backgroundColor = '#4CAF50';
    signupButton.style.transform = 'translateY(0)';
    signupButton.style.boxShadow = '0 4px 10px rgba(76, 175, 80, 0.2)';
  });
  
  signupButton.addEventListener('click', () => {
    window.location.hash = 'register';
  });
  
  authButtons.appendChild(loginButton);
  authButtons.appendChild(signupButton);
  
  // Mobile menu button (hamburger)
  const mobileMenuButton = document.createElement('button');
  mobileMenuButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 6H21" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 18H21" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  mobileMenuButton.style.background = 'none';
  mobileMenuButton.style.border = 'none';
  mobileMenuButton.style.cursor = 'pointer';
  mobileMenuButton.style.display = 'none';
  
  // Responsive adjustments
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      navLinks.style.display = 'none';
      mobileMenuButton.style.display = 'block';
    } else {
      navLinks.style.display = 'flex';
      mobileMenuButton.style.display = 'none';
    }
  };
  
  // Initial check
  handleResize();
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
  
  navbar.appendChild(logoContainer);
  navbar.appendChild(navLinks);
  navbar.appendChild(authButtons);
  navbar.appendChild(mobileMenuButton);
  
  return navbar;
}

/**
 * Create the hero section with compelling headline and call-to-action
 * @returns {HTMLElement} The hero section element
 */
function createHeroSection() {
  const heroSection = document.createElement('section');
  heroSection.style.display = 'flex';
  heroSection.style.flexDirection = window.innerWidth <= 960 ? 'column' : 'row';
  heroSection.style.justifyContent = 'space-between';
  heroSection.style.alignItems = 'center';
  heroSection.style.padding = window.innerWidth <= 480 ? '3rem 5%' : '4rem 5%';
  heroSection.style.backgroundColor = '#f9f9f9';
  heroSection.style.backgroundImage = 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,249,240,0.8) 100%)';
  heroSection.style.position = 'relative';
  heroSection.style.overflow = 'hidden';
  
  // Decorative elements
  const decorCircle1 = document.createElement('div');
  decorCircle1.style.position = 'absolute';
  decorCircle1.style.width = '300px';
  decorCircle1.style.height = '300px';
  decorCircle1.style.borderRadius = '50%';
  decorCircle1.style.backgroundColor = 'rgba(76, 175, 80, 0.05)';
  decorCircle1.style.top = '-150px';
  decorCircle1.style.right = '-50px';
  heroSection.appendChild(decorCircle1);
  
  const decorCircle2 = document.createElement('div');
  decorCircle2.style.position = 'absolute';
  decorCircle2.style.width = '200px';
  decorCircle2.style.height = '200px';
  decorCircle2.style.borderRadius = '50%';
  decorCircle2.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
  decorCircle2.style.bottom = '-100px';
  decorCircle2.style.left = '10%';
  heroSection.appendChild(decorCircle2);
  
  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.style.width = window.innerWidth <= 960 ? '100%' : '45%';
  contentContainer.style.zIndex = '1';
  contentContainer.style.paddingRight = window.innerWidth <= 960 ? '0' : '2rem';
  contentContainer.style.textAlign = window.innerWidth <= 960 ? 'center' : 'left';
  
  // Headline with highlighting
  const headline = document.createElement('h2');
  headline.innerHTML = `Take Control of Your Income with the <span style="background: linear-gradient(90deg, #4CAF50 0%, #2196F3 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;">40/30/30 Split</span>`;
  headline.style.fontSize = window.innerWidth <= 768 ? '2rem' : '2.8rem';
  headline.style.fontWeight = '700';
  headline.style.lineHeight = '1.2';
  headline.style.margin = '0 0 1.5rem 0';
  contentContainer.appendChild(headline);
  
  // Subheadline
  const subheadline = document.createElement('p');
  subheadline.textContent = 'The smart financial platform built for service providers and gig workers to track income, maximize earnings, and build wealth through the proven 40/30/30 method.';
  subheadline.style.fontSize = '1.1rem';
  subheadline.style.lineHeight = '1.6';
  subheadline.style.color = '#555';
  subheadline.style.marginBottom = '2rem';
  contentContainer.appendChild(subheadline);
  
  // CTA buttons
  const ctaContainer = document.createElement('div');
  ctaContainer.style.display = 'flex';
  ctaContainer.style.gap = '1rem';
  ctaContainer.style.flexWrap = 'wrap';
  ctaContainer.style.justifyContent = window.innerWidth <= 960 ? 'center' : 'flex-start';
  
  const primaryCta = document.createElement('button');
  primaryCta.textContent = 'Start For Free';
  primaryCta.style.backgroundColor = '#4CAF50';
  primaryCta.style.color = 'white';
  primaryCta.style.border = 'none';
  primaryCta.style.borderRadius = '4px';
  primaryCta.style.padding = '0.85rem 1.75rem';
  primaryCta.style.fontWeight = '600';
  primaryCta.style.fontSize = '1rem';
  primaryCta.style.cursor = 'pointer';
  primaryCta.style.transition = 'all 0.2s ease';
  primaryCta.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.2)';
  
  primaryCta.addEventListener('mouseover', () => {
    primaryCta.style.backgroundColor = '#43A047';
    primaryCta.style.transform = 'translateY(-2px)';
    primaryCta.style.boxShadow = '0 6px 15px rgba(76, 175, 80, 0.25)';
  });
  
  primaryCta.addEventListener('mouseout', () => {
    primaryCta.style.backgroundColor = '#4CAF50';
    primaryCta.style.transform = 'translateY(0)';
    primaryCta.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.2)';
  });
  
  primaryCta.addEventListener('click', () => {
    window.location.hash = 'register';
  });
  
  const secondaryCta = document.createElement('button');
  secondaryCta.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <circle cx="12" cy="12" r="10" stroke="#2196F3" stroke-width="2"/>
      <path d="M9.5 16V8L16 12L9.5 16Z" fill="#2196F3"/>
    </svg>
    Watch Demo
  `;
  secondaryCta.style.display = 'flex';
  secondaryCta.style.alignItems = 'center';
  secondaryCta.style.backgroundColor = 'white';
  secondaryCta.style.color = '#2196F3';
  secondaryCta.style.border = '1px solid #2196F3';
  secondaryCta.style.borderRadius = '4px';
  secondaryCta.style.padding = '0.85rem 1.75rem';
  secondaryCta.style.fontWeight = '600';
  secondaryCta.style.fontSize = '1rem';
  secondaryCta.style.cursor = 'pointer';
  secondaryCta.style.transition = 'all 0.2s ease';
  
  secondaryCta.addEventListener('mouseover', () => {
    secondaryCta.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
  });
  
  secondaryCta.addEventListener('mouseout', () => {
    secondaryCta.style.backgroundColor = 'white';
  });
  
  ctaContainer.appendChild(primaryCta);
  ctaContainer.appendChild(secondaryCta);
  contentContainer.appendChild(ctaContainer);
  
  // Highlight key features tags
  const tagsContainer = document.createElement('div');
  tagsContainer.style.display = 'flex';
  tagsContainer.style.flexWrap = 'wrap';
  tagsContainer.style.gap = '0.75rem';
  tagsContainer.style.marginTop = '2rem';
  tagsContainer.style.marginBottom = '2rem';
  tagsContainer.style.justifyContent = window.innerWidth <= 960 ? 'center' : 'flex-start';
  
  const tags = [
    { text: '40/30/30 Method', icon: '💰' },
    { text: 'Gig Income Tools', icon: '🛠️' },
    { text: 'Bank Connection', icon: '🏦' },
    { text: 'No Credit Card', icon: '✅' }
  ];
  
  tags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.style.display = 'flex';
    tagElement.style.alignItems = 'center';
    tagElement.style.backgroundColor = 'white';
    tagElement.style.border = '1px solid #e0e0e0';
    tagElement.style.borderRadius = '20px';
    tagElement.style.padding = '0.4rem 0.85rem';
    tagElement.style.fontSize = '0.85rem';
    tagElement.style.fontWeight = '500';
    tagElement.innerHTML = `${tag.icon} <span style="margin-left: 6px;">${tag.text}</span>`;
    tagsContainer.appendChild(tagElement);
  });
  
  contentContainer.appendChild(tagsContainer);
  
  // Hero image container
  const imageContainer = document.createElement('div');
  imageContainer.style.width = window.innerWidth <= 960 ? '100%' : '50%';
  imageContainer.style.maxWidth = '600px';
  imageContainer.style.position = 'relative';
  imageContainer.style.marginTop = window.innerWidth <= 960 ? '3rem' : '0';
  
  // Hero image - dashboard mockup
  const heroImage = document.createElement('div');
  heroImage.style.width = '100%';
  heroImage.style.aspectRatio = '4/3';
  heroImage.style.backgroundColor = 'white';
  heroImage.style.borderRadius = '12px';
  heroImage.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.05)';
  heroImage.style.overflow = 'hidden';
  heroImage.style.border = '1px solid #e0e0e0';
  
  // Mock dashboard UI
  const mockDashboard = document.createElement('div');
  mockDashboard.style.width = '100%';
  mockDashboard.style.height = '100%';
  mockDashboard.style.display = 'flex';
  mockDashboard.style.flexDirection = 'column';
  
  // Dashboard header
  const dashboardHeader = document.createElement('div');
  dashboardHeader.style.backgroundColor = '#4CAF50';
  dashboardHeader.style.color = 'white';
  dashboardHeader.style.padding = '1rem';
  dashboardHeader.style.display = 'flex';
  dashboardHeader.style.justifyContent = 'space-between';
  dashboardHeader.style.alignItems = 'center';
  
  const dashboardTitle = document.createElement('div');
  dashboardTitle.style.fontWeight = 'bold';
  dashboardTitle.textContent = 'Stackr Dashboard';
  
  const userAvatar = document.createElement('div');
  userAvatar.style.width = '32px';
  userAvatar.style.height = '32px';
  userAvatar.style.borderRadius = '50%';
  userAvatar.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  userAvatar.style.display = 'flex';
  userAvatar.style.alignItems = 'center';
  userAvatar.style.justifyContent = 'center';
  userAvatar.textContent = 'JS';
  
  dashboardHeader.appendChild(dashboardTitle);
  dashboardHeader.appendChild(userAvatar);
  mockDashboard.appendChild(dashboardHeader);
  
  // Dashboard content
  const dashboardContent = document.createElement('div');
  dashboardContent.style.padding = '1rem';
  dashboardContent.style.flex = '1';
  dashboardContent.style.backgroundColor = '#fafafa';
  
  // Income split visualization
  const incomeViz = document.createElement('div');
  incomeViz.style.display = 'flex';
  incomeViz.style.height = '140px';
  incomeViz.style.marginBottom = '1rem';
  incomeViz.style.backgroundColor = 'white';
  incomeViz.style.borderRadius = '8px';
  incomeViz.style.border = '1px solid #e0e0e0';
  incomeViz.style.overflow = 'hidden';
  
  // Three colored sections representing 40/30/30 split
  ['#4CAF50', '#2196F3', '#FFC107'].forEach((color, index) => {
    const portion = document.createElement('div');
    portion.style.height = '100%';
    portion.style.flex = index === 0 ? '4' : '3';
    portion.style.backgroundColor = color;
    portion.style.opacity = '0.8';
    
    const label = document.createElement('div');
    label.style.color = 'white';
    label.style.fontWeight = 'bold';
    label.style.padding = '1rem';
    label.style.textAlign = 'center';
    label.textContent = index === 0 ? '40% Needs' : (index === 1 ? '30% Investments' : '30% Savings');
    
    portion.appendChild(label);
    incomeViz.appendChild(portion);
  });
  
  dashboardContent.appendChild(incomeViz);
  
  // Recent income entries
  const incomeList = document.createElement('div');
  incomeList.style.backgroundColor = 'white';
  incomeList.style.borderRadius = '8px';
  incomeList.style.border = '1px solid #e0e0e0';
  incomeList.style.padding = '0.75rem';
  
  const incomeHeader = document.createElement('div');
  incomeHeader.style.fontWeight = 'bold';
  incomeHeader.style.marginBottom = '0.75rem';
  incomeHeader.textContent = 'Recent Income';
  incomeList.appendChild(incomeHeader);
  
  // Income entries
  const entries = [
    { date: 'Apr 10', source: 'Client Project', amount: '$350.00' },
    { date: 'Apr 8', source: 'Gig Platform', amount: '$128.50' },
    { date: 'Apr 5', source: 'Affiliate Commission', amount: '$42.75' }
  ];
  
  entries.forEach(entry => {
    const entryRow = document.createElement('div');
    entryRow.style.display = 'flex';
    entryRow.style.justifyContent = 'space-between';
    entryRow.style.padding = '0.5rem 0';
    entryRow.style.borderBottom = '1px solid #f0f0f0';
    
    const entryInfo = document.createElement('div');
    entryInfo.innerHTML = `<span style="color: #777; font-size: 0.85rem;">${entry.date}</span> <span style="margin-left: 0.5rem;">${entry.source}</span>`;
    
    const entryAmount = document.createElement('div');
    entryAmount.style.fontWeight = '500';
    entryAmount.style.color = '#4CAF50';
    entryAmount.textContent = entry.amount;
    
    entryRow.appendChild(entryInfo);
    entryRow.appendChild(entryAmount);
    incomeList.appendChild(entryRow);
  });
  
  dashboardContent.appendChild(incomeList);
  mockDashboard.appendChild(dashboardContent);
  
  heroImage.appendChild(mockDashboard);
  imageContainer.appendChild(heroImage);
  
  // Floating notifications
  const notification1 = document.createElement('div');
  notification1.style.position = 'absolute';
  notification1.style.top = '20%';
  notification1.style.left = '-5%';
  notification1.style.backgroundColor = 'white';
  notification1.style.borderRadius = '6px';
  notification1.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  notification1.style.padding = '0.75rem 1rem';
  notification1.style.display = 'flex';
  notification1.style.alignItems = 'center';
  notification1.style.zIndex = '2';
  notification1.style.border = '1px solid #e0e0e0';
  
  const notificationIcon1 = document.createElement('div');
  notificationIcon1.innerHTML = '💸';
  notificationIcon1.style.marginRight = '0.75rem';
  notificationIcon1.style.fontSize = '1.5rem';
  
  const notificationText1 = document.createElement('div');
  notificationText1.innerHTML = '<strong>New Income!</strong><br><span style="font-size: 0.85rem; color: #777;">$125.00 from Gig Work</span>';
  
  notification1.appendChild(notificationIcon1);
  notification1.appendChild(notificationText1);
  
  // Only show floating elements on larger screens
  if (window.innerWidth > 768) {
    imageContainer.appendChild(notification1);
    
    const notification2 = document.createElement('div');
    notification2.style.position = 'absolute';
    notification2.style.bottom = '15%';
    notification2.style.right = '0%';
    notification2.style.backgroundColor = 'white';
    notification2.style.borderRadius = '6px';
    notification2.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    notification2.style.padding = '0.75rem 1rem';
    notification2.style.display = 'flex';
    notification2.style.alignItems = 'center';
    notification2.style.zIndex = '2';
    notification2.style.border = '1px solid #e0e0e0';
    
    const notificationIcon2 = document.createElement('div');
    notificationIcon2.innerHTML = '🎯';
    notificationIcon2.style.marginRight = '0.75rem';
    notificationIcon2.style.fontSize = '1.5rem';
    
    const notificationText2 = document.createElement('div');
    notificationText2.innerHTML = '<strong>Goal Reached!</strong><br><span style="font-size: 0.85rem; color: #777;">Savings: $1,000</span>';
    
    notification2.appendChild(notificationIcon2);
    notification2.appendChild(notificationText2);
    imageContainer.appendChild(notification2);
  }
  
  heroSection.appendChild(contentContainer);
  heroSection.appendChild(imageContainer);
  
  return heroSection;
}

/**
 * Create social proof section with trust indicators
 * @returns {HTMLElement} The social proof section element 
 */
function createSocialProofSection() {
  const section = document.createElement('section');
  section.style.padding = '2rem 5%';
  section.style.backgroundColor = 'white';
  section.style.borderBottom = '1px solid #f0f0f0';
  section.style.textAlign = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Trusted by service providers everywhere';
  title.style.fontSize = '1.2rem';
  title.style.fontWeight = '500';
  title.style.color = '#555';
  title.style.marginBottom = '2rem';
  section.appendChild(title);
  
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.flexWrap = 'wrap';
  statsContainer.style.justifyContent = 'space-around';
  statsContainer.style.gap = '1.5rem';
  
  const stats = [
    { count: '5,000+', label: 'Active Users' },
    { count: '$2.5M+', label: 'Income Tracked' },
    { count: '40/30/30', label: 'Proven Method' },
    { count: '4.8/5', label: 'User Rating' }
  ];
  
  stats.forEach(stat => {
    const statBlock = document.createElement('div');
    
    const countEl = document.createElement('div');
    countEl.textContent = stat.count;
    countEl.style.fontSize = '2rem';
    countEl.style.fontWeight = 'bold';
    countEl.style.color = '#4CAF50';
    countEl.style.marginBottom = '0.5rem';
    
    const labelEl = document.createElement('div');
    labelEl.textContent = stat.label;
    labelEl.style.fontSize = '0.9rem';
    labelEl.style.color = '#666';
    
    statBlock.appendChild(countEl);
    statBlock.appendChild(labelEl);
    statsContainer.appendChild(statBlock);
  });
  
  section.appendChild(statsContainer);
  
  return section;
}

/**
 * Create features section with key product benefits
 * @returns {HTMLElement} The features section element
 */
function createFeaturesSection() {
  const section = document.createElement('section');
  section.id = 'features';
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = '#f9f9f9';
  
  // Section header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.maxWidth = '700px';
  header.style.margin = '0 auto 4rem auto';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Smart Financial Tools for Service Providers';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1rem';
  heading.style.color = '#333';
  
  const subheading = document.createElement('p');
  subheading.textContent = 'Stackr gives you all the tools you need to track, manage, and grow your income while building wealth through the proven 40/30/30 method.';
  subheading.style.fontSize = '1.1rem';
  subheading.style.lineHeight = '1.6';
  subheading.style.color = '#555';
  
  header.appendChild(heading);
  header.appendChild(subheading);
  section.appendChild(header);
  
  // Features grid
  const featuresGrid = document.createElement('div');
  featuresGrid.style.display = 'grid';
  featuresGrid.style.gridTemplateColumns = window.innerWidth <= 768 ? '1fr' : (window.innerWidth <= 1024 ? '1fr 1fr' : '1fr 1fr 1fr');
  featuresGrid.style.gap = '2rem';
  featuresGrid.style.maxWidth = '1200px';
  featuresGrid.style.margin = '0 auto';
  
  const features = [
    {
      icon: '💰',
      title: 'Income Tracking',
      description: 'Easily log and categorize all your income sources in one place. Get a clear picture of how much you\'re earning and where it\'s coming from.'
    },
    {
      icon: '📊',
      title: '40/30/30 Split',
      description: 'Automatically split your income using the proven 40/30/30 method: 40% for needs, 30% for investments, and 30% for savings.'
    },
    {
      icon: '🏦',
      title: 'Bank Connection',
      description: 'Securely connect your bank accounts to automatically import transactions and keep your financial data up to date.'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Set financial goals and track your progress. Visualize your journey and stay motivated to achieve your targets.'
    },
    {
      icon: '💼',
      title: 'Gig Opportunities',
      description: 'Discover new income opportunities through our curated marketplace of gigs and side hustles for service providers.'
    },
    {
      icon: '🔄',
      title: 'Affiliate Program',
      description: 'Earn extra income by referring others to products and services that can help them grow their own business.'
    }
  ];
  
  features.forEach(feature => {
    const featureCard = document.createElement('div');
    featureCard.style.backgroundColor = 'white';
    featureCard.style.borderRadius = '8px';
    featureCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    featureCard.style.padding = '2rem';
    featureCard.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    featureCard.addEventListener('mouseover', () => {
      featureCard.style.transform = 'translateY(-5px)';
      featureCard.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
    });
    
    featureCard.addEventListener('mouseout', () => {
      featureCard.style.transform = 'translateY(0)';
      featureCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    });
    
    const iconEl = document.createElement('div');
    iconEl.textContent = feature.icon;
    iconEl.style.fontSize = '2.5rem';
    iconEl.style.marginBottom = '1rem';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = feature.title;
    titleEl.style.fontSize = '1.3rem';
    titleEl.style.fontWeight = '600';
    titleEl.style.marginBottom = '0.75rem';
    titleEl.style.color = '#333';
    
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = feature.description;
    descriptionEl.style.fontSize = '1rem';
    descriptionEl.style.lineHeight = '1.6';
    descriptionEl.style.color = '#555';
    
    featureCard.appendChild(iconEl);
    featureCard.appendChild(titleEl);
    featureCard.appendChild(descriptionEl);
    featuresGrid.appendChild(featureCard);
  });
  
  section.appendChild(featuresGrid);
  
  return section;
}

/**
 * Create income split visualization section
 * @returns {HTMLElement} The income split section element
 */
function createIncomeSplitSection() {
  const section = document.createElement('section');
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = 'white';
  section.style.display = 'flex';
  section.style.flexDirection = window.innerWidth <= 960 ? 'column' : 'row';
  section.style.alignItems = 'center';
  section.style.justifyContent = 'space-between';
  section.style.gap = '4rem';
  
  // Visualization container
  const visualContainer = document.createElement('div');
  visualContainer.style.flex = window.innerWidth <= 960 ? '100%' : '1';
  visualContainer.style.maxWidth = window.innerWidth <= 960 ? '100%' : '500px';
  visualContainer.style.order = window.innerWidth <= 960 ? '2' : '1';
  
  // Create visualization
  const visualization = document.createElement('div');
  visualization.style.width = '100%';
  visualization.style.aspectRatio = '1';
  visualization.style.position = 'relative';
  visualization.style.borderRadius = '50%';
  visualization.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
  
  // Create the pie chart segments for the 40/30/30 split
  const segments = [
    { percent: 40, color: '#4CAF50', label: 'Needs' },
    { percent: 30, color: '#2196F3', label: 'Investments' },
    { percent: 30, color: '#FFC107', label: 'Savings' }
  ];
  
  let cumulativePercent = 0;
  
  segments.forEach((segment, index) => {
    const segmentEl = document.createElement('div');
    segmentEl.style.position = 'absolute';
    segmentEl.style.top = '0';
    segmentEl.style.left = '0';
    segmentEl.style.width = '100%';
    segmentEl.style.height = '100%';
    segmentEl.style.borderRadius = '50%';
    
    // Calculate clip path for the pie segment
    const startAngle = cumulativePercent * 3.6; // Convert percent to degrees (100% = 360 degrees)
    const endAngle = (cumulativePercent + segment.percent) * 3.6;
    
    // Convert angles to coordinates to create a clip path
    // This creates a pie slice shape using a clip path
    let clipPath = 'polygon(50% 50%,';
    
    // Add the start point
    clipPath += `${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%,`;
    
    // Add points along the arc
    for (let angle = startAngle; angle <= endAngle; angle += 5) {
      const x = 50 + 50 * Math.cos(angle * Math.PI / 180);
      const y = 50 + 50 * Math.sin(angle * Math.PI / 180);
      clipPath += `${x}% ${y}%,`;
    }
    
    // Add the end point
    clipPath += `${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`;
    
    segmentEl.style.clipPath = clipPath;
    segmentEl.style.backgroundColor = segment.color;
    
    // Add a subtle gradient overlay
    segmentEl.style.background = `linear-gradient(135deg, ${segment.color} 0%, ${adjustBrightness(segment.color, 20)} 100%)`;
    
    // Slight 3D effect with a border
    segmentEl.style.border = '2px solid white';
    
    visualization.appendChild(segmentEl);
    
    // Create labels that point to each segment
    const labelAngle = (startAngle + endAngle) / 2; // Middle of the segment
    const labelDistance = 130; // Distance from center as percentage
    
    const labelX = 50 + labelDistance * Math.cos(labelAngle * Math.PI / 180);
    const labelY = 50 + labelDistance * Math.sin(labelAngle * Math.PI / 180);
    
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.left = `${labelX}%`;
    label.style.top = `${labelY}%`;
    label.style.transform = 'translate(-50%, -50%)';
    label.style.backgroundColor = 'white';
    label.style.color = segment.color;
    label.style.padding = '0.5rem 1rem';
    label.style.borderRadius = '30px';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '0.9rem';
    label.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
    label.style.border = `2px solid ${segment.color}`;
    label.textContent = `${segment.percent}% ${segment.label}`;
    
    // Only show labels on larger screens
    if (window.innerWidth > 500) {
      visualization.appendChild(label);
    }
    
    cumulativePercent += segment.percent;
  });
  
  // Central circle
  const centerCircle = document.createElement('div');
  centerCircle.style.position = 'absolute';
  centerCircle.style.width = '30%';
  centerCircle.style.height = '30%';
  centerCircle.style.borderRadius = '50%';
  centerCircle.style.top = '35%';
  centerCircle.style.left = '35%';
  centerCircle.style.backgroundColor = 'white';
  centerCircle.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  centerCircle.style.display = 'flex';
  centerCircle.style.alignItems = 'center';
  centerCircle.style.justifyContent = 'center';
  centerCircle.style.fontWeight = 'bold';
  centerCircle.style.fontSize = '1.2rem';
  centerCircle.style.color = '#333';
  centerCircle.textContent = '100%';
  
  visualization.appendChild(centerCircle);
  visualContainer.appendChild(visualization);
  
  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.style.flex = window.innerWidth <= 960 ? '100%' : '1';
  contentContainer.style.order = window.innerWidth <= 960 ? '1' : '2';
  contentContainer.style.textAlign = window.innerWidth <= 960 ? 'center' : 'left';
  
  const heading = document.createElement('h2');
  heading.textContent = 'The 40/30/30 Method: Your Financial Framework';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1.5rem';
  heading.style.color = '#333';
  
  const description = document.createElement('p');
  description.textContent = 'The 40/30/30 method is a simple but powerful approach to managing your income. It helps you allocate your earnings in a balanced way to cover your needs while building wealth through investments and savings.';
  description.style.fontSize = '1.1rem';
  description.style.lineHeight = '1.6';
  description.style.color = '#555';
  description.style.marginBottom = '2rem';
  
  contentContainer.appendChild(heading);
  contentContainer.appendChild(description);
  
  // Split method details
  const splitDetails = document.createElement('div');
  splitDetails.style.display = 'flex';
  splitDetails.style.flexDirection = 'column';
  splitDetails.style.gap = '1.5rem';
  
  const splits = [
    {
      title: '40% for Needs',
      color: '#4CAF50',
      description: 'Cover your essential expenses like rent, utilities, groceries, and basic transportation.',
      icon: '🏠'
    },
    {
      title: '30% for Investments',
      color: '#2196F3',
      description: 'Grow your wealth through stocks, bonds, real estate, or your own business ventures.',
      icon: '📈'
    },
    {
      title: '30% for Savings',
      color: '#FFC107',
      description: 'Build an emergency fund, save for major purchases, or set aside money for future goals.',
      icon: '💰'
    }
  ];
  
  splits.forEach(split => {
    const splitItem = document.createElement('div');
    splitItem.style.display = 'flex';
    splitItem.style.alignItems = window.innerWidth <= 960 ? 'center' : 'flex-start';
    splitItem.style.flexDirection = window.innerWidth <= 480 ? 'column' : 'row';
    splitItem.style.gap = '1rem';
    splitItem.style.padding = '1.25rem';
    splitItem.style.backgroundColor = 'white';
    splitItem.style.borderRadius = '8px';
    splitItem.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    splitItem.style.border = `1px solid ${split.color}`;
    splitItem.style.transition = 'transform 0.2s ease';
    
    splitItem.addEventListener('mouseover', () => {
      splitItem.style.transform = 'translateX(5px)';
    });
    
    splitItem.addEventListener('mouseout', () => {
      splitItem.style.transform = 'translateX(0)';
    });
    
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.backgroundColor = `${split.color}20`; // 20% opacity
    iconContainer.style.color = split.color;
    iconContainer.style.width = '50px';
    iconContainer.style.height = '50px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.fontSize = '1.5rem';
    iconContainer.style.flexShrink = '0';
    iconContainer.style.marginBottom = window.innerWidth <= 480 ? '0.5rem' : '0';
    iconContainer.textContent = split.icon;
    
    const textContainer = document.createElement('div');
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = split.title;
    titleEl.style.fontSize = '1.1rem';
    titleEl.style.fontWeight = '600';
    titleEl.style.color = split.color;
    titleEl.style.marginBottom = '0.5rem';
    
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = split.description;
    descriptionEl.style.fontSize = '0.95rem';
    descriptionEl.style.lineHeight = '1.5';
    descriptionEl.style.color = '#555';
    descriptionEl.style.margin = '0';
    
    textContainer.appendChild(titleEl);
    textContainer.appendChild(descriptionEl);
    
    splitItem.appendChild(iconContainer);
    splitItem.appendChild(textContainer);
    
    splitDetails.appendChild(splitItem);
  });
  
  contentContainer.appendChild(splitDetails);
  
  // Customization note
  const customNote = document.createElement('div');
  customNote.style.marginTop = '2rem';
  customNote.style.padding = '1rem';
  customNote.style.backgroundColor = '#f5f5f5';
  customNote.style.borderRadius = '8px';
  customNote.style.fontSize = '0.95rem';
  customNote.style.color = '#666';
  customNote.innerHTML = '<strong>Pro Tip:</strong> You can customize these percentages in Stackr to match your unique financial situation and goals.';
  
  contentContainer.appendChild(customNote);
  
  section.appendChild(visualContainer);
  section.appendChild(contentContainer);
  
  return section;
}

/**
 * Create testimonials section with user success stories
 * @returns {HTMLElement} The testimonials section element
 */
function createTestimonialsSection() {
  const section = document.createElement('section');
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = '#f9f9f9';
  section.style.textAlign = 'center';
  
  // Section header
  const header = document.createElement('div');
  header.style.maxWidth = '700px';
  header.style.margin = '0 auto 4rem auto';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Success Stories from Service Providers Like You';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1rem';
  heading.style.color = '#333';
  
  const subheading = document.createElement('p');
  subheading.textContent = 'Hear from other service providers who have transformed their financial future with Stackr.';
  subheading.style.fontSize = '1.1rem';
  subheading.style.lineHeight = '1.6';
  subheading.style.color = '#555';
  
  header.appendChild(heading);
  header.appendChild(subheading);
  section.appendChild(header);
  
  // Testimonials grid
  const testimonialsContainer = document.createElement('div');
  testimonialsContainer.style.display = 'grid';
  testimonialsContainer.style.gridTemplateColumns = window.innerWidth <= 768 ? '1fr' : (window.innerWidth <= 1100 ? '1fr 1fr' : '1fr 1fr 1fr');
  testimonialsContainer.style.gap = '2rem';
  testimonialsContainer.style.maxWidth = '1200px';
  testimonialsContainer.style.margin = '0 auto';
  
  const testimonials = [
    {
      quote: "Since I started using the 40/30/30 method with Stackr, I've saved over $5,000 in just 6 months. It's completely changed how I think about my freelance income.",
      name: "Michael T.",
      role: "Freelance Graphic Designer",
      avatar: "MT"
    },
    {
      quote: "As a hair stylist, my income used to be unpredictable. Stackr helped me organize my finances and start investing for the first time. Now I'm building wealth while doing what I love.",
      name: "Jessica K.",
      role: "Hair Stylist & Salon Owner",
      avatar: "JK"
    },
    {
      quote: "I was living paycheck to paycheck before Stackr. Their income tools helped me find new gig opportunities and increase my monthly earnings by 35%. Game changer!",
      name: "David L.",
      role: "Rideshare & Delivery Driver",
      avatar: "DL"
    }
  ];
  
  testimonials.forEach(testimonial => {
    const testimonialCard = document.createElement('div');
    testimonialCard.style.backgroundColor = 'white';
    testimonialCard.style.borderRadius = '8px';
    testimonialCard.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
    testimonialCard.style.padding = '2rem';
    testimonialCard.style.display = 'flex';
    testimonialCard.style.flexDirection = 'column';
    testimonialCard.style.height = '100%';
    testimonialCard.style.transition = 'transform 0.2s ease';
    
    testimonialCard.addEventListener('mouseover', () => {
      testimonialCard.style.transform = 'translateY(-5px)';
    });
    
    testimonialCard.addEventListener('mouseout', () => {
      testimonialCard.style.transform = 'translateY(0)';
    });
    
    // Quote marks
    const quoteMarks = document.createElement('div');
    quoteMarks.innerHTML = '"';
    quoteMarks.style.fontSize = '4rem';
    quoteMarks.style.lineHeight = '1';
    quoteMarks.style.fontFamily = 'Georgia, serif';
    quoteMarks.style.color = '#4CAF50';
    quoteMarks.style.opacity = '0.3';
    quoteMarks.style.marginBottom = '-1rem';
    
    const quoteText = document.createElement('p');
    quoteText.textContent = testimonial.quote;
    quoteText.style.fontSize = '1rem';
    quoteText.style.lineHeight = '1.6';
    quoteText.style.color = '#333';
    quoteText.style.flex = '1';
    quoteText.style.textAlign = 'left';
    quoteText.style.fontStyle = 'italic';
    
    const divider = document.createElement('div');
    divider.style.height = '1px';
    divider.style.backgroundColor = '#eee';
    divider.style.margin = '1.5rem 0';
    
    const authorContainer = document.createElement('div');
    authorContainer.style.display = 'flex';
    authorContainer.style.alignItems = 'center';
    authorContainer.style.textAlign = 'left';
    
    const avatar = document.createElement('div');
    avatar.textContent = testimonial.avatar;
    avatar.style.width = '45px';
    avatar.style.height = '45px';
    avatar.style.borderRadius = '50%';
    avatar.style.backgroundColor = '#4CAF50';
    avatar.style.color = 'white';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontWeight = 'bold';
    avatar.style.marginRight = '1rem';
    
    const authorInfo = document.createElement('div');
    
    const name = document.createElement('div');
    name.textContent = testimonial.name;
    name.style.fontWeight = '600';
    name.style.color = '#333';
    
    const role = document.createElement('div');
    role.textContent = testimonial.role;
    role.style.fontSize = '0.9rem';
    role.style.color = '#666';
    
    authorInfo.appendChild(name);
    authorInfo.appendChild(role);
    
    authorContainer.appendChild(avatar);
    authorContainer.appendChild(authorInfo);
    
    testimonialCard.appendChild(quoteMarks);
    testimonialCard.appendChild(quoteText);
    testimonialCard.appendChild(divider);
    testimonialCard.appendChild(authorContainer);
    
    testimonialsContainer.appendChild(testimonialCard);
  });
  
  section.appendChild(testimonialsContainer);
  
  return section;
}

/**
 * Create income opportunities section
 * @returns {HTMLElement} The income opportunities section element
 */
function createIncomeOpportunitiesSection() {
  const section = document.createElement('section');
  section.id = 'income-opportunities';
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = 'white';
  
  // Two-column layout
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = window.innerWidth <= 960 ? 'column' : 'row';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'space-between';
  container.style.gap = '4rem';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  
  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.style.flex = window.innerWidth <= 960 ? '100%' : '1';
  contentContainer.style.textAlign = window.innerWidth <= 960 ? 'center' : 'left';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Boost Your Income with Stackr Tools';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1.5rem';
  heading.style.color = '#333';
  
  const description = document.createElement('p');
  description.textContent = 'Stackr doesn\'t just help you manage your income — it helps you increase it. Discover new income streams designed specifically for service providers.';
  description.style.fontSize = '1.1rem';
  description.style.lineHeight = '1.6';
  description.style.color = '#555';
  description.style.marginBottom = '2rem';
  
  contentContainer.appendChild(heading);
  contentContainer.appendChild(description);
  
  // Income opportunity cards
  const opportunitiesContainer = document.createElement('div');
  opportunitiesContainer.style.display = 'flex';
  opportunitiesContainer.style.flexDirection = 'column';
  opportunitiesContainer.style.gap = '1.5rem';
  
  const opportunities = [
    {
      title: 'Stackr Gigs',
      description: 'Access our curated marketplace of gigs and side hustles specifically for service providers.',
      icon: '👔',
      color: '#4CAF50'
    },
    {
      title: 'Affiliate Program Hub',
      description: 'Earn commissions by promoting products and services that help you and others grow.',
      icon: '🔗',
      color: '#2196F3'
    },
    {
      title: 'Daily Money Challenges',
      description: 'Complete simple tasks and challenges to earn extra cash while building good financial habits.',
      icon: '🎯',
      color: '#FFC107'
    }
  ];
  
  opportunities.forEach(opportunity => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.alignItems = window.innerWidth <= 480 ? 'center' : 'flex-start';
    card.style.flexDirection = window.innerWidth <= 480 ? 'column' : 'row';
    card.style.gap = '1rem';
    card.style.padding = '1.5rem';
    card.style.backgroundColor = 'white';
    card.style.borderRadius = '8px';
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    card.style.border = `1px solid ${opportunity.color}10`; // 10% opacity
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    card.addEventListener('mouseover', () => {
      card.style.transform = 'translateX(5px)';
      card.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.08)';
      card.style.borderColor = opportunity.color;
    });
    
    card.addEventListener('mouseout', () => {
      card.style.transform = 'translateX(0)';
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
      card.style.borderColor = `${opportunity.color}10`;
    });
    
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.backgroundColor = `${opportunity.color}15`; // 15% opacity
    iconContainer.style.color = opportunity.color;
    iconContainer.style.width = '50px';
    iconContainer.style.height = '50px';
    iconContainer.style.borderRadius = '8px';
    iconContainer.style.fontSize = '1.5rem';
    iconContainer.style.flexShrink = '0';
    iconContainer.style.marginBottom = window.innerWidth <= 480 ? '0.5rem' : '0';
    iconContainer.textContent = opportunity.icon;
    
    const textContainer = document.createElement('div');
    textContainer.style.textAlign = window.innerWidth <= 480 ? 'center' : 'left';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = opportunity.title;
    titleEl.style.fontSize = '1.1rem';
    titleEl.style.fontWeight = '600';
    titleEl.style.color = '#333';
    titleEl.style.marginBottom = '0.5rem';
    
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = opportunity.description;
    descriptionEl.style.fontSize = '0.95rem';
    descriptionEl.style.lineHeight = '1.5';
    descriptionEl.style.color = '#555';
    descriptionEl.style.margin = '0';
    
    textContainer.appendChild(titleEl);
    textContainer.appendChild(descriptionEl);
    
    card.appendChild(iconContainer);
    card.appendChild(textContainer);
    
    opportunitiesContainer.appendChild(card);
  });
  
  contentContainer.appendChild(opportunitiesContainer);
  
  // "Coming Soon" tag
  const comingSoonTag = document.createElement('div');
  comingSoonTag.style.display = 'inline-block';
  comingSoonTag.style.marginTop = '2rem';
  comingSoonTag.style.padding = '0.5rem 1rem';
  comingSoonTag.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  comingSoonTag.style.borderRadius = '30px';
  comingSoonTag.style.fontSize = '0.9rem';
  comingSoonTag.style.fontWeight = '600';
  comingSoonTag.style.color = '#555';
  comingSoonTag.innerHTML = '🔥 Coming Soon: <span style="color: #4CAF50;">Invoice Builder</span> and <span style="color: #2196F3;">Creative Grants</span>';
  
  contentContainer.appendChild(comingSoonTag);
  
  // Visual container
  const visualContainer = document.createElement('div');
  visualContainer.style.flex = window.innerWidth <= 960 ? '100%' : '1';
  visualContainer.style.maxWidth = window.innerWidth <= 960 ? '500px' : '600px';
  
  // Income growth chart
  const chartContainer = document.createElement('div');
  chartContainer.style.width = '100%';
  chartContainer.style.aspectRatio = '4/3';
  chartContainer.style.backgroundColor = 'white';
  chartContainer.style.borderRadius = '12px';
  chartContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.05)';
  chartContainer.style.padding = '1.5rem';
  chartContainer.style.border = '1px solid #e0e0e0';
  
  // Chart title
  const chartTitle = document.createElement('div');
  chartTitle.style.display = 'flex';
  chartTitle.style.justifyContent = 'space-between';
  chartTitle.style.alignItems = 'center';
  chartTitle.style.marginBottom = '1.5rem';
  
  const chartTitleText = document.createElement('h3');
  chartTitleText.textContent = 'Income Growth Potential';
  chartTitleText.style.fontSize = '1.2rem';
  chartTitleText.style.fontWeight = '600';
  chartTitleText.style.margin = '0';
  
  // Time period selector (mock)
  const timeSelector = document.createElement('div');
  timeSelector.style.display = 'flex';
  timeSelector.style.alignItems = 'center';
  timeSelector.style.gap = '0.5rem';
  timeSelector.style.backgroundColor = '#f5f5f5';
  timeSelector.style.borderRadius = '4px';
  timeSelector.style.padding = '0.25rem';
  
  ['1M', '3M', '6M', '1Y'].forEach((period, index) => {
    const option = document.createElement('div');
    option.textContent = period;
    option.style.padding = '0.25rem 0.5rem';
    option.style.borderRadius = '4px';
    option.style.fontSize = '0.85rem';
    option.style.cursor = 'pointer';
    
    if (index === 2) { // 6M selected by default
      option.style.backgroundColor = '#4CAF50';
      option.style.color = 'white';
    } else {
      option.style.color = '#666';
    }
    
    timeSelector.appendChild(option);
  });
  
  chartTitle.appendChild(chartTitleText);
  chartTitle.appendChild(timeSelector);
  chartContainer.appendChild(chartTitle);
  
  // Chart canvas (mock)
  const chartCanvas = document.createElement('div');
  chartCanvas.style.width = '100%';
  chartCanvas.style.height = 'calc(100% - 3rem)';
  chartCanvas.style.position = 'relative';
  
  // Y-axis labels
  const yAxis = document.createElement('div');
  yAxis.style.position = 'absolute';
  yAxis.style.left = '0';
  yAxis.style.top = '0';
  yAxis.style.height = '100%';
  yAxis.style.display = 'flex';
  yAxis.style.flexDirection = 'column-reverse';
  yAxis.style.justifyContent = 'space-between';
  yAxis.style.paddingRight = '0.5rem';
  yAxis.style.color = '#888';
  yAxis.style.fontSize = '0.8rem';
  
  ['$3000', '$2500', '$2000', '$1500', '$1000', '$500', '$0'].forEach(label => {
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    yAxis.appendChild(labelEl);
  });
  
  chartCanvas.appendChild(yAxis);
  
  // X-axis labels
  const xAxis = document.createElement('div');
  xAxis.style.position = 'absolute';
  xAxis.style.bottom = '-1.5rem';
  xAxis.style.left = '10%';
  xAxis.style.right = '0';
  xAxis.style.display = 'flex';
  xAxis.style.justifyContent = 'space-between';
  xAxis.style.color = '#888';
  xAxis.style.fontSize = '0.8rem';
  
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].forEach(month => {
    const labelEl = document.createElement('div');
    labelEl.textContent = month;
    xAxis.appendChild(labelEl);
  });
  
  chartCanvas.appendChild(xAxis);
  
  // Chart grid lines
  const grid = document.createElement('div');
  grid.style.position = 'absolute';
  grid.style.left = '10%';
  grid.style.right = '0';
  grid.style.top = '0';
  grid.style.bottom = '0';
  grid.style.display = 'flex';
  grid.style.flexDirection = 'column';
  grid.style.justifyContent = 'space-between';
  
  for (let i = 0; i < 7; i++) {
    const line = document.createElement('div');
    line.style.width = '100%';
    line.style.height = '1px';
    line.style.backgroundColor = '#e0e0e0';
    grid.appendChild(line);
  }
  
  chartCanvas.appendChild(grid);
  
  // Create the chart data visualization
  const baseIncomeGraph = document.createElement('div');
  baseIncomeGraph.style.position = 'absolute';
  baseIncomeGraph.style.left = '10%';
  baseIncomeGraph.style.right = '0';
  baseIncomeGraph.style.bottom = '0';
  baseIncomeGraph.style.height = '40%';
  baseIncomeGraph.style.background = 'linear-gradient(to top, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0) 100%)';
  baseIncomeGraph.style.borderTopLeftRadius = '4px';
  baseIncomeGraph.style.borderTopRightRadius = '4px';
  baseIncomeGraph.style.clipPath = 'polygon(0% 100%, 0% 20%, 20% 30%, 40% 25%, 60% 40%, 80% 35%, 100% 30%, 100% 100%)';
  
  const baseIncomeLine = document.createElement('div');
  baseIncomeLine.style.position = 'absolute';
  baseIncomeLine.style.left = '10%';
  baseIncomeLine.style.right = '0';
  baseIncomeLine.style.bottom = '0';
  baseIncomeLine.style.height = '40%';
  baseIncomeLine.style.borderTop = '2px solid #2196F3';
  baseIncomeLine.style.borderTopLeftRadius = '4px';
  baseIncomeLine.style.borderTopRightRadius = '4px';
  baseIncomeLine.style.clipPath = 'polygon(0% 20%, 20% 30%, 40% 25%, 60% 40%, 80% 35%, 100% 30%)';
  
  const stackrIncomeGraph = document.createElement('div');
  stackrIncomeGraph.style.position = 'absolute';
  stackrIncomeGraph.style.left = '10%';
  stackrIncomeGraph.style.right = '0';
  stackrIncomeGraph.style.bottom = '0';
  stackrIncomeGraph.style.height = '75%';
  stackrIncomeGraph.style.background = 'linear-gradient(to top, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0) 100%)';
  stackrIncomeGraph.style.borderTopLeftRadius = '4px';
  stackrIncomeGraph.style.borderTopRightRadius = '4px';
  stackrIncomeGraph.style.clipPath = 'polygon(0% 100%, 0% 60%, 20% 50%, 40% 40%, 60% 25%, 80% 15%, 100% 10%, 100% 100%)';
  
  const stackrIncomeLine = document.createElement('div');
  stackrIncomeLine.style.position = 'absolute';
  stackrIncomeLine.style.left = '10%';
  stackrIncomeLine.style.right = '0';
  stackrIncomeLine.style.bottom = '0';
  stackrIncomeLine.style.height = '75%';
  stackrIncomeLine.style.borderTop = '2px solid #4CAF50';
  stackrIncomeLine.style.borderTopLeftRadius = '4px';
  stackrIncomeLine.style.borderTopRightRadius = '4px';
  stackrIncomeLine.style.clipPath = 'polygon(0% 60%, 20% 50%, 40% 40%, 60% 25%, 80% 15%, 100% 10%)';
  
  chartCanvas.appendChild(baseIncomeGraph);
  chartCanvas.appendChild(baseIncomeLine);
  chartCanvas.appendChild(stackrIncomeGraph);
  chartCanvas.appendChild(stackrIncomeLine);
  
  // Chart legend
  const legend = document.createElement('div');
  legend.style.display = 'flex';
  legend.style.alignItems = 'center';
  legend.style.gap = '1.5rem';
  legend.style.position = 'absolute';
  legend.style.top = '0';
  legend.style.right = '0';
  
  const legendItem1 = document.createElement('div');
  legendItem1.style.display = 'flex';
  legendItem1.style.alignItems = 'center';
  legendItem1.style.gap = '0.5rem';
  
  const legend1Color = document.createElement('div');
  legend1Color.style.width = '12px';
  legend1Color.style.height = '12px';
  legend1Color.style.backgroundColor = '#2196F3';
  legend1Color.style.borderRadius = '2px';
  
  const legend1Text = document.createElement('span');
  legend1Text.textContent = 'Base Income';
  legend1Text.style.fontSize = '0.85rem';
  legend1Text.style.color = '#555';
  
  legendItem1.appendChild(legend1Color);
  legendItem1.appendChild(legend1Text);
  
  const legendItem2 = document.createElement('div');
  legendItem2.style.display = 'flex';
  legendItem2.style.alignItems = 'center';
  legendItem2.style.gap = '0.5rem';
  
  const legend2Color = document.createElement('div');
  legend2Color.style.width = '12px';
  legend2Color.style.height = '12px';
  legend2Color.style.backgroundColor = '#4CAF50';
  legend2Color.style.borderRadius = '2px';
  
  const legend2Text = document.createElement('span');
  legend2Text.textContent = 'With Stackr';
  legend2Text.style.fontSize = '0.85rem';
  legend2Text.style.color = '#555';
  
  legendItem2.appendChild(legend2Color);
  legendItem2.appendChild(legend2Text);
  
  legend.appendChild(legendItem1);
  legend.appendChild(legendItem2);
  
  chartCanvas.appendChild(legend);
  chartContainer.appendChild(chartCanvas);
  
  // Stats below chart
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.justifyContent = 'space-between';
  statsContainer.style.marginTop = '3rem';
  statsContainer.style.textAlign = 'center';
  
  const stats = [
    { label: 'Average Income Increase', value: '+37%', color: '#4CAF50' },
    { label: 'New Income Sources', value: '3-5', color: '#2196F3' },
    { label: 'Avg. Time to First Gig', value: '14 days', color: '#FFC107' }
  ];
  
  stats.forEach(stat => {
    const statBlock = document.createElement('div');
    
    const valueEl = document.createElement('div');
    valueEl.textContent = stat.value;
    valueEl.style.fontSize = '1.8rem';
    valueEl.style.fontWeight = 'bold';
    valueEl.style.color = stat.color;
    valueEl.style.marginBottom = '0.5rem';
    
    const labelEl = document.createElement('div');
    labelEl.textContent = stat.label;
    labelEl.style.fontSize = '0.9rem';
    labelEl.style.color = '#666';
    
    statBlock.appendChild(valueEl);
    statBlock.appendChild(labelEl);
    statsContainer.appendChild(statBlock);
  });
  
  visualContainer.appendChild(chartContainer);
  visualContainer.appendChild(statsContainer);
  
  container.appendChild(contentContainer);
  container.appendChild(visualContainer);
  section.appendChild(container);
  
  return section;
}

/**
 * Create pricing section with subscription options
 * @returns {HTMLElement} The pricing section element
 */
function createPricingSection() {
  const section = document.createElement('section');
  section.id = 'pricing';
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = '#f9f9f9';
  
  // Section header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.maxWidth = '700px';
  header.style.margin = '0 auto 4rem auto';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Simple Pricing for Your Financial Journey';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1rem';
  heading.style.color = '#333';
  
  const subheading = document.createElement('p');
  subheading.textContent = 'Start with our free plan and upgrade as your financial needs grow. No hidden fees, no commitments.';
  subheading.style.fontSize = '1.1rem';
  subheading.style.lineHeight = '1.6';
  subheading.style.color = '#555';
  
  header.appendChild(heading);
  header.appendChild(subheading);
  section.appendChild(header);
  
  // Pricing plans container
  const plansContainer = document.createElement('div');
  plansContainer.style.display = 'flex';
  plansContainer.style.flexDirection = window.innerWidth <= 960 ? 'column' : 'row';
  plansContainer.style.gap = '2rem';
  plansContainer.style.justifyContent = 'center';
  plansContainer.style.maxWidth = '1200px';
  plansContainer.style.margin = '0 auto';
  
  // Pricing plans
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for getting started with the 40/30/30 method.',
      isPopular: false,
      features: [
        '✅ Income tracking',
        '✅ 40/30/30 split visualization',
        '✅ Manual transaction entry',
        '✅ Basic reporting',
        '✅ Mobile-friendly access',
        '❌ Bank connections',
        '❌ Advanced income tools',
        '❌ Premium support'
      ],
      ctaText: 'Get Started',
      ctaColor: '#666'
    },
    {
      name: 'Pro',
      price: '9',
      description: 'For service providers looking to grow their income and wealth.',
      isPopular: true,
      features: [
        '✅ Everything in Free',
        '✅ Bank connections',
        '✅ Automatic transaction import',
        '✅ Income opportunities',
        '✅ Advanced analytics',
        '✅ Priority support',
        '✅ Customizable split ratios',
        '✅ Income goals & tracking'
      ],
      ctaText: 'Start 7-Day Free Trial',
      ctaColor: '#4CAF50'
    },
    {
      name: 'Lifetime',
      price: '99',
      description: 'One-time payment for lifetime access to Stackr Pro.',
      isPopular: false,
      features: [
        '✅ Everything in Pro',
        '✅ Lifetime access',
        '✅ All future updates',
        '✅ No monthly payments',
        '✅ VIP support',
        '✅ Early access to new features',
        '✅ Custom income strategies',
        '✅ Exclusive webinars'
      ],
      ctaText: 'Get Lifetime Access',
      ctaColor: '#2196F3'
    }
  ];
  
  plans.forEach(plan => {
    const planCard = document.createElement('div');
    planCard.style.backgroundColor = 'white';
    planCard.style.borderRadius = '12px';
    planCard.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.05)';
    planCard.style.padding = '2.5rem 2rem';
    planCard.style.display = 'flex';
    planCard.style.flexDirection = 'column';
    planCard.style.flex = '1';
    planCard.style.maxWidth = window.innerWidth <= 960 ? '500px' : '350px';
    planCard.style.margin = window.innerWidth <= 960 ? '0 auto' : '0';
    planCard.style.border = plan.isPopular ? '2px solid #4CAF50' : '1px solid #e0e0e0';
    planCard.style.position = 'relative';
    planCard.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    planCard.addEventListener('mouseover', () => {
      planCard.style.transform = 'translateY(-10px)';
      planCard.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
    
    planCard.addEventListener('mouseout', () => {
      planCard.style.transform = 'translateY(0)';
      planCard.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.05)';
    });
    
    // Popular badge
    if (plan.isPopular) {
      const popularBadge = document.createElement('div');
      popularBadge.textContent = 'Most Popular';
      popularBadge.style.position = 'absolute';
      popularBadge.style.top = '-12px';
      popularBadge.style.left = '50%';
      popularBadge.style.transform = 'translateX(-50%)';
      popularBadge.style.backgroundColor = '#4CAF50';
      popularBadge.style.color = 'white';
      popularBadge.style.padding = '0.3rem 1rem';
      popularBadge.style.borderRadius = '20px';
      popularBadge.style.fontSize = '0.8rem';
      popularBadge.style.fontWeight = '600';
      planCard.appendChild(popularBadge);
    }
    
    // Plan name
    const planName = document.createElement('h3');
    planName.textContent = plan.name;
    planName.style.fontSize = '1.5rem';
    planName.style.fontWeight = '700';
    planName.style.marginBottom = '1rem';
    planName.style.color = '#333';
    
    // Price
    const priceContainer = document.createElement('div');
    priceContainer.style.marginBottom = '1.5rem';
    
    const price = document.createElement('div');
    price.style.display = 'flex';
    price.style.alignItems = 'baseline';
    price.style.justifyContent = 'center';
    
    const currency = document.createElement('span');
    currency.textContent = '$';
    currency.style.fontSize = '1.5rem';
    currency.style.fontWeight = '500';
    
    const amount = document.createElement('span');
    amount.textContent = plan.price;
    amount.style.fontSize = '3.5rem';
    amount.style.fontWeight = '700';
    amount.style.lineHeight = '1';
    amount.style.margin = '0 0.2rem';
    
    const period = document.createElement('span');
    period.textContent = plan.name === 'Lifetime' ? 'one-time' : '/month';
    period.style.fontSize = '1rem';
    period.style.color = '#666';
    
    price.appendChild(currency);
    price.appendChild(amount);
    price.appendChild(period);
    priceContainer.appendChild(price);
    
    // Description
    const description = document.createElement('p');
    description.textContent = plan.description;
    description.style.fontSize = '0.95rem';
    description.style.textAlign = 'center';
    description.style.color = '#555';
    description.style.marginBottom = '2rem';
    
    // Features list
    const featuresList = document.createElement('ul');
    featuresList.style.listStyle = 'none';
    featuresList.style.padding = '0';
    featuresList.style.margin = '0 0 2rem 0';
    featuresList.style.flex = '1';
    
    plan.features.forEach(feature => {
      const featureItem = document.createElement('li');
      featureItem.innerHTML = feature;
      featureItem.style.marginBottom = '0.8rem';
      featureItem.style.fontSize = '0.95rem';
      featureItem.style.display = 'flex';
      featureItem.style.alignItems = 'flex-start';
      
      // Apply color for check marks and x marks
      if (feature.includes('✅')) {
        featureItem.style.color = '#333';
      } else {
        featureItem.style.color = '#aaa';
      }
      
      featuresList.appendChild(featureItem);
    });
    
    // CTA button
    const ctaButton = document.createElement('button');
    ctaButton.textContent = plan.ctaText;
    ctaButton.style.width = '100%';
    ctaButton.style.padding = '0.9rem';
    ctaButton.style.backgroundColor = plan.ctaColor;
    ctaButton.style.color = 'white';
    ctaButton.style.border = 'none';
    ctaButton.style.borderRadius = '6px';
    ctaButton.style.fontWeight = '600';
    ctaButton.style.fontSize = '1rem';
    ctaButton.style.cursor = 'pointer';
    ctaButton.style.transition = 'all 0.2s ease';
    
    ctaButton.addEventListener('mouseover', () => {
      ctaButton.style.backgroundColor = adjustBrightness(plan.ctaColor, -10);
      ctaButton.style.transform = 'translateY(-2px)';
    });
    
    ctaButton.addEventListener('mouseout', () => {
      ctaButton.style.backgroundColor = plan.ctaColor;
      ctaButton.style.transform = 'translateY(0)';
    });
    
    ctaButton.addEventListener('click', () => {
      window.location.hash = 'register';
    });
    
    planCard.appendChild(planName);
    planCard.appendChild(priceContainer);
    planCard.appendChild(description);
    planCard.appendChild(featuresList);
    planCard.appendChild(ctaButton);
    
    plansContainer.appendChild(planCard);
  });
  
  section.appendChild(plansContainer);
  
  // Money-back guarantee
  const guaranteeContainer = document.createElement('div');
  guaranteeContainer.style.textAlign = 'center';
  guaranteeContainer.style.marginTop = '3rem';
  guaranteeContainer.style.display = 'flex';
  guaranteeContainer.style.flexDirection = 'column';
  guaranteeContainer.style.alignItems = 'center';
  
  const guaranteeIcon = document.createElement('div');
  guaranteeIcon.innerHTML = '🛡️';
  guaranteeIcon.style.fontSize = '2rem';
  guaranteeIcon.style.marginBottom = '1rem';
  
  const guaranteeText = document.createElement('p');
  guaranteeText.innerHTML = '<strong>30-Day Money-Back Guarantee</strong><br>Try Stackr Pro risk-free. If you\'re not satisfied within 30 days, we\'ll refund your payment.';
  guaranteeText.style.fontSize = '1rem';
  guaranteeText.style.color = '#666';
  guaranteeText.style.maxWidth = '500px';
  
  guaranteeContainer.appendChild(guaranteeIcon);
  guaranteeContainer.appendChild(guaranteeText);
  section.appendChild(guaranteeContainer);
  
  return section;
}

/**
 * Create FAQ section with common questions
 * @returns {HTMLElement} The FAQ section element
 */
function createFAQSection() {
  const section = document.createElement('section');
  section.id = 'faq';
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = 'white';
  
  // Section header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.maxWidth = '700px';
  header.style.margin = '0 auto 4rem auto';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Frequently Asked Questions';
  heading.style.fontSize = '2.2rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1rem';
  heading.style.color = '#333';
  
  const subheading = document.createElement('p');
  subheading.textContent = 'Got questions about Stackr? We\'ve got answers.';
  subheading.style.fontSize = '1.1rem';
  subheading.style.lineHeight = '1.6';
  subheading.style.color = '#555';
  
  header.appendChild(heading);
  header.appendChild(subheading);
  section.appendChild(header);
  
  // FAQ grid
  const faqContainer = document.createElement('div');
  faqContainer.style.display = 'grid';
  faqContainer.style.gridTemplateColumns = window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)';
  faqContainer.style.gap = '2rem';
  faqContainer.style.maxWidth = '1000px';
  faqContainer.style.margin = '0 auto';
  
  const faqs = [
    {
      question: 'What is the 40/30/30 method?',
      answer: 'The 40/30/30 method is a financial strategy that allocates 40% of your income to needs (essentials like rent and food), 30% to investments (stocks, bonds, real estate, business), and 30% to savings (emergency fund, future purchases, goals). It\'s a balanced approach to managing your money while building wealth.'
    },
    {
      question: 'How does Stackr help me make more money?',
      answer: 'Stackr provides tools like Stackr Gigs (curated job opportunities), Affiliate Program Hub (earn commissions through referrals), and daily money challenges. These tools are designed specifically for service providers to help you discover and capitalize on new income streams.'
    },
    {
      question: 'Do I need a bank account to use Stackr?',
      answer: 'No, you can use Stackr without connecting a bank account. You can manually track your income and use the 40/30/30 method. However, connecting your bank makes the experience more powerful with automatic transaction imports and real-time balance updates.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes, we take security seriously. We use bank-level encryption to secure your data, and we never store your banking credentials. Our secure Plaid integration means your login information is never seen or stored by Stackr.'
    },
    {
      question: 'What\'s the difference between Pro and Free plans?',
      answer: 'The Free plan gives you basic income tracking and the 40/30/30 split visualization. The Pro plan adds bank connections, automatic transaction imports, income opportunities, advanced analytics, priority support, and customizable split ratios.'
    },
    {
      question: 'Can I customize the 40/30/30 split?',
      answer: 'Yes! With Stackr Pro, you can customize the split percentages to match your financial situation and goals. Whether you want a 50/30/20 split or something completely different, Stackr adapts to your needs.'
    }
  ];
  
  faqs.forEach(faq => {
    const faqItem = document.createElement('div');
    faqItem.style.backgroundColor = 'white';
    faqItem.style.borderRadius = '8px';
    faqItem.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.05)';
    faqItem.style.border = '1px solid #eee';
    faqItem.style.padding = '1.5rem';
    faqItem.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    faqItem.addEventListener('mouseover', () => {
      faqItem.style.transform = 'translateY(-3px)';
      faqItem.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
    });
    
    faqItem.addEventListener('mouseout', () => {
      faqItem.style.transform = 'translateY(0)';
      faqItem.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.05)';
    });
    
    const question = document.createElement('h3');
    question.textContent = faq.question;
    question.style.fontSize = '1.1rem';
    question.style.fontWeight = '600';
    question.style.color = '#333';
    question.style.marginTop = '0';
    question.style.marginBottom = '1rem';
    
    const answer = document.createElement('p');
    answer.textContent = faq.answer;
    answer.style.fontSize = '0.95rem';
    answer.style.lineHeight = '1.6';
    answer.style.color = '#555';
    answer.style.margin = '0';
    
    faqItem.appendChild(question);
    faqItem.appendChild(answer);
    faqContainer.appendChild(faqItem);
  });
  
  section.appendChild(faqContainer);
  
  // Still have questions
  const supportContainer = document.createElement('div');
  supportContainer.style.textAlign = 'center';
  supportContainer.style.marginTop = '4rem';
  
  const supportText = document.createElement('p');
  supportText.innerHTML = 'Still have questions? <strong>We\'re here to help.</strong>';
  supportText.style.fontSize = '1.1rem';
  supportText.style.marginBottom = '1.5rem';
  supportText.style.color = '#333';
  
  const supportButton = document.createElement('a');
  supportButton.textContent = 'Contact Support';
  supportButton.href = '#support';
  supportButton.style.display = 'inline-flex';
  supportButton.style.alignItems = 'center';
  supportButton.style.padding = '0.8rem 1.5rem';
  supportButton.style.backgroundColor = 'white';
  supportButton.style.color = '#4CAF50';
  supportButton.style.border = '1px solid #4CAF50';
  supportButton.style.borderRadius = '4px';
  supportButton.style.fontWeight = '600';
  supportButton.style.fontSize = '1rem';
  supportButton.style.textDecoration = 'none';
  supportButton.style.transition = 'all 0.2s ease';
  
  supportButton.addEventListener('mouseover', () => {
    supportButton.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
  });
  
  supportButton.addEventListener('mouseout', () => {
    supportButton.style.backgroundColor = 'white';
  });
  
  supportContainer.appendChild(supportText);
  supportContainer.appendChild(supportButton);
  section.appendChild(supportContainer);
  
  return section;
}

/**
 * Create final call-to-action section
 * @returns {HTMLElement} The CTA section element
 */
function createCTASection() {
  const section = document.createElement('section');
  section.style.padding = '5rem 5%';
  section.style.backgroundColor = '#4CAF50';
  section.style.backgroundImage = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
  section.style.color = 'white';
  section.style.textAlign = 'center';
  
  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Take Control of Your Financial Future Today';
  heading.style.fontSize = '2.5rem';
  heading.style.fontWeight = '700';
  heading.style.marginBottom = '1.5rem';
  
  const subheading = document.createElement('p');
  subheading.textContent = 'Join thousands of service providers who are using Stackr to track, grow, and optimize their income with the 40/30/30 method.';
  subheading.style.fontSize = '1.2rem';
  subheading.style.lineHeight = '1.6';
  subheading.style.marginBottom = '2.5rem';
  subheading.style.opacity = '0.9';
  
  const ctaButton = document.createElement('button');
  ctaButton.textContent = 'Get Started Free';
  ctaButton.style.backgroundColor = 'white';
  ctaButton.style.color = '#4CAF50';
  ctaButton.style.border = 'none';
  ctaButton.style.borderRadius = '4px';
  ctaButton.style.padding = '1rem 2.5rem';
  ctaButton.style.fontWeight = '600';
  ctaButton.style.fontSize = '1.1rem';
  ctaButton.style.cursor = 'pointer';
  ctaButton.style.transition = 'all 0.2s ease';
  ctaButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  
  ctaButton.addEventListener('mouseover', () => {
    ctaButton.style.transform = 'translateY(-3px)';
    ctaButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
  });
  
  ctaButton.addEventListener('mouseout', () => {
    ctaButton.style.transform = 'translateY(0)';
    ctaButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  });
  
  ctaButton.addEventListener('click', () => {
    window.location.hash = 'register';
  });
  
  // No credit card required
  const noCreditCard = document.createElement('p');
  noCreditCard.textContent = 'No credit card required. Free forever. Upgrade anytime.';
  noCreditCard.style.marginTop = '1.5rem';
  noCreditCard.style.fontSize = '0.95rem';
  noCreditCard.style.opacity = '0.8';
  
  container.appendChild(heading);
  container.appendChild(subheading);
  container.appendChild(ctaButton);
  container.appendChild(noCreditCard);
  section.appendChild(container);
  
  return section;
}

/**
 * Create footer section
 * @returns {HTMLElement} The footer element
 */
function createFooter() {
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#333';
  footer.style.color = 'white';
  footer.style.padding = '4rem 5% 2rem';
  
  const footerContent = document.createElement('div');
  footerContent.style.display = 'flex';
  footerContent.style.flexDirection = window.innerWidth <= 768 ? 'column' : 'row';
  footerContent.style.justifyContent = 'space-between';
  footerContent.style.gap = '2rem';
  footerContent.style.maxWidth = '1200px';
  footerContent.style.margin = '0 auto';
  
  // Company info
  const companyInfo = document.createElement('div');
  companyInfo.style.flex = '1.5';
  companyInfo.style.marginBottom = window.innerWidth <= 768 ? '2rem' : '0';
  
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.marginBottom = '1rem';
  
  const logo = document.createElement('h3');
  logo.textContent = 'Stackr Finance';
  logo.style.margin = '0';
  logo.style.fontSize = '1.5rem';
  logo.style.fontWeight = 'bold';
  
  logoContainer.appendChild(logo);
  
  const tagline = document.createElement('p');
  tagline.textContent = 'Helping service providers build wealth through the 40/30/30 method.';
  tagline.style.fontSize = '0.95rem';
  tagline.style.lineHeight = '1.6';
  tagline.style.color = '#aaa';
  tagline.style.marginBottom = '1.5rem';
  
  companyInfo.appendChild(logoContainer);
  companyInfo.appendChild(tagline);
  
  // Footer navigation
  const footerNav = document.createElement('div');
  footerNav.style.display = 'flex';
  footerNav.style.flexWrap = 'wrap';
  footerNav.style.justifyContent = window.innerWidth <= 768 ? 'space-between' : 'space-around';
  footerNav.style.flex = '2';
  footerNav.style.gap = '2rem';
  
  const navColumns = [
    {
      title: 'Product',
      links: [
        { text: 'Features', href: '#features' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Income Tools', href: '#income-opportunities' },
        { text: 'FAQ', href: '#faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '#about' },
        { text: 'Blog', href: '#blog' },
        { text: 'Careers', href: '#careers' },
        { text: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Terms of Service', href: '#terms' },
        { text: 'Privacy Policy', href: '#privacy' },
        { text: 'Cookie Policy', href: '#cookies' },
        { text: 'Security', href: '#security' }
      ]
    }
  ];
  
  navColumns.forEach(column => {
    const navColumn = document.createElement('div');
    
    const columnTitle = document.createElement('h4');
    columnTitle.textContent = column.title;
    columnTitle.style.fontSize = '1rem';
    columnTitle.style.fontWeight = '600';
    columnTitle.style.marginBottom = '1.2rem';
    columnTitle.style.color = 'white';
    
    const linksList = document.createElement('ul');
    linksList.style.listStyle = 'none';
    linksList.style.padding = '0';
    linksList.style.margin = '0';
    
    column.links.forEach(link => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '0.8rem';
      
      const anchor = document.createElement('a');
      anchor.textContent = link.text;
      anchor.href = link.href;
      anchor.style.color = '#aaa';
      anchor.style.textDecoration = 'none';
      anchor.style.fontSize = '0.9rem';
      anchor.style.transition = 'color 0.2s ease';
      
      anchor.addEventListener('mouseover', () => {
        anchor.style.color = 'white';
      });
      
      anchor.addEventListener('mouseout', () => {
        anchor.style.color = '#aaa';
      });
      
      listItem.appendChild(anchor);
      linksList.appendChild(listItem);
    });
    
    navColumn.appendChild(columnTitle);
    navColumn.appendChild(linksList);
    footerNav.appendChild(navColumn);
  });
  
  footerContent.appendChild(companyInfo);
  footerContent.appendChild(footerNav);
  
  // Divider
  const divider = document.createElement('div');
  divider.style.height = '1px';
  divider.style.backgroundColor = '#444';
  divider.style.margin = '3rem 0 2rem';
  
  // Bottom footer
  const bottomFooter = document.createElement('div');
  bottomFooter.style.display = 'flex';
  bottomFooter.style.flexDirection = window.innerWidth <= 768 ? 'column' : 'row';
  bottomFooter.style.justifyContent = 'space-between';
  bottomFooter.style.alignItems = window.innerWidth <= 768 ? 'center' : 'flex-start';
  bottomFooter.style.gap = '1rem';
  
  const copyright = document.createElement('div');
  copyright.textContent = `© ${new Date().getFullYear()} Stackr Finance. All rights reserved.`;
  copyright.style.fontSize = '0.9rem';
  copyright.style.color = '#888';
  
  // Social links
  const socialLinks = document.createElement('div');
  socialLinks.style.display = 'flex';
  socialLinks.style.gap = '1rem';
  
  const socials = ['twitter', 'facebook', 'instagram', 'linkedin'];
  
  socials.forEach(social => {
    const socialLink = document.createElement('a');
    socialLink.href = `#${social}`;
    socialLink.style.width = '32px';
    socialLink.style.height = '32px';
    socialLink.style.borderRadius = '50%';
    socialLink.style.backgroundColor = '#444';
    socialLink.style.display = 'flex';
    socialLink.style.alignItems = 'center';
    socialLink.style.justifyContent = 'center';
    socialLink.style.transition = 'background-color 0.2s ease';
    
    // Simple social icons
    const icon = document.createElement('div');
    icon.textContent = social === 'twitter' ? '𝕏' : 
                      social === 'facebook' ? 'f' : 
                      social === 'instagram' ? '📷' : 
                      'in';
    icon.style.fontSize = social === 'instagram' ? '14px' : '16px';
    icon.style.color = 'white';
    
    socialLink.addEventListener('mouseover', () => {
      socialLink.style.backgroundColor = '#4CAF50';
    });
    
    socialLink.addEventListener('mouseout', () => {
      socialLink.style.backgroundColor = '#444';
    });
    
    socialLink.appendChild(icon);
    socialLinks.appendChild(socialLink);
  });
  
  bottomFooter.appendChild(copyright);
  bottomFooter.appendChild(socialLinks);
  
  footer.appendChild(footerContent);
  footer.appendChild(divider);
  footer.appendChild(bottomFooter);
  
  return footer;
}

/**
 * Utility function to adjust color brightness
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to adjust brightness (negative = darker, positive = lighter)
 * @returns {string} Adjusted hex color
 */
function adjustBrightness(hex, percent) {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + (r * percent / 100)));
  g = Math.max(0, Math.min(255, g + (g * percent / 100)));
  b = Math.max(0, Math.min(255, b + (b * percent / 100)));
  
  // Convert back to hex
  const rHex = Math.round(r).toString(16).padStart(2, '0');
  const gHex = Math.round(g).toString(16).padStart(2, '0');
  const bHex = Math.round(b).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}