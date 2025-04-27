/**
 * Quote Generator Module - Simple Version
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

// Define regional market rates for different job types
const marketRates = {
  "locksmith": {
    "northeast": 95,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 100
  },
  "plumber": {
    "northeast": 110,
    "midwest": 90,
    "southeast": 85,
    "southwest": 95,
    "west": 120
  },
  "electrician": {
    "northeast": 105,
    "midwest": 85,
    "southeast": 80,
    "southwest": 90,
    "west": 115
  },
  "carpenter": {
    "northeast": 95,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 100
  },
  "hvac": {
    "northeast": 115,
    "midwest": 95,
    "southeast": 90,
    "southwest": 100,
    "west": 125
  },
  "painter": {
    "northeast": 80,
    "midwest": 65,
    "southeast": 60,
    "southwest": 70,
    "west": 85
  },
  "general_contractor": {
    "northeast": 120,
    "midwest": 100,
    "southeast": 95,
    "southwest": 105,
    "west": 130
  },
  "landscaper": {
    "northeast": 85,
    "midwest": 70,
    "southeast": 65,
    "southwest": 75,
    "west": 90
  },
  "roofer": {
    "northeast": 100,
    "midwest": 85,
    "southeast": 80,
    "southwest": 90,
    "west": 110
  },
  "flooring_specialist": {
    "northeast": 90,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 95
  },
  "window_installer": {
    "northeast": 95,
    "midwest": 80,
    "southeast": 75,
    "southwest": 85,
    "west": 100
  },
  "appliance_repair": {
    "northeast": 90,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 95
  },
  "pool_service": {
    "northeast": 85,
    "midwest": 70,
    "southeast": 75,
    "southwest": 85,
    "west": 90
  },
  "handyman": {
    "northeast": 75,
    "midwest": 60,
    "southeast": 55,
    "southwest": 65,
    "west": 80
  },
  "fence_installer": {
    "northeast": 85,
    "midwest": 70,
    "southeast": 65,
    "southwest": 75,
    "west": 90
  },
  "pest_control": {
    "northeast": 80,
    "midwest": 65,
    "southeast": 60,
    "southwest": 70,
    "west": 85
  },
  "automotive_repair": {
    "northeast": 110,
    "midwest": 90,
    "southeast": 85,
    "southwest": 95,
    "west": 115
  },
  "electronic_repair": {
    "northeast": 95,
    "midwest": 80,
    "southeast": 75,
    "southwest": 85,
    "west": 100
  },
  "cellphone_repair": {
    "northeast": 85,
    "midwest": 70,
    "southeast": 65,
    "southwest": 75,
    "west": 90
  },
  "computer_repair": {
    "northeast": 90,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 95
  },
  "tv_repair": {
    "northeast": 100,
    "midwest": 85,
    "southeast": 80,
    "southwest": 90,
    "west": 105
  },
  "beauty_services": {
    "northeast": 85,
    "midwest": 70,
    "southeast": 65,
    "southwest": 75,
    "west": 90
  },
  "photography": {
    "northeast": 125,
    "midwest": 100,
    "southeast": 95,
    "southwest": 110,
    "west": 135
  },
  "graphic_design": {
    "northeast": 115,
    "midwest": 95,
    "southeast": 90,
    "southwest": 100,
    "west": 125
  },
  "catering": {
    "northeast": 95,
    "midwest": 80,
    "southeast": 75,
    "southwest": 85,
    "west": 100
  },
  "interior_design": {
    "northeast": 110,
    "midwest": 90,
    "southeast": 85,
    "southwest": 95,
    "west": 120
  },
  "moving_services": {
    "northeast": 100,
    "midwest": 85,
    "southeast": 80,
    "southwest": 90,
    "west": 110
  },
  "cleaning_services": {
    "northeast": 80,
    "midwest": 65,
    "southeast": 60,
    "southwest": 70,
    "west": 85
  }
};

// State tax rates (simplified)
const stateTaxRates = {
  "AL": 0.04, "AK": 0.00, "AZ": 0.056, "AR": 0.065, "CA": 0.0725, "CO": 0.029, "CT": 0.0635, 
  "DE": 0.00, "DC": 0.06, "FL": 0.06, "GA": 0.04, "HI": 0.04, "ID": 0.06, "IL": 0.0625, 
  "IN": 0.07, "IA": 0.06, "KS": 0.065, "KY": 0.06, "LA": 0.0445, "ME": 0.055, "MD": 0.06, 
  "MA": 0.0625, "MI": 0.06, "MN": 0.06875, "MS": 0.07, "MO": 0.04225, "MT": 0.00, "NE": 0.055, 
  "NV": 0.0685, "NH": 0.00, "NJ": 0.066, "NM": 0.05125, "NY": 0.04, "NC": 0.0475, "ND": 0.05, 
  "OH": 0.0575, "OK": 0.045, "OR": 0.00, "PA": 0.06, "RI": 0.07, "SC": 0.06, "SD": 0.045, 
  "TN": 0.07, "TX": 0.0625, "UT": 0.0595, "VT": 0.06, "VA": 0.053, "WA": 0.065, "WV": 0.06, 
  "WI": 0.05, "WY": 0.04
};

// State to region mapping
const stateToRegion = {
  "ME": "northeast", "NH": "northeast", "VT": "northeast", "MA": "northeast", "RI": "northeast", 
  "CT": "northeast", "NY": "northeast", "NJ": "northeast", "PA": "northeast", "DE": "northeast", 
  "MD": "northeast", "DC": "northeast", "OH": "midwest", "MI": "midwest", "IN": "midwest", 
  "WI": "midwest", "IL": "midwest", "MN": "midwest", "IA": "midwest", "MO": "midwest", 
  "ND": "midwest", "SD": "midwest", "NE": "midwest", "KS": "midwest", "VA": "southeast", 
  "WV": "southeast", "KY": "southeast", "NC": "southeast", "SC": "southeast", "TN": "southeast", 
  "GA": "southeast", "FL": "southeast", "AL": "southeast", "MS": "southeast", "AR": "southeast", 
  "LA": "southeast", "TX": "southwest", "OK": "southwest", "NM": "southwest", "AZ": "southwest", 
  "MT": "west", "ID": "west", "WY": "west", "CO": "west", "UT": "west", "NV": "west", 
  "CA": "west", "OR": "west", "WA": "west", "AK": "west", "HI": "west"
};

/**
 * Main function to render the quote generator page
 * @param {string} containerId - The ID of the container to render the page in
 */
