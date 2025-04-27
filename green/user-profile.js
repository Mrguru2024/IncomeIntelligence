/**
 * User Profile Module
 * Handles collection, storage, and retrieval of user profile data
 * for personalizing quote generation and service recommendations
 */

// Cached user profile data
let currentUserProfile = null;
let userId = null;

/**
 * Initialize the user profile module
 * @param {string} currentUserId - The current user's ID
 */
export async function initUserProfile(currentUserId) {
  if (!currentUserId) {
    console.error('Cannot initialize user profile without a user ID');
    return null;
  }
  
  userId = currentUserId;
  
  try {
    // Try to fetch existing profile
    const profile = await fetchUserProfile(userId);
    
    if (profile) {
      console.log('User profile loaded:', profile);
      currentUserProfile = profile;
      return profile;
    } else {
      // Create a new profile with default values
      const newProfile = await createDefaultUserProfile(userId);
      console.log('Created new user profile:', newProfile);
      currentUserProfile = newProfile;
      return newProfile;
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
    return null;
  }
}

/**
 * Fetch user profile from server
 * @param {string} profileUserId - User ID to fetch profile for
 * @returns {Object|null} User profile or null if not found
 */
export async function fetchUserProfile(profileUserId) {
  try {
    const response = await fetch(`/api/user-profile/${profileUserId}`);
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return null; // Profile doesn't exist yet
    } else {
      console.error('Error fetching user profile:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Network error fetching user profile:', error);
    return null;
  }
}

/**
 * Create a default user profile
 * @param {string} profileUserId - User ID to create profile for
 * @returns {Object} Newly created user profile
 */
export async function createDefaultUserProfile(profileUserId) {
  try {
    const newProfile = {
      userId: profileUserId,
      experienceLevel: 'intermediate', // Default to intermediate experience level
      targetMargin: 30, // Default 30% target profit margin
      servicePreferences: ['value_oriented', 'reliability_oriented'],
      businessGoals: ['increase_revenue', 'retain_existing_clients'],
      businessChallenges: ['pricing_strategy', 'finding_clients'],
      lastUpdated: new Date().toISOString()
    };
    
    const response = await fetch(`/api/user-profile/${profileUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Error creating user profile:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Network error creating user profile:', error);
    return newProfile; // Use local version if network error
  }
}

/**
 * Update user profile with new data
 * @param {Object} profileUpdates - Object containing profile updates
 * @returns {Object|null} Updated profile or null if failed
 */
export async function updateUserProfile(profileUpdates) {
  if (!userId) {
    console.error('Cannot update profile: No user ID set');
    return null;
  }
  
  try {
    const response = await fetch(`/api/user-profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileUpdates)
    });
    
    if (response.ok) {
      const updatedProfile = await response.json();
      currentUserProfile = updatedProfile;
      return updatedProfile;
    } else {
      console.error('Error updating user profile:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Network error updating user profile:', error);
    return null;
  }
}

/**
 * Add quote to user's quote history
 * @param {Object} quote - The quote object to add to history
 * @returns {Object|null} Updated profile or null if failed
 */
