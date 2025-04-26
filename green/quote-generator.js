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
  
  "VA": "south", "WV": "south", "KY": "south", "TN": "south", "NC": "south", 
  "SC": "south", "GA": "south", "FL": "south", "AL": "south", "MS": "south", 
  "AR": "south", "LA": "south", "TX": "south", "OK": "south",
  
  "MT": "west", "ID": "west", "WY": "west", "CO": "west", "NM": "west", 
  "AZ": "west", "UT": "west", "NV": "west", "CA": "west", "OR": "west", 
  "WA": "west", "AK": "west", "HI": "west",
  
  "default": "default"
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
  formGroup.style.display = 'flex';
  formGroup.style.flexDirection = 'column';
  formGroup.style.gap = '8px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.fontSize = '14px';
  label.style.fontWeight = '500';
  label.style.color = 'var(--color-text-primary)';
  
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
  select.style.padding = '10px 12px';
  select.style.borderRadius = '6px';
  select.style.border = '1px solid var(--color-border)';
  select.style.backgroundColor = 'var(--color-input-bg)';
  select.style.color = 'var(--color-text-primary)';
  select.style.width = '100%';
  
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
function createInput(type, name, value, placeholder, min, max, step) {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  input.style.padding = '10px 12px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid var(--color-border)';
  input.style.backgroundColor = 'var(--color-input-bg)';
  input.style.color = 'var(--color-text-primary)';
  input.style.width = '100%';
  
  if (type === 'number') {
    if (min !== undefined) input.min = min;
    if (max !== undefined) input.max = max;
    if (step !== undefined) input.step = step;
  }
  
  return input;
}

/**
 * Create a textarea element
 * @param {string} name - The textarea name
 * @param {string} placeholder - The textarea placeholder
 * @returns {HTMLElement} The textarea element
 */
function createTextarea(name, placeholder) {
  const textarea = document.createElement('textarea');
  textarea.name = name;
  textarea.placeholder = placeholder;
  textarea.rows = 3;
  textarea.style.padding = '10px 12px';
  textarea.style.borderRadius = '6px';
  textarea.style.border = '1px solid var(--color-border)';
  textarea.style.backgroundColor = 'var(--color-input-bg)';
  textarea.style.color = 'var(--color-text-primary)';
  textarea.style.width = '100%';
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
  button.type = 'button';
  button.addEventListener('click', onClick);
  
  button.style.padding = '10px 16px';
  button.style.borderRadius = '6px';
  button.style.fontWeight = '600';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.2s';
  
  if (type === 'primary') {
    button.style.backgroundColor = 'var(--color-primary)';
    button.style.color = 'white';
    button.style.border = 'none';
  } else if (type === 'secondary') {
    button.style.backgroundColor = 'transparent';
    button.style.color = 'var(--color-primary)';
    button.style.border = '1px solid var(--color-primary)';
  }
  
  return button;
}

/**
 * Create a section header with title and subtitle
 * @param {string} title - The section title
 * @param {string} subtitle - The section subtitle
 * @returns {HTMLElement} The section header element
 */
function createSectionHeader(title, subtitle) {
  const headerSection = document.createElement('div');
  headerSection.style.marginBottom = '24px';
  
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = title;
  headerTitle.style.fontSize = '24px';
  headerTitle.style.fontWeight = '700';
  headerTitle.style.color = 'var(--color-primary)';
  headerTitle.style.marginBottom = '8px';
  
  const headerSubtitle = document.createElement('p');
  headerSubtitle.textContent = subtitle;
  headerSubtitle.style.fontSize = '16px';
  headerSubtitle.style.color = 'var(--color-text-secondary)';
  headerSubtitle.style.lineHeight = '1.5';
  
  headerSection.appendChild(headerTitle);
  headerSection.appendChild(headerSubtitle);
  
  return headerSection;
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
  item.classList.add('breakdown-item');
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.padding = '8px 0';
  
  if (highlight) {
    item.style.fontWeight = '600';
    item.style.fontSize = '16px';
    item.style.color = 'var(--color-text-primary)';
    item.style.borderTop = '1px solid var(--color-border)';
    item.style.marginTop = '8px';
    item.style.paddingTop = '12px';
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
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    document.body.appendChild(toastContainer);
    
    // Add CSS animation
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
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
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.backgroundColor = 'white';
  toast.style.color = type === 'error' ? '#e53e3e' : type === 'info' ? '#3182ce' : '#38a169';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  toast.style.marginTop = '8px';
  toast.style.animation = 'fadeIn 0.3s ease-out forwards';
  toast.style.minWidth = '250px';
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// Market labor rates - can be expanded with more job types and regions
const marketRates = {
  "locksmith": {
    "northeast": 85,
    "midwest": 65,
    "south": 60,
    "west": 90,
    "default": 75
  },
  "plumber": {
    "northeast": 95,
    "midwest": 80,
    "south": 75,
    "west": 100,
    "default": 85
  },
  "electrician": {
    "northeast": 90,
    "midwest": 75,
    "south": 70,
    "west": 95,
    "default": 80
  },
  "carpenter": {
    "northeast": 75,
    "midwest": 65,
    "south": 60,
    "west": 85,
    "default": 70
  },
  "handyman": {
    "northeast": 55,
    "midwest": 45,
    "south": 40,
    "west": 65,
    "default": 50
  },
  "default": {
    "northeast": 75,
    "midwest": 65,
    "south": 60,
    "west": 85,
    "default": 70
  }
};

// Tax rates by state
const taxRates = {
  "AL": 0.04, "AK": 0.00, "AZ": 0.056, "AR": 0.065, "CA": 0.0725,
  "CO": 0.029, "CT": 0.0635, "DE": 0.00, "FL": 0.06, "GA": 0.04,
  "HI": 0.04, "ID": 0.06, "IL": 0.0625, "IN": 0.07, "IA": 0.06,
  "KS": 0.065, "KY": 0.06, "LA": 0.0445, "ME": 0.055, "MD": 0.06,
  "MA": 0.0625, "MI": 0.06, "MN": 0.06875, "MS": 0.07, "MO": 0.04225,
  "MT": 0.00, "NE": 0.055, "NV": 0.0685, "NH": 0.00, "NJ": 0.06625,
  "NM": 0.05125, "NY": 0.04, "NC": 0.0475, "ND": 0.05, "OH": 0.0575,
  "OK": 0.045, "OR": 0.00, "PA": 0.06, "RI": 0.07, "SC": 0.06,
  "SD": 0.045, "TN": 0.07, "TX": 0.0625, "UT": 0.0595, "VT": 0.06,
  "VA": 0.053, "WA": 0.065, "WV": 0.06, "WI": 0.05, "WY": 0.04,
  "DC": 0.06, "PR": 0.115, "default": 0.06
};

// ZIP code to state mapping (first 3 digits for common states)
const zipCodePrefixes = {
  "010": "MA", "011": "MA", "012": "MA", "013": "MA", "014": "MA", "015": "MA", "016": "MA", "017": "MA", "018": "MA", "019": "MA",
  "020": "MA", "021": "MA", "022": "MA", "023": "MA", "024": "MA", "025": "MA", "026": "MA", "027": "RI", "028": "RI", "029": "RI",
  "030": "NH", "031": "NH", "032": "NH", "033": "NH", "034": "NH", "035": "NH", "036": "NH", "037": "NH", "038": "NH", "039": "ME",
  "040": "ME", "041": "ME", "042": "ME", "043": "ME", "044": "ME", "045": "ME", "046": "ME", "047": "ME", "048": "ME", "049": "ME",
  "050": "VT", "051": "VT", "052": "VT", "053": "VT", "054": "VT", "055": "VT", "056": "VT", "057": "VT", "058": "VT", "059": "VT",
  "060": "CT", "061": "CT", "062": "CT", "063": "CT", "064": "CT", "065": "CT", "066": "CT", "067": "CT", "068": "CT", "069": "CT",
  "070": "NJ", "071": "NJ", "072": "NJ", "073": "NJ", "074": "NJ", "075": "NJ", "076": "NJ", "077": "NJ", "078": "NJ", "079": "NJ",
  "080": "NJ", "081": "NJ", "082": "NJ", "083": "NJ", "084": "NJ", "085": "NJ", "086": "NJ", "087": "NJ", "088": "NJ", "089": "NJ",
  "100": "NY", "101": "NY", "102": "NY", "103": "NY", "104": "NY", "105": "NY", "106": "NY", "107": "NY", "108": "NY", "109": "NY",
  "110": "NY", "111": "NY", "112": "NY", "113": "NY", "114": "NY", "115": "NY", "116": "NY", "117": "NY", "118": "NY", "119": "NY",
  "120": "NY", "121": "NY", "122": "NY", "123": "NY", "124": "NY", "125": "NY", "126": "NY", "127": "NY", "128": "NY", "129": "NY",
  "130": "NY", "131": "NY", "132": "NY", "133": "NY", "134": "NY", "135": "NY", "136": "NY", "137": "NY", "138": "NY", "139": "NY",
  "140": "NY", "141": "NY", "142": "NY", "143": "NY", "144": "NY", "145": "NY", "146": "NY", "147": "NY", "148": "NY", "149": "NY",
  "150": "PA", "151": "PA", "152": "PA", "153": "PA", "154": "PA", "155": "PA", "156": "PA", "157": "PA", "158": "PA", "159": "PA",
  "160": "PA", "161": "PA", "162": "PA", "163": "PA", "164": "PA", "165": "PA", "166": "PA", "167": "PA", "168": "PA", "169": "PA",
  "170": "PA", "171": "PA", "172": "PA", "173": "PA", "174": "PA", "175": "PA", "176": "PA", "177": "PA", "178": "PA", "179": "PA",
  "180": "PA", "181": "PA", "182": "PA", "183": "PA", "184": "PA", "185": "PA", "186": "PA", "187": "PA", "188": "PA", "189": "PA",
  "190": "PA", "191": "PA", "192": "PA", "193": "PA", "194": "PA", "195": "PA", "196": "PA", "197": "DE", "198": "DE", "199": "DE",
  "200": "DC", "201": "DC", "202": "DC", "203": "DC", "204": "DC", "205": "DC", "206": "MD", "207": "MD", "208": "MD", "209": "MD",
  "300": "GA", "301": "GA", "302": "GA", "303": "GA", "304": "GA", "305": "GA", "306": "GA", "307": "GA", "308": "GA", "309": "GA",
  "310": "GA", "311": "GA", "312": "GA", "313": "GA", "314": "GA", "315": "GA", "316": "GA", "317": "GA", "318": "GA", "319": "GA",
  "320": "FL", "321": "FL", "322": "FL", "323": "FL", "324": "FL", "325": "FL", "326": "FL", "327": "FL", "328": "FL", "329": "FL",
  "330": "FL", "331": "FL", "332": "FL", "333": "FL", "334": "FL", "335": "FL", "336": "FL", "337": "FL", "338": "FL", "339": "FL",
  "400": "KY", "401": "KY", "402": "KY", "403": "KY", "404": "KY", "405": "KY", "406": "KY", "407": "KY", "408": "KY", "409": "KY",
  "600": "IL", "601": "IL", "602": "IL", "603": "IL", "604": "IL", "605": "IL", "606": "IL", "607": "IL", "608": "IL", "609": "IL",
  "900": "CA", "901": "CA", "902": "CA", "903": "CA", "904": "CA", "905": "CA", "906": "CA", "907": "CA", "908": "CA", "909": "CA",
  "910": "CA", "911": "CA", "912": "CA", "913": "CA", "914": "CA", "915": "CA", "916": "CA", "917": "CA", "918": "CA", "919": "CA",
  "920": "CA", "921": "CA", "922": "CA", "923": "CA", "924": "CA", "925": "CA", "926": "CA", "927": "CA", "928": "CA", "929": "CA",
  "930": "CA", "931": "CA", "932": "CA", "933": "CA", "934": "CA", "935": "CA", "936": "CA", "937": "CA", "938": "CA", "939": "CA",
  "940": "CA", "941": "CA", "942": "CA", "943": "CA", "944": "CA", "945": "CA", "946": "CA", "947": "CA", "948": "CA", "949": "CA",
  "950": "CA", "951": "CA", "952": "CA", "953": "CA", "954": "CA", "955": "CA", "956": "CA", "957": "CA", "958": "CA", "959": "CA",
  "960": "CA", "961": "CA"
};

// Region mapping already defined at the top of the file

/**
 * Render the Quote Generator page
 * @param {string} containerId - DOM element ID to render the interface
 */
export function renderQuoteGeneratorPage(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear the container
  container.innerHTML = '';
  
  // Create the quote generator container with responsive layout
  const quoteContainer = document.createElement('div');
  quoteContainer.classList.add('quote-generator');
  quoteContainer.style.display = 'flex';
  quoteContainer.style.flexDirection = 'column';
  quoteContainer.style.maxWidth = '1200px';
  quoteContainer.style.margin = '0 auto';
  quoteContainer.style.padding = '24px';
  quoteContainer.style.gap = '24px';
  
  // Add the header section
  const headerSection = createSectionHeader(
    'Job Quote Generator',
    'Create professional, profitable quotes for your service business'
  );
  quoteContainer.appendChild(headerSection);
  
  // Create form and result containers
  const formResultContainer = document.createElement('div');
  formResultContainer.style.display = 'grid';
  formResultContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  formResultContainer.style.gap = '24px';
  
  // Create quote form
  const quoteForm = createQuoteForm();
  formResultContainer.appendChild(quoteForm);
  
  // Create quote result section (initially empty)
  const quoteResultSection = document.createElement('div');
  quoteResultSection.id = 'quote-result-section';
  quoteResultSection.style.display = 'flex';
  quoteResultSection.style.flexDirection = 'column';
  quoteResultSection.style.gap = '16px';
  formResultContainer.appendChild(quoteResultSection);
  
  quoteContainer.appendChild(formResultContainer);
  container.appendChild(quoteContainer);
}

/**
 * Create a section header with title and subtitle
 * @param {string} title - The section title
 * @param {string} subtitle - The section subtitle
 * @returns {HTMLElement} The section header element
 */
// createSectionHeader function is already defined above

/**
 * Create the quote form
 * @returns {HTMLElement} The quote form
 */
function createQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.classList.add('quote-form-container');
  formContainer.style.background = 'var(--color-card-bg)';
  formContainer.style.borderRadius = '12px';
  formContainer.style.padding = '24px';
  formContainer.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
  
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Service Quote Details';
  formTitle.style.fontSize = '18px';
  formTitle.style.fontWeight = '600';
  formTitle.style.marginBottom = '16px';
  formTitle.style.color = 'var(--color-text-primary)';
  
  const form = document.createElement('form');
  form.id = 'quote-form';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '16px';
  
  // Job Type (with predefined options)
  const jobTypeGroup = createFormGroup(
    'Job Type', 
    createSelect('job_type', [
      { value: '', label: 'Select Job Type' },
      { value: 'locksmith', label: 'Locksmith Services' },
      { value: 'plumber', label: 'Plumbing Services' },
      { value: 'electrician', label: 'Electrical Services' },
      { value: 'carpenter', label: 'Carpentry Services' },
      { value: 'handyman', label: 'Handyman Services' },
      { value: 'custom', label: 'Custom Service Type' }
    ])
  );
  
  // Location (ZIP Code)
  const locationGroup = createFormGroup(
    'Location (ZIP Code)', 
    createInput('text', 'location', '', 'ZIP Code or City')
  );
  
  // Custom Job Type (conditional)
  const customJobTypeGroup = createFormGroup(
    'Custom Job Type', 
    createInput('text', 'custom_job_type', '', 'Enter Custom Job Type')
  );
  customJobTypeGroup.style.display = 'none';
  
  // Tools required
  const toolsGroup = createFormGroup(
    'Tools Required', 
    createTextarea('tools', 'Tools needed for the job (comma separated)')
  );
  
  // Hours estimate
  const hoursGroup = createFormGroup(
    'Estimated Hours', 
    createInput('number', 'hours', '1', 'Hours', '0.5', '1', '0.5')
  );
  
  // Tool costs
  const toolCostGroup = createFormGroup(
    'Tool/Materials Cost ($)', 
    createInput('number', 'tool_cost', '0', 'Cost in dollars', '0', '1000', '1')
  );
  
  // Travel distance
  const travelGroup = createFormGroup(
    'Travel Distance (miles)', 
    createInput('number', 'travel_distance', '5', 'Miles to job', '0', '100', '1')
  );
  
  // Experience adjustment
  const experienceGroup = createFormGroup(
    'Experience Adjustment (%)', 
    createInput('number', 'labor_adjustment', '0', 'Skill premium percentage', '-20', '50', '5')
  );
  
  const experienceHelper = document.createElement('div');
  experienceHelper.classList.add('helper-text');
  experienceHelper.textContent = 'Adjust based on your experience level: +10% for 5+ years, +20% for 10+ years';
  experienceHelper.style.fontSize = '12px';
  experienceHelper.style.color = 'var(--color-text-secondary)';
  experienceHelper.style.marginTop = '-12px';
  experienceGroup.appendChild(experienceHelper);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Generate Quote';
  submitButton.style.backgroundColor = 'var(--color-primary)';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.padding = '12px 16px';
  submitButton.style.fontWeight = '600';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'background-color 0.2s';
  submitButton.style.marginTop = '8px';
  
  // Handle custom job type display
  const jobTypeSelect = form.querySelector('select[name="job_type"]');
  if (jobTypeSelect) {
    jobTypeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        customJobTypeGroup.style.display = 'block';
      } else {
        customJobTypeGroup.style.display = 'none';
      }
    });
  }
  
  // Add event listener to form submission
  form.addEventListener('submit', handleQuoteFormSubmit);
  
  // Add all elements to the form
  form.appendChild(jobTypeGroup);
  form.appendChild(customJobTypeGroup);
  form.appendChild(locationGroup);
  form.appendChild(toolsGroup);
  form.appendChild(hoursGroup);
  form.appendChild(toolCostGroup);
  form.appendChild(travelGroup);
  form.appendChild(experienceGroup);
  form.appendChild(submitButton);
  
  formContainer.appendChild(formTitle);
  formContainer.appendChild(form);
  
  return formContainer;
}

/**
 * Handle form submission to generate a quote
 * @param {Event} e - Form submission event
 */
async function handleQuoteFormSubmit(e) {
  e.preventDefault();
  
  // Show loading state
  const resultSection = document.getElementById('quote-result-section');
  resultSection.innerHTML = '';
  
  const loadingElement = document.createElement('div');
  loadingElement.style.textAlign = 'center';
  loadingElement.style.padding = '24px';
  
  const spinner = document.createElement('div');
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.border = '4px solid var(--color-border)';
  spinner.style.borderTopColor = 'var(--color-primary)';
  spinner.style.borderRadius = '50%';
  spinner.style.margin = '0 auto 16px';
  spinner.style.animation = 'spin 1s linear infinite';
  
  // Ensure spin animation is defined
  if (!document.querySelector('#spinAnimation')) {
    const style = document.createElement('style');
    style.id = 'spinAnimation';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Calculating your quote...';
  
  loadingElement.appendChild(spinner);
  loadingElement.appendChild(loadingText);
  resultSection.appendChild(loadingElement);
  
  // Get form data
  const form = e.target;
  const formData = new FormData(form);
  const quoteData = {};
  
  for (const [key, value] of formData.entries()) {
    quoteData[key] = value;
  }
  
  // Handle custom job type
  if (quoteData.job_type === 'custom' && quoteData.custom_job_type) {
    quoteData.job_type = quoteData.custom_job_type;
  }
  
  try {
    // Generate quote
    const quoteResult = await generateQuote(quoteData);
    
    // Display quote result
    displayQuoteResult(quoteResult);
  } catch (error) {
    console.error('Error generating quote:', error);
    
    // Display error message
    resultSection.innerHTML = `
      <div style="background: #fff0f0; color: #e53e3e; padding: 16px; border-radius: 8px; text-align: center;">
        <h3 style="margin-bottom: 8px;">Error Generating Quote</h3>
        <p>${error.message || 'Please check your inputs and try again.'}</p>
      </div>
    `;
  }
}

/**
 * Generate a quote based on form data
 * @param {Object} quoteData - Form data for quote generation
 * @returns {Object} The generated quote result
 */
async function generateQuote(quoteData) {
  // Extract and validate form data
  const { 
    job_type, 
    location, 
    tools, 
    hours, 
    tool_cost, 
    travel_distance, 
    labor_adjustment 
  } = quoteData;
  
  // Validation
  if (!job_type || !location || !tools || !hours) {
    throw new Error('Please fill out all required fields.');
  }
  
  // Get state from ZIP code
  const state = getStateFromZip(location);
  
  // Get tax rate for the state
  const taxRate = getTaxRate(state);
  
  // Get market rate for job type and region
  const marketRate = await getMarketRate(job_type, state);
  
  // Adjust rate based on experience/skill level
  const adjustedRate = marketRate * (1 + (Number(labor_adjustment) / 100));
  
  // Calculate costs
  const travelCost = Number(travel_distance) * 0.65; // IRS mileage rate
  const laborCost = adjustedRate * Number(hours);
  const toolsMaterialsCost = Number(tool_cost);
  
  const subtotal = laborCost + toolsMaterialsCost + travelCost;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Profit analysis
  const estimatedCosts = (toolsMaterialsCost + (Number(travel_distance) * 0.25) + (Number(hours) * 25));
  const profit = total - estimatedCosts;
  const profitMargin = (profit / total) * 100;
  
  let profitAssessment;
  if (profitMargin < 15) {
    profitAssessment = "Low Margin";
  } else if (profitMargin < 30) {
    profitAssessment = "Healthy Margin";
  } else {
    profitAssessment = "Excellent Margin";
  }
  
  // Return quote result
  return {
    jobType: job_type,
    location: location,
    state: state,
    toolsRequired: tools,
    hours: Number(hours),
    
    marketRate: marketRate,
    adjustedRate: adjustedRate,
    
    laborCost: laborCost,
    toolsMaterialsCost: toolsMaterialsCost,
    travelCost: travelCost,
    
    subtotal: subtotal,
    taxRate: taxRate,
    tax: tax,
    total: total,
    
    profit: profit,
    profitMargin: profitMargin,
    profitAssessment: profitAssessment
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
  resultContainer.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
  resultContainer.style.position = 'relative';
  resultContainer.style.overflow = 'hidden';
  
  // Profit indicator tag
  const profitTag = document.createElement('div');
  profitTag.classList.add('profit-indicator');
  profitTag.textContent = quoteResult.profitAssessment;
  profitTag.style.position = 'absolute';
  profitTag.style.top = '0';
  profitTag.style.right = '0';
  profitTag.style.padding = '6px 12px';
  profitTag.style.fontSize = '12px';
  profitTag.style.fontWeight = 'bold';
  profitTag.style.color = 'white';
  profitTag.style.borderBottomLeftRadius = '8px';
  
  // Set color based on profit assessment
  if (quoteResult.profitAssessment === "Low Margin") {
    profitTag.style.backgroundColor = '#f56565';
  } else if (quoteResult.profitAssessment === "Healthy Margin") {
    profitTag.style.backgroundColor = '#38a169';
  } else {
    profitTag.style.backgroundColor = '#3182ce';
  }
  
  // Result title
  const resultTitle = document.createElement('h3');
  resultTitle.textContent = 'Quote Summary';
  resultTitle.style.fontSize = '18px';
  resultTitle.style.fontWeight = '600';
  resultTitle.style.marginBottom = '16px';
  resultTitle.style.color = 'var(--color-text-primary)';
  
  // Total amount
  const totalAmount = document.createElement('div');
  totalAmount.classList.add('total-amount');
  totalAmount.style.fontSize = '32px';
  totalAmount.style.fontWeight = '700';
  totalAmount.style.marginBottom = '24px';
  totalAmount.style.color = 'var(--color-primary)';
  totalAmount.textContent = `$${quoteResult.total.toFixed(2)}`;
  
  // Job details
  const jobDetails = document.createElement('div');
  jobDetails.classList.add('job-details');
  jobDetails.style.marginBottom = '24px';
  
  const jobType = document.createElement('p');
  jobType.innerHTML = `<strong>Job Type:</strong> ${quoteResult.jobType}`;
  jobType.style.marginBottom = '8px';
  
  const location = document.createElement('p');
  location.innerHTML = `<strong>Location:</strong> ${quoteResult.location} (${quoteResult.state})`;
  location.style.marginBottom = '8px';
  
  const hours = document.createElement('p');
  hours.innerHTML = `<strong>Estimated Hours:</strong> ${quoteResult.hours}`;
  hours.style.marginBottom = '8px';
  
  jobDetails.appendChild(jobType);
  jobDetails.appendChild(location);
  jobDetails.appendChild(hours);
  
  // Cost breakdown
  const costBreakdown = document.createElement('div');
  costBreakdown.classList.add('cost-breakdown');
  costBreakdown.style.marginBottom = '24px';
  
  const breakdownTitle = document.createElement('h4');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '16px';
  breakdownTitle.style.fontWeight = '600';
  breakdownTitle.style.marginBottom = '12px';
  
  const breakdownList = document.createElement('ul');
  breakdownList.style.listStyle = 'none';
  breakdownList.style.padding = '0';
  breakdownList.style.margin = '0';
  
  const laborItem = createBreakdownItem('Labor', quoteResult.laborCost);
  const toolsItem = createBreakdownItem('Tools & Materials', quoteResult.toolsMaterialsCost);
  const travelItem = createBreakdownItem('Travel', quoteResult.travelCost);
  const subtotalItem = createBreakdownItem('Subtotal', quoteResult.subtotal, true);
  const taxItem = createBreakdownItem(`Tax (${(quoteResult.taxRate * 100).toFixed(1)}%)`, quoteResult.tax);
  const totalItem = createBreakdownItem('Total', quoteResult.total, true);
  
  breakdownList.appendChild(laborItem);
  breakdownList.appendChild(toolsItem);
  breakdownList.appendChild(travelItem);
  breakdownList.appendChild(subtotalItem);
  breakdownList.appendChild(taxItem);
  breakdownList.appendChild(totalItem);
  
  costBreakdown.appendChild(breakdownTitle);
  costBreakdown.appendChild(breakdownList);
  
  // Profit analysis
  const profitAnalysis = document.createElement('div');
  profitAnalysis.classList.add('profit-analysis');
  profitAnalysis.style.marginBottom = '24px';
  profitAnalysis.style.padding = '16px';
  profitAnalysis.style.borderRadius = '8px';
  profitAnalysis.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  
  const profitTitle = document.createElement('h4');
  profitTitle.textContent = 'Profit Analysis';
  profitTitle.style.fontSize = '16px';
  profitTitle.style.fontWeight = '600';
  profitTitle.style.marginBottom = '12px';
  
  const profitMargin = document.createElement('p');
  profitMargin.innerHTML = `<strong>Profit Margin:</strong> ${quoteResult.profitMargin.toFixed(1)}%`;
  profitMargin.style.marginBottom = '8px';
  
  const profitAmount = document.createElement('p');
  profitAmount.innerHTML = `<strong>Estimated Profit:</strong> $${quoteResult.profit.toFixed(2)}`;
  
  profitAnalysis.appendChild(profitTitle);
  profitAnalysis.appendChild(profitMargin);
  profitAnalysis.appendChild(profitAmount);
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.classList.add('action-buttons');
  actionButtons.style.display = 'flex';
  actionButtons.style.gap = '12px';
  actionButtons.style.marginTop = '16px';
  
  const saveButton = createButton('Save Quote', () => saveQuote(quoteResult));
  const printButton = createButton('Print Quote', () => printQuote(quoteResult));
  const createInvoiceButton = createButton('Create Invoice', () => createInvoiceFromQuote(quoteResult));
  
  actionButtons.appendChild(saveButton);
  actionButtons.appendChild(printButton);
  actionButtons.appendChild(createInvoiceButton);
  
  // Assemble result container
  resultContainer.appendChild(profitTag);
  resultContainer.appendChild(resultTitle);
  resultContainer.appendChild(totalAmount);
  resultContainer.appendChild(jobDetails);
  resultContainer.appendChild(costBreakdown);
  resultContainer.appendChild(profitAnalysis);
  resultContainer.appendChild(actionButtons);
  
  resultSection.appendChild(resultContainer);
}

/**
 * Create a breakdown item for the cost breakdown list
 * @param {string} label - Item label
 * @param {number} amount - Item amount
 * @param {boolean} highlight - Whether to highlight the item
 * @returns {HTMLElement} The breakdown item
 */
function createBreakdownItem(label, amount, highlight = false) {
  const item = document.createElement('li');
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.padding = '8px 0';
  item.style.borderBottom = '1px solid var(--color-border)';
  
  if (highlight) {
    item.style.fontWeight = '600';
    item.style.fontSize = '16px';
  }
  
  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  
  const amountSpan = document.createElement('span');
  amountSpan.textContent = `$${amount.toFixed(2)}`;
  
  item.appendChild(labelSpan);
  item.appendChild(amountSpan);
  
  return item;
}

/**
 * Save quote to local storage
 * @param {Object} quoteResult - The quote result to save
 */
function saveQuote(quoteResult) {
  try {
    // Generate unique ID for the quote
    const quoteId = `quote_${Date.now()}`;
    
    // Add timestamp and ID to quote
    const quoteToSave = {
      ...quoteResult,
      id: quoteId,
      timestamp: new Date().toISOString(),
      status: 'saved'
    };
    
    // Get existing quotes from storage
    let savedQuotes = [];
    const existingQuotes = localStorage.getItem('stackr_saved_quotes');
    
    if (existingQuotes) {
      savedQuotes = JSON.parse(existingQuotes);
    }
    
    // Add new quote to the array
    savedQuotes.push(quoteToSave);
    
    // Save back to local storage
    localStorage.setItem('stackr_saved_quotes', JSON.stringify(savedQuotes));
    
    // Show success message
    showToast('Quote saved successfully!');
  } catch (error) {
    console.error('Error saving quote:', error);
    showToast('Failed to save quote. Please try again.', 'error');
  }
}

/**
 * Print the quote
 * @param {Object} quoteResult - The quote result to print
 */
function printQuote(quoteResult) {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site to print quotes.');
    }
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quote - ${quoteResult.jobType}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .quote-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .quote-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .quote-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .quote-header p {
            font-size: 14px;
            color: #666;
          }
          .quote-details {
            margin-bottom: 30px;
          }
          .quote-amount {
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #2563eb;
          }
          .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .breakdown-table th {
            text-align: left;
            padding: 8px;
            border-bottom: 2px solid #ddd;
          }
          .breakdown-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .breakdown-table .total-row {
            font-weight: bold;
          }
          .amount-col {
            text-align: right;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="quote-container">
          <div class="quote-header">
            <h1>Service Quote</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="quote-details">
            <p><strong>Job Type:</strong> ${quoteResult.jobType}</p>
            <p><strong>Location:</strong> ${quoteResult.location} (${quoteResult.state})</p>
            <p><strong>Estimated Hours:</strong> ${quoteResult.hours}</p>
            <p><strong>Tools Required:</strong> ${quoteResult.toolsRequired}</p>
          </div>
          
          <div class="quote-amount">
            $${quoteResult.total.toFixed(2)}
          </div>
          
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Labor (${quoteResult.hours} hrs @ $${quoteResult.adjustedRate.toFixed(2)}/hr)</td>
                <td class="amount-col">$${quoteResult.laborCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tools & Materials</td>
                <td class="amount-col">$${quoteResult.toolsMaterialsCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Travel</td>
                <td class="amount-col">$${quoteResult.travelCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td class="amount-col">$${quoteResult.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax (${(quoteResult.taxRate * 100).toFixed(1)}%)</td>
                <td class="amount-col">$${quoteResult.tax.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total</td>
                <td class="amount-col">$${quoteResult.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for considering our services.</p>
            <p>This quote is valid for 30 days from the date of issue.</p>
          </div>
        </div>
        <script>
          // Auto print when loaded
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    // Write to the new window and print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  } catch (error) {
    console.error('Error printing quote:', error);
    showToast(error.message || 'Failed to print quote. Please try again.', 'error');
  }
}

/**
 * Create an invoice from quote
 * @param {Object} quoteResult - The quote to convert to invoice
 */
function createInvoiceFromQuote(quoteResult) {
  try {
    // Store quote data in session storage
    sessionStorage.setItem('quote_to_invoice', JSON.stringify(quoteResult));
    
    // Show success message
    showToast('Converting to invoice...');
    
    // Navigate to invoices page
    window.location.hash = 'invoices';
  } catch (error) {
    console.error('Error creating invoice from quote:', error);
    showToast('Failed to create invoice. Please try again.', 'error');
  }
}

/* Utility functions */

/**
 * Get state from ZIP code
 * @param {string} location - ZIP code or location string
 * @returns {string} State code
 */
function getStateFromZip(location) {
  // Clean up the location string
  const zipString = location.trim().substring(0, 5);
  
  // Check if it's a valid ZIP code
  if (/^\d{5}$/.test(zipString)) {
    const prefix = zipString.substring(0, 3);
    
    // Look up state from ZIP code prefix
    if (zipCodePrefixes[prefix]) {
      return zipCodePrefixes[prefix];
    }
  }
  
  // Default to a placeholder state if we can't determine it
  return 'default';
}

/**
 * Get tax rate for a state
 * @param {string} state - State code
 * @returns {number} Tax rate (as a decimal)
 */
function getTaxRate(state) {
  return taxRates[state] || taxRates.default;
}

/**
 * Get market rate for job type and location
 * @param {string} jobType - Type of job
 * @param {string} state - State code
 * @returns {Promise<number>} Market rate for the job
 */
async function getMarketRate(jobType, state) {
  // Determine region from state
  const region = stateToRegion[state] || stateToRegion.default;
  
  // Normalize job type
  const normalizedJobType = jobType.toLowerCase();
  
  // Check if we have rates for this job type
  let jobRates = marketRates[normalizedJobType];
  
  // If not, use default rates
  if (!jobRates) {
    jobRates = marketRates.default;
  }
  
  // Return rate for this region, or default if not found
  return jobRates[region] || jobRates.default;
}

/**
 * Create a form group
 * @param {string} labelText - Label text
 * @param {HTMLElement} inputElement - Input element
 * @returns {HTMLElement} Form group
 */
function createFormGroup(labelText, inputElement) {
  const formGroup = document.createElement('div');
  formGroup.classList.add('form-group');
  formGroup.style.marginBottom = '16px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '6px';
  label.style.fontSize = '14px';
  label.style.fontWeight = '500';
  
  formGroup.appendChild(label);
  formGroup.appendChild(inputElement);
  
  return formGroup;
}

/**
 * Create an input element
 * @param {string} type - Input type
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {string} placeholder - Input placeholder
 * @param {string} min - Minimum value (for number inputs)
 * @param {string} max - Maximum value (for number inputs)
 * @param {string} step - Step value (for number inputs)
 * @returns {HTMLElement} Input element
 */
function createInput(type, name, value, placeholder, min, max, step) {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  input.style.width = '100%';
  input.style.padding = '10px 12px';
  input.style.border = '1px solid var(--color-border)';
  input.style.borderRadius = '6px';
  input.style.fontSize = '14px';
  
  if (type === 'number') {
    if (min !== undefined) input.min = min;
    if (max !== undefined) input.max = max;
    if (step !== undefined) input.step = step;
  }
  
  return input;
}

/**
 * Create a textarea element
 * @param {string} name - Textarea name
 * @param {string} placeholder - Textarea placeholder
 * @returns {HTMLElement} Textarea element
 */
function createTextarea(name, placeholder) {
  const textarea = document.createElement('textarea');
  textarea.name = name;
  textarea.placeholder = placeholder;
  textarea.rows = 3;
  textarea.style.width = '100%';
  textarea.style.padding = '10px 12px';
  textarea.style.border = '1px solid var(--color-border)';
  textarea.style.borderRadius = '6px';
  textarea.style.fontSize = '14px';
  textarea.style.resize = 'vertical';
  
  return textarea;
}

/**
 * Create a select element
 * @param {string} name - Select name
 * @param {Array} options - Array of option objects with value and label properties
 * @returns {HTMLElement} Select element
 */
function createSelect(name, options) {
  const select = document.createElement('select');
  select.name = name;
  select.style.width = '100%';
  select.style.padding = '10px 12px';
  select.style.border = '1px solid var(--color-border)';
  select.style.borderRadius = '6px';
  select.style.fontSize = '14px';
  select.style.backgroundColor = 'var(--color-card-bg)';
  
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    select.appendChild(optionElement);
  });
  
  return select;
}

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Button element
 */
function createButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  button.style.padding = '10px 16px';
  button.style.backgroundColor = 'var(--color-card-bg)';
  button.style.border = '1px solid var(--color-border)';
  button.style.borderRadius = '6px';
  button.style.fontSize = '14px';
  button.style.cursor = 'pointer';
  button.style.transition = 'all 0.2s';
  button.style.flex = '1';
  
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = 'var(--color-border)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = 'var(--color-card-bg)';
  });
  
  return button;
}

/**
 * Create section header component
 * @param {string} title - Section title
 * @param {string} subtitle - Section subtitle
 * @returns {HTMLElement} Section header element
// createSectionHeader function is already defined above
 */
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'success') {
  // Check if toast container exists
  let toastContainer = document.getElementById('toast-container');
  
  // Create toast container if it doesn't exist
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
  toast.classList.add('toast');
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
 * Helper function to add displayPageTitle for main.js compatibility
 * @param {string} title - The page title to display
 */
function displayPageTitle(title) {
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
}