function renderQuoteGeneratorPage(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }
    
    container.innerHTML = '';
    container.className = 'quote-generator-container';
    container.style.fontFamily = 'var(--font-family)';
    
    // Create header section
    const header = document.createElement('div');
    header.className = 'quote-generator-header';
    header.style.marginBottom = '24px';
    
    const title = document.createElement('h2');
    title.textContent = 'Professional Quote Generator';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Create accurate, profitable quotes for your service business.';
    subtitle.style.fontSize = '16px';
    subtitle.style.color = 'var(--color-text-secondary)';
    
    header.appendChild(title);
    header.appendChild(subtitle);
    container.appendChild(header);
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'quote-form-container';
    formContainer.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
    formContainer.style.borderRadius = '8px';
    formContainer.style.padding = '24px';
    formContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    formContainer.style.marginBottom = '32px';
    
    // Create form
    const form = document.createElement('form');
    form.id = 'quote-form';
    form.style.display = 'grid';
    form.style.gap = '16px';
    
    // Job type field
    const jobTypeGroup = createFormGroup('Service Type', createSelect('jobType', [
      { value: 'locksmith', label: 'Locksmith Services' },
      { value: 'plumber', label: 'Plumbing Services' },
      { value: 'electrician', label: 'Electrical Services' },
      { value: 'carpenter', label: 'Carpentry Services' },
      { value: 'hvac', label: 'HVAC Services' },
      { value: 'painter', label: 'Painting Services' },
      { value: 'general_contractor', label: 'General Contracting' },
      { value: 'landscaper', label: 'Landscaping Services' },
      { value: 'roofer', label: 'Roofing Services' },
      { value: 'flooring_specialist', label: 'Flooring Services' },
      { value: 'window_installer', label: 'Window Installation' },
      { value: 'appliance_repair', label: 'Appliance Repair' },
      { value: 'pool_service', label: 'Pool Services' },
      { value: 'handyman', label: 'Handyman Services' },
      { value: 'fence_installer', label: 'Fence Installation' },
      { value: 'pest_control', label: 'Pest Control Services' },
      { value: 'automotive_repair', label: 'Automotive Repair' },
      { value: 'electronic_repair', label: 'Electronic Repair (General)' },
      { value: 'cellphone_repair', label: 'Cellphone Repair' },
      { value: 'computer_repair', label: 'Computer Repair' },
      { value: 'tv_repair', label: 'TV Repair' },
      { value: 'beauty_services', label: 'Beauty Services' },
      { value: 'photography', label: 'Photography Services' },
      { value: 'graphic_design', label: 'Graphic Design' },
      { value: 'catering', label: 'Catering Services' },
      { value: 'interior_design', label: 'Interior Design' },
      { value: 'moving_services', label: 'Moving Services' },
      { value: 'cleaning_services', label: 'Cleaning Services' }
    ]));
    
    // Location field
    const locationInput = createInput('text', 'location', '', 'ZIP code or City, State');
    locationInput.id = 'auto-address-input'; // Add ID for Google Maps autocomplete
    const locationGroup = createFormGroup('Location', locationInput);
    
    // Labor hours field
    const laborHoursGroup = createFormGroup('Labor Hours', createInput('number', 'laborHours', '1', 'Estimated hours', '0.5', '100', '0.5'));
    
    // Materials cost field
    const materialsGroup = createFormGroup('Materials Cost ($)', createInput('number', 'materialsCost', '0', 'Cost in dollars', '0', '10000', '0.01'));
    
    // Emergency service checkbox
    const emergencyGroup = document.createElement('div');
    emergencyGroup.className = 'form-check';
    emergencyGroup.style.display = 'flex';
    emergencyGroup.style.alignItems = 'center';
    
    const emergencyCheckbox = createInput('checkbox', 'emergency');
    emergencyCheckbox.style.width = 'auto';
    emergencyCheckbox.style.marginRight = '8px';
    
    const emergencyLabel = document.createElement('label');
    emergencyLabel.textContent = 'Emergency Service (after hours/weekend)';
    emergencyLabel.style.fontSize = '14px';
    
    emergencyGroup.appendChild(emergencyCheckbox);
    emergencyGroup.appendChild(emergencyLabel);
    
    // Target profit margin field
    const marginGroup = createFormGroup('Target Profit Margin (%)', createInput('range', 'targetMargin', '25', '', '10', '50', '1'));
    const marginValue = document.createElement('div');
    marginValue.textContent = '25%';
    marginValue.style.textAlign = 'right';
    marginValue.style.fontSize = '14px';
    marginGroup.appendChild(marginValue);
    
    // Update margin value display when slider changes
    const marginInput = marginGroup.querySelector('input');
    marginInput.addEventListener('input', (e) => {
      marginValue.textContent = `${e.target.value}%`;
    });
    
    // Add fields to form
    form.appendChild(jobTypeGroup);
    form.appendChild(locationGroup);
    form.appendChild(laborHoursGroup);
    form.appendChild(materialsGroup);
    form.appendChild(emergencyGroup);
    form.appendChild(marginGroup);
    
    // Create button group
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '12px';
    buttonGroup.style.marginTop = '16px';
    
    // Generate quote button
    const generateButton = document.createElement('button');
    generateButton.type = 'button';
    generateButton.textContent = 'Generate Quote';
    generateButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
    generateButton.style.color = 'white';
    generateButton.style.border = 'none';
    generateButton.style.borderRadius = '6px';
    generateButton.style.padding = '12px 20px';
    generateButton.style.fontSize = '16px';
    generateButton.style.fontWeight = 'bold';
    generateButton.style.cursor = 'pointer';
    generateButton.style.flex = '1';
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Reset';
    resetButton.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
    resetButton.style.color = 'var(--color-text, #111827)';
    resetButton.style.border = '1px solid var(--color-border, #E5E7EB)';
    resetButton.style.borderRadius = '6px';
    resetButton.style.padding = '12px 20px';
    resetButton.style.fontSize = '16px';
    resetButton.style.cursor = 'pointer';
    
    // Add buttons to group
    buttonGroup.appendChild(generateButton);
    buttonGroup.appendChild(resetButton);
    form.appendChild(buttonGroup);
    
    // Add form to container
    formContainer.appendChild(form);
    container.appendChild(formContainer);
    
    // Create results container (initially hidden)
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'quote-results';
    resultsContainer.style.display = 'none';
    resultsContainer.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
    resultsContainer.style.borderRadius = '8px';
    resultsContainer.style.padding = '24px';
    resultsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    container.appendChild(resultsContainer);
    
    // Add event listeners
    generateButton.addEventListener('click', handleGenerateQuote);
    resetButton.addEventListener('click', () => {
      form.reset();
      marginValue.textContent = '25%';
      resultsContainer.style.display = 'none';
    });
    
    // Initialize Google Maps autocomplete if available
    initGoogleMapsAutocomplete();
    
    console.log('Quote Generator page rendered successfully');
  } catch (error) {
    console.error('Error rendering Quote Generator page:', error);
    throw error;
  }
}