export async function addQuoteToHistory(quote) {
  if (!userId) {
    console.error('Cannot add quote to history: No user ID set');
    return null;
  }
  
  try {
    const quoteData = {
      jobType: quote.jobType,
      jobSubtype: quote.jobSubtype,
      totalAmount: quote.total,
      margin: quote.profitMargin
    };
    
    const response = await fetch(`/api/user-profile/${userId}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    if (response.ok) {
      const updatedProfile = await response.json();
      currentUserProfile = updatedProfile;
      console.log('Quote added to history:', updatedProfile);
      return updatedProfile;
    } else {
      console.error('Error adding quote to history:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Network error adding quote to history:', error);
    return null;
  }
}

/**
 * Get the current user profile
 * @returns {Object|null} Current user profile or null if not loaded
 */
export function getCurrentProfile() {
  return currentUserProfile;
}

/**
 * Customize a quote based on user profile data
 * @param {Object} quoteData - Initial quote data
 * @returns {Object} Personalized quote data
 */
export function personalizeQuote(quoteData) {
  if (!currentUserProfile) {
    console.log('No user profile available, returning standard quote');
    return quoteData;
  }
  
  // Create a deep copy of the quote data to avoid modifying the original
  const personalizedQuote = JSON.parse(JSON.stringify(quoteData));
  
  try {
    // Apply experience level if set in profile
    if (currentUserProfile.experienceLevel) {
      personalizedQuote.experienceLevel = currentUserProfile.experienceLevel;
    }
    
    // Apply target margin if set in profile
    if (currentUserProfile.targetMargin) {
      personalizedQuote.targetMargin = currentUserProfile.targetMargin;
    }
    
    // Adjust service preferences based on profile
    if (currentUserProfile.servicePreferences) {
      // If user is value-oriented, slightly decrease labor rate
      if (currentUserProfile.servicePreferences.includes('value_oriented')) {
        personalizedQuote.laborRate = Math.max(personalizedQuote.laborRate * 0.95, personalizedQuote.laborRate - 5);
      }
      
      // If user is quality-oriented, slightly increase labor rate and premium options
      if (currentUserProfile.servicePreferences.includes('quality_oriented')) {
        personalizedQuote.laborRate = personalizedQuote.laborRate * 1.1;
        personalizedQuote.materialsCost = personalizedQuote.materialsCost * 1.15;
      }
      
      // If user is speed-oriented, slightly increase labor rate (premium for speed)
      if (currentUserProfile.servicePreferences.includes('speed_oriented')) {
        personalizedQuote.laborRate = personalizedQuote.laborRate * 1.08;
      }
    }
    
    // Use preferred job types to influence quote if applicable
    if (currentUserProfile.preferredJobTypes && currentUserProfile.preferredJobTypes.length > 0) {
      // If this job type is one of user's frequent types, apply a small discount
      if (currentUserProfile.preferredJobTypes.includes(personalizedQuote.jobType)) {
        personalizedQuote.loyaltyDiscount = 0.05; // 5% discount for frequent service types
      }
    }
    
    console.log('Personalized quote based on user profile:', personalizedQuote);
    return personalizedQuote;
  } catch (error) {
    console.error('Error personalizing quote:', error);
    return quoteData; // Return original quote if personalization fails
  }
}

/**
 * Creates and shows the user profile editor UI
 * @param {Function} onSave - Callback function when profile is saved
 */
export function showProfileEditor(onSave) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
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
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.padding = '24px';
  modalContent.style.width = '90%';
  modalContent.style.maxWidth = '600px';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflowY = 'auto';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '16px';
  closeButton.style.right = '16px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'transparent';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#666';
  closeButton.onclick = () => {
    document.body.removeChild(modal);
  };
  
  // Create header
  const header = document.createElement('h2');
  header.textContent = 'Your Business Profile';
  header.style.marginTop = '0';
  header.style.color = 'var(--color-text, #333)';
  
  // Create form
  const form = document.createElement('form');
  form.id = 'profileForm';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '16px';
  
  // Get current profile data or defaults
  const profile = currentUserProfile || {};
  
  // Business Name field
  const businessNameGroup = createFormGroup('Business Name', 'businessName', profile.businessName || '', 'text');
  
  // Experience Level field
  const experienceLevelOptions = [
    { value: 'junior', label: 'Junior (1-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];
  const experienceLevelGroup = createSelectGroup('Experience Level', 'experienceLevel', profile.experienceLevel || 'intermediate', experienceLevelOptions);
  
  // Industry field
  const industryOptions = [
    { value: 'home_services', label: 'Home Services' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'beauty_wellness', label: 'Beauty & Wellness' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'electronics_repair', label: 'Electronics Repair' },
    { value: 'construction', label: 'Construction' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'education_training', label: 'Education & Training' },
    { value: 'other', label: 'Other' }
  ];
  const industryGroup = createSelectGroup('Industry', 'serviceIndustry', profile.serviceIndustry || 'home_services', industryOptions);
  
  // Target Margin slider
  const targetMarginGroup = createRangeGroup('Target Profit Margin', 'targetMargin', profile.targetMargin || 30, 0, 80, 5, '%');
  
  // Business Goals checkboxes
  const goalsOptions = [
    { value: 'increase_revenue', label: 'Increase Revenue' },
    { value: 'reduce_costs', label: 'Reduce Costs' },
    { value: 'expand_services', label: 'Expand Services' },
    { value: 'improve_efficiency', label: 'Improve Efficiency' },
    { value: 'attract_new_clients', label: 'Attract New Clients' },
    { value: 'retain_existing_clients', label: 'Retain Existing Clients' },
    { value: 'enter_new_markets', label: 'Enter New Markets' },
    { value: 'improve_quality', label: 'Improve Quality' },
    { value: 'build_brand', label: 'Build Brand' }
  ];
  const goalsGroup = createCheckboxGroup('Business Goals', 'businessGoals', profile.businessGoals || [], goalsOptions);
  
  // Business Challenges checkboxes
  const challengesOptions = [
    { value: 'limited_budget', label: 'Limited Budget' },
    { value: 'time_constraints', label: 'Time Constraints' },
    { value: 'competitive_market', label: 'Competitive Market' },
    { value: 'finding_clients', label: 'Finding Clients' },
    { value: 'pricing_strategy', label: 'Pricing Strategy' },
    { value: 'skilled_labor_shortage', label: 'Skilled Labor Shortage' },
    { value: 'equipment_costs', label: 'Equipment Costs' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'seasonality', label: 'Seasonality' }
  ];
  const challengesGroup = createCheckboxGroup('Business Challenges', 'businessChallenges', profile.businessChallenges || [], challengesOptions);
  
  // Service Preferences radio buttons
  const preferencesOptions = [
    { value: 'value_oriented', label: 'Value Oriented (Budget-friendly solutions)' },
    { value: 'quality_oriented', label: 'Quality Oriented (Premium solutions)' },
    { value: 'speed_oriented', label: 'Speed Oriented (Quick turnaround time)' },
    { value: 'reliability_oriented', label: 'Reliability Oriented (Consistent results)' },
    { value: 'relationship_oriented', label: 'Relationship Oriented (Building long-term clients)' },
    { value: 'detail_oriented', label: 'Detail Oriented (Precision and exactness)' }
  ];
  const preferencesGroup = createRadioGroup('Service Preference', 'servicePreferences', profile.servicePreferences?.[0] || 'value_oriented', preferencesOptions);
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Save Profile';
  saveButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '4px';
  saveButton.style.padding = '12px';
  saveButton.style.fontSize = '16px';
  saveButton.style.cursor = 'pointer';
  saveButton.style.marginTop = '16px';
  
  // Add all elements to form
  form.appendChild(businessNameGroup);
  form.appendChild(industryGroup);
  form.appendChild(experienceLevelGroup);
  form.appendChild(targetMarginGroup);
  form.appendChild(preferencesGroup);
  form.appendChild(goalsGroup);
  form.appendChild(challengesGroup);
  form.appendChild(saveButton);
  
  // Set up form submission
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const profileData = {
      businessName: formData.get('businessName'),
      experienceLevel: formData.get('experienceLevel'),
      serviceIndustry: formData.get('serviceIndustry'),
      targetMargin: parseInt(formData.get('targetMargin')),
      servicePreferences: [formData.get('servicePreferences')],
      businessGoals: Array.from(formData.getAll('businessGoals')),
      businessChallenges: Array.from(formData.getAll('businessChallenges'))
    };
    
    try {
      // Update the profile
      const updatedProfile = await updateUserProfile(profileData);
      
      if (updatedProfile) {
        // Show success message
        if (window.showToast) {
          window.showToast('Profile updated successfully', 'success');
        } else {
          alert('Profile updated successfully');
        }
        
        // Call callback function if provided
        if (typeof onSave === 'function') {
          onSave(updatedProfile);
        }
        
        // Close modal
        document.body.removeChild(modal);
      } else {
        // Show error message
        if (window.showToast) {
          window.showToast('Failed to update profile', 'error');
        } else {
          alert('Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (window.showToast) {
        window.showToast('Error saving profile', 'error');
      } else {
        alert('Error saving profile');
      }
    }
  };
  
  // Add all elements to modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(header);
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  
  // Add modal to document
  document.body.appendChild(modal);
}

/**
 * Create a form group with label and input
 * @param {string} labelText - Label text
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {string} type - Input type
 * @returns {HTMLElement} Form group element
 */
function createFormGroup(labelText, name, value, type = 'text') {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '12px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = name;
  label.style.display = 'block';
  label.style.marginBottom = '4px';
  label.style.fontWeight = '500';
  
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.id = name;
  input.value = value || '';
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.borderRadius = '4px';
  input.style.border = '1px solid #ccc';
  
  group.appendChild(label);
  group.appendChild(input);
  
  return group;
}

/**
 * Create a select form group
 * @param {string} labelText - Label text
 * @param {string} name - Select name
 * @param {string} value - Selected value
 * @param {Array} options - Select options array of {value, label} objects
 * @returns {HTMLElement} Form group element
 */
function createSelectGroup(labelText, name, value, options) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '12px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = name;
  label.style.display = 'block';
  label.style.marginBottom = '4px';
  label.style.fontWeight = '500';
  
  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  select.style.width = '100%';
  select.style.padding = '8px';
  select.style.borderRadius = '4px';
  select.style.border = '1px solid #ccc';
  
  options.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    if (option.value === value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });
  
  group.appendChild(label);
  group.appendChild(select);
  
  return group;
}

/**
 * Create a range slider form group
 * @param {string} labelText - Label text
 * @param {string} name - Input name
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step increment
 * @param {string} unit - Unit suffix
 * @returns {HTMLElement} Form group element
 */
function createRangeGroup(labelText, name, value, min, max, step, unit = '') {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '12px';
  
  const labelContainer = document.createElement('div');
  labelContainer.style.display = 'flex';
  labelContainer.style.justifyContent = 'space-between';
  labelContainer.style.marginBottom = '4px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = name;
  label.style.fontWeight = '500';
  
  const valueDisplay = document.createElement('span');
  valueDisplay.id = `${name}-value`;
  valueDisplay.textContent = `${value}${unit}`;
  
  const input = document.createElement('input');
  input.type = 'range';
  input.name = name;
  input.id = name;
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.style.width = '100%';
  
  input.oninput = () => {
    valueDisplay.textContent = `${input.value}${unit}`;
  };
  
  labelContainer.appendChild(label);
  labelContainer.appendChild(valueDisplay);
  
  group.appendChild(labelContainer);
  group.appendChild(input);
  
  return group;
}

/**
 * Create a checkbox group
 * @param {string} labelText - Group label text
 * @param {string} name - Checkbox name (will be array)
 * @param {Array} selectedValues - Array of selected values
 * @param {Array} options - Options array of {value, label} objects
 * @returns {HTMLElement} Form group element
 */
function createCheckboxGroup(labelText, name, selectedValues = [], options) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '16px';
  
  const groupLabel = document.createElement('label');
  groupLabel.textContent = labelText;
  groupLabel.style.display = 'block';
  groupLabel.style.marginBottom = '8px';
  groupLabel.style.fontWeight = '500';
  
  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.display = 'grid';
  checkboxContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
  checkboxContainer.style.gap = '8px';
  
  options.forEach(option => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style.display = 'flex';
    checkboxWrapper.style.alignItems = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = name;
    checkbox.id = `${name}-${option.value}`;
    checkbox.value = option.value;
    checkbox.checked = selectedValues.includes(option.value);
    checkbox.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = `${name}-${option.value}`;
    label.textContent = option.label;
    label.style.cursor = 'pointer';
    
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    checkboxContainer.appendChild(checkboxWrapper);
  });
  
  group.appendChild(groupLabel);
  group.appendChild(checkboxContainer);
  
  return group;
}

/**
 * Create a radio button group
 * @param {string} labelText - Group label text
 * @param {string} name - Radio group name
 * @param {string} selectedValue - Selected radio value
 * @param {Array} options - Options array of {value, label} objects
 * @returns {HTMLElement} Form group element
 */
function createRadioGroup(labelText, name, selectedValue, options) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '16px';
  
  const groupLabel = document.createElement('label');
  groupLabel.textContent = labelText;
  groupLabel.style.display = 'block';
  groupLabel.style.marginBottom = '8px';
  groupLabel.style.fontWeight = '500';
  
  const radioContainer = document.createElement('div');
  radioContainer.style.display = 'flex';
  radioContainer.style.flexDirection = 'column';
  radioContainer.style.gap = '8px';
  
  options.forEach(option => {
    const radioWrapper = document.createElement('div');
    radioWrapper.style.display = 'flex';
    radioWrapper.style.alignItems = 'center';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.id = `${name}-${option.value}`;
    radio.value = option.value;
    radio.checked = option.value === selectedValue;
    radio.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = `${name}-${option.value}`;
    label.textContent = option.label;
    label.style.cursor = 'pointer';
    
    radioWrapper.appendChild(radio);
    radioWrapper.appendChild(label);
    radioContainer.appendChild(radioWrapper);
  });
  
  group.appendChild(groupLabel);
  group.appendChild(radioContainer);
  
  return group;
}