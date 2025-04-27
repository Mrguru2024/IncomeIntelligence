/**
 * User Profile Page
 * Displays and allows editing of detailed user profile information
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the profile page
  const profileContainer = document.getElementById('profile-page-container');
  if (!profileContainer) return;

  // Initialize the toast system
  try {
    import('./components/toast.js').then(toastModule => {
      // Make the showToast function globally available
      window.showToast = toastModule.showToast;
      initializeProfilePage();
    }).catch(error => {
      console.error('Error importing toast module:', error);
      initializeProfilePage();
    });
  } catch (error) {
    console.error('Error setting up toast system:', error);
    initializeProfilePage();
  }
});

/**
 * Initialize the profile page
 */
async function initializeProfilePage() {
  console.log('Initializing user profile page...');
  
  try {
    // Import user profile module
    const userProfileModule = await import('./user-profile.js');
    const userId = getCurrentUserId();
    
    if (!userId) {
      showError('User ID not found. Please log in again.');
      return;
    }
    
    // Load user profile data
    const profile = await userProfileModule.initUserProfile(userId);
    if (!profile) {
      showError('Failed to load profile data. Please try again later.');
      return;
    }
    
    renderProfilePage(profile);
    setupProfileEventListeners(userProfileModule);
    
  } catch (error) {
    console.error('Error initializing profile page:', error);
    showError('Failed to initialize profile page. Please try again later.');
  }
}

/**
 * Get the current user ID from app state or localStorage
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
 * Render the profile page with user data
 * @param {Object} profile - User profile data
 */