/**
 * Initialize Google Maps Autocomplete for the location field
 */
function initGoogleMapsAutocomplete() {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || 
        typeof google.maps.places === 'undefined') {
      console.log('Google Maps Places API not loaded yet, will try again shortly');
      
      // Try again in 1 second
      setTimeout(initGoogleMapsAutocomplete, 1000);
      return;
    }

    const addressInput = document.getElementById('auto-address-input');
    if (!addressInput) {
      console.error('Address input field not found');
      return;
    }

    console.log('Initializing Google Maps autocomplete for address input');
    
    // Create the autocomplete object
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    
    // Set fields to get formatted address and state
    autocomplete.setFields(['formatted_address', 'address_components']);
    
    // Add listener for place changed event
    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      
      if (!place.address_components) {
        console.error('No address details available for this place');
        return;
      }
      
      // Update the input field with the formatted address
      addressInput.value = place.formatted_address;
      
      // Trigger an input event to update any validators
      const event = new Event('input', { bubbles: true });
      addressInput.dispatchEvent(event);
      
      console.log('Address selected:', place.formatted_address);
    });
    
    console.log('Google Maps autocomplete initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Maps autocomplete:', error);
    // Don't throw error to avoid breaking the entire application
  }
}

/**
 * Handle quote generation when the button is clicked
 */
