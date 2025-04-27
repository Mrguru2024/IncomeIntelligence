/**
 * Financial Mentorship Platform
 * A platform connecting users with financial mentors like coaches, advisors, CFOs
 */

let currentUserId = null;
let currentUser = null;
let currentUserProfile = null;
let currentPage = 'browse'; // 'browse', 'mentor-profile', 'mentor-dashboard'
let mentors = [];
let userMentorships = [];
let mentorClients = [];
let selectedMentor = null;
let selectedClient = null;

// Mentor specialties data
const mentorSpecialties = [
  { id: 'budgeting', name: 'Budgeting & Planning' },
  { id: 'debt', name: 'Debt Management' },
  { id: 'investing', name: 'Investment Strategy' },
  { id: 'retirement', name: 'Retirement Planning' },
  { id: 'tax', name: 'Tax Optimization' },
  { id: 'business', name: 'Business Finance' },
  { id: 'startups', name: 'Startup Financing' },
  { id: 'estate', name: 'Estate Planning' },
  { id: 'insurance', name: 'Insurance Planning' },
  { id: 'cfo', name: 'CFO Services' },
];

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the mentorship page
  const mentorshipContainer = document.getElementById('mentorship-container');
  if (!mentorshipContainer) return;

  initializeMentorshipPlatform();
});

/**
 * Initialize the mentorship platform
 */
async function initializeMentorshipPlatform() {
  console.log('Initializing financial mentorship platform...');
  
  try {
    // Import user profile module
    const userProfileModule = await import('./user-profile.js');
    
    // Get current user ID
    currentUserId = getCurrentUserId();
    if (!currentUserId) {
      showError('User ID not found. Please log in again.');
      return;
    }
    
    // Load user profile
    currentUserProfile = await userProfileModule.initUserProfile(currentUserId);
    if (!currentUserProfile) {
      showError('Failed to load profile data. Please try again later.');
      return;
    }
    
    // Load current user data from localStorage
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      currentUser = JSON.parse(userData);
    }
    
    // Load mentors, mentorships, and clients
    await loadMentorData();
    
    // Determine if user is a mentor
    const isMentor = mentors.some(mentor => mentor.userId === currentUserId);
    
    // Determine initial page to show
    if (isMentor && window.location.hash === '#dashboard') {
      currentPage = 'mentor-dashboard';
    } else {
      currentPage = 'browse';
    }
    
    // Render the appropriate page
    renderMentorshipPage();
    setupMentorshipEventListeners();
    
  } catch (error) {
    console.error('Error initializing mentorship platform:', error);
    showError('Failed to initialize mentorship platform. Please try again later.');
  }
}

/**
 * Load mentor data from API/storage
 */
async function loadMentorData() {
  try {
    // In a real app, these would be API calls
    // For this demo, we'll use some sample data and localStorage
    
    // Try to load from localStorage first
    const storedMentors = localStorage.getItem('stackrMentors');
    if (storedMentors) {
      mentors = JSON.parse(storedMentors);
    } else {
      // Sample mentors if none exist
      mentors = generateSampleMentors();
      localStorage.setItem('stackrMentors', JSON.stringify(mentors));
    }
    
    // Load user's mentorships (mentors they are working with)
    const storedMentorships = localStorage.getItem(`stackrMentorships_${currentUserId}`);
    if (storedMentorships) {
      userMentorships = JSON.parse(storedMentorships);
    }
    
    // If the user is a mentor, load their clients
    const userMentor = mentors.find(mentor => mentor.userId === currentUserId);
    if (userMentor) {
      const storedClients = localStorage.getItem(`stackrMentorClients_${currentUserId}`);
      if (storedClients) {
        mentorClients = JSON.parse(storedClients);
      }
    }
    
  } catch (error) {
    console.error('Error loading mentor data:', error);
    throw error;
  }
}

/**
 * Generate sample mentors for demonstration
 * @returns {Array} Sample mentors
 */
function generateSampleMentors() {
  return [
    {
      id: 'mentor-1',
      userId: 'sample-mentor-1',
      name: 'Jennifer Mitchell, CFP',
      title: 'Certified Financial Planner',
      bio: 'I help individuals and families create comprehensive financial plans that align with their goals and values. With over 15 years of experience, I specialize in retirement planning and investment strategies.',
      specialties: ['budgeting', 'investing', 'retirement'],
      experience: 15,
      hourlyRate: 150,
      education: [
        { degree: 'MBA', institution: 'Stanford University', year: 2005 },
        { degree: 'CFP Certification', institution: 'Certified Financial Planner Board of Standards', year: 2006 }
      ],
      reviews: [
        { rating: 5, text: 'Jennifer helped me create a retirement plan that gave me confidence in my financial future.', author: 'Michael T.' },
        { rating: 4, text: 'Very knowledgeable about investment strategies. Helped me diversify my portfolio.', author: 'Sarah K.' }
      ],
      availability: {
        monday: ['10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00'],
        friday: ['13:00', '14:00', '15:00', '16:00']
      },
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
      sessionCount: 342,
      intakeForm: {
        sections: [
          {
            title: 'Personal Information',
            fields: [
              { id: 'fullName', label: 'Full Name', type: 'text', required: true },
              { id: 'age', label: 'Age', type: 'number', required: true },
              { id: 'occupation', label: 'Occupation', type: 'text', required: true }
            ]
          },
          {
            title: 'Financial Goals',
            fields: [
              { id: 'shortTermGoals', label: 'Short-term Financial Goals (1-3 years)', type: 'textarea', required: true },
              { id: 'longTermGoals', label: 'Long-term Financial Goals (3+ years)', type: 'textarea', required: true }
            ]
          },
          {
            title: 'Current Financial Situation',
            fields: [
              { id: 'annualIncome', label: 'Annual Household Income', type: 'number', required: true },
              { id: 'savings', label: 'Total Savings', type: 'number', required: true },
              { id: 'debts', label: 'Total Debts', type: 'number', required: true },
              { id: 'investmentExperience', label: 'Investment Experience', type: 'select', options: ['None', 'Beginner', 'Intermediate', 'Advanced'], required: true }
            ]
          }
        ]
      }
    },
    {
      id: 'mentor-2',
      userId: 'sample-mentor-2',
      name: 'David Washington',
      title: 'Business Financial Advisor',
      bio: 'I work with small business owners and entrepreneurs to optimize their company finances, manage cash flow, and plan for growth. My 12 years of experience includes CFO roles at several startups.',
      specialties: ['business', 'startups', 'cfo'],
      experience: 12,
      hourlyRate: 175,
      education: [
        { degree: 'MBA', institution: 'Harvard Business School', year: 2010 },
        { degree: 'BS Finance', institution: 'NYU Stern', year: 2005 }
      ],
      reviews: [
        { rating: 5, text: 'David helped me structure my startup finances and prepare for investor meetings. Invaluable guidance!', author: 'Jessica R.' },
        { rating: 5, text: 'Exceptional advisor for small business owners. Helped me increase profit margins by 15%.', author: 'Robert M.' }
      ],
      availability: {
        tuesday: ['09:00', '10:00', '11:00', '13:00'],
        thursday: ['10:00', '11:00', '13:00', '14:00'],
        friday: ['10:00', '11:00', '14:00', '15:00']
      },
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      sessionCount: 256,
      intakeForm: {
        sections: [
          {
            title: 'Business Information',
            fields: [
              { id: 'businessName', label: 'Business Name', type: 'text', required: true },
              { id: 'industry', label: 'Industry', type: 'text', required: true },
              { id: 'yearsInBusiness', label: 'Years in Business', type: 'number', required: true },
              { id: 'employees', label: 'Number of Employees', type: 'number', required: true }
            ]
          },
          {
            title: 'Financial Status',
            fields: [
              { id: 'annualRevenue', label: 'Annual Revenue', type: 'number', required: true },
              { id: 'profitMargin', label: 'Current Profit Margin (%)', type: 'number', required: true },
              { id: 'cashReserves', label: 'Cash Reserves', type: 'number', required: true },
              { id: 'businessDebt', label: 'Business Debt', type: 'number', required: true }
            ]
          },
          {
            title: 'Business Goals',
            fields: [
              { id: 'businessGoals', label: 'Primary Business Goals', type: 'textarea', required: true },
              { id: 'challenges', label: 'Current Financial Challenges', type: 'textarea', required: true },
              { id: 'growthPlans', label: 'Growth Plans (1-3 years)', type: 'textarea', required: true }
            ]
          }
        ]
      }
    },
    {
      id: 'mentor-3',
      userId: 'sample-mentor-3',
      name: 'Maria Chen, CPA',
      title: 'Tax Specialist & Financial Coach',
      bio: 'I specialize in tax optimization strategies for individuals and small businesses. My approach combines tax planning with holistic financial coaching to help clients build wealth while minimizing tax burdens.',
      specialties: ['tax', 'business', 'budgeting'],
      experience: 9,
      hourlyRate: 135,
      education: [
        { degree: 'Master of Accounting', institution: 'University of Michigan', year: 2012 },
        { degree: 'CPA License', institution: 'State Board of Accountancy', year: 2013 }
      ],
      reviews: [
        { rating: 5, text: 'Maria saved me thousands on taxes while helping me plan for my financial future. Highly recommend!', author: 'Thomas G.' },
        { rating: 4, text: 'Great tax knowledge and excellent financial coaching. Made complicated concepts easy to understand.', author: 'Linda P.' }
      ],
      availability: {
        monday: ['09:00', '10:00', '14:00', '15:00'],
        tuesday: ['13:00', '14:00', '15:00', '16:00'],
        thursday: ['09:00', '10:00', '11:00', '13:00']
      },
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      sessionCount: 187,
      intakeForm: {
        sections: [
          {
            title: 'Personal Information',
            fields: [
              { id: 'fullName', label: 'Full Name', type: 'text', required: true },
              { id: 'filingStatus', label: 'Tax Filing Status', type: 'select', options: ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'], required: true },
              { id: 'dependents', label: 'Number of Dependents', type: 'number', required: true }
            ]
          },
          {
            title: 'Income Sources',
            fields: [
              { id: 'primaryIncome', label: 'Primary Income Source', type: 'select', options: ['W-2 Employment', 'Self-Employment', 'Business Owner', 'Investments', 'Retirement'], required: true },
              { id: 'annualIncome', label: 'Annual Income', type: 'number', required: true },
              { id: 'additionalIncome', label: 'Additional Income Sources (describe)', type: 'textarea', required: false }
            ]
          },
          {
            title: 'Tax Concerns',
            fields: [
              { id: 'taxConcerns', label: 'Primary Tax Concerns', type: 'textarea', required: true },
              { id: 'previousYearTaxes', label: 'Previous Year Tax Amount', type: 'number', required: true },
              { id: 'investmentIncome', label: 'Investment Income', type: 'number', required: false }
            ]
          }
        ]
      }
    }
  ];
}

/**
 * Render the appropriate mentorship page based on current state
 */
function renderMentorshipPage() {
  const container = document.getElementById('mentorship-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Page header
  const header = document.createElement('div');
  header.className = 'mentorship-header';
  header.style.marginBottom = '2rem';
  
  const title = document.createElement('h1');
  title.textContent = 'Financial Mentorship Platform';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '0.5rem';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Connect with financial professionals to get personalized guidance on your financial journey.';
  subtitle.style.color = '#6b7280';
  subtitle.style.marginBottom = '1.5rem';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  // Navigation tabs
  const navTabs = document.createElement('div');
  navTabs.className = 'mentorship-nav-tabs';
  navTabs.style.display = 'flex';
  navTabs.style.borderBottom = '1px solid #e5e7eb';
  navTabs.style.marginBottom = '2rem';
  
  const browseTab = createNavTab('Browse Mentors', currentPage === 'browse', () => {
    currentPage = 'browse';
    renderMentorshipPage();
  });
  
  const myMentorsTab = createNavTab('My Mentors', false, () => {
    currentPage = 'my-mentors';
    renderMentorshipPage();
  });
  
  navTabs.appendChild(browseTab);
  navTabs.appendChild(myMentorsTab);
  
  // Check if user is a mentor
  const userIsMentor = mentors.some(mentor => mentor.userId === currentUserId);
  if (userIsMentor) {
    const dashboardTab = createNavTab('Mentor Dashboard', currentPage === 'mentor-dashboard', () => {
      currentPage = 'mentor-dashboard';
      renderMentorshipPage();
    });
    navTabs.appendChild(dashboardTab);
  } else {
    // Show become a mentor button
    const becomeMentorTab = createNavTab('Become a Mentor', false, showBecomeMentorModal);
    navTabs.appendChild(becomeMentorTab);
  }
  
  header.appendChild(navTabs);
  container.appendChild(header);
  
  // Content area
  const content = document.createElement('div');
  content.className = 'mentorship-content';
  content.style.width = '100%';
  
  // Render the appropriate content based on current page
  if (currentPage === 'browse') {
    renderBrowseMentorsPage(content);
  } else if (currentPage === 'mentor-profile' && selectedMentor) {
    renderMentorProfilePage(content, selectedMentor);
  } else if (currentPage === 'mentor-dashboard') {
    renderMentorDashboardPage(content);
  } else if (currentPage === 'client-profile' && selectedClient) {
    renderClientProfilePage(content, selectedClient);
  } else if (currentPage === 'my-mentors') {
    renderMyMentorsPage(content);
  }
  
  container.appendChild(content);
}

/**
 * Create a navigation tab
 * @param {string} text - Tab text
 * @param {boolean} active - Whether tab is active
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Tab element
 */
function createNavTab(text, active, onClick) {
  const tab = document.createElement('button');
  tab.textContent = text;
  tab.style.padding = '0.75rem 1rem';
  tab.style.fontWeight = active ? 'bold' : 'normal';
  tab.style.color = active ? '#4F46E5' : '#6b7280';
  tab.style.borderBottom = active ? '2px solid #4F46E5' : 'none';
  tab.style.backgroundColor = 'transparent';
  tab.style.border = 'none';
  tab.style.cursor = 'pointer';
  tab.style.marginRight = '1rem';
  tab.style.transition = 'all 0.3s';
  
  tab.addEventListener('click', onClick);
  
  return tab;
}

/**
 * Render the browse mentors page
 * @param {HTMLElement} container - Content container
 */
function renderBrowseMentorsPage(container) {
  // Filter and sort controls
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'flex';
  controlsContainer.style.justifyContent = 'space-between';
  controlsContainer.style.alignItems = 'center';
  controlsContainer.style.marginBottom = '1.5rem';
  
  // Search
  const searchContainer = document.createElement('div');
  searchContainer.style.flex = '1';
  searchContainer.style.marginRight = '1rem';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search mentors...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '0.5rem 1rem';
  searchInput.style.borderRadius = '6px';
  searchInput.style.border = '1px solid #d1d5db';
  
  searchContainer.appendChild(searchInput);
  
  // Specialty filter
  const filterContainer = document.createElement('div');
  filterContainer.style.display = 'flex';
  filterContainer.style.alignItems = 'center';
  
  const filterLabel = document.createElement('span');
  filterLabel.textContent = 'Specialty:';
  filterLabel.style.marginRight = '0.5rem';
  filterLabel.style.fontSize = '14px';
  
  const filterSelect = document.createElement('select');
  filterSelect.style.padding = '0.5rem';
  filterSelect.style.borderRadius = '6px';
  filterSelect.style.border = '1px solid #d1d5db';
  
  // Add "All" option
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Specialties';
  filterSelect.appendChild(allOption);
  
  // Add specialty options
  mentorSpecialties.forEach(specialty => {
    const option = document.createElement('option');
    option.value = specialty.id;
    option.textContent = specialty.name;
    filterSelect.appendChild(option);
  });
  
  filterContainer.appendChild(filterLabel);
  filterContainer.appendChild(filterSelect);
  
  controlsContainer.appendChild(searchContainer);
  controlsContainer.appendChild(filterContainer);
  
  container.appendChild(controlsContainer);
  
  // Mentors grid
  const mentorsGrid = document.createElement('div');
  mentorsGrid.className = 'mentors-grid';
  mentorsGrid.style.display = 'grid';
  mentorsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  mentorsGrid.style.gap = '1.5rem';
  
  // Render mentor cards
  mentors.forEach(mentor => {
    const mentorCard = createMentorCard(mentor);
    mentorsGrid.appendChild(mentorCard);
  });
  
  container.appendChild(mentorsGrid);
  
  // Set up search and filter functionality
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const specialty = filterSelect.value;
    
    const filteredMentors = mentors.filter(mentor => {
      const nameMatch = mentor.name.toLowerCase().includes(searchTerm) || 
                        mentor.title.toLowerCase().includes(searchTerm) ||
                        mentor.bio.toLowerCase().includes(searchTerm);
      
      const specialtyMatch = !specialty || mentor.specialties.includes(specialty);
      
      return nameMatch && specialtyMatch;
    });
    
    // Update the grid
    mentorsGrid.innerHTML = '';
    filteredMentors.forEach(mentor => {
      const mentorCard = createMentorCard(mentor);
      mentorsGrid.appendChild(mentorCard);
    });
  });
  
  filterSelect.addEventListener('change', () => {
    // Trigger the search handler to apply both filters
    searchInput.dispatchEvent(new Event('input'));
  });
}

