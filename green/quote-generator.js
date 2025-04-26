/**
 * Quote Generator Module
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

// Define stateToRegion object 
const stateToRegion = {
  "ME": "northeast", "NH": "northeast", "VT": "northeast", "MA": "northeast", 
  "RI": "northeast", "CT": "northeast", "NY": "northeast", "NJ": "northeast", 
  "PA": "northeast", "DE": "northeast", "MD": "northeast", "DC": "northeast",
  
  "OH": "midwest", "MI": "midwest", "IN": "midwest", "WI": "midwest", 
  "IL": "midwest", "MN": "midwest", "IA": "midwest", "MO": "midwest", 
  "ND": "midwest", "SD": "midwest", "NE": "midwest", "KS": "midwest",
  
  "VA": "southeast", "WV": "southeast", "KY": "southeast", "NC": "southeast", 
  "SC": "southeast", "TN": "southeast", "GA": "southeast", "FL": "southeast", 
  "AL": "southeast", "MS": "southeast", "AR": "southeast", "LA": "southeast",
  
  "TX": "southwest", "OK": "southwest", "NM": "southwest", "AZ": "southwest",
  
  "MT": "west", "ID": "west", "WY": "west", "CO": "west", "UT": "west", 
  "NV": "west", "CA": "west", "OR": "west", "WA": "west", "AK": "west", "HI": "west"
};

// Regional market rates for different job types
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
  }
};

// State tax rates (simplified for example)
const stateTaxRates = {
  "AL": 0.04, "AK": 0.00, "AZ": 0.056, "AR": 0.065, "CA": 0.0725, "CO": 0.029, "CT": 0.0635, "DE": 0.00, "DC": 0.06, "FL": 0.06,
  "GA": 0.04, "HI": 0.04, "ID": 0.06, "IL": 0.0625, "IN": 0.07, "IA": 0.06, "KS": 0.065, "KY": 0.06, "LA": 0.0445, "ME": 0.055,
  "MD": 0.06, "MA": 0.0625, "MI": 0.06, "MN": 0.06875, "MS": 0.07, "MO": 0.04225, "MT": 0.00, "NE": 0.055, "NV": 0.0685, "NH": 0.00,
  "NJ": 0.066, "NM": 0.05125, "NY": 0.04, "NC": 0.0475, "ND": 0.05, "OH": 0.0575, "OK": 0.045, "OR": 0.00, "PA": 0.06, "RI": 0.07,
  "SC": 0.06, "SD": 0.045, "TN": 0.07, "TX": 0.0625, "UT": 0.0595, "VT": 0.06, "VA": 0.053, "WA": 0.065, "WV": 0.06, "WI": 0.05, "WY": 0.04
};

/**
 * Create a form group with label and input
 * @param {string} labelText - The label text
 * @param {HTMLElement} inputElement - The input element
 * @returns {HTMLElement} The form group element
 */