function handleGenerateQuote() {
  try {
    // Get form values
    const jobTypeSelect = document.querySelector('#quote-form select[name="jobType"]');
    const locationInput = document.querySelector('#quote-form input[name="location"]');
    const laborHoursInput = document.querySelector('#quote-form input[name="laborHours"]');
    const materialsCostInput = document.querySelector('#quote-form input[name="materialsCost"]');
    const emergencyCheckbox = document.querySelector('#quote-form input[name="emergency"]');
    const targetMarginInput = document.querySelector('#quote-form input[name="targetMargin"]');
    
    // Validate required fields
    if (!jobTypeSelect.value) {
      showToast('Please select a service type', 'error');
      jobTypeSelect.focus();
      return;
    }
    
    if (!locationInput.value) {
      showToast('Please enter a location', 'error');
      locationInput.focus();
      return;
    }
    
    if (!laborHoursInput.value || parseFloat(laborHoursInput.value) <= 0) {
      showToast('Please enter valid labor hours', 'error');
      laborHoursInput.focus();
      return;
    }
    
    // Collect form data
    const formData = {
      jobType: jobTypeSelect.value,
      location: locationInput.value,
      laborHours: parseFloat(laborHoursInput.value),
      materialsCost: parseFloat(materialsCostInput.value) || 0,
      emergency: emergencyCheckbox.checked,
      targetMargin: parseInt(targetMarginInput.value)
    };
    
    // Generate the quote
    const quoteResult = generateQuote(formData);
    
    // Display the results
    displayQuoteResults(quoteResult);
    
    // Show success message
    showToast('Quote generated successfully', 'success');
  } catch (error) {
    console.error('Error generating quote:', error);
    showToast('Error generating quote: ' + error.message, 'error');
  }
}

/**
 * Generate a quote based on the provided data
 * @param {Object} data - The quote data
 * @returns {Object} The quote result
 */
function generateQuote(data) {
  // Extract state from location
  const state = getStateFromLocation(data.location);
  
  // Get region and rates
  const region = stateToRegion[state] || 'northeast';
  const baseRate = marketRates[data.jobType]?.[region] || 85; // Default rate if not found
  const taxRate = stateTaxRates[state] || 0.06; // Default 6% if not found
  
  // Calculate labor cost with emergency premium if applicable
  let laborRate = baseRate;
  if (data.emergency) {
    laborRate *= 1.5; // 50% premium for emergency service
  }
  
  const laborCost = laborRate * data.laborHours;
  
  // Calculate materials cost with tax
  const materialsCost = data.materialsCost;
  const materialsTax = materialsCost * taxRate;
  
  // Calculate subtotal and total
  const subtotal = laborCost + materialsCost;
  const total = subtotal + materialsTax;
  
  // Calculate profit based on target margin
  const targetMarginDecimal = data.targetMargin / 100;
  const cost = subtotal / (1 - targetMarginDecimal);
  const profit = total - cost;
  const actualProfitMargin = (profit / total) * 100;
  
  // Profit assessment
  let profitAssessment;
  if (actualProfitMargin < 15) {
    profitAssessment = 'Low profit margin. Consider reducing costs or increasing prices.';
  } else if (actualProfitMargin < 25) {
    profitAssessment = 'Acceptable profit margin, but could be improved.';
  } else {
    profitAssessment = 'Good profit margin. This quote should be profitable.';
  }
  
  return {
    jobType: data.jobType,
    jobTypeDisplay: getJobTypeDisplay(data.jobType),
    location: data.location,
    state,
    region,
    laborHours: data.laborHours,
    laborRate,
    laborCost,
    materialsCost,
    materialsTax,
    emergency: data.emergency,
    subtotal,
    total,
    targetMargin: data.targetMargin,
    actualProfitMargin,
    profit,
    profitAssessment,
    taxRate
  };
}