/**
 * Create a mentor card
 * @param {Object} mentor - Mentor data
 * @returns {HTMLElement} Mentor card element
 */
function createMentorCard(mentor) {
  const card = document.createElement('div');
  card.className = 'mentor-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '12px';
  card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  card.style.overflow = 'hidden';
  card.style.transition = 'transform 0.3s, box-shadow 0.3s';
  card.style.cursor = 'pointer';
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  });
  
  // Card header with avatar
  const cardHeader = document.createElement('div');
  cardHeader.style.position = 'relative';
  cardHeader.style.height = '100px';
  cardHeader.style.backgroundColor = '#4F46E5';
  
  const avatarContainer = document.createElement('div');
  avatarContainer.style.position = 'absolute';
  avatarContainer.style.bottom = '-40px';
  avatarContainer.style.left = '20px';
  avatarContainer.style.width = '80px';
  avatarContainer.style.height = '80px';
  avatarContainer.style.borderRadius = '50%';
  avatarContainer.style.backgroundColor = 'white';
  avatarContainer.style.display = 'flex';
  avatarContainer.style.alignItems = 'center';
  avatarContainer.style.justifyContent = 'center';
  avatarContainer.style.border = '4px solid white';
  avatarContainer.style.overflow = 'hidden';
  
  const avatar = document.createElement('img');
  avatar.src = mentor.avatar || 'https://via.placeholder.com/80';
  avatar.alt = mentor.name;
  avatar.style.width = '100%';
  avatar.style.height = '100%';
  avatar.style.objectFit = 'cover';
  
  avatarContainer.appendChild(avatar);
  cardHeader.appendChild(avatarContainer);
  
  // Card content
  const cardContent = document.createElement('div');
  cardContent.style.padding = '1.5rem';
  cardContent.style.paddingTop = '2.5rem';
  
  // Mentor name and title
  const mentorName = document.createElement('h3');
  mentorName.textContent = mentor.name;
  mentorName.style.fontSize = '18px';
  mentorName.style.fontWeight = 'bold';
  mentorName.style.marginBottom = '0.25rem';
  
  const mentorTitle = document.createElement('p');
  mentorTitle.textContent = mentor.title;
  mentorTitle.style.color = '#6b7280';
  mentorTitle.style.fontSize = '14px';
  mentorTitle.style.marginBottom = '1rem';
  
  // Specialties
  const specialtiesContainer = document.createElement('div');
  specialtiesContainer.style.display = 'flex';
  specialtiesContainer.style.flexWrap = 'wrap';
  specialtiesContainer.style.gap = '0.5rem';
  specialtiesContainer.style.marginBottom = '1rem';
  
  mentor.specialties.forEach(specialtyId => {
    const specialty = mentorSpecialties.find(s => s.id === specialtyId);
    if (specialty) {
      const badge = document.createElement('span');
      badge.textContent = specialty.name;
      badge.style.backgroundColor = '#f3f4f6';
      badge.style.padding = '0.25rem 0.5rem';
      badge.style.borderRadius = '4px';
      badge.style.fontSize = '12px';
      
      specialtiesContainer.appendChild(badge);
    }
  });
  
  // Rating and experience
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.justifyContent = 'space-between';
  statsContainer.style.marginBottom = '1rem';
  
  // Calculate average rating
  let avgRating = 0;
  if (mentor.reviews && mentor.reviews.length > 0) {
    avgRating = mentor.reviews.reduce((sum, review) => sum + review.rating, 0) / mentor.reviews.length;
  }
  
  const ratingContainer = document.createElement('div');
  ratingContainer.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="color: #FBBC05;">★</span>
      <span style="margin-left: 0.25rem;">${avgRating.toFixed(1)}</span>
      <span style="margin-left: 0.25rem; color: #6b7280; font-size: 12px;">(${mentor.reviews ? mentor.reviews.length : 0})</span>
    </div>
  `;
  
  const experienceContainer = document.createElement('div');
  experienceContainer.textContent = `${mentor.experience} years experience`;
  experienceContainer.style.fontSize = '14px';
  experienceContainer.style.color = '#6b7280';
  
  statsContainer.appendChild(ratingContainer);
  statsContainer.appendChild(experienceContainer);
  
  // Price
  const priceContainer = document.createElement('div');
  priceContainer.textContent = `$${mentor.hourlyRate}/hour`;
  priceContainer.style.fontWeight = 'bold';
  priceContainer.style.color = '#4F46E5';
  priceContainer.style.marginBottom = '1.5rem';
  
  // View profile button
  const viewProfileBtn = document.createElement('button');
  viewProfileBtn.textContent = 'View Profile';
  viewProfileBtn.style.width = '100%';
  viewProfileBtn.style.backgroundColor = '#4F46E5';
  viewProfileBtn.style.color = 'white';
  viewProfileBtn.style.border = 'none';
  viewProfileBtn.style.borderRadius = '6px';
  viewProfileBtn.style.padding = '0.75rem 1rem';
  viewProfileBtn.style.fontWeight = 'bold';
  viewProfileBtn.style.cursor = 'pointer';
  viewProfileBtn.style.transition = 'background-color 0.3s';
  
  viewProfileBtn.addEventListener('mouseenter', () => {
    viewProfileBtn.style.backgroundColor = '#4338ca';
  });
  
  viewProfileBtn.addEventListener('mouseleave', () => {
    viewProfileBtn.style.backgroundColor = '#4F46E5';
  });
  
  viewProfileBtn.addEventListener('click', event => {
    event.stopPropagation(); // Prevent card click handler from firing
    selectedMentor = mentor;
    currentPage = 'mentor-profile';
    renderMentorshipPage();
  });
  
  // Assemble the card content
  cardContent.appendChild(mentorName);
  cardContent.appendChild(mentorTitle);
  cardContent.appendChild(specialtiesContainer);
  cardContent.appendChild(statsContainer);
  cardContent.appendChild(priceContainer);
  cardContent.appendChild(viewProfileBtn);
  
  // Assemble the card
  card.appendChild(cardHeader);
  card.appendChild(cardContent);
  
  // Add click handler for the entire card
  card.addEventListener('click', () => {
    selectedMentor = mentor;
    currentPage = 'mentor-profile';
    renderMentorshipPage();
  });
  
  return card;
}

/**
 * Render a mentor's profile page
 * @param {HTMLElement} container - Content container
 * @param {Object} mentor - Mentor data
 */
function renderMentorProfilePage(container, mentor) {
  // Back button
  const backButton = document.createElement('button');
  backButton.textContent = '← Back to Browse';
  backButton.style.backgroundColor = 'transparent';
  backButton.style.border = 'none';
  backButton.style.color = '#4F46E5';
  backButton.style.padding = '0';
  backButton.style.marginBottom = '1.5rem';
  backButton.style.cursor = 'pointer';
  backButton.style.fontWeight = '500';
  
  backButton.addEventListener('click', () => {
    currentPage = 'browse';
    renderMentorshipPage();
  });
  
  container.appendChild(backButton);
  
  // Profile content container
  const profileContainer = document.createElement('div');
  profileContainer.style.display = 'grid';
  profileContainer.style.gridTemplateColumns = 'minmax(0, 2fr) minmax(0, 1fr)';
  profileContainer.style.gap = '2rem';
  profileContainer.style.alignItems = 'start';
  
  // Main content area
  const mainContent = document.createElement('div');
  
  // Mentor profile header
  const profileHeader = document.createElement('div');
  profileHeader.style.display = 'flex';
  profileHeader.style.gap = '1.5rem';
  profileHeader.style.marginBottom = '2rem';
  
  // Avatar
  const avatarContainer = document.createElement('div');
  avatarContainer.style.width = '120px';
  avatarContainer.style.height = '120px';
  avatarContainer.style.borderRadius = '50%';
  avatarContainer.style.overflow = 'hidden';
  avatarContainer.style.flexShrink = '0';
  
  const avatar = document.createElement('img');
  avatar.src = mentor.avatar || 'https://via.placeholder.com/120';
  avatar.alt = mentor.name;
  avatar.style.width = '100%';
  avatar.style.height = '100%';
  avatar.style.objectFit = 'cover';
  
  avatarContainer.appendChild(avatar);
  
  // Profile info
  const profileInfo = document.createElement('div');
  profileInfo.style.flex = '1';
  
  const mentorName = document.createElement('h2');
  mentorName.textContent = mentor.name;
  mentorName.style.fontSize = '24px';
  mentorName.style.fontWeight = 'bold';
  mentorName.style.marginBottom = '0.5rem';
  
  const mentorTitle = document.createElement('p');
  mentorTitle.textContent = mentor.title;
  mentorTitle.style.color = '#6b7280';
  mentorTitle.style.marginBottom = '1rem';
  
  // Stats
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.gap = '2rem';
  
  // Calculate average rating
  let avgRating = 0;
  if (mentor.reviews && mentor.reviews.length > 0) {
    avgRating = mentor.reviews.reduce((sum, review) => sum + review.rating, 0) / mentor.reviews.length;
  }
  
  const ratingContainer = document.createElement('div');
  ratingContainer.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="color: #FBBC05; font-size: 20px;">★</span>
      <span style="margin-left: 0.25rem; font-weight: bold;">${avgRating.toFixed(1)}</span>
      <span style="margin-left: 0.25rem; color: #6b7280;">(${mentor.reviews ? mentor.reviews.length : 0} reviews)</span>
    </div>
  `;
  
  const experienceContainer = document.createElement('div');
  experienceContainer.textContent = `${mentor.experience} years experience`;
  
  const sessionsContainer = document.createElement('div');
  sessionsContainer.textContent = `${mentor.sessionCount || 0} sessions completed`;
  
  statsContainer.appendChild(ratingContainer);
  statsContainer.appendChild(experienceContainer);
  statsContainer.appendChild(sessionsContainer);
  
  // Specialties
  const specialtiesContainer = document.createElement('div');
  specialtiesContainer.style.display = 'flex';
  specialtiesContainer.style.flexWrap = 'wrap';
  specialtiesContainer.style.gap = '0.5rem';
  specialtiesContainer.style.marginTop = '1rem';
  
  mentor.specialties.forEach(specialtyId => {
    const specialty = mentorSpecialties.find(s => s.id === specialtyId);
    if (specialty) {
      const badge = document.createElement('span');
      badge.textContent = specialty.name;
      badge.style.backgroundColor = '#f3f4f6';
      badge.style.padding = '0.25rem 0.75rem';
      badge.style.borderRadius = '999px';
      badge.style.fontSize = '14px';
      
      specialtiesContainer.appendChild(badge);
    }
  });
  
  profileInfo.appendChild(mentorName);
  profileInfo.appendChild(mentorTitle);
  profileInfo.appendChild(statsContainer);
  profileInfo.appendChild(specialtiesContainer);
  
  profileHeader.appendChild(avatarContainer);
  profileHeader.appendChild(profileInfo);
  
  mainContent.appendChild(profileHeader);
  
  // Bio section
  const bioSection = document.createElement('div');
  bioSection.style.backgroundColor = 'white';
  bioSection.style.borderRadius = '12px';
  bioSection.style.padding = '1.5rem';
  bioSection.style.marginBottom = '2rem';
  bioSection.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const bioTitle = document.createElement('h3');
  bioTitle.textContent = 'About Me';
  bioTitle.style.fontSize = '18px';
  bioTitle.style.fontWeight = 'bold';
  bioTitle.style.marginBottom = '1rem';
  
  const bioText = document.createElement('p');
  bioText.textContent = mentor.bio;
  bioText.style.lineHeight = '1.6';
  
  bioSection.appendChild(bioTitle);
  bioSection.appendChild(bioText);
  
  mainContent.appendChild(bioSection);
  
  // Education & Credentials section
  const educationSection = document.createElement('div');
  educationSection.style.backgroundColor = 'white';
  educationSection.style.borderRadius = '12px';
  educationSection.style.padding = '1.5rem';
  educationSection.style.marginBottom = '2rem';
  educationSection.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const educationTitle = document.createElement('h3');
  educationTitle.textContent = 'Education & Credentials';
  educationTitle.style.fontSize = '18px';
  educationTitle.style.fontWeight = 'bold';
  educationTitle.style.marginBottom = '1rem';
  
  educationSection.appendChild(educationTitle);
  
  if (mentor.education && mentor.education.length > 0) {
    const educationList = document.createElement('ul');
    educationList.style.paddingLeft = '1.5rem';
    
    mentor.education.forEach(edu => {
      const item = document.createElement('li');
      item.style.marginBottom = '0.5rem';
      item.innerHTML = `<strong>${edu.degree}</strong> - ${edu.institution} (${edu.year})`;
      educationList.appendChild(item);
    });
    
    educationSection.appendChild(educationList);
  } else {
    const noEducation = document.createElement('p');
    noEducation.textContent = 'No education information available.';
    noEducation.style.color = '#6b7280';
    educationSection.appendChild(noEducation);
  }
  
  mainContent.appendChild(educationSection);
  
  // Reviews section
  const reviewsSection = document.createElement('div');
  reviewsSection.style.backgroundColor = 'white';
  reviewsSection.style.borderRadius = '12px';
  reviewsSection.style.padding = '1.5rem';
  reviewsSection.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const reviewsTitle = document.createElement('h3');
  reviewsTitle.textContent = 'Client Reviews';
  reviewsTitle.style.fontSize = '18px';
  reviewsTitle.style.fontWeight = 'bold';
  reviewsTitle.style.marginBottom = '1rem';
  
  reviewsSection.appendChild(reviewsTitle);
  
  if (mentor.reviews && mentor.reviews.length > 0) {
    mentor.reviews.forEach(review => {
      const reviewCard = document.createElement('div');
      reviewCard.style.borderBottom = '1px solid #e5e7eb';
      reviewCard.style.paddingBottom = '1rem';
      reviewCard.style.marginBottom = '1rem';
      
      const reviewHeader = document.createElement('div');
      reviewHeader.style.display = 'flex';
      reviewHeader.style.justifyContent = 'space-between';
      reviewHeader.style.marginBottom = '0.5rem';
      
      const reviewAuthor = document.createElement('span');
      reviewAuthor.textContent = review.author;
      reviewAuthor.style.fontWeight = '500';
      
      const reviewRating = document.createElement('div');
      reviewRating.innerHTML = '★'.repeat(review.rating);
      reviewRating.style.color = '#FBBC05';
      
      reviewHeader.appendChild(reviewAuthor);
      reviewHeader.appendChild(reviewRating);
      
      const reviewText = document.createElement('p');
      reviewText.textContent = review.text;
      reviewText.style.fontSize = '14px';
      
      reviewCard.appendChild(reviewHeader);
      reviewCard.appendChild(reviewText);
      
      reviewsSection.appendChild(reviewCard);
    });
  } else {
    const noReviews = document.createElement('p');
    noReviews.textContent = 'No reviews yet.';
    noReviews.style.color = '#6b7280';
    reviewsSection.appendChild(noReviews);
  }
  
  mainContent.appendChild(reviewsSection);
  
  // Sidebar - Booking and contact
  const sidebar = document.createElement('div');
  
  // Pricing card
  const pricingCard = document.createElement('div');
  pricingCard.style.backgroundColor = 'white';
  pricingCard.style.borderRadius = '12px';
  pricingCard.style.padding = '1.5rem';
  pricingCard.style.marginBottom = '1.5rem';
  pricingCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const pricingTitle = document.createElement('h3');
  pricingTitle.textContent = 'Session Rate';
  pricingTitle.style.fontSize = '18px';
  pricingTitle.style.fontWeight = 'bold';
  pricingTitle.style.marginBottom = '1rem';
  
  const priceContainer = document.createElement('div');
  priceContainer.style.display = 'flex';
  priceContainer.style.alignItems = 'center';
  priceContainer.style.justifyContent = 'center';
  priceContainer.style.padding = '1rem';
  priceContainer.style.backgroundColor = '#f9fafb';
  priceContainer.style.borderRadius = '8px';
  priceContainer.style.marginBottom = '1.5rem';
  
  const price = document.createElement('span');
  price.textContent = `$${mentor.hourlyRate}`;
  price.style.fontSize = '28px';
  price.style.fontWeight = 'bold';
  price.style.color = '#4F46E5';
  
  const priceUnit = document.createElement('span');
  priceUnit.textContent = ' / hour';
  priceUnit.style.fontSize = '16px';
  priceUnit.style.color = '#6b7280';
  
  priceContainer.appendChild(price);
  priceContainer.appendChild(priceUnit);
  
  // Book session button
  const bookButton = document.createElement('button');
  bookButton.textContent = 'Request Mentorship';
  bookButton.style.width = '100%';
  bookButton.style.backgroundColor = '#4F46E5';
  bookButton.style.color = 'white';
  bookButton.style.border = 'none';
  bookButton.style.borderRadius = '6px';
  bookButton.style.padding = '0.75rem 1rem';
  bookButton.style.fontWeight = 'bold';
  bookButton.style.cursor = 'pointer';
  bookButton.style.transition = 'background-color 0.3s';
  
  bookButton.addEventListener('mouseenter', () => {
    bookButton.style.backgroundColor = '#4338ca';
  });
  
  bookButton.addEventListener('mouseleave', () => {
    bookButton.style.backgroundColor = '#4F46E5';
  });
  
  bookButton.addEventListener('click', () => {
    showIntakeFormModal(mentor);
  });
  
  pricingCard.appendChild(pricingTitle);
  pricingCard.appendChild(priceContainer);
  pricingCard.appendChild(bookButton);
  
  // Availability card
  const availabilityCard = document.createElement('div');
  availabilityCard.style.backgroundColor = 'white';
  availabilityCard.style.borderRadius = '12px';
  availabilityCard.style.padding = '1.5rem';
  availabilityCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const availabilityTitle = document.createElement('h3');
  availabilityTitle.textContent = 'Availability';
  availabilityTitle.style.fontSize = '18px';
  availabilityTitle.style.fontWeight = 'bold';
  availabilityTitle.style.marginBottom = '1rem';
  
  availabilityCard.appendChild(availabilityTitle);
  
  if (mentor.availability) {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    weekdays.forEach(day => {
      if (mentor.availability[day] && mentor.availability[day].length > 0) {
        const dayContainer = document.createElement('div');
        dayContainer.style.marginBottom = '0.75rem';
        
        const dayName = document.createElement('div');
        dayName.textContent = day.charAt(0).toUpperCase() + day.slice(1);
        dayName.style.fontWeight = '500';
        dayName.style.marginBottom = '0.25rem';
        
        const timeSlots = document.createElement('div');
        timeSlots.style.display = 'flex';
        timeSlots.style.flexWrap = 'wrap';
        timeSlots.style.gap = '0.5rem';
        
        mentor.availability[day].forEach(time => {
          const timeSlot = document.createElement('span');
          timeSlot.textContent = time;
          timeSlot.style.backgroundColor = '#f3f4f6';
          timeSlot.style.padding = '0.25rem 0.5rem';
          timeSlot.style.borderRadius = '4px';
          timeSlot.style.fontSize = '12px';
          
          timeSlots.appendChild(timeSlot);
        });
        
        dayContainer.appendChild(dayName);
        dayContainer.appendChild(timeSlots);
        availabilityCard.appendChild(dayContainer);
      }
    });
  } else {
    const noAvailability = document.createElement('p');
    noAvailability.textContent = 'No availability information available.';
    noAvailability.style.color = '#6b7280';
    availabilityCard.appendChild(noAvailability);
  }
  
  sidebar.appendChild(pricingCard);
  sidebar.appendChild(availabilityCard);
  
  // Assemble the profile container
  profileContainer.appendChild(mainContent);
  profileContainer.appendChild(sidebar);
  
  container.appendChild(profileContainer);
}