function createFormGroup(labelText, inputElement) {
  const formGroup = document.createElement('div');
  formGroup.classList.add('form-group');
  formGroup.style.marginBottom = '16px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '8px';
  label.style.fontSize = '14px';
  label.style.fontWeight = '500';
  
  formGroup.appendChild(label);
  formGroup.appendChild(inputElement);
  
  return formGroup;
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
  select.style.border = '1px solid var(--color-border)';
  select.style.backgroundColor = 'var(--color-input-bg)';
  select.style.fontSize = '14px';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Select ${name}`;
  defaultOption.selected = true;
  defaultOption.disabled = true;
  select.appendChild(defaultOption);
  
  // Add provided options
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
  input.style.width = '100%';
  input.style.padding = '10px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid var(--color-border)';
  input.style.backgroundColor = 'var(--color-input-bg)';
  input.style.fontSize = '14px';
  
  if (min) input.min = min;
  if (max) input.max = max;
  if (step) input.step = step;
  
  return input;
}

/**
 * Create a textarea element
 * @param {string} name - The textarea name
 * @param {string} placeholder - The textarea placeholder
 * @returns {HTMLElement} The textarea element
 */
function createTextarea(name, placeholder = '') {
  const textarea = document.createElement('textarea');
  textarea.name = name;
  textarea.placeholder = placeholder;
  textarea.style.width = '100%';
  textarea.style.padding = '10px';
  textarea.style.borderRadius = '6px';
  textarea.style.border = '1px solid var(--color-border)';
  textarea.style.backgroundColor = 'var(--color-input-bg)';
  textarea.style.fontSize = '14px';
  textarea.style.minHeight = '100px';
  textarea.style.resize = 'vertical';
  
  return textarea;
}

/**
 * Create a button element
 * @param {string} text - The button text
 * @param {Function} onClick - The button click handler
 * @param {string} type - The button type
 * @returns {HTMLElement} The button element
 */
function createButton(text, onClick, type = 'primary') {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  button.style.padding = '10px 16px';
  
  if (type === 'primary') {
    button.style.backgroundColor = 'var(--color-primary)';
    button.style.color = 'white';
  } else {
    button.style.backgroundColor = 'var(--color-card-bg)';
    button.style.border = '1px solid var(--color-border)';
  }
  
  button.style.borderRadius = '6px';
  button.style.fontSize = '14px';
  button.style.cursor = 'pointer';
  button.style.transition = 'all 0.2s';
  button.style.flex = '1';
  
  button.addEventListener('mouseover', () => {
    if (type === 'primary') {
      button.style.backgroundColor = 'var(--color-primary-dark)';
    } else {
      button.style.backgroundColor = 'var(--color-border)';
    }
  });
  
  button.addEventListener('mouseout', () => {
    if (type === 'primary') {
      button.style.backgroundColor = 'var(--color-primary)';
    } else {
      button.style.backgroundColor = 'var(--color-card-bg)';
    }
  });
  
  return button;
}

/**
 * Create a section header with title and subtitle
 * @param {string} title - The section title
 * @param {string} subtitle - The section subtitle
 * @returns {HTMLElement} The section header element
 */
function createSectionHeader(title, subtitle) {
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  const titleElement = document.createElement('h2');
  titleElement.textContent = title;
  titleElement.style.fontSize = '20px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '8px';
  
  const subtitleElement = document.createElement('p');
  subtitleElement.textContent = subtitle;
  subtitleElement.style.fontSize = '14px';
  subtitleElement.style.color = 'var(--color-text-secondary)';
  subtitleElement.style.lineHeight = '1.5';
  
  header.appendChild(titleElement);
  header.appendChild(subtitleElement);
  
  return header;
}

/**
 * Create a breakdown item for the cost breakdown list
 * @param {string} label - Item label
 * @param {number} amount - Item amount
 * @param {boolean} highlight - Whether to highlight the item
 * @returns {HTMLElement} The breakdown item
 */
function createBreakdownItem(label, amount, highlight = false) {
  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.padding = '8px 0';
  item.style.borderBottom = highlight ? 'none' : '1px solid var(--color-border-light)';
  
  if (highlight) {
    item.style.marginTop = '8px';
    item.style.paddingTop = '16px';
    item.style.borderTop = '1px solid var(--color-border)';
    item.style.fontWeight = 'bold';
  }
  
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  
  const amountElement = document.createElement('span');
  amountElement.textContent = `$${amount.toFixed(2)}`;
  
  item.appendChild(labelElement);
  item.appendChild(amountElement);
  
  return item;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'success') {
  // Ensure we have a toast container
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    document.body.appendChild(toastContainer);
  }
  
  // Create the toast element
  const toast = document.createElement('div');
  toast.style.backgroundColor = type === 'error' ? '#FEE2E2' : '#ECFDF5';
  toast.style.color = type === 'error' ? '#B91C1C' : '#047857';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.marginBottom = '8px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.justifyContent = 'space-between';
  toast.style.minWidth = '280px';
  toast.style.maxWidth = '400px';
  toast.style.animation = 'fadeIn 0.3s ease-out forwards';
  
  // Toast message
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  
  // Toast close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '8px';
  closeButton.style.fontSize = '18px';
  closeButton.style.color = type === 'error' ? '#B91C1C' : '#047857';
  
  closeButton.addEventListener('click', () => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  });
  
  toast.appendChild(messageElement);
  toast.appendChild(closeButton);
  toastContainer.appendChild(toast);
  
  // Add keyframes for animations if they don't exist
  if (!document.querySelector('#toastAnimations')) {
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto-dismiss toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode === toastContainer) {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}

/**
 * Main function to render the quote generator page
 * @param {string} containerId - The ID of the container to render the page in
 */
export function renderQuoteGeneratorPage(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID '${containerId}' not found`);
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Page title is set in main.js
  
  // Create page container
  const pageContainer = document.createElement('div');
  pageContainer.classList.add('quote-generator-container');
  
  // Add page header
  const header = createSectionHeader(
    'Professional Quote Generator', 
    'Create accurate, profitable quotes for your service business in seconds'
  );
  pageContainer.appendChild(header);
  
  // Add quote form
  const quoteForm = createQuoteForm();
  pageContainer.appendChild(quoteForm);
  
  // Add result section (initially empty)
  const resultSection = document.createElement('div');
  resultSection.id = 'quote-result-section';
  resultSection.style.marginTop = '32px';
  pageContainer.appendChild(resultSection);
  
  // Add page to container
  container.appendChild(pageContainer);
}