/**
 * Display the quote results in the UI
 * @param {Object} result - The quote result
 */
function displayQuoteResults(result) {
  const resultsContainer = document.getElementById('quote-results');
  resultsContainer.style.display = 'block';
  resultsContainer.innerHTML = '';
  
  // Create header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  const title = document.createElement('h3');
  title.textContent = 'Quote Summary';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = `${result.jobTypeDisplay} in ${result.location}`;
  subtitle.style.fontSize = '16px';
  subtitle.style.color = 'var(--color-text-secondary)';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  resultsContainer.appendChild(header);
  
  // Create breakdown
  const breakdown = document.createElement('div');
  breakdown.style.marginBottom = '24px';
  
  const breakdownTitle = document.createElement('h4');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '16px';
  breakdownTitle.style.fontWeight = 'bold';
  breakdownTitle.style.marginBottom = '12px';
  
  breakdown.appendChild(breakdownTitle);
  
  // Add breakdown items
  const breakdownItems = [
    {
      label: `Labor (${result.laborHours} hrs @ $${result.laborRate.toFixed(2)}/hr)${result.emergency ? ' (Emergency)' : ''}`,
      value: result.laborCost
    },
    {
      label: 'Materials',
      value: result.materialsCost
    },
    {
      label: 'Subtotal',
      value: result.subtotal
    },
    {
      label: `Tax (${(result.taxRate * 100).toFixed(2)}%)`,
      value: result.materialsTax
    },
    {
      label: 'Total',
      value: result.total,
      isTotal: true
    }
  ];
  
  const itemsContainer = document.createElement('div');
  
  breakdownItems.forEach(item => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.padding = '8px 0';
    
    if (item.isTotal) {
      row.style.borderTop = '1px solid var(--color-border)';
      row.style.marginTop = '8px';
      row.style.paddingTop = '16px';
      row.style.fontWeight = 'bold';
    } else {
      row.style.borderBottom = '1px solid var(--color-border-light, #f3f4f6)';
    }
    
    const label = document.createElement('span');
    label.textContent = item.label;
    
    const value = document.createElement('span');
    value.textContent = `$${item.value.toFixed(2)}`;
    
    row.appendChild(label);
    row.appendChild(value);
    itemsContainer.appendChild(row);
  });
  
  breakdown.appendChild(itemsContainer);
  resultsContainer.appendChild(breakdown);
  
  // Add profit analysis (only visible to the service provider)
  const profitAnalysis = document.createElement('div');
  profitAnalysis.style.marginTop = '24px';
  profitAnalysis.style.padding = '16px';
  profitAnalysis.style.backgroundColor = 'rgba(249, 250, 251, 0.8)';
  profitAnalysis.style.borderRadius = '6px';
  profitAnalysis.style.border = '1px solid var(--color-border)';
  
  const profitTitle = document.createElement('h4');
  profitTitle.textContent = 'Profit Analysis';
  profitTitle.style.fontSize = '16px';
  profitTitle.style.fontWeight = 'bold';
  profitTitle.style.marginBottom = '12px';
  
  const profitDetails = document.createElement('div');
  profitDetails.style.marginBottom = '12px';
  
  // Profit margin comparison
  const marginRow = document.createElement('div');
  marginRow.style.display = 'flex';
  marginRow.style.justifyContent = 'space-between';
  marginRow.style.marginBottom = '8px';
  
  const targetLabel = document.createElement('span');
  targetLabel.textContent = 'Target Profit Margin:';
  
  const targetValue = document.createElement('span');
  targetValue.textContent = `${result.targetMargin}%`;
  
  marginRow.appendChild(targetLabel);
  marginRow.appendChild(targetValue);
  profitDetails.appendChild(marginRow);
  
  // Actual margin
  const actualRow = document.createElement('div');
  actualRow.style.display = 'flex';
  actualRow.style.justifyContent = 'space-between';
  
  const actualLabel = document.createElement('span');
  actualLabel.textContent = 'Actual Profit Margin:';
  
  const actualValue = document.createElement('span');
  actualValue.textContent = `${result.actualProfitMargin.toFixed(1)}%`;
  actualValue.style.fontWeight = 'bold';
  
  // Color code based on profit margin
  if (result.actualProfitMargin < 15) {
    actualValue.style.color = '#dc2626'; // Red
  } else if (result.actualProfitMargin < 25) {
    actualValue.style.color = '#ea580c'; // Orange
  } else {
    actualValue.style.color = '#16a34a'; // Green
  }
  
  actualRow.appendChild(actualLabel);
  actualRow.appendChild(actualValue);
  profitDetails.appendChild(actualRow);
  
  // Profit assessment message
  const assessment = document.createElement('p');
  assessment.textContent = result.profitAssessment;
  assessment.style.marginTop = '12px';
  assessment.style.padding = '8px 12px';
  assessment.style.fontSize = '14px';
  assessment.style.borderRadius = '4px';
  
  // Style based on assessment
  if (result.actualProfitMargin < 15) {
    assessment.style.backgroundColor = '#fee2e2'; // Light red
  } else if (result.actualProfitMargin < 25) {
    assessment.style.backgroundColor = '#fef3c7'; // Light yellow
  } else {
    assessment.style.backgroundColor = '#ecfdf5'; // Light green
  }
  
  profitAnalysis.appendChild(profitTitle);
  profitAnalysis.appendChild(profitDetails);
  profitAnalysis.appendChild(assessment);
  resultsContainer.appendChild(profitAnalysis);
  
  // Add action buttons
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '12px';
  actions.style.marginTop = '24px';
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Quote';
  saveButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.padding = '10px 16px';
  saveButton.style.fontSize = '14px';
  saveButton.style.fontWeight = 'bold';
  saveButton.style.cursor = 'pointer';
  saveButton.style.flex = '1';
  
  saveButton.addEventListener('click', () => {
    saveQuote(result);
  });
  
  // Print button
  const printButton = document.createElement('button');
  printButton.textContent = 'Print Quote';
  printButton.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
  printButton.style.color = 'var(--color-text, #111827)';
  printButton.style.border = '1px solid var(--color-border, #E5E7EB)';
  printButton.style.borderRadius = '6px';
  printButton.style.padding = '10px 16px';
  printButton.style.fontSize = '14px';
  printButton.style.cursor = 'pointer';
  printButton.style.flex = '1';
  
  printButton.addEventListener('click', () => {
    printQuote(result);
  });
  
  // Invoice button
  const invoiceButton = document.createElement('button');
  invoiceButton.textContent = 'Create Invoice';
  invoiceButton.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
  invoiceButton.style.color = 'var(--color-text, #111827)';
  invoiceButton.style.border = '1px solid var(--color-border, #E5E7EB)';
  invoiceButton.style.borderRadius = '6px';
  invoiceButton.style.padding = '10px 16px';
  invoiceButton.style.fontSize = '14px';
  invoiceButton.style.cursor = 'pointer';
  invoiceButton.style.flex = '1';
  
  invoiceButton.addEventListener('click', () => {
    createInvoiceFromQuote(result);
  });
  
  actions.appendChild(saveButton);
  actions.appendChild(printButton);
  actions.appendChild(invoiceButton);
  resultsContainer.appendChild(actions);
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Create a form group with label and input
 * @param {string} labelText - The label text
 * @param {HTMLElement} inputElement - The input element
 * @returns {HTMLElement} The form group element
 */