/**
 * Show mentor intake form modal
 * @param {Object} mentor - Mentor data
 */
function showIntakeFormModal(mentor) {
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.width = '90%';
  modal.style.maxWidth = '800px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '1.5rem';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Mentorship Request Form';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#6b7280';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '1.5rem';
  
  // Introduction text
  const introText = document.createElement('p');
  introText.innerHTML = `
    You're requesting mentorship from <strong>${mentor.name}</strong>. 
    Please complete this form to help your mentor understand your financial needs and goals better.
  `;
  introText.style.marginBottom = '1.5rem';
  
  content.appendChild(introText);
  
  // Create form
  const form = document.createElement('form');
  form.id = 'mentorship-intake-form';
  
  if (mentor.intakeForm && mentor.intakeForm.sections) {
    mentor.intakeForm.sections.forEach(section => {
      const sectionContainer = document.createElement('div');
      sectionContainer.className = 'form-section';
      sectionContainer.style.marginBottom = '2rem';
      
      const sectionTitle = document.createElement('h4');
      sectionTitle.textContent = section.title;
      sectionTitle.style.fontSize = '16px';
      sectionTitle.style.fontWeight = 'bold';
      sectionTitle.style.marginBottom = '1rem';
      
      sectionContainer.appendChild(sectionTitle);
      
      section.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'form-field';
        fieldContainer.style.marginBottom = '1rem';
        
        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label + (field.required ? ' *' : '');
        label.style.display = 'block';
        label.style.marginBottom = '0.5rem';
        label.style.fontWeight = '500';
        
        fieldContainer.appendChild(label);
        
        if (field.type === 'textarea') {
          const textarea = document.createElement('textarea');
          textarea.id = field.id;
          textarea.name = field.id;
          textarea.rows = 4;
          textarea.required = field.required || false;
          textarea.style.width = '100%';
          textarea.style.padding = '0.5rem';
          textarea.style.borderRadius = '4px';
          textarea.style.border = '1px solid #d1d5db';
          
          fieldContainer.appendChild(textarea);
        } else if (field.type === 'select') {
          const select = document.createElement('select');
          select.id = field.id;
          select.name = field.id;
          select.required = field.required || false;
          select.style.width = '100%';
          select.style.padding = '0.5rem';
          select.style.borderRadius = '4px';
          select.style.border = '1px solid #d1d5db';
          
          // Add default empty option
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Select an option...';
          defaultOption.disabled = true;
          defaultOption.selected = true;
          select.appendChild(defaultOption);
          
          // Add options
          if (field.options && field.options.length) {
            field.options.forEach(optionText => {
              const option = document.createElement('option');
              option.value = optionText;
              option.textContent = optionText;
              select.appendChild(option);
            });
          }
          
          fieldContainer.appendChild(select);
        } else {
          const input = document.createElement('input');
          input.type = field.type || 'text';
          input.id = field.id;
          input.name = field.id;
          input.required = field.required || false;
          input.style.width = '100%';
          input.style.padding = '0.5rem';
          input.style.borderRadius = '4px';
          input.style.border = '1px solid #d1d5db';
          
          fieldContainer.appendChild(input);
        }
        
        sectionContainer.appendChild(fieldContainer);
      });
      
      form.appendChild(sectionContainer);
    });
  } else {
    // Default form if no custom intake form is defined
    const defaultForm = document.createElement('div');
    defaultForm.innerHTML = `
      <div class="form-field" style="margin-bottom: 1rem;">
        <label for="goals" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">What are your primary financial goals? *</label>
        <textarea id="goals" name="goals" rows="4" required style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #d1d5db;"></textarea>
      </div>
      
      <div class="form-field" style="margin-bottom: 1rem;">
        <label for="challenges" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">What financial challenges are you currently facing? *</label>
        <textarea id="challenges" name="challenges" rows="4" required style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #d1d5db;"></textarea>
      </div>
      
      <div class="form-field" style="margin-bottom: 1rem;">
        <label for="expectations" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">What do you hope to achieve from this mentorship? *</label>
        <textarea id="expectations" name="expectations" rows="4" required style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #d1d5db;"></textarea>
      </div>
    `;
    
    form.appendChild(defaultForm);
  }
  
  // Agreement checkbox
  const agreementContainer = document.createElement('div');
  agreementContainer.style.marginTop = '1.5rem';
  agreementContainer.style.marginBottom = '1.5rem';
  
  const agreementCheckbox = document.createElement('input');
  agreementCheckbox.type = 'checkbox';
  agreementCheckbox.id = 'agreement';
  agreementCheckbox.required = true;
  agreementCheckbox.style.marginRight = '0.5rem';
  
  const agreementLabel = document.createElement('label');
  agreementLabel.htmlFor = 'agreement';
  agreementLabel.innerHTML = `
    I understand that submitting this form does not guarantee acceptance, and that the mentor may require additional information before accepting me as a client. I also agree to the <a href="#" style="color: #4F46E5; text-decoration: underline;">Terms of Service</a> and <a href="#" style="color: #4F46E5; text-decoration: underline;">Privacy Policy</a>.
  `;
  agreementLabel.style.fontSize = '14px';
  
  agreementContainer.appendChild(agreementCheckbox);
  agreementContainer.appendChild(agreementLabel);
  
  form.appendChild(agreementContainer);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Request';
  submitButton.style.width = '100%';
  submitButton.style.backgroundColor = '#4F46E5';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.padding = '0.75rem 1rem';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.3s';
  
  submitButton.addEventListener('mouseenter', () => {
    submitButton.style.backgroundColor = '#4338ca';
  });
  
  submitButton.addEventListener('mouseleave', () => {
    submitButton.style.backgroundColor = '#4F46E5';
  });
  
  form.appendChild(submitButton);
  
  // Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const formDataObj = {};
    
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }
    
    // Create mentorship request
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate storing in localStorage
      
      const mentorshipRequests = JSON.parse(localStorage.getItem(`stackrMentorshipRequests_${currentUserId}`) || '[]');
      
      const newRequest = {
        id: `request-${Date.now()}`,
        mentorId: mentor.id,
        userId: currentUserId,
        date: new Date().toISOString(),
        status: 'pending',
        formData: formDataObj
      };
      
      mentorshipRequests.push(newRequest);
      localStorage.setItem(`stackrMentorshipRequests_${currentUserId}`, JSON.stringify(mentorshipRequests));
      
      // Show success message
      showSuccessModal(mentor);
      
      // Close the form modal
      document.body.removeChild(modalOverlay);
    } catch (error) {
      console.error('Error submitting mentorship request:', error);
      alert('Failed to submit request. Please try again later.');
    }
  });
  
  content.appendChild(form);
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  
  document.body.appendChild(modalOverlay);
}