function renderProfilePage(profile) {
  const container = document.getElementById('profile-page-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Header section
  const header = document.createElement('div');
  header.className = 'profile-header';
  header.style.display = 'flex';
  header.style.flexDirection = 'column';
  header.style.alignItems = 'center';
  header.style.marginBottom = '2rem';
  header.style.padding = '2rem';
  header.style.background = 'linear-gradient(to right, #f3f4f6, #e5e7eb)';
  header.style.borderRadius = '12px';
  header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  
  // Profile picture
  const avatarContainer = document.createElement('div');
  avatarContainer.style.position = 'relative';
  avatarContainer.style.marginBottom = '1rem';
  
  const avatar = document.createElement('div');
  avatar.className = 'profile-avatar';
  avatar.style.width = '120px';
  avatar.style.height = '120px';
  avatar.style.borderRadius = '50%';
  avatar.style.backgroundColor = '#4F46E5';
  avatar.style.color = 'white';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.fontSize = '48px';
  avatar.style.fontWeight = 'bold';
  avatar.style.marginBottom = '1rem';
  avatar.style.border = '4px solid white';
  avatar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  avatar.textContent = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U';
  
  const editAvatarButton = document.createElement('button');
  editAvatarButton.className = 'edit-avatar-button';
  editAvatarButton.style.position = 'absolute';
  editAvatarButton.style.bottom = '0';
  editAvatarButton.style.right = '0';
  editAvatarButton.style.width = '36px';
  editAvatarButton.style.height = '36px';
  editAvatarButton.style.borderRadius = '50%';
  editAvatarButton.style.backgroundColor = '#4F46E5';
  editAvatarButton.style.color = 'white';
  editAvatarButton.style.display = 'flex';
  editAvatarButton.style.alignItems = 'center';
  editAvatarButton.style.justifyContent = 'center';
  editAvatarButton.style.border = 'none';
  editAvatarButton.style.cursor = 'pointer';
  editAvatarButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
  
  avatarContainer.appendChild(avatar);
  avatarContainer.appendChild(editAvatarButton);
  
  // User name and info
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';
  userInfo.style.textAlign = 'center';
  
  const userName = document.createElement('h1');
  userName.className = 'user-name';
  userName.textContent = profile.displayName || 'User Profile';
  userName.style.fontSize = '24px';
  userName.style.fontWeight = 'bold';
  userName.style.marginBottom = '0.5rem';
  
  const userRole = document.createElement('p');
  userRole.className = 'user-role';
  userRole.textContent = profile.subscriptionTier ? `${profile.subscriptionTier.toUpperCase()} Member` : 'Free Member';
  userRole.style.color = '#6b7280';
  userRole.style.marginBottom = '1rem';
  
  const userStatistics = document.createElement('div');
  userStatistics.className = 'user-statistics';
  userStatistics.style.display = 'flex';
  userStatistics.style.gap = '2rem';
  userStatistics.style.marginTop = '1rem';
  
  const statsItems = [
    { label: 'Quotes', value: profile.quoteCount || 0 },
    { label: 'Projects', value: profile.projectCount || 0 },
    { label: 'Mentors', value: profile.mentorCount || 0 }
  ];
  
  statsItems.forEach(item => {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    statItem.style.display = 'flex';
    statItem.style.flexDirection = 'column';
    statItem.style.alignItems = 'center';
    
    const statValue = document.createElement('span');
    statValue.className = 'stat-value';
    statValue.textContent = item.value;
    statValue.style.fontSize = '24px';
    statValue.style.fontWeight = 'bold';
    statValue.style.color = '#4F46E5';
    
    const statLabel = document.createElement('span');
    statLabel.className = 'stat-label';
    statLabel.textContent = item.label;
    statLabel.style.fontSize = '14px';
    statLabel.style.color = '#6b7280';
    
    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    userStatistics.appendChild(statItem);
  });
  
  userInfo.appendChild(userName);
  userInfo.appendChild(userRole);
  userInfo.appendChild(userStatistics);
  
  header.appendChild(avatarContainer);
  header.appendChild(userInfo);
  
  // Main content
  const mainContent = document.createElement('div');
  mainContent.className = 'profile-content';
  mainContent.style.display = 'flex';
  mainContent.style.flexDirection = 'column';
  mainContent.style.gap = '2rem';
  mainContent.style.width = '100%';
  
  // Personal Information Section
  const personalInfoSection = createProfileSection('Personal Information', [
    { label: 'Full Name', value: profile.displayName || '', id: 'displayName', type: 'text' },
    { label: 'Email', value: profile.email || '', id: 'email', type: 'email' },
    { label: 'Phone', value: profile.phone || '', id: 'phone', type: 'tel' },
    { label: 'Location', value: profile.location || '', id: 'location', type: 'text' }
  ]);
  
  // Business Information Section
  const businessInfoSection = createProfileSection('Business Information', [
    { label: 'Business Name', value: profile.businessName || '', id: 'businessName', type: 'text' },
    { label: 'Industry', value: profile.industry || '', id: 'industry', type: 'text' },
    { label: 'Experience Level', value: profile.experienceLevel || 'intermediate', id: 'experienceLevel', type: 'select', 
      options: [
        { value: 'junior', label: 'Junior (1-2 years)' },
        { value: 'intermediate', label: 'Intermediate (3-5 years)' },
        { value: 'senior', label: 'Senior (6-10 years)' },
        { value: 'expert', label: 'Expert (10+ years)' }
      ]
    },
    { label: 'Target Profit Margin (%)', value: profile.targetMargin || 30, id: 'targetMargin', type: 'number', min: 0, max: 100 }
  ]);
  
  // Preferences Section
  const preferencesSection = createProfileSection('Preferences', [
    { 
      label: 'Service Preferences', 
      value: profile.servicePreferences || [], 
      id: 'servicePreferences', 
      type: 'checkbox-group',
      options: [
        { value: 'value_oriented', label: 'Value-Oriented Services' },
        { value: 'quality_oriented', label: 'Quality-Oriented Services' },
        { value: 'speed_oriented', label: 'Speed-Oriented Services' },
        { value: 'reliability_oriented', label: 'Reliability-Oriented Services' }
      ]
    },
    { 
      label: 'Business Goals', 
      value: profile.businessGoals || [], 
      id: 'businessGoals', 
      type: 'checkbox-group',
      options: [
        { value: 'increase_revenue', label: 'Increase Revenue' },
        { value: 'find_new_clients', label: 'Find New Clients' },
        { value: 'retain_existing_clients', label: 'Retain Existing Clients' },
        { value: 'expand_services', label: 'Expand Service Offerings' },
        { value: 'improve_efficiency', label: 'Improve Operational Efficiency' }
      ]
    },
    { 
      label: 'Business Challenges', 
      value: profile.businessChallenges || [], 
      id: 'businessChallenges', 
      type: 'checkbox-group',
      options: [
        { value: 'pricing_strategy', label: 'Pricing Strategy' },
        { value: 'finding_clients', label: 'Finding New Clients' },
        { value: 'time_management', label: 'Time Management' },
        { value: 'cash_flow', label: 'Cash Flow Management' },
        { value: 'marketing', label: 'Marketing and Promotion' }
      ]
    }
  ]);
  
  // Income Split Section
  const splitRatio = profile.splitRatio || { needs: 40, investments: 30, savings: 30 };
  const incomeSplitSection = createProfileSection('Income Split Settings', [
    { label: 'Needs (%)', value: splitRatio.needs, id: 'needs', type: 'number', min: 0, max: 100 },
    { label: 'Investments (%)', value: splitRatio.investments, id: 'investments', type: 'number', min: 0, max: 100 },
    { label: 'Savings (%)', value: splitRatio.savings, id: 'savings', type: 'number', min: 0, max: 100 }
  ]);
  
  // Save Button
  const saveButtonContainer = document.createElement('div');
  saveButtonContainer.style.display = 'flex';
  saveButtonContainer.style.justifyContent = 'center';
  saveButtonContainer.style.marginTop = '2rem';
  
  const saveButton = document.createElement('button');
  saveButton.id = 'save-profile-button';
  saveButton.className = 'save-profile-button';
  saveButton.textContent = 'Save Profile';
  saveButton.style.backgroundColor = '#4F46E5';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.padding = '12px 24px';
  saveButton.style.fontSize = '16px';
  saveButton.style.fontWeight = 'bold';
  saveButton.style.cursor = 'pointer';
  saveButton.style.transition = 'background-color 0.3s';
  
  saveButtonContainer.appendChild(saveButton);
  
  // Assemble the profile page
  mainContent.appendChild(personalInfoSection);
  mainContent.appendChild(businessInfoSection);
  mainContent.appendChild(preferencesSection);
  mainContent.appendChild(incomeSplitSection);
  mainContent.appendChild(saveButtonContainer);
  
  container.appendChild(header);
  container.appendChild(mainContent);
}

/**
 * Create a profile section with form fields
 * @param {string} title - Section title
 * @param {Array} fields - Fields configuration
 * @returns {HTMLElement} Section element
 */
function createProfileSection(title, fields) {
  const section = document.createElement('div');
  section.className = 'profile-section';
  section.style.backgroundColor = 'white';
  section.style.borderRadius = '12px';
  section.style.padding = '1.5rem';
  section.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  section.style.marginBottom = '1.5rem';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = title;
  sectionTitle.style.fontSize = '18px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '1rem';
  sectionTitle.style.paddingBottom = '0.5rem';
  sectionTitle.style.borderBottom = '1px solid #e5e7eb';
  
  section.appendChild(sectionTitle);
  
  const fieldList = document.createElement('div');
  fieldList.className = 'field-list';
  fieldList.style.display = 'grid';
  fieldList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  fieldList.style.gap = '1rem';
  
  fields.forEach(field => {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'field-container';
    fieldContainer.style.marginBottom = '1rem';
    
    const label = document.createElement('label');
    label.htmlFor = field.id;
    label.textContent = field.label;
    label.style.display = 'block';
    label.style.marginBottom = '0.5rem';
    label.style.fontWeight = '500';
    
    fieldContainer.appendChild(label);
    
    if (field.type === 'select') {
      const select = document.createElement('select');
      select.id = field.id;
      select.name = field.id;
      select.style.width = '100%';
      select.style.padding = '0.5rem';
      select.style.borderRadius = '4px';
      select.style.border = '1px solid #d1d5db';
      
      field.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        optionElement.selected = field.value === option.value;
        select.appendChild(optionElement);
      });
      
      fieldContainer.appendChild(select);
    } else if (field.type === 'checkbox-group') {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'checkbox-group';
      checkboxContainer.style.display = 'flex';
      checkboxContainer.style.flexDirection = 'column';
      checkboxContainer.style.gap = '0.5rem';
      
      field.options.forEach(option => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.style.display = 'flex';
        checkboxWrapper.style.alignItems = 'center';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${field.id}-${option.value}`;
        checkbox.name = field.id;
        checkbox.value = option.value;
        checkbox.checked = field.value.includes(option.value);
        checkbox.style.marginRight = '0.5rem';
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `${field.id}-${option.value}`;
        checkboxLabel.textContent = option.label;
        checkboxLabel.style.fontSize = '14px';
        
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkboxLabel);
        checkboxContainer.appendChild(checkboxWrapper);
      });
      
      fieldContainer.appendChild(checkboxContainer);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.id = field.id;
      input.name = field.id;
      input.value = field.value;
      input.style.width = '100%';
      input.style.padding = '0.5rem';
      input.style.borderRadius = '4px';
      input.style.border = '1px solid #d1d5db';
      
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      
      fieldContainer.appendChild(input);
    }
    
    fieldList.appendChild(fieldContainer);
  });
  
  section.appendChild(fieldList);
  return section;
}

/**
 * Set up event listeners for the profile page
 * @param {Object} userProfileModule - User profile module
 */
function setupProfileEventListeners(userProfileModule) {
  const saveButton = document.getElementById('save-profile-button');
  if (!saveButton) return;
  
  saveButton.addEventListener('click', async () => {
    try {
      const profileData = collectProfileFormData();
      
      // Validate the income split adds up to 100%
      const splitTotal = profileData.splitRatio.needs + profileData.splitRatio.investments + profileData.splitRatio.savings;
      if (splitTotal !== 100) {
        showError('Income split percentages must add up to 100%');
        return;
      }
      
      const updatedProfile = await userProfileModule.updateUserProfile(profileData);
      
      if (updatedProfile) {
        showSuccess('Profile updated successfully');
      } else {
        showError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Error saving profile: ' + error.message);
    }
  });
}

/**
 * Collect data from profile form fields
 * @returns {Object} Profile data
 */
function collectProfileFormData() {
  const profileData = {
    displayName: document.getElementById('displayName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    location: document.getElementById('location')?.value || '',
    businessName: document.getElementById('businessName')?.value || '',
    industry: document.getElementById('industry')?.value || '',
    experienceLevel: document.getElementById('experienceLevel')?.value || 'intermediate',
    targetMargin: parseInt(document.getElementById('targetMargin')?.value || '30', 10),
    splitRatio: {
      needs: parseInt(document.getElementById('needs')?.value || '40', 10),
      investments: parseInt(document.getElementById('investments')?.value || '30', 10),
      savings: parseInt(document.getElementById('savings')?.value || '30', 10)
    },
    servicePreferences: getCheckboxGroupValues('servicePreferences'),
    businessGoals: getCheckboxGroupValues('businessGoals'),
    businessChallenges: getCheckboxGroupValues('businessChallenges'),
    lastUpdated: new Date().toISOString()
  };
  
  return profileData;
}

/**
 * Get values from a checkbox group
 * @param {string} groupName - Name of the checkbox group
 * @returns {Array} Selected values
 */
function getCheckboxGroupValues(groupName) {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}"]:checked`);
  return Array.from(checkboxes).map(checkbox => checkbox.value);
}

/**
 * Show an error message
 * @param {string} message - Error message
 */
function showError(message) {
  try {
    import('./components/toast.js').then(toast => {
      toast.showToast(message, 'error');
    }).catch(() => {
      // Fallback to window.showToast or alert
      if (window.showToast) {
        window.showToast(message, 'error');
      } else {
        alert(message);
      }
    });
  } catch (e) {
    // If import fails, use fallback
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }
}

/**
 * Show a success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  try {
    import('./components/toast.js').then(toast => {
      toast.showToast(message, 'success');
    }).catch(() => {
      // Fallback to window.showToast or alert
      if (window.showToast) {
        window.showToast(message, 'success');
      } else {
        alert(message);
      }
    });
  } catch (e) {
    // If import fails, use fallback
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      alert(message);
    }
  }
}

export { initializeProfilePage };