function createFormGroup(labelText, inputElement) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.style.marginBottom = '16px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '8px';
  label.style.fontSize = '14px';
  label.style.fontWeight = '500';
  
  group.appendChild(label);
  group.appendChild(inputElement);
  
  return group;
}

/**
 * Create a select element with options
 * @param {string} name - The select name attribute
 * @param {Array<{value: string, label: string}>} options - The select options
 * @returns {HTMLElement} The select element
 */
function createSelect(name, options) {
  const select = document.createElement('select');
  select.name = name;
  select.style.width = '100%';
  select.style.padding = '10px';
  select.style.borderRadius = '6px';
  select.style.border = '1px solid var(--color-border, #E5E7EB)';
  select.style.backgroundColor = 'white';
  select.style.fontSize = '14px';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select an option';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  select.appendChild(defaultOption);
  
  // Add options
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    select.appendChild(optionElement);
  });
  
  return select;
}

/**
 * Create an input element
 * @param {string} type - The input type
 * @param {string} name - The input name
 * @param {string} value - The input value
 * @param {string} placeholder - The input placeholder
 * @param {string} min - The input min value
 * @param {string} max - The input max value
 * @param {string} step - The input step value
 * @returns {HTMLElement} The input element
 */
function createInput(type, name, value = '', placeholder = '', min = '', max = '', step = '') {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  
  if (type !== 'checkbox') {
    input.style.width = '100%';
    input.style.padding = '10px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid var(--color-border, #E5E7EB)';
    input.style.backgroundColor = 'white';
    input.style.fontSize = '14px';
  }
  
  if (min) input.min = min;
  if (max) input.max = max;
  if (step) input.step = step;
  
  return input;
}