/**
 * Show success modal after submitting mentorship request
 * @param {Object} mentor - Mentor data
 */
function showSuccessModal(mentor) {
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.padding = '2rem';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  
  // Success icon
  const icon = document.createElement('div');
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;
  icon.style.marginBottom = '1rem';
  
  // Success title
  const title = document.createElement('h3');
  title.textContent = 'Request Submitted Successfully!';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '1rem';
  
  // Success message
  const message = document.createElement('p');
  message.innerHTML = `
    Your mentorship request has been sent to <strong>${mentor.name}</strong>.
    You will receive a notification once they review your request.
    Meanwhile, you can view the status of your request in your "My Mentors" section.
  `;
  message.style.marginBottom = '1.5rem';
  message.style.lineHeight = '1.5';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Got it!';
  closeButton.style.backgroundColor = '#4F46E5';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.padding = '0.75rem 1.5rem';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    
    // Switch to My Mentors tab
    currentPage = 'my-mentors';
    renderMentorshipPage();
  });
  
  // Assemble modal
  modal.appendChild(icon);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(closeButton);
  modalOverlay.appendChild(modal);
  
  document.body.appendChild(modalOverlay);
}

/**
 * Show modal for becoming a mentor
 */
function showBecomeMentorModal() {
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.width = '90%';
  modal.style.maxWidth = '700px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '1.5rem';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Become a Financial Mentor';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#6b7280';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '1.5rem';
  
  // Introduction text
  const introText = document.createElement('div');
  introText.innerHTML = `
    <p style="margin-bottom: 1rem;">
      Share your financial expertise and help others achieve their financial goals by becoming a mentor on our platform.
    </p>
    <p style="margin-bottom: 1.5rem;">
      As a financial mentor, you'll have the opportunity to:
    </p>
    <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
      <li style="margin-bottom: 0.5rem;">Build your professional reputation and client base</li>
      <li style="margin-bottom: 0.5rem;">Earn income through one-on-one mentorship sessions</li>
      <li style="margin-bottom: 0.5rem;">Make a meaningful impact on others' financial journeys</li>
      <li style="margin-bottom: 0.5rem;">Access powerful tools to manage clients and deliver value</li>
    </ul>
  `;
  
  content.appendChild(introText);
  
  // Create form
  const form = document.createElement('form');
  form.id = 'become-mentor-form';
  
  // Professional information section
  const professionalSection = document.createElement('div');
  professionalSection.className = 'form-section';
  professionalSection.style.marginBottom = '2rem';
  
  const professionalTitle = document.createElement('h4');
  professionalTitle.textContent = 'Professional Information';
  professionalTitle.style.fontSize = '16px';
  professionalTitle.style.fontWeight = 'bold';
  professionalTitle.style.marginBottom = '1rem';
  
  professionalSection.appendChild(professionalTitle);
  
  // Professional title field
  const titleField = document.createElement('div');
  titleField.className = 'form-field';
  titleField.style.marginBottom = '1rem';
  
  const titleLabel = document.createElement('label');
  titleLabel.htmlFor = 'professional-title';
  titleLabel.textContent = 'Professional Title *';
  titleLabel.style.display = 'block';
  titleLabel.style.marginBottom = '0.5rem';
  titleLabel.style.fontWeight = '500';
  
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'professional-title';
  titleInput.name = 'professionalTitle';
  titleInput.placeholder = 'e.g. Certified Financial Planner, Business Financial Advisor';
  titleInput.required = true;
  titleInput.style.width = '100%';
  titleInput.style.padding = '0.5rem';
  titleInput.style.borderRadius = '4px';
  titleInput.style.border = '1px solid #d1d5db';
  
  titleField.appendChild(titleLabel);
  titleField.appendChild(titleInput);
  
  // Bio field
  const bioField = document.createElement('div');
  bioField.className = 'form-field';
  bioField.style.marginBottom = '1rem';
  
  const bioLabel = document.createElement('label');
  bioLabel.htmlFor = 'bio';
  bioLabel.textContent = 'Professional Bio *';
  bioLabel.style.display = 'block';
  bioLabel.style.marginBottom = '0.5rem';
  bioLabel.style.fontWeight = '500';
  
  const bioHelp = document.createElement('p');
  bioHelp.textContent = 'Describe your expertise, experience, and mentorship approach (200-500 characters).';
  bioHelp.style.fontSize = '14px';
  bioHelp.style.color = '#6b7280';
  bioHelp.style.marginTop = '-0.25rem';
  bioHelp.style.marginBottom = '0.5rem';
  
  const bioInput = document.createElement('textarea');
  bioInput.id = 'bio';
  bioInput.name = 'bio';
  bioInput.rows = 4;
  bioInput.minLength = 200;
  bioInput.maxLength = 500;
  bioInput.placeholder = 'I help individuals and families create comprehensive financial plans...';
  bioInput.required = true;
  bioInput.style.width = '100%';
  bioInput.style.padding = '0.5rem';
  bioInput.style.borderRadius = '4px';
  bioInput.style.border = '1px solid #d1d5db';
  
  bioField.appendChild(bioLabel);
  bioField.appendChild(bioHelp);
  bioField.appendChild(bioInput);
  
  // Experience field
  const experienceField = document.createElement('div');
  experienceField.className = 'form-field';
  experienceField.style.marginBottom = '1rem';
  
  const experienceLabel = document.createElement('label');
  experienceLabel.htmlFor = 'experience';
  experienceLabel.textContent = 'Years of Experience *';
  experienceLabel.style.display = 'block';
  experienceLabel.style.marginBottom = '0.5rem';
  experienceLabel.style.fontWeight = '500';
  
  const experienceInput = document.createElement('input');
  experienceInput.type = 'number';
  experienceInput.id = 'experience';
  experienceInput.name = 'experience';
  experienceInput.min = 1;
  experienceInput.required = true;
  experienceInput.style.width = '100%';
  experienceInput.style.padding = '0.5rem';
  experienceInput.style.borderRadius = '4px';
  experienceInput.style.border = '1px solid #d1d5db';
  
  experienceField.appendChild(experienceLabel);
  experienceField.appendChild(experienceInput);
  
  // Rate field
  const rateField = document.createElement('div');
  rateField.className = 'form-field';
  rateField.style.marginBottom = '1rem';
  
  const rateLabel = document.createElement('label');
  rateLabel.htmlFor = 'hourly-rate';
  rateLabel.textContent = 'Hourly Rate (USD) *';
  rateLabel.style.display = 'block';
  rateLabel.style.marginBottom = '0.5rem';
  rateLabel.style.fontWeight = '500';
  
  const rateContainer = document.createElement('div');
  rateContainer.style.position = 'relative';
  
  const ratePrefix = document.createElement('span');
  ratePrefix.textContent = '$';
  ratePrefix.style.position = 'absolute';
  ratePrefix.style.left = '0.75rem';
  ratePrefix.style.top = '50%';
  ratePrefix.style.transform = 'translateY(-50%)';
  ratePrefix.style.color = '#6b7280';
  
  const rateInput = document.createElement('input');
  rateInput.type = 'number';
  rateInput.id = 'hourly-rate';
  rateInput.name = 'hourlyRate';
  rateInput.min = 50;
  rateInput.max = 500;
  rateInput.step = 5;
  rateInput.required = true;
  rateInput.style.width = '100%';
  rateInput.style.padding = '0.5rem';
  rateInput.style.paddingLeft = '1.5rem';
  rateInput.style.borderRadius = '4px';
  rateInput.style.border = '1px solid #d1d5db';
  
  rateContainer.appendChild(ratePrefix);
  rateContainer.appendChild(rateInput);
  
  rateField.appendChild(rateLabel);
  rateField.appendChild(rateContainer);
  
  // Specialties field
  const specialtiesField = document.createElement('div');
  specialtiesField.className = 'form-field';
  specialtiesField.style.marginBottom = '1rem';
  
  const specialtiesLabel = document.createElement('label');
  specialtiesLabel.textContent = 'Specialties (select up to 3) *';
  specialtiesLabel.style.display = 'block';
  specialtiesLabel.style.marginBottom = '0.75rem';
  specialtiesLabel.style.fontWeight = '500';
  
  const specialtiesContainer = document.createElement('div');
  specialtiesContainer.style.display = 'grid';
  specialtiesContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  specialtiesContainer.style.gap = '0.5rem';
  
  mentorSpecialties.forEach(specialty => {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.display = 'flex';
    checkboxContainer.style.alignItems = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `specialty-${specialty.id}`;
    checkbox.name = 'specialties';
    checkbox.value = specialty.id;
    checkbox.style.marginRight = '0.5rem';
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = `specialty-${specialty.id}`;
    checkboxLabel.textContent = specialty.name;
    checkboxLabel.style.fontSize = '14px';
    
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxLabel);
    
    specialtiesContainer.appendChild(checkboxContainer);
  });
  
  specialtiesField.appendChild(specialtiesLabel);
  specialtiesField.appendChild(specialtiesContainer);
  
  // Assemble professional section
  professionalSection.appendChild(titleField);
  professionalSection.appendChild(bioField);
  professionalSection.appendChild(experienceField);
  professionalSection.appendChild(rateField);
  professionalSection.appendChild(specialtiesField);
  
  // Credentials section
  const credentialsSection = document.createElement('div');
  credentialsSection.className = 'form-section';
  credentialsSection.style.marginBottom = '2rem';
  
  const credentialsTitle = document.createElement('h4');
  credentialsTitle.textContent = 'Credentials';
  credentialsTitle.style.fontSize = '16px';
  credentialsTitle.style.fontWeight = 'bold';
  credentialsTitle.style.marginBottom = '1rem';
  
  credentialsSection.appendChild(credentialsTitle);
  
  // Education field
  const educationField = document.createElement('div');
  educationField.className = 'form-field';
  educationField.style.marginBottom = '1rem';
  
  const educationLabel = document.createElement('label');
  educationLabel.htmlFor = 'education';
  educationLabel.textContent = 'Education and Certifications *';
  educationLabel.style.display = 'block';
  educationLabel.style.marginBottom = '0.5rem';
  educationLabel.style.fontWeight = '500';
  
  const educationHelp = document.createElement('p');
  educationHelp.textContent = 'List your degrees, certifications, and other relevant credentials.';
  educationHelp.style.fontSize = '14px';
  educationHelp.style.color = '#6b7280';
  educationHelp.style.marginTop = '-0.25rem';
  educationHelp.style.marginBottom = '0.5rem';
  
  const educationInput = document.createElement('textarea');
  educationInput.id = 'education';
  educationInput.name = 'education';
  educationInput.rows = 3;
  educationInput.required = true;
  educationInput.placeholder = 'MBA, Stanford University (2010)\nCFP Certification (2012)';
  educationInput.style.width = '100%';
  educationInput.style.padding = '0.5rem';
  educationInput.style.borderRadius = '4px';
  educationInput.style.border = '1px solid #d1d5db';
  
  educationField.appendChild(educationLabel);
  educationField.appendChild(educationHelp);
  educationField.appendChild(educationInput);
  
  credentialsSection.appendChild(educationField);
  
  // Agreement checkbox
  const agreementContainer = document.createElement('div');
  agreementContainer.style.marginTop = '1.5rem';
  agreementContainer.style.marginBottom = '1.5rem';
  
  const agreementCheckbox = document.createElement('input');
  agreementCheckbox.type = 'checkbox';
  agreementCheckbox.id = 'agreement';
  agreementCheckbox.required = true;
  agreementCheckbox.style.marginRight = '0.5rem';
  
  const agreementLabel = document.createElement('label');
  agreementLabel.htmlFor = 'agreement';
  agreementLabel.innerHTML = `
    I certify that all the information provided is accurate and complete. I agree to the <a href="#" style="color: #4F46E5; text-decoration: underline;">Mentor Terms of Service</a> and <a href="#" style="color: #4F46E5; text-decoration: underline;">Privacy Policy</a>.
  `;
  agreementLabel.style.fontSize = '14px';
  
  agreementContainer.appendChild(agreementCheckbox);
  agreementContainer.appendChild(agreementLabel);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Application';
  submitButton.style.width = '100%';
  submitButton.style.backgroundColor = '#4F46E5';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.padding = '0.75rem 1rem';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.3s';
  
  submitButton.addEventListener('mouseenter', () => {
    submitButton.style.backgroundColor = '#4338ca';
  });
  
  submitButton.addEventListener('mouseleave', () => {
    submitButton.style.backgroundColor = '#4F46E5';
  });
  
  // Assemble form
  form.appendChild(professionalSection);
  form.appendChild(credentialsSection);
  form.appendChild(agreementContainer);
  form.appendChild(submitButton);
  
  // Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Validate specialties selection (max 3)
    const selectedSpecialties = Array.from(form.querySelectorAll('input[name="specialties"]:checked')).map(el => el.value);
    if (selectedSpecialties.length === 0) {
      alert('Please select at least one specialty.');
      return;
    }
    if (selectedSpecialties.length > 3) {
      alert('Please select at most three specialties.');
      return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const formDataObj = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === 'specialties') {
        if (!formDataObj[key]) {
          formDataObj[key] = [];
        }
        formDataObj[key].push(value);
      } else {
        formDataObj[key] = value;
      }
    }
    
    // Create mentor profile
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate storing in localStorage
      
      const newMentor = {
        id: `mentor-${Date.now()}`,
        userId: currentUserId,
        name: currentUser?.name || currentUserProfile?.displayName || 'New Mentor',
        title: formDataObj.professionalTitle,
        bio: formDataObj.bio,
        specialties: formDataObj.specialties,
        experience: parseInt(formDataObj.experience, 10),
        hourlyRate: parseInt(formDataObj.hourlyRate, 10),
        education: formDataObj.education.split('\n').map(edu => {
          const parts = edu.match(/(.+?)(?:\s*\((\d{4})\))?$/);
          return {
            degree: parts[1].trim(),
            institution: '',
            year: parts[2] ? parseInt(parts[2], 10) : null
          };
        }),
        reviews: [],
        availability: {
          monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          friday: ['10:00', '11:00', '14:00', '15:00']
        },
        avatar: '',
        sessionCount: 0,
        intakeForm: {
          sections: [
            {
              title: 'Financial Goals',
              fields: [
                { id: 'shortTermGoals', label: 'Short-term Financial Goals (1-3 years)', type: 'textarea', required: true },
                { id: 'longTermGoals', label: 'Long-term Financial Goals (3+ years)', type: 'textarea', required: true }
              ]
            },
            {
              title: 'Current Financial Situation',
              fields: [
                { id: 'annualIncome', label: 'Annual Income', type: 'number', required: true },
                { id: 'savings', label: 'Total Savings', type: 'number', required: true },
                { id: 'debts', label: 'Total Debts', type: 'number', required: true },
                { id: 'financialConcerns', label: 'Primary Financial Concerns', type: 'textarea', required: true }
              ]
            }
          ]
        }
      };
      
      // Add to mentors list
      mentors.push(newMentor);
      localStorage.setItem('stackrMentors', JSON.stringify(mentors));
      
      // Show success message
      showBecomeMentorSuccessModal();
      
      // Close the form modal
      document.body.removeChild(modalOverlay);
    } catch (error) {
      console.error('Error submitting mentor application:', error);
      alert('Failed to submit application. Please try again later.');
    }
  });
  
  content.appendChild(form);
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  
  document.body.appendChild(modalOverlay);
}