/**
 * Create the quote generation form
 * @returns {HTMLElement} The form element
 */
function createQuoteForm() {
  const form = document.createElement('form');
  form.id = 'quote-form';
  form.style.backgroundColor = 'var(--color-card-bg)';
  form.style.padding = '24px';
  form.style.borderRadius = '12px';
  form.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Job details section
  const jobDetailsSection = createSectionHeader('Job Details', 'Provide information about the job to get an accurate quote');
  form.appendChild(jobDetailsSection);
  
  // Job type select
  const jobTypeOptions = [
    { value: 'locksmith', label: 'Locksmith Services' },
    { value: 'plumber', label: 'Plumbing Services' },
    { value: 'electrician', label: 'Electrical Services' },
    { value: 'carpenter', label: 'Carpentry Services' },
    { value: 'hvac', label: 'HVAC Services' },
    { value: 'painter', label: 'Painting Services' },
    { value: 'general_contractor', label: 'General Contracting' },
    { value: 'landscaper', label: 'Landscaping Services' }
  ];
  const jobTypeSelect = createSelect('jobType', jobTypeOptions);
  form.appendChild(createFormGroup('Service Type', jobTypeSelect));
  
  // Job description
  const jobDescriptionInput = createTextarea('jobDescription', 'Describe the job in detail...');
  form.appendChild(createFormGroup('Job Description', jobDescriptionInput));
  
  // Location
  const locationInput = createInput('text', 'location', '', 'ZIP code or City, State');
  form.appendChild(createFormGroup('Location', locationInput));
  
  // Labor hours
  const laborHoursInput = createInput('number', 'laborHours', '1', 'Estimated hours', '0.5', '100', '0.5');
  form.appendChild(createFormGroup('Labor Hours', laborHoursInput));
  
  // Materials cost
  const materialsCostInput = createInput('number', 'materialsCost', '0', 'Cost in dollars', '0', '10000', '0.01');
  form.appendChild(createFormGroup('Materials Cost ($)', materialsCostInput));
  
  // Add options section
  const optionsSection = createSectionHeader('Additional Options', 'Customize your quote settings');
  form.appendChild(optionsSection);
  
  // Emergency service checkbox
  const emergencyRow = document.createElement('div');
  emergencyRow.style.display = 'flex';
  emergencyRow.style.alignItems = 'center';
  emergencyRow.style.marginBottom = '16px';
  
  const emergencyCheckbox = createInput('checkbox', 'emergency');
  emergencyCheckbox.style.width = 'auto';
  emergencyCheckbox.style.marginRight = '8px';
  
  const emergencyLabel = document.createElement('label');
  emergencyLabel.textContent = 'Emergency Service (after hours/weekend)';
  emergencyLabel.style.fontSize = '14px';
  
  emergencyRow.appendChild(emergencyCheckbox);
  emergencyRow.appendChild(emergencyLabel);
  form.appendChild(emergencyRow);
  
  // Travel distance
  const travelDistanceInput = createInput('number', 'travelDistance', '0', 'Distance in miles', '0', '200', '0.1');
  form.appendChild(createFormGroup('Travel Distance (miles)', travelDistanceInput));
  
  // Target profit margin slider
  const marginRow = document.createElement('div');
  marginRow.style.marginBottom = '16px';
  
  const marginLabel = document.createElement('label');
  marginLabel.textContent = 'Target Profit Margin: 25%';
  marginLabel.style.display = 'block';
  marginLabel.style.marginBottom = '8px';
  marginLabel.style.fontSize = '14px';
  marginLabel.style.fontWeight = '500';
  
  const marginSlider = createInput('range', 'targetMargin', '25', '', '10', '50', '1');
  marginSlider.addEventListener('input', (e) => {
    marginLabel.textContent = `Target Profit Margin: ${e.target.value}%`;
  });
  
  marginRow.appendChild(marginLabel);
  marginRow.appendChild(marginSlider);
  form.appendChild(marginRow);
  
  // Buttons row
  const buttonsRow = document.createElement('div');
  buttonsRow.style.display = 'flex';
  buttonsRow.style.gap = '12px';
  buttonsRow.style.marginTop = '24px';
  
  // Generate quote button
  const generateButton = createButton('Generate Quote', async (e) => {
    await handleQuoteFormSubmit(e);
  }, 'primary');
  
  // Reset form button
  const resetButton = createButton('Reset Form', () => {
    form.reset();
    marginLabel.textContent = 'Target Profit Margin: 25%';
    document.getElementById('quote-result-section').innerHTML = '';
  }, 'secondary');
  
  buttonsRow.appendChild(generateButton);
  buttonsRow.appendChild(resetButton);
  form.appendChild(buttonsRow);
  
  return form;
}

/**
 * Handle form submission to generate a quote
 * @param {Event} e - Form submission event
 */
async function handleQuoteFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const form = document.getElementById('quote-form');
  const formData = new FormData(form);
  
  // Basic validation
  const jobType = formData.get('jobType');
  const location = formData.get('location');
  const laborHours = formData.get('laborHours');
  
  if (!jobType || !location || !laborHours) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Show loading state
  const resultSection = document.getElementById('quote-result-section');
  resultSection.innerHTML = '<div style="text-align: center; padding: 20px;">Generating quote...</div>';
  
  try {
    // Transform form data into object
    const quoteData = {
      jobType: formData.get('jobType'),
      jobDescription: formData.get('jobDescription'),
      location: formData.get('location'),
      laborHours: parseFloat(formData.get('laborHours')),
      materialsCost: parseFloat(formData.get('materialsCost')),
      emergency: formData.get('emergency') === 'on',
      travelDistance: parseFloat(formData.get('travelDistance')),
      targetMargin: parseInt(formData.get('targetMargin'))
    };
    
    // Generate quote
    const quoteResult = await generateQuote(quoteData);
    
    // Display results
    displayQuoteResult(quoteResult);
    
  } catch (error) {
    console.error('Error generating quote:', error);
    resultSection.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Error generating quote: ${error.message}</div>`;
    showToast('Failed to generate quote', 'error');
  }
}

/**
 * Generate a quote based on the provided data
 * @param {Object} quoteData - The data for generating the quote
 * @returns {Object} The generated quote result
 */
function generateQuote(quoteData) {
  // Extract data
  const { 
    jobType, 
    jobDescription, 
    location, 
    laborHours, 
    materialsCost, 
    emergency, 
    travelDistance,
    targetMargin
  } = quoteData;
  
  // Get state and tax rate
  const state = getStateFromZip(location);
  const taxRate = getTaxRate(state);
  
  // Get market rate for this job type and region
  const hourlyRate = getMarketRate(jobType, state);
  
  // Calculate base labor cost
  let laborCost = hourlyRate * laborHours;
  
  // Apply emergency surcharge if needed (50% increase)
  if (emergency) {
    laborCost *= 1.5;
  }
  
  // Add travel cost ($1 per mile)
  const travelCost = travelDistance * 1.0;
  
  // Calculate subtotal (labor + materials + travel)
  const subtotal = laborCost + materialsCost + travelCost;
  
  // Calculate tax (applied to materials only in most regions)
  const taxAmount = materialsCost * taxRate;
  
  // Calculate total
  const total = subtotal + taxAmount;
  
  // Calculate profit based on target margin
  const costWithoutProfit = subtotal / (1 - (targetMargin / 100));
  const profit = total - costWithoutProfit;
  const profitMargin = (profit / total) * 100;
  
  // Generate profit assessment
  let profitAssessment = '';
  if (profitMargin < 15) {
    profitAssessment = 'Warning: This quote has a low profit margin. Consider raising your prices or reducing costs.';
  } else if (profitMargin < 25) {
    profitAssessment = 'This quote has an acceptable profit margin, but could be improved.';
  } else {
    profitAssessment = 'This quote has a healthy profit margin. Well done!';
  }
  
  // Return quote result
  return {
    jobType,
    jobDescription,
    location,
    state,
    laborHours,
    hourlyRate,
    laborCost,
    materialsCost,
    travelDistance,
    travelCost,
    emergency,
    subtotal,
    taxRate,
    taxAmount,
    total,
    targetMargin,
    profit,
    profitMargin,
    profitAssessment
  };
}

/**
 * Display the generated quote result
 * @param {Object} quoteResult - The generated quote result
 */
function displayQuoteResult(quoteResult) {
  const resultSection = document.getElementById('quote-result-section');
  resultSection.innerHTML = '';
  
  // Result container
  const resultContainer = document.createElement('div');
  resultContainer.classList.add('quote-result-container');
  resultContainer.style.background = 'var(--color-card-bg)';
  resultContainer.style.borderRadius = '12px';
  resultContainer.style.padding = '24px';
  resultContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Quote header
  const quoteHeader = document.createElement('div');
  quoteHeader.style.marginBottom = '20px';
  quoteHeader.style.borderBottom = '1px solid var(--color-border)';
  quoteHeader.style.paddingBottom = '16px';
  
  const quoteTitle = document.createElement('h2');
  quoteTitle.textContent = 'Quote Summary';
  quoteTitle.style.fontSize = '20px';
  quoteTitle.style.fontWeight = 'bold';
  quoteTitle.style.marginBottom = '8px';
  
  const quoteSubtitle = document.createElement('p');
  const jobTypeDisplayName = document.querySelector(`#quote-form select[name="jobType"] option[value="${quoteResult.jobType}"]`).textContent;
  quoteSubtitle.textContent = `${jobTypeDisplayName} in ${quoteResult.location}`;
  quoteSubtitle.style.fontSize = '14px';
  quoteSubtitle.style.color = 'var(--color-text-secondary)';
  
  quoteHeader.appendChild(quoteTitle);
  quoteHeader.appendChild(quoteSubtitle);
  resultContainer.appendChild(quoteHeader);
  
  // Cost breakdown
  const breakdownSection = document.createElement('div');
  breakdownSection.style.marginBottom = '24px';
  
  const breakdownTitle = document.createElement('h3');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '16px';
  breakdownTitle.style.fontWeight = 'bold';
  breakdownTitle.style.marginBottom = '12px';
  
  breakdownSection.appendChild(breakdownTitle);
  
  // Create breakdown items
  const breakdownList = document.createElement('div');
  breakdownList.classList.add('cost-breakdown-list');
  
  // Labor
  breakdownList.appendChild(createBreakdownItem(
    `Labor (${quoteResult.laborHours} hours @ $${quoteResult.hourlyRate.toFixed(2)}/hr)${quoteResult.emergency ? ' (Emergency)' : ''}`,
    quoteResult.laborCost
  ));
  
  // Materials
  breakdownList.appendChild(createBreakdownItem('Materials', quoteResult.materialsCost));
  
  // Travel
  if (quoteResult.travelDistance > 0) {
    breakdownList.appendChild(createBreakdownItem(
      `Travel (${quoteResult.travelDistance} miles)`,
      quoteResult.travelCost
    ));
  }
  
  // Subtotal
  breakdownList.appendChild(createBreakdownItem('Subtotal', quoteResult.subtotal));
  
  // Tax
  breakdownList.appendChild(createBreakdownItem(
    `Tax (${(quoteResult.taxRate * 100).toFixed(2)}%)`,
    quoteResult.taxAmount
  ));
  
  // Total
  breakdownList.appendChild(createBreakdownItem('Total', quoteResult.total, true));
  
  breakdownSection.appendChild(breakdownList);
  resultContainer.appendChild(breakdownSection);
  
  // Profit analysis section (shown only to the service provider)
  const profitSection = document.createElement('div');
  profitSection.style.marginTop = '24px';
  profitSection.style.padding = '16px';
  profitSection.style.backgroundColor = 'var(--color-bg-secondary)';
  profitSection.style.borderRadius = '8px';
  
  const profitTitle = document.createElement('h3');
  profitTitle.textContent = 'Profit Analysis';
  profitTitle.style.fontSize = '16px';
  profitTitle.style.fontWeight = 'bold';
  profitTitle.style.marginBottom = '12px';
  
  const profitDetails = document.createElement('div');
  
  // Target margin
  const targetMarginRow = document.createElement('div');
  targetMarginRow.style.marginBottom = '8px';
  targetMarginRow.style.display = 'flex';
  targetMarginRow.style.justifyContent = 'space-between';
  
  const targetMarginLabel = document.createElement('span');
  targetMarginLabel.textContent = 'Target Profit Margin:';
  
  const targetMarginValue = document.createElement('span');
  targetMarginValue.textContent = `${quoteResult.targetMargin}%`;
  
  targetMarginRow.appendChild(targetMarginLabel);
  targetMarginRow.appendChild(targetMarginValue);
  profitDetails.appendChild(targetMarginRow);
  
  // Actual margin
  const actualMarginRow = document.createElement('div');
  actualMarginRow.style.marginBottom = '8px';
  actualMarginRow.style.display = 'flex';
  actualMarginRow.style.justifyContent = 'space-between';
  
  const actualMarginLabel = document.createElement('span');
  actualMarginLabel.textContent = 'Actual Profit Margin:';
  
  const actualMarginValue = document.createElement('span');
  actualMarginValue.textContent = `${quoteResult.profitMargin.toFixed(1)}%`;
  actualMarginValue.style.fontWeight = 'bold';
  actualMarginValue.style.color = quoteResult.profitMargin < 15 ? '#B91C1C' : 
                                 quoteResult.profitMargin < 25 ? '#D97706' : '#047857';
  
  actualMarginRow.appendChild(actualMarginLabel);
  actualMarginRow.appendChild(actualMarginValue);
  profitDetails.appendChild(actualMarginRow);
  
  // Profit amount
  const profitRow = document.createElement('div');
  profitRow.style.marginBottom = '8px';
  profitRow.style.display = 'flex';
  profitRow.style.justifyContent = 'space-between';
  
  const profitLabel = document.createElement('span');
  profitLabel.textContent = 'Estimated Profit:';
  
  const profitValue = document.createElement('span');
  profitValue.textContent = `$${quoteResult.profit.toFixed(2)}`;
  profitValue.style.fontWeight = 'bold';
  
  profitRow.appendChild(profitLabel);
  profitRow.appendChild(profitValue);
  profitDetails.appendChild(profitRow);
  
  // Profit assessment
  const assessmentElement = document.createElement('p');
  assessmentElement.textContent = quoteResult.profitAssessment;
  assessmentElement.style.marginTop = '12px';
  assessmentElement.style.padding = '8px';
  assessmentElement.style.backgroundColor = quoteResult.profitMargin < 15 ? '#FEE2E2' : 
                                         quoteResult.profitMargin < 25 ? '#FEF3C7' : '#ECFDF5';
  assessmentElement.style.borderRadius = '4px';
  assessmentElement.style.fontSize = '14px';
  
  profitSection.appendChild(profitTitle);
  profitSection.appendChild(profitDetails);
  profitSection.appendChild(assessmentElement);
  resultContainer.appendChild(profitSection);
  
  // Buttons row
  const actionsRow = document.createElement('div');
  actionsRow.style.display = 'flex';
  actionsRow.style.gap = '12px';
  actionsRow.style.marginTop = '24px';
  
  // Save quote button
  const saveButton = createButton('Save Quote', () => saveQuote(quoteResult), 'primary');
  
  // Print quote button
  const printButton = createButton('Print Quote', () => printQuote(quoteResult), 'secondary');
  
  // Create invoice button
  const invoiceButton = createButton('Create Invoice', () => createInvoiceFromQuote(quoteResult), 'secondary');
  
  actionsRow.appendChild(saveButton);
  actionsRow.appendChild(printButton);
  actionsRow.appendChild(invoiceButton);
  resultContainer.appendChild(actionsRow);
  
  // Add to result section
  resultSection.appendChild(resultContainer);
  
  // Scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Save quote to local storage
 * @param {Object} quoteResult - The quote result to save
 */
function saveQuote(quoteResult) {
  try {
    // Get existing saved quotes
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Add timestamp to quote
    const quoteToSave = {
      ...quoteResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
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
 * @param {Object} quoteResult - The quote result to print
 */
function printQuote(quoteResult) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    showToast('Please allow popups to print quotes', 'error');
    return;
  }
  
  // Get job type display name
  const jobTypeDisplayName = document.querySelector(`#quote-form select[name="jobType"] option[value="${quoteResult.jobType}"]`).textContent;
  
  // Create print content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quote - ${jobTypeDisplayName}</title>
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
          @page {
            margin: 0.5in;
          }
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
            <div>${jobTypeDisplayName}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Location:</strong></div>
            <div>${quoteResult.location}</div>
          </div>
        </div>
        
        <div class="section-title">Job Description</div>
        <div>${quoteResult.jobDescription || 'No description provided'}</div>
        
        <div class="section-title">Cost Breakdown</div>
        <div class="breakdown-item">
          <div>Labor (${quoteResult.laborHours} hours @ $${quoteResult.hourlyRate.toFixed(2)}/hr)${quoteResult.emergency ? ' (Emergency)' : ''}</div>
          <div>$${quoteResult.laborCost.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Materials</div>
          <div>$${quoteResult.materialsCost.toFixed(2)}</div>
        </div>
        ${quoteResult.travelDistance > 0 ? `
        <div class="breakdown-item">
          <div>Travel (${quoteResult.travelDistance} miles)</div>
          <div>$${quoteResult.travelCost.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="breakdown-item">
          <div>Subtotal</div>
          <div>$${quoteResult.subtotal.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Tax (${(quoteResult.taxRate * 100).toFixed(2)}%)</div>
          <div>$${quoteResult.taxAmount.toFixed(2)}</div>
        </div>
        <div class="breakdown-item total">
          <div>Total</div>
          <div>$${quoteResult.total.toFixed(2)}</div>
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
        // Auto-print when page loads
        window.onload = function() {
          // Slight delay to ensure page is fully loaded
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
 * Create an invoice from the quote
 * @param {Object} quoteResult - The quote result to create an invoice from
 */
function createInvoiceFromQuote(quoteResult) {
  try {
    // Get job type display name
    const jobTypeSelect = document.querySelector('#quote-form select[name="jobType"]');
    const jobTypeOption = jobTypeSelect.querySelector(`option[value="${quoteResult.jobType}"]`);
    const jobTypeDisplayName = jobTypeOption ? jobTypeOption.textContent : quoteResult.jobType;
    
    // Create invoice data
    const invoiceData = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'draft',
      client: {
        name: 'Client Name', // Placeholder
        email: '', // Placeholder
        address: quoteResult.location
      },
      items: [
        {
          description: `${jobTypeDisplayName} Services${quoteResult.emergency ? ' (Emergency)' : ''}`,
          quantity: quoteResult.laborHours,
          unit: 'hours',
          unitPrice: quoteResult.hourlyRate,
          amount: quoteResult.laborCost
        },
        {
          description: 'Materials',
          quantity: 1,
          unit: 'lot',
          unitPrice: quoteResult.materialsCost,
          amount: quoteResult.materialsCost
        }
      ],
      notes: quoteResult.jobDescription || 'No description provided',
      subtotal: quoteResult.subtotal,
      taxRate: quoteResult.taxRate,
      taxAmount: quoteResult.taxAmount,
      total: quoteResult.total,
      paid: 0,
      balance: quoteResult.total
    };
    
    // Add travel as an item if applicable
    if (quoteResult.travelDistance > 0) {
      invoiceData.items.push({
        description: 'Travel',
        quantity: quoteResult.travelDistance,
        unit: 'miles',
        unitPrice: 1.0,
        amount: quoteResult.travelCost
      });
    }
    
    // Check if window.invoiceSystem exists
    if (typeof window.invoiceSystem === 'undefined' || typeof window.invoiceSystem.createDraftInvoice !== 'function') {
      // If invoiceSystem doesn't exist, save to localStorage for now
      const invoices = JSON.parse(localStorage.getItem('draftInvoices') || '[]');
      invoices.push(invoiceData);
      localStorage.setItem('draftInvoices', JSON.stringify(invoices));
      
      showToast('Invoice created and saved as draft', 'success');
      
      // Redirect to invoices page if available
      setTimeout(() => {
        if (typeof window.setActivePage === 'function') {
          window.setActivePage('invoices');
        } else {
          // If navigation function not available, show info toast
          showToast('Go to Invoices page to view your draft invoice', 'info');
        }
      }, 1000);
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
    showToast('Failed to create invoice', 'error');
  }
}

/* Utility functions */

/**
 * Get a US state from a ZIP code or city/state string
 * @param {string} location - ZIP code or City, State string
 * @returns {string} The two-letter state code
 */
function getStateFromZip(location) {
  // For simplicity, this is a synchronous function in this example
  // In a real app, this might be an API call to get state from ZIP
  
  // Check if location includes a comma (City, State format)
  if (location.includes(',')) {
    const parts = location.split(',');
    const stateStr = parts[1].trim().toUpperCase();
    
    // If it's a two-letter state code
    if (stateStr.length === 2 && stateToRegion[stateStr]) {
      return stateStr;
    }
    
    // Complete state name mapping (simplified)
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
  
  // If it's a ZIP code
  const zip = location.trim();
  if (/^\d{5}(-\d{4})?$/.test(zip)) {
    const zipNum = parseInt(zip.substring(0, 5), 10);
    
    // This is a very simplified ZIP code mapping
    // In a real app, use a more accurate mapping or API
    if (zipNum >= 1000 && zipNum <= 2799) return 'NY';
    if (zipNum >= 2800 && zipNum <= 2999) return 'MA';
    if (zipNum >= 3000 && zipNum <= 3899) return 'NH';
    if (zipNum >= 4000 && zipNum <= 4999) return 'ME';
    if (zipNum >= 5000 && zipNum <= 5999) return 'VT';
    if (zipNum >= 6000 && zipNum <= 6999) return 'CT';
    if (zipNum >= 7000 && zipNum <= 8999) return 'NJ';
    if (zipNum >= 10000 && zipNum <= 14999) return 'NY';
    if (zipNum >= 15000 && zipNum <= 19699) return 'PA';
    if (zipNum >= 19700 && zipNum <= 19999) return 'DE';
    if (zipNum >= 20000 && zipNum <= 21999) return 'MD';
    if (zipNum >= 22000 && zipNum <= 24699) return 'VA';
    if (zipNum >= 25000 && zipNum <= 26899) return 'WV';
    if (zipNum >= 27000 && zipNum <= 28999) return 'NC';
    if (zipNum >= 29000 && zipNum <= 29999) return 'SC';
    if (zipNum >= 30000 && zipNum <= 31999) return 'GA';
    if (zipNum >= 32000 && zipNum <= 34999) return 'FL';
    if (zipNum >= 35000 && zipNum <= 36999) return 'AL';
    if (zipNum >= 37000 && zipNum <= 38599) return 'TN';
    if (zipNum >= 39000 && zipNum <= 39999) return 'MS';
    if (zipNum >= 40000 && zipNum <= 42799) return 'KY';
    if (zipNum >= 43000 && zipNum <= 45999) return 'OH';
    if (zipNum >= 46000 && zipNum <= 47999) return 'IN';
    if (zipNum >= 48000 && zipNum <= 49999) return 'MI';
    if (zipNum >= 50000 && zipNum <= 52899) return 'IA';
    if (zipNum >= 53000 && zipNum <= 54999) return 'WI';
    if (zipNum >= 55000 && zipNum <= 56799) return 'MN';
    if (zipNum >= 57000 && zipNum <= 57799) return 'SD';
    if (zipNum >= 58000 && zipNum <= 58899) return 'ND';
    if (zipNum >= 59000 && zipNum <= 59999) return 'MT';
    if (zipNum >= 60000 && zipNum <= 62999) return 'IL';
    if (zipNum >= 63000 && zipNum <= 65899) return 'MO';
    if (zipNum >= 66000 && zipNum <= 67999) return 'KS';
    if (zipNum >= 68000 && zipNum <= 69399) return 'NE';
    if (zipNum >= 70000 && zipNum <= 71499) return 'LA';
    if (zipNum >= 71600 && zipNum <= 72999) return 'AR';
    if (zipNum >= 73000 && zipNum <= 74999) return 'OK';
    if (zipNum >= 75000 && zipNum <= 79999) return 'TX';
    if (zipNum >= 80000 && zipNum <= 81699) return 'CO';
    if (zipNum >= 82000 && zipNum <= 83199) return 'WY';
    if (zipNum >= 83200 && zipNum <= 83899) return 'ID';
    if (zipNum >= 84000 && zipNum <= 84799) return 'UT';
    if (zipNum >= 85000 && zipNum <= 86599) return 'AZ';
    if (zipNum >= 87000 && zipNum <= 88499) return 'NM';
    if (zipNum >= 88900 && zipNum <= 89899) return 'NV';
    if (zipNum >= 90000 && zipNum <= 96699) return 'CA';
    if (zipNum >= 97000 && zipNum <= 97999) return 'OR';
    if (zipNum >= 98000 && zipNum <= 99499) return 'WA';
    if (zipNum >= 99500 && zipNum <= 99999) return 'AK';
  }
  
  // Default to New York if we can't determine the state
  return 'NY';
}

/**
 * Get tax rate for a given state
 * @param {string} state - Two-letter state code
 * @returns {number} The tax rate (0.0-1.0)
 */
function getTaxRate(state) {
  return stateTaxRates[state] || 0.05; // Default to 5% if state not found
}

/**
 * Get market rate for a job type in a state
 * @param {string} jobType - The type of job
 * @param {string} state - Two-letter state code
 * @returns {number} The hourly market rate
 */
function getMarketRate(jobType, state) {
  // Get the region for this state
  const region = stateToRegion[state] || 'northeast';
  
  // Get the market rate for this job type and region
  const rate = marketRates[jobType]?.[region] || 85; // Default rate if not found
  
  return rate;
}

// No direct displayPageTitle function needed - main.js now handles the page title