/**
 * Display a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success or error)
 */
function showToast(message, type = 'success') {
  // Check if toast container exists, create if not
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.backgroundColor = type === 'success' ? '#ecfdf5' : '#fee2e2';
  toast.style.color = type === 'success' ? '#047857' : '#b91c1c';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.marginBottom = '8px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.justifyContent = 'space-between';
  toast.style.minWidth = '300px';
  toast.style.maxWidth = '400px';
  toast.style.animation = 'fadeIn 0.3s';
  
  // Add message
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '18px';
  closeButton.style.marginLeft = '8px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = toast.style.color;
  
  closeButton.addEventListener('click', () => {
    toastContainer.removeChild(toast);
  });
  
  // Append elements
  toast.appendChild(messageElement);
  toast.appendChild(closeButton);
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode === toastContainer) {
      toastContainer.removeChild(toast);
    }
  }, 5000);
  
  // Add animation styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Save the quote to local storage
 * @param {Object} quote - The quote to save
 */
function saveQuote(quote) {
  try {
    // Get existing saved quotes or initialize empty array
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Add a unique ID and timestamp
    const quoteToSave = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to saved quotes
    savedQuotes.push(quoteToSave);
    
    // Save back to localStorage
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    
    showToast('Quote saved successfully', 'success');
  } catch (error) {
    console.error('Error saving quote:', error);
    showToast('Failed to save quote', 'error');
  }
}

/**
 * Print the quote
 * @param {Object} quote - The quote to print
 */
function printQuote(quote) {
  // Create print window
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    showToast('Please allow popups to print quotes', 'error');
    return;
  }
  
  // Create print content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quote - ${quote.jobTypeDisplay}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
        }
        .quote-info {
          margin-bottom: 30px;
        }
        .quote-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 15px;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .breakdown-item.total {
          font-weight: bold;
          border-top: 2px solid #ddd;
          border-bottom: none;
          padding-top: 12px;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div>Professional Services</div>
          <div>123 Business St, City, State ZIP</div>
          <div>Phone: (555) 123-4567</div>
          <div>Email: contact@yourcompany.com</div>
        </div>
        
        <div class="quote-info">
          <div class="section-title">Quote Information</div>
          <div class="quote-info-row">
            <div><strong>Date:</strong></div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Quote Number:</strong></div>
            <div>Q-${Date.now().toString().substring(6)}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Service:</strong></div>
            <div>${quote.jobTypeDisplay}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Location:</strong></div>
            <div>${quote.location}</div>
          </div>
        </div>
        
        <div class="section-title">Cost Breakdown</div>
        <div class="breakdown-item">
          <div>Labor (${quote.laborHours} hours @ $${quote.laborRate.toFixed(2)}/hr)${quote.emergency ? ' (Emergency)' : ''}</div>
          <div>$${quote.laborCost.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Materials</div>
          <div>$${quote.materialsCost.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Subtotal</div>
          <div>$${quote.subtotal.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Tax (${(quote.taxRate * 100).toFixed(2)}%)</div>
          <div>$${quote.materialsTax.toFixed(2)}</div>
        </div>
        <div class="breakdown-item total">
          <div>Total</div>
          <div>$${quote.total.toFixed(2)}</div>
        </div>
        
        <div class="notes">
          <div class="section-title">Notes</div>
          <div>
            <p>This quote is valid for 30 days from the date of issue.</p>
            <p>Payment terms: 50% deposit required before work begins, remaining balance due upon completion.</p>
            <p>Please contact us if you have any questions about this quote.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Print Quote</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">Close</button>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          // Auto-print
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Create an invoice from a quote
 * @param {Object} quote - The quote to convert to an invoice
 */
function createInvoiceFromQuote(quote) {
  try {
    // Create invoice data
    const invoiceData = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'draft',
      client: {
        name: 'Client Name', // Default placeholder
        email: '',
        address: quote.location
      },
      items: [
        {
          description: `${quote.jobTypeDisplay}${quote.emergency ? ' (Emergency)' : ''}`,
          quantity: quote.laborHours,
          unit: 'hours',
          unitPrice: quote.laborRate,
          amount: quote.laborCost
        },
        {
          description: 'Materials',
          quantity: 1,
          unit: 'lot',
          unitPrice: quote.materialsCost,
          amount: quote.materialsCost
        }
      ],
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.materialsTax,
      total: quote.total,
      paid: 0,
      balance: quote.total
    };
    
    // Check if invoiceSystem exists, otherwise save to localStorage
    if (typeof window.invoiceSystem === 'undefined' || 
        typeof window.invoiceSystem.createDraftInvoice !== 'function') {
      // Save to localStorage if no invoice system
      const invoices = JSON.parse(localStorage.getItem('draftInvoices') || '[]');
      invoices.push(invoiceData);
      localStorage.setItem('draftInvoices', JSON.stringify(invoices));
      
      showToast('Invoice created and saved as draft', 'success');
      
      // Try to navigate to invoices page
      if (typeof window.setActivePage === 'function') {
        setTimeout(() => {
          window.setActivePage('invoices');
        }, 1000);
      } else {
        showToast('Go to Invoices page to view your draft invoice', 'info');
      }
    } else {
      // Use the invoice system
      window.invoiceSystem.createDraftInvoice(invoiceData);
      showToast('Invoice created and saved as draft', 'success');
      
      // Redirect to invoices page
      setTimeout(() => {
        window.setActivePage('invoices');
      }, 1000);
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    showToast('Failed to create invoice: ' + error.message, 'error');
  }
}

/**
 * Get state abbreviation from location string
 * @param {string} location - Location string (ZIP or City, State)
 * @returns {string} Two-letter state code
 */
function getStateFromLocation(location) {
  // Check if location includes a comma (City, State format)
  if (location.includes(',')) {
    const parts = location.split(',');
    const stateStr = parts[1].trim().toUpperCase();
    
    // If it's already a two-letter state code
    if (stateStr.length === 2 && stateToRegion[stateStr]) {
      return stateStr;
    }
    
    // Map state names to abbreviations (simplified)
    const stateMap = {
      'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA',
      'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA',
      'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA',
      'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
      'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO',
      'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
      'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH',
      'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
      'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT',
      'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY'
    };
    
    return stateMap[stateStr] || 'NY'; // Default to NY if not found
  }
  
  // Default to NY for ZIP codes or invalid input
  return 'NY';
}

/**
 * Get display name for job type
 * @param {string} jobType - Job type key
 * @returns {string} Display name
 */
function getJobTypeDisplay(jobType) {
  const displayNames = {
    'locksmith': 'Locksmith Services',
    'plumber': 'Plumbing Services',
    'electrician': 'Electrical Services',
    'carpenter': 'Carpentry Services',
    'hvac': 'HVAC Services',
    'painter': 'Painting Services',
    'general_contractor': 'General Contracting',
    'landscaper': 'Landscaping Services',
    'roofer': 'Roofing Services',
    'flooring_specialist': 'Flooring Services',
    'window_installer': 'Window Installation',
    'appliance_repair': 'Appliance Repair',
    'pool_service': 'Pool Services',
    'handyman': 'Handyman Services',
    'fence_installer': 'Fence Installation',
    'pest_control': 'Pest Control Services',
    'automotive_repair': 'Automotive Repair',
    'electronic_repair': 'Electronic Repair (General)',
    'cellphone_repair': 'Cellphone Repair',
    'computer_repair': 'Computer Repair',
    'tv_repair': 'TV Repair',
    'beauty_services': 'Beauty Services',
    'photography': 'Photography Services',
    'graphic_design': 'Graphic Design',
    'catering': 'Catering Services',
    'interior_design': 'Interior Design',
    'moving_services': 'Moving Services',
    'cleaning_services': 'Cleaning Services'
  };
  
  return displayNames[jobType] || jobType;
}

// Make functions available globally
window.renderQuoteGeneratorPage = renderQuoteGeneratorPage;
window.QuoteGenerator = {
  generateQuote,
  handleGenerateQuote,
  displayQuoteResults,
  createFormGroup,
  createSelect,
  createInput,
  initGoogleMapsAutocomplete,
  showToast: function(message, type) {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(message);
      alert(message);
    }
  },
  getStateFromLocation
};