/**
 * Show success modal after submitting mentor application
 */
function showBecomeMentorSuccessModal() {
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.padding = '2rem';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  
  // Success icon
  const icon = document.createElement('div');
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;
  icon.style.marginBottom = '1rem';
  
  // Success title
  const title = document.createElement('h3');
  title.textContent = 'Application Submitted Successfully!';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '1rem';
  
  // Success message
  const message = document.createElement('p');
  message.innerHTML = `
    Your application to become a financial mentor has been submitted. 
    Your mentor profile is now live and you can start receiving mentorship requests!
  `;
  message.style.marginBottom = '1.5rem';
  message.style.lineHeight = '1.5';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Go to Mentor Dashboard';
  closeButton.style.backgroundColor = '#4F46E5';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.padding = '0.75rem 1.5rem';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    
    // Switch to Mentor Dashboard tab
    currentPage = 'mentor-dashboard';
    renderMentorshipPage();
  });
  
  // Assemble modal
  modal.appendChild(icon);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(closeButton);
  modalOverlay.appendChild(modal);
  
  document.body.appendChild(modalOverlay);
}

/**
 * Render the mentor dashboard page
 * @param {HTMLElement} container - Content container
 */
function renderMentorDashboardPage(container) {
  // Get the current user's mentor profile
  const userMentor = mentors.find(mentor => mentor.userId === currentUserId);
  
  if (!userMentor) {
    // Should not happen, but just in case
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'Mentor profile not found. Please try again later.';
    errorMessage.style.padding = '2rem';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.color = '#ef4444';
    
    container.appendChild(errorMessage);
    return;
  }
  
  // Dashboard header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '2rem';
  
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = 'Mentor Dashboard';
  headerTitle.style.fontSize = '20px';
  headerTitle.style.fontWeight = 'bold';
  headerTitle.style.margin = '0';
  
  const editProfileBtn = document.createElement('button');
  editProfileBtn.textContent = 'Edit Mentor Profile';
  editProfileBtn.style.backgroundColor = 'transparent';
  editProfileBtn.style.color = '#4F46E5';
  editProfileBtn.style.border = '1px solid #4F46E5';
  editProfileBtn.style.borderRadius = '6px';
  editProfileBtn.style.padding = '0.5rem 1rem';
  editProfileBtn.style.fontWeight = '500';
  editProfileBtn.style.cursor = 'pointer';
  
  editProfileBtn.addEventListener('click', () => {
    // Show edit profile modal
    // Not implemented in this demo
    alert('Edit profile functionality not implemented in this demo.');
  });
  
  header.appendChild(headerTitle);
  header.appendChild(editProfileBtn);
  
  container.appendChild(header);
  
  // Dashboard content
  const dashboardContent = document.createElement('div');
  dashboardContent.style.display = 'grid';
  dashboardContent.style.gridTemplateColumns = 'minmax(0, 2fr) minmax(0, 1fr)';
  dashboardContent.style.gap = '2rem';
  dashboardContent.style.alignItems = 'start';
  
  // Main content area
  const mainContent = document.createElement('div');
  
  // Client requests section
  const requestsSection = document.createElement('div');
  requestsSection.style.backgroundColor = 'white';
  requestsSection.style.borderRadius = '12px';
  requestsSection.style.padding = '1.5rem';
  requestsSection.style.marginBottom = '2rem';
  requestsSection.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const requestsTitle = document.createElement('h3');
  requestsTitle.textContent = 'Pending Requests';
  requestsTitle.style.fontSize = '18px';
  requestsTitle.style.fontWeight = 'bold';
  requestsTitle.style.marginBottom = '1rem';
  
  requestsSection.appendChild(requestsTitle);
  
  // Simulate some pending requests
  const pendingRequests = [];
  
  if (pendingRequests.length > 0) {
    pendingRequests.forEach(request => {
      // Render request card
      const requestCard = document.createElement('div');
      requestCard.style.border = '1px solid #e5e7eb';
      requestCard.style.borderRadius = '8px';
      requestCard.style.padding = '1rem';
      requestCard.style.marginBottom = '1rem';
      
      const requestHeader = document.createElement('div');
      requestHeader.style.display = 'flex';
      requestHeader.style.justifyContent = 'space-between';
      requestHeader.style.marginBottom = '0.5rem';
      
      const clientName = document.createElement('span');
      clientName.textContent = request.clientName;
      clientName.style.fontWeight = '500';
      
      const requestDate = document.createElement('span');
      requestDate.textContent = new Date(request.date).toLocaleDateString();
      requestDate.style.color = '#6b7280';
      requestDate.style.fontSize = '14px';
      
      requestHeader.appendChild(clientName);
      requestHeader.appendChild(requestDate);
      
      const requestGoals = document.createElement('p');
      requestGoals.textContent = `Goals: ${request.goals}`;
      requestGoals.style.fontSize = '14px';
      requestGoals.style.marginBottom = '1rem';
      
      const requestActions = document.createElement('div');
      requestActions.style.display = 'flex';
      requestActions.style.gap = '0.5rem';
      
      const viewButton = document.createElement('button');
      viewButton.textContent = 'View Details';
      viewButton.style.flex = '1';
      viewButton.style.backgroundColor = 'transparent';
      viewButton.style.color = '#4F46E5';
      viewButton.style.border = '1px solid #4F46E5';
      viewButton.style.borderRadius = '4px';
      viewButton.style.padding = '0.5rem';
      viewButton.style.fontSize = '14px';
      viewButton.style.cursor = 'pointer';
      
      const acceptButton = document.createElement('button');
      acceptButton.textContent = 'Accept';
      acceptButton.style.flex = '1';
      acceptButton.style.backgroundColor = '#10b981';
      acceptButton.style.color = 'white';
      acceptButton.style.border = 'none';
      acceptButton.style.borderRadius = '4px';
      acceptButton.style.padding = '0.5rem';
      acceptButton.style.fontSize = '14px';
      acceptButton.style.cursor = 'pointer';
      
      const declineButton = document.createElement('button');
      declineButton.textContent = 'Decline';
      declineButton.style.flex = '1';
      declineButton.style.backgroundColor = '#ef4444';
      declineButton.style.color = 'white';
      declineButton.style.border = 'none';
      declineButton.style.borderRadius = '4px';
      declineButton.style.padding = '0.5rem';
      declineButton.style.fontSize = '14px';
      declineButton.style.cursor = 'pointer';
      
      requestActions.appendChild(viewButton);
      requestActions.appendChild(acceptButton);
      requestActions.appendChild(declineButton);
      
      requestCard.appendChild(requestHeader);
      requestCard.appendChild(requestGoals);
      requestCard.appendChild(requestActions);
      
      requestsSection.appendChild(requestCard);
    });
  } else {
    const noRequests = document.createElement('p');
    noRequests.textContent = 'No pending mentorship requests at this time.';
    noRequests.style.color = '#6b7280';
    noRequests.style.padding = '1rem 0';
    noRequests.style.textAlign = 'center';
    
    requestsSection.appendChild(noRequests);
  }
  
  mainContent.appendChild(requestsSection);
  
  // Clients section
  const clientsSection = document.createElement('div');
  clientsSection.style.backgroundColor = 'white';
  clientsSection.style.borderRadius = '12px';
  clientsSection.style.padding = '1.5rem';
  clientsSection.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const clientsTitle = document.createElement('h3');
  clientsTitle.textContent = 'Your Clients';
  clientsTitle.style.fontSize = '18px';
  clientsTitle.style.fontWeight = 'bold';
  clientsTitle.style.marginBottom = '1rem';
  
  clientsSection.appendChild(clientsTitle);
  
  // Simulate some clients
  const clients = [];
  
  if (clients.length > 0) {
    clients.forEach(client => {
      // Render client card
      const clientCard = document.createElement('div');
      clientCard.style.display = 'flex';
      clientCard.style.alignItems = 'center';
      clientCard.style.padding = '1rem';
      clientCard.style.borderBottom = '1px solid #e5e7eb';
      clientCard.style.cursor = 'pointer';
      
      // Client avatar
      const avatar = document.createElement('div');
      avatar.style.width = '40px';
      avatar.style.height = '40px';
      avatar.style.borderRadius = '50%';
      avatar.style.backgroundColor = '#e5e7eb';
      avatar.style.marginRight = '1rem';
      avatar.style.display = 'flex';
      avatar.style.alignItems = 'center';
      avatar.style.justifyContent = 'center';
      avatar.style.fontWeight = 'bold';
      avatar.style.color = '#6b7280';
      avatar.textContent = client.name.charAt(0).toUpperCase();
      
      // Client info
      const info = document.createElement('div');
      info.style.flex = '1';
      
      const clientName = document.createElement('div');
      clientName.textContent = client.name;
      clientName.style.fontWeight = '500';
      
      const clientStatus = document.createElement('div');
      clientStatus.textContent = client.status;
      clientStatus.style.fontSize = '14px';
      clientStatus.style.color = '#6b7280';
      
      info.appendChild(clientName);
      info.appendChild(clientStatus);
      
      // View button
      const viewButton = document.createElement('button');
      viewButton.textContent = 'View Details';
      viewButton.style.backgroundColor = 'transparent';
      viewButton.style.color = '#4F46E5';
      viewButton.style.border = '1px solid #4F46E5';
      viewButton.style.borderRadius = '4px';
      viewButton.style.padding = '0.5rem';
      viewButton.style.fontSize = '14px';
      viewButton.style.cursor = 'pointer';
      
      clientCard.appendChild(avatar);
      clientCard.appendChild(info);
      clientCard.appendChild(viewButton);
      
      clientsSection.appendChild(clientCard);
    });
  } else {
    const noClients = document.createElement('p');
    noClients.textContent = 'You don\'t have any clients yet. Once you accept mentorship requests, they will appear here.';
    noClients.style.color = '#6b7280';
    noClients.style.padding = '1rem 0';
    noClients.style.textAlign = 'center';
    
    clientsSection.appendChild(noClients);
  }
  
  mainContent.appendChild(clientsSection);
  
  // Sidebar
  const sidebar = document.createElement('div');
  
  // Profile summary card
  const profileCard = document.createElement('div');
  profileCard.style.backgroundColor = 'white';
  profileCard.style.borderRadius = '12px';
  profileCard.style.padding = '1.5rem';
  profileCard.style.marginBottom = '1.5rem';
  profileCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  // Profile header
  const profileHeader = document.createElement('div');
  profileHeader.style.display = 'flex';
  profileHeader.style.alignItems = 'center';
  profileHeader.style.marginBottom = '1rem';
  
  // Avatar
  const avatarContainer = document.createElement('div');
  avatarContainer.style.width = '60px';
  avatarContainer.style.height = '60px';
  avatarContainer.style.borderRadius = '50%';
  avatarContainer.style.overflow = 'hidden';
  avatarContainer.style.marginRight = '1rem';
  
  const avatar = document.createElement('img');
  avatar.src = userMentor.avatar || 'https://via.placeholder.com/60';
  avatar.alt = userMentor.name;
  avatar.style.width = '100%';
  avatar.style.height = '100%';
  avatar.style.objectFit = 'cover';
  
  avatarContainer.appendChild(avatar);
  
  // Name and title
  const nameContainer = document.createElement('div');
  
  const mentorName = document.createElement('div');
  mentorName.textContent = userMentor.name;
  mentorName.style.fontWeight = 'bold';
  
  const mentorTitle = document.createElement('div');
  mentorTitle.textContent = userMentor.title;
  mentorTitle.style.fontSize = '14px';
  mentorTitle.style.color = '#6b7280';
  
  nameContainer.appendChild(mentorName);
  nameContainer.appendChild(mentorTitle);
  
  profileHeader.appendChild(avatarContainer);
  profileHeader.appendChild(nameContainer);
  
  // Profile stats
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.justifyContent = 'space-between';
  statsContainer.style.padding = '1rem 0';
  statsContainer.style.borderTop = '1px solid #e5e7eb';
  statsContainer.style.borderBottom = '1px solid #e5e7eb';
  statsContainer.style.marginBottom = '1rem';
  
  const statsItems = [
    { label: 'Rate', value: `$${userMentor.hourlyRate}/hr` },
    { label: 'Clients', value: clients.length },
    { label: 'Sessions', value: userMentor.sessionCount || 0 }
  ];
  
  statsItems.forEach(item => {
    const statItem = document.createElement('div');
    statItem.style.textAlign = 'center';
    
    const statValue = document.createElement('div');
    statValue.textContent = item.value;
    statValue.style.fontWeight = 'bold';
    statValue.style.fontSize = '18px';
    
    const statLabel = document.createElement('div');
    statLabel.textContent = item.label;
    statLabel.style.fontSize = '14px';
    statLabel.style.color = '#6b7280';
    
    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    
    statsContainer.appendChild(statItem);
  });
  
  // Profile link
  const profileLink = document.createElement('a');
  profileLink.href = '#';
  profileLink.textContent = 'View Public Profile';
  profileLink.style.display = 'block';
  profileLink.style.textAlign = 'center';
  profileLink.style.color = '#4F46E5';
  profileLink.style.textDecoration = 'none';
  profileLink.style.fontSize = '14px';
  
  profileLink.addEventListener('click', event => {
    event.preventDefault();
    selectedMentor = userMentor;
    currentPage = 'mentor-profile';
    renderMentorshipPage();
  });
  
  // Assemble profile card
  profileCard.appendChild(profileHeader);
  profileCard.appendChild(statsContainer);
  profileCard.appendChild(profileLink);
  
  // Scheduled sessions card
  const sessionsCard = document.createElement('div');
  sessionsCard.style.backgroundColor = 'white';
  sessionsCard.style.borderRadius = '12px';
  sessionsCard.style.padding = '1.5rem';
  sessionsCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  const sessionsTitle = document.createElement('h3');
  sessionsTitle.textContent = 'Upcoming Sessions';
  sessionsTitle.style.fontSize = '16px';
  sessionsTitle.style.fontWeight = 'bold';
  sessionsTitle.style.marginBottom = '1rem';
  
  sessionsCard.appendChild(sessionsTitle);
  
  // Simulated upcoming sessions
  const upcomingSessions = [];
  
  if (upcomingSessions.length > 0) {
    upcomingSessions.forEach(session => {
      // Render session
      const sessionItem = document.createElement('div');
      sessionItem.style.display = 'flex';
      sessionItem.style.alignItems = 'center';
      sessionItem.style.padding = '0.75rem 0';
      sessionItem.style.borderBottom = '1px solid #e5e7eb';
      
      // Date and time
      const dateTime = document.createElement('div');
      dateTime.style.marginRight = '0.75rem';
      
      const date = document.createElement('div');
      date.textContent = new Date(session.date).toLocaleDateString();
      date.style.fontWeight = '500';
      
      const time = document.createElement('div');
      time.textContent = session.time;
      time.style.fontSize = '14px';
      time.style.color = '#6b7280';
      
      dateTime.appendChild(date);
      dateTime.appendChild(time);
      
      // Client name
      const clientName = document.createElement('div');
      clientName.textContent = session.clientName;
      clientName.style.flex = '1';
      
      sessionItem.appendChild(dateTime);
      sessionItem.appendChild(clientName);
      
      sessionsCard.appendChild(sessionItem);
    });
  } else {
    const noSessions = document.createElement('p');
    noSessions.textContent = 'No upcoming sessions scheduled.';
    noSessions.style.color = '#6b7280';
    noSessions.style.padding = '0.5rem 0';
    noSessions.style.textAlign = 'center';
    
    sessionsCard.appendChild(noSessions);
  }
  
  // Add schedule button
  const scheduleButton = document.createElement('button');
  scheduleButton.textContent = 'Manage Availability';
  scheduleButton.style.width = '100%';
  scheduleButton.style.backgroundColor = 'transparent';
  scheduleButton.style.color = '#4F46E5';
  scheduleButton.style.border = '1px solid #4F46E5';
  scheduleButton.style.borderRadius = '6px';
  scheduleButton.style.padding = '0.5rem';
  scheduleButton.style.marginTop = '1rem';
  scheduleButton.style.fontWeight = '500';
  scheduleButton.style.cursor = 'pointer';
  
  scheduleButton.addEventListener('click', () => {
    // Show availability management modal
    // Not implemented in this demo
    alert('Availability management functionality not implemented in this demo.');
  });
  
  sessionsCard.appendChild(scheduleButton);
  
  // Assemble sidebar
  sidebar.appendChild(profileCard);
  sidebar.appendChild(sessionsCard);
  
  // Assemble dashboard content
  dashboardContent.appendChild(mainContent);
  dashboardContent.appendChild(sidebar);
  
  container.appendChild(dashboardContent);
}

/**
 * Render "My Mentors" page
 * @param {HTMLElement} container - Content container
 */
function renderMyMentorsPage(container) {
  // Load mentorship requests
  const mentorshipRequests = JSON.parse(localStorage.getItem(`stackrMentorshipRequests_${currentUserId}`) || '[]');
  
  // My mentors header
  const header = document.createElement('div');
  header.style.marginBottom = '2rem';
  
  const pageTitle = document.createElement('h2');
  pageTitle.textContent = 'My Mentors';
  pageTitle.style.fontSize = '20px';
  pageTitle.style.fontWeight = 'bold';
  pageTitle.style.marginBottom = '0.5rem';
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Manage your mentorship connections and track your requests.';
  pageDescription.style.color = '#6b7280';
  
  header.appendChild(pageTitle);
  header.appendChild(pageDescription);
  
  container.appendChild(header);
  
  // Section tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.style.borderBottom = '1px solid #e5e7eb';
  tabsContainer.style.marginBottom = '1.5rem';
  
  const tabs = ['Active Mentorships', 'Pending Requests'];
  const activeTab = 'Pending Requests'; // Default active tab
  
  tabs.forEach(tab => {
    const tabButton = document.createElement('button');
    tabButton.textContent = tab;
    tabButton.style.padding = '0.75rem 1rem';
    tabButton.style.marginRight = '1rem';
    tabButton.style.backgroundColor = 'transparent';
    tabButton.style.border = 'none';
    tabButton.style.borderBottom = tab === activeTab ? '2px solid #4F46E5' : 'none';
    tabButton.style.color = tab === activeTab ? '#4F46E5' : '#6b7280';
    tabButton.style.fontWeight = tab === activeTab ? 'bold' : 'normal';
    tabButton.style.cursor = 'pointer';
    
    tabsContainer.appendChild(tabButton);
  });
  
  container.appendChild(tabsContainer);
  
  // Content area
  const contentArea = document.createElement('div');
  
  // For the demo, show pending requests
  const pendingRequests = mentorshipRequests.filter(req => req.status === 'pending');
  
  if (pendingRequests.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '3rem 0';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    `;
    emptyIcon.style.marginBottom = '1rem';
    
    const emptyText = document.createElement('h3');
    emptyText.textContent = 'No Pending Requests';
    emptyText.style.fontSize = '18px';
    emptyText.style.fontWeight = 'bold';
    emptyText.style.marginBottom = '0.5rem';
    
    const emptyDescription = document.createElement('p');
    emptyDescription.textContent = 'You don\'t have any pending mentorship requests. Browse available mentors to get started.';
    emptyDescription.style.color = '#6b7280';
    emptyDescription.style.marginBottom = '1.5rem';
    
    const browseButton = document.createElement('button');
    browseButton.textContent = 'Browse Mentors';
    browseButton.style.backgroundColor = '#4F46E5';
    browseButton.style.color = 'white';
    browseButton.style.border = 'none';
    browseButton.style.borderRadius = '6px';
    browseButton.style.padding = '0.75rem 1.5rem';
    browseButton.style.fontWeight = 'bold';
    browseButton.style.cursor = 'pointer';
    
    browseButton.addEventListener('click', () => {
      currentPage = 'browse';
      renderMentorshipPage();
    });
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    emptyState.appendChild(emptyDescription);
    emptyState.appendChild(browseButton);
    
    contentArea.appendChild(emptyState);
  } else {
    // Render pending requests
    pendingRequests.forEach(request => {
      const mentor = mentors.find(m => m.id === request.mentorId);
      if (!mentor) return;
      
      const requestCard = document.createElement('div');
      requestCard.style.backgroundColor = 'white';
      requestCard.style.borderRadius = '12px';
      requestCard.style.padding = '1.5rem';
      requestCard.style.marginBottom = '1.5rem';
      requestCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      
      // Card header
      const cardHeader = document.createElement('div');
      cardHeader.style.display = 'flex';
      cardHeader.style.alignItems = 'center';
      cardHeader.style.marginBottom = '1rem';
      
      // Mentor avatar
      const avatarContainer = document.createElement('div');
      avatarContainer.style.width = '50px';
      avatarContainer.style.height = '50px';
      avatarContainer.style.borderRadius = '50%';
      avatarContainer.style.overflow = 'hidden';
      avatarContainer.style.marginRight = '1rem';
      
      const avatar = document.createElement('img');
      avatar.src = mentor.avatar || 'https://via.placeholder.com/50';
      avatar.alt = mentor.name;
      avatar.style.width = '100%';
      avatar.style.height = '100%';
      avatar.style.objectFit = 'cover';
      
      avatarContainer.appendChild(avatar);
      
      // Mentor info
      const mentorInfo = document.createElement('div');
      mentorInfo.style.flex = '1';
      
      const mentorName = document.createElement('div');
      mentorName.textContent = mentor.name;
      mentorName.style.fontWeight = 'bold';
      mentorName.style.fontSize = '16px';
      
      const mentorTitle = document.createElement('div');
      mentorTitle.textContent = mentor.title;
      mentorTitle.style.fontSize = '14px';
      mentorTitle.style.color = '#6b7280';
      
      mentorInfo.appendChild(mentorName);
      mentorInfo.appendChild(mentorTitle);
      
      // Request status badge
      const statusBadge = document.createElement('div');
      statusBadge.textContent = 'Pending';
      statusBadge.style.backgroundColor = '#fef3c7';
      statusBadge.style.color = '#92400e';
      statusBadge.style.padding = '0.25rem 0.5rem';
      statusBadge.style.borderRadius = '999px';
      statusBadge.style.fontSize = '12px';
      statusBadge.style.fontWeight = '500';
      
      cardHeader.appendChild(avatarContainer);
      cardHeader.appendChild(mentorInfo);
      cardHeader.appendChild(statusBadge);
      
      // Request details
      const requestDetails = document.createElement('div');
      requestDetails.style.padding = '1rem';
      requestDetails.style.backgroundColor = '#f9fafb';
      requestDetails.style.borderRadius = '8px';
      requestDetails.style.marginBottom = '1rem';
      
      // Request date
      const requestDate = document.createElement('div');
      requestDate.style.marginBottom = '0.5rem';
      requestDate.style.fontSize = '14px';
      requestDate.style.color = '#6b7280';
      requestDate.textContent = `Requested on ${new Date(request.date).toLocaleDateString()}`;
      
      // Request rate
      const requestRate = document.createElement('div');
      requestRate.style.fontWeight = '500';
      requestRate.textContent = `Rate: $${mentor.hourlyRate}/hour`;
      
      requestDetails.appendChild(requestDate);
      requestDetails.appendChild(requestRate);
      
      // Request actions
      const requestActions = document.createElement('div');
      requestActions.style.display = 'flex';
      requestActions.style.gap = '0.5rem';
      
      const viewMentorButton = document.createElement('button');
      viewMentorButton.textContent = 'View Mentor Profile';
      viewMentorButton.style.flex = '1';
      viewMentorButton.style.backgroundColor = 'transparent';
      viewMentorButton.style.color = '#4F46E5';
      viewMentorButton.style.border = '1px solid #4F46E5';
      viewMentorButton.style.borderRadius = '6px';
      viewMentorButton.style.padding = '0.5rem';
      viewMentorButton.style.fontWeight = '500';
      viewMentorButton.style.cursor = 'pointer';
      
      viewMentorButton.addEventListener('click', () => {
        selectedMentor = mentor;
        currentPage = 'mentor-profile';
        renderMentorshipPage();
      });
      
      const cancelRequestButton = document.createElement('button');
      cancelRequestButton.textContent = 'Cancel Request';
      cancelRequestButton.style.flex = '1';
      cancelRequestButton.style.backgroundColor = 'transparent';
      cancelRequestButton.style.color = '#ef4444';
      cancelRequestButton.style.border = '1px solid #ef4444';
      cancelRequestButton.style.borderRadius = '6px';
      cancelRequestButton.style.padding = '0.5rem';
      cancelRequestButton.style.fontWeight = '500';
      cancelRequestButton.style.cursor = 'pointer';
      
      requestActions.appendChild(viewMentorButton);
      requestActions.appendChild(cancelRequestButton);
      
      // Assemble card
      requestCard.appendChild(cardHeader);
      requestCard.appendChild(requestDetails);
      requestCard.appendChild(requestActions);
      
      contentArea.appendChild(requestCard);
    });
  }
  
  container.appendChild(contentArea);
}

/**
 * Get the current user ID
 * @returns {string|null} User ID or null if not found
 */
function getCurrentUserId() {
  // Try to get from window.appState first
  if (window.appState && window.appState.user && window.appState.user.id) {
    return window.appState.user.id;
  }
  
  // Fall back to localStorage
  try {
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  
  return null;
}

/**
 * Set up event listeners for the mentorship platform
 */
function setupMentorshipEventListeners() {
  // This function would set up global event listeners
  // Not needed for this demo as we're using direct click handlers
}

/**
 * Show an error message
 * @param {string} message - Error message
 */
function showError(message) {
  if (window.showToast) {
    window.showToast(message, 'error');
  } else {
    alert(message);
  }
}

/**
 * Show a success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  if (window.showToast) {
    window.showToast(message, 'success');
  } else {
    alert(message);
  }
}

export { initializeMentorshipPlatform };