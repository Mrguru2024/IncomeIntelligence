/**
 * Quote Generator Module
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

// Import necessary utility functions
import { updateViewportClasses } from './src/main.js';

// Global form state cache to preserve form data during orientation changes
let cachedFormState = {
  autoQuote: null,
  generalQuote: null,
  lastActiveTab: null
};

// Safe wrapper for viewport detection to prevent form reset issues
function getViewportData() {
  // Save form state before any viewport update
  saveCurrentFormState();
  
  try {
    return updateViewportClasses();
  } catch (error) {
    console.error("Error getting viewport data:", error);
    // Fallback if function fails
    return { 
      width: window.innerWidth, 
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      isFoldableClosed: window.innerWidth < 400 && (window.innerWidth / window.innerHeight) < 0.7,
      isFoldableOpen: window.innerWidth >= 500 && window.innerWidth < 840 && (window.innerWidth / window.innerHeight) > 0.9
    };
  } finally {
    // Restore form state after viewport update (with slight delay to ensure DOM is ready)
    setTimeout(restoreFormState, 100);
  }
}

// Function to save current form state
function saveCurrentFormState() {
  // Auto service quote form
  const autoForm = document.getElementById('auto-quote-form');
  if (autoForm) {
    const formState = {};
    
    // Get all the inputs in the form
    const inputs = autoForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        formState[input.name] = input.checked;
      } else {
        formState[input.name] = input.value;
      }
    });
    
    // Save to both in-memory cache and localStorage for persistence
    cachedFormState.autoQuote = formState;
    localStorage.setItem('stackr_auto_quote_form', JSON.stringify(formState));
    console.log('Saved auto quote form state to localStorage');
  }
  
  // General service quote form
  const generalForm = document.getElementById('general-quote-form');
  if (generalForm) {
    const formState = {};
    
    // Get all the inputs in the form
    const inputs = generalForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        formState[input.name] = input.checked;
      } else {
        formState[input.name] = input.value;
      }
    });
    
    // Save to both in-memory cache and localStorage for persistence
    cachedFormState.generalQuote = formState;
    localStorage.setItem('stackr_general_quote_form', JSON.stringify(formState));
    console.log('Saved general quote form state to localStorage');
  }
  
  // Save active tab
  const activeTab = document.querySelector('.form-tab.active');
  if (activeTab) {
    const activeTabValue = activeTab.getAttribute('data-tab');
    cachedFormState.lastActiveTab = activeTabValue;
    localStorage.setItem('stackr_quote_active_tab', activeTabValue);
    console.log('Saved active tab to localStorage:', activeTabValue);
  }
}

// Function to restore form state
function restoreFormState() {
  console.log('Attempting to restore form state');
  
  // Try to load state from localStorage first (most persistent)
  try {
    // Restore active tab first from localStorage
    const savedTab = localStorage.getItem('stackr_quote_active_tab');
    if (savedTab) {
      cachedFormState.lastActiveTab = savedTab;
      console.log('Loaded active tab from localStorage:', savedTab);
    }
    
    // Restore auto form data from localStorage
    const savedAutoForm = localStorage.getItem('stackr_auto_quote_form');
    if (savedAutoForm) {
      try {
        cachedFormState.autoQuote = JSON.parse(savedAutoForm);
        console.log('Loaded auto form data from localStorage');
      } catch (err) {
        console.error('Error parsing auto form data:', err);
      }
    }
    
    // Restore general form data from localStorage
    const savedGeneralForm = localStorage.getItem('stackr_general_quote_form');
    if (savedGeneralForm) {
      try {
        cachedFormState.generalQuote = JSON.parse(savedGeneralForm);
        console.log('Loaded general form data from localStorage');
      } catch (err) {
        console.error('Error parsing general form data:', err);
      }
    }
  } catch (err) {
    console.error('Error accessing localStorage:', err);
  }
  
  // Restore active tab first
  if (cachedFormState.lastActiveTab) {
    const tabs = document.querySelectorAll('.form-tab');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === cachedFormState.lastActiveTab) {
        // Instead of using click() which can trigger reloads,
        // manually set the styles and display properties
        
        // First, reset all tabs
        tabs.forEach(t => {
          t.style.borderBottom = 'none';
          t.style.fontWeight = 'normal';
          t.style.color = 'var(--color-text-secondary)';
          t.classList.remove('active');
        });
        
        // Style the active tab
        tab.style.borderBottom = '3px solid var(--color-primary)';
        tab.style.fontWeight = 'bold';
        tab.style.color = 'var(--color-text)';
        tab.classList.add('active');
        
        // Show/hide form based on tab
        const isGeneralTab = tab.getAttribute('data-tab') === 'general';
        const generalForm = document.getElementById('general-quote-form');
        const autoForm = document.getElementById('auto-quote-form');
        
        if (generalForm && autoForm) {
          generalForm.style.display = isGeneralTab ? 'block' : 'none';
          autoForm.style.display = isGeneralTab ? 'none' : 'block';
        }
        
        console.log('Restored active tab:', tab.getAttribute('data-tab'));
      }
    });
  }
  
  // Add input event listeners for all form fields to continually save state
  function addAutoSaveListeners(form, storageName) {
    if (!form) return;
    
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
      // Only add listener once
      if (!input.dataset.hasSaveListener) {
        input.addEventListener('input', () => {
          // Immediately save form state on any change
          saveCurrentFormState();
        });
        // Mark as having listener added
        input.dataset.hasSaveListener = 'true';
      }
    });
  }
  
  // Restore auto form fields
  const autoForm = document.getElementById('auto-quote-form');
  if (cachedFormState.autoQuote && autoForm) {
    const formState = cachedFormState.autoQuote;
    const formControls = autoForm.querySelectorAll('input, select, textarea');
    
    formControls.forEach(control => {
      const name = control.name;
      if (name && formState[name] !== undefined) {
        if (control.type === 'checkbox') {
          control.checked = formState[name] === true || formState[name] === 'true';
        } else {
          control.value = formState[name];
        }
      }
    });
    
    // Add auto-save listeners
    addAutoSaveListeners(autoForm, 'stackr_auto_quote_form');
    
    console.log('Restored auto quote form state');
  }
  
  // Restore general form fields
  const generalForm = document.getElementById('general-quote-form');
  if (cachedFormState.generalQuote && generalForm) {
    const formState = cachedFormState.generalQuote;
    const formControls = generalForm.querySelectorAll('input, select, textarea');
    
    formControls.forEach(control => {
      const name = control.name;
      if (name && formState[name] !== undefined) {
        if (control.type === 'checkbox') {
          control.checked = formState[name] === true || formState[name] === 'true';
        } else {
          control.value = formState[name];
        }
      }
    });
    
    // Add auto-save listeners
    addAutoSaveListeners(generalForm, 'stackr_general_quote_form');
    
    console.log('Restored general quote form state');
  }
}

// Function to initialize the form state preservation system
function initFormStatePreservation() {
  // Skip if already initialized
  if (window.quoteFormPreservationSetup) return;
  
  console.log('Initializing quote form state preservation system');
  
  // Register for orientation change events
  window.addEventListener('orientationchange', function() {
    console.log('Orientation changed - preserving quote form state');
    saveCurrentFormState();
    // Allow DOM to update and then restore with increased delay for ZFold devices
    setTimeout(restoreFormState, 500);
  });
  
  // Add MutationObserver to detect quote form reset
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && 
         (mutation.target.id === 'auto-quote-form' || 
          mutation.target.id === 'general-quote-form' ||
          mutation.target.classList.contains('quote-generator-container'))) {
        console.log('Quote form DOM changed - checking if data needs restoration');
        // Only restore if form fields are empty (reset occurred)
        const autoForm = document.getElementById('auto-quote-form');
        const generalForm = document.getElementById('general-quote-form');
        
        if ((autoForm && cachedFormState.autoQuote && Object.keys(cachedFormState.autoQuote).length > 0) || 
            (generalForm && cachedFormState.generalQuote && Object.keys(cachedFormState.generalQuote).length > 0)) {
          console.log('Form reset detected - restoring saved data');
          setTimeout(restoreFormState, 100);
        }
      }
    });
  });
  
  // Start observing after a delay to let DOM initialize
  setTimeout(() => {
    const container = document.querySelector('.quote-generator-container');
    if (container) {
      observer.observe(container, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['value']
      });
      console.log('Form reset detection observer started');
    }
  }, 1000);
  
  window.quoteFormPreservationSetup = true;
}

// Add special handling for ZFold and other foldable devices
// This is a global fix for form submission issues on foldable devices
window.addEventListener('DOMContentLoaded', () => {
  // Initialize form state preservation system on page load
  initFormStatePreservation();
  
  // Try immediate restore to handle page loads and navigation
  try {
    setTimeout(restoreFormState, 500); // Wait for DOM to be ready
  } catch (err) {
    console.error('Error restoring form state on load:', err);
  }
  
  // Check if this is a foldable device using our safe viewport helper
  const { width, isFoldableClosed } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  if (isFoldableDevice) {
    console.log('Foldable device detected - applying special form handling');
    
    // Add global event listener to prevent all form submissions in the quote generator
    document.addEventListener('submit', function(e) {
      // Get path to the event target
      const path = e.composedPath();
      
      // Check if any element in the path has ID "auto-quote-form"
      const isQuoteForm = path.some(el => 
        el.id === 'auto-quote-form' || 
        (el.getAttribute && el.getAttribute('id') === 'auto-quote-form') ||
        el.id === 'quote-form' || 
        (el.getAttribute && el.getAttribute('id') === 'quote-form')
      );
      
      if (isQuoteForm) {
        console.log('ZFold protection: Prevented quote form submission');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Save form state immediately on submission attempt
        saveCurrentFormState();
        
        // Process the form data manually instead
        const formId = e.target.id;
        if (formId === 'auto-quote-form') {
          handleAutoQuoteFormSubmit(e);
        } else if (formId === 'quote-form') {
          handleQuoteFormSubmit(e);
        }
        
        return false;
      }
    }, true); // Use capture to ensure this runs first
    
    // Remove the problematic focus event handler that was preventing input field interaction
    // The original code was preventing users from interacting with form fields
    
    console.log('ZFold protections applied (input field blocking removed)');
  }
  
  // Add input event listeners to continuously save form state as user types
  window.addEventListener('input', function(e) {
    // Only for form elements
    if (e.target.form && 
        (e.target.form.id === 'auto-quote-form' || 
         e.target.form.id === 'quote-form' ||
         e.target.form.id === 'general-quote-form')) {
      
      // Debounce the save - don't save on every keystroke
      if (window.formSaveTimeout) {
        clearTimeout(window.formSaveTimeout);
      }
      
      window.formSaveTimeout = setTimeout(function() {
        saveCurrentFormState();
      }, 300); // Save after 300ms of inactivity
    }
  });
});

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
  // Trade services rates
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
  
  // Beauty and wellness service rates
  "hair_stylist": {
    "northeast": 90,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 95
  },
  "makeup_artist": {
    "northeast": 125,
    "midwest": 95,
    "southeast": 85,
    "southwest": 95,
    "west": 150
  },
  "nail_technician": {
    "northeast": 75,
    "midwest": 60,
    "southeast": 55,
    "southwest": 65,
    "west": 85
  },
  "esthetician": {
    "northeast": 105,
    "midwest": 85,
    "southeast": 80,
    "southwest": 90,
    "west": 115
  },
  "massage_therapist": {
    "northeast": 110,
    "midwest": 90,
    "southeast": 85,
    "southwest": 95,
    "west": 120
  },
  
  // Creative service rates
  "photographer": {
    "northeast": 150,
    "midwest": 120,
    "southeast": 110,
    "southwest": 125,
    "west": 175
  },
  "videographer": {
    "northeast": 175,
    "midwest": 145,
    "southeast": 135,
    "southwest": 150,
    "west": 200
  },
  "graphic_designer": {
    "northeast": 125,
    "midwest": 95,
    "southeast": 85,
    "southwest": 100,
    "west": 140
  },
  "web_designer": {
    "northeast": 135,
    "midwest": 105,
    "southeast": 95,
    "southwest": 110,
    "west": 150
  },
  "illustrator": {
    "northeast": 115,
    "midwest": 90,
    "southeast": 80,
    "southwest": 95,
    "west": 130
  },
  
  // Event service rates
  "event_planner": {
    "northeast": 110,
    "midwest": 90,
    "southeast": 85,
    "southwest": 95,
    "west": 125
  },
  "caterer": {
    "northeast": 95,
    "midwest": 75,
    "southeast": 70,
    "southwest": 80,
    "west": 100
  },
  "dj": {
    "northeast": 125,
    "midwest": 100,
    "southeast": 95,
    "southwest": 110,
    "west": 140
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
  
  // Check if we're on a foldable device using our safe viewport helper
  const { width, isFoldableClosed } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  // Adjust margin and spacing for screen size
  if (isFoldableDevice) {
    formGroup.style.marginBottom = '12px'; // Smaller margin on small screens
  } else {
    formGroup.style.marginBottom = '16px';
  }
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  
  // Adjust font size and spacing for screen size
  if (isFoldableDevice) {
    label.style.marginBottom = '6px';
    label.style.fontSize = '13px';
  } else {
    label.style.marginBottom = '8px';
    label.style.fontSize = '14px';
  }
  
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
  
  // Check if we're on a foldable device using our safe viewport helper
  const { width, isFoldableClosed } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  // Adjust padding and font size for screen size
  if (isFoldableDevice) {
    input.style.padding = '8px';
    input.style.fontSize = '13px';
  } else {
    input.style.padding = '10px';
    input.style.fontSize = '14px';
  }
  
  input.style.borderRadius = '6px';
  input.style.border = '1px solid var(--color-border)';
  input.style.backgroundColor = 'var(--color-input-bg)';
  
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
  
  // Check if we're on a foldable device using our safe viewport helper
  const { width, isFoldableClosed } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  // Adjust sizes for screen size
  if (isFoldableDevice) {
    textarea.style.padding = '8px';
    textarea.style.fontSize = '13px';
    textarea.style.minHeight = '80px'; // Smaller height on small screens
  } else {
    textarea.style.padding = '10px';
    textarea.style.fontSize = '14px';
    textarea.style.minHeight = '100px';
  }
  
  textarea.style.borderRadius = '6px';
  textarea.style.border = '1px solid var(--color-border)';
  textarea.style.backgroundColor = 'var(--color-input-bg)';
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
  
  // Check if we're on a foldable device using our safe viewport helper
  const { width, isFoldableClosed } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  // Adjust margin for screen size
  if (isFoldableDevice) {
    header.style.marginBottom = '16px';
  } else {
    header.style.marginBottom = '24px';
  }
  
  const titleElement = document.createElement('h2');
  titleElement.textContent = title;
  
  // Adjust font size for screen size
  if (isFoldableDevice) {
    titleElement.style.fontSize = '18px';
    titleElement.style.marginBottom = '6px';
  } else {
    titleElement.style.fontSize = '20px';
    titleElement.style.marginBottom = '8px';
  }
  
  titleElement.style.fontWeight = 'bold';
  
  const subtitleElement = document.createElement('p');
  subtitleElement.textContent = subtitle;
  
  // Adjust font size for screen size
  if (isFoldableDevice) {
    subtitleElement.style.fontSize = '13px';
  } else {
    subtitleElement.style.fontSize = '14px';
  }
  
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
  item.className = 'breakdown-item';
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
  labelElement.className = 'item-label';
  labelElement.textContent = label;
  
  const amountElement = document.createElement('span');
  amountElement.className = 'item-value';
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
 * Load Google Places API script
 * @param {Function} callback - Callback function to run after script is loaded
 */
function loadGooglePlacesAPI(callback) {
  // Flag to track if we've already set up the fallback
  let fallbackInitialized = false;
  let googlePlacesInitialized = false;
  
  // Function to initialize our own basic address validation as fallback
  function setupAddressValidationFallback() {
    if (fallbackInitialized) return;
    fallbackInitialized = true;
    
    console.log("Setting up fallback address validation");
    
    // Add CSS to ensure our fallback UI works properly
    const fallbackStyle = document.createElement('style');
    fallbackStyle.textContent = `
      .address-suggestions {
        position: absolute;
        z-index: 10000;
        background: white;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        margin-top: 2px;
      }
      .address-suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      }
      .address-suggestion-item:hover {
        background-color: #f5f5f5;
      }
    `;
    document.head.appendChild(fallbackStyle);
    
    // Clear any existing alert message first
    const existingMessage = document.querySelector('.maps-status-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create a message element to display status
    const helpMessage = document.createElement('div');
    helpMessage.className = 'help-message maps-status-message';
    helpMessage.style.marginBottom = '20px';
    helpMessage.style.padding = '12px';
    helpMessage.style.borderRadius = '6px';
    helpMessage.style.backgroundColor = '#FEF3C7';
    helpMessage.style.color = '#92400E';
    helpMessage.style.fontSize = '14px';
    helpMessage.style.lineHeight = '1.5';
    
    // Check for specific error types
    const apiErrorMessage = window.googleMapsError || '';
    
    if (apiErrorMessage.includes('billing')) {
      showToast('Address autocomplete unavailable temporarily', 'warning');
      
      helpMessage.innerHTML = `
        <h3 style="margin-top: 0; font-weight: 600; font-size: 16px;">Address Autocomplete Unavailable</h3>
        <p>The address autocomplete feature is currently unavailable due to a configuration issue.</p>
        <p>You can still enter addresses manually in the meantime.</p>
        <p>Our team has been notified and is working to resolve this.</p>
      `;
    } else {
      showToast('Using basic address validation', 'info');
      
      helpMessage.innerHTML = `
        <h3 style="margin-top: 0; font-weight: 600; font-size: 16px;">Address Autocomplete Limited</h3>
        <p>Enhanced address lookup is temporarily unavailable. You can still enter addresses manually.</p>
        <p>Basic validation will help ensure your addresses are properly formatted.</p>
      `;
    }
    
    // Insert message at the beginning of the form container
    setTimeout(() => {
      const formContainer = document.querySelector('.quote-generator-container');
      const tabsContainer = document.querySelector('.quote-generator-container > div');
      
      if (formContainer && tabsContainer) {
        formContainer.insertBefore(helpMessage, tabsContainer.nextSibling);
      } else {
        // Fallback to inserting after location input if container not found
        const locationInput = document.getElementById('general-location-input');
        if (locationInput && locationInput.parentNode) {
          locationInput.parentNode.insertAdjacentElement('afterend', helpMessage);
        }
      }
    }, 500);
    
    // Helper function to add validation and suggestions to an input field
    function setupBasicAddressField(inputId) {
      const inputField = document.getElementById(inputId);
      if (!inputField) return;
      
      console.log(`Setting up enhanced fallback for address field: ${inputId}`);
      
      // Create a suggestions container
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'address-suggestions';
      suggestionsContainer.style.display = 'none';
      
      // Add the suggestions container after the input field
      inputField.parentNode.insertBefore(suggestionsContainer, inputField.nextSibling);
      
      // Add input event listener for address suggestions
      let debounceTimer;
      inputField.addEventListener('input', function() {
        const value = inputField.value.trim();
        
        // Clear existing timer to prevent multiple requests
        clearTimeout(debounceTimer);
        
        // Hide suggestions if input is too short
        if (value.length < 3) {
          suggestionsContainer.style.display = 'none';
          return;
        }
        
        // Debounce the API call
        debounceTimer = setTimeout(() => {
          console.log(`Fetching address suggestions for: ${value}`);
          
          // Fetch suggestions from our backend endpoint
          fetch(`/api/address-suggestions?query=${encodeURIComponent(value)}`)
            .then(response => response.json())
            .then(data => {
              // Clear previous suggestions
              suggestionsContainer.innerHTML = '';
              
              if (data.predictions && data.predictions.length > 0) {
                console.log(`Got ${data.predictions.length} address suggestions`);
                
                // Add each suggestion as a clickable item
                data.predictions.forEach(prediction => {
                  const item = document.createElement('div');
                  item.className = 'address-suggestion-item';
                  item.textContent = prediction.description;
                  
                  item.addEventListener('click', () => {
                    inputField.value = prediction.description;
                    suggestionsContainer.style.display = 'none';
                    
                    // If this is a valid selection, store the state in data attribute if available
                    if (prediction.state) {
                      const dataElement = document.getElementById(`${inputId.replace('-input', '')}-place-data`);
                      if (dataElement) {
                        dataElement.dataset.state = prediction.state;
                      }
                    }
                  });
                  
                  suggestionsContainer.appendChild(item);
                });
                
                // Show the suggestions
                suggestionsContainer.style.display = 'block';
              } else {
                suggestionsContainer.style.display = 'none';
              }
            })
            .catch(error => {
              console.error('Error fetching address suggestions:', error);
              suggestionsContainer.style.display = 'none';
            });
        }, 500); // 500ms debounce
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener('click', function(event) {
        if (event.target !== inputField && event.target !== suggestionsContainer) {
          suggestionsContainer.style.display = 'none';
        }
      });
      
      // Add basic validation for US address format
      inputField.addEventListener('blur', function() {
        const value = inputField.value.trim();
        if (value) {
          // Very basic validation - check for a pattern like "123 Main St, City, ST" or a ZIP code
          const hasStreetNumber = /^\d+\s+\w+/.test(value);
          const hasZipCode = /\d{5}(-\d{4})?$/.test(value);
          const hasStateCode = /\b[A-Z]{2}\b/.test(value);
          
          if (!hasStreetNumber && !hasZipCode && !hasStateCode) {
            showToast('Please enter a valid US address or ZIP code', 'warning');
          }
        }
      });
    }
    
    // Apply to our known address fields
    setupBasicAddressField('general-location-input');
    setupBasicAddressField('auto-address-input');
    setupBasicAddressField('destination-address-input');
    
    // If the callback was provided, call it with an error
    if (callback) callback(new Error('Using fallback address validation'));
  }
  
  // Function to initialize all autocomplete fields
  function initializeGooglePlaces() {
    // Make sure we don't double-initialize
    if (googlePlacesInitialized || window.googlePlacesInitialized) return;
    
    // Set the initialization flag in both local and window scope
    googlePlacesInitialized = true;
    window.googlePlacesInitialized = true;
    
    try {
      // Initialize our custom autocomplete implementation
      setupCustomAutocomplete();
      
      console.log('Successfully initializing custom autocomplete fields');
      
      // Clear any warning messages that might have been displayed
      const helpMessage = document.querySelector('.help-message');
      if (helpMessage) {
        helpMessage.remove();
      }
      
      // Show a success toast
      showToast('Address lookup is now available!', 'success');
      
      if (callback) callback(null);
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setupAddressValidationFallback();
    }
  }
  
  /**
   * Setup custom autocomplete for address inputs
   * This is a completely separate implementation that works without Google Maps API
   */
  function setupCustomAutocomplete() {
    console.log('Setting up custom autocomplete for address fields');
    
    // Add CSS for our custom autocomplete dropdown
    const styleId = 'stackr-autocomplete-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .stackr-autocomplete-wrapper {
          position: relative;
          width: 100%;
        }
        .stackr-autocomplete-container {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: white;
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 250px;
          overflow-y: auto;
          display: none;
        }
        .stackr-autocomplete-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        .stackr-autocomplete-item:hover,
        .stackr-autocomplete-item.selected {
          background-color: #f8f8f8;
        }
        .stackr-autocomplete-primary {
          font-weight: bold;
          color: #333;
        }
        .stackr-autocomplete-secondary {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Setup autocomplete functionality for a specific input
    function setupInputAutocomplete(inputId, dataElementId) {
      const inputElement = document.getElementById(inputId);
      if (!inputElement) {
        console.log(`Waiting for ${inputId} element to be available in DOM...`);
        // Element doesn't exist yet, attempt to attach later when DOM is updated
        setTimeout(() => setupInputAutocomplete(inputId, dataElementId), 500);
        return;
      }
      
      console.log(`Initializing Places Autocomplete for ${inputId}`);
      
      // Create wrapper if needed
      let wrapper = inputElement.parentElement;
      if (!wrapper.classList.contains('stackr-autocomplete-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'stackr-autocomplete-wrapper';
        inputElement.parentNode.insertBefore(wrapper, inputElement);
        wrapper.appendChild(inputElement);
      }
      
      // Create dropdown container
      const dropdownId = `${inputId}-dropdown`;
      let dropdown = document.getElementById(dropdownId);
      
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'stackr-autocomplete-container';
        dropdown.id = dropdownId;
        wrapper.appendChild(dropdown);
      }
      
      // Variables to track state
      let selectedIndex = -1;
      let suggestions = [];
      let debounceTimer;
      
      // Fetch suggestions from server
      async function fetchSuggestions(query) {
        if (!query || query.length < 3) {
          dropdown.style.display = 'none';
          return;
        }
        
        try {
          const response = await fetch(`/api/address-suggestions?query=${encodeURIComponent(query)}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch suggestions: ${response.status}`);
          }
          
          const data = await response.json();
          
          console.log(`Received ${data.predictions?.length || 0} suggestions for "${query}"`);
          
          if (data.predictions && data.predictions.length > 0) {
            suggestions = data.predictions;
            renderSuggestions();
            dropdown.style.display = 'block';
          } else {
            suggestions = [];
            dropdown.style.display = 'none';
          }
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
          dropdown.style.display = 'none';
        }
      }
      
      // Render suggestions in dropdown
      function renderSuggestions() {
        dropdown.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
          const item = document.createElement('div');
          item.className = 'stackr-autocomplete-item';
          if (index === selectedIndex) {
            item.classList.add('selected');
          }
          
          const mainPart = suggestion.structured_formatting?.main_text || 
                          suggestion.description.split(',')[0];
          
          const secondaryPart = suggestion.structured_formatting?.secondary_text || 
                               suggestion.description.split(',').slice(1).join(',');
          
          item.innerHTML = `
            <div class="stackr-autocomplete-primary">${mainPart}</div>
            <div class="stackr-autocomplete-secondary">${secondaryPart}</div>
          `;
          
          item.addEventListener('click', () => {
            selectSuggestion(suggestion);
          });
          
          dropdown.appendChild(item);
        });
      }
      
      // Select a suggestion
      function selectSuggestion(suggestion) {
        // Update the input value
        inputElement.value = suggestion.description;
        
        // Store data in data element if available
        const dataElement = document.getElementById(dataElementId);
        if (dataElement) {
          // Try to extract state from the description
          let state = '';
          const parts = suggestion.description.split(',');
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (part.length === 2 && part.toUpperCase() === part) {
              state = part;
              break;
            }
          }
          
          // Store place data
          if (suggestion.place_id) {
            dataElement.dataset.placeId = suggestion.place_id;
          }
          
          if (state) {
            dataElement.dataset.state = state;
          }
          
          if (suggestion.geometry?.location) {
            dataElement.dataset.lat = suggestion.geometry.location.lat;
            dataElement.dataset.lng = suggestion.geometry.location.lng;
          }
          
          console.log(`Selected address: "${suggestion.description}", State: ${state || 'unknown'}`);
        }
        
        // Hide dropdown
        dropdown.style.display = 'none';
        selectedIndex = -1;
        
        // Trigger change event on the input
        const event = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(event);
      }
      
      // Input event handler with debounce
      inputElement.addEventListener('input', (event) => {
        console.log(`Input event triggered on ${inputId} with value: "${inputElement.value}"`);
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          const query = inputElement.value.trim();
          if (query.length >= 3) {
            console.log(`Fetching suggestions for "${query}" from ${inputId}`);
            fetchSuggestions(query);
          } else {
            console.log(`Query too short for ${inputId}: "${query}"`);
            dropdown.style.display = 'none';
          }
        }, 300);
      });
      
      // Handle keyboard navigation
      inputElement.addEventListener('keydown', (e) => {
        if (suggestions.length === 0 || dropdown.style.display !== 'block') {
          return;
        }
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            renderSuggestions();
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderSuggestions();
            break;
            
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
              selectSuggestion(suggestions[selectedIndex]);
            }
            break;
            
          case 'Escape':
            e.preventDefault();
            dropdown.style.display = 'none';
            selectedIndex = -1;
            break;
        }
      });
      
      // Hide dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!inputElement.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
      
      // When the input is focused, show suggestions if there's already text
      inputElement.addEventListener('focus', () => {
        const query = inputElement.value.trim();
        if (query.length >= 3) {
          fetchSuggestions(query);
        }
      });
      
      console.log(`[Maps Autocomplete] Autocomplete initialized for input: ${inputId}`);
    }
    
    // Helper function to ensure data elements exist
    function ensureDataElementExists(dataElementId) {
      if (!document.getElementById(dataElementId)) {
        console.log(`Creating missing data element: ${dataElementId}`);
        const el = document.createElement('div');
        el.id = dataElementId;
        el.style.display = 'none';
        document.body.appendChild(el);
        return true;
      }
      return false;
    }
    
    // Set up a mutation observer to apply autocomplete when these elements appear
    const observer = new MutationObserver((mutations) => {
      let shouldCheckElements = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheckElements = true;
        }
      });
      
      if (shouldCheckElements) {
        // Check for each input element and set up autocomplete if it exists
        const autoAddressElement = document.getElementById('auto-address-input');
        const destinationElement = document.getElementById('destination-input');
        const generalLocationElement = document.getElementById('general-location-input');
        
        // Create data storage elements if they don't exist yet
        // This fixes cases where the input exists but the data element might not
        ensureDataElementExists('auto-address-place-data');
        ensureDataElementExists('destination-place-data');
        ensureDataElementExists('general-location-place-data');
        
        if (autoAddressElement && !autoAddressElement._autocompleteInitialized) {
          setupInputAutocomplete('auto-address-input', 'auto-address-place-data');
          autoAddressElement._autocompleteInitialized = true;
        }
        
        if (destinationElement && !destinationElement._autocompleteInitialized) {
          console.log('Setting up autocomplete for destination-input (extra debug)');
          setupInputAutocomplete('destination-input', 'destination-place-data');
          // Explicitly add the event listener to handle input events if the normal setup fails
          destinationElement.addEventListener('input', (e) => {
            console.log('Manual input event on destination-input:', e.target.value);
            if (e.target.value.trim().length >= 3) {
              // Try to trigger the API call directly
              fetch(`/api/address-suggestions?query=${encodeURIComponent(e.target.value.trim())}`)
                .then(response => response.json())
                .then(data => {
                  console.log('Manual destination suggestion fetch:', data);
                  // Process and display suggestions manually if needed
                })
                .catch(err => console.error('Manual suggestion fetch error:', err));
            }
          });
          destinationElement._autocompleteInitialized = true;
        }
        
        if (generalLocationElement && !generalLocationElement._autocompleteInitialized) {
          setupInputAutocomplete('general-location-input', 'general-location-place-data');
          generalLocationElement._autocompleteInitialized = true;
        }
      }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Try initial setup as well (in case elements already exist)
    setTimeout(() => {
      // Create data storage elements if they don't exist yet
      ensureDataElementExists('auto-address-place-data');
      ensureDataElementExists('destination-place-data');
      ensureDataElementExists('general-location-place-data');
      
      // Initial attempt to set up autocomplete for known fields
      const autoAddressElement = document.getElementById('auto-address-input');
      const destinationElement = document.getElementById('destination-input');
      const generalLocationElement = document.getElementById('general-location-input');
      
      if (autoAddressElement) {
        setupInputAutocomplete('auto-address-input', 'auto-address-place-data');
        autoAddressElement._autocompleteInitialized = true;
      }
      
      if (destinationElement) {
        console.log('Setting up autocomplete for destination-input in initial check');
        setupInputAutocomplete('destination-input', 'destination-place-data');
        // Explicitly add the event listener to handle input events if the normal setup fails
        destinationElement.addEventListener('input', (e) => {
          console.log('Manual input event on destination-input (initial):', e.target.value);
          if (e.target.value.trim().length >= 3) {
            // Try to trigger the API call directly
            fetch(`/api/address-suggestions?query=${encodeURIComponent(e.target.value.trim())}`)
              .then(response => response.json())
              .then(data => {
                console.log('Manual destination suggestion fetch (initial):', data);
                // Process and display suggestions manually if needed
              })
              .catch(err => console.error('Manual suggestion fetch error:', err));
          }
        });
        destinationElement._autocompleteInitialized = true;
      }
      
      if (generalLocationElement) {
        setupInputAutocomplete('general-location-input', 'general-location-place-data');
        generalLocationElement._autocompleteInitialized = true;
      }
    }, 1000);
  }
  
  // If we already have the script, use it
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log('Google Places API already loaded');
    initializeGooglePlaces();
    return;
  }
  
  // Even if the script tag exists, we'll try to reinitialize it
  // This helps when permissions change (like billing being enabled) after the initial load
  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existingScript) {
    console.log('Found existing Google Maps script tag - removing and reinitializing with fresh API key');
    existingScript.remove();
    // Clear any window-level error state from previous attempts
    window.googleMapsError = null;
  }
  
  // Define a global callback that Google will call when API is loaded
  window.initGooglePlacesAPI = function() {
    if (window.googlePlacesInitialized) return; // Prevent double initialization
    
    clearTimeout(globalTimeoutId);
    console.log('Google Places API loaded successfully via callback');
    
    try {
      // Verify Google Maps is actually available before proceeding
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps Places API successfully initialized!');
        window.googlePlacesInitialized = true;
        // Set a global success flag to indicate successful initialization
        window.googleMapsReady = true;
        // Clear any error state
        window.googleMapsError = null;
        initializeGooglePlaces();
      } else {
        console.warn('Google Maps callback triggered but API not fully available');
        setupAddressValidationFallback();
      }
    } catch (err) {
      console.error('Error in initGooglePlacesAPI callback:', err);
      setupAddressValidationFallback();
    }
  };
  
  // Function to handle errors with API loading
  function handleApiError(error) {
    console.error('Failed to load Google Places API:', error);
    setupAddressValidationFallback();
  }
  
  // Set a backup timeout in case the entire loading process fails
  const globalTimeoutId = setTimeout(() => {
    console.warn('Google Places API loading process timed out completely');
    setupAddressValidationFallback();
  }, 15000); // 15 second timeout
  
  // Add global callback function for Google Maps API
  window.initGooglePlacesAPI = function() {
    console.log('Google Maps API callback triggered');
    // Clear the global timeout since the API loaded
    clearTimeout(globalTimeoutId);
    
    // Call our existing initialization function
    if (typeof initializeGooglePlaces === 'function') {
      initializeGooglePlaces();
    } else {
      console.error('initializeGooglePlaces function not found');
      // Fallback to direct autocomplete initialization
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocompleteFields();
        googlePlacesInitialized = true;
        window.googlePlacesInitialized = true;
      }
    }
  };
  
  // IMPROVED APPROACH: Try loading Google Maps directly first, then fall back if needed
  console.log('Attempting to load Google Maps API with multi-stage loading...');
  
  // First try to get the direct script URL
  fetch('/api/google-maps-direct')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Direct URL fetch failed: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.scriptUrl) {
        throw new Error('No script URL returned from server');
      }
      
      console.log('Got Google Maps direct script URL, attempting to load');
      
      // Add with a timeout to detect loading failures
      const directLoadTimeout = setTimeout(() => {
        console.warn('Direct Google Maps load timed out, switching to fallback');
        loadFallbackImplementation();
      }, 5000);
      
      // Function to clean up after script loads or fails
      function cleanupDirectLoad() {
        clearTimeout(directLoadTimeout);
      }
      
      // Try loading the script directly
      const script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.src = data.scriptUrl;
      script.async = true;
      
      // Handle load success
      script.onload = () => {
        console.log('Google Maps API loaded successfully via direct script');
        cleanupDirectLoad();
        
        // Initialize autocomplete fields immediately after loading the script
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps Places API ready - initializing autocomplete');
            initializeAutocompleteFields();
            
            // Call the callback if provided
            if (typeof callback === 'function') {
              callback();
            }
          } else {
            console.error('Google Maps loaded but Places API not available');
            loadFallbackImplementation();
          }
        }, 500);
      };
      
      // Handle load error
      script.onerror = (error) => {
        console.error('Error loading Google Maps directly:', error);
        script.remove();
        cleanupDirectLoad();
        loadFallbackImplementation();
      };
      
      document.head.appendChild(script);
    })
    .catch(error => {
      console.error('Error with direct Maps loading:', error);
      // Fall back to our server-side implementation
      loadFallbackImplementation();
    });
  
  // Function to load our fallback implementation
  function loadFallbackImplementation() {
    // Check if fallback script is already added
    if (document.getElementById('google-maps-fallback-script')) {
      console.log('Fallback Maps implementation already loaded, skipping duplicate load');
      return;
    }
    
    // Check if Google Maps is already available through original loading
    if (window.google && window.google.maps && window.google.maps.places && !window.google.maps.places._isShim) {
      console.log('Original Google Maps API loaded successfully, no need for fallback');
      return;
    }
    
    console.log('Loading fallback Google Maps implementation');
    
    // Use our dedicated fallback endpoint
    fetch('/api/google-maps-fallback')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Fallback script fetch failed: ${response.status}`);
        }
        return response.text();
      })
      .then(scriptContent => {
        try {
          // Check again if script was added while we were fetching
          if (document.getElementById('google-maps-fallback-script')) {
            console.log('Fallback script already added while we were fetching');
            return;
          }
          
          // Create a new script element
          const fallbackScript = document.createElement('script');
          fallbackScript.id = 'google-maps-fallback-script';
          fallbackScript.textContent = scriptContent;
          
          // Add to page
          document.head.appendChild(fallbackScript);
          console.log('Fallback Google Maps implementation added to page');
          
          // Manual initialization as a backup
          setTimeout(() => {
            if (!googlePlacesInitialized && !window.googlePlacesInitialized) {
              console.log('Manual initialization from fallback timeout');
              try {
                if (typeof initializeGooglePlaces === 'function') {
                  initializeGooglePlaces();
                } else if (window.google && window.google.maps && window.google.maps.places) {
                  // If Google Maps API is available but our helper function isn't, initialize directly
                  console.log('Fallback: Google Maps available, initializing autocomplete directly');
                  initializeAutocompleteFields();
                  
                  // Call the callback if provided
                  if (typeof callback === 'function') {
                    callback();
                  }
                }
              } catch (e) {
                console.error('Error in manual initialization:', e);
                setupAddressValidationFallback();
              }
            }
          }, 1000);
        } catch (err) {
          console.error('Error adding fallback script to page:', err);
          setupAddressValidationFallback();
        }
      })
      .catch(error => {
        console.error('Failed to fetch fallback script:', error);
        setupAddressValidationFallback();
      });
  }
}

/**
 * Initialize all autocomplete fields when Google Places API is loaded
 */
// Add global callback function for Google Maps script
window.initGooglePlacesAPI = function() {
  console.log('Google Maps callback triggered: initGooglePlacesAPI');
  setTimeout(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps Places API available, initializing autocomplete fields');
      initializeAutocompleteFields();
    } else {
      console.warn('Places library not available in callback');
    }
  }, 100);
};

function initializeAutocompleteFields() {
  try {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places API not available for autocomplete initialization');
      return;
    }
    
    console.log('Starting autocomplete fields initialization');
    
    // Add CSS to ensure autocomplete suggestions are visible
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        z-index: 10000 !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
        border-radius: 8px !important;
        position: absolute !important;
        width: 90% !important;
        min-width: 250px !important;
        max-width: 400px !important;
        margin-top: 2px !important;
        background-color: var(--color-card-bg, #ffffff) !important;
        border: 1px solid var(--color-border, #d4d4d4) !important;
        font-family: inherit !important;
        font-size: 14px !important;
        overflow: hidden !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      .pac-container:empty {
        display: none !important;
      }
      .pac-item {
        padding: 12px 16px !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        border-bottom: 1px solid var(--color-border, #e6e6e6) !important;
        color: var(--color-text, #333333) !important;
      }
      .pac-item:hover, .pac-item-selected {
        background-color: var(--color-hover, #f5f5f5) !important;
      }
      .pac-item-query {
        font-size: 14px !important;
        font-weight: 500 !important;
        color: var(--color-text, #333333) !important;
        padding: 2px 0 !important;
      }
      .pac-icon {
        display: none !important;
      }
      .pac-item-selected, .pac-item-selected:hover {
        background-color: #f0f0f0 !important;
      }
      input:focus + .pac-container {
        display: block !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('Setting up autocomplete for address fields');
    
    // Initialize General Quote Form location input
    const generalLocationInput = document.getElementById('general-location-input');
    if (generalLocationInput) {
      console.log('Configuring autocomplete for general-location-input');
      
      // Add input event listener for manual lookup if needed
      generalLocationInput.addEventListener('input', function() {
        if (generalLocationInput.value.length >= 3) {
          // Log the query attempt for debugging
          console.log('Address input changed, could fetch suggestions for:', generalLocationInput.value);
        }
      });
      
      const generalAutocomplete = new google.maps.places.Autocomplete(generalLocationInput, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      generalAutocomplete.addListener('place_changed', () => {
        const place = generalAutocomplete.getPlace();
        
        if (!place.geometry) {
          console.warn('No geometry returned for place:', place);
          return;
        }
        
        if (place.formatted_address) {
          generalLocationInput.value = place.formatted_address;
          
          // Extract state from address_components
          let state = '';
          if (place.address_components) {
            for (let component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
                break;
              }
            }
          }
          
          // Store state in data attribute for later use
          const placeDataElement = document.getElementById('general-location-place-data');
          if (placeDataElement && state) {
            placeDataElement.dataset.state = state;
            console.log('Google Places found state for general quote:', state);
          }
        }
      });
    }
    
    // Initialize Automotive Quote Form start address input
    const autoAddressInput = document.getElementById('auto-address-input');
    if (autoAddressInput) {
      console.log('Initializing autocomplete for automotive quote start address field');
      
      // Add input event listener for manual lookup if needed
      autoAddressInput.addEventListener('input', function() {
        if (autoAddressInput.value.length >= 3) {
          // Log the query attempt for debugging
          console.log('Auto start address input changed, could fetch suggestions for:', autoAddressInput.value);
        }
      });
      
      const autoAutocomplete = new google.maps.places.Autocomplete(autoAddressInput, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      autoAutocomplete.addListener('place_changed', () => {
        const place = autoAutocomplete.getPlace();
        
        if (!place.geometry) {
          console.warn('No geometry returned for auto place:', place);
          return;
        }
        
        if (place.formatted_address) {
          autoAddressInput.value = place.formatted_address;
          
          // Extract state from address_components
          let state = '';
          if (place.address_components) {
            for (let component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
                break;
              }
            }
          }
          
          // Extract additional data for distance calculations
          let latitude = place.geometry.location.lat();
          let longitude = place.geometry.location.lng();
          
          // Store location data in hidden field for later use
          const placeDataElement = document.getElementById('auto-address-place-data');
          if (placeDataElement) {
            placeDataElement.dataset.state = state || '';
            placeDataElement.dataset.lat = latitude || '';
            placeDataElement.dataset.lng = longitude || '';
            console.log('Google Places found start location data:', state, latitude, longitude);
          }
        }
      });
    }
    
    // Initialize Automotive Quote Form destination address input
    const destAddressInput = document.getElementById('auto-destination-input'); // Use the correct ID
    if (destAddressInput) {
      console.log('Initializing autocomplete for automotive quote destination address field (auto-destination-input)');
      
      // Add input event listener for manual lookup if needed
      destAddressInput.addEventListener('input', function() {
        if (destAddressInput.value.length >= 3) {
          // Log the query attempt for debugging
          console.log('Destination address input changed, could fetch suggestions for:', destAddressInput.value);
        }
      });
      
      const destAutocomplete = new google.maps.places.Autocomplete(destAddressInput, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      destAutocomplete.addListener('place_changed', () => {
        const place = destAutocomplete.getPlace();
        
        if (!place.geometry) {
          console.warn('No geometry returned for destination place:', place);
          return;
        }
        
        if (place.formatted_address) {
          destAddressInput.value = place.formatted_address;
          
          // Extract state from address_components
          let state = '';
          if (place.address_components) {
            for (let component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
                break;
              }
            }
          }
          
          // Extract additional data for distance calculations
          let latitude = place.geometry.location.lat();
          let longitude = place.geometry.location.lng();
          
          // Store location data in hidden field for later use
          // Use auto-destination-place-data instead of destination-place-data for the automotive form
          const placeDataElement = document.getElementById('auto-destination-place-data');
          if (placeDataElement) {
            placeDataElement.dataset.state = state || '';
            placeDataElement.dataset.lat = latitude || '';
            placeDataElement.dataset.lng = longitude || '';
            console.log('Google Places found destination location data (auto form):', state, latitude, longitude);
            
            // Calculate and display distance if both locations are available
            const startPlaceData = document.getElementById('auto-address-place-data').dataset;
            if (startPlaceData && startPlaceData.lat && startPlaceData.lng) {
              const distance = calculateDistance(
                parseFloat(startPlaceData.lat),
                parseFloat(startPlaceData.lng),
                latitude,
                longitude
              );
              
              // Show a distance message near the input field
              const distanceMsg = document.getElementById('distance-message') || document.createElement('div');
              distanceMsg.id = 'distance-message';
              distanceMsg.style.fontSize = '13px';
              distanceMsg.style.color = 'var(--color-text-secondary)';
              distanceMsg.style.marginTop = '4px';
              distanceMsg.textContent = `Distance: ${distance.toFixed(1)} miles`;
              
              if (!document.getElementById('distance-message')) {
                destAddressInput.parentNode.appendChild(distanceMsg);
              }
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error initializing autocomplete fields:', error);
  }
}

/**
 * Main function to render the quote generator page
 * @param {string} containerId - The ID of the container to render the page in
 */
export function renderQuoteGeneratorPage(containerId) {
  console.log('Created app-container for quote generator');
  
  // Initialize form state preservation system first thing
  initFormStatePreservation();
  
  // Log the Google Maps API initialization status
  console.log('Google Maps initialization status check:');
  console.log('- window.google exists:', !!window.google);
  console.log('- window.google.maps exists:', !!(window.google && window.google.maps));
  console.log('- window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places));
  console.log('- window.initGooglePlacesAPI exists:', typeof window.initGooglePlacesAPI === 'function');
  
  // Check Google Maps API status directly
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log('Google Places API already loaded - initializing autocomplete fields');
    
    // Initialize autocomplete with a delay to ensure the DOM is ready
    setTimeout(() => {
      console.log('Delayed initialization of autocomplete fields');
      initializeAutocompleteFields();
      
      // Add a helper function to force the autocomplete dropdown to be visible
      const addressInputs = [
        document.getElementById('general-location-input'),
        document.getElementById('auto-address-input'),
        document.getElementById('auto-destination-input')
      ];
      
      // Helper function to force show the autocomplete dropdown
      function forceShowAutocompleteDropdown(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('focus', function() {
          console.log('[Maps Autocomplete] Input focused:', inputId);
        });
        
        input.addEventListener('input', function() {
          if (input.value.length >= 2) {
            setTimeout(() => {
              const pacContainers = document.querySelectorAll('.pac-container');
              pacContainers.forEach(container => {
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                container.style.width = (input.offsetWidth * 0.9) + 'px';
                console.log('[Maps Autocomplete] Positioned dropdown at: 0px, 2px, width: 0px');
              });
            }, 300);
          }
        });
      }
      
      // Apply to all relevant address inputs
      forceShowAutocompleteDropdown('general-location-input');
      forceShowAutocompleteDropdown('auto-address-input');
      forceShowAutocompleteDropdown('auto-destination-input');
    }, 500);
  } else {
    console.log('Loading Google Places API...');
    loadGooglePlacesAPI(initializeAutocompleteFields); // Pass callback to initialize once loaded
  }
  
  // Log detailed diagnostics for debugging form resets
  console.log('Checking Google Maps API status at render time:');
  console.log('- window.google exists:', !!window.google);
  console.log('- window.google.maps exists:', !!(window.google && window.google.maps));
  console.log('- window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places));
  
  // Check if this is a foldable device and log status
  const { width, isFoldableClosed, isFoldableOpen } = getViewportData();
  const isFoldableDevice = width < 400 || isFoldableClosed;
  
  if (isFoldableDevice) {
    console.log('ZFold device detected - applying enhanced form protection');
  }
  
  // Add debug logging for diagnosing Google Maps API issues
  console.log('Checking Google Maps API status at render time:');
  console.log('- window.google exists:', !!window.google);
  console.log('- window.google.maps exists:', window.google && !!window.google.maps);
  console.log('- window.google.maps.places exists:', window.google && window.google.maps && !!window.google.maps.places);
  
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
  
  // Create tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.borderBottom = '1px solid var(--color-border)';
  tabsContainer.style.marginBottom = '24px';
  
  // General Services Tab
  const generalTab = document.createElement('div');
  generalTab.textContent = 'General Services';
  generalTab.style.padding = '12px 20px';
  generalTab.style.cursor = 'pointer';
  generalTab.style.fontWeight = 'bold';
  generalTab.style.borderBottom = '3px solid var(--color-primary)';
  generalTab.dataset.tab = 'general';
  generalTab.classList.add('form-tab');
  generalTab.classList.add('active');
  
  // Automotive Tab
  const autoTab = document.createElement('div');
  autoTab.textContent = 'Automotive Services';
  autoTab.style.padding = '12px 20px';
  autoTab.style.cursor = 'pointer';
  autoTab.style.color = 'var(--color-text-secondary)';
  autoTab.dataset.tab = 'automotive';
  autoTab.classList.add('form-tab');
  
  // Function to switch tabs without using click event
  function switchToTab(tabElement) {
    const isGeneralTab = tabElement.getAttribute('data-tab') === 'general';
    const generalForm = document.getElementById('general-quote-form');
    const autoForm = document.getElementById('auto-quote-form');
    const resultSection = document.getElementById('quote-result-section');
    
    // Save current form state before switching tabs
    saveCurrentFormState();
    
    // Update tab styles
    const tabs = document.querySelectorAll('.form-tab');
    tabs.forEach(tab => {
      // Reset all tabs
      tab.style.borderBottom = 'none';
      tab.style.fontWeight = 'normal';
      tab.style.color = 'var(--color-text-secondary)';
      tab.classList.remove('active');
    });
    
    // Set active tab
    tabElement.style.borderBottom = '3px solid var(--color-primary)';
    tabElement.style.fontWeight = 'bold';
    tabElement.style.color = 'var(--color-text)';
    tabElement.classList.add('active');
    
    // Update form visibility
    if (generalForm && autoForm) {
      generalForm.style.display = isGeneralTab ? 'block' : 'none';
      autoForm.style.display = isGeneralTab ? 'none' : 'block';
    }
    
    // Clear results
    if (resultSection) {
      resultSection.innerHTML = '';
    }
    
    // Save active tab to localStorage
    localStorage.setItem('stackr_quote_active_tab', tabElement.getAttribute('data-tab'));
    cachedFormState.lastActiveTab = tabElement.getAttribute('data-tab');
    
    console.log('Switched to tab:', tabElement.getAttribute('data-tab'));
  }
  
  // Add event listeners to tabs, but use our safer switch function
  generalTab.addEventListener('click', (e) => {
    e.preventDefault();
    switchToTab(generalTab);
  });
  
  autoTab.addEventListener('click', (e) => {
    e.preventDefault();
    switchToTab(autoTab);
  });
  
  tabsContainer.appendChild(generalTab);
  tabsContainer.appendChild(autoTab);
  pageContainer.appendChild(tabsContainer);
  
  // Add general quote form (visible by default)
  const quoteForm = createQuoteForm();
  quoteForm.id = 'general-quote-form';
  pageContainer.appendChild(quoteForm);
  
  // Add automotive quote form (hidden by default)
  const autoQuoteForm = createAutomotiveQuoteForm();
  autoQuoteForm.id = 'auto-quote-form';
  autoQuoteForm.style.display = 'none';
  pageContainer.appendChild(autoQuoteForm);
  
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
  
  // Prevent form submission which causes page refresh on mobile
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    return false;
  });
  
  // Job details section
  const jobDetailsSection = createSectionHeader('Job Details', 'Provide information about the job to get an accurate quote');
  form.appendChild(jobDetailsSection);
  
  // Job type select with expanded options including creative services
  const jobTypeOptions = [
    // Trade services
    { value: 'locksmith', label: 'Locksmith Services' },
    { value: 'plumber', label: 'Plumbing Services' },
    { value: 'electrician', label: 'Electrical Services' },
    { value: 'carpenter', label: 'Carpentry Services' },
    { value: 'hvac', label: 'HVAC Services' },
    { value: 'painter', label: 'Painting Services' },
    { value: 'general_contractor', label: 'General Contracting' },
    { value: 'landscaper', label: 'Landscaping Services' },
    
    // Beauty and wellness services
    { value: 'hair_stylist', label: 'Hair Styling Services' },
    { value: 'makeup_artist', label: 'Makeup Artist Services' },
    { value: 'nail_technician', label: 'Nail Technician Services' },
    { value: 'esthetician', label: 'Esthetician/Skincare Services' },
    { value: 'massage_therapist', label: 'Massage Therapy' },
    
    // Creative services
    { value: 'photographer', label: 'Photography Services' },
    { value: 'videographer', label: 'Videography Services' },
    { value: 'graphic_designer', label: 'Graphic Design Services' },
    { value: 'web_designer', label: 'Web Design Services' },
    { value: 'illustrator', label: 'Illustration Services' },
    
    // Event services
    { value: 'event_planner', label: 'Event Planning Services' },
    { value: 'caterer', label: 'Catering Services' },
    { value: 'dj', label: 'DJ/Entertainment Services' }
  ];
  const jobTypeSelect = createSelect('jobType', jobTypeOptions);
  form.appendChild(createFormGroup('Service Type', jobTypeSelect));
  
  // Job description
  const jobDescriptionInput = createTextarea('jobDescription', 'Describe the job in detail...');
  form.appendChild(createFormGroup('Job Description', jobDescriptionInput));
  
  // Location with Google Places autocomplete
  const locationContainer = document.createElement('div');
  locationContainer.style.position = 'relative';
  
  const locationInput = createInput('text', 'location', '', 'ZIP code or City, State');
  locationInput.id = 'general-location-input';
  locationInput.setAttribute('autocomplete', 'off');
  
  // Prevent default behavior that causes page refresh on mobile
  locationInput.addEventListener('focus', function(e) {
    e.preventDefault();
    return false;
  });
  
  // Removed problematic click handler on locationInput that was preventing interaction
  
  // Add small info icon to indicate autocomplete functionality
  const infoIcon = document.createElement('span');
  infoIcon.innerHTML = '&#9432;'; // Info icon
  infoIcon.style.position = 'absolute';
  infoIcon.style.right = '10px';
  infoIcon.style.top = '50%';
  infoIcon.style.transform = 'translateY(-50%)';
  infoIcon.style.color = 'var(--color-text-secondary)';
  infoIcon.style.cursor = 'pointer';
  infoIcon.title = 'Start typing for address suggestions';
  
  locationContainer.appendChild(locationInput);
  locationContainer.appendChild(infoIcon);
  
  // Add clear button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.textContent = '×';
  clearBtn.style.position = 'absolute';
  clearBtn.style.right = '30px';
  clearBtn.style.top = '50%';
  clearBtn.style.transform = 'translateY(-50%)';
  clearBtn.style.background = 'none';
  clearBtn.style.border = 'none';
  clearBtn.style.fontSize = '18px';
  clearBtn.style.cursor = 'pointer';
  clearBtn.style.color = 'var(--color-text-secondary)';
  clearBtn.style.display = 'none';
  clearBtn.onclick = () => {
    locationInput.value = '';
    clearBtn.style.display = 'none';
  };
  
  locationContainer.appendChild(clearBtn);
  
  // Show/hide clear button based on input value
  locationInput.addEventListener('input', () => {
    clearBtn.style.display = locationInput.value ? 'block' : 'none';
  });
  
  // Add hidden element to store place data
  const placeDataElement = document.createElement('div');
  placeDataElement.id = 'general-location-place-data';
  placeDataElement.style.display = 'none';
  locationContainer.appendChild(placeDataElement);
  
  // Initialize Google Places Autocomplete when API is loaded
  setTimeout(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Initializing Places Autocomplete for general-location-input');
      const autocomplete = new google.maps.places.Autocomplete(locationInput, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.formatted_address) {
          locationInput.value = place.formatted_address;
          clearBtn.style.display = 'block';
          
          // Extract state from address_components
          let state = '';
          if (place.address_components) {
            for (let component of place.address_components) {
              // Look for the administrative_area_level_1 type (which is the state)
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name; // Get the state code (e.g., "CA", "NY")
                break;
              }
            }
          }
          
          // Store state in data attribute for later use
          if (state) {
            placeDataElement.dataset.state = state;
            console.log('Google Places found state for general quote:', state);
          }
        }
      });
    }
  }, 2000);
  
  form.appendChild(createFormGroup('Location', locationContainer));
  
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
  
  // Travel details section with destination address
  const travelSection = createSectionHeader('Travel Details', 'Calculate travel distance and costs accurately');
  form.appendChild(travelSection);
  
  // Origin address using the same value from location
  const originLabel = document.createElement('p');
  originLabel.textContent = 'Origin: Using service location address above';
  originLabel.style.fontSize = '14px';
  originLabel.style.color = 'var(--color-text-secondary)';
  originLabel.style.marginBottom = '12px';
  form.appendChild(originLabel);
  
  // Destination address with Google Places autocomplete
  const destinationContainer = document.createElement('div');
  destinationContainer.style.position = 'relative';
  
  const destinationInput = createInput('text', 'destination', '', 'Destination address');
  destinationInput.id = 'destination-input';
  destinationInput.setAttribute('autocomplete', 'off');
  
  // Prevent default behavior that causes page refresh on mobile
  // Removed problematic focus handler on destinationInput that was preventing interaction
  
  // Removed problematic click handler on destinationInput that was preventing interaction
  
  // Add info icon
  const destInfoIcon = document.createElement('span');
  destInfoIcon.innerHTML = '&#9432;'; // Info icon
  destInfoIcon.style.position = 'absolute';
  destInfoIcon.style.right = '10px';
  destInfoIcon.style.top = '50%';
  destInfoIcon.style.transform = 'translateY(-50%)';
  destInfoIcon.style.color = 'var(--color-text-secondary)';
  destInfoIcon.style.cursor = 'pointer';
  destInfoIcon.title = 'Enter destination address to calculate travel distance';
  
  destinationContainer.appendChild(destinationInput);
  destinationContainer.appendChild(destInfoIcon);
  
  // Add clear button
  const destClearBtn = document.createElement('button');
  destClearBtn.type = 'button';
  destClearBtn.textContent = '×';
  destClearBtn.style.position = 'absolute';
  destClearBtn.style.right = '30px';
  destClearBtn.style.top = '50%';
  destClearBtn.style.transform = 'translateY(-50%)';
  destClearBtn.style.background = 'none';
  destClearBtn.style.border = 'none';
  destClearBtn.style.fontSize = '18px';
  destClearBtn.style.cursor = 'pointer';
  destClearBtn.style.color = 'var(--color-text-secondary)';
  destClearBtn.style.display = 'none';
  destClearBtn.onclick = () => {
    destinationInput.value = '';
    destClearBtn.style.display = 'none';
    // Reset distance and travel info
    travelDistanceInput.value = '0';
    document.getElementById('distance-calculation-result').innerHTML = '';
  };
  
  destinationContainer.appendChild(destClearBtn);
  
  // Show/hide clear button based on input value
  destinationInput.addEventListener('input', () => {
    destClearBtn.style.display = destinationInput.value ? 'block' : 'none';
  });
  
  // Hidden element to store place data
  const destPlaceDataElement = document.createElement('div');
  destPlaceDataElement.id = 'destination-place-data';
  destPlaceDataElement.style.display = 'none';
  destinationContainer.appendChild(destPlaceDataElement);
  
  // Initialize Google Places Autocomplete for destination
  setTimeout(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Initializing Places Autocomplete for destination-input');
      const autocomplete = new google.maps.places.Autocomplete(destinationInput, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.formatted_address) {
          destinationInput.value = place.formatted_address;
          destClearBtn.style.display = 'block';
          
          // Extract state and coordinates from address_components
          let destinationState = '';
          let destinationLat = null;
          let destinationLng = null;
          
          if (place.address_components) {
            for (let component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                destinationState = component.short_name;
                break;
              }
            }
          }
          
          if (place.geometry && place.geometry.location) {
            destinationLat = place.geometry.location.lat();
            destinationLng = place.geometry.location.lng();
          }
          
          // Store data for later use
          if (destinationState) {
            destPlaceDataElement.dataset.state = destinationState;
          }
          if (destinationLat && destinationLng) {
            destPlaceDataElement.dataset.lat = destinationLat;
            destPlaceDataElement.dataset.lng = destinationLng;
            
            // Calculate distance if we have both origin and destination coordinates
            calculateAddressDistance();
          }
        }
      });
    }
  }, 2200);
  
  form.appendChild(createFormGroup('Destination Address', destinationContainer));
  
  // Add container for distance calculation result
  const distanceResultContainer = document.createElement('div');
  distanceResultContainer.id = 'distance-calculation-result';
  distanceResultContainer.style.marginBottom = '16px';
  distanceResultContainer.style.fontSize = '14px';
  distanceResultContainer.style.color = 'var(--color-text-secondary)';
  form.appendChild(distanceResultContainer);
  
  // Manual travel distance input (hidden by default, shown when calculation fails)
  const travelDistanceContainer = document.createElement('div');
  travelDistanceContainer.id = 'manual-travel-distance-container';
  travelDistanceContainer.style.marginBottom = '16px';
  
  const travelDistanceInput = createInput('number', 'travelDistance', '0', 'Distance in miles', '0', '2000', '0.1');
  travelDistanceContainer.appendChild(createFormGroup('Manual Travel Distance (miles)', travelDistanceInput));
  
  // Add calculate button
  const calculateButton = createButton('Calculate Distance', () => {
    calculateAddressDistance();
  }, 'secondary');
  calculateButton.style.marginBottom = '16px';
  calculateButton.style.width = 'auto';
  travelDistanceContainer.appendChild(calculateButton);
  
  form.appendChild(travelDistanceContainer);
  
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
  const generateButton = createButton('Generate Quote', (e) => {
    console.log("Generate Quote button clicked");
    // Special handling for Samsung ZFold 4 and small-screen devices
    const { width, isFoldableClosed } = updateViewportClasses();
    const isSmallScreen = width < 400 || isFoldableClosed;
    
    if (isSmallScreen) {
      console.log("Detected small screen - using enhanced button handler");
      // Ensure event propagation is stopped for small screens
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
    // Call handler with explicit foldable device flag
    handleAutoQuoteFormSubmit(e);
    // Return false to prevent default action as a fallback
    return false;
  }, 'primary');
  
  // Reset form button
  const resetButton = createButton('Reset Form', (e) => {
    console.log("Reset Form button clicked");
    // For small screens, ensure the click doesn't cause issues
    const { width, isFoldableClosed } = updateViewportClasses();
    const isSmallScreen = width < 400 || isFoldableClosed;
    
    if (isSmallScreen && e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.reset();
    marginLabel.textContent = 'Target Profit Margin: 25%';
    document.getElementById('quote-result-section').innerHTML = '';
    return false;
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
function handleQuoteFormSubmit(e) {
  // Prevent form submission which causes page refresh
  if (e && e.preventDefault) {
    e.preventDefault();
  }
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
    const quoteResult = generateQuote(quoteData);
    
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
  const baseHourlyRate = getMarketRate(jobType, state);
  
  // Apply service-specific rate adjustments
  let hourlyRate = baseHourlyRate;
  let serviceTypeMultiplier = 1.0;
  let additionalFees = 0;
  let specialMaterialsPercentage = 0;
  
  // Adjust rates based on job type (service-specific calculations)
  if (jobType === 'plumber' || jobType === 'electrician' || jobType === 'hvac') {
    // Licensed trade services often require more technical expertise 
    serviceTypeMultiplier = 1.10; // 10% premium for licensed trades
    
    // Check for emergency service rate for critical utilities
    if (emergency) {
      serviceTypeMultiplier = 1.75; // 75% premium for emergency licensed trades
      additionalFees += 50; // Emergency response fee for critical services
    }
  } 
  else if (jobType === 'photographer' || jobType === 'videographer') {
    // Creative services with equipment costs and post-processing time
    serviceTypeMultiplier = 1.15; // 15% premium for creative services with equipment
    specialMaterialsPercentage = 0.05; // 5% additional for media storage/delivery
    additionalFees += 75; // Media processing & equipment fee
  } 
  else if (jobType === 'hair_stylist' || jobType === 'makeup_artist' || jobType === 'esthetician') {
    // Beauty services often require specialized products
    serviceTypeMultiplier = 1.05; // 5% premium for specialized beauty services
    specialMaterialsPercentage = 0.15; // 15% additional for high-quality products
  } 
  else if (jobType === 'graphic_designer' || jobType === 'web_designer' || jobType === 'illustrator') {
    // Design services have different hourly structures
    serviceTypeMultiplier = 1.20; // 20% premium for creative professional services
    specialMaterialsPercentage = 0.02; // 2% for software/licensing
  } 
  else if (jobType === 'general_contractor') {
    // General contractors need to cover subcontractor coordination
    serviceTypeMultiplier = 1.15; // 15% premium for project management
    specialMaterialsPercentage = 0.05; // 5% materials procurement fee
  }
  else if (jobType === 'event_planner' || jobType === 'caterer' || jobType === 'dj') {
    // Event services with time sensitivity
    serviceTypeMultiplier = 1.08; // 8% premium for event services
    additionalFees += 35; // Event coordination fee
  }
  else {
    // Standard services get the regular emergency fee
    if (emergency) {
      serviceTypeMultiplier = 1.5; // 50% emergency premium for standard services
    }
  }
  
  // Apply service type multiplier to hourly rate
  hourlyRate *= serviceTypeMultiplier;
  
  // Calculate base labor cost
  let laborCost = hourlyRate * laborHours;
  
  // Apply any specialty materials percentage to materials cost
  const adjustedMaterialsCost = materialsCost * (1 + specialMaterialsPercentage);
  
  // Calculate travel costs with gas price data
  const gasPrice = getGasPriceForState(state);
  const fuelCost = calculateFuelCost(travelDistance, gasPrice);
  
  // Add service fee for travel time (based on hourly rate)
  // For high-value services, travel time is more expensive
  const travelServiceFee = travelDistance * (hourlyRate < 100 ? 0.80 : hourlyRate / 100);
  
  // Total travel cost (fuel + service fee)
  const travelCost = fuelCost + travelServiceFee;
  
  // Calculate subtotal (labor + adjusted materials + travel + additional fees)
  const subtotal = laborCost + adjustedMaterialsCost + travelCost + additionalFees;
  
  // Calculate tax (applied to materials only in most regions)
  const taxAmount = adjustedMaterialsCost * taxRate;
  
  // Calculate total
  const total = subtotal + taxAmount;
  
  // Calculate profit based on target margin
  const targetProfit = subtotal * (targetMargin / 100);
  const actualProfit = total - (subtotal - targetProfit);
  const profitMargin = (actualProfit / total) * 100;
  
  // Generate profit assessment
  let profitAssessment = '';
  if (profitMargin < 15) {
    profitAssessment = 'Warning: This quote has a low profit margin. Consider raising your prices or reducing costs.';
  } else if (profitMargin < 25) {
    profitAssessment = 'This quote has an acceptable profit margin, but could be improved.';
  } else {
    profitAssessment = 'This quote has a healthy profit margin. Well done!';
  }
  
  // Return quote result with detailed breakdown
  return {
    jobType,
    jobDescription,
    location,
    state,
    laborHours,
    baseHourlyRate,
    hourlyRate,
    serviceTypeMultiplier,
    additionalFees,
    specialMaterialsPercentage,
    laborCost,
    materialsCost: adjustedMaterialsCost,
    rawMaterialsCost: materialsCost,
    travelDistance,
    gasPrice,
    fuelCost,
    travelServiceFee,
    travelCost,
    emergency,
    subtotal,
    taxRate,
    taxAmount,
    total,
    targetMargin,
    profit: actualProfit,
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
  
  // Add edit button (only for pro users)
  const headerTop = document.createElement('div');
  headerTop.style.display = 'flex';
  headerTop.style.justifyContent = 'space-between';
  headerTop.style.alignItems = 'center';
  headerTop.style.marginBottom = '8px';
  
  const titleWrapper = document.createElement('div');
  titleWrapper.appendChild(quoteTitle);
  
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit Quote';
  editButton.style.padding = '6px 12px';
  editButton.style.backgroundColor = 'var(--color-primary-light)';
  editButton.style.color = 'var(--color-primary-dark)';
  editButton.style.border = 'none';
  editButton.style.borderRadius = '4px';
  editButton.style.cursor = 'pointer';
  editButton.style.fontSize = '14px';
  editButton.style.fontWeight = '500';
  
  // Add click handler for editing
  editButton.onclick = () => {
    openQuoteEditor(quoteResult);
  };
  
  headerTop.appendChild(titleWrapper);
  headerTop.appendChild(editButton);
  
  quoteHeader.appendChild(headerTop);
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
  
  // Labor with service-specific rate details
  let laborLabel = `Labor (${quoteResult.laborHours} hours @ $${quoteResult.hourlyRate.toFixed(2)}/hr)`;
  
  // Show rate adjustment if applicable
  if (quoteResult.serviceTypeMultiplier && quoteResult.serviceTypeMultiplier !== 1.0) {
    const adjustmentPercent = ((quoteResult.serviceTypeMultiplier - 1) * 100).toFixed(0);
    laborLabel += ` (includes ${adjustmentPercent}% ${quoteResult.emergency ? 'emergency' : 'service type'} adjustment)`;
  } else if (quoteResult.emergency) {
    laborLabel += ' (Emergency rate)';
  }
  
  breakdownList.appendChild(createBreakdownItem(laborLabel, quoteResult.laborCost));
  
  // Materials with any specialty materials percentage
  let materialsLabel = 'Materials';
  if (quoteResult.specialMaterialsPercentage > 0) {
    const materialsPercent = (quoteResult.specialMaterialsPercentage * 100).toFixed(0);
    materialsLabel += ` (includes ${materialsPercent}% service fee)`;
    
    // Show original cost and fee in a detailed breakdown
    const materialsItem = document.createElement('div');
    materialsItem.style.borderBottom = '1px solid var(--color-border)';
    materialsItem.style.padding = '8px 0';
    materialsItem.style.position = 'relative';
    
    // Main materials row with total cost
    const materialsRow = document.createElement('div');
    materialsRow.style.display = 'flex';
    materialsRow.style.justifyContent = 'space-between';
    materialsRow.style.cursor = 'pointer';
    
    const materialsRowLabel = document.createElement('div');
    materialsRowLabel.innerHTML = `${materialsLabel} <span style="font-size: 12px; color: var(--color-text-secondary);">▼ Click for details</span>`;
    
    const materialsValue = document.createElement('div');
    materialsValue.textContent = `$${quoteResult.materialsCost.toFixed(2)}`;
    
    materialsRow.appendChild(materialsRowLabel);
    materialsRow.appendChild(materialsValue);
    materialsItem.appendChild(materialsRow);
    
    // Materials details (hidden by default)
    const materialsDetails = document.createElement('div');
    materialsDetails.style.fontSize = '13px';
    materialsDetails.style.color = 'var(--color-text-secondary)';
    materialsDetails.style.paddingLeft = '20px';
    materialsDetails.style.marginTop = '8px';
    materialsDetails.style.display = 'none';
    
    // Base materials cost detail
    const baseMatDetail = document.createElement('div');
    baseMatDetail.style.display = 'flex';
    baseMatDetail.style.justifyContent = 'space-between';
    baseMatDetail.style.marginBottom = '4px';
    
    const baseMatLabel = document.createElement('div');
    baseMatLabel.textContent = 'Base materials cost';
    
    const baseMatValue = document.createElement('div');
    baseMatValue.textContent = `$${quoteResult.rawMaterialsCost.toFixed(2)}`;
    
    baseMatDetail.appendChild(baseMatLabel);
    baseMatDetail.appendChild(baseMatValue);
    materialsDetails.appendChild(baseMatDetail);
    
    // Materials fee detail
    const matFeeDetail = document.createElement('div');
    matFeeDetail.style.display = 'flex';
    matFeeDetail.style.justifyContent = 'space-between';
    
    const matFeeLabel = document.createElement('div');
    matFeeLabel.textContent = `Service fee (${materialsPercent}%)`;
    
    const matFeeValue = document.createElement('div');
    const feeAmount = quoteResult.materialsCost - quoteResult.rawMaterialsCost;
    matFeeValue.textContent = `$${feeAmount.toFixed(2)}`;
    
    matFeeDetail.appendChild(matFeeLabel);
    matFeeDetail.appendChild(matFeeValue);
    materialsDetails.appendChild(matFeeDetail);
    
    materialsItem.appendChild(materialsDetails);
    
    // Toggle materials details on click
    materialsRow.addEventListener('click', () => {
      if (materialsDetails.style.display === 'none') {
        materialsDetails.style.display = 'block';
        materialsRowLabel.innerHTML = `${materialsLabel} <span style="font-size: 12px; color: var(--color-text-secondary);">▲ Hide details</span>`;
      } else {
        materialsDetails.style.display = 'none';
        materialsRowLabel.innerHTML = `${materialsLabel} <span style="font-size: 12px; color: var(--color-text-secondary);">▼ Click for details</span>`;
      }
    });
    
    breakdownList.appendChild(materialsItem);
  } else {
    // Simple materials line with no breakdown
    breakdownList.appendChild(createBreakdownItem(materialsLabel, quoteResult.materialsCost));
  }
  
  // Add any additional service-specific fees
  if (quoteResult.additionalFees > 0) {
    breakdownList.appendChild(createBreakdownItem(
      'Additional service fees',
      quoteResult.additionalFees
    ));
  }
  
  // Travel - with detailed breakdown
  if (quoteResult.travelDistance > 0) {
    // Add travel header with expandable details
    const travelItem = document.createElement('div');
    travelItem.style.borderBottom = '1px solid var(--color-border)';
    travelItem.style.padding = '8px 0';
    travelItem.style.position = 'relative';
    
    // Main travel row with total cost
    const travelRow = document.createElement('div');
    travelRow.style.display = 'flex';
    travelRow.style.justifyContent = 'space-between';
    travelRow.style.cursor = 'pointer';
    
    const travelLabel = document.createElement('div');
    travelLabel.innerHTML = `Travel (${quoteResult.travelDistance} miles) <span style="font-size: 12px; color: var(--color-text-secondary);">▼ Click for details</span>`;
    
    const travelValue = document.createElement('div');
    travelValue.textContent = `$${quoteResult.travelCost.toFixed(2)}`;
    
    travelRow.appendChild(travelLabel);
    travelRow.appendChild(travelValue);
    travelItem.appendChild(travelRow);
    
    // Travel details (hidden by default)
    const travelDetails = document.createElement('div');
    travelDetails.style.fontSize = '13px';
    travelDetails.style.color = 'var(--color-text-secondary)';
    travelDetails.style.paddingLeft = '20px';
    travelDetails.style.marginTop = '8px';
    travelDetails.style.display = 'none';
    
    // Fuel cost detail
    const fuelDetail = document.createElement('div');
    fuelDetail.style.display = 'flex';
    fuelDetail.style.justifyContent = 'space-between';
    fuelDetail.style.marginBottom = '4px';
    
    const fuelLabel = document.createElement('div');
    fuelLabel.textContent = `Fuel (Gas price: $${quoteResult.gasPrice.toFixed(2)}/gal)`;
    
    const fuelValue = document.createElement('div');
    fuelValue.textContent = `$${quoteResult.fuelCost.toFixed(2)}`;
    
    fuelDetail.appendChild(fuelLabel);
    fuelDetail.appendChild(fuelValue);
    travelDetails.appendChild(fuelDetail);
    
    // Travel time/service fee detail
    const serviceDetail = document.createElement('div');
    serviceDetail.style.display = 'flex';
    serviceDetail.style.justifyContent = 'space-between';
    
    const serviceLabel = document.createElement('div');
    serviceLabel.textContent = 'Service fee for travel time';
    
    const serviceValue = document.createElement('div');
    serviceValue.textContent = `$${quoteResult.travelServiceFee.toFixed(2)}`;
    
    serviceDetail.appendChild(serviceLabel);
    serviceDetail.appendChild(serviceValue);
    travelDetails.appendChild(serviceDetail);
    
    travelItem.appendChild(travelDetails);
    
    // Toggle travel details on click
    travelRow.addEventListener('click', () => {
      if (travelDetails.style.display === 'none') {
        travelDetails.style.display = 'block';
        travelLabel.innerHTML = `Travel (${quoteResult.travelDistance} miles) <span style="font-size: 12px; color: var(--color-text-secondary);">▲ Hide details</span>`;
      } else {
        travelDetails.style.display = 'none';
        travelLabel.innerHTML = `Travel (${quoteResult.travelDistance} miles) <span style="font-size: 12px; color: var(--color-text-secondary);">▼ Click for details</span>`;
      }
    });
    
    breakdownList.appendChild(travelItem);
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
  
  // Create dropdown section for print options
  const printContainer = document.createElement('div');
  printContainer.style.position = 'relative';
  printContainer.style.display = 'inline-block';
  
  const printButton = createButton('Print Options ▼', () => {
    const menu = printContainer.querySelector('.print-dropdown');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }, 'secondary');
  
  // Create dropdown menu
  const printDropdown = document.createElement('div');
  printDropdown.className = 'print-dropdown';
  printDropdown.style.display = 'none';
  printDropdown.style.position = 'absolute';
  printDropdown.style.backgroundColor = 'var(--color-card-bg)';
  printDropdown.style.minWidth = '200px';
  printDropdown.style.boxShadow = '0px 8px 16px 0px rgba(0,0,0,0.2)';
  printDropdown.style.zIndex = '1';
  printDropdown.style.borderRadius = '8px';
  printDropdown.style.padding = '8px 0';
  printDropdown.style.marginTop = '5px';
  
  // Provider version option
  const providerOption = document.createElement('a');
  providerOption.textContent = 'Print Service Provider View';
  providerOption.style.padding = '12px 16px';
  providerOption.style.textDecoration = 'none';
  providerOption.style.display = 'block';
  providerOption.style.color = 'var(--color-text)';
  providerOption.style.cursor = 'pointer';
  providerOption.addEventListener('mouseenter', () => {
    providerOption.style.backgroundColor = 'var(--color-bg-secondary)';
  });
  providerOption.addEventListener('mouseleave', () => {
    providerOption.style.backgroundColor = 'transparent';
  });
  providerOption.addEventListener('click', () => {
    printQuote(quoteResult, false);
    printDropdown.style.display = 'none';
  });
  
  // Customer version option
  const customerOption = document.createElement('a');
  customerOption.textContent = 'Print Customer View';
  customerOption.style.padding = '12px 16px';
  customerOption.style.textDecoration = 'none';
  customerOption.style.display = 'block';
  customerOption.style.color = 'var(--color-text)';
  customerOption.style.cursor = 'pointer';
  customerOption.addEventListener('mouseenter', () => {
    customerOption.style.backgroundColor = 'var(--color-bg-secondary)';
  });
  customerOption.addEventListener('mouseleave', () => {
    customerOption.style.backgroundColor = 'transparent';
  });
  customerOption.addEventListener('click', () => {
    printQuote(quoteResult, true);
    printDropdown.style.display = 'none';
  });
  
  printDropdown.appendChild(providerOption);
  printDropdown.appendChild(customerOption);
  printContainer.appendChild(printButton);
  printContainer.appendChild(printDropdown);
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!printContainer.contains(event.target)) {
      printDropdown.style.display = 'none';
    }
  });
  
  // Create invoice button
  const invoiceButton = createButton('Create Invoice', () => createInvoiceFromQuote(quoteResult), 'secondary');
  
  actionsRow.appendChild(saveButton);
  actionsRow.appendChild(printContainer);
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
 * @param {boolean} isCustomerVersion - Whether to print a customer-friendly version
 */
function printQuote(quoteResult, isCustomerVersion = false) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    showToast('Please allow popups to print quotes', 'error');
    return;
  }
  
  // Get job type display name
  const jobTypeDisplayName = document.querySelector(`#quote-form select[name="jobType"] option[value="${quoteResult.jobType}"]`).textContent;
  
  // Format the current date
  const currentDate = new Date().toLocaleDateString();
  const quoteNumber = `Q-${Date.now().toString().substring(6)}`;
  
  // Create travel section content based on version
  let travelSection = '';
  if (quoteResult.travelDistance > 0) {
    if (isCustomerVersion) {
      // Customer version shows less detail about travel costs, but includes gas prices info
      travelSection = `
        <div class="breakdown-item">
          <div>Travel (${quoteResult.travelDistance} miles)</div>
          <div>$${quoteResult.travelCost.toFixed(2)}</div>
        </div>
        <div style="font-size: 13px; color: #666; margin-left: 20px; margin-bottom: 8px;">
          <div>• Current gas price in your area: $${quoteResult.gasPrice.toFixed(2)}/gallon</div>
          <div>• Includes round-trip travel and service time</div>
        </div>
      `;
    } else {
      // Service provider version shows detailed breakdown
      travelSection = `
        <div class="breakdown-item">
          <div>Travel (${quoteResult.travelDistance} miles)</div>
          <div>$${quoteResult.travelCost.toFixed(2)}</div>
        </div>
        <div style="font-size: 13px; color: #666; margin-left: 20px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <div>• Fuel cost ($${quoteResult.gasPrice.toFixed(2)}/gal)</div>
            <div>$${quoteResult.fuelCost.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>• Service fee for travel time</div>
            <div>$${quoteResult.travelServiceFee.toFixed(2)}</div>
          </div>
        </div>
      `;
    }
  }
  
  // Create profit analysis section (only for service provider version)
  const profitAnalysisSection = !isCustomerVersion ? `
    <div class="profit-analysis" style="margin-top: 30px; padding: 15px; background-color: #f0f7ff; border-radius: 4px;">
      <div class="section-title">Profit Analysis</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Target Profit Margin:</div>
        <div>${quoteResult.targetMargin}%</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Actual Profit Margin:</div>
        <div style="font-weight: bold; color: ${quoteResult.profitMargin < 15 ? '#B91C1C' : quoteResult.profitMargin < 25 ? '#D97706' : '#047857'}">
          ${quoteResult.profitMargin.toFixed(1)}%
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Estimated Profit:</div>
        <div style="font-weight: bold;">$${quoteResult.profit.toFixed(2)}</div>
      </div>
      <div style="margin-top: 12px; padding: 8px; border-radius: 4px; font-size: 14px; 
                  background-color: ${quoteResult.profitMargin < 15 ? '#FEE2E2' : quoteResult.profitMargin < 25 ? '#FEF3C7' : '#ECFDF5'}">
        ${quoteResult.profitAssessment}
      </div>
    </div>
  ` : '';
  
  // Create notes section with different content based on version
  const notesSection = isCustomerVersion ? `
    <div class="notes">
      <div class="section-title">Notes</div>
      <div>
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Payment terms: 50% deposit required before work begins, remaining balance due upon completion.</p>
        <p>Please contact us if you have any questions about this quote.</p>
      </div>
    </div>
  ` : `
    <div class="notes">
      <div class="section-title">Notes</div>
      <div>
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Payment terms: 50% deposit required before work begins, remaining balance due upon completion.</p>
        <p>For internal use: Profit margin is ${quoteResult.profitMargin.toFixed(1)}% (target: ${quoteResult.targetMargin}%)</p>
      </div>
    </div>
  `;
  
  // Create title based on version
  const pageTitle = isCustomerVersion ? `Customer Quote - ${jobTypeDisplayName}` : `Quote - ${jobTypeDisplayName}`;
  
  // Create print content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${pageTitle}</title>
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
            <div>${currentDate}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Quote Number:</strong></div>
            <div>${quoteNumber}</div>
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
        ${travelSection}
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
        
        ${profitAnalysisSection}
        
        ${notesSection}
        
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
      // Create a detailed travel description that includes gas price info for customer visibility
      const travelDescription = `Travel (${quoteResult.travelDistance} miles) - Gas price: $${quoteResult.gasPrice.toFixed(2)}/gal`;
      
      invoiceData.items.push({
        description: travelDescription,
        quantity: quoteResult.travelDistance,
        unit: 'miles',
        unitPrice: quoteResult.travelCost / quoteResult.travelDistance, // Calculate per-mile rate
        amount: quoteResult.travelCost,
        metadata: {
          gasPrice: quoteResult.gasPrice,
          fuelCost: quoteResult.fuelCost,
          travelServiceFee: quoteResult.travelServiceFee
        }
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
 * @param {boolean} isAutomotive - Whether this is for the automotive form
 * @returns {string} The two-letter state code
 */
function getStateFromZip(location, isAutomotive = false) {
  // First check the appropriate Google Places geocoded result
  if (isAutomotive) {
    const autoPlaceDataElement = document.getElementById('auto-address-place-data');
    if (autoPlaceDataElement && autoPlaceDataElement.dataset.state) {
      console.log('Using Google Places geocoded state for automotive quote:', autoPlaceDataElement.dataset.state);
      return autoPlaceDataElement.dataset.state;
    }
  } else {
    const generalPlaceDataElement = document.getElementById('general-location-place-data');
    if (generalPlaceDataElement && generalPlaceDataElement.dataset.state) {
      console.log('Using Google Places geocoded state for general quote:', generalPlaceDataElement.dataset.state);
      return generalPlaceDataElement.dataset.state;
    }
  }
  
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
  let rate = marketRates[jobType]?.[region] || 85; // Default rate if not found
  
  // Apply real-time market adjustments based on current data
  // These modifiers reflect 2025 market conditions
  const currentMarketAdjustments = {
    'photographer': 1.12,  // 12% increase for photography services in 2025
    'videographer': 1.15,  // 15% increase for video services
    'hair_stylist': 1.08,  // 8% increase for hair styling
    'makeup_artist': 1.10, // 10% increase for makeup artists
    'esthetician': 1.07,   // 7% increase for estheticians
    'graphic_designer': 1.10, // 10% increase for graphic design
    'web_designer': 1.18,  // 18% increase for web design (high demand)
    'illustrator': 1.12,   // 12% increase for illustrators
    'plumber': 1.15,       // 15% increase for plumbers
    'electrician': 1.18,   // 18% increase for electricians
    'hvac': 1.14,          // 14% increase for HVAC
    'event_planner': 1.06, // 6% increase for event planners
    'caterer': 1.08,       // 8% increase for catering
    'dj': 1.09,            // 9% increase for DJ services
    'locksmith': 1.10      // 10% increase for locksmiths
  };
  
  // Apply the adjustment if one exists for this job type
  if (currentMarketAdjustments[jobType]) {
    rate = rate * currentMarketAdjustments[jobType];
  }
  
  return rate;
}

// No direct displayPageTitle function needed - main.js now handles the page title

/**
 * Keycode price data for automotive locksmith services
 */
const keycodePrices = {
  "acura": 30,
  "honda": 30,
  "chrysler": 60,
  "dodge": 60,
  "jeep": 60,
  "ford": 50,
  "lincoln": 50,
  "mercury": 50,
  "hyundai": 50,
  "infiniti": 60,
  "kia": 50,
  "nissan": 60,
  "toyota": 60,
  "lexus": 60,
  "chevy": 50,
  "gm": 50,
  "mazda": 60,
  "subaru": 60,
  "bmw": 70
};

/**
 * Open the quote editor with prefilled values
 * @param {Object} quoteData - The quote data to edit
 */
function openQuoteEditor(quoteData) {
  // Check if user is pro
  const user = getCurrentUser();
  if (!user || !user.subscriptionStatus || user.subscriptionStatus === 'free') {
    showToast('Quote editing is a Pro feature. Please upgrade to edit quotes.', 'error');
    return;
  }
  
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '1000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'var(--color-card-bg)';
  modalContent.style.borderRadius = '12px';
  modalContent.style.padding = '24px';
  modalContent.style.width = '90%';
  modalContent.style.maxWidth = '600px';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Modal header
  const modalHeader = document.createElement('div');
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  modalHeader.style.marginBottom = '16px';
  modalHeader.style.paddingBottom = '16px';
  modalHeader.style.borderBottom = '1px solid var(--color-border)';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Edit Quote';
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = '20px';
  modalTitle.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.color = 'var(--color-text-primary)';
  closeButton.onclick = () => {
    document.body.removeChild(modalOverlay);
  };
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  
  // Create the form
  const form = document.createElement('form');
  
  // Labor cost section
  const laborSection = createSectionHeader('Labor', 'Edit labor rates and hours');
  form.appendChild(laborSection);
  
  // Labor hours
  const hoursInput = createInput('number', 'laborHours', quoteData.laborHours.toString(), 'Labor hours', '0.5', '100', '0.5');
  form.appendChild(createFormGroup('Labor Hours', hoursInput));
  
  // Hourly rate
  const rateInput = createInput('number', 'hourlyRate', quoteData.hourlyRate.toFixed(2), 'Hourly rate', '15', '500', '0.01');
  form.appendChild(createFormGroup('Hourly Rate ($)', rateInput));
  
  // Materials cost section
  const materialsSection = createSectionHeader('Materials', 'Edit materials and additional costs');
  form.appendChild(materialsSection);
  
  // Materials cost
  const materialsInput = createInput('number', 'materialsCost', quoteData.materialsCost.toFixed(2), 'Materials cost', '0', '10000', '0.01');
  form.appendChild(createFormGroup('Materials Cost ($)', materialsInput));
  
  // Additional fees
  const feesInput = createInput('number', 'additionalFees', quoteData.additionalFees ? quoteData.additionalFees.toFixed(2) : '0.00', 'Additional fees', '0', '1000', '0.01');
  form.appendChild(createFormGroup('Additional Fees ($)', feesInput));
  
  // Travel section
  const travelSection = createSectionHeader('Travel', 'Edit travel distance and costs');
  form.appendChild(travelSection);
  
  // Travel distance
  const distanceInput = createInput('number', 'travelDistance', quoteData.travelDistance.toString(), 'Travel distance (miles)', '0', '1000', '0.1');
  form.appendChild(createFormGroup('Travel Distance (miles)', distanceInput));
  
  // Gas price
  const gasInput = createInput('number', 'gasPrice', quoteData.gasPrice.toFixed(2), 'Gas price per gallon', '2', '10', '0.01');
  form.appendChild(createFormGroup('Gas Price ($/gallon)', gasInput));
  
  // Notes section
  const notesSection = createSectionHeader('Notes', 'Additional information for the quote');
  form.appendChild(notesSection);
  
  // Customer notes
  const notesArea = createTextarea('customerNotes', 'Notes for the customer');
  notesArea.value = quoteData.customerNotes || '';
  form.appendChild(createFormGroup('Customer Notes', notesArea));
  
  // Form actions
  const formActions = document.createElement('div');
  formActions.style.display = 'flex';
  formActions.style.justifyContent = 'flex-end';
  formActions.style.gap = '12px';
  formActions.style.marginTop = '24px';
  
  const cancelButton = createButton('Cancel', () => {
    document.body.removeChild(modalOverlay);
  }, 'secondary');
  cancelButton.style.backgroundColor = 'var(--color-bg-secondary)';
  
  const saveButton = createButton('Update Quote', () => {
    // Get updated values
    const updatedQuote = {
      ...quoteData,
      laborHours: parseFloat(hoursInput.value),
      hourlyRate: parseFloat(rateInput.value),
      materialsCost: parseFloat(materialsInput.value),
      additionalFees: parseFloat(feesInput.value),
      travelDistance: parseFloat(distanceInput.value),
      gasPrice: parseFloat(gasInput.value),
      customerNotes: notesArea.value
    };
    
    // Recalculate derived values
    updatedQuote.laborCost = updatedQuote.laborHours * updatedQuote.hourlyRate;
    updatedQuote.fuelCost = (updatedQuote.travelDistance / 25) * updatedQuote.gasPrice; // Assuming 25 MPG
    updatedQuote.travelServiceFee = (updatedQuote.travelDistance / 30) * (updatedQuote.hourlyRate / 2); // Assuming 30 mph, half hourly rate
    updatedQuote.travelCost = updatedQuote.fuelCost + updatedQuote.travelServiceFee;
    
    // Recalculate subtotal, tax, and total
    updatedQuote.subtotal = updatedQuote.laborCost + updatedQuote.materialsCost + updatedQuote.travelCost + (updatedQuote.additionalFees || 0);
    updatedQuote.taxAmount = updatedQuote.subtotal * updatedQuote.taxRate;
    updatedQuote.total = updatedQuote.subtotal + updatedQuote.taxAmount;
    
    // Recalculate profit metrics
    const totalCosts = (updatedQuote.materialsCost / 1.3) + (updatedQuote.fuelCost) + (updatedQuote.laborHours * 15); // Assuming $15/hr cost basis
    updatedQuote.profit = updatedQuote.total - totalCosts;
    updatedQuote.actualMargin = (updatedQuote.profit / updatedQuote.total) * 100;
    
    // Update the quote display
    displayQuoteResult(updatedQuote);
    
    // Save the updated quote to local storage
    saveQuote(updatedQuote);
    
    // Close the modal
    document.body.removeChild(modalOverlay);
    
    // Show success toast
    showToast('Quote updated successfully!', 'success');
  });
  
  formActions.appendChild(cancelButton);
  formActions.appendChild(saveButton);
  form.appendChild(formActions);
  
  modalContent.appendChild(form);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

/**
 * Base labor hours for different automotive service types
 */
const autoLaborHours = {
  // Standard and key services
  all_keys_lost: 2.5,
  duplicate_key: 1,
  ignition_repair: 3,
  lock_rekey: 1.5,
  ecu_reflash: 3.5,
  
  // Standard automotive services
  oil_change: 1.0,
  brake_service: 2.5,
  tire_service: 1.0,
  engine_repair: 4.0,
  transmission: 5.0,
  electrical: 3.0,
  ac_service: 2.5,
  
  // Customization services (typically require more labor hours)
  body_repair: 4.0,
  detailing: 3.0,
  paint_work: 5.0,
  window_tinting: 2.0,
  sound_system: 3.5,
  vehicle_wrap: 4.5
};

/**
 * Creates the automotive quote form
 * @returns {HTMLElement} The automotive form element
 */
function createAutomotiveQuoteForm() {
  const form = document.createElement('form');
  form.style.backgroundColor = 'var(--color-card-bg)';
  form.style.padding = '24px';
  form.style.borderRadius = '12px';
  form.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Prevent default form submission which causes page refresh on mobile
  form.setAttribute('novalidate', 'true');
  form.setAttribute('autocomplete', 'off');
  form.setAttribute('onsubmit', 'event.preventDefault(); event.stopPropagation(); return false;');
  
  // Triple protection against form submission for ZFold devices
  // Check if we're on a foldable device using the viewport utility function
  const { width, isFoldableClosed } = updateViewportClasses();
  const isFoldable = width < 400 || isFoldableClosed;
  
  if (isFoldable) {
    console.log("ZFold device detected - applying enhanced form protection");
    form.id = 'auto-quote-form-zfold'; // Special ID to avoid form finder conflicts
  } else {
    form.id = 'auto-quote-form';
  }
  
  // Add event listener with capture phase to prevent bubbling
  form.addEventListener('submit', function(event) {
    console.log("Form submission intercepted");
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    if (event && event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }
    return false;
  }, true);
  
  // Vehicle details section
  const vehicleSection = createSectionHeader('Vehicle Details', 'Enter information about the vehicle for an accurate quote');
  form.appendChild(vehicleSection);
  
  // Vehicle make
  const makeInput = createInput('text', 'vehicle_make', '', 'e.g. Honda, Toyota, Ford');
  form.appendChild(createFormGroup('Vehicle Make', makeInput));
  
  // Vehicle model
  const modelInput = createInput('text', 'vehicle_model', '', 'e.g. Accord, Camry, F-150');
  form.appendChild(createFormGroup('Vehicle Model', modelInput));
  
  // Vehicle year
  const yearInput = createInput('number', 'vehicle_year', '2020', 'Year', '1990', '2025', '1');
  form.appendChild(createFormGroup('Vehicle Year', yearInput));
  
  // Service type
  const serviceOptions = [
    // Standard automotive services
    { value: 'oil_change', label: 'Oil Change' },
    { value: 'brake_service', label: 'Brake Service' },
    { value: 'tire_service', label: 'Tire Service/Rotation' },
    { value: 'engine_repair', label: 'Engine Repair' },
    { value: 'transmission', label: 'Transmission Service' },
    { value: 'electrical', label: 'Electrical Repair' },
    { value: 'ac_service', label: 'A/C Service' },
    
    // Security and key services
    { value: 'all_keys_lost', label: 'All Keys Lost' },
    { value: 'duplicate_key', label: 'Duplicate Key' },
    { value: 'ignition_repair', label: 'Ignition Repair' },
    { value: 'lock_rekey', label: 'Lock Rekey' },
    { value: 'ecu_reflash', label: 'ECU Reflash' },
    
    // Customization services
    { value: 'body_repair', label: 'Body Repair/Customization' },
    { value: 'detailing', label: 'Pro Detailing' },
    { value: 'paint_work', label: 'Custom Paint Work' },
    { value: 'window_tinting', label: 'Window Tinting' },
    { value: 'sound_system', label: 'Sound System Installation' },
    { value: 'vehicle_wrap', label: 'Vehicle Wrap Installation' }
  ];
  const serviceSelect = createSelect('service_type', serviceOptions);
  form.appendChild(createFormGroup('Service Type', serviceSelect));
  
  // Location section title
  const locationSection = createSectionHeader('Service Locations', 'Enter starting and destination addresses to calculate distance');
  form.appendChild(locationSection);
  
  // Start address (for tax calculation and distance starting point)
  const startAddressContainer = document.createElement('div');
  startAddressContainer.style.position = 'relative';
  
  const startAddressInput = createInput('text', 'address', '', 'Your business or starting location');
  startAddressInput.id = 'auto-address-input';
  startAddressInput.setAttribute('autocomplete', 'off');
  
  // Special handling for foldable devices (ZFold)
  startAddressInput.addEventListener('focus', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    // Use viewport utility function to detect foldable devices
    const { width, isFoldableClosed } = updateViewportClasses();
    const isFoldable = width < 400 || isFoldableClosed;
    
    // Detect if we're on a foldable device in folded mode
    if (isFoldable) {
      console.log("Folded device detected - using special handling");
      // For folded devices, use this special handling
      setTimeout(() => {
        // Focus on the field after a brief delay
        startAddressInput.focus();
      }, 50);
    }
    return false;
  });
  
  startAddressInput.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  });
  
  // Disable form submission when this field is active
  startAddressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  });
  
  // Add small info icon to indicate autocomplete functionality
  const startInfoIcon = document.createElement('span');
  startInfoIcon.innerHTML = '&#9432;'; // Info icon
  startInfoIcon.style.position = 'absolute';
  startInfoIcon.style.right = '10px';
  startInfoIcon.style.top = '50%';
  startInfoIcon.style.transform = 'translateY(-50%)';
  startInfoIcon.style.color = 'var(--color-text-secondary)';
  startInfoIcon.style.cursor = 'pointer';
  startInfoIcon.title = 'Start typing for address suggestions';
  
  startAddressContainer.appendChild(startAddressInput);
  startAddressContainer.appendChild(startInfoIcon);
  
  // Add clear button for start address
  const startClearBtn = document.createElement('button');
  startClearBtn.type = 'button';
  startClearBtn.textContent = '×';
  startClearBtn.style.position = 'absolute';
  startClearBtn.style.right = '30px';
  startClearBtn.style.top = '50%';
  startClearBtn.style.transform = 'translateY(-50%)';
  startClearBtn.style.background = 'none';
  startClearBtn.style.border = 'none';
  startClearBtn.style.fontSize = '18px';
  startClearBtn.style.cursor = 'pointer';
  startClearBtn.style.color = 'var(--color-text-secondary)';
  startClearBtn.style.display = 'none';
  startClearBtn.onclick = () => {
    startAddressInput.value = '';
    startClearBtn.style.display = 'none';
  };
  
  startAddressContainer.appendChild(startClearBtn);
  
  // Show/hide clear button based on input value
  startAddressInput.addEventListener('input', () => {
    startClearBtn.style.display = startAddressInput.value ? 'block' : 'none';
  });
  
  // Add hidden element to store place data
  const placeDataElement = document.createElement('div');
  placeDataElement.id = 'auto-address-place-data';
  placeDataElement.style.display = 'none';
  startAddressContainer.appendChild(placeDataElement);
  
  form.appendChild(createFormGroup('Start Address', startAddressContainer));
  
  // Destination address (for service location and distance calculation)
  const destAddressContainer = document.createElement('div');
  destAddressContainer.style.position = 'relative';
  
  const destAddressInput = createInput('text', 'destination_address', '', 'Customer or service location');
  destAddressInput.id = 'auto-destination-input'; // Give this a unique ID to avoid conflicts
  destAddressInput.setAttribute('autocomplete', 'off');
  
  // Special handling for foldable devices (ZFold)
  destAddressInput.addEventListener('focus', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    // Use viewport utility function to detect foldable devices
    const { width, isFoldableClosed } = updateViewportClasses();
    const isFoldable = width < 400 || isFoldableClosed;
    
    // Detect if we're on a foldable device in folded mode
    if (isFoldable) {
      console.log("Folded device detected - using special handling for destination");
      // For folded devices, use this special handling
      setTimeout(() => {
        // Focus on the field after a brief delay
        destAddressInput.focus();
      }, 50);
    }
    return false;
  });
  
  destAddressInput.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  });
  
  // Disable form submission when this field is active
  destAddressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  });
  
  // Create the input field first, but don't add it to the container yet
  // We'll ensure everything is properly set up before we add elements to the DOM
  
  // Create dropdown container if it doesn't exist
  const dropdownId = `destination-input-dropdown`;
  let dropdown = document.getElementById(dropdownId);
  if (!dropdown) {
    console.log('DIRECT DEBUG: Creating new dropdown container for destination address');
    dropdown = document.createElement('div');
    dropdown.className = 'stackr-autocomplete-container';
    dropdown.id = dropdownId;
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1000';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.width = '100%';
    dropdown.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
    dropdown.style.borderRadius = '4px';
    dropdown.style.marginTop = '2px';
    dropdown.style.display = 'none';
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflowY = 'auto';
    destAddressContainer.appendChild(dropdown);
  }
  
  // Add direct input handler for debugging
  destAddressInput.addEventListener('input', (e) => {
    console.log(`DIRECT DEBUG: Destination input value changed: "${e.target.value}"`);
    
    // Try to trigger the API call directly when we type at least 3 characters
    if (e.target.value.trim().length >= 3) {
      console.log(`DIRECT DEBUG: Trying to fetch suggestions for "${e.target.value}"`);
      
      // Make the fetch request directly
      fetch(`/api/address-suggestions?query=${encodeURIComponent(e.target.value.trim())}`)
        .then(response => {
          console.log(`DIRECT DEBUG: Got response status ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log(`DIRECT DEBUG: Received ${data.predictions?.length || 0} suggestions`);
          
          // Get dropdown reference again to be sure
          const dropdown = document.getElementById(dropdownId);
          
          if (dropdown && data.predictions && data.predictions.length > 0) {
            console.log(`DIRECT DEBUG: Attempting to show dropdown`, dropdown);
            dropdown.innerHTML = '';
            
            data.predictions.forEach((suggestion) => {
              const item = document.createElement('div');
              item.className = 'stackr-autocomplete-item';
              item.style.padding = '10px';
              item.style.cursor = 'pointer';
              item.style.borderBottom = '1px solid #eee';
              
              const mainPart = suggestion.structured_formatting?.main_text || 
                             suggestion.description.split(',')[0];
              
              const secondaryPart = suggestion.structured_formatting?.secondary_text || 
                                  suggestion.description.split(',').slice(1).join(',');
              
              item.innerHTML = `
                <div class="stackr-autocomplete-primary" style="font-weight: bold; color: #333;">${mainPart}</div>
                <div class="stackr-autocomplete-secondary" style="font-size: 12px; color: #666; margin-top: 4px;">${secondaryPart}</div>
              `;
              
              item.addEventListener('click', () => {
                destAddressInput.value = suggestion.description;
                dropdown.style.display = 'none';
                console.log(`DIRECT DEBUG: Selected "${suggestion.description}" from suggestions`);
                
                // Store place data
                const placeDataElement = document.getElementById('destination-place-data');
                if (placeDataElement) {
                  placeDataElement.dataset.placeId = suggestion.place_id || '';
                  placeDataElement.dataset.fullText = suggestion.description || '';
                  
                  // Try to extract lat/lng from suggestion if available
                  if (suggestion.geometry && suggestion.geometry.location) {
                    placeDataElement.dataset.lat = suggestion.geometry.location.lat;
                    placeDataElement.dataset.lng = suggestion.geometry.location.lng;
                  }
                }
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                destAddressInput.dispatchEvent(event);
              });
              
              dropdown.appendChild(item);
            });
            
            dropdown.style.display = 'block';
          } else if (dropdown) {
            dropdown.style.display = 'none';
          }
        })
        .catch(err => {
          console.error('DIRECT DEBUG: Error fetching suggestions:', err);
        });
    } else if (e.target.value.trim().length === 0) {
      // Hide dropdown when input is empty
      const dropdown = document.getElementById(dropdownId);
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    }
  });
  
  // Add small info icon for destination address
  const destInfoIcon = document.createElement('span');
  destInfoIcon.innerHTML = '&#9432;'; // Info icon
  destInfoIcon.style.position = 'absolute';
  destInfoIcon.style.right = '10px';
  destInfoIcon.style.top = '50%';
  destInfoIcon.style.transform = 'translateY(-50%)';
  destInfoIcon.style.color = 'var(--color-text-secondary)';
  destInfoIcon.style.cursor = 'pointer';
  destInfoIcon.title = 'Start typing for address suggestions';
  
  destAddressContainer.appendChild(destAddressInput);
  destAddressContainer.appendChild(destInfoIcon);
  
  // Add clear button for destination address
  const destClearBtn = document.createElement('button');
  destClearBtn.type = 'button';
  destClearBtn.textContent = '×';
  destClearBtn.style.position = 'absolute';
  destClearBtn.style.right = '30px';
  destClearBtn.style.top = '50%';
  destClearBtn.style.transform = 'translateY(-50%)';
  destClearBtn.style.background = 'none';
  destClearBtn.style.border = 'none';
  destClearBtn.style.fontSize = '18px';
  destClearBtn.style.cursor = 'pointer';
  destClearBtn.style.color = 'var(--color-text-secondary)';
  destClearBtn.style.display = 'none';
  destClearBtn.onclick = () => {
    destAddressInput.value = '';
    destClearBtn.style.display = 'none';
  };
  
  destAddressContainer.appendChild(destClearBtn);
  
  // Show/hide clear button based on input value
  destAddressInput.addEventListener('input', () => {
    destClearBtn.style.display = destAddressInput.value ? 'block' : 'none';
  });
  
  // Add hidden element to store destination place data
  const destPlaceDataElement = document.createElement('div');
  destPlaceDataElement.id = 'auto-destination-place-data'; // Use the correct ID
  destPlaceDataElement.style.display = 'none';
  destAddressContainer.appendChild(destPlaceDataElement);
  
  form.appendChild(createFormGroup('Destination Address', destAddressContainer));
  
  // Options section
  const optionsSection = createSectionHeader('Additional Options', 'Customize your quote settings');
  form.appendChild(optionsSection);
  
  // Experience adjustment slider (in years now instead of percentage)
  const expRow = document.createElement('div');
  expRow.style.marginBottom = '16px';
  
  const expLabel = document.createElement('label');
  expLabel.textContent = 'Years of Experience: 3 years';
  expLabel.style.display = 'block';
  expLabel.style.marginBottom = '8px';
  expLabel.style.fontSize = '14px';
  expLabel.style.fontWeight = '500';
  
  // Change range from years 0-20, with default of 3 years
  const expSlider = createInput('range', 'labor_adjustment', '3', '', '0', '20', '1');
  expSlider.addEventListener('input', (e) => {
    const years = parseInt(e.target.value);
    expLabel.textContent = `Years of Experience: ${years} ${years === 1 ? 'year' : 'years'}`;
  });
  
  expRow.appendChild(expLabel);
  expRow.appendChild(expSlider);
  form.appendChild(expRow);
  
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
  
  // Buttons row
  const buttonsRow = document.createElement('div');
  buttonsRow.style.display = 'flex';
  buttonsRow.style.gap = '12px';
  buttonsRow.style.marginTop = '24px';
  
  // Generate quote button
  const generateButton = createButton('Generate Auto Quote', (e) => {
    handleAutoQuoteFormSubmit(e);
  }, 'primary');
  
  // Reset form button
  const resetButton = createButton('Reset Form', () => {
    form.reset();
    expLabel.textContent = 'Years of Experience: 3 years';
    document.getElementById('quote-result-section').innerHTML = '';
  }, 'secondary');
  
  buttonsRow.appendChild(generateButton);
  buttonsRow.appendChild(resetButton);
  form.appendChild(buttonsRow);
  
  return form;
}

/**
 * Handle auto quote form submission
 * @param {Event} e - Form submission event
 */
function handleAutoQuoteFormSubmit(e) {
  console.log("Quote form submit handler triggered");
  
  // Always prevent form submission which causes page refresh on mobile
  if (e && e.preventDefault) {
    console.log("Preventing default form submission");
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  
  // Check if we're on a foldable device using the viewport utility function
  const { width, isFoldableClosed } = updateViewportClasses();
  const isFoldable = width < 400 || isFoldableClosed;
  
  // Look for the form using multiple IDs since we renamed it for foldable devices
  let form = document.getElementById('auto-quote-form');
  
  if (!form && isFoldable) {
    console.log("Form not found with standard ID, checking foldable ID");
    form = document.getElementById('auto-quote-form-zfold');
  }
  
  if (!form) {
    console.log("Form still not found, looking for any available form");
    // As a last resort, try to find the form from the event target
    if (e && e.target && e.target.tagName === 'FORM') {
      form = e.target;
    } else if (e && e.target) {
      // Try to find the closest form to the event target
      let element = e.target;
      while (element && element.tagName !== 'FORM') {
        element = element.parentElement;
      }
      form = element;
    }
  }
  
  if (!form) {
    console.error("Cannot find form element by any method");
    showToast('Error: Form not found. Please try again.', 'error');
    return;
  }
  
  console.log("Found form, processing submission");
  const formData = new FormData(form);
  
  // Basic validation
  const make = formData.get('vehicle_make');
  const model = formData.get('vehicle_model');
  const year = formData.get('vehicle_year');
  const serviceType = formData.get('service_type');
  const startAddress = formData.get('address');
  const destinationAddress = formData.get('destination_address');
  
  if (!make || !model || !year || !serviceType || !startAddress || !destinationAddress) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Show loading state
  const resultSection = document.getElementById('quote-result-section');
  resultSection.innerHTML = '<div style="text-align: center; padding: 20px;">Generating automotive quote...</div>';
  
  try {
    // Get location data for distance calculation with safe access
    const startPlaceDataEl = document.getElementById('auto-address-place-data');
    const destPlaceDataEl = document.getElementById('auto-destination-place-data'); // Updated to match the correct ID
    
    // Use empty objects as fallbacks if elements don't exist
    const startPlaceData = startPlaceDataEl ? startPlaceDataEl.dataset : {};
    const destPlaceData = destPlaceDataEl ? destPlaceDataEl.dataset : {};
    
    console.log('QUOTE FORM DEBUG: Start place data:', startPlaceData);
    console.log('QUOTE FORM DEBUG: Destination place data:', destPlaceData);
    
    // Transform form data into object with defensive coding
    const quoteData = {
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: parseInt(year || '0'),
      service_type: serviceType || 'standard',
      address: startAddress || '',
      destination_address: destinationAddress || '',
      startLatLng: {
        lat: startPlaceData.lat ? parseFloat(startPlaceData.lat) : null,
        lng: startPlaceData.lng ? parseFloat(startPlaceData.lng) : null
      },
      destLatLng: {
        lat: destPlaceData.lat ? parseFloat(destPlaceData.lat) : null,
        lng: destPlaceData.lng ? parseFloat(destPlaceData.lng) : null
      },
      labor_adjustment: parseInt(formData.get('labor_adjustment') || '0'),
      emergency: formData.get('emergency') === 'on'
    };
    
    // Generate quote
    const quoteResult = generateAutoQuote(quoteData);
    
    // Display results
    displayAutoQuoteResult(quoteResult);
    
  } catch (error) {
    console.error('Error generating auto quote:', error);
    resultSection.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Error generating quote: ${error.message}</div>`;
    showToast('Failed to generate auto quote', 'error');
  }
}

/**
 * Generate an automotive quote with tiered pricing options
 * @param {Object} quoteData - The automotive quote data
 * @returns {Object} The generated quote result with tiered options
 */
/**
 * Generate an automotive quote with tiered pricing options
 * @param {Object} quoteData - The automotive quote data
 * @returns {Object} The generated quote result with tiered options
 */
function generateAutoQuote(quoteData) {
  // Extract data
  const {
    vehicle_make,
    vehicle_model,
    vehicle_year,
    service_type,
    address,
    destination_address,
    startLatLng,
    destLatLng,
    labor_adjustment,
    emergency
  } = quoteData;
  
  // Get state and tax rate based on the service address (destination)
  const state = validateAddressGetState(destination_address || address);
  const taxRate = getStateTaxRateByState(state);
  
  // Get base labor hours for this service type
  const baseLaborHours = autoLaborHours[service_type] || 2;
  
  // Get market rate for this location
  const marketRate = getAutoMarketRate(destination_address || address);
  
  // Apply experience adjustment to labor rate based on years of experience
  // Convert years to a percentage adjustment (0 years: -15%, 20 years: +25%)
  const experiencePercentage = (labor_adjustment / 20) * 40 - 15; 
  const adjustedLaborRate = marketRate * (1 + (experiencePercentage / 100));
  
  // Emergency service fee is now a flat $50 as specified
  const emergencyFee = emergency ? 50 : 0;
  
  // Calculate labor cost
  let baseLaborCost = baseLaborHours * adjustedLaborRate;
  
  // Apply emergency surcharge if needed (50% increase) - now using flat fee instead
  let laborCost = baseLaborCost;
  
  // Get parts cost based on service type and vehicle
  const partsCost = searchPartsCost(vehicle_make, vehicle_model, vehicle_year, service_type);
  
  // Determine if keycode is needed and add cost
  let keycodeCost = 0;
  if (service_type === 'all_keys_lost') {
    // Normalize make to lowercase for lookup
    const normalizedMake = vehicle_make.trim().toLowerCase();
    keycodeCost = keycodePrices[normalizedMake] || 50; // Default to $50 if not found
  }
  
  // Calculate distance and travel costs if we have both addresses
  let travelDistance = 0;
  let fuelCost = 0;
  let travelServiceFee = 0;
  let gasPrice = 3.89; // Default gas price if we can't determine it

  // Only calculate travel costs if we have different addresses
  if (address && destination_address && address !== destination_address) {
    // Try to calculate using coordinates if available
    if (startLatLng?.lat && startLatLng?.lng && destLatLng?.lat && destLatLng?.lng) {
      travelDistance = calculateDistance(
        startLatLng.lat, 
        startLatLng.lng, 
        destLatLng.lat, 
        destLatLng.lng
      );
    } else {
      // Fallback to a rough estimate based on zip codes or city names
      travelDistance = estimateDistanceFromAddresses(address, destination_address);
    }
    
    // Get current gas price for the state
    gasPrice = getGasPriceForState(state);
    
    // Calculate travel costs (assume 25 mpg and round-trip)
    const roundTripDistance = travelDistance * 2;
    fuelCost = (roundTripDistance / 25) * gasPrice;
    
    // Add service fee for travel time (based on adjusted labor rate)
    // Assume average speed of 30 mph in city, so hours = distance / 30
    const travelTimeHours = roundTripDistance / 30;
    travelServiceFee = travelTimeHours * (adjustedLaborRate * 0.75); // 75% of regular rate for travel time
  }
  
  // Calculate base travel cost
  const baseTravelCost = fuelCost + travelServiceFee;
  
  // Generate tiered quote options
  // TIER 1: STANDARD - Basic service with standard parts and no extras
  const tierStandard = generateTierQuote({
    name: "Standard Service",
    description: "Basic service package with essential parts and standard labor.",
    laborMultiplier: 1.0,     // Standard labor rate
    partsMultiplier: 1.0,     // Standard parts cost
    warrantyMonths: 3,        // 3-month parts warranty
    extraServices: [],
    laborCost,
    partsCost,
    keycodeCost,
    baseTravelCost,
    emergencyFee,
    taxRate,
    targetMargin: 30,         // 30% target margin for standard tier
    service_type               // Pass service type for service-specific adjustments
  });
  
  // TIER 2: PREMIUM - Enhanced service with better parts and some value-adds
  const tierPremium = generateTierQuote({
    name: "Premium Service",
    description: "Enhanced service with premium parts, extended warranty, and complimentary inspection.",
    laborMultiplier: 1.15,    // 15% labor premium for enhanced service
    partsMultiplier: 1.2,     // 20% parts upgrade
    warrantyMonths: 6,        // 6-month parts warranty
    extraServices: [
      { name: "Complimentary 27-point inspection", cost: 0 },
      { name: "Premium parts upgrade", cost: partsCost * 0.2 }
    ],
    laborCost,
    partsCost,
    keycodeCost,
    baseTravelCost,
    emergencyFee,
    taxRate,
    targetMargin: 45,         // 45% target margin for premium tier
    service_type               // Pass service type for service-specific adjustments
  });
  
  // TIER 3: ULTIMATE - Top-tier service with premium parts, extensive value-adds
  const tierUltimate = generateTierQuote({
    name: "Ultimate Service",
    description: "Comprehensive service with top-tier parts, extended warranty, and priority scheduling.",
    laborMultiplier: 1.3,     // 30% labor premium for premium service
    partsMultiplier: 1.4,     // 40% parts upgrade to premium components
    warrantyMonths: 12,       // 12-month extended warranty
    extraServices: [
      { name: "Complimentary 27-point inspection", cost: 0 },
      { name: "Premium parts upgrade", cost: partsCost * 0.3 },
      { name: "Priority scheduling", cost: 25 },
      { name: "90-day follow-up service", cost: 35 }
    ],
    laborCost,
    partsCost,
    keycodeCost,
    baseTravelCost,
    emergencyFee,
    taxRate,
    targetMargin: 65,         // 65% target margin for ultimate tier
    service_type               // Pass service type for service-specific adjustments
  });
  
  // Find appropriate service tier recommendations based on the service type
  const tierRecommendations = getTierRecommendations(service_type);
  
  // Calculate service-specific value propositions
  const valueProps = getValuePropositions(service_type);
  
  // Return quote result with all the calculated values and tiers
  return {
    vehicle_make,
    vehicle_model,
    vehicle_year,
    service_type,
    address,
    destination_address,
    state,
    travelDistance,
    gasPrice,
    emergency,
    labor_adjustment,
    tierStandard,
    tierPremium,
    tierUltimate,
    // Include value propositions specific to the service type
    tierRecommendations,
    valueProps,
    // Reference data for displaying in the UI
    serviceDetails: {
      baseLaborHours,
      adjustedLaborRate,
      baseLaborCost,
      basePartsCost: partsCost,
      keycodeCost,
      taxRate
    }
  };
}

/**
 * Generate a tier quote with specific pricing parameters
 * @param {Object} options - Tier options
 * @returns {Object} Calculated tier pricing
 */
function generateTierQuote(options) {
  const {
    name,
    description,
    laborMultiplier,
    partsMultiplier,
    warrantyMonths,
    extraServices,
    laborCost,
    partsCost,
    keycodeCost,
    baseTravelCost,
    emergencyFee,
    taxRate,
    targetMargin,
    service_type // Optional service type for service-specific adjustments
  } = options;
  
  // Calculate costs with appropriate multipliers
  let adjustedLaborCost = laborCost * laborMultiplier;
  let adjustedPartsCost = partsCost * partsMultiplier;
  
  // Service-specific adjustments
  let serviceAdjustments = {
    diagnosticFee: 0,
    specialEquipmentFee: 0,
    certificationFee: 0,
    rushFee: 0,
    materialQualityUpgrade: 0
  };
  
  // Specialized adjustment logic based on service type and tier
  if (service_type) {
    // Key and security services
    if (['all_keys_lost', 'duplicate_key', 'ignition_repair'].includes(service_type)) {
      if (name === 'Premium Service' || name === 'Ultimate Service') {
        // Premium key services require specialized electronic diagnostics 
        serviceAdjustments.diagnosticFee = name === 'Ultimate Service' ? 60 : 30;
      }
      
      // Security-related services have stricter certification requirements
      if (service_type === 'all_keys_lost') {
        serviceAdjustments.certificationFee = 25;
      }
    }
    
    // Engine and mechanical services
    else if (['engine_repair', 'transmission', 'brake_service'].includes(service_type)) {
      // These are complex mechanical services requiring specialized training
      if (name === 'Premium Service') {
        serviceAdjustments.diagnosticFee = 45;
        serviceAdjustments.specialEquipmentFee = 30;
      } else if (name === 'Ultimate Service') {
        serviceAdjustments.diagnosticFee = 75;
        serviceAdjustments.specialEquipmentFee = 60;
        serviceAdjustments.certificationFee = 40; // Master technician premium
      }
      
      // Adjust labor cost for complex mechanical work in premium tiers
      if (name === 'Ultimate Service' && service_type === 'engine_repair') {
        adjustedLaborCost *= 1.15; // Additional 15% for master technician expertise
      }
    }
    
    // Body work and cosmetic services
    else if (['body_repair', 'paint_work', 'detailing'].includes(service_type)) {
      // These services vary dramatically in quality based on materials and time spent
      if (name === 'Premium Service') {
        serviceAdjustments.materialQualityUpgrade = adjustedPartsCost * 0.15; // 15% materials upgrade
      } else if (name === 'Ultimate Service') {
        serviceAdjustments.materialQualityUpgrade = adjustedPartsCost * 0.30; // 30% premium materials
        serviceAdjustments.specialEquipmentFee = 75; // Special finishing equipment
      }
      
      // Premium paint and body work takes more time and care
      if (name !== 'Standard Service' && service_type === 'paint_work') {
        adjustedLaborCost *= name === 'Ultimate Service' ? 1.25 : 1.15; // Additional labor time for quality
      }
    }
    
    // Customization services
    else if (['window_tinting', 'sound_system', 'vehicle_wrap'].includes(service_type)) {
      // These services have significant material quality differences
      if (name === 'Premium Service') {
        serviceAdjustments.materialQualityUpgrade = adjustedPartsCost * 0.20; // 20% better materials
        
        // Sound systems need specialized tuning in premium tiers
        if (service_type === 'sound_system') {
          serviceAdjustments.specialEquipmentFee = 50;
        }
      } 
      else if (name === 'Ultimate Service') {
        serviceAdjustments.materialQualityUpgrade = adjustedPartsCost * 0.40; // 40% premium materials
        serviceAdjustments.specialEquipmentFee = service_type === 'sound_system' ? 120 : 80;
      }
    }
    
    // Rush/emergency services in higher tiers get priority scheduling
    if (emergencyFee > 0 && name !== 'Standard Service') {
      serviceAdjustments.rushFee = name === 'Ultimate Service' ? 40 : 25;
    }
  }
  
  // Calculate total service adjustments
  const totalServiceAdjustments = Object.values(serviceAdjustments).reduce((sum, val) => sum + val, 0);
  
  // Calculate extra services total
  const extraServicesTotal = extraServices.reduce((sum, service) => sum + service.cost, 0);
  
  // Calculate subtotal with service-specific adjustments
  const subtotal = adjustedLaborCost + 
                  adjustedPartsCost + 
                  keycodeCost + 
                  baseTravelCost + 
                  extraServicesTotal + 
                  emergencyFee + 
                  totalServiceAdjustments;
  
  // Calculate tax (applied to parts and materials only)
  const taxAmount = (adjustedPartsCost + serviceAdjustments.materialQualityUpgrade) * taxRate;
  
  // Calculate total
  const total = subtotal + taxAmount;
  
  // Calculate cost basis for profit calculation - with service-specific adjustments
  const costBasis = {
    labor: laborCost * 0.7,                // 70% of labor goes to technician
    parts: adjustedPartsCost * 0.6,        // 60% of parts cost is our cost
    keycode: keycodeCost * 0.8,            // 80% of keycode cost is our cost
    travel: baseTravelCost * 0.9,          // 90% of travel cost is actual cost
    extraServices: extraServicesTotal * 0.5, // 50% of extras cost is our cost
    serviceAdjustments: totalServiceAdjustments * 0.7 // 70% of service adjustments are actual costs
  };
  
  const totalCost = Object.values(costBasis).reduce((sum, val) => sum + val, 0);
  const profit = total - totalCost - taxAmount;
  const profitMargin = (profit / total) * 100;
  
  // Compare to target margin
  const marginComparison = profitMargin - targetMargin;
  
  // Generate message based on margin
  let marginAssessment = '';
  if (marginComparison < -10) {
    marginAssessment = 'Warning: This tier has a profit margin significantly below target.';
  } else if (marginComparison < 0) {
    marginAssessment = 'This tier has a profit margin slightly below target.';
  } else if (marginComparison < 10) {
    marginAssessment = 'This tier has a profit margin on target.';
  } else {
    marginAssessment = 'This tier has an excellent profit margin above target.';
  }
  
  return {
    name,
    description,
    warrantyMonths,
    extraServices,
    laborCost: adjustedLaborCost,
    partsCost: adjustedPartsCost,
    keycodeCost,
    travelCost: baseTravelCost,
    emergencyFee,
    serviceAdjustments,
    totalServiceAdjustments,
    subtotal,
    taxAmount,
    total,
    profit,
    profitMargin,
    targetMargin,
    marginAssessment
  };
}

/**
 * Get service-specific tier recommendations
 * @param {string} serviceType - Type of automotive service
 * @returns {Object} Tier recommendations for the service
 */
function getTierRecommendations(serviceType) {
  // Default recommendations
  const defaultRecs = {
    recommended: 'standard',
    valueMessage: 'We recommend our Standard tier for most customers as it provides the essential service at a good value.'
  };
  
  // Service-specific recommendations
  const recommendations = {
    'oil_change': {
      recommended: 'premium',
      valueMessage: 'We recommend our Premium tier for oil changes as it includes a comprehensive inspection that can identify potential issues early.'
    },
    'brake_repair': {
      recommended: 'premium',
      valueMessage: 'For brake repairs, our Premium tier offers higher quality parts with better stopping power and longer lifespan.'
    },
    'battery_replacement': {
      recommended: 'ultimate',
      valueMessage: 'Our Ultimate tier for battery replacements includes a premium battery with longer warranty and complete electrical system check.'
    },
    'tire_replacement': {
      recommended: 'premium',
      valueMessage: 'Our Premium tier includes better quality tires with longer tread life and improved handling.'
    },
    'all_keys_lost': {
      recommended: 'ultimate',
      valueMessage: 'For replacement keys, our Ultimate package provides backup keys and programming for all vehicle remotes.'
    },
    'lockout': {
      recommended: 'standard',
      valueMessage: 'Our Standard service is quick and efficient for vehicle lockouts, getting you back on the road fast.'
    }
  };
  
  return recommendations[serviceType] || defaultRecs;
}

/**
 * Get service-specific value propositions
 * @param {string} serviceType - Type of automotive service
 * @returns {Object} Value propositions for each tier
 */
function getValuePropositions(serviceType) {
  // Default value propositions
  const defaultProps = {
    standard: ["Basic service with quality parts", "Performed by certified technicians", "3-month limited warranty"],
    premium: ["Enhanced service with premium parts", "Performed by senior technicians", "6-month comprehensive warranty", "Includes inspection"],
    ultimate: ["Comprehensive service with top-tier parts", "Performed by master technicians", "12-month premium warranty", "Priority scheduling", "Follow-up service"]
  };
  
  // Service-specific value propositions
  const serviceProps = {
    'oil_change': {
      standard: ["Standard oil and filter change", "Basic fluid level check", "3-month/3,000 mile warranty"],
      premium: ["Synthetic blend oil upgrade", "Complete fluid check and top-off", "Multi-point inspection", "6-month/6,000 mile warranty"],
      ultimate: ["Full synthetic oil upgrade", "Complete fluid exchange", "Comprehensive vehicle inspection", "Filter upgrades", "12-month/10,000 mile warranty"]
    },
    'brake_repair': {
      standard: ["Standard brake pads/shoes", "Resurface rotors/drums", "Basic brake inspection", "3-month/3,000 mile warranty"],
      premium: ["Premium brake pads/shoes", "Precision rotor/drum machining", "Complete brake system inspection", "6-month/6,000 mile warranty"],
      ultimate: ["Ceramic brake pads", "New rotors/drums if needed", "Complete brake system flush", "Caliper inspection and lubrication", "12-month/12,000 mile warranty"]
    },
    'battery_replacement': {
      standard: ["Standard battery installation", "Basic battery test", "3-month warranty"],
      premium: ["High-performance battery", "Electrical system check", "Terminal cleaning and protection", "6-month warranty"],
      ultimate: ["Premium AGM battery", "Full electrical system diagnostic", "Cable and connection upgrade", "12-month warranty with free replacement"]
    },
    'all_keys_lost': {
      standard: ["Single replacement key", "Basic programming", "30-day warranty"],
      premium: ["Two replacement keys", "Full programming of all features", "6-month warranty"],
      ultimate: ["Three replacement keys", "Premium fobs with extended range", "Backup virtual key storage", "12-month warranty"]
    }
  };
  
  return serviceProps[serviceType] || defaultProps;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Starting point latitude
 * @param {number} lon1 - Starting point longitude
 * @param {number} lat2 - Ending point latitude
 * @param {number} lon2 - Ending point longitude
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in miles
  const R = 3958.8;
  
  // Convert degrees to radians
  const toRad = (degrees) => degrees * Math.PI / 180;
  
  // Calculate differences
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimate distance between two addresses using a simplified approach
 * @param {string} address1 - First address
 * @param {string} address2 - Second address
 * @returns {number} Estimated distance in miles
 */
function estimateDistanceFromAddresses(address1, address2) {
  // Extract zip codes if possible
  const zip1 = extractZipCode(address1);
  const zip2 = extractZipCode(address2);
  
  if (zip1 && zip2) {
    // If same zip, return a minimum distance (1-3 miles)
    if (zip1 === zip2) {
      return 2;
    }
    
    // If first 3 digits match, they're in the same region (5-15 miles)
    if (zip1.substring(0, 3) === zip2.substring(0, 3)) {
      return 10;
    }
    
    // Different regions but perhaps same state (15-50 miles)
    if (zip1.substring(0, 1) === zip2.substring(0, 1)) {
      return 30;
    }
    
    // Different states (50+ miles)
    return 50;
  }
  
  // If no zip codes, use a default distance
  return 15;
}

/**
 * Extract ZIP code from an address string
 * @param {string} address - Address string
 * @returns {string|null} ZIP code or null if not found
 */
function extractZipCode(address) {
  // Try to match a 5-digit ZIP code
  const zipMatch = address.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

/**
 * Get current gas price for a state (2024 data - legacy version)
 * @param {string} state - State code (e.g., "CA", "NY")
 * @returns {number} Gas price per gallon
 */
function getStaticGasPriceForState(state) {
  // Gas price data by state (as of April 2024)
  const gasPrices = {
    'AL': 3.19, 'AK': 3.94, 'AZ': 3.59, 'AR': 3.17, 'CA': 4.87,
    'CO': 3.41, 'CT': 3.44, 'DE': 3.28, 'FL': 3.38, 'GA': 3.29,
    'HI': 4.69, 'ID': 3.49, 'IL': 3.69, 'IN': 3.42, 'IA': 3.25,
    'KS': 3.17, 'KY': 3.19, 'LA': 3.19, 'ME': 3.39, 'MD': 3.37,
    'MA': 3.38, 'MI': 3.47, 'MN': 3.28, 'MS': 3.08, 'MO': 3.22,
    'MT': 3.42, 'NE': 3.24, 'NV': 4.09, 'NH': 3.29, 'NJ': 3.37,
    'NM': 3.29, 'NY': 3.58, 'NC': 3.32, 'ND': 3.33, 'OH': 3.33,
    'OK': 3.16, 'OR': 3.81, 'PA': 3.54, 'RI': 3.38, 'SC': 3.19,
    'SD': 3.31, 'TN': 3.23, 'TX': 3.15, 'UT': 3.58, 'VT': 3.45,
    'VA': 3.29, 'WA': 4.12, 'WV': 3.34, 'WI': 3.32, 'WY': 3.39,
    'DC': 3.59
  };
  
  // Return the gas price for the state or a default value
  return gasPrices[state] || 3.50;
}

/**
 * Shorten an address for display purposes
 * @param {string} address - Full address
 * @returns {string} Shortened address
 */
function shortenAddress(address) {
  if (!address) return 'Unknown location';
  
  // Extract key parts of the address - try to keep just street number, name and city
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length <= 2) {
    // If it's already short, return as is
    return address;
  }
  
  // Try to get street address and city
  const streetAddress = parts[0];
  let city = '';
  
  // Look for the city part (usually second or third element)
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    // Skip state+zip part which often has numbers
    if (!part.match(/\d{5}/) && part.length > 2) {
      city = part;
      break;
    }
  }
  
  if (city) {
    return `${streetAddress}, ${city}`;
  }
  
  // Fallback - just keep first two parts
  return `${parts[0]}, ${parts[1]}`;
}

/**
 * Display the generated quote result with tiered options
 * @param {Object} quoteResult - The generated quote result
 */
function displayAutoQuoteResult(quoteResult) {
  const resultSection = document.getElementById('quote-result-section');
  resultSection.innerHTML = '';
  
  // Main result container
  const resultContainer = document.createElement('div');
  resultContainer.className = 'quote-result-container';
  resultContainer.style.backgroundColor = 'white';
  resultContainer.style.borderRadius = '8px';
  resultContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  resultContainer.style.padding = '24px';
  resultContainer.style.marginTop = '32px';
  
  // Header with title and description
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  header.style.textAlign = 'center';
  
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = 'Quote Options';
  headerTitle.style.fontSize = '24px';
  headerTitle.style.fontWeight = '700';
  headerTitle.style.marginBottom = '8px';
  headerTitle.style.color = 'var(--color-text-primary)';
  
  const headerSubtitle = document.createElement('p');
  headerSubtitle.textContent = 'Select the service level that best fits your needs and budget.';
  headerSubtitle.style.fontSize = '16px';
  headerSubtitle.style.color = 'var(--color-text-secondary)';
  
  header.appendChild(headerTitle);
  header.appendChild(headerSubtitle);
  resultContainer.appendChild(header);
  
  // Service details section
  const serviceDetails = document.createElement('div');
  serviceDetails.style.marginBottom = '24px';
  
  const serviceTitle = document.createElement('h3');
  serviceTitle.textContent = 'Service Details';
  serviceTitle.style.fontSize = '16px';
  serviceTitle.style.fontWeight = '600';
  serviceTitle.style.marginBottom = '16px';
  serviceTitle.style.color = 'var(--color-text-primary)';
  
  serviceDetails.appendChild(serviceTitle);
  
  // Two-column table for service info
  const detailsTable = document.createElement('div');
  detailsTable.style.display = 'grid';
  detailsTable.style.gridTemplateColumns = '1fr 1fr';
  detailsTable.style.gap = '8px 16px';
  
  // Format service type for display
  function formatServiceType(type) {
    const serviceMap = {
      // Key and security services
      'all_keys_lost': 'All Keys Lost',
      'duplicate_key': 'Duplicate Key',
      'ignition_repair': 'Ignition Repair',
      'lock_rekey': 'Lock Rekey',
      'ecu_reflash': 'ECU Reflash',
      
      // Standard automotive services
      'oil_change': 'Oil Change',
      'brake_service': 'Brake Service',
      'tire_service': 'Tire Service/Rotation',
      'engine_repair': 'Engine Repair',
      'transmission': 'Transmission Service',
      'electrical': 'Electrical Repair',
      'ac_service': 'A/C Service',
      
      // Customization services
      'body_repair': 'Body Repair/Customization',
      'detailing': 'Professional Detailing',
      'paint_work': 'Custom Paint Work',
      'window_tinting': 'Window Tinting',
      'sound_system': 'Sound System Installation',
      'vehicle_wrap': 'Vehicle Wrap Installation'
    };
    return serviceMap[type] || type;
  }
  
  const detailItems = [
    { label: 'Service Type', value: formatServiceType(quoteResult.service_type) },
    { label: 'Vehicle', value: `${quoteResult.vehicle_year} ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}` },
    { label: 'State', value: quoteResult.state },
    { label: 'Service Address', value: shortenAddress(quoteResult.destination_address) },
    { label: 'Tech Experience', value: `${quoteResult.labor_adjustment} years` },
    { label: 'Emergency Service', value: quoteResult.emergency ? 'Yes (+$50)' : 'No' }
  ];
  
  detailItems.forEach(item => {
    const label = document.createElement('div');
    label.textContent = item.label;
    label.style.color = 'var(--color-text-secondary)';
    label.style.fontSize = '14px';
    
    const value = document.createElement('div');
    value.textContent = item.value;
    value.style.fontWeight = '500';
    value.style.fontSize = '14px';
    value.style.color = 'var(--color-text-primary)';
    
    detailsTable.appendChild(label);
    detailsTable.appendChild(value);
  });
  
  serviceDetails.appendChild(detailsTable);
  resultContainer.appendChild(serviceDetails);
  
  // Create tiered options container
  const tiersContainer = document.createElement('div');
  tiersContainer.style.display = 'flex';
  tiersContainer.style.gap = '16px';
  tiersContainer.style.marginTop = '32px';
  tiersContainer.style.flexWrap = 'wrap';
  tiersContainer.style.justifyContent = 'center';
  
  // Make responsive for mobile
  const mediaQueryCheck = () => {
    const { width, isFoldableClosed } = updateViewportClasses();
    if (width < 768 || isFoldableClosed) {
      tiersContainer.style.flexDirection = 'column';
      tiersContainer.style.alignItems = 'center';
      tiersContainer.style.gap = '24px';
    } else {
      tiersContainer.style.flexDirection = 'row';
      tiersContainer.style.alignItems = 'stretch';
      tiersContainer.style.gap = '16px';
    }
  };
  
  // Run immediately and add resize listener
  mediaQueryCheck();
  window.addEventListener('resize', mediaQueryCheck);
  
  // Get service-specific recommendation
  const recommended = quoteResult.tierRecommendations.recommended;
  
  // Create cards for each tier
  const tiers = [
    { key: 'tierStandard', label: 'Standard', data: quoteResult.tierStandard },
    { key: 'tierPremium', label: 'Premium', data: quoteResult.tierPremium },
    { key: 'tierUltimate', label: 'Ultimate', data: quoteResult.tierUltimate }
  ];
  
  tiers.forEach(tier => {
    const isRecommended = recommended === tier.key.replace('tier', '').toLowerCase();
    const card = createTierCard(
      tier.data, 
      quoteResult.valueProps[tier.key.replace('tier', '').toLowerCase()], 
      isRecommended,
      quoteResult.service_type
    );
    tiersContainer.appendChild(card);
  });
  
  resultContainer.appendChild(tiersContainer);
  
  // Value proposition callout
  const valueCallout = document.createElement('div');
  valueCallout.style.backgroundColor = '#E3F2FD';
  valueCallout.style.borderRadius = '6px';
  valueCallout.style.padding = '16px';
  valueCallout.style.marginTop = '24px';
  valueCallout.style.marginBottom = '24px';
  
  const valueIcon = document.createElement('div');
  valueIcon.innerHTML = '💡';
  valueIcon.style.fontSize = '24px';
  valueIcon.style.marginBottom = '8px';
  
  const valueTitle = document.createElement('h4');
  valueTitle.textContent = 'Our Recommendation';
  valueTitle.style.fontSize = '16px';
  valueTitle.style.fontWeight = '600';
  valueTitle.style.marginBottom = '8px';
  
  const valueText = document.createElement('p');
  valueText.textContent = quoteResult.tierRecommendations.valueMessage;
  valueText.style.fontSize = '14px';
  valueText.style.lineHeight = '1.5';
  
  valueCallout.appendChild(valueIcon);
  valueCallout.appendChild(valueTitle);
  valueCallout.appendChild(valueText);
  
  resultContainer.appendChild(valueCallout);
  
  // Buttons row
  const actionsRow = document.createElement('div');
  actionsRow.style.display = 'flex';
  actionsRow.style.gap = '12px';
  actionsRow.style.marginTop = '24px';
  
  // Make buttons responsive on mobile
  const adjustButtonsForMobile = () => {
    const { width, isFoldableClosed } = updateViewportClasses();
    if (width < 600 || isFoldableClosed) {
      actionsRow.style.flexDirection = 'column';
      actionsRow.style.gap = '8px';
    } else {
      actionsRow.style.flexDirection = 'row';
      actionsRow.style.gap = '12px';
    }
  };
  
  // Run immediately and add resize listener
  adjustButtonsForMobile();
  window.addEventListener('resize', adjustButtonsForMobile);
  
  // Save quote button
  const saveButton = createButton('Save Quote', () => saveAutoQuote(quoteResult), 'primary');
  
  // Create dropdown section for print options
  const printContainer = document.createElement('div');
  printContainer.style.position = 'relative';
  printContainer.style.display = 'inline-block';
  
  const printButton = createButton('Print Options ▼', () => {
    const menu = printContainer.querySelector('.print-dropdown');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }, 'secondary');
  
  // Create dropdown menu
  const printDropdown = document.createElement('div');
  printDropdown.className = 'print-dropdown';
  printDropdown.style.display = 'none';
  printDropdown.style.position = 'absolute';
  printDropdown.style.backgroundColor = 'var(--color-card-bg)';
  printDropdown.style.minWidth = '200px';
  printDropdown.style.boxShadow = '0px 8px 16px 0px rgba(0,0,0,0.2)';
  printDropdown.style.zIndex = '1';
  printDropdown.style.borderRadius = '8px';
  printDropdown.style.padding = '8px 0';
  printDropdown.style.marginTop = '5px';
  
  // Provider version option
  const providerOption = document.createElement('a');
  providerOption.textContent = 'Print Service Provider View';
  providerOption.style.padding = '12px 16px';
  providerOption.style.textDecoration = 'none';
  providerOption.style.display = 'block';
  providerOption.style.color = 'var(--color-text)';
  providerOption.style.cursor = 'pointer';
  providerOption.addEventListener('mouseenter', () => {
    providerOption.style.backgroundColor = 'var(--color-bg-secondary)';
  });
  providerOption.addEventListener('mouseleave', () => {
    providerOption.style.backgroundColor = 'transparent';
  });
  providerOption.addEventListener('click', () => {
    printAutoQuote(quoteResult, false);
    printDropdown.style.display = 'none';
  });
  
  // Customer version option
  const customerOption = document.createElement('a');
  customerOption.textContent = 'Print Customer View';
  customerOption.style.padding = '12px 16px';
  customerOption.style.textDecoration = 'none';
  customerOption.style.display = 'block';
  customerOption.style.color = 'var(--color-text)';
  customerOption.style.cursor = 'pointer';
  customerOption.addEventListener('mouseenter', () => {
    customerOption.style.backgroundColor = 'var(--color-bg-secondary)';
  });
  customerOption.addEventListener('mouseleave', () => {
    customerOption.style.backgroundColor = 'transparent';
  });
  customerOption.addEventListener('click', () => {
    printAutoQuote(quoteResult, true);
    printDropdown.style.display = 'none';
  });
  
  printDropdown.appendChild(providerOption);
  printDropdown.appendChild(customerOption);
  printContainer.appendChild(printButton);
  printContainer.appendChild(printDropdown);
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!printContainer.contains(event.target)) {
      printDropdown.style.display = 'none';
    }
  });
  
  // Create invoice button
  const invoiceButton = createButton('Create Invoice', () => createInvoiceFromAutoQuote(quoteResult), 'secondary');
  
  actionsRow.appendChild(saveButton);
  actionsRow.appendChild(printContainer);
  actionsRow.appendChild(invoiceButton);
  resultContainer.appendChild(actionsRow);
  
  // Add to result section
  resultSection.appendChild(resultContainer);
  
  // Scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Save auto quote to local storage
 * @param {Object} quoteResult - The quote result to save
 */
function saveAutoQuote(quoteResult) {
  try {
    // Get existing saved quotes
    const savedQuotes = JSON.parse(localStorage.getItem('savedAutoQuotes') || '[]');
    
    // Add timestamp to quote
    const quoteToSave = {
      ...quoteResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    // Add to saved quotes
    savedQuotes.push(quoteToSave);
    
    // Save back to localStorage
    localStorage.setItem('savedAutoQuotes', JSON.stringify(savedQuotes));
    
    showToast('Auto quote saved successfully', 'success');
  } catch (error) {
    console.error('Error saving auto quote:', error);
    showToast('Failed to save auto quote', 'error');
  }
}

/**
 * Print auto quote
 * @param {Object} quoteResult - The auto quote result to print
 * @param {boolean} isCustomerVersion - Whether to print a customer-friendly version
 */
function printAutoQuote(quoteResult, isCustomerVersion = false) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    showToast('Please allow popups to print quotes', 'error');
    return;
  }
  
  // Service name mapping
  const serviceMap = {
    // Key and security services
    'all_keys_lost': 'All Keys Lost',
    'duplicate_key': 'Duplicate Key',
    'ignition_repair': 'Ignition Repair',
    'lock_rekey': 'Lock Rekey',
    'ecu_reflash': 'ECU Reflash',
    
    // Standard automotive services
    'oil_change': 'Oil Change',
    'brake_service': 'Brake Service',
    'tire_service': 'Tire Service/Rotation',
    'engine_repair': 'Engine Repair',
    'transmission': 'Transmission Service',
    'electrical': 'Electrical Repair',
    'ac_service': 'A/C Service',
    
    // Customization services
    'body_repair': 'Body Repair/Customization',
    'detailing': 'Professional Detailing',
    'paint_work': 'Custom Paint Work',
    'window_tinting': 'Window Tinting',
    'sound_system': 'Sound System Installation',
    'vehicle_wrap': 'Vehicle Wrap Installation'
  };
  
  const serviceName = serviceMap[quoteResult.service_type] || quoteResult.service_type;
  
  // Create title based on version
  const pageTitle = isCustomerVersion ? 
    `Customer Quote - ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}` : 
    `Auto Quote - ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}`;
  
  // Format date
  const currentDate = new Date().toLocaleDateString();
  const quoteNumber = `AQ-${Date.now().toString().substring(6)}`;
  
  // Create labor breakdown based on version
  let laborBreakdown = '';
  if (isCustomerVersion) {
    // Simplified labor info for customer
    laborBreakdown = `
      <div class="breakdown-item">
        <div>Labor${quoteResult.emergency ? ' (Emergency Service)' : ''}</div>
        <div>$${quoteResult.laborCost.toFixed(2)}</div>
      </div>
    `;
  } else {
    // Detailed labor info for service provider
    laborBreakdown = `
      <div class="breakdown-item">
        <div>Labor (${quoteResult.baseLaborHours} hours @ $${quoteResult.adjustedLaborRate.toFixed(2)}/hr)${quoteResult.emergency ? ' (Emergency)' : ''}</div>
        <div>$${quoteResult.laborCost.toFixed(2)}</div>
      </div>
    `;
  }
  
  // Create notes section with different content based on version
  const notesSection = isCustomerVersion ? `
    <div class="notes">
      <div class="section-title">Notes</div>
      <div>
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Payment terms: 50% deposit required before work begins, remaining balance due upon completion.</p>
        <p>Please contact us if you have any questions about this quote.</p>
      </div>
    </div>
  ` : `
    <div class="notes">
      <div class="section-title">Notes</div>
      <div>
        <p>This quote is valid for 30 days from the date above. Additional costs may apply if unforeseen issues arise during service.</p>
        <p>Emergency service fees apply for after-hours, weekend, and holiday appointments.</p>
        <p>Labor rate adjustment: ${quoteResult.emergency ? 'Emergency rate applied' : 'Standard rate applied'}</p>
        ${quoteResult.service_type === 'all_keys_lost' ? '<p>All keys lost service includes obtaining vehicle key codes and programming new keys/remotes to your vehicle.</p>' : ''}
        <p>For internal use: Profit analysis available in dashboard</p>
      </div>
    </div>
  `;
  
  // Create profit analysis section (only for service provider version)
  const profitAnalysisSection = !isCustomerVersion && quoteResult.profitMargin ? `
    <div class="profit-analysis">
      <div class="section-title">Profit Analysis</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Experience Level:</div>
        <div>${quoteResult.labor_adjustment || '3'} years</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Target Profit Margin:</div>
        <div>${quoteResult.targetMargin || '30'}%</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Actual Profit Margin:</div>
        <div style="font-weight: bold; color: ${quoteResult.profitMargin < 15 ? '#B91C1C' : quoteResult.profitMargin < 25 ? '#D97706' : '#047857'}">
          ${quoteResult.profitMargin.toFixed(1)}%
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>Estimated Profit:</div>
        <div style="font-weight: bold;">$${quoteResult.profit ? quoteResult.profit.toFixed(2) : (quoteResult.total * 0.3).toFixed(2)}</div>
      </div>
    </div>
  ` : '';

  // Create travel section if applicable
  let travelSection = '';
  if (quoteResult.travelDistance > 0) {
    if (isCustomerVersion) {
      // Customer version shows less detail about travel costs
      travelSection = `
        <div class="breakdown-item">
          <div>Travel Service</div>
          <div>$${quoteResult.travelCost.toFixed(2)}</div>
        </div>
      `;
    } else {
      // Service provider version shows detailed breakdown
      travelSection = `
        <div class="breakdown-item">
          <div>Travel (${quoteResult.travelDistance} miles)</div>
          <div>$${quoteResult.travelCost.toFixed(2)}</div>
        </div>
        <div style="font-size: 13px; color: #666; margin-left: 20px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <div>• Fuel cost ($${quoteResult.gasPrice.toFixed(2)}/gal)</div>
            <div>$${quoteResult.fuelCost.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>• Service fee for travel time</div>
            <div>$${quoteResult.travelServiceFee.toFixed(2)}</div>
          </div>
        </div>
      `;
    }
  }
  
  // Create print content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${pageTitle}</title>
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
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 2px solid #333;
          font-weight: bold;
          font-size: 18px;
          margin-top: 10px;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .profit-analysis {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f7ff;
          border-radius: 4px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .buttons {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        button {
          padding: 10px 20px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">Stackr Automotive Locksmith</div>
          <div>Professional Vehicle Security Solutions</div>
          ${!isCustomerVersion ? `
          <div>123 Business St, City, State ZIP</div>
          <div>Phone: (555) 123-4567</div>
          <div>Email: contact@stackr.com</div>
          ` : ''}
        </div>
        
        <div class="quote-info">
          <div class="section-title">Quote Information</div>
          <div class="quote-info-row">
            <div><strong>Date:</strong></div>
            <div>${currentDate}</div>
          </div>
          ${!isCustomerVersion ? `
          <div class="quote-info-row">
            <div><strong>Quote Number:</strong></div>
            <div>${quoteNumber}</div>
          </div>
          ` : ''}
          <div class="quote-info-row">
            <div><strong>Vehicle:</strong></div>
            <div>${quoteResult.vehicle_year} ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Service:</strong></div>
            <div>${serviceName}</div>
          </div>
          <div class="quote-info-row">
            <div><strong>Location:</strong></div>
            <div>${quoteResult.address}</div>
          </div>
        </div>
        
        <div class="section-title">Cost Breakdown</div>
        ${laborBreakdown}
        <div class="breakdown-item">
          <div>Parts</div>
          <div>$${quoteResult.partsCost.toFixed(2)}</div>
        </div>
        ${quoteResult.keycodeCost > 0 ? `
        <div class="breakdown-item">
          <div>Keycode Services</div>
          <div>$${quoteResult.keycodeCost.toFixed(2)}</div>
        </div>
        ` : ''}
        ${travelSection}
        <div class="breakdown-item">
          <div>Subtotal</div>
          <div>$${quoteResult.subtotal.toFixed(2)}</div>
        </div>
        <div class="breakdown-item">
          <div>Tax (${(quoteResult.taxRate * 100).toFixed(2)}%)</div>
          <div>$${quoteResult.taxAmount.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div>Total</div>
          <div>$${quoteResult.total.toFixed(2)}</div>
        </div>
        
        ${notesSection}
        
        ${profitAnalysisSection || ''}
        
        <div class="footer">
          <p>Thank you for choosing Stackr Automotive Locksmith Services</p>
          <p>For questions about this quote, please contact us at (555) 123-4567</p>
        </div>
        
        <div class="buttons">
          <button onclick="window.print()">Print Quote</button>
          <button onclick="window.close()" style="margin-left: 10px;">Close</button>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Create invoice from auto quote
 * @param {Object} quoteResult - The auto quote result
 */
function createInvoiceFromAutoQuote(quoteResult) {
  try {
    // Service name mapping
    const serviceMap = {
      // Key and security services
      'all_keys_lost': 'All Keys Lost',
      'duplicate_key': 'Duplicate Key',
      'ignition_repair': 'Ignition Repair',
      'lock_rekey': 'Lock Rekey',
      'ecu_reflash': 'ECU Reflash',
      
      // Standard automotive services
      'oil_change': 'Oil Change',
      'brake_service': 'Brake Service',
      'tire_service': 'Tire Service/Rotation',
      'engine_repair': 'Engine Repair',
      'transmission': 'Transmission Service',
      'electrical': 'Electrical Repair',
      'ac_service': 'A/C Service',
      
      // Customization services
      'body_repair': 'Body Repair/Customization',
      'detailing': 'Professional Detailing',
      'paint_work': 'Custom Paint Work',
      'window_tinting': 'Window Tinting',
      'sound_system': 'Sound System Installation',
      'vehicle_wrap': 'Vehicle Wrap Installation'
    };
    
    const serviceName = serviceMap[quoteResult.service_type] || quoteResult.service_type;
    
    // Create invoice data
    const invoiceData = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      client: {
        name: 'Auto Service Client',
        email: '',
        address: quoteResult.address
      },
      status: 'draft',
      items: [
        {
          id: '1',
          description: `Labor - ${serviceName}${quoteResult.emergency ? ' (Emergency)' : ''}`,
          quantity: quoteResult.baseLaborHours,
          unitPrice: quoteResult.adjustedLaborRate,
          amount: quoteResult.laborCost
        },
        {
          id: '2',
          description: `Parts - ${quoteResult.vehicle_year} ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}`,
          quantity: 1,
          unitPrice: quoteResult.partsCost,
          amount: quoteResult.partsCost
        }
      ],
      subtotal: quoteResult.subtotal,
      taxRate: quoteResult.taxRate,
      taxAmount: quoteResult.taxAmount,
      total: quoteResult.total,
      notes: `Service for ${quoteResult.vehicle_year} ${quoteResult.vehicle_make} ${quoteResult.vehicle_model}\nIncludes ${serviceName}${quoteResult.keycodeCost > 0 ? ' with keycode services' : ''}`
    };
    
    // Add keycode item if applicable
    if (quoteResult.keycodeCost > 0) {
      invoiceData.items.push({
        id: '3',
        description: 'Keycode Services',
        quantity: 1,
        unitPrice: quoteResult.keycodeCost,
        amount: quoteResult.keycodeCost
      });
    }
    
    // Save invoice to storage
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    savedInvoices.push(invoiceData);
    localStorage.setItem('invoices', JSON.stringify(savedInvoices));
    
    showToast('Invoice created from quote', 'success');
    
    // Option to redirect to invoices page
    if (confirm('Invoice created successfully! Would you like to view it now?')) {
      window.location.hash = 'invoices';
    }
  } catch (error) {
    console.error('Error creating invoice from auto quote:', error);
    showToast('Failed to create invoice', 'error');
  }
}

/**
 * Auto parts pricing database by vehicle type and service
 * This would typically be sourced from an external API
 */
const autoParts = {
  common: {
    // Key and security services
    all_keys_lost: {
      base: 120,
      luxury: 180,
      economy: 95
    },
    duplicate_key: {
      base: 70,
      luxury: 105,
      economy: 55
    },
    ignition_repair: {
      base: 90,
      luxury: 135,
      economy: 72
    },
    lock_rekey: {
      base: 60,
      luxury: 90,
      economy: 48
    },
    ecu_reflash: {
      base: 150,
      luxury: 225,
      economy: 120
    },
    
    // Standard automotive services
    oil_change: {
      base: 40,
      luxury: 85,
      economy: 30
    },
    brake_service: {
      base: 120,
      luxury: 200,
      economy: 90
    },
    tire_service: {
      base: 80,
      luxury: 150,
      economy: 65
    },
    engine_repair: {
      base: 250,
      luxury: 450,
      economy: 180
    },
    transmission: {
      base: 350,
      luxury: 600,
      economy: 280
    },
    electrical: {
      base: 160,
      luxury: 240,
      economy: 130
    },
    ac_service: {
      base: 130,
      luxury: 220,
      economy: 110
    },
    
    // Customization services
    body_repair: {
      base: 280,
      luxury: 450,
      economy: 210
    },
    detailing: {
      base: 150,
      luxury: 250,
      economy: 120
    },
    paint_work: {
      base: 350,
      luxury: 600,
      economy: 280
    },
    window_tinting: {
      base: 180,
      luxury: 250,
      economy: 150
    },
    sound_system: {
      base: 450,
      luxury: 750,
      economy: 350
    },
    vehicle_wrap: {
      base: 1200,
      luxury: 1800,
      economy: 950
    }
  },
  // Vehicle-specific pricing could be added here
  honda: {
    accord: {
      all_keys_lost: 110,
      duplicate_key: 65
    },
    civic: {
      all_keys_lost: 105,
      duplicate_key: 60
    }
  },
  toyota: {
    camry: {
      all_keys_lost: 115,
      duplicate_key: 68
    },
    corolla: {
      all_keys_lost: 108,
      duplicate_key: 62
    }
  },
  ford: {
    f150: {
      all_keys_lost: 130,
      duplicate_key: 75
    },
    escape: {
      all_keys_lost: 118,
      duplicate_key: 70
    }
  }
};

/**
 * Validates an address and returns the state
 * @param {string} address - The address to validate
 * @returns {string} Two-letter state code
 */
function validateAddressGetState(address) {
  // Use our enhanced getStateFromZip function with the isAutomotive flag
  return getStateFromZip(address, true);
}

/**
 * Get the tax rate for a state
 * @param {string} state - Two-letter state code
 * @returns {number} Tax rate as a decimal (e.g., 0.06 for 6%)
 */
function getStateTaxRateByState(state) {
  // Return the tax rate from our database, or a default rate
  // Access the existing stateTaxRates variable
  const defaultRate = 0.05;
  
  // Make sure state is uppercase for lookup
  const stateCode = state.toUpperCase();
  
  // Try to find the rate in our existing database
  if (stateTaxRates[stateCode]) {
    return stateTaxRates[stateCode];
  }
  
  return defaultRate;
}

/**
 * Get auto market labor rate for a location
 * @param {string} zip - ZIP code or location string
 * @returns {number} Hourly market rate
 */
function getAutoMarketRate(zip) {
  // In a real implementation, this would use an API like Thumbtack or HomeAdvisor
  // For demonstration, we'll use a base rate with some regional variation
  
  // Extract the first digit of the ZIP code if it exists
  const zipDigit = zip.match(/\d/);
  
  // Base rate is $90/hour
  let baseRate = 90;
  
  // Apply regional adjustment if we have a ZIP digit
  if (zipDigit) {
    const region = parseInt(zipDigit[0]);
    
    // Adjust rate by region (simplified model)
    if (region >= 0 && region <= 9) {
      // Different regions have different costs of living
      const adjustments = [0, 20, 15, 10, 5, 0, -5, -10, -15, -5];
      baseRate += adjustments[region];
    }
  }
  
  return baseRate;
}

/**
 * Get parts cost for a vehicle and service type
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @param {number} year - Vehicle year
 * @param {string} serviceType - Service type
 * @returns {number} The parts cost
 */
function searchPartsCost(make, model, year, serviceType) {
  // Normalize inputs
  const normalizedMake = make.toLowerCase().trim();
  const normalizedModel = model.toLowerCase().trim();
  
  // Check if we have specific pricing for this make+model
  if (autoParts[normalizedMake] && autoParts[normalizedMake][normalizedModel] && 
      autoParts[normalizedMake][normalizedModel][serviceType]) {
    return autoParts[normalizedMake][normalizedModel][serviceType];
  }
  
  // Determine vehicle category
  const luxuryBrands = ['bmw', 'audi', 'mercedes', 'lexus', 'infiniti', 'cadillac', 'lincoln'];
  const economyBrands = ['kia', 'hyundai', 'suzuki', 'mitsubishi'];
  
  let category = 'base';
  if (luxuryBrands.includes(normalizedMake)) {
    category = 'luxury';
  } else if (economyBrands.includes(normalizedMake)) {
    category = 'economy';
  }
  
  // Get base cost for this type of service and vehicle category
  let cost = (autoParts.common[serviceType] && autoParts.common[serviceType][category]) 
    ? autoParts.common[serviceType][category] 
    : 80;
  
  // Adjust for vehicle age
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age > 15) {
    cost *= 1.2; // 20% more for older vehicles (parts harder to find)
  } else if (age < 3) {
    cost *= 1.1; // 10% more for newer vehicles (newer tech)
  }
  
  return Math.round(cost); // Round to nearest dollar
}

/**
 * Calculate distance between two addresses using Google Maps Distance Matrix API
 */
function calculateAddressDistance() {
  const distanceResultContainer = document.getElementById('distance-calculation-result');
  distanceResultContainer.innerHTML = '<div>Calculating distance...</div>';
  
  // Get origin and destination data
  const originInput = document.getElementById('general-location-input');
  const destinationInput = document.getElementById('destination-input');
  const originPlaceData = document.getElementById('general-location-place-data');
  const destPlaceData = document.getElementById('destination-place-data');
  
  if (!originInput.value || !destinationInput.value) {
    distanceResultContainer.innerHTML = '<div style="color: #ff6666;">Please enter both origin and destination addresses</div>';
    return;
  }
  
  // Check if we have Google Maps API
  if (window.google && window.google.maps) {
    try {
      const distanceService = new google.maps.DistanceMatrixService();
      
      distanceService.getDistanceMatrix(
        {
          origins: [originInput.value],
          destinations: [destinationInput.value],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const distance = response.rows[0].elements[0].distance.text;
            const duration = response.rows[0].elements[0].duration.text;
            const distanceValue = response.rows[0].elements[0].distance.value / 1609.34; // Convert meters to miles
            
            // Update the distance input - always use round trip distance
            const roundTripDistance = distanceValue * 2;
            const travelDistanceInput = document.querySelector('input[name="travelDistance"]');
            travelDistanceInput.value = roundTripDistance.toFixed(1);
            
            // Get gas price and calculate fuel cost
            const gasPrice = getGasPriceForState(getStateFromZip(originInput.value, false));
            const fuelCost = calculateFuelCost(distanceValue, gasPrice);
            const roundTripCost = fuelCost * 2;
            
            // Display the result
            distanceResultContainer.innerHTML = `
              <div style="padding: 10px; border: 1px solid var(--color-border); border-radius: 8px; margin-top: 10px;">
                <div style="color: var(--color-primary); font-weight: bold; margin-bottom: 5px;">Distance Calculation</div>
                <div>One-way distance: ${distance} (${distanceValue.toFixed(1)} miles)</div>
                <div>Driving time: ${duration}</div>
                <div>Current gas price: $${gasPrice.toFixed(2)}/gallon</div>
                <div>Estimated fuel cost: $${fuelCost.toFixed(2)} one-way / $${roundTripCost.toFixed(2)} round-trip</div>
                <div style="margin-top: 5px; font-style: italic; font-size: 13px;">Note: Round-trip distance of ${roundTripDistance.toFixed(1)} miles will be used for quote.</div>
              </div>
            `;
          } else {
            distanceResultContainer.innerHTML = '<div style="color: #ff6666;">Could not calculate distance. Please check addresses or enter distance manually.</div>';
          }
        }
      );
    } catch (error) {
      console.error('Error calculating distance:', error);
      distanceResultContainer.innerHTML = '<div style="color: #ff6666;">Error calculating distance. Please enter distance manually.</div>';
    }
  } else {
    // Fallback if Google Maps API is not available
    distanceResultContainer.innerHTML = '<div style="color: #ff6666;">Distance calculation requires Google Maps API. Please enter distance manually.</div>';
  }
}

/**
 * Get current gas price for a state
 * @param {string} state - Two-letter state code
 * @returns {number} Gas price per gallon
 */
function getGasPriceForState(state) {
  // Source: National average and regional variations as of April 2025
  const basePricePerGallon = 3.85; // National average price
  
  // Regional adjustments
  const regionMultipliers = {
    // West Coast (higher prices)
    'CA': 1.35, 'WA': 1.20, 'OR': 1.15, 'NV': 1.10, 'HI': 1.40, 'AK': 1.25,
    
    // Mountain (slightly above average)
    'MT': 1.05, 'ID': 1.05, 'WY': 1.00, 'UT': 1.05, 'CO': 1.05, 'AZ': 1.10, 'NM': 1.00,
    
    // Midwest (average to below average)
    'ND': 0.95, 'SD': 0.95, 'NE': 0.95, 'KS': 0.95, 'MN': 1.00, 'IA': 0.95, 
    'MO': 0.95, 'WI': 1.00, 'IL': 1.05, 'IN': 0.95, 'MI': 1.00, 'OH': 0.95,
    
    // South (generally lower prices)
    'TX': 0.90, 'OK': 0.90, 'AR': 0.90, 'LA': 0.95, 'MS': 0.90, 'AL': 0.90, 
    'TN': 0.90, 'KY': 0.95, 'GA': 0.95, 'FL': 1.00, 'SC': 0.90, 'NC': 0.95,
    'VA': 0.95, 'WV': 0.95,
    
    // Northeast (higher prices)
    'MD': 1.05, 'DE': 1.00, 'PA': 1.05, 'NJ': 1.10, 'NY': 1.15, 'CT': 1.10,
    'RI': 1.10, 'MA': 1.15, 'VT': 1.05, 'NH': 1.05, 'ME': 1.05,
    
    // Default if state not found
    'DEFAULT': 1.00
  };
  
  const multiplier = regionMultipliers[state] || regionMultipliers['DEFAULT'];
  return basePricePerGallon * multiplier;
}

/**
 * Calculate fuel cost based on distance and gas price
 * @param {number} distanceMiles - Distance in miles
 * @param {number} pricePerGallon - Gas price per gallon
 * @param {number} mpg - Miles per gallon (default: 25)
 * @returns {number} Fuel cost
 */
function calculateFuelCost(distanceMiles, pricePerGallon, mpg = 25) {
  const gallonsNeeded = distanceMiles / mpg;
  return gallonsNeeded * pricePerGallon;
}

/**
 * Create a tier card for displaying quote options
 * @param {Object} tierData - Data for this specific tier
 * @param {Array} valueProps - Value propositions for this tier
 * @param {boolean} isRecommended - Whether this tier is recommended
 * @param {string} serviceType - The type of service being quoted
 * @returns {HTMLElement} The tier card element
 */
function createTierCard(tierData, valueProps, isRecommended, serviceType) {
  const card = document.createElement('div');
  card.className = 'tier-card';
  // Make cards responsive using viewport utility
  const { width, isFoldableClosed } = updateViewportClasses();
  if (width < 768 || isFoldableClosed) {
    card.style.flex = '1 1 100%';
    card.style.maxWidth = '100%';
    card.style.width = '100%';
  } else {
    card.style.flex = '1 1 300px';
    card.style.maxWidth = '350px';
  }
  
  // Add resize listener for responsiveness
  const updateCardSize = () => {
    const { width, isFoldableClosed } = updateViewportClasses();
    if (width < 768 || isFoldableClosed) {
      card.style.flex = '1 1 100%';
      card.style.maxWidth = '100%';
      card.style.width = '100%';
    } else {
      card.style.flex = '1 1 300px';
      card.style.maxWidth = '350px';
      card.style.width = 'auto';
    }
  };
  
  window.addEventListener('resize', updateCardSize);
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  card.style.padding = '24px';
  card.style.position = 'relative';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  
  // If recommended, add a special border
  if (isRecommended) {
    card.style.border = '2px solid var(--color-primary)';
    
    // Add recommended badge
    const badge = document.createElement('div');
    badge.textContent = 'Recommended';
    badge.style.position = 'absolute';
    badge.style.top = '-12px';
    badge.style.left = '50%';
    badge.style.transform = 'translateX(-50%)';
    badge.style.backgroundColor = 'var(--color-primary)';
    badge.style.color = 'white';
    badge.style.padding = '4px 12px';
    badge.style.borderRadius = '16px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '600';
    card.appendChild(badge);
  }
  
  // Tier header
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  header.style.textAlign = 'center';
  
  const name = document.createElement('h3');
  name.textContent = tierData.name;
  name.style.fontSize = '18px';
  name.style.fontWeight = '700';
  name.style.marginBottom = '8px';
  name.style.color = 'var(--color-text-primary)';
  
  const price = document.createElement('div');
  price.textContent = `$${tierData.total.toFixed(2)}`;
  price.style.fontSize = '28px';
  price.style.fontWeight = '700';
  price.style.color = 'var(--color-primary)';
  price.style.marginBottom = '8px';
  
  const description = document.createElement('p');
  description.textContent = tierData.description;
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.marginBottom = '16px';
  
  header.appendChild(name);
  header.appendChild(price);
  header.appendChild(description);
  
  // Value props
  const propsList = document.createElement('ul');
  propsList.style.listStyleType = 'none';
  propsList.style.padding = '0';
  propsList.style.margin = '0 0 24px 0';
  propsList.style.flexGrow = '1';
  
  valueProps.forEach(prop => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.alignItems = 'flex-start';
    item.style.marginBottom = '10px';
    item.style.fontSize = '14px';
    
    const checkmark = document.createElement('span');
    checkmark.innerHTML = '✓';
    checkmark.style.color = 'var(--color-success)';
    checkmark.style.marginRight = '8px';
    checkmark.style.fontWeight = 'bold';
    
    const text = document.createElement('span');
    text.textContent = prop;
    text.style.color = 'var(--color-text-primary)';
    
    item.appendChild(checkmark);
    item.appendChild(text);
    propsList.appendChild(item);
  });
  
  // Warranty info
  const warranty = document.createElement('div');
  warranty.style.backgroundColor = '#F5F5F5';
  warranty.style.padding = '12px';
  warranty.style.borderRadius = '4px';
  warranty.style.marginBottom = '16px';
  warranty.style.fontSize = '14px';
  warranty.style.textAlign = 'center';
  warranty.innerHTML = `<strong>${tierData.warrantyMonths}-Month Warranty</strong>`;
  
  // Service-specific information
  let serviceTypeInfo = null;
  if (serviceType && tierData.serviceAdjustments) {
    // Only show if there are actual adjustments for this tier
    const hasAdjustments = Object.values(tierData.serviceAdjustments).some(val => val > 0);
    
    if (hasAdjustments) {
      serviceTypeInfo = document.createElement('div');
      serviceTypeInfo.style.backgroundColor = '#EDFAFA';
      serviceTypeInfo.style.borderLeft = '3px solid var(--color-primary)';
      serviceTypeInfo.style.padding = '10px';
      serviceTypeInfo.style.borderRadius = '4px';
      serviceTypeInfo.style.marginBottom = '16px';
      serviceTypeInfo.style.fontSize = '13px';
      
      // Service type enhancement title
      const serviceTitle = document.createElement('div');
      serviceTitle.style.fontWeight = '600';
      serviceTitle.style.marginBottom = '6px';
      serviceTitle.textContent = 'Service Enhancements';
      
      // Service type message
      const serviceMsg = document.createElement('div');
      
      // Create different messages based on service type
      let serviceMessage = '';
      // Auto service types
      if (['all_keys_lost', 'duplicate_key', 'ignition_repair'].includes(serviceType)) {
        serviceMessage = 'Includes specialized key programming and security system diagnostics.';
      } 
      else if (['engine_repair', 'transmission', 'brake_service'].includes(serviceType)) {
        serviceMessage = 'Includes computer diagnostics and access to proprietary manufacturer tools.';
      }
      else if (['body_repair', 'paint_work', 'detailing'].includes(serviceType)) {
        serviceMessage = 'Includes premium materials and specialized finishing techniques.';
      }
      else if (['window_tinting', 'sound_system', 'vehicle_wrap'].includes(serviceType)) {
        serviceMessage = 'Includes premium materials and specialized installation equipment.';
      }
      // Professional service types
      else if (['photographer', 'videographer'].includes(serviceType)) {
        serviceMessage = 'Includes professional equipment, image processing, and media delivery.';
      }
      else if (['hair_stylist', 'makeup_artist', 'esthetician'].includes(serviceType)) {
        serviceMessage = 'Includes premium beauty products and specialized treatments.';
      }
      else if (['graphic_designer', 'web_designer', 'illustrator'].includes(serviceType)) {
        serviceMessage = 'Includes licensed software use, commercial rights, and multiple revisions.';
      }
      else if (['event_planner', 'caterer', 'dj'].includes(serviceType)) {
        serviceMessage = 'Includes planning meetings, vendor coordination, and day-of support.';
      }
      else {
        serviceMessage = 'Includes service-specific tools and materials for optimal results.';
      }
      
      serviceMsg.textContent = serviceMessage;
      
      serviceTypeInfo.appendChild(serviceTitle);
      serviceTypeInfo.appendChild(serviceMsg);
    }
  }
  
  // Extra services list (if any)
  let servicesList = null;
  if (tierData.extraServices && tierData.extraServices.length > 0) {
    servicesList = document.createElement('div');
    servicesList.style.marginBottom = '16px';
    
    const servicesTitle = document.createElement('h4');
    servicesTitle.textContent = 'Included Services';
    servicesTitle.style.fontSize = '14px';
    servicesTitle.style.fontWeight = '600';
    servicesTitle.style.marginBottom = '8px';
    
    const serviceItems = document.createElement('ul');
    serviceItems.style.listStyleType = 'none';
    serviceItems.style.padding = '0';
    serviceItems.style.margin = '0';
    serviceItems.style.fontSize = '13px';
    
    tierData.extraServices.forEach(service => {
      const item = document.createElement('li');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.marginBottom = '4px';
      
      const dot = document.createElement('span');
      dot.innerHTML = '•';
      dot.style.color = 'var(--color-primary)';
      dot.style.marginRight = '6px';
      
      const text = document.createElement('span');
      text.textContent = service.name;
      
      item.appendChild(dot);
      item.appendChild(text);
      serviceItems.appendChild(item);
    });
    
    servicesList.appendChild(servicesTitle);
    servicesList.appendChild(serviceItems);
  }
  
  // Choose button
  const chooseBtn = document.createElement('button');
  chooseBtn.textContent = isRecommended ? 'Choose (Recommended)' : 'Choose This Option';
  chooseBtn.style.width = '100%';
  chooseBtn.style.padding = '12px';
  chooseBtn.style.backgroundColor = isRecommended ? 'var(--color-primary)' : 'white';
  chooseBtn.style.color = isRecommended ? 'white' : 'var(--color-primary)';
  chooseBtn.style.border = isRecommended ? 'none' : '1px solid var(--color-primary)';
  chooseBtn.style.borderRadius = '4px';
  chooseBtn.style.fontWeight = '600';
  chooseBtn.style.cursor = 'pointer';
  chooseBtn.style.marginTop = 'auto';
  chooseBtn.onclick = () => {
    showToast(`Selected ${tierData.name} quote option`, 'success');
    // Show breakdown when selected
    showTierBreakdown(tierData);
  };
  
  // Add all elements to the card
  card.appendChild(header);
  card.appendChild(propsList);
  card.appendChild(warranty);
  // Add service-specific info if it exists
  if (serviceTypeInfo) {
    card.appendChild(serviceTypeInfo);
  }
  if (servicesList) {
    card.appendChild(servicesList);
  }
  card.appendChild(chooseBtn);
  
  return card;
}

/**
 * Show detailed breakdown of the selected tier
 * @param {Object} tierData - Data for the selected tier
 */
function showTierBreakdown(tierData) {
  // Existing breakdown section or create a new one
  let breakdownSection = document.getElementById('tier-breakdown-section');
  if (!breakdownSection) {
    breakdownSection = document.createElement('div');
    breakdownSection.id = 'tier-breakdown-section';
    breakdownSection.style.marginTop = '32px';
    breakdownSection.style.backgroundColor = 'white';
    breakdownSection.style.borderRadius = '8px';
    breakdownSection.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    breakdownSection.style.padding = '24px';
    
    const resultSection = document.getElementById('quote-result-section');
    resultSection.appendChild(breakdownSection);
  }
  
  // Clear previous content
  breakdownSection.innerHTML = '';
  
  // Section title
  const title = document.createElement('h3');
  title.textContent = `${tierData.name} - Cost Breakdown`;
  title.style.fontSize = '18px';
  title.style.fontWeight = '600';
  title.style.marginBottom = '16px';
  title.style.color = 'var(--color-text-primary)';
  
  breakdownSection.appendChild(title);
  
  // Breakdown list
  const breakdownList = document.createElement('div');
  breakdownList.style.display = 'flex';
  breakdownList.style.flexDirection = 'column';
  breakdownList.style.gap = '8px';
  
  // Make breakdown responsive
  const adjustBreakdownForMobile = () => {
    const items = breakdownSection.querySelectorAll('.breakdown-item');
    const { width, isFoldableClosed } = updateViewportClasses();
    
    if (width < 400 || isFoldableClosed) {
      // For very small screens or foldable devices closed
      items.forEach(item => {
        item.style.flexDirection = 'column';
        item.style.alignItems = 'flex-start';
        const label = item.querySelector('.item-label');
        const value = item.querySelector('.item-value');
        if (label) label.style.marginBottom = '4px';
        if (value) value.style.fontWeight = '600';
      });
    } else {
      // For larger screens
      items.forEach(item => {
        item.style.flexDirection = 'row';
        item.style.alignItems = 'center';
        const label = item.querySelector('.item-label');
        if (label) label.style.marginBottom = '0';
      });
    }
  };
  
  // Add window resize listener for responsive breakdown
  window.addEventListener('resize', adjustBreakdownForMobile);
  
  // Labor cost row
  const laborRow = createBreakdownItem('Labor', tierData.laborCost);
  
  // Parts cost row
  const partsRow = createBreakdownItem('Parts', tierData.partsCost);
  
  // Add keycode cost if applicable
  if (tierData.keycodeCost > 0) {
    const keycodeRow = createBreakdownItem('Keycode Service', tierData.keycodeCost);
    breakdownList.appendChild(keycodeRow);
  }
  
  // Travel cost if applicable
  if (tierData.travelCost > 0) {
    const travelRow = createBreakdownItem('Travel', tierData.travelCost);
    breakdownList.appendChild(travelRow);
  }
  
  // Emergency fee if applicable
  if (tierData.emergencyFee > 0) {
    const emergencyRow = createBreakdownItem('Emergency Service Fee', tierData.emergencyFee);
    breakdownList.appendChild(emergencyRow);
  }
  
  // Service-specific adjustments if any
  if (tierData.serviceAdjustments) {
    // Add diagnostic fee if applicable
    if (tierData.serviceAdjustments.diagnosticFee > 0) {
      const diagnosticRow = createBreakdownItem('Diagnostic Fee', tierData.serviceAdjustments.diagnosticFee);
      breakdownList.appendChild(diagnosticRow);
    }
    
    // Add special equipment fee if applicable
    if (tierData.serviceAdjustments.specialEquipmentFee > 0) {
      const equipmentRow = createBreakdownItem('Special Equipment Fee', tierData.serviceAdjustments.specialEquipmentFee);
      breakdownList.appendChild(equipmentRow);
    }
    
    // Add certification fee if applicable
    if (tierData.serviceAdjustments.certificationFee > 0) {
      const certRow = createBreakdownItem('Certified Technician Fee', tierData.serviceAdjustments.certificationFee);
      breakdownList.appendChild(certRow);
    }
    
    // Add rush fee if applicable
    if (tierData.serviceAdjustments.rushFee > 0) {
      const rushRow = createBreakdownItem('Priority Rush Fee', tierData.serviceAdjustments.rushFee);
      breakdownList.appendChild(rushRow);
    }
    
    // Add material quality upgrade if applicable
    if (tierData.serviceAdjustments.materialQualityUpgrade > 0) {
      const materialRow = createBreakdownItem('Premium Materials Upgrade', tierData.serviceAdjustments.materialQualityUpgrade);
      breakdownList.appendChild(materialRow);
    }
  }
  
  // Extra services if any
  if (tierData.extraServices && tierData.extraServices.length > 0) {
    tierData.extraServices.forEach(service => {
      if (service.cost > 0) {
        const serviceRow = createBreakdownItem(service.name, service.cost);
        breakdownList.appendChild(serviceRow);
      }
    });
  }
  
  // Subtotal row
  const subtotalRow = createBreakdownItem('Subtotal', tierData.subtotal);
  
  // Tax row
  const taxRow = createBreakdownItem('Tax', tierData.taxAmount);
  
  // Total row
  const totalRow = createBreakdownItem('Total', tierData.total, true);
  
  // Add all rows
  breakdownList.appendChild(laborRow);
  breakdownList.appendChild(partsRow);
  
  // Add a service type info tooltip if service-specific adjustments exist
  if (tierData.serviceAdjustments && Object.values(tierData.serviceAdjustments).some(val => val > 0)) {
    const serviceInfoRow = document.createElement('div');
    serviceInfoRow.classList.add('breakdown-item');
    serviceInfoRow.style.padding = '8px 0';
    serviceInfoRow.style.borderBottom = '1px dashed var(--color-border)';
    serviceInfoRow.style.marginTop = '8px';
    serviceInfoRow.style.marginBottom = '8px';
    serviceInfoRow.style.fontSize = '13px';
    serviceInfoRow.style.color = 'var(--color-text-secondary)';
    serviceInfoRow.style.fontStyle = 'italic';
    serviceInfoRow.style.display = 'flex';
    serviceInfoRow.style.alignItems = 'center';
    serviceInfoRow.style.justifyContent = 'center';
    
    const infoIcon = document.createElement('span');
    infoIcon.textContent = "ℹ️";
    infoIcon.style.marginRight = '6px';
    
    const infoText = document.createElement('span');
    infoText.textContent = "Service-specific fees reflect the specialized equipment, training, or materials required for this particular job type.";
    
    serviceInfoRow.appendChild(infoIcon);
    serviceInfoRow.appendChild(infoText);
    breakdownList.appendChild(serviceInfoRow);
  }
  
  breakdownList.appendChild(subtotalRow);
  breakdownList.appendChild(taxRow);
  breakdownList.appendChild(totalRow);
  
  breakdownSection.appendChild(breakdownList);
  
  // Scroll to the breakdown
  breakdownSection.scrollIntoView({ behavior: 'smooth' });
}