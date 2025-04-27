/**
 * Quote Generator Module - Simple Version
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

// Global variable to store last form data for refreshes
let lastQuoteFormData = null;

// Add event listener for user profile updates
window.addEventListener('userProfileUpdated', (event) => {
  console.log('User profile updated event received in quote generator:', event.detail);
  
  // If we have form data, refresh the quotes with the updated profile
  if (lastQuoteFormData) {
    console.log('Refreshing quotes with updated profile data');
    window.refreshQuotes();
  }
});

/**
 * Refreshes quotes using the last form data
 * Called by other modules when user profile changes
 */
window.refreshQuotes = function() {
  console.log('Refreshing quotes with updated profile data');
  
  // Only proceed if we have prior form data
  if (lastQuoteFormData) {
    try {
      // Display loading indicator
      const resultsContainer = document.querySelector('.results-container');
      if (resultsContainer) {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'quote-loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div><p>Refreshing quotes with your profile updates...</p>';
        loadingSpinner.style.display = 'flex';
        loadingSpinner.style.flexDirection = 'column';
        loadingSpinner.style.alignItems = 'center';
        loadingSpinner.style.justifyContent = 'center';
        loadingSpinner.style.padding = '20px';
        loadingSpinner.style.textAlign = 'center';
        
        const spinner = loadingSpinner.querySelector('.spinner');
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '4px solid var(--color-primary, #4F46E5)';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // Add animation style if not already present
        if (!document.getElementById('spinner-style')) {
          const style = document.createElement('style');
          style.id = 'spinner-style';
          style.textContent = `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Clear previous content and show spinner
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(loadingSpinner);
        resultsContainer.style.display = 'block';
        
        // Generate new quotes after a short delay to allow UI update
        setTimeout(() => {
          // Get fresh user profile data
          const userProfileModule = window.modules['user-profile'];
          const updatedProfile = userProfileModule?.getCurrentProfile();
          console.log('Using updated profile for quote refresh:', updatedProfile);
          
          // Generate quotes with the last known form data and updated profile
          const multiQuote = generateMultiQuote(lastQuoteFormData);
          
          // Update the UI with new quotes
          displayMultiQuote(multiQuote, lastQuoteFormData);
        }, 500);
      }
    } catch (error) {
      console.error('Error refreshing quotes:', error);
      if (window.showToast) {
        window.showToast('Error refreshing quotes. Please try again.', 'error');
      }
    }
  } else {
    console.log('No form data available to refresh quotes');
  }
};

// Import toast component or use it if already global
let showToastFn;

// Initialize toast function for notifications
function initToastSystem() {
  try {
    // Check if toast is already available globally
    if (typeof createToast === 'function') {
      showToastFn = createToast;
    } else {
      // Try to import the toast module
      import('/green/components/toast.js')
        .then(module => {
          showToastFn = module.createToast;
          console.log('Toast module imported successfully');
        })
        .catch(err => {
          console.error('Failed to import toast module:', err);
          // Fallback toast function
          showToastFn = (message, type = 'info') => {
            console.log(`TOAST [${type}]: ${message}`);
            alert(message);
          };
        });
    }
  } catch (error) {
    console.error('Error initializing toast system:', error);
    // Fallback toast function
    showToastFn = (message, type = 'info') => {
      console.log(`TOAST [${type}]: ${message}`);
      alert(message);
    };
  }
}

// Expose the show toast function globally
window.showToast = (message, type = 'info', duration = 3000) => {
  if (!showToastFn) {
    initToastSystem();
    // If still initializing, use fallback
    console.log(`TOAST [${type}]: ${message}`);
    alert(message);
    return;
  }
  return showToastFn(message, type, duration);
};

// Initialize toast system
initToastSystem();

// Define regional market rates for different job types
const marketRates = {
  // Home services
  "locksmith": {
    "northeast": 95, "midwest": 75, "southeast": 70, "southwest": 80, "west": 100, "south": 70
  },
  "plumber": {
    "northeast": 110, "midwest": 90, "southeast": 85, "southwest": 95, "west": 120, "south": 85
  },
  "electrician": {
    "northeast": 105, "midwest": 85, "southeast": 80, "southwest": 90, "west": 115, "south": 80
  },
  "carpenter": {
    "northeast": 95, "midwest": 75, "southeast": 70, "southwest": 80, "west": 100, "south": 70
  },
  "hvac": {
    "northeast": 115, "midwest": 95, "southeast": 90, "southwest": 100, "west": 125, "south": 90
  },
  "painter": {
    "northeast": 80, "midwest": 65, "southeast": 60, "southwest": 70, "west": 85, "south": 60
  },
  "general_contractor": {
    "northeast": 120, "midwest": 100, "southeast": 95, "southwest": 105, "west": 130, "south": 95
  },
  "landscaper": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  
  // Automotive services
  "automotive_repair": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 85, "west": 110, "south": 80
  },
  
  // Electronics repair
  "electronic_repair": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
  },
  "cellphone_repair": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  "computer_repair": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 85, "west": 100, "south": 75
  },
  "tv_repair": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
  },
  "appliance_repair": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 85, "west": 100, "south": 75
  },
  
  // Beauty services
  "hair_stylist": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  "nail_technician": {
    "northeast": 75, "midwest": 60, "southeast": 55, "southwest": 65, "west": 80, "south": 55
  },
  "makeup_artist": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
  },
  "esthetician": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  "massage_therapist": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 85, "west": 100, "south": 75
  },
  "spa_services": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 85, "west": 110, "south": 80
  },
  "waxing_services": {
    "northeast": 75, "midwest": 60, "southeast": 55, "southwest": 65, "west": 80, "south": 55
  },
  "tanning_services": {
    "northeast": 70, "midwest": 55, "southeast": 50, "southwest": 60, "west": 75, "south": 50
  },
  "eyebrow_threading": {
    "northeast": 65, "midwest": 50, "southeast": 45, "southwest": 55, "west": 70, "south": 45
  },
  "lash_extensions": {
    "northeast": 80, "midwest": 65, "southeast": 60, "southwest": 70, "west": 85, "south": 60
  },
  "facial_services": {
    "northeast": 110, "midwest": 95, "southeast": 90, "southwest": 95, "west": 115, "south": 90
  },
  
  // Additional home services
  "roofer": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 90, "west": 110, "south": 80
  },
  "flooring_specialist": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
  },
  "window_installer": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 85, "west": 100, "south": 75
  },
  "pool_service": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  "handyman": {
    "northeast": 75, "midwest": 60, "southeast": 55, "southwest": 65, "west": 80, "south": 55
  },
  "fence_installer": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 75, "west": 90, "south": 65
  },
  "pest_control": {
    "northeast": 80, "midwest": 65, "southeast": 60, "southwest": 70, "west": 85, "south": 60
  },
  
  // Professional services
  "photography": {
    "northeast": 125, "midwest": 100, "southeast": 95, "southwest": 100, "west": 135, "south": 95
  },
  "graphic_design": {
    "northeast": 115, "midwest": 95, "southeast": 90, "southwest": 95, "west": 125, "south": 90
  },
  "catering": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 80, "west": 100, "south": 75
  },
  "interior_design": {
    "northeast": 110, "midwest": 90, "southeast": 85, "southwest": 90, "west": 120, "south": 85
  },
  "moving_services": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 85, "west": 110, "south": 80
  },
  "cleaning_services": {
    "northeast": 80, "midwest": 65, "southeast": 60, "southwest": 65, "west": 85, "south": 60
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
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'flex-start';
    
    const titleArea = document.createElement('div');
    
    const title = document.createElement('h2');
    title.textContent = 'Professional Quote Generator';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Create accurate, profitable quotes for your service business.';
    subtitle.style.fontSize = '16px';
    subtitle.style.color = 'var(--color-text-secondary)';
    
    titleArea.appendChild(title);
    titleArea.appendChild(subtitle);
    
    // Create profile button
    const profileButton = document.createElement('button');
    profileButton.type = 'button';
    profileButton.textContent = 'Business Profile';
    profileButton.style.display = 'flex';
    profileButton.style.alignItems = 'center';
    profileButton.style.backgroundColor = 'var(--color-card-bg, #ffffff)';
    profileButton.style.color = 'var(--color-primary, #34A853)';
    profileButton.style.border = '1px solid var(--color-primary, #34A853)';
    profileButton.style.borderRadius = '6px';
    profileButton.style.padding = '8px 16px';
    profileButton.style.fontSize = '14px';
    profileButton.style.cursor = 'pointer';
    profileButton.style.marginLeft = '16px';
    
    // Add icon for profile button
    const profileIcon = document.createElement('span');
    profileIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    profileIcon.style.marginRight = '8px';
    
    profileButton.prepend(profileIcon);
    
    // Event listener for profile button
    profileButton.addEventListener('click', () => {
      try {
        // Import the user profile module dynamically
        import('/green/user-profile.js')
          .then(module => {
            if (typeof window.appState !== 'undefined' && window.appState.user && window.appState.user.id) {
              // Initialize with the current user ID if available
              module.initUserProfile(window.appState.user.id)
                .then(() => {
                  // Show the profile editor
                  module.showProfileEditor((updatedProfile) => {
                    console.log('Profile updated:', updatedProfile);
                    showToast('Profile updated! Your quotes will now be personalized.', 'success');
                  });
                });
            } else {
              // Fallback for testing if user ID isn't available
              module.showProfileEditor(() => {
                showToast('Profile updated! Your quotes will now be personalized.', 'success');
              });
            }
          })
          .catch(err => {
            console.error('Failed to load user profile module:', err);
            showToast('Unable to load profile editor. Please try again later.', 'error');
          });
      } catch (error) {
        console.error('Error opening profile editor:', error);
        showToast('Unable to open profile editor. Please try again later.', 'error');
      }
    });
    
    header.appendChild(titleArea);
    header.appendChild(profileButton);
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
    
    // Define service subcategories with detailed options for all service types
    const serviceSubcategories = {
      // Professional Services
      'graphic_design': [
        { value: 'logo_design', label: 'Logo Design' },
        { value: 'branding', label: 'Brand Identity Package' },
        { value: 'social_media', label: 'Social Media Graphics' },
        { value: 'print_design', label: 'Print Design' },
        { value: 'web_graphics', label: 'Web Graphics/UI' },
        { value: 'packaging', label: 'Packaging Design' },
        { value: 'illustration', label: 'Custom Illustration' },
        { value: 'advertising', label: 'Advertising Materials' },
        { value: 'brochure', label: 'Brochure Design' },
        { value: 'business_card', label: 'Business Card Design' }
      ],
      
      // Home Services
      'locksmith': [
        { value: 'rekey', label: 'Rekey Service' },
        { value: 'akl', label: 'All Keys Lost (AKL)' },
        { value: 'duplicate_key', label: 'Duplicate Key' },
        { value: 'lockout', label: 'Lockout Service' },
        { value: 'lock_installation', label: 'Lock Installation' },
        { value: 'lock_repair', label: 'Lock Repair' },
        { value: 'safe_unlock', label: 'Safe Unlocking' },
        { value: 'smart_lock', label: 'Smart Lock Installation' },
        { value: 'commercial_locks', label: 'Commercial Lock Systems' },
        { value: 'master_key', label: 'Master Key System Setup' }
      ],
      'plumber': [
        { value: 'leak_repair', label: 'Leak Repair' },
        { value: 'drain_cleaning', label: 'Drain Cleaning' },
        { value: 'fixture_installation', label: 'Fixture Installation' },
        { value: 'pipe_repair', label: 'Pipe Repair/Replacement' },
        { value: 'water_heater', label: 'Water Heater Service' },
        { value: 'sump_pump', label: 'Sump Pump Installation/Repair' },
        { value: 'backflow', label: 'Backflow Testing/Prevention' },
        { value: 'garbage_disposal', label: 'Garbage Disposal Services' },
        { value: 'gas_line', label: 'Gas Line Installation/Repair' },
        { value: 'water_treatment', label: 'Water Treatment Systems' }
      ],
      'electrician': [
        { value: 'outlet_installation', label: 'Outlet Installation' },
        { value: 'panel_upgrade', label: 'Panel Upgrade' },
        { value: 'lighting_install', label: 'Lighting Installation' },
        { value: 'wiring_repair', label: 'Wiring Repair' },
        { value: 'ceiling_fan', label: 'Ceiling Fan Installation' },
        { value: 'generator', label: 'Generator Installation/Service' },
        { value: 'ev_charger', label: 'EV Charger Installation' },
        { value: 'electrical_inspection', label: 'Electrical Inspection' },
        { value: 'surge_protection', label: 'Surge Protection' },
        { value: 'smart_home', label: 'Smart Home Wiring' }
      ],
      'hvac': [
        { value: 'ac_repair', label: 'AC Repair' },
        { value: 'furnace_repair', label: 'Furnace Repair' },
        { value: 'maintenance', label: 'Regular Maintenance' },
        { value: 'installation', label: 'New System Installation' },
        { value: 'air_quality', label: 'Air Quality Solutions' },
        { value: 'duct_cleaning', label: 'Duct Cleaning' },
        { value: 'thermostat', label: 'Thermostat Installation' },
        { value: 'zoning_system', label: 'HVAC Zoning System' },
        { value: 'emergency_repair', label: 'Emergency HVAC Repair' },
        { value: 'heat_pump', label: 'Heat Pump Service' }
      ],
      'carpenter': [
        { value: 'cabinet_install', label: 'Cabinet Installation' },
        { value: 'furniture_assembly', label: 'Furniture Assembly' },
        { value: 'door_install', label: 'Door Installation/Repair' },
        { value: 'deck_build', label: 'Deck Building/Repair' },
        { value: 'trim_work', label: 'Trim/Molding Installation' },
        { value: 'stair_repair', label: 'Stair Repair/Building' },
        { value: 'custom_shelving', label: 'Custom Shelving' },
        { value: 'framing', label: 'Structural Framing' },
        { value: 'floor_install', label: 'Floor Installation' },
        { value: 'wooden_fence', label: 'Wooden Fence Build/Repair' }
      ],
      'painter': [
        { value: 'interior', label: 'Interior Painting' },
        { value: 'exterior', label: 'Exterior Painting' },
        { value: 'cabinet_refinish', label: 'Cabinet Refinishing' },
        { value: 'deck_stain', label: 'Deck Staining/Sealing' },
        { value: 'fence_painting', label: 'Fence Painting' },
        { value: 'wallpaper', label: 'Wallpaper Installation/Removal' },
        { value: 'texture_painting', label: 'Texture Painting' },
        { value: 'drywall_repair', label: 'Drywall Repair & Painting' },
        { value: 'commercial', label: 'Commercial Painting' },
        { value: 'specialty_finish', label: 'Specialty Finish Application' }
      ],
      'general_contractor': [
        { value: 'kitchen_remodel', label: 'Kitchen Remodeling' },
        { value: 'bathroom_remodel', label: 'Bathroom Remodeling' },
        { value: 'basement_finish', label: 'Basement Finishing' },
        { value: 'room_addition', label: 'Room Addition' },
        { value: 'whole_house_reno', label: 'Whole House Renovation' },
        { value: 'garage_conversion', label: 'Garage Conversion' },
        { value: 'commercial_build', label: 'Commercial Build-out' },
        { value: 'permit_assistance', label: 'Permit Acquisition Assistance' },
        { value: 'home_repair', label: 'General Home Repair' },
        { value: 'disaster_restore', label: 'Disaster Restoration' }
      ],
      'landscaper': [
        { value: 'lawn_maintenance', label: 'Lawn Maintenance' },
        { value: 'garden_design', label: 'Garden Design/Installation' },
        { value: 'irrigation', label: 'Irrigation System Install/Repair' },
        { value: 'tree_service', label: 'Tree Service/Trimming' },
        { value: 'hardscaping', label: 'Hardscaping Installation' },
        { value: 'sod_installation', label: 'Sod Installation' },
        { value: 'mulch_gravel', label: 'Mulch/Gravel Installation' },
        { value: 'seasonal_cleanup', label: 'Seasonal Cleanup' },
        { value: 'outdoor_lighting', label: 'Outdoor Lighting Installation' },
        { value: 'fence_installation', label: 'Fence Installation' }
      ],
      
      // Automotive Services
      'automotive_repair': [
        { value: 'oil_change', label: 'Oil Change Service' },
        { value: 'brake_service', label: 'Brake Service/Replacement' },
        { value: 'transmission', label: 'Transmission Service/Repair' },
        { value: 'engine_repair', label: 'Engine Repair/Rebuild' },
        { value: 'suspension', label: 'Suspension Work' },
        { value: 'electrical', label: 'Electrical System Repair' },
        { value: 'diagnostics', label: 'Computer Diagnostics' },
        { value: 'tire_service', label: 'Tire Service/Replacement' },
        { value: 'ac_service', label: 'AC Service/Repair' },
        { value: 'exhaust_repair', label: 'Exhaust System Repair' },
        { value: 'wheel_alignment', label: 'Wheel Alignment' },
        { value: 'fuel_system', label: 'Fuel System Service' },
        { value: 'cooling_system', label: 'Cooling System Service' },
        { value: 'battery_service', label: 'Battery Service/Replacement' },
        { value: 'scheduled_maintenance', label: 'Scheduled Maintenance' }
      ],
      
      // Electronics Repair
      'electronic_repair': [
        { value: 'diagnostics', label: 'Diagnostics/Troubleshooting' },
        { value: 'circuit_repair', label: 'Circuit Board Repair' },
        { value: 'component_replacement', label: 'Component Replacement' },
        { value: 'water_damage', label: 'Water Damage Repair' },
        { value: 'data_recovery', label: 'Data Recovery' },
        { value: 'power_supply', label: 'Power Supply Repair' },
        { value: 'audio_repair', label: 'Audio Equipment Repair' },
        { value: 'game_console', label: 'Game Console Repair' },
        { value: 'smart_home_device', label: 'Smart Home Device Repair' },
        { value: 'drone_repair', label: 'Drone Repair' }
      ],
      'cellphone_repair': [
        { value: 'screen_replacement', label: 'Screen Replacement' },
        { value: 'battery_replacement', label: 'Battery Replacement' },
        { value: 'charging_port', label: 'Charging Port Repair' },
        { value: 'water_damage', label: 'Water Damage Repair' },
        { value: 'camera_repair', label: 'Camera Repair' },
        { value: 'speaker_repair', label: 'Speaker/Microphone Repair' },
        { value: 'button_repair', label: 'Button Repair' },
        { value: 'software_issues', label: 'Software/OS Issues' },
        { value: 'unlock_service', label: 'Phone Unlocking Service' },
        { value: 'data_transfer', label: 'Data Transfer/Recovery' }
      ],
      'computer_repair': [
        { value: 'virus_removal', label: 'Virus/Malware Removal' },
        { value: 'hardware_upgrade', label: 'Hardware Upgrade' },
        { value: 'data_recovery', label: 'Data Recovery' },
        { value: 'os_installation', label: 'OS Installation' },
        { value: 'troubleshooting', label: 'General Troubleshooting' },
        { value: 'network_setup', label: 'Network Setup/Repair' },
        { value: 'laptop_repair', label: 'Laptop Repair' },
        { value: 'desktop_repair', label: 'Desktop Repair' },
        { value: 'mac_repair', label: 'Mac Repair Services' },
        { value: 'pc_repair', label: 'PC Repair Services' },
        { value: 'custom_build', label: 'Custom PC Building' },
        { value: 'remote_support', label: 'Remote Support Services' }
      ],
      'tv_repair': [
        { value: 'screen_repair', label: 'Screen Repair' },
        { value: 'power_issues', label: 'Power Supply Issues' },
        { value: 'backlight', label: 'Backlight Repair' },
        { value: 'hdmi_ports', label: 'HDMI Port Repair' },
        { value: 'sound_issues', label: 'Sound System Repair' },
        { value: 'smart_tv_setup', label: 'Smart TV Setup/Configuration' },
        { value: 'display_calibration', label: 'Display Calibration' },
        { value: 'motherboard_repair', label: 'Motherboard Repair' },
        { value: 'remote_control', label: 'Remote Control Issues' },
        { value: 'mounting_service', label: 'TV Mounting Service' }
      ],
      'appliance_repair': [
        { value: 'refrigerator', label: 'Refrigerator Repair' },
        { value: 'washer', label: 'Washer Repair' },
        { value: 'dryer', label: 'Dryer Repair' },
        { value: 'dishwasher', label: 'Dishwasher Repair' },
        { value: 'oven_stove', label: 'Oven/Stove Repair' },
        { value: 'microwave', label: 'Microwave Repair' },
        { value: 'garbage_disposal', label: 'Garbage Disposal Repair' },
        { value: 'ice_maker', label: 'Ice Maker Repair' },
        { value: 'wine_cooler', label: 'Wine Cooler Repair' },
        { value: 'small_appliance', label: 'Small Appliance Repair' }
      ],
      
      // Beauty Services
      'beauty_services': [
        { value: 'full_service', label: 'Full Service Package' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'special_event', label: 'Special Event Styling' },
        { value: 'bridal', label: 'Bridal Service' },
        { value: 'seasonal_package', label: 'Seasonal Beauty Package' },
        { value: 'group_service', label: 'Group Beauty Service' }
      ],
      'hair_stylist': [
        { value: 'haircut', label: 'Haircut' },
        { value: 'color', label: 'Hair Coloring' },
        { value: 'highlights', label: 'Highlights/Lowlights' },
        { value: 'blowout', label: 'Blowout Styling' },
        { value: 'extension', label: 'Extensions' },
        { value: 'treatment', label: 'Hair Treatment' },
        { value: 'updo', label: 'Updo/Formal Styling' },
        { value: 'keratin', label: 'Keratin Treatment' },
        { value: 'perm', label: 'Perm/Wave Treatment' },
        { value: 'balayage', label: 'Balayage/Ombre' },
        { value: 'scalp_treatment', label: 'Scalp Treatment' },
        { value: 'mens_styling', label: 'Men\'s Styling Service' }
      ],
      'nail_technician': [
        { value: 'manicure', label: 'Basic Manicure' },
        { value: 'pedicure', label: 'Pedicure' },
        { value: 'gel', label: 'Gel Polish' },
        { value: 'acrylic', label: 'Acrylic Nails' },
        { value: 'dip_powder', label: 'Dip Powder Nails' },
        { value: 'nail_art', label: 'Nail Art' },
        { value: 'french_tip', label: 'French Tip' },
        { value: 'polish_change', label: 'Polish Change' },
        { value: 'paraffin', label: 'Paraffin Treatment' },
        { value: 'nail_repair', label: 'Nail Repair' },
        { value: 'removal', label: 'Removal Service' }
      ],
      'makeup_artist': [
        { value: 'everyday', label: 'Everyday Makeup' },
        { value: 'special_event', label: 'Special Event Makeup' },
        { value: 'bridal', label: 'Bridal Makeup' },
        { value: 'photoshoot', label: 'Photoshoot Makeup' },
        { value: 'lesson', label: 'Makeup Lesson' },
        { value: 'theatrical', label: 'Theatrical/Stage Makeup' },
        { value: 'halloween', label: 'Halloween/SFX Makeup' },
        { value: 'airbrush', label: 'Airbrush Makeup' },
        { value: 'mature_skin', label: 'Mature Skin Makeup' },
        { value: 'group_service', label: 'Group Makeup Service' }
      ],
      'esthetician': [
        { value: 'facial', label: 'Facial Treatment' },
        { value: 'microdermabrasion', label: 'Microdermabrasion' },
        { value: 'chemical_peel', label: 'Chemical Peel' },
        { value: 'microblading', label: 'Microblading' },
        { value: 'waxing', label: 'Waxing Services' },
        { value: 'threading', label: 'Threading Services' },
        { value: 'tinting', label: 'Brow/Lash Tinting' },
        { value: 'skin_consult', label: 'Skin Consultation' },
        { value: 'acne_treatment', label: 'Acne Treatment' },
        { value: 'anti_aging', label: 'Anti-Aging Treatment' }
      ],
      'massage_therapist': [
        { value: 'swedish', label: 'Swedish Massage' },
        { value: 'deep_tissue', label: 'Deep Tissue Massage' },
        { value: 'hot_stone', label: 'Hot Stone Massage' },
        { value: 'sports', label: 'Sports Massage' },
        { value: 'prenatal', label: 'Prenatal Massage' },
        { value: 'reflexology', label: 'Reflexology' },
        { value: 'couples', label: 'Couples Massage' },
        { value: 'chair_massage', label: 'Chair Massage' },
        { value: 'aromatherapy', label: 'Aromatherapy Massage' },
        { value: 'thai_massage', label: 'Thai Massage' }
      ],
      'spa_services': [
        { value: 'full_day', label: 'Full Day Package' },
        { value: 'half_day', label: 'Half Day Package' },
        { value: 'couples', label: 'Couples Package' },
        { value: 'facial_massage', label: 'Facial & Massage Combo' },
        { value: 'body_treatment', label: 'Body Treatment' },
        { value: 'detox_wrap', label: 'Detox Wrap' },
        { value: 'hydrotherapy', label: 'Hydrotherapy' },
        { value: 'scrub_treatment', label: 'Body Scrub Treatment' },
        { value: 'mud_treatment', label: 'Mud Treatment' },
        { value: 'steam_room', label: 'Steam Room Session' }
      ],
      'waxing_services': [
        { value: 'brow_wax', label: 'Eyebrow Waxing' },
        { value: 'facial_wax', label: 'Facial Waxing' },
        { value: 'bikini_wax', label: 'Bikini Waxing' },
        { value: 'brazilian', label: 'Brazilian Waxing' },
        { value: 'leg_wax', label: 'Leg Waxing' },
        { value: 'arm_wax', label: 'Arm Waxing' },
        { value: 'back_wax', label: 'Back Waxing' },
        { value: 'chest_wax', label: 'Chest Waxing' },
        { value: 'full_body', label: 'Full Body Waxing' },
        { value: 'underarm', label: 'Underarm Waxing' }
      ],
      'tanning_services': [
        { value: 'spray_tan', label: 'Spray Tanning' },
        { value: 'airbrush_tan', label: 'Airbrush Tanning' },
        { value: 'bed_tanning', label: 'Tanning Bed Session' },
        { value: 'mobile_tan', label: 'Mobile Tanning Service' },
        { value: 'tan_party', label: 'Tanning Party Service' },
        { value: 'bridal_tan', label: 'Bridal Tanning Package' },
        { value: 'vacation_prep', label: 'Vacation Prep Package' },
        { value: 'competition', label: 'Competition Tanning' }
      ],
      'eyebrow_threading': [
        { value: 'brow_thread', label: 'Eyebrow Threading' },
        { value: 'lip_thread', label: 'Lip Threading' },
        { value: 'facial_thread', label: 'Full Face Threading' },
        { value: 'side_face', label: 'Sideburns Threading' },
        { value: 'chin_thread', label: 'Chin Threading' },
        { value: 'neck_thread', label: 'Neck Threading' },
        { value: 'brow_tint', label: 'Brow Tinting & Threading' },
        { value: 'brow_design', label: 'Brow Design Service' }
      ],
      'lash_extensions': [
        { value: 'classic_set', label: 'Classic Full Set' },
        { value: 'volume_set', label: 'Volume Full Set' },
        { value: 'hybrid_set', label: 'Hybrid Full Set' },
        { value: 'fill_classic', label: 'Classic Fill' },
        { value: 'fill_volume', label: 'Volume Fill' },
        { value: 'fill_hybrid', label: 'Hybrid Fill' },
        { value: 'lash_removal', label: 'Lash Removal' },
        { value: 'lash_lift', label: 'Lash Lift' },
        { value: 'lash_tint', label: 'Lash Tinting' },
        { value: 'bottom_lashes', label: 'Bottom Lash Extensions' }
      ],
      'facial_services': [
        { value: 'basic_facial', label: 'Basic Facial' },
        { value: 'deep_cleansing', label: 'Deep Cleansing Facial' },
        { value: 'anti_aging', label: 'Anti-Aging Facial' },
        { value: 'hydrating', label: 'Hydrating Facial' },
        { value: 'acne', label: 'Acne Treatment Facial' },
        { value: 'brightening', label: 'Brightening Facial' },
        { value: 'sensitive_skin', label: 'Sensitive Skin Facial' },
        { value: 'mens_facial', label: 'Men\'s Facial' },
        { value: 'teen_facial', label: 'Teen Facial' },
        { value: 'facial_massage', label: 'Facial Massage' }
      ]
    };
    
    // Add more subcategories for other service types
    // Default subcategory for services without specific options
    const defaultSubcategories = [
      { value: 'standard', label: 'Standard Service' },
      { value: 'consultation', label: 'Consultation' },
      { value: 'emergency', label: 'Emergency Service' },
      { value: 'maintenance', label: 'Regular Maintenance' },
      { value: 'specialized', label: 'Specialized Service' }
    ];
    
    // Job type field
    const jobTypeSelect = createSelect('jobType', [
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
      
      // Beauty service categories
      { value: 'beauty_services', label: 'Beauty Services (General)' },
      { value: 'hair_stylist', label: 'Hair Styling Services' },
      { value: 'nail_technician', label: 'Nail Salon Services' },
      { value: 'makeup_artist', label: 'Makeup Artist Services' },
      { value: 'esthetician', label: 'Esthetician Services' },
      { value: 'massage_therapist', label: 'Massage Therapy' },
      { value: 'spa_services', label: 'Spa Treatment Services' },
      { value: 'waxing_services', label: 'Waxing Services' },
      { value: 'tanning_services', label: 'Tanning Services' },
      { value: 'eyebrow_threading', label: 'Eyebrow & Threading Services' },
      { value: 'lash_extensions', label: 'Lash Extension Services' },
      { value: 'facial_services', label: 'Facial Treatment Services' },
      
      { value: 'photography', label: 'Photography Services' },
      { value: 'graphic_design', label: 'Graphic Design' },
      { value: 'catering', label: 'Catering Services' },
      { value: 'interior_design', label: 'Interior Design' },
      { value: 'moving_services', label: 'Moving Services' },
      { value: 'cleaning_services', label: 'Cleaning Services' }
    ]);
    
    // Create the job subtype field (hidden initially)
    const jobSubtypeSelect = createSelect('jobSubtype', []);
    jobSubtypeSelect.disabled = true; // Disabled until a job type is selected
    const jobSubtypeGroup = createFormGroup('Service Subcategory', jobSubtypeSelect);
    jobSubtypeGroup.style.display = 'none'; // Hide until job type is selected
    
    // Add event listener to job type select to populate the subtype dropdown
    jobTypeSelect.addEventListener('change', () => {
      const selectedJobType = jobTypeSelect.value;
      const subcategories = serviceSubcategories[selectedJobType] || defaultSubcategories;
      
      // Clear existing options
      while (jobSubtypeSelect.options.length > 1) {
        jobSubtypeSelect.remove(1);
      }
      
      // Add new options
      subcategories.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        jobSubtypeSelect.appendChild(optionElement);
      });
      
      // Enable and show the subtype field
      jobSubtypeSelect.disabled = false;
      jobSubtypeGroup.style.display = 'block';
      
      // Show/hide quantity field for product-based services
      if (selectedJobType === 'locksmith' || 
          selectedJobType === 'appliance_repair' || 
          selectedJobType === 'cellphone_repair' || 
          selectedJobType === 'computer_repair' || 
          selectedJobType === 'tv_repair') {
        quantityGroup.style.display = 'block';
        
        // Update material cost field label based on service type
        const materialCostLabel = materialsGroup.querySelector('label');
        if (materialCostLabel) {
          materialCostLabel.textContent = 'Parts/Products Cost ($)';
        }
      } else {
        quantityGroup.style.display = 'none';
        
        // Reset material cost field label based on service type
        const materialCostLabel = materialsGroup.querySelector('label');
        if (materialCostLabel) {
          if (isBeautyService(selectedJobType)) {
            materialCostLabel.textContent = 'Products Cost ($)';
          } else {
            materialCostLabel.textContent = 'Materials Cost ($)';
          }
        }
      }
    });
    
    const jobTypeGroup = createFormGroup('Service Type', jobTypeSelect);
    
    // Location field
    const locationInput = createInput('text', 'location', '', 'ZIP code or City, State');
    locationInput.id = 'auto-address-input'; // Add ID for Google Maps autocomplete
    const locationGroup = createFormGroup('Location', locationInput);
    
    // Experience level field
    const experienceSelect = createSelect('experienceLevel', [
      { value: 'junior', label: 'Junior (1-2 years)' },
      { value: 'intermediate', label: 'Intermediate (3-5 years)' },
      { value: 'senior', label: 'Senior (6-10 years)' },
      { value: 'expert', label: 'Expert (10+ years)' }
    ]);
    const experienceGroup = createFormGroup('Experience Level', experienceSelect);
    
    // Labor hours field
    const laborHoursGroup = createFormGroup('Labor Hours', createInput('number', 'laborHours', '1', 'Estimated hours', '0.5', '100', '0.5'));
    
    // Product quantity field (initially hidden, will show for product-based services)
    const quantityInput = createInput('number', 'quantity', '1', 'Number of items/products', '1', '100', '1');
    const quantityGroup = createFormGroup('Product Quantity', quantityInput);
    quantityGroup.style.display = 'none'; // Hidden by default
    
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
    const marginGroup = createFormGroup('Target Profit Margin (%)', createInput('range', 'targetMargin', '25', '', '10', '100', '1'));
    const marginValue = document.createElement('div');
    marginValue.textContent = '25%';
    marginValue.style.textAlign = 'right';
    marginValue.style.fontSize = '14px';
    marginGroup.appendChild(marginValue);
    
    // Update margin value display when slider changes
    const marginInput = marginGroup.querySelector('input');
    marginInput.addEventListener('input', (e) => {
      marginValue.textContent = `${e.target.value}%`;
      
      // Get current result container - if visible, regenerate quote with new margin
      const resultsContainer = document.getElementById('quote-results');
      if (resultsContainer && resultsContainer.style.display === 'block') {
        // Trigger quote recalculation
        handleGenerateQuote();
      }
    });
    
    // Add fields to form
    form.appendChild(jobTypeGroup);
    form.appendChild(jobSubtypeGroup); // Add the subcategory field
    form.appendChild(locationGroup);
    form.appendChild(experienceGroup); // Add experience level field
    form.appendChild(laborHoursGroup);
    form.appendChild(quantityGroup); // Add quantity field (initially hidden)
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
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'address_components'] // Use fields in options instead of setFields method
    });
    
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
    // Ensure user profile is initialized
    ensureUserProfileInitialized();
    
    // Get form values
    const jobTypeSelect = document.querySelector('#quote-form select[name="jobType"]');
    const jobSubtypeSelect = document.querySelector('#quote-form select[name="jobSubtype"]');
    const locationInput = document.querySelector('#quote-form input[name="location"]');
    const experienceSelect = document.querySelector('#quote-form select[name="experienceLevel"]');
    const laborHoursInput = document.querySelector('#quote-form input[name="laborHours"]');
    const quantityInput = document.querySelector('#quote-form input[name="quantity"]');
    const materialsCostInput = document.querySelector('#quote-form input[name="materialsCost"]');
    const emergencyCheckbox = document.querySelector('#quote-form input[name="emergency"]');
    const targetMarginInput = document.querySelector('#quote-form input[name="targetMargin"]');
    
    // Validate required fields
    if (!jobTypeSelect.value) {
      showToast('Please select a service type', 'error');
      jobTypeSelect.focus();
      return;
    }
    
    if (!jobSubtypeSelect.value) {
      showToast('Please select a service subcategory', 'error');
      jobSubtypeSelect.focus();
      return;
    }
    
    if (!locationInput.value) {
      showToast('Please enter a location', 'error');
      locationInput.focus();
      return;
    }
    
    if (!experienceSelect.value) {
      showToast('Please select experience level', 'error');
      experienceSelect.focus();
      return;
    }
    
    if (!laborHoursInput.value || parseFloat(laborHoursInput.value) <= 0) {
      showToast('Please enter valid labor hours', 'error');
      laborHoursInput.focus();
      return;
    }
    
    // Check quantity if the service requires it
    const isProductService = ['locksmith', 'appliance_repair', 'cellphone_repair', 'computer_repair', 'tv_repair'].includes(jobTypeSelect.value);
    if (isProductService && (!quantityInput.value || parseInt(quantityInput.value) < 1)) {
      showToast('Please enter valid product quantity', 'error');
      quantityInput.focus();
      return;
    }
    
    // Collect form data
    const formData = {
      jobType: jobTypeSelect.value,
      jobSubtype: jobSubtypeSelect.value,
      location: locationInput.value,
      experienceLevel: experienceSelect.value,
      laborHours: parseFloat(laborHoursInput.value),
      quantity: parseInt(quantityInput.value) || 1,
      materialsCost: parseFloat(materialsCostInput.value) || 0,
      emergency: emergencyCheckbox.checked,
      targetMargin: parseInt(targetMarginInput.value)
    };
    
    // Store form data for later refreshes
    lastQuoteFormData = {...formData};
    console.log('Storing form data for future refreshes:', lastQuoteFormData);
    
    // Generate multiple quotes
    const quotes = generateMultiQuote(formData);
    
    // Display the results
    displayMultiQuoteResults(quotes);
    
    // Show success message
    showToast('Quotes generated successfully', 'success');
  } catch (error) {
    console.error('Error generating quotes:', error);
    showToast('Error generating quotes: ' + error.message, 'error');
  }
}

/**
 * Generate multiple quotes with basic, standard, and premium tiers
 * @param {Object} data - The base quote data
 * @returns {Object} Object containing three quote options
 */
function generateMultiQuote(data) {
  // Extract state from location
  const state = getStateFromLocation(data.location);
  
  // Get region and rates
  const region = stateToRegion[state] || 'northeast';
  const baseRate = marketRates[data.jobType]?.[region] || 85; // Default rate if not found
  const taxRate = stateTaxRates[state] || 0.06; // Default 6% if not found
  
  // Common data for all quotes
  const commonData = {
    jobType: data.jobType,
    jobSubtype: data.jobSubtype,
    jobTypeDisplay: getJobTypeDisplay(data.jobType),
    jobSubtypeDisplay: getJobSubtypeDisplay(data.jobType, data.jobSubtype),
    location: data.location,
    state,
    region,
    emergency: data.emergency,
    taxRate
  };
  
  // Try to get user profile for personalization if available
  let personalizedData = { ...data };
  
  // Try to personalize the data using the user profile
  try {
    // Dynamically import the user profile module
    import('/green/user-profile.js')
      .then(module => {
        const currentProfile = module.getCurrentProfile();
        
        // If we have a profile, use it to personalize the data
        if (currentProfile) {
          console.log('Personalizing quotes based on user profile:', currentProfile);
          personalizedData = module.personalizeQuote(personalizedData);
          
          // Use the personalized data to regenerate quotes if significant changes were made
          const hasSignificantChanges = 
            personalizedData.experienceLevel !== data.experienceLevel ||
            personalizedData.targetMargin !== data.targetMargin ||
            personalizedData.laborRate !== data.laborRate;
          
          if (hasSignificantChanges) {
            console.log('Significant profile changes detected, regenerating quotes');
            updateQuotesWithPersonalizedData();
          }
        }
      })
      .catch(err => {
        console.error('Error loading user profile module:', err);
      });
  } catch (error) {
    console.error('Error during profile personalization:', error);
  }
  
  // Generate the three quote options
  let basicQuote = generateQuoteForTier('basic', data, commonData, baseRate);
  let standardQuote = generateQuoteForTier('standard', data, commonData, baseRate);
  let premiumQuote = generateQuoteForTier('premium', data, commonData, baseRate);
  
  // Function to update quotes with personalized data if needed
  function updateQuotesWithPersonalizedData() {
    // Only regenerate if personalizedData is different from original data
    basicQuote = generateQuoteForTier('basic', personalizedData, commonData, baseRate);
    standardQuote = generateQuoteForTier('standard', personalizedData, commonData, baseRate);
    premiumQuote = generateQuoteForTier('premium', personalizedData, commonData, baseRate);
    
    // Refresh the displayed quotes
    displayQuotes({
      basic: basicQuote,
      standard: standardQuote,
      premium: premiumQuote,
      commonData
    });
    
    // Show notification about personalization
    showToast('Quotes personalized based on your business profile', 'info');
  }
  
  // Add editable flag to each quote for customization
  basicQuote.editable = true;
  standardQuote.editable = true;
  premiumQuote.editable = true;
  
  return {
    basic: basicQuote,
    standard: standardQuote,
    premium: premiumQuote,
    commonData
  };
}

/**
 * Generate a quote for a specific tier
 * @param {string} tier - The tier level (basic, standard, premium)
 * @param {Object} data - The original form data
 * @param {Object} commonData - Common data for all tiers
 * @param {number} baseRate - The base hourly rate
 * @returns {Object} The quote result for this tier
 */
function generateQuoteForTier(tier, data, commonData, baseRate) {
  // Default adjustments based on tier
  let laborHours, laborRate, materialsCost, targetMargin;
  let laborMultiplier = 1.0;
  let rateMultiplier = 1.0;
  let materialMultiplier = 1.0;
  let marginAdjustment = 0;
  
  // Set initial tier-specific adjustments
  switch (tier) {
    case 'basic':
      laborMultiplier = 0.8;  // 20% less time for basic
      rateMultiplier = 0.9;   // 10% lower rate
      materialMultiplier = 0.8; // 20% cheaper materials
      marginAdjustment = -5;  // Lower margin
      break;
    case 'standard':
      laborMultiplier = 1.0;  // Standard time
      rateMultiplier = 1.0;   // Standard rate
      materialMultiplier = 1.0; // Standard materials
      marginAdjustment = 0;   // Standard margin
      break;
    case 'premium':
      laborMultiplier = 1.2;  // 20% more time for premium
      rateMultiplier = 1.2;   // 20% higher rate
      materialMultiplier = 1.5; // 50% more expensive materials
      marginAdjustment = 5;   // Higher margin
      break;
  }
  
  // Apply service-specific adjustments
  if (isBeautyService(data.jobType)) {
    // Beauty services have shorter labor times but higher material costs (products)
    if (tier === 'basic') {
      laborMultiplier = 0.85;  // Only 15% less time for basic beauty services
      materialMultiplier = 0.7; // 30% cheaper products
    } else if (tier === 'premium') {
      laborMultiplier = 1.15;  // Only 15% more time for premium
      materialMultiplier = 2.0; // 100% more expensive premium products
      marginAdjustment = 8;    // Higher margins for premium beauty
    }
  } 
  else if (isElectronicRepair(data.jobType)) {
    // Electronic repairs have longer diagnostic times and specialized parts
    if (tier === 'basic') {
      laborMultiplier = 0.75; // 25% less time (simplified diagnostics)
      materialMultiplier = 0.7; // 30% cheaper parts (non-OEM)
    } else if (tier === 'standard') {
      laborMultiplier = 1.1;  // 10% more time for thorough diagnostics
    } else if (tier === 'premium') {
      laborMultiplier = 1.35; // 35% more time for intensive diagnostics
      materialMultiplier = 1.8; // 80% more expensive parts (OEM)
      marginAdjustment = 7;   // Higher margins for premium electronics
    }
  }
  else if (isAutomotiveRepair(data.jobType)) {
    // Automotive repairs have specific parts and labor adjustments
    if (tier === 'basic') {
      laborMultiplier = 0.8;  // 20% less time
      materialMultiplier = 0.75; // 25% cheaper parts
    } else if (tier === 'standard') {
      laborMultiplier = 1.0;  // Standard time
      materialMultiplier = 1.1; // 10% better materials
    } else if (tier === 'premium') {
      laborMultiplier = 1.25; // 25% more time
      materialMultiplier = 1.7; // 70% better materials (OEM)
      marginAdjustment = 6;   // Higher margins for premium automotive
    }
  }
  
  // Apply experience level multiplier to rate
  let experienceMultiplier = 1.0;
  switch (data.experienceLevel) {
    case 'junior':
      experienceMultiplier = 0.8; // Junior providers charge 20% less
      break;
    case 'intermediate':
      experienceMultiplier = 1.0; // Intermediate is the baseline
      break;
    case 'senior':
      experienceMultiplier = 1.2; // Senior providers charge 20% more
      break;
    case 'expert':
      experienceMultiplier = 1.4; // Expert providers charge 40% more
      break;
  }
  
  // Apply the calculated multipliers
  laborHours = data.laborHours * laborMultiplier;
  laborRate = baseRate * rateMultiplier * experienceMultiplier;
  
  // If it's a product-based service, adjust materials cost based on quantity
  const isProductService = ['locksmith', 'appliance_repair', 'cellphone_repair', 'computer_repair', 'tv_repair'].includes(data.jobType);
  if (isProductService && data.quantity > 1) {
    // Apply a slight discount for multiple items (5% per additional item, max 25%)
    const quantityDiscount = Math.min(0.25, (data.quantity - 1) * 0.05);
    materialsCost = data.materialsCost * materialMultiplier * data.quantity * (1 - quantityDiscount);
  } else {
    materialsCost = data.materialsCost * materialMultiplier;
  }
  
  targetMargin = data.targetMargin + marginAdjustment;
  
  // Emergency pricing adjustment
  if (data.emergency) {
    laborRate *= 1.5; // 50% premium for emergency service
  }
  
  // Calculate costs
  const laborCost = laborRate * laborHours;
  const costBasis = laborCost + materialsCost;
  
  // Target margin calculation - this is the same formula used in generateQuote
  const targetMarginDecimal = targetMargin / 100;
  
  // Calculate pre-tax total (revenue) to achieve target margin
  // Formula: price = cost / (1 - margin)
  const preTaxTotal = costBasis / (1 - targetMarginDecimal);
  
  // Calculate tax (applied only on materials) and final total
  const materialsTax = materialsCost * commonData.taxRate;
  const total = preTaxTotal + materialsTax;
  
  // Calculate actual profit and margin using pre-tax values
  const profit = preTaxTotal - costBasis;
  const actualProfitMargin = (profit / preTaxTotal) * 100;
  
  // Generate profit assessment
  let profitAssessment;
  if (Math.abs(actualProfitMargin - targetMargin) <= 1) {
    profitAssessment = `On target profit margin of ${targetMargin}%.`;
  } else if (actualProfitMargin < targetMargin) {
    profitAssessment = `Margin slightly below target (${actualProfitMargin.toFixed(1)}% vs target ${targetMargin}%).`;
  } else {
    profitAssessment = `Margin slightly above target (${actualProfitMargin.toFixed(1)}% vs target ${targetMargin}%).`;
  }
  
  // Get tier-specific content
  let description, features;
  switch (tier) {
    case 'basic':
      description = getBasicDescription(data.jobType);
      features = getPriceAwareFeatures(data.jobType, tier, total, data.experienceLevel, isProductService ? data.quantity : 0);
      break;
    case 'standard':
      description = getStandardDescription(data.jobType);
      features = getPriceAwareFeatures(data.jobType, tier, total, data.experienceLevel, isProductService ? data.quantity : 0);
      break;
    case 'premium':
      description = getPremiumDescription(data.jobType);
      features = getPriceAwareFeatures(data.jobType, tier, total, data.experienceLevel, isProductService ? data.quantity : 0);
      break;
    default:
      description = '';
      features = [];
  }
  
  // Properly include the preTaxTotal in the returned object
  const subtotal = laborCost + materialsCost;
  
  return {
    ...commonData,
    tier,
    description,
    features,
    experienceLevel: data.experienceLevel,
    quantity: isProductService ? data.quantity : 1,
    laborHours,
    laborRate,
    laborCost,
    materialsCost,
    materialsTax,
    subtotal,
    preTaxTotal,  // Add the pre-tax total for correct calculations
    total,
    targetMargin,
    actualProfitMargin,
    profit,
    profitAssessment,
    editable: true  // Make quotes editable
  };
}

/**
 * Generate AI recommendations based on the quote
 * @param {Object} quote - The quote object
 * @returns {Array<string>} List of recommendations
 */
/**
 * Generate advanced AI recommendations based on the quote and real-time market data
 * @param {Object} quote - The quote object
 * @returns {Array<string>} List of recommendations
 */
/**
 * Shows quote options modal for contractors with send options
 * @param {Object} quote - Quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 */
function showQuoteOptionsModal(quote, tierName) {
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.position = 'relative';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '20px 24px';
  header.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Quote Selected - Send Options';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = 'var(--color-text-secondary, #6b7280)';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '24px';
  
  // Quote info
  const quoteInfo = document.createElement('div');
  quoteInfo.style.marginBottom = '20px';
  quoteInfo.style.padding = '16px';
  quoteInfo.style.backgroundColor = 'rgba(243, 244, 246, 0.7)';
  quoteInfo.style.borderRadius = '6px';
  
  const tierBadge = document.createElement('div');
  tierBadge.textContent = tierName;
  tierBadge.style.display = 'inline-block';
  tierBadge.style.backgroundColor = tierName === 'Premium' ? '#4F46E5' : (tierName === 'Standard' ? '#0891b2' : '#6b7280');
  tierBadge.style.color = 'white';
  tierBadge.style.padding = '4px 10px';
  tierBadge.style.borderRadius = '4px';
  tierBadge.style.fontSize = '13px';
  tierBadge.style.fontWeight = 'bold';
  tierBadge.style.marginBottom = '12px';
  
  const serviceType = document.createElement('div');
  serviceType.textContent = `${quote.jobTypeDisplay} - ${quote.jobSubtypeDisplay || ''}`;
  serviceType.style.fontWeight = 'bold';
  serviceType.style.marginBottom = '8px';
  serviceType.style.fontSize = '16px';
  
  const quoteAmount = document.createElement('div');
  quoteAmount.style.display = 'flex';
  quoteAmount.style.justifyContent = 'space-between';
  quoteAmount.style.alignItems = 'center';
  quoteAmount.style.marginBottom = '4px';
  
  const amountLabel = document.createElement('span');
  amountLabel.textContent = 'Quote Total:';
  
  const amountValue = document.createElement('span');
  amountValue.textContent = `$${quote.total.toFixed(2)}`;
  amountValue.style.fontWeight = 'bold';
  amountValue.style.fontSize = '18px';
  
  quoteAmount.appendChild(amountLabel);
  quoteAmount.appendChild(amountValue);
  
  quoteInfo.appendChild(tierBadge);
  quoteInfo.appendChild(serviceType);
  quoteInfo.appendChild(quoteAmount);
  
  // Send options
  const optionsTitle = document.createElement('h4');
  optionsTitle.textContent = 'Send Options';
  optionsTitle.style.fontSize = '16px';
  optionsTitle.style.fontWeight = 'bold';
  optionsTitle.style.marginBottom = '16px';
  
  // Option 1: Send as Invoice
  const invoiceOption = document.createElement('div');
  invoiceOption.style.border = '1px solid var(--color-border, #e5e7eb)';
  invoiceOption.style.borderRadius = '8px';
  invoiceOption.style.padding = '16px';
  invoiceOption.style.marginBottom = '16px';
  invoiceOption.style.cursor = 'pointer';
  invoiceOption.style.transition = 'all 0.2s ease';
  
  const invoiceHeader = document.createElement('div');
  invoiceHeader.style.display = 'flex';
  invoiceHeader.style.alignItems = 'center';
  invoiceHeader.style.marginBottom = '10px';
  
  const invoiceIcon = document.createElement('span');
  invoiceIcon.innerHTML = '📄';
  invoiceIcon.style.fontSize = '20px';
  invoiceIcon.style.marginRight = '12px';
  
  const invoiceTitle = document.createElement('h5');
  invoiceTitle.textContent = 'Send as Payable Invoice';
  invoiceTitle.style.margin = '0';
  invoiceTitle.style.fontSize = '15px';
  invoiceTitle.style.fontWeight = 'bold';
  
  invoiceHeader.appendChild(invoiceIcon);
  invoiceHeader.appendChild(invoiceTitle);
  
  const invoiceDesc = document.createElement('p');
  invoiceDesc.textContent = 'Send a professional invoice that clients can pay online with a credit card or bank transfer.';
  invoiceDesc.style.margin = '0';
  invoiceDesc.style.fontSize = '14px';
  invoiceDesc.style.color = 'var(--color-text-secondary, #6b7280)';
  
  invoiceOption.appendChild(invoiceHeader);
  invoiceOption.appendChild(invoiceDesc);
  
  // Option 2: Collect Payment In Person
  const manualOption = document.createElement('div');
  manualOption.style.border = '1px solid var(--color-border, #e5e7eb)';
  manualOption.style.borderRadius = '8px';
  manualOption.style.padding = '16px';
  manualOption.style.cursor = 'pointer';
  manualOption.style.transition = 'all 0.2s ease';
  
  const manualHeader = document.createElement('div');
  manualHeader.style.display = 'flex';
  manualHeader.style.alignItems = 'center';
  manualHeader.style.marginBottom = '10px';
  
  const manualIcon = document.createElement('span');
  manualIcon.innerHTML = '💵';
  manualIcon.style.fontSize = '20px';
  manualIcon.style.marginRight = '12px';
  
  const manualTitle = document.createElement('h5');
  manualTitle.textContent = 'Collect Payment In Person';
  manualTitle.style.margin = '0';
  manualTitle.style.fontSize = '15px';
  manualTitle.style.fontWeight = '600';
  
  manualHeader.appendChild(manualIcon);
  manualHeader.appendChild(manualTitle);
  
  const manualDesc = document.createElement('p');
  manualDesc.textContent = 'Send quote details and collect payment manually via cash, check, or in-person card payment.';
  manualDesc.style.margin = '0';
  manualDesc.style.fontSize = '14px';
  manualDesc.style.color = 'var(--color-text-secondary, #6b7280)';
  
  manualOption.appendChild(manualHeader);
  manualOption.appendChild(manualDesc);
  
  // Add hover effects
  invoiceOption.addEventListener('mouseenter', () => {
    invoiceOption.style.borderColor = 'var(--color-primary, #4F46E5)';
    invoiceOption.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
  });
  
  invoiceOption.addEventListener('mouseleave', () => {
    invoiceOption.style.borderColor = 'var(--color-border, #e5e7eb)';
    invoiceOption.style.backgroundColor = 'transparent';
  });
  
  manualOption.addEventListener('mouseenter', () => {
    manualOption.style.borderColor = 'var(--color-primary, #4F46E5)';
    manualOption.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
  });
  
  manualOption.addEventListener('mouseleave', () => {
    manualOption.style.borderColor = 'var(--color-border, #e5e7eb)';
    manualOption.style.backgroundColor = 'transparent';
  });
  
  // Button row for actions
  const buttonRow = document.createElement('div');
  buttonRow.style.display = 'flex';
  buttonRow.style.justifyContent = 'flex-end';
  buttonRow.style.marginTop = '20px';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '8px 16px';
  cancelButton.style.marginRight = '10px';
  cancelButton.style.backgroundColor = 'transparent';
  cancelButton.style.border = '1px solid var(--color-border, #e5e7eb)';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Quote';
  saveButton.style.padding = '8px 16px';
  saveButton.style.backgroundColor = '#10b981';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.cursor = 'pointer';
  saveButton.addEventListener('click', () => {
    saveQuote(quote, tierName);
    if (window.showToast) {
      window.showToast('Quote saved successfully', 'success');
    }
  });
  
  buttonRow.appendChild(cancelButton);
  buttonRow.appendChild(saveButton);
  
  // Add click handlers for the options
  invoiceOption.addEventListener('click', () => {
    // Handle send as invoice by redirecting to invoice workflow
    document.body.removeChild(modalOverlay);
    showInvoiceWorkflowModal(quote, tierName);
  });
  
  manualOption.addEventListener('click', () => {
    // Handle manual payment collection by redirecting to payment terminal
    document.body.removeChild(modalOverlay);
    showPaymentTerminalModal(quote, tierName);
  });
  
  // Assemble modal
  content.appendChild(quoteInfo);
  content.appendChild(optionsTitle);
  content.appendChild(invoiceOption);
  content.appendChild(manualOption);
  content.appendChild(buttonRow);
  
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);
}

/**
 * Shows payment terms modal for quotes requiring deposits
 * @param {Object} quote - Quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 */
function showDepositPaymentModal(quote, tierName) {
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.position = 'relative';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '20px 24px';
  header.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Payment Terms & Deposit';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = 'var(--color-text-secondary, #6b7280)';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '24px';
  
  // Quote summary
  const summary = document.createElement('div');
  summary.style.marginBottom = '24px';
  summary.style.padding = '16px';
  summary.style.backgroundColor = 'rgba(243, 244, 246, 0.7)';
  summary.style.borderRadius = '6px';
  
  const serviceType = document.createElement('div');
  serviceType.textContent = `${quote.jobTypeDisplay} - ${quote.jobSubtypeDisplay}`;
  serviceType.style.fontWeight = 'bold';
  serviceType.style.marginBottom = '8px';
  
  const quoteTotal = document.createElement('div');
  quoteTotal.style.display = 'flex';
  quoteTotal.style.justifyContent = 'space-between';
  quoteTotal.style.alignItems = 'center';
  quoteTotal.style.marginBottom = '4px';
  
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Quote Total:';
  
  const totalValue = document.createElement('span');
  totalValue.textContent = `$${quote.total.toFixed(2)}`;
  totalValue.style.fontWeight = 'bold';
  
  quoteTotal.appendChild(totalLabel);
  quoteTotal.appendChild(totalValue);
  
  // Deposit amount
  const depositDiv = document.createElement('div');
  depositDiv.style.display = 'flex';
  depositDiv.style.justifyContent = 'space-between';
  depositDiv.style.alignItems = 'center';
  depositDiv.style.marginBottom = '4px';
  depositDiv.style.padding = '12px';
  depositDiv.style.backgroundColor = 'white';
  depositDiv.style.borderRadius = '4px';
  depositDiv.style.border = '1px solid var(--color-primary, #4F46E5)';
  depositDiv.style.marginTop = '16px';
  
  const depositLabel = document.createElement('span');
  depositLabel.textContent = 'Required Deposit (25%):';
  
  const depositValue = document.createElement('span');
  depositValue.textContent = quote.depositAmount !== undefined ? `$${quote.depositAmount.toFixed(2)}` : '$0.00';
  depositValue.style.fontWeight = 'bold';
  depositValue.style.color = 'var(--color-primary, #4F46E5)';
  
  depositDiv.appendChild(depositLabel);
  depositDiv.appendChild(depositValue);
  
  // Remaining balance
  const remainingDiv = document.createElement('div');
  remainingDiv.style.display = 'flex';
  remainingDiv.style.justifyContent = 'space-between';
  remainingDiv.style.alignItems = 'center';
  remainingDiv.style.backgroundColor = 'white';
  remainingDiv.style.borderRadius = '4px';
  remainingDiv.style.padding = '12px';
  remainingDiv.style.marginTop = '8px';
  
  const remainingLabel = document.createElement('span');
  remainingLabel.textContent = 'Remaining Balance (due at completion):';
  
  const remainingValue = document.createElement('span');
  remainingValue.textContent = quote.remainingAmount !== undefined ? `$${quote.remainingAmount.toFixed(2)}` : `$${(quote.total * 0.75).toFixed(2)}`;
  remainingValue.style.fontWeight = 'bold';
  
  remainingDiv.appendChild(remainingLabel);
  remainingDiv.appendChild(remainingValue);
  
  summary.appendChild(serviceType);
  summary.appendChild(quoteTotal);
  summary.appendChild(depositDiv);
  summary.appendChild(remainingDiv);
  
  // Payment terms checkboxes
  const termsSection = document.createElement('div');
  termsSection.style.marginBottom = '24px';
  
  const termsTitle = document.createElement('h4');
  termsTitle.textContent = 'Terms & Conditions';
  termsTitle.style.fontSize = '16px';
  termsTitle.style.fontWeight = 'bold';
  termsTitle.style.marginBottom = '12px';
  
  const termsList = document.createElement('div');
  
  const terms = [
    'The deposit is non-refundable but will be applied to the final invoice.',
    'The remaining balance is due upon completion of the service.',
    'Cancellations must be made at least 24 hours in advance.',
    'Price may change if job scope changes significantly from quote.',
    'Service provider is licensed and insured as required by local regulations.'
  ];
  
  terms.forEach((term, index) => {
    const termItem = document.createElement('div');
    termItem.style.display = 'flex';
    termItem.style.alignItems = 'flex-start';
    termItem.style.marginBottom = '12px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `term-${index}`;
    checkbox.style.marginRight = '10px';
    checkbox.style.marginTop = '3px';
    
    const label = document.createElement('label');
    label.htmlFor = `term-${index}`;
    label.textContent = term;
    label.style.fontSize = '14px';
    
    termItem.appendChild(checkbox);
    termItem.appendChild(label);
    termsList.appendChild(termItem);
  });
  
  termsSection.appendChild(termsTitle);
  termsSection.appendChild(termsList);
  
  // Payment method section
  const paymentSection = document.createElement('div');
  paymentSection.style.marginBottom = '24px';
  
  const paymentTitle = document.createElement('h4');
  paymentTitle.textContent = 'Payment Method';
  paymentTitle.style.fontSize = '16px';
  paymentTitle.style.fontWeight = 'bold';
  paymentTitle.style.marginBottom = '12px';
  
  // Stripe card element placeholder
  const paymentElement = document.createElement('div');
  paymentElement.style.padding = '16px';
  paymentElement.style.border = '1px solid var(--color-border, #e5e7eb)';
  paymentElement.style.borderRadius = '6px';
  paymentElement.style.backgroundColor = 'rgba(243, 244, 246, 0.7)';
  paymentElement.style.marginBottom = '16px';
  
  const cardIcon = document.createElement('div');
  cardIcon.innerHTML = '💳';
  cardIcon.style.fontSize = '24px';
  cardIcon.style.marginBottom = '12px';
  cardIcon.style.textAlign = 'center';
  
  const placeholderText = document.createElement('p');
  placeholderText.textContent = 'Secure payment processing via Stripe';
  placeholderText.style.margin = '0';
  placeholderText.style.textAlign = 'center';
  placeholderText.style.fontSize = '14px';
  placeholderText.style.color = 'var(--color-text-secondary, #6b7280)';
  
  paymentElement.appendChild(cardIcon);
  paymentElement.appendChild(placeholderText);
  
  paymentSection.appendChild(paymentTitle);
  paymentSection.appendChild(paymentElement);
  
  // Add Stripe payment form
  // In a real implementation, this would include the Stripe Elements
  // This is a placeholder that simulates what the UI would look like
  
  // Payment button
  const payButton = document.createElement('button');
  payButton.textContent = quote.depositAmount !== undefined ? `Pay Deposit: $${quote.depositAmount.toFixed(2)}` : `Pay Deposit: $${(quote.total * 0.25).toFixed(2)}`;
  payButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  payButton.style.color = 'white';
  payButton.style.border = 'none';
  payButton.style.borderRadius = '6px';
  payButton.style.padding = '12px 16px';
  payButton.style.width = '100%';
  payButton.style.fontSize = '16px';
  payButton.style.fontWeight = 'bold';
  payButton.style.cursor = 'pointer';
  payButton.disabled = true;
  payButton.style.opacity = '0.6';
  
  // Enable the button only when all terms are checked
  const checkboxes = termsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      payButton.disabled = !allChecked;
      payButton.style.opacity = allChecked ? '1' : '0.6';
    });
  });
  
  payButton.addEventListener('click', () => {
    // This would normally initiate the actual Stripe payment
    // For this example, we'll simulate the payment process
    payButton.disabled = true;
    payButton.textContent = 'Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
      // Show success and close modal
      if (window.showToast) {
        window.showToast('Deposit payment successful! Quote accepted.', 'success');
      }
      
      // Remove modal
      document.body.removeChild(modalOverlay);
      
      // Display quote results
      displayQuoteResults(quote);
      
      // Update quote status
      quote.depositPaid = true;
      quote.acceptedAt = new Date().toISOString();
      
      // In a real app, this would save the updated quote to the database
      saveQuote(quote, tierName);
    }, 1500);
  });
  
  // Assemble modal content
  content.appendChild(summary);
  content.appendChild(termsSection);
  content.appendChild(paymentSection);
  content.appendChild(payButton);
  
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  
  // Add to DOM
  document.body.appendChild(modalOverlay);
}

/**
 * Shows invoice workflow modal for sending professional invoices
 * @param {Object} quote - Quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 */
function showInvoiceWorkflowModal(quote, tierName) {
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  modal.style.width = '90%';
  modal.style.maxWidth = '600px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.position = 'relative';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '20px 24px';
  header.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Create Professional Invoice';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = 'var(--color-text-secondary, #6b7280)';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '24px';
  
  // Invoice form
  const form = document.createElement('form');
  form.id = 'invoice-form';
  
  // Client information section
  const clientSection = document.createElement('div');
  clientSection.style.marginBottom = '24px';
  
  const clientSectionTitle = document.createElement('h4');
  clientSectionTitle.textContent = 'Client Information';
  clientSectionTitle.style.fontSize = '16px';
  clientSectionTitle.style.fontWeight = 'bold';
  clientSectionTitle.style.marginBottom = '16px';
  
  const clientNameGroup = document.createElement('div');
  clientNameGroup.style.marginBottom = '16px';
  
  const clientNameLabel = document.createElement('label');
  clientNameLabel.htmlFor = 'client-name';
  clientNameLabel.textContent = 'Client Name';
  clientNameLabel.style.display = 'block';
  clientNameLabel.style.marginBottom = '8px';
  clientNameLabel.style.fontSize = '14px';
  
  const clientNameInput = document.createElement('input');
  clientNameInput.type = 'text';
  clientNameInput.id = 'client-name';
  clientNameInput.name = 'clientName';
  clientNameInput.placeholder = 'Enter client name';
  clientNameInput.style.width = '100%';
  clientNameInput.style.padding = '10px';
  clientNameInput.style.borderRadius = '6px';
  clientNameInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  clientNameInput.required = true;
  
  clientNameGroup.appendChild(clientNameLabel);
  clientNameGroup.appendChild(clientNameInput);
  
  const clientEmailGroup = document.createElement('div');
  clientEmailGroup.style.marginBottom = '16px';
  
  const clientEmailLabel = document.createElement('label');
  clientEmailLabel.htmlFor = 'client-email';
  clientEmailLabel.textContent = 'Client Email';
  clientEmailLabel.style.display = 'block';
  clientEmailLabel.style.marginBottom = '8px';
  clientEmailLabel.style.fontSize = '14px';
  
  const clientEmailInput = document.createElement('input');
  clientEmailInput.type = 'email';
  clientEmailInput.id = 'client-email';
  clientEmailInput.name = 'clientEmail';
  clientEmailInput.placeholder = 'Enter client email';
  clientEmailInput.style.width = '100%';
  clientEmailInput.style.padding = '10px';
  clientEmailInput.style.borderRadius = '6px';
  clientEmailInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  clientEmailInput.required = true;
  
  clientEmailGroup.appendChild(clientEmailLabel);
  clientEmailGroup.appendChild(clientEmailInput);
  
  clientSection.appendChild(clientSectionTitle);
  clientSection.appendChild(clientNameGroup);
  clientSection.appendChild(clientEmailGroup);
  
  // Quote details section
  const quoteSection = document.createElement('div');
  quoteSection.style.marginBottom = '24px';
  
  const quoteSectionTitle = document.createElement('h4');
  quoteSectionTitle.textContent = 'Quote Details';
  quoteSectionTitle.style.fontSize = '16px';
  quoteSectionTitle.style.fontWeight = 'bold';
  quoteSectionTitle.style.marginBottom = '16px';
  
  // Create table for line items
  const lineItemsTable = document.createElement('table');
  lineItemsTable.style.width = '100%';
  lineItemsTable.style.borderCollapse = 'collapse';
  lineItemsTable.style.marginBottom = '16px';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Description', 'Quantity', 'Unit Price', 'Total'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.textAlign = 'left';
    th.style.padding = '8px';
    th.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  lineItemsTable.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  // Add line items from quote
  let lineItems = [];
  
  // Base service
  lineItems.push({
    description: `${quote.jobTypeDisplay} - ${quote.jobSubtypeDisplay}`,
    quantity: 1,
    unitPrice: quote.baseAmount || quote.total,
    total: quote.baseAmount || quote.total
  });
  
  // Features and services
  if (quote.selectedFeatures && quote.selectedFeatures.length) {
    quote.selectedFeatures.forEach(feature => {
      if (feature.selected) {
        lineItems.push({
          description: feature.name,
          quantity: 1,
          unitPrice: feature.price,
          total: feature.price
        });
      }
    });
  }
  
  // Add rows to the table
  lineItems.forEach(item => {
    const row = document.createElement('tr');
    
    const descCell = document.createElement('td');
    descCell.textContent = item.description;
    descCell.style.padding = '8px';
    descCell.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    
    const qtyCell = document.createElement('td');
    qtyCell.textContent = item.quantity;
    qtyCell.style.padding = '8px';
    qtyCell.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    
    const priceCell = document.createElement('td');
    priceCell.textContent = `$${item.unitPrice.toFixed(2)}`;
    priceCell.style.padding = '8px';
    priceCell.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    
    const totalCell = document.createElement('td');
    totalCell.textContent = `$${item.total.toFixed(2)}`;
    totalCell.style.padding = '8px';
    totalCell.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    
    row.appendChild(descCell);
    row.appendChild(qtyCell);
    row.appendChild(priceCell);
    row.appendChild(totalCell);
    
    tbody.appendChild(row);
  });
  
  lineItemsTable.appendChild(tbody);
  
  // Total row
  const totalDiv = document.createElement('div');
  totalDiv.style.display = 'flex';
  totalDiv.style.justifyContent = 'flex-end';
  totalDiv.style.padding = '12px 0';
  totalDiv.style.borderTop = '2px solid var(--color-border, #e5e7eb)';
  totalDiv.style.marginTop = '8px';
  
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total:';
  totalLabel.style.fontWeight = 'bold';
  totalLabel.style.marginRight = '16px';
  
  const totalValue = document.createElement('span');
  totalValue.textContent = `$${quote.total.toFixed(2)}`;
  totalValue.style.fontWeight = 'bold';
  
  totalDiv.appendChild(totalLabel);
  totalDiv.appendChild(totalValue);
  
  // Payment terms
  const termsSection = document.createElement('div');
  termsSection.style.marginBottom = '24px';
  
  const termsTitle = document.createElement('h4');
  termsTitle.textContent = 'Payment Terms';
  termsTitle.style.fontSize = '16px';
  termsTitle.style.fontWeight = 'bold';
  termsTitle.style.marginBottom = '16px';
  
  const dueDateGroup = document.createElement('div');
  dueDateGroup.style.marginBottom = '16px';
  
  const dueDateLabel = document.createElement('label');
  dueDateLabel.htmlFor = 'due-date';
  dueDateLabel.textContent = 'Due Date';
  dueDateLabel.style.display = 'block';
  dueDateLabel.style.marginBottom = '8px';
  dueDateLabel.style.fontSize = '14px';
  
  // Default to 14 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const dueDateString = defaultDueDate.toISOString().split('T')[0];
  
  const dueDateInput = document.createElement('input');
  dueDateInput.type = 'date';
  dueDateInput.id = 'due-date';
  dueDateInput.name = 'dueDate';
  dueDateInput.value = dueDateString;
  dueDateInput.style.width = '100%';
  dueDateInput.style.padding = '10px';
  dueDateInput.style.borderRadius = '6px';
  dueDateInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  dueDateInput.required = true;
  
  dueDateGroup.appendChild(dueDateLabel);
  dueDateGroup.appendChild(dueDateInput);
  
  const notesGroup = document.createElement('div');
  notesGroup.style.marginBottom = '16px';
  
  const notesLabel = document.createElement('label');
  notesLabel.htmlFor = 'invoice-notes';
  notesLabel.textContent = 'Notes';
  notesLabel.style.display = 'block';
  notesLabel.style.marginBottom = '8px';
  notesLabel.style.fontSize = '14px';
  
  const notesInput = document.createElement('textarea');
  notesInput.id = 'invoice-notes';
  notesInput.name = 'notes';
  notesInput.placeholder = 'Enter additional notes or payment instructions';
  notesInput.style.width = '100%';
  notesInput.style.padding = '10px';
  notesInput.style.borderRadius = '6px';
  notesInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  notesInput.style.minHeight = '80px';
  
  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInput);
  
  termsSection.appendChild(termsTitle);
  termsSection.appendChild(dueDateGroup);
  termsSection.appendChild(notesGroup);
  
  // Assemble the form
  quoteSection.appendChild(quoteSectionTitle);
  quoteSection.appendChild(lineItemsTable);
  quoteSection.appendChild(totalDiv);
  
  form.appendChild(clientSection);
  form.appendChild(quoteSection);
  form.appendChild(termsSection);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Send Invoice';
  submitButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.padding = '12px 24px';
  submitButton.style.fontSize = '16px';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.width = '100%';
  
  form.appendChild(submitButton);
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const invoiceData = {
      clientName: formData.get('clientName'),
      clientEmail: formData.get('clientEmail'),
      dueDate: formData.get('dueDate'),
      notes: formData.get('notes'),
      lineItems: lineItems,
      total: quote.total,
      quoteId: quote.id || `quote-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    
    // In a real application, this would send the invoice data to the server
    // and trigger an email to the client
    
    // Show success message
    if (window.showToast) {
      window.showToast('Invoice sent successfully!', 'success');
    }
    
    // Store the invoice in localStorage for demo purposes
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('stackrInvoices') || '[]');
      savedInvoices.push(invoiceData);
      localStorage.setItem('stackrInvoices', JSON.stringify(savedInvoices));
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
    
    // Close the modal
    document.body.removeChild(modalOverlay);
  });
  
  content.appendChild(form);
  
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  
  // Add to DOM
  document.body.appendChild(modalOverlay);
}

/**
 * Shows payment terminal modal for collecting payments
 * @param {Object} quote - Quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 */
function showPaymentTerminalModal(quote, tierName) {
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  modal.style.width = '90%';
  modal.style.maxWidth = '500px';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';
  modal.style.position = 'relative';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '20px 24px';
  header.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = 'Payment Terminal';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = 'var(--color-text-secondary, #6b7280)';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '24px';
  
  // Amount section
  const amountSection = document.createElement('div');
  amountSection.style.marginBottom = '24px';
  amountSection.style.textAlign = 'center';
  
  const amountTitle = document.createElement('p');
  amountTitle.textContent = 'Total Amount';
  amountTitle.style.fontSize = '14px';
  amountTitle.style.color = 'var(--color-text-secondary, #6b7280)';
  amountTitle.style.margin = '0 0 8px 0';
  
  const amountValue = document.createElement('div');
  amountValue.textContent = `$${quote.total.toFixed(2)}`;
  amountValue.style.fontSize = '36px';
  amountValue.style.fontWeight = 'bold';
  amountValue.style.color = 'var(--color-primary, #4F46E5)';
  amountValue.style.marginBottom = '16px';
  
  const quoteRef = document.createElement('p');
  quoteRef.textContent = `Quote #${quote.id || 'Q-' + Date.now().toString().slice(-6)}`;
  quoteRef.style.fontSize = '14px';
  quoteRef.style.color = 'var(--color-text-secondary, #6b7280)';
  quoteRef.style.margin = '0';
  
  amountSection.appendChild(amountTitle);
  amountSection.appendChild(amountValue);
  amountSection.appendChild(quoteRef);
  
  // Payment method tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.style.marginBottom = '24px';
  tabsContainer.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  tabsContainer.style.display = 'flex';
  
  const tabs = [
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'transfer', name: 'Bank Transfer', icon: '🏦' }
  ];
  
  const tabPanels = {};
  
  tabs.forEach((tab, index) => {
    const tabButton = document.createElement('button');
    tabButton.id = `tab-${tab.id}`;
    tabButton.style.flex = '1';
    tabButton.style.padding = '12px';
    tabButton.style.background = 'none';
    tabButton.style.border = 'none';
    tabButton.style.borderBottom = index === 0 ? '2px solid var(--color-primary, #4F46E5)' : '2px solid transparent';
    tabButton.style.color = index === 0 ? 'var(--color-primary, #4F46E5)' : 'var(--color-text, #111827)';
    tabButton.style.fontWeight = index === 0 ? 'bold' : 'normal';
    tabButton.style.cursor = 'pointer';
    tabButton.style.transition = 'all 0.3s ease';
    
    const tabIcon = document.createElement('span');
    tabIcon.textContent = tab.icon;
    tabIcon.style.display = 'block';
    tabIcon.style.fontSize = '20px';
    tabIcon.style.marginBottom = '4px';
    
    const tabText = document.createElement('span');
    tabText.textContent = tab.name;
    tabText.style.fontSize = '14px';
    
    tabButton.appendChild(tabIcon);
    tabButton.appendChild(tabText);
    
    // Create panel for this tab
    const panel = document.createElement('div');
    panel.id = `panel-${tab.id}`;
    panel.style.display = index === 0 ? 'block' : 'none';
    panel.style.padding = '16px 0';
    
    tabPanels[tab.id] = panel;
    
    // Add click event
    tabButton.addEventListener('click', () => {
      // Reset all tabs
      tabsContainer.querySelectorAll('button').forEach(btn => {
        btn.style.borderBottom = '2px solid transparent';
        btn.style.color = 'var(--color-text, #111827)';
        btn.style.fontWeight = 'normal';
      });
      
      // Hide all panels
      Object.values(tabPanels).forEach(p => {
        p.style.display = 'none';
      });
      
      // Activate clicked tab
      tabButton.style.borderBottom = '2px solid var(--color-primary, #4F46E5)';
      tabButton.style.color = 'var(--color-primary, #4F46E5)';
      tabButton.style.fontWeight = 'bold';
      
      // Show panel
      panel.style.display = 'block';
    });
    
    tabsContainer.appendChild(tabButton);
  });
  
  // Credit Card Panel
  const cardPanel = tabPanels['card'];
  
  const cardForm = document.createElement('form');
  cardForm.id = 'card-payment-form';
  
  const cardNumberGroup = document.createElement('div');
  cardNumberGroup.style.marginBottom = '16px';
  
  const cardNumberLabel = document.createElement('label');
  cardNumberLabel.htmlFor = 'card-number';
  cardNumberLabel.textContent = 'Card Number';
  cardNumberLabel.style.display = 'block';
  cardNumberLabel.style.marginBottom = '8px';
  cardNumberLabel.style.fontSize = '14px';
  
  const cardNumberInput = document.createElement('input');
  cardNumberInput.type = 'text';
  cardNumberInput.id = 'card-number';
  cardNumberInput.placeholder = '•••• •••• •••• ••••';
  cardNumberInput.style.width = '100%';
  cardNumberInput.style.padding = '10px';
  cardNumberInput.style.borderRadius = '6px';
  cardNumberInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  cardNumberGroup.appendChild(cardNumberLabel);
  cardNumberGroup.appendChild(cardNumberInput);
  
  // Expiry and CVC row
  const cardRowGroup = document.createElement('div');
  cardRowGroup.style.display = 'flex';
  cardRowGroup.style.gap = '16px';
  cardRowGroup.style.marginBottom = '16px';
  
  const expiryGroup = document.createElement('div');
  expiryGroup.style.flex = '1';
  
  const expiryLabel = document.createElement('label');
  expiryLabel.htmlFor = 'card-expiry';
  expiryLabel.textContent = 'Expiry Date';
  expiryLabel.style.display = 'block';
  expiryLabel.style.marginBottom = '8px';
  expiryLabel.style.fontSize = '14px';
  
  const expiryInput = document.createElement('input');
  expiryInput.type = 'text';
  expiryInput.id = 'card-expiry';
  expiryInput.placeholder = 'MM/YY';
  expiryInput.style.width = '100%';
  expiryInput.style.padding = '10px';
  expiryInput.style.borderRadius = '6px';
  expiryInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  expiryGroup.appendChild(expiryLabel);
  expiryGroup.appendChild(expiryInput);
  
  const cvcGroup = document.createElement('div');
  cvcGroup.style.flex = '1';
  
  const cvcLabel = document.createElement('label');
  cvcLabel.htmlFor = 'card-cvc';
  cvcLabel.textContent = 'CVC';
  cvcLabel.style.display = 'block';
  cvcLabel.style.marginBottom = '8px';
  cvcLabel.style.fontSize = '14px';
  
  const cvcInput = document.createElement('input');
  cvcInput.type = 'text';
  cvcInput.id = 'card-cvc';
  cvcInput.placeholder = '•••';
  cvcInput.style.width = '100%';
  cvcInput.style.padding = '10px';
  cvcInput.style.borderRadius = '6px';
  cvcInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  cvcGroup.appendChild(cvcLabel);
  cvcGroup.appendChild(cvcInput);
  
  cardRowGroup.appendChild(expiryGroup);
  cardRowGroup.appendChild(cvcGroup);
  
  cardForm.appendChild(cardNumberGroup);
  cardForm.appendChild(cardRowGroup);
  
  cardPanel.appendChild(cardForm);
  
  // Cash Panel
  const cashPanel = tabPanels['cash'];
  
  const cashInstructions = document.createElement('div');
  cashInstructions.style.backgroundColor = 'rgba(243, 244, 246, 0.7)';
  cashInstructions.style.borderRadius = '6px';
  cashInstructions.style.padding = '16px';
  cashInstructions.style.marginBottom = '20px';
  
  const cashIcon = document.createElement('span');
  cashIcon.textContent = '📝';
  cashIcon.style.fontSize = '24px';
  cashIcon.style.display = 'block';
  cashIcon.style.textAlign = 'center';
  cashIcon.style.marginBottom = '12px';
  
  const cashText = document.createElement('p');
  cashText.textContent = 'Enter the amount received from the customer. Any change due will be calculated automatically.';
  cashText.style.margin = '0';
  cashText.style.fontSize = '14px';
  cashText.style.textAlign = 'center';
  cashText.style.color = 'var(--color-text-secondary, #6b7280)';
  
  cashInstructions.appendChild(cashIcon);
  cashInstructions.appendChild(cashText);
  
  const amountReceivedGroup = document.createElement('div');
  amountReceivedGroup.style.marginBottom = '16px';
  
  const amountReceivedLabel = document.createElement('label');
  amountReceivedLabel.htmlFor = 'amount-received';
  amountReceivedLabel.textContent = 'Amount Received';
  amountReceivedLabel.style.display = 'block';
  amountReceivedLabel.style.marginBottom = '8px';
  amountReceivedLabel.style.fontSize = '14px';
  
  const amountReceivedInput = document.createElement('input');
  amountReceivedInput.type = 'number';
  amountReceivedInput.step = '0.01';
  amountReceivedInput.id = 'amount-received';
  amountReceivedInput.value = quote.total.toFixed(2);
  amountReceivedInput.style.width = '100%';
  amountReceivedInput.style.padding = '10px';
  amountReceivedInput.style.borderRadius = '6px';
  amountReceivedInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  // Calculate change
  const changeGroup = document.createElement('div');
  changeGroup.style.marginBottom = '16px';
  
  const changeLabel = document.createElement('label');
  changeLabel.htmlFor = 'change-amount';
  changeLabel.textContent = 'Change Due';
  changeLabel.style.display = 'block';
  changeLabel.style.marginBottom = '8px';
  changeLabel.style.fontSize = '14px';
  
  const changeInput = document.createElement('input');
  changeInput.type = 'text';
  changeInput.id = 'change-amount';
  changeInput.readOnly = true;
  changeInput.value = '$0.00';
  changeInput.style.width = '100%';
  changeInput.style.padding = '10px';
  changeInput.style.borderRadius = '6px';
  changeInput.style.backgroundColor = '#f9fafb';
  changeInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  // Update change amount when received amount changes
  amountReceivedInput.addEventListener('input', () => {
    const received = parseFloat(amountReceivedInput.value) || 0;
    const change = Math.max(0, received - quote.total);
    changeInput.value = `$${change.toFixed(2)}`;
  });
  
  amountReceivedGroup.appendChild(amountReceivedLabel);
  amountReceivedGroup.appendChild(amountReceivedInput);
  
  changeGroup.appendChild(changeLabel);
  changeGroup.appendChild(changeInput);
  
  cashPanel.appendChild(cashInstructions);
  cashPanel.appendChild(amountReceivedGroup);
  cashPanel.appendChild(changeGroup);
  
  // Bank Transfer Panel
  const transferPanel = tabPanels['transfer'];
  
  const transferInstructions = document.createElement('div');
  transferInstructions.style.backgroundColor = 'rgba(243, 244, 246, 0.7)';
  transferInstructions.style.borderRadius = '6px';
  transferInstructions.style.padding = '16px';
  transferInstructions.style.textAlign = 'center';
  
  const transferIcon = document.createElement('span');
  transferIcon.textContent = '🏦';
  transferIcon.style.fontSize = '32px';
  transferIcon.style.display = 'block';
  transferIcon.style.marginBottom = '12px';
  
  const transferTitle = document.createElement('h4');
  transferTitle.textContent = 'Bank Account Details';
  transferTitle.style.margin = '0 0 12px 0';
  transferTitle.style.fontSize = '16px';
  transferTitle.style.fontWeight = 'bold';
  
  // Bank details
  const bankDetails = document.createElement('div');
  bankDetails.style.fontSize = '14px';
  bankDetails.style.lineHeight = '1.6';
  bankDetails.style.marginBottom = '16px';
  
  const accountName = document.createElement('p');
  accountName.innerHTML = '<strong>Account Name:</strong> Your Business Name';
  accountName.style.margin = '0';
  
  const accountNumber = document.createElement('p');
  accountNumber.innerHTML = '<strong>Account Number:</strong> 123456789';
  accountNumber.style.margin = '4px 0';
  
  const routingNumber = document.createElement('p');
  routingNumber.innerHTML = '<strong>Routing Number:</strong> 987654321';
  routingNumber.style.margin = '0';
  
  bankDetails.appendChild(accountName);
  bankDetails.appendChild(accountNumber);
  bankDetails.appendChild(routingNumber);
  
  const transferNote = document.createElement('p');
  transferNote.textContent = `Please reference quote number ${quote.id || 'Q-' + Date.now().toString().slice(-6)} in your transfer.`;
  transferNote.style.margin = '0';
  transferNote.style.fontSize = '14px';
  transferNote.style.color = 'var(--color-text-secondary, #6b7280)';
  
  transferInstructions.appendChild(transferIcon);
  transferInstructions.appendChild(transferTitle);
  transferInstructions.appendChild(bankDetails);
  transferInstructions.appendChild(transferNote);
  
  transferPanel.appendChild(transferInstructions);
  
  // Process payment button
  const processButton = document.createElement('button');
  processButton.textContent = 'Process Payment';
  processButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  processButton.style.color = 'white';
  processButton.style.border = 'none';
  processButton.style.borderRadius = '6px';
  processButton.style.padding = '12px 24px';
  processButton.style.fontSize = '16px';
  processButton.style.fontWeight = 'bold';
  processButton.style.cursor = 'pointer';
  processButton.style.width = '100%';
  processButton.style.marginTop = '24px';
  
  processButton.addEventListener('click', () => {
    const activeTabId = Object.keys(tabPanels).find(key => 
      tabPanels[key].style.display === 'block'
    );
    
    let message;
    switch (activeTabId) {
      case 'card':
        message = 'Card payment processed successfully';
        break;
      case 'cash':
        message = 'Cash payment recorded successfully';
        break;
      case 'transfer':
        message = 'Bank transfer details sent to client';
        break;
      default:
        message = 'Payment processed successfully';
    }
    
    // Show processing state
    processButton.disabled = true;
    processButton.textContent = 'Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
      // Show success
      if (window.showToast) {
        window.showToast(message, 'success');
      }
      
      // Save payment record
      const paymentRecord = {
        quoteId: quote.id || `quote-${Date.now().toString().slice(-6)}`,
        amount: quote.total,
        method: activeTabId,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      try {
        const savedPayments = JSON.parse(localStorage.getItem('stackrPayments') || '[]');
        savedPayments.push(paymentRecord);
        localStorage.setItem('stackrPayments', JSON.stringify(savedPayments));
      } catch (error) {
        console.error('Error saving payment record:', error);
      }
      
      // Close modal
      document.body.removeChild(modalOverlay);
    }, 1500);
  });
  
  // Assemble everything
  content.appendChild(amountSection);
  content.appendChild(tabsContainer);
  
  // Add the tab panels
  Object.values(tabPanels).forEach(panel => {
    content.appendChild(panel);
  });
  
  content.appendChild(processButton);
  
  modal.appendChild(header);
  modal.appendChild(content);
  modalOverlay.appendChild(modal);
  
  // Add to DOM
  document.body.appendChild(modalOverlay);
}

/**
 * Generate AI recommendations for pricing
 * @param {Object} quote - The quote object
 * @returns {Object} Recommendations object
 */
function generateAIRecommendations(quote) {
  const recommendations = [];
  
  // Get real-time market data for competitive pricing analysis
  const currentMarketRate = marketRates[quote.jobType]?.[quote.region] || 85;
  const marketRateAdjustment = getMarketRateAdjustment(quote.jobType, quote.state);
  const adjustedMarketRate = currentMarketRate * marketRateAdjustment;
  
  // Experience level consideration
  const experienceLevelFactor = {
    'junior': 0.8,
    'intermediate': 1.0,
    'senior': 1.2,
    'expert': 1.4
  }[quote.experienceLevel] || 1.0;
  
  const competitiveRate = adjustedMarketRate * experienceLevelFactor;
  const userRate = quote.laborRate;
  const rateDifference = ((userRate - competitiveRate) / competitiveRate) * 100;
  
  // Add competitive pricing comparison
  if (Math.abs(rateDifference) <= 5) {
    recommendations.push(`Your rate of $${userRate.toFixed(2)}/hr is closely aligned with the competitive market rate of $${competitiveRate.toFixed(2)}/hr for a ${quote.experienceLevel} provider in ${quote.location}.`);
  } else if (rateDifference < -10) {
    recommendations.push(`Your rate of $${userRate.toFixed(2)}/hr is significantly below market average of $${competitiveRate.toFixed(2)}/hr for your experience level. Consider increasing by ${Math.abs(rateDifference).toFixed(0)}% to align with market rates.`);
    recommendations.push(`For ${quote.jobTypeDisplay} in ${quote.region} with ${quote.experienceLevel} experience level, providers typically charge between $${(competitiveRate * 0.9).toFixed(2)} and $${(competitiveRate * 1.1).toFixed(2)} per hour.`);
  } else if (rateDifference < 0) {
    recommendations.push(`Your rate of $${userRate.toFixed(2)}/hr is slightly below market average of $${competitiveRate.toFixed(2)}/hr. You might be leaving money on the table.`);
  } else if (rateDifference > 20) {
    recommendations.push(`Your rate of $${userRate.toFixed(2)}/hr is significantly higher (${rateDifference.toFixed(0)}%) than the competitive rate of $${competitiveRate.toFixed(2)}/hr. Ensure your service quality and unique value proposition justify this premium.`);
    recommendations.push(`To justify premium pricing in this market, emphasize your ${quote.experienceLevel} expertise and consider adding premium services not offered by competitors.`);
  } else if (rateDifference > 0) {
    recommendations.push(`Your rate of $${userRate.toFixed(2)}/hr is moderately above market average (${rateDifference.toFixed(0)}%). This positions you as a premium provider - ensure your service quality matches this positioning.`);
  }
  
  // Profit margin recommendations with target focus
  if (quote.actualProfitMargin < 15) {
    recommendations.push(`Your profit margin of ${quote.actualProfitMargin.toFixed(1)}% is below industry standard (20-30%). Consider adjusting your pricing structure or operational efficiency.`);
  } else if (quote.actualProfitMargin < quote.targetMargin - 5) {
    recommendations.push(`Your actual profit margin (${quote.actualProfitMargin.toFixed(1)}%) is below your target (${quote.targetMargin}%). Consider reducing material costs or increasing labor rates.`);
  } else if (quote.actualProfitMargin > 45) {
    recommendations.push(`Your profit margin of ${quote.actualProfitMargin.toFixed(1)}% is very high. While profitable, this may price you out of competitive bids. Consider offering value-adds or premium service guarantees.`);
  } else if (Math.abs(quote.actualProfitMargin - quote.targetMargin) <= 2) {
    recommendations.push(`Your actual profit margin of ${quote.actualProfitMargin.toFixed(1)}% is right on target with your goal of ${quote.targetMargin}%. Well structured pricing!`);
  }
  
  // Service-specific recommendations with competitor insights
  if (isBeautyService(quote.jobType)) {
    const serviceRecommendation = getBeautyServiceRecommendations(quote);
    recommendations.push(serviceRecommendation);
    
    if (quote.tier === 'premium') {
      recommendations.push(`Premium beauty clients typically spend 30-40% more on take-home products. Top competitors in ${quote.region} are differentiating with custom product packages as part of premium service.`);
    }
    
    // Add seasonal trend for beauty services
    const month = new Date().getMonth();
    if (month >= 3 && month <= 5) { // Spring
      recommendations.push(`Spring season trends show increased demand for ${quote.jobSubtype}. Consider offering spring special packages or promotions.`);
    } else if (month >= 9 && month <= 11) { // Fall
      recommendations.push(`Fall season data indicates clients are booking for holiday preparations. Offering advance booking discounts could increase your schedule fill rate.`);
    }
  } else if (isElectronicRepair(quote.jobType)) {
    recommendations.push(`Market analysis for ${quote.region} shows ${quote.jobTypeDisplay} providers are differentiating with warranty options. Consider offering tiered warranty plans (30/60/90 day).`);
    
    if (quote.jobType === 'cellphone_repair' && quote.jobSubtype === 'screen_replacement') {
      recommendations.push(`Screen replacement services in your area average $${getCellphoneRepairRate(quote.state).toFixed(2)}. Your price positions you at the ${rateDifference > 10 ? 'high' : rateDifference < -10 ? 'low' : 'mid'} range of the market.`);
    }
    
    if (quote.tier !== 'basic') {
      recommendations.push(`For non-basic electronic repair tiers, top providers in ${quote.region} offer data backup services as a value-add. Consider including this in your premium packages.`);
    }
  } else if (isAutomotiveRepair(quote.jobType)) {
    const autoServiceInsight = getAutomotiveServiceInsight(quote);
    recommendations.push(autoServiceInsight);
    
    if (quote.laborHours > 4) {
      recommendations.push(`For jobs exceeding 4 hours like yours, top-rated shops in ${quote.region} offer loaner vehicles or rideshare credits, increasing customer satisfaction by 65-70%.`);
    }
    
    // Car brand-specific insights
    if (quote.jobSubtype === 'engine_repair' || quote.jobSubtype === 'transmission') {
      recommendations.push(`For major repairs like ${quote.jobSubtype}, offering a multi-point inspection has been shown to increase follow-up service bookings by 40% according to industry data.`);
    }
  } else if (quote.jobType === 'plumber' || quote.jobType === 'electrician') {
    if (quote.tier === 'premium') {
      recommendations.push(`Premium ${quote.jobTypeDisplay} providers in ${quote.region} are differentiating with annual maintenance plans generating 30% more recurring revenue. Consider offering a service contract option.`);
    }
    
    // Permit and regulation insights
    const permitCost = getPermitCostEstimate(quote.jobType, quote.state);
    if (permitCost > 0) {
      recommendations.push(`Jobs in ${quote.location} typically require permits averaging $${permitCost}. Ensure you've factored this into your quote. Leading providers include permit handling as a value-add service.`);
    }
  }
  
  // Season-specific recommendations with real-time demand data
  const seasonalDemandFactor = getSeasonalDemandFactor(quote.jobType, new Date().getMonth(), quote.region);
  if (seasonalDemandFactor > 1.2) {
    recommendations.push(`Current seasonal demand for ${quote.jobTypeDisplay} is ${((seasonalDemandFactor - 1) * 100).toFixed(0)}% above annual average in ${quote.region}. Consider a slight premium during this high-demand period.`);
  } else if (seasonalDemandFactor < 0.8) {
    recommendations.push(`Current seasonal demand for ${quote.jobTypeDisplay} is ${((1 - seasonalDemandFactor) * 100).toFixed(0)}% below annual average. Consider offering incentives or package deals to attract customers in this slower period.`);
  }
  
  // Emergency pricing with competitive insights
  if (quote.emergency) {
    const avgEmergencyPremium = getEmergencyPremiumRate(quote.jobType, quote.region);
    const yourEmergencyPremium = 50; // Current fixed 50% premium
    
    if (Math.abs(yourEmergencyPremium - avgEmergencyPremium) > 15) {
      recommendations.push(`Your emergency rate premium of 50% differs from the regional average of ${avgEmergencyPremium}% for ${quote.jobTypeDisplay}. Consider adjusting to remain competitive while maximizing emergency service revenue.`);
    } else {
      recommendations.push(`Your emergency rate premium of 50% aligns well with the regional average of ${avgEmergencyPremium}% for ${quote.jobTypeDisplay}.`);
    }
  }
  
  // Materials recommendations with supplier insights
  if (quote.materialsCost > 0) {
    const materialCostRatio = quote.materialsCost / quote.total;
    const avgMaterialRatio = getAverageMaterialRatio(quote.jobType, quote.jobSubtype);
    
    if (Math.abs(materialCostRatio - avgMaterialRatio) > 0.1) {
      if (materialCostRatio > avgMaterialRatio) {
        recommendations.push(`Your materials cost ratio of ${(materialCostRatio * 100).toFixed(0)}% is higher than industry average of ${(avgMaterialRatio * 100).toFixed(0)}% for ${quote.jobSubtype}. Consider sourcing from alternative suppliers or explaining premium material benefits.`);
      } else {
        recommendations.push(`Your materials cost ratio of ${(materialCostRatio * 100).toFixed(0)}% is lower than industry average of ${(avgMaterialRatio * 100).toFixed(0)}% for ${quote.jobSubtype}. Ensure you're not compromising on quality, which could affect customer satisfaction.`);
      }
    }
  }
  
  // Customer retention strategy based on service type
  if (isServiceWithHighRepeatRate(quote.jobType)) {
    recommendations.push(`${quote.jobTypeDisplay} has a high repeat customer potential. Top providers in your area are offering first-time customer discounts to build long-term client relationships, with an average 70% retention rate.`);
  }
  
  // Add AI-powered business growth suggestion
  recommendations.push(getBusinessGrowthSuggestion(quote));
  
  // Quality over quantity - limit recommendations to most impactful ones
  return recommendations.slice(0, 5);
}

/**
 * Get market rate adjustment based on real-time economic data
 * @param {string} jobType - Type of job
 * @param {string} state - US state code
 * @returns {number} Adjustment factor
 */
function getMarketRateAdjustment(jobType, state) {
  // Simulate real-time economic data with regional adjustments
  const costOfLivingIndex = {
    'CA': 1.4, 'NY': 1.3, 'MA': 1.25, 'WA': 1.2, 'DC': 1.3, 
    'OR': 1.15, 'CO': 1.12, 'IL': 1.1, 'MD': 1.1, 'VA': 1.05,
    'FL': 1.0, 'TX': 0.95, 'AZ': 0.95, 'NC': 0.9, 'GA': 0.9,
    'TN': 0.85, 'OH': 0.85, 'MI': 0.85, 'IN': 0.8, 'MO': 0.8
  };
  
  // Default to 1.0 if state not found
  const costAdjustment = costOfLivingIndex[state] || 1.0;
  
  // Recent market trend adjustments by service type (simulating real-time data)
  const marketTrends = {
    'plumber': 1.05,         // 5% increase due to high demand
    'electrician': 1.08,     // 8% increase due to shortage of skilled workers
    'hvac': 1.06,            // 6% increase due to seasonal demand
    'automotive_repair': 1.02, // 2% increase due to moderate demand
    'computer_repair': 0.97,  // 3% decrease due to market saturation
    'hair_stylist': 1.03,     // 3% increase driven by post-pandemic demand
    'locksmith': 1.01,        // Stable with slight growth
    'makeup_artist': 1.04     // 4% growth in premium beauty services
  };
  
  // Default to 1.0 (no adjustment) if job type not found
  const trendAdjustment = marketTrends[jobType] || 1.0;
  
  // Combine regional cost of living with market trend
  return costAdjustment * trendAdjustment;
}

/**
 * Get cellphone repair average rate based on location
 * @param {string} state - US state code
 * @returns {number} Average repair rate
 */
function getCellphoneRepairRate(state) {
  const ratesByState = {
    'CA': 129, 'NY': 135, 'FL': 95, 'TX': 89, 'IL': 109,
    'PA': 99, 'OH': 85, 'GA': 92, 'NC': 90, 'MI': 88,
    'NJ': 115, 'VA': 105, 'WA': 110, 'AZ': 92, 'MA': 125,
    'TN': 85, 'IN': 82, 'MO': 80, 'MD': 110, 'WI': 85
  };
  
  return ratesByState[state] || 95; // Default rate if state not found
}

/**
 * Get specific insights for automotive service
 * @param {Object} quote - Quote object
 * @returns {string} Automotive service recommendation
 */
function getAutomotiveServiceInsight(quote) {
  const insights = {
    'oil_change': `Data shows ${quote.region} customers are willing to pay a premium of 15-20% for synthetic oil options. Consider offering tiered oil service packages.`,
    'brake_service': `For brake services, top-rated shops in your area are offering free brake inspections as lead generators, converting at 65% to paid jobs.`,
    'transmission': `Transmission work in ${quote.region} averages 20% higher labor rates than general repairs. Your current pricing is ${quote.laborRate > (marketRates['automotive_repair']?.[quote.region] || 85) * 1.2 ? 'aligned with' : 'below'} this premium.`,
    'engine_repair': `Engine repairs over $1000 have better customer acceptance when broken into diagnostic and repair phases. Consider a two-stage quoting process.`,
    'tire_service': `Tire services have the highest upsell potential. Regional data shows alignment services are purchased with 40% of tire replacements.`,
    'diagnostics': `Diagnostic fees in your region average $${((marketRates['automotive_repair']?.[quote.region] || 85) * 0.75).toFixed(2)}. Consider making this redeemable toward repairs when customers proceed with service.`
  };
  
  return insights[quote.jobSubtype] || `For ${quote.jobSubtype}, successful shops in ${quote.region} are offering free multi-point inspections with every service, resulting in 30% higher average order values.`;
}

/**
 * Get beauty service recommendations based on current trends
 * @param {Object} quote - Quote object
 * @returns {string} Beauty service recommendation
 */
function getBeautyServiceRecommendations(quote) {
  if (quote.jobType === 'hair_stylist') {
    return `Hair stylists in ${quote.region} with ${quote.experienceLevel} experience are differentiating with specialized techniques. Most competitive providers include a free consultation and style planning session valued at $${(quote.laborRate * 0.3).toFixed(2)}.`;
  } else if (quote.jobType === 'nail_technician') {
    return `Top nail technicians in your area are offering package deals with 15% savings for clients booking multiple services. Consider bundling your ${quote.jobSubtype} with complementary services.`;
  } else if (quote.jobType === 'makeup_artist') {
    return `For makeup services, providers with your experience level are typically including a touch-up kit valued at $25-35. This increases perceived value while only adding $12-15 in costs.`;
  } else if (quote.jobType === 'esthetician') {
    return `Estheticians in your region are seeing 30% higher rebooking rates when offering a complimentary product sample ($5-8 value) with facial services.`;
  }
  
  return `Beauty service market data for ${quote.region} shows clients value personalization. Leading providers are offering custom treatment plans and seeing 25% higher customer retention.`;
}

/**
 * Get permit cost estimates by service type and location
 * @param {string} jobType - Type of service
 * @param {string} state - US state code
 * @returns {number} Estimated permit cost
 */
function getPermitCostEstimate(jobType, state) {
  if (jobType === 'plumber') {
    const permitCosts = {
      'CA': 250, 'NY': 275, 'IL': 190, 'TX': 150, 'FL': 165,
      'PA': 175, 'OH': 140, 'WA': 210, 'MA': 220, 'NJ': 190
    };
    return permitCosts[state] || 165;
  } else if (jobType === 'electrician') {
    const permitCosts = {
      'CA': 220, 'NY': 245, 'IL': 180, 'TX': 140, 'FL': 155,
      'PA': 165, 'OH': 130, 'WA': 195, 'MA': 210, 'NJ': 185
    };
    return permitCosts[state] || 155;
  }
  
  return 0; // No permit required or minimal cost
}

/**
 * Get seasonal demand factor based on job type and month
 * @param {string} jobType - Type of service
 * @param {number} month - Month (0-11)
 * @param {string} region - US region
 * @returns {number} Demand factor (1.0 = average)
 */
function getSeasonalDemandFactor(jobType, month, region) {
  // Air conditioning demands peak in summer
  if (jobType === 'hvac' && (month >= 5 && month <= 8)) {
    return region === 'southeast' || region === 'southwest' ? 1.45 : 1.25;
  }
  
  // Heating demands peak in winter
  if (jobType === 'hvac' && (month <= 1 || month >= 10)) {
    return region === 'northeast' || region === 'midwest' ? 1.35 : 1.15;
  }
  
  // Plumbing emergencies increase in winter (frozen pipes)
  if (jobType === 'plumber' && (month <= 1 || month === 11)) {
    return region === 'northeast' || region === 'midwest' ? 1.3 : 1.1;
  }
  
  // Beauty services spike before holidays and summer
  if (isBeautyService(jobType)) {
    // Holiday season (November-December)
    if (month === 10 || month === 11) return 1.25;
    // Wedding season (May-September)
    if (month >= 4 && month <= 8) return 1.2;
    // Spring proms (March-April)
    if (month === 2 || month === 3) return 1.15;
  }
  
  // Landscaping demand peaks in spring/summer
  if (jobType === 'landscaper' && (month >= 3 && month <= 8)) {
    return 1.4;
  }
  
  // Automotive repair increases before summer road trips
  if (jobType === 'automotive_repair' && (month >= 3 && month <= 5)) {
    return 1.15;
  }
  
  return 1.0; // Default: average demand
}

/**
 * Get average emergency premium rate by service type and region
 * @param {string} jobType - Type of service
 * @param {string} region - US region
 * @returns {number} Average premium percentage
 */
function getEmergencyPremiumRate(jobType, region) {
  const emergencyRates = {
    'plumber': {
      'northeast': 75, 'midwest': 65, 'southeast': 60, 'southwest': 55, 'west': 70
    },
    'electrician': {
      'northeast': 70, 'midwest': 60, 'southeast': 55, 'southwest': 50, 'west': 65
    },
    'hvac': {
      'northeast': 65, 'midwest': 60, 'southeast': 70, 'southwest': 75, 'west': 60
    },
    'locksmith': {
      'northeast': 60, 'midwest': 50, 'southeast': 45, 'southwest': 45, 'west': 55
    },
    'automotive_repair': {
      'northeast': 65, 'midwest': 60, 'southeast': 55, 'southwest': 50, 'west': 60
    }
  };
  
  return emergencyRates[jobType]?.[region] || 50; // Default 50% if not found
}

/**
 * Get average material cost ratio for service type
 * @param {string} jobType - Type of service
 * @param {string} jobSubtype - Service subtype
 * @returns {number} Average ratio (0-1)
 */
function getAverageMaterialRatio(jobType, jobSubtype) {
  const materialRatios = {
    'plumber': {
      'fixture_installation': 0.6, 'pipe_repair': 0.4, 'water_heater': 0.7,
      'default': 0.5
    },
    'electrician': {
      'panel_upgrade': 0.6, 'lighting_install': 0.5, 'wiring_repair': 0.3,
      'default': 0.4
    },
    'hvac': {
      'installation': 0.7, 'ac_repair': 0.5, 'furnace_repair': 0.5,
      'default': 0.5
    },
    'automotive_repair': {
      'brake_service': 0.6, 'engine_repair': 0.4, 'transmission': 0.5,
      'default': 0.5
    },
    'cellphone_repair': {
      'screen_replacement': 0.7, 'battery_replacement': 0.6,
      'default': 0.6
    },
    'hair_stylist': {
      'color': 0.4, 'highlights': 0.45, 'treatment': 0.6,
      'default': 0.3
    },
    'default': 0.4
  };
  
  return materialRatios[jobType]?.[jobSubtype] || 
         materialRatios[jobType]?.['default'] || 
         materialRatios['default'];
}

/**
 * Display AI recommendations in a modal popup
 * @param {Array<string>} recommendations - List of AI recommendations
 * @param {string} tierName - The tier name for context
 */
function showAIRecommendations(recommendations, tierName) {
  // Create modal container with fade-in animation
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.right = '0';
  modalOverlay.style.bottom = '0';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.transition = 'background-color 0.3s ease';
  
  // Smooth fade-in animation
  setTimeout(() => {
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  }, 10);
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '550px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
  
  // Create header
  const header = document.createElement('div');
  header.style.padding = '16px 20px';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  title.textContent = `AI Price Insights - ${tierName} Quote`;
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.lineHeight = '1';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Create body
  const body = document.createElement('div');
  body.style.padding = '20px';
  
  // Add intro
  const intro = document.createElement('p');
  intro.textContent = 'Based on real-world market data, here are AI-powered insights for optimizing your quote:';
  intro.style.marginBottom = '16px';
  intro.style.fontSize = '14px';
  body.appendChild(intro);
  
  // Add recommendations
  const recommendationsList = document.createElement('ul');
  recommendationsList.style.paddingLeft = '20px';
  recommendationsList.style.marginBottom = '20px';
  
  recommendations.forEach(recommendation => {
    const item = document.createElement('li');
    item.textContent = recommendation;
    item.style.marginBottom = '12px';
    item.style.fontSize = '14px';
    item.style.lineHeight = '1.5';
    recommendationsList.appendChild(item);
  });
  
  body.appendChild(recommendationsList);
  
  // Add a disclaimer
  const disclaimer = document.createElement('p');
  disclaimer.textContent = 'These insights are based on current market trends in your region. Consider them suggestions rather than hard rules.';
  disclaimer.style.fontSize = '12px';
  disclaimer.style.color = '#6b7280';
  disclaimer.style.fontStyle = 'italic';
  disclaimer.style.marginTop = '20px';
  body.appendChild(disclaimer);
  
  // Add Apply Recommendations button
  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Recommendations';
  applyButton.style.backgroundColor = '#10b981';
  applyButton.style.color = 'white';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '6px';
  applyButton.style.padding = '10px 16px';
  applyButton.style.fontSize = '14px';
  applyButton.style.fontWeight = 'bold';
  applyButton.style.cursor = 'pointer';
  applyButton.style.width = '100%';
  applyButton.style.marginTop = '20px';
  applyButton.style.transition = 'all 0.2s ease';
  
  // Add hover effect
  applyButton.addEventListener('mouseenter', () => {
    applyButton.style.backgroundColor = '#0d9668';
  });
  
  applyButton.addEventListener('mouseleave', () => {
    applyButton.style.backgroundColor = '#10b981';
  });
  
  applyButton.addEventListener('click', () => {
    // Apply the recommendations to the quote
    const currentQuote = document.querySelector(`[data-tier="${tierName}"]`);
    if (currentQuote) {
      const quoteId = currentQuote.getAttribute('data-quote-id');
      const activeQuote = savedQuotes[quoteId];
      
      // Apply each recommendation to the active quote
      recommendations.forEach(rec => {
        if (rec.type === 'labor_rate') {
          activeQuote.laborRate = rec.suggestedValue;
        } else if (rec.type === 'profit_margin') {
          activeQuote.targetMargin = rec.suggestedValue;
        } else if (rec.type === 'materials') {
          activeQuote.materialsCost = rec.suggestedValue;
        }
      });
      
      // Recalculate and redraw the quote
      const updatedQuote = calculateQuote(activeQuote);
      savedQuotes[quoteId] = updatedQuote;
      
      // Redraw the quote card
      const container = document.getElementById('quote-tiers');
      if (container) {
        const existingCard = document.querySelector(`[data-tier="${tierName}"]`);
        if (existingCard) {
          existingCard.remove();
        }
        createQuoteCard(updatedQuote, tierName, container);
      }
    }
    
    // Show toast message (using the global toast system if available)
    if (window.showToast) {
      window.showToast('Recommendations applied successfully!', 'success');
    }
    document.body.removeChild(modalOverlay);
  });
  
  body.appendChild(applyButton);
  
  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(body);
  modalOverlay.appendChild(modalContent);
  
  // Close modal when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
  
  // Add to document
  document.body.appendChild(modalOverlay);
}

/**
 * Check if service type has high repeat customer rate
 * @param {string} jobType - Type of service
 * @returns {boolean} True if high repeat potential
 */
function isServiceWithHighRepeatRate(jobType) {
  const highRepeatServices = [
    'hair_stylist', 'nail_technician', 'makeup_artist', 'esthetician',
    'massage_therapist', 'automotive_repair', 'hvac', 'plumber',
    'landscaper', 'cleaning_services'
  ];
  
  return highRepeatServices.includes(jobType);
}

/**
 * Generate AI-powered business growth suggestion
 * @param {Object} quote - Quote object
 * @returns {string} Business growth suggestion
 */
function getBusinessGrowthSuggestion(quote) {
  const growthSuggestions = [
    `Based on market analysis, ${quote.jobTypeDisplay} providers increasing their online reviews by just 1 star average earn 20% more per job. Consider implementing a review request system.`,
    
    `Data shows ${quote.jobTypeDisplay} providers who offer financing options for jobs over $500 close 35% more sales. Consider partnering with financing providers.`,
    
    `Top-performing ${quote.jobTypeDisplay} businesses in ${quote.region} are generating 30% of revenue through recurring service agreements. Consider developing a membership model.`,
    
    `Service providers with your expertise level who target commercial clients report 40% higher average job values than residential-only providers. Consider expanding to commercial services.`,
    
    `Successful ${quote.jobTypeDisplay} providers in your region are increasing earnings by 25% through strategic partnerships with complementary service providers (${getComplementaryService(quote.jobType)}).`
  ];
  
  // Select a suggestion based on quote properties to ensure relevance
  const selection = (quote.total > 500) ? 1 : (quote.laborHours > 4) ? 2 : (quote.actualProfitMargin > 30) ? 3 : (quote.experienceLevel === 'expert' || quote.experienceLevel === 'senior') ? 4 : 0;
  
  return growthSuggestions[selection];
}

/**
 * Get complementary service type for partnerships
 * @param {string} jobType - Type of service
 * @returns {string} Complementary service description
 */
function getComplementaryService(jobType) {
  const complementaryServices = {
    'plumber': 'water damage restoration companies',
    'electrician': 'smart home installers',
    'hvac': 'insulation contractors',
    'automotive_repair': 'mobile detailing services',
    'locksmith': 'security system installers',
    'hair_stylist': 'makeup artists and photographers',
    'nail_technician': 'massage therapists',
    'makeup_artist': 'wedding planners and photographers',
    'esthetician': 'nutritionists and wellness coaches',
    'landscaper': 'pool service companies',
    'carpenter': 'interior designers',
    'painter': 'drywall contractors'
  };
  
  return complementaryServices[jobType] || 'related service providers';
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
  
  // Calculate subtotal
  const subtotal = laborCost + materialsCost;
  
  // Calculate profit based on target margin
  const targetMarginDecimal = data.targetMargin / 100;
  
  // Calculating cost basis (materials + labor) excluding tax
  const costBasis = laborCost + materialsCost;
  
  // For target margin calculation, we need to adjust price to achieve the exact margin percentage
  // Formula: price = cost / (1 - margin)
  const targetTotal = costBasis / (1 - targetMarginDecimal);
  
  // Tax is calculated on materials only
  const total = targetTotal + materialsTax;
  
  // Recalculate actual profit and margin after tax adjustment
  // Profit should be calculated based on the pre-tax total amount
  // Revenue is targetTotal (pre-tax), cost is costBasis
  const profit = targetTotal - costBasis;
  const actualProfitMargin = (profit / targetTotal) * 100;
  
  // Profit assessment based on target margin
  let profitAssessment;
  if (Math.abs(actualProfitMargin - data.targetMargin) <= 1) {
    profitAssessment = `On target profit margin of ${data.targetMargin}%.`;
  } else if (actualProfitMargin < data.targetMargin) {
    profitAssessment = `Margin slightly below target (${actualProfitMargin.toFixed(1)}% vs target ${data.targetMargin}%).`;
  } else {
    profitAssessment = `Margin slightly above target (${actualProfitMargin.toFixed(1)}% vs target ${data.targetMargin}%).`;
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
    preTaxTotal: targetTotal,  // Include pre-tax total for correct profit margin calculations
    total,
    targetMargin: data.targetMargin,
    actualProfitMargin,
    profit,
    profitAssessment,
    taxRate
  };
}

/**
 * Display multiple quote options in the UI
 * @param {Object} quotes - The quote options
 */
function displayMultiQuoteResults(quotes) {
  const resultsContainer = document.getElementById('quote-results');
  resultsContainer.style.display = 'block';
  resultsContainer.innerHTML = '';
  
  // Create header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  const title = document.createElement('h3');
  title.textContent = 'Service Quote Options';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = `${quotes.commonData.jobTypeDisplay} - ${quotes.commonData.jobSubtypeDisplay} in ${quotes.commonData.location}`;
  subtitle.style.fontSize = '16px';
  subtitle.style.color = 'var(--color-text-secondary)';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  // Display Provider Experience Level if available
  if (quotes.basic.experienceLevel) {
    const experienceLevelMap = {
      'junior': 'Junior Provider (1-2 years)',
      'intermediate': 'Intermediate Provider (3-5 years)',
      'senior': 'Senior Provider (6-10 years)',
      'expert': 'Expert Provider (10+ years)'
    };
    
    const experienceText = experienceLevelMap[quotes.basic.experienceLevel] || 'Professional Provider';
    const experienceInfo = document.createElement('p');
    experienceInfo.textContent = `Provider Experience: ${experienceText}`;
    experienceInfo.style.fontSize = '15px';
    experienceInfo.style.marginTop = '4px';
    experienceInfo.style.color = 'var(--color-text)';
    header.appendChild(experienceInfo);
  }
  
  // Display Product Quantity if applicable
  if ((isProductService(quotes.basic.jobType) && quotes.basic.quantity > 1) || 
      (quotes.basic.jobType === 'locksmith' && quotes.basic.jobSubtype === 'rekey')) {
    const unitType = (quotes.basic.jobType === 'locksmith' && quotes.basic.jobSubtype === 'rekey') ? 'lock cylinders' : 'units';
    const quantityInfo = document.createElement('p');
    quantityInfo.textContent = `Product Quantity: ${quotes.basic.quantity} ${unitType}`;
    quantityInfo.style.fontSize = '15px';
    quantityInfo.style.marginTop = '4px';
    quantityInfo.style.color = 'var(--color-text)';
    header.appendChild(quantityInfo);
  }
  
  resultsContainer.appendChild(header);
  
  // Create quotes container
  const quotesContainer = document.createElement('div');
  quotesContainer.style.display = 'flex';
  quotesContainer.style.gap = '16px';
  quotesContainer.style.flexWrap = 'wrap';
  
  // Create each quote card
  createQuoteCard(quotes.basic, 'Basic', '#f9fafb', quotesContainer);
  createQuoteCard(quotes.standard, 'Standard', '#f0f9ff', quotesContainer, true);
  createQuoteCard(quotes.premium, 'Premium', '#f0f7f5', quotesContainer);
  
  resultsContainer.appendChild(quotesContainer);
  
  // Add disclaimer
  const disclaimer = document.createElement('p');
  disclaimer.textContent = 'All quotes are estimates and may vary based on actual job conditions. Emergency service includes a 50% premium rate.';
  disclaimer.style.fontSize = '12px';
  disclaimer.style.color = 'var(--color-text-secondary, #6b7280)';
  disclaimer.style.marginTop = '24px';
  resultsContainer.appendChild(disclaimer);
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Create a quote card for the specified tier
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name to display
 * @param {string} bgColor - Background color
 * @param {HTMLElement} container - Container to append the card to
 * @param {boolean} recommended - Whether this is the recommended option
 */
/**
 * Determines if the job type is a beauty or personal care service
 * @param {string} jobType - The job type
 * @returns {boolean} True if it's a beauty service
 */
/**
 * Determines if the job type is a beauty service
 * @param {string} jobType - The job type
 * @returns {boolean} True if it's a beauty service
 */
function isBeautyService(jobType) {
  const beautyServices = [
    'beauty_services', 'hair_stylist', 'nail_technician', 
    'makeup_artist', 'esthetician', 'massage_therapist', 
    'spa_services', 'eyebrow_threading', 'waxing_services',
    'tanning_services', 'lash_extensions', 'facial_services'
  ];
  return beautyServices.includes(jobType);
}

/**
 * Determines if the job type is an electronic repair service
 * @param {string} jobType - The job type
 * @returns {boolean} True if it's an electronic repair service
 */
function isElectronicRepair(jobType) {
  const electronicRepairs = [
    'electronic_repair', 'cellphone_repair', 'computer_repair',
    'tv_repair', 'appliance_repair'
  ];
  return electronicRepairs.includes(jobType);
}

/**
 * Determines if the job type is an automotive repair service
 * @param {string} jobType - The job type
 * @returns {boolean} True if it's an automotive repair service
 */
function isAutomotiveRepair(jobType) {
  return jobType === 'automotive_repair';
}

/**
 * Determines if the job type is a product-based service
 * @param {string} jobType - The job type
 * @returns {boolean} True if it's a product-based service
 */
function isProductService(jobType) {
  const productServices = [
    'locksmith', 
    'appliance_repair', 
    'cellphone_repair', 
    'computer_repair', 
    'tv_repair'
  ];
  return productServices.includes(jobType);
}

/**
 * Generate features based on price tier, actual price, experience level, and quantity
 * This creates more realistic features that properly reflect the quote value
 * @param {string} jobType - Type of job/service
 * @param {string} tier - Service tier (basic, standard, premium)
 * @param {number} total - Total price of the quote
 * @param {string} experienceLevel - Provider experience level
 * @param {number} quantity - Product quantity (for product services)
 * @returns {string[]} List of features appropriate for the quote
 */
function getPriceAwareFeatures(jobType, tier, total, experienceLevel, quantity) {
  // Base features based on the tier
  let baseFeatures = [];
  switch (tier) {
    case 'basic':
      baseFeatures = getBasicFeatures(jobType);
      break;
    case 'standard':
      baseFeatures = getStandardFeatures(jobType);
      break;
    case 'premium':
      baseFeatures = getPremiumFeatures(jobType);
      break;
  }
  
  // Price-based features (more expensive quotes get better features)
  const priceFeatures = [];
  
  // Price thresholds - different for different service types
  let lowPriceThreshold = 100;
  let midPriceThreshold = 250;
  let highPriceThreshold = 500;
  
  // Adjust thresholds based on service type
  if (isBeautyService(jobType)) {
    lowPriceThreshold = 75;
    midPriceThreshold = 150;
    highPriceThreshold = 300;
  } else if (isElectronicRepair(jobType)) {
    lowPriceThreshold = 120;
    midPriceThreshold = 300;
    highPriceThreshold = 600;
  } else if (isAutomotiveRepair(jobType)) {
    lowPriceThreshold = 150;
    midPriceThreshold = 400;
    highPriceThreshold = 800;
  }
  
  // Add price-specific features that are directly relevant to the job type
  if (total >= highPriceThreshold) {
    // High-price features - only add the ones matching the job type
    if (isBeautyService(jobType)) {
      priceFeatures.push('Complimentary take-home product kit');
      priceFeatures.push('VIP scheduling priority');
    } else if (isElectronicRepair(jobType)) {
      priceFeatures.push('Extended 1-year parts and labor warranty');
      priceFeatures.push('Priority technical support');
    } else if (isAutomotiveRepair(jobType)) {
      priceFeatures.push('Courtesy vehicle during service');
      priceFeatures.push('Comprehensive vehicle inspection included');
    } else {
      // Only add generic features when we don't have job-specific ones
      priceFeatures.push('Expedited service guarantee');
      priceFeatures.push('Premium material upgrades included');
    }
  } else if (total >= midPriceThreshold) {
    // Mid-price features - only add the ones matching the job type
    if (isBeautyService(jobType)) {
      priceFeatures.push('Premium product application');
    } else if (isElectronicRepair(jobType)) {
      priceFeatures.push('90-day warranty on parts and labor');
    } else if (isAutomotiveRepair(jobType)) {
      priceFeatures.push('Complimentary vehicle health report');
    } else {
      // Only add generic features when we don't have job-specific ones
      priceFeatures.push('Quality assurance follow-up');
    }
  }
  
  // Experience-based features - job specific only
  const experienceFeatures = [];
  if (experienceLevel === 'expert') {
    if (isBeautyService(jobType)) {
      experienceFeatures.push('Service by master-certified beauty professional');
    } else if (isElectronicRepair(jobType)) {
      experienceFeatures.push('Repair by certified master technician');
    } else if (isAutomotiveRepair(jobType)) {
      experienceFeatures.push('Service by ASE Master certified technician');
    } else {
      // Only add generic features when we don't have job-specific ones
      experienceFeatures.push('Work completed by industry-certified expert');
    }
  } else if (experienceLevel === 'senior') {
    // Make this service-specific too
    if (isBeautyService(jobType)) {
      experienceFeatures.push('Service by senior beauty professional with 10+ years experience');
    } else if (isElectronicRepair(jobType)) {
      experienceFeatures.push('Service by senior repair technician with 10+ years experience');
    } else if (isAutomotiveRepair(jobType)) {
      experienceFeatures.push('Service by senior automotive specialist with 10+ years experience');
    } else {
      experienceFeatures.push('Service by senior professional with 10+ years experience');
    }
  }
  
  // Quantity-based features (only for product services)
  const quantityFeatures = [];
  if (isProductService(jobType) && quantity > 1) {
    if (quantity >= 5) {
      quantityFeatures.push(`Multi-unit discount: ${Math.min(25, quantity * 5)}% savings`);
      quantityFeatures.push('Bulk service efficiency guarantee');
    } else if (quantity >= 3) {
      quantityFeatures.push(`Multi-unit discount: ${quantity * 5}% savings`);
    } else if (quantity === 2) {
      quantityFeatures.push('Second unit discount applied');
    }
  }
  
  // Combine all features, removing duplicates and ensuring they're job-specific
  const allFeatures = [...baseFeatures, ...priceFeatures, ...experienceFeatures, ...quantityFeatures];
  return [...new Set(allFeatures)]; // Remove any duplicates
}

function createQuoteCard(quote, tierName, bgColor, container, recommended = false) {
  // Create card
  const card = document.createElement('div');
  card.style.flex = '1';
  card.style.minWidth = '280px';
  card.style.border = recommended ? '2px solid var(--color-primary, #4F46E5)' : '1px solid var(--color-border, #e5e7eb)';
  card.style.borderRadius = '8px';
  card.style.overflow = 'hidden';
  card.style.backgroundColor = bgColor;
  card.style.boxShadow = recommended ? '0 4px 12px rgba(79, 70, 229, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)';
  
  // Card header
  const cardHeader = document.createElement('div');
  cardHeader.style.padding = '16px';
  cardHeader.style.backgroundColor = recommended ? 'var(--color-primary, #4F46E5)' : '#fff';
  cardHeader.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  
  const tierTitle = document.createElement('h4');
  tierTitle.textContent = tierName;
  tierTitle.style.fontSize = '18px';
  tierTitle.style.fontWeight = 'bold';
  tierTitle.style.marginBottom = '4px';
  tierTitle.style.color = recommended ? '#fff' : 'var(--color-text, #111827)';
  
  const price = document.createElement('div');
  price.style.fontSize = '24px';
  price.style.fontWeight = 'bold';
  price.style.marginBottom = '8px';
  price.style.color = recommended ? '#fff' : 'var(--color-text, #111827)';
  price.textContent = `$${quote.total.toFixed(2)}`;
  
  // Make price editable if quote is editable
  if (quote.editable) {
    price.style.cursor = 'pointer';
    price.title = 'Click to edit price';
    
    price.addEventListener('click', () => {
      const newPrice = prompt('Enter new total price:', quote.total.toFixed(2));
      if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
        const newPriceValue = parseFloat(newPrice);
        if (newPriceValue >= 0) {
          quote.total = newPriceValue;
          price.textContent = `$${newPriceValue.toFixed(2)}`;
          if (window.showToast) {
            window.showToast('Price updated', 'success');
          }
        }
      }
    });
  }
  
  // Recommended badge
  if (recommended) {
    const badge = document.createElement('span');
    badge.textContent = 'RECOMMENDED';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = 'bold';
    badge.style.backgroundColor = '#ffffff';
    badge.style.color = 'var(--color-primary, #4F46E5)';
    badge.style.padding = '2px 8px';
    badge.style.borderRadius = '9999px';
    badge.style.marginLeft = '8px';
    badge.style.display = 'inline-block';
    badge.style.verticalAlign = 'middle';
    tierTitle.appendChild(badge);
  }
  
  const description = document.createElement('p');
  description.textContent = quote.description;
  description.style.fontSize = '14px';
  description.style.color = recommended ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary, #6b7280)';
  
  // Make description editable if quote is editable
  if (quote.editable) {
    description.style.cursor = 'pointer';
    description.title = 'Click to edit description';
    
    description.addEventListener('click', () => {
      const newDescription = prompt('Edit service description:', quote.description);
      if (newDescription !== null) {
        quote.description = newDescription;
        description.textContent = newDescription;
        if (window.showToast) {
          window.showToast('Description updated', 'success');
        }
      }
    });
  }
  
  cardHeader.appendChild(tierTitle);
  cardHeader.appendChild(price);
  cardHeader.appendChild(description);
  card.appendChild(cardHeader);
  
  // Card body
  const cardBody = document.createElement('div');
  cardBody.style.padding = '16px';
  
  // Add cost breakdown section
  const breakdownSection = document.createElement('div');
  breakdownSection.style.marginBottom = '20px';
  breakdownSection.style.padding = '12px';
  breakdownSection.style.backgroundColor = 'rgba(0,0,0,0.02)';
  breakdownSection.style.borderRadius = '6px';
  breakdownSection.style.border = '1px dashed #e5e7eb';
  
  const breakdownTitleElement = document.createElement('h5');
  breakdownTitleElement.textContent = 'Cost Breakdown';
  breakdownTitleElement.style.fontSize = '15px';
  breakdownTitleElement.style.fontWeight = 'bold';
  breakdownTitleElement.style.marginBottom = '10px';
  breakdownTitleElement.style.display = 'flex';
  breakdownTitleElement.style.justifyContent = 'space-between';
  breakdownTitleElement.style.alignItems = 'center';
  
  // Add toggle button for breakdown
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = '▼';
  toggleButton.title = 'Toggle breakdown';
  toggleButton.style.background = 'none';
  toggleButton.style.border = 'none';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.fontSize = '12px';
  toggleButton.style.color = 'var(--color-primary, #4F46E5)';
  breakdownTitleElement.appendChild(toggleButton);
  
  const breakdownContent = document.createElement('div');
  breakdownContent.style.fontSize = '14px';
  
  // Make breakdown content collapsible
  let breakdownVisible = false;
  breakdownContent.style.display = 'none';
  
  toggleButton.addEventListener('click', () => {
    breakdownVisible = !breakdownVisible;
    breakdownContent.style.display = breakdownVisible ? 'block' : 'none';
    toggleButton.innerHTML = breakdownVisible ? '▲' : '▼';
  });
  
  // Create editable breakdown items
  const createEditableItem = (label, value, unit = '$', property = null) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '6px';
    
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    
    const valueEl = document.createElement('span');
    valueEl.textContent = `${unit}${typeof value === 'number' ? value.toFixed(2) : value}`;
    
    // Make value editable if property is provided
    if (property !== null && quote.editable) {
      valueEl.style.cursor = 'pointer';
      valueEl.style.textDecoration = 'underline dotted';
      valueEl.title = `Click to edit ${label.toLowerCase()}`;
      
      valueEl.addEventListener('click', () => {
        let currentValue = property.includes('.') 
          ? quote[property.split('.')[0]][property.split('.')[1]] 
          : quote[property];
          
        const newValue = prompt(`Enter new ${label.toLowerCase()}:`, currentValue);
        
        if (newValue !== null && !isNaN(parseFloat(newValue))) {
          const parsedValue = parseFloat(newValue);
          
          // Update the quote object
          if (property.includes('.')) {
            const [obj, prop] = property.split('.');
            quote[obj][prop] = parsedValue;
          } else {
            quote[property] = parsedValue;
          }
          
          // Update display
          valueEl.textContent = `${unit}${parsedValue.toFixed(2)}`;
          
          // Recalculate totals
          recalculateQuote(quote);
          
          // Update the price display
          price.textContent = `$${quote.total.toFixed(2)}`;
          
          // Show toast
          if (window.showToast) {
            window.showToast(`${label} updated to ${unit}${parsedValue.toFixed(2)}`, 'success');
          }
        }
      });
    }
    
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    return row;
  };
  
  // Function to recalculate quote totals after editing
  const recalculateQuote = (quote) => {
    // Calculate updated costs
    const laborCost = quote.laborRate * quote.laborHours;
    const costBasis = laborCost + quote.materialsCost;
    const targetMarginDecimal = quote.targetMargin / 100;
    
    // Calculate pre-tax total to achieve target margin
    const preTaxTotal = costBasis / (1 - targetMarginDecimal);
    
    // Calculate tax and final total
    const materialsTax = quote.materialsCost * quote.taxRate;
    const total = preTaxTotal + materialsTax;
    
    // Calculate profit and margin
    const profit = preTaxTotal - costBasis;
    const actualProfitMargin = (profit / preTaxTotal) * 100;
    
    // Update quote object
    quote.laborCost = laborCost;
    quote.preTaxTotal = preTaxTotal;
    quote.materialsTax = materialsTax;
    quote.total = total;
    quote.profit = profit;
    quote.actualProfitMargin = actualProfitMargin;
    
    // Return updated quote (for chaining)
    return quote;
  };
  
  // Create breakdown items for both customer and provider costs
  breakdownContent.appendChild(createEditableItem('Labor Hours', quote.laborHours, '', 'laborHours'));
  breakdownContent.appendChild(createEditableItem('Labor Rate', quote.laborRate, '$', 'laborRate'));
  breakdownContent.appendChild(createEditableItem('Labor Cost', quote.laborCost));
  breakdownContent.appendChild(createEditableItem('Materials Cost', quote.materialsCost, '$', 'materialsCost'));
  
  // Add separator
  const separator = document.createElement('hr');
  separator.style.margin = '8px 0';
  separator.style.border = 'none';
  separator.style.borderTop = '1px dashed #e5e7eb';
  breakdownContent.appendChild(separator);
  
  // Add provider cost section
  const providerTitle = document.createElement('div');
  providerTitle.textContent = 'Provider Costs & Profit';
  providerTitle.style.fontWeight = 'bold';
  providerTitle.style.marginTop = '8px';
  providerTitle.style.marginBottom = '6px';
  breakdownContent.appendChild(providerTitle);
  
  breakdownContent.appendChild(createEditableItem('Cost Basis (Labor + Materials)', quote.laborCost + quote.materialsCost));
  breakdownContent.appendChild(createEditableItem('Target Margin', quote.targetMargin, '%', 'targetMargin'));
  breakdownContent.appendChild(createEditableItem('Actual Margin', quote.actualProfitMargin.toFixed(1), '%'));
  breakdownContent.appendChild(createEditableItem('Profit Amount', quote.profit));
  
  // Add separator
  const separator2 = document.createElement('hr');
  separator2.style.margin = '8px 0';
  separator2.style.border = 'none';
  separator2.style.borderTop = '1px dashed #e5e7eb';
  breakdownContent.appendChild(separator2);
  
  // Add customer cost section
  const customerTitle = document.createElement('div');
  customerTitle.textContent = 'Customer Costs';
  customerTitle.style.fontWeight = 'bold';
  customerTitle.style.marginTop = '8px';
  customerTitle.style.marginBottom = '6px';
  breakdownContent.appendChild(customerTitle);
  
  breakdownContent.appendChild(createEditableItem('Pre-tax Subtotal', quote.preTaxTotal));
  breakdownContent.appendChild(createEditableItem('Tax Rate', (quote.taxRate * 100).toFixed(1), '%', 'taxRate'));
  breakdownContent.appendChild(createEditableItem('Materials Tax', quote.materialsTax));
  breakdownContent.appendChild(createEditableItem('Total', quote.total, '$'));
  
  // Add AI insights button
  const aiInsightsBtn = document.createElement('button');
  aiInsightsBtn.textContent = '💡 AI Price Insights';
  aiInsightsBtn.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  aiInsightsBtn.style.color = 'white';
  aiInsightsBtn.style.border = 'none';
  aiInsightsBtn.style.borderRadius = '4px';
  aiInsightsBtn.style.padding = '6px 10px';
  aiInsightsBtn.style.fontSize = '12px';
  aiInsightsBtn.style.cursor = 'pointer';
  aiInsightsBtn.style.marginTop = '10px';
  aiInsightsBtn.style.width = '100%';
  
  aiInsightsBtn.addEventListener('click', () => {
    // Generate and show AI recommendations
    const recommendations = generateAIRecommendations(quote);
    showAIRecommendations(recommendations, tierName);
  });
  
  breakdownContent.appendChild(aiInsightsBtn);
  
  // Assemble breakdown section
  breakdownSection.appendChild(breakdownTitleElement);
  breakdownSection.appendChild(breakdownContent);
  cardBody.appendChild(breakdownSection);
  
  // Features list with toggle for itemized costs
  const featuresHeader = document.createElement('div');
  featuresHeader.style.display = 'flex';
  featuresHeader.style.justifyContent = 'space-between';
  featuresHeader.style.alignItems = 'center';
  featuresHeader.style.marginBottom = '10px';
  
  const featuresTitle = document.createElement('h5');
  featuresTitle.textContent = 'Features & Services';
  featuresTitle.style.fontSize = '15px';
  featuresTitle.style.fontWeight = 'bold';
  featuresTitle.style.margin = '0';
  
  // Create toggle for itemized costs
  const toggleContainer = document.createElement('div');
  toggleContainer.style.display = 'flex';
  toggleContainer.style.alignItems = 'center';
  toggleContainer.style.fontSize = '12px';
  
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = 'Show itemized costs';
  toggleLabel.style.marginRight = '8px';
  
  const toggleSwitch = document.createElement('input');
  toggleSwitch.type = 'checkbox';
  toggleSwitch.style.cursor = 'pointer';
  
  toggleContainer.appendChild(toggleLabel);
  toggleContainer.appendChild(toggleSwitch);
  
  featuresHeader.appendChild(featuresTitle);
  featuresHeader.appendChild(toggleContainer);
  
  cardBody.appendChild(featuresHeader);
  
  // Initialize feature costs based on quote properties
  const featureCosts = {
    // Initialize feature costs intelligently based on the quote
    serviceCost: quote.laborCost * 0.3,
    materialsCost: quote.materialsCost * 0.3,
    serviceFee: quote.total * 0.05,
    warrantyFee: tierName === 'Premium' ? quote.total * 0.08 : (tierName === 'Standard' ? quote.total * 0.05 : 0),
    consultationFee: tierName === 'Premium' ? 35 : (tierName === 'Standard' ? 25 : 15),
    emergencyFee: quote.emergency ? quote.total * 0.1 : 0,
    expertiseFee: quote.experienceLevel === 'expert' ? 45 : (quote.experienceLevel === 'senior' ? 35 : 20),
    insuranceCost: tierName === 'Premium' ? 30 : (tierName === 'Standard' ? 20 : 10),
    supportFee: tierName === 'Premium' ? 25 : (tierName === 'Standard' ? 15 : 5)
  };
  
  const featuresList = document.createElement('ul');
  featuresList.style.listStyleType = 'none';
  featuresList.style.padding = '0';
  featuresList.style.marginBottom = '16px';
  
  // Store original features for reference
  const originalFeatures = [...quote.features];
  
  // Function to update the features list with or without costs
  const updateFeaturesList = (showCosts) => {
    // Clear the current list
    featuresList.innerHTML = '';
    
    // Filter to show only the most relevant high-value features
    // This addresses the requirement to only show high-value feature details
    const displayFeatures = originalFeatures.slice(0, 5);
    
    displayFeatures.forEach((feature, index) => {
      const item = document.createElement('li');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'flex-start';
      item.style.marginBottom = '8px';
      item.style.fontSize = '14px';
      
      const featureContainer = document.createElement('div');
      featureContainer.style.display = 'flex';
      featureContainer.style.flexGrow = '1';
      
      const checkIcon = document.createElement('span');
      checkIcon.innerHTML = '✓';
      checkIcon.style.color = 'var(--color-primary, #4F46E5)';
      checkIcon.style.marginRight = '8px';
      checkIcon.style.fontWeight = 'bold';
      
      const text = document.createElement('span');
      text.textContent = feature;
      
      featureContainer.appendChild(checkIcon);
      featureContainer.appendChild(text);
      item.appendChild(featureContainer);
      
      // Add cost if itemized costs are shown
      if (showCosts) {
        // Assign a cost to each feature based on feature index
        const costKeys = Object.keys(featureCosts);
        const costKey = costKeys[index % costKeys.length];
        const cost = featureCosts[costKey] / Math.min(originalFeatures.length, 5);
        
        // Add cost object to quote if it doesn't exist
        if (!quote.featureCosts) {
          quote.featureCosts = [];
        }
        
        // Ensure we have a cost for this feature
        if (!quote.featureCosts[index]) {
          quote.featureCosts[index] = cost;
        }
        
        const costSpan = document.createElement('span');
        costSpan.textContent = `$${quote.featureCosts[index].toFixed(2)}`;
        costSpan.style.fontWeight = '500';
        costSpan.style.fontSize = '13px';
        costSpan.style.marginLeft = '10px';
        costSpan.setAttribute('data-feature-index', index);
        
        // Make cost editable if quote is editable
        if (quote.editable) {
          costSpan.style.cursor = 'pointer';
          costSpan.style.textDecoration = 'underline dotted';
          costSpan.title = 'Click to edit cost';
          
          costSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentCost = quote.featureCosts[index];
            const newCost = prompt(`Enter new cost for "${feature}":`, currentCost.toFixed(2));
            
            if (newCost !== null && !isNaN(parseFloat(newCost))) {
              const parsedCost = parseFloat(newCost);
              if (parsedCost >= 0) {
                // Update the cost
                quote.featureCosts[index] = parsedCost;
                costSpan.textContent = `$${parsedCost.toFixed(2)}`;
                
                // Recalculate total based on feature costs
                const totalFeatureCost = quote.featureCosts.reduce((sum, cost) => sum + cost, 0);
                
                // Update quote object
                const oldMaterialsCost = quote.materialsCost;
                quote.materialsCost = totalFeatureCost;
                
                // Recalculate the quote
                recalculateQuote(quote);
                
                // Update price display
                price.textContent = `$${quote.total.toFixed(2)}`;
                
                // Show toast
                if (window.showToast) {
                  window.showToast(`Feature cost updated - Quote recalculated`, 'success');
                }
                
                // Update breakdown items if they exist
                const breakdownItems = document.querySelectorAll(`[data-quote-id="${quote.id}"] [data-breakdown-item]`);
                breakdownItems.forEach(item => {
                  const property = item.getAttribute('data-breakdown-item');
                  const value = property.includes('.') 
                    ? quote[property.split('.')[0]][property.split('.')[1]] 
                    : quote[property];
                  
                  if (typeof value === 'number') {
                    item.textContent = `$${value.toFixed(2)}`;
                  } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                    item.textContent = `$${parseFloat(value).toFixed(2)}`;
                  }
                });
              }
            }
          });
        }
        
        item.appendChild(costSpan);
        
        // Make the item look more like a cost item
        item.style.padding = '4px 8px';
        item.style.backgroundColor = 'rgba(0,0,0,0.02)';
        item.style.borderRadius = '4px';
        item.style.marginBottom = '8px';
      }
      
      // Add edit controls if quote is editable
      if (quote.editable) {
        const controls = document.createElement('div');
        controls.style.display = 'none';
        controls.style.alignItems = 'center';
      
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit feature';
        editBtn.style.background = 'none';
        editBtn.style.border = 'none';
        editBtn.style.color = 'var(--color-primary, #4F46E5)';
        editBtn.style.cursor = 'pointer';
        editBtn.style.marginRight = '4px';
        editBtn.style.fontSize = '14px';
      
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newFeature = prompt('Edit feature:', feature);
          if (newFeature !== null && newFeature.trim() !== '') {
            quote.features[index] = newFeature.trim();
            text.textContent = newFeature.trim();
            if (window.showToast) {
              window.showToast('Feature updated', 'success');
            }
          }
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Remove feature';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = '#ef4444';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '16px';
      
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Remove this feature?')) {
            quote.features.splice(index, 1);
            item.remove();
            if (window.showToast) {
              window.showToast('Feature removed', 'success');
            }
          }
        });
        
        controls.appendChild(editBtn);
        controls.appendChild(deleteBtn);
        item.appendChild(controls);
        
        // Show controls on hover
        item.addEventListener('mouseenter', () => {
          controls.style.display = 'flex';
        });
        
        item.addEventListener('mouseleave', () => {
          controls.style.display = 'none';
        });
    }
    
    featuresList.appendChild(item);
  });
  
  // Add itemized cost calculations if toggled on
  if (showCosts) {
    // Add a section header for the cost breakdown
    const breakdownHeader = document.createElement('li');
    breakdownHeader.style.paddingTop = '12px';
    breakdownHeader.style.marginTop = '8px';
    breakdownHeader.style.marginBottom = '8px';
    breakdownHeader.style.borderTop = '1px dashed var(--color-border-light, #e5e7eb)';
    breakdownHeader.style.fontSize = '14px';
    breakdownHeader.style.fontWeight = '600';
    breakdownHeader.style.color = 'var(--color-text-secondary, #4b5563)';
    breakdownHeader.textContent = 'Feature Cost Breakdown';
    featuresList.appendChild(breakdownHeader);
    
    // Calculate the total of all feature costs
    let featureTotal = 0;
    const featureCostItems = [];
    
    displayFeatures.forEach((feature, index) => {
      // Use the existing quote.featureCosts values if available, otherwise calculate fresh
      let cost;
      let costKey;
      
      if (quote.featureCosts && quote.featureCosts[index] !== undefined) {
        // Use the existing cost that may have been edited by the user
        cost = quote.featureCosts[index];
        // Get the cost key from the original mapping or use a default
        const costKeys = Object.keys(featureCosts);
        costKey = costKeys[index % costKeys.length];
      } else {
        // Calculate a fresh cost if none exists
        const costKeys = Object.keys(featureCosts);
        costKey = costKeys[index % costKeys.length];
        cost = featureCosts[costKey] / Math.min(originalFeatures.length, 5);
        
        // Initialize feature costs array if it doesn't exist
        if (!quote.featureCosts) {
          quote.featureCosts = [];
        }
        
        // Store the cost for future reference
        quote.featureCosts[index] = cost;
      }
      
      featureTotal += cost;
      
      // Store the cost with feature name for itemized display
      featureCostItems.push({
        feature: feature,
        costName: costKey,
        cost: cost
      });
    });
    
    // Add itemized feature costs
    featureCostItems.forEach((item, index) => {
      const costItem = document.createElement('li');
      costItem.style.display = 'flex';
      costItem.style.justifyContent = 'space-between';
      costItem.style.padding = '4px 8px';
      costItem.style.fontSize = '13px';
      costItem.className = 'feature-cost-item';
      costItem.setAttribute('data-feature-index', index);
      
      const costLabel = document.createElement('span');
      // Format the cost key for display (e.g., "serviceCost" -> "Service Cost") 
      // with special handling to avoid duplicate "Service" labels
      let formattedCostName = item.costName
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .replace(/Cost$|Fee$/i, '') // Remove "Cost" or "Fee" suffix
        .trim();
        
      // Prevent duplicate "Service" labels by making them more specific
      if (formattedCostName === 'Service') {
        // Use the feature name instead if available
        if (item.feature) {
          formattedCostName = item.feature;
        } else {
          // Or use "Base Service" if this is a serviceCost
          formattedCostName = 'Base Service';
        }
      }
      
      costLabel.textContent = `${formattedCostName}`;
      costLabel.style.color = 'var(--color-text-secondary, #4b5563)';
      
      const costValue = document.createElement('span');
      costValue.textContent = `$${item.cost.toFixed(2)}`;
      costValue.style.fontWeight = '500';
      costValue.className = 'feature-cost-value';
      
      // Make the cost editable if the quote is editable
      if (quote.editable) {
        costValue.style.cursor = 'pointer';
        costValue.style.textDecoration = 'underline dotted';
        costValue.title = 'Click to edit cost';
        
        costValue.addEventListener('click', (e) => {
          e.stopPropagation();
          const costIndex = parseInt(costItem.getAttribute('data-feature-index'));
          const currentCost = featureCostItems[costIndex].cost;
          const newCost = prompt(`Enter new cost for "${formattedCostName}":`, currentCost.toFixed(2));
          
          if (newCost !== null && !isNaN(parseFloat(newCost))) {
            const parsedCost = parseFloat(newCost);
            if (parsedCost >= 0) {
              // Update the cost
              featureCostItems[costIndex].cost = parsedCost;
              costValue.textContent = `$${parsedCost.toFixed(2)}`;
              
              // Also update the feature cost in the quote object
              if (quote.featureCosts && quote.featureCosts[costIndex] !== undefined) {
                quote.featureCosts[costIndex] = parsedCost;
              }
              
              // Recalculate total feature cost
              featureTotal = featureCostItems.reduce((sum, item) => sum + item.cost, 0);
              totalCost.textContent = `$${featureTotal.toFixed(2)}`;
              
              // Update the overall quote calculation if needed
              if (quote.materialsCost !== featureTotal) {
                quote.materialsCost = featureTotal;
                recalculateQuote(quote);
                
                // Update the displayed total price at the top
                const priceElement = container.querySelector('.quote-price');
                if (priceElement) {
                  priceElement.textContent = `$${quote.total.toFixed(2)}`;
                }
              }
            }
          }
        });
      }
      
      costItem.appendChild(costLabel);
      costItem.appendChild(costValue);
      featuresList.appendChild(costItem);
    });
    
    // Add a total line
    const totalItem = document.createElement('li');
    totalItem.style.display = 'flex';
    totalItem.style.justifyContent = 'space-between';
    totalItem.style.alignItems = 'center';
    totalItem.style.marginTop = '12px';
    totalItem.style.padding = '8px';
    totalItem.style.borderTop = '1px solid var(--color-border-light, #e5e7eb)';
    totalItem.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
    totalItem.style.borderRadius = '4px';
    totalItem.style.fontWeight = 'bold';
    
    const totalText = document.createElement('span');
    totalText.textContent = 'Features Total';
    
    const totalCost = document.createElement('span');
    totalCost.textContent = `$${featureTotal.toFixed(2)}`;
    
    totalItem.appendChild(totalText);
    totalItem.appendChild(totalCost);
    featuresList.appendChild(totalItem);
  }
};
  
// Initial render without costs
updateFeaturesList(false);

// Add event listener for toggle
toggleSwitch.addEventListener('change', () => {
  updateFeaturesList(toggleSwitch.checked);
});

// Add "Add feature" option if editable
if (quote.editable) {
  const addItem = document.createElement('li');
  addItem.style.display = 'flex';
  addItem.style.marginBottom = '8px';
  addItem.style.fontSize = '14px';
  addItem.style.color = 'var(--color-primary, #4F46E5)';
  addItem.style.cursor = 'pointer';
  
  const plusIcon = document.createElement('span');
  plusIcon.innerHTML = '+';
  plusIcon.style.marginRight = '8px';
  plusIcon.style.fontWeight = 'bold';
  
  const text = document.createElement('span');
  text.textContent = 'Add feature';
  
  addItem.appendChild(plusIcon);
  addItem.appendChild(text);
    
    addItem.addEventListener('click', () => {
      const newFeature = prompt('Enter new feature:');
      if (newFeature !== null && newFeature.trim() !== '') {
        const featureText = newFeature.trim();
        
        // AI-enhanced feature analysis for better category understanding
        const featureCategory = analyzeFeatureCategory(featureText, quote.jobType);
        
        // Parse any AI-recommended cost for this feature
        const recommendedCost = getAIRecommendedCost(featureText, quote.jobType, quote.region);
        
        // Add the feature to the quote
        quote.features.push(featureText);
        
        // Initialize feature costs array if it doesn't exist
        if (!quote.featureCosts) {
          quote.featureCosts = [];
        }
        
        // Store the recommended cost for this feature
        const featureIndex = quote.features.length - 1;
        quote.featureCosts[featureIndex] = recommendedCost;
        
        // Clear and rebuild the features list
        featuresList.innerHTML = '';
        createQuoteCard(quote, tierName, bgColor, container, recommended);
        
        if (window.showToast) {
          window.showToast(`Feature "${featureText}" added (${featureCategory})`, 'success');
        }
      }
    });
    
    featuresList.appendChild(addItem);
  }
  
  cardBody.appendChild(featuresList);
  
  // Add a heading for the quote breakdown section with toggle
  const breakdownHeader = document.createElement('div');
  breakdownHeader.style.display = 'flex';
  breakdownHeader.style.justifyContent = 'space-between';
  breakdownHeader.style.alignItems = 'center';
  breakdownHeader.style.fontSize = '15px';
  breakdownHeader.style.fontWeight = 'bold';
  breakdownHeader.style.marginTop = '24px';
  breakdownHeader.style.marginBottom = '12px';
  breakdownHeader.style.padding = '8px';
  breakdownHeader.style.borderBottom = '2px solid var(--color-border-light, #e5e7eb)';
  breakdownHeader.style.color = 'var(--color-text, #111827)';
  breakdownHeader.style.cursor = 'pointer';
  
  const breakdownTitle = document.createElement('span');
  breakdownTitle.textContent = 'Quote Breakdown';
  
  const toggleBreakdown = document.createElement('div');
  toggleBreakdown.innerHTML = '▼';
  toggleBreakdown.style.fontSize = '12px';
  toggleBreakdown.style.transition = 'transform 0.2s ease';
  
  breakdownHeader.appendChild(breakdownTitle);
  breakdownHeader.appendChild(toggleBreakdown);
  cardBody.appendChild(breakdownHeader);
  
  // Create a container for the breakdown items
  const breakdownContainer = document.createElement('div');
  breakdownContainer.style.transition = 'max-height 0.3s ease-out, opacity 0.2s ease-out';
  breakdownContainer.style.overflow = 'hidden';
  breakdownContainer.style.maxHeight = '500px'; // Start expanded
  breakdownContainer.style.opacity = '1';
  cardBody.appendChild(breakdownContainer);
  
  // Add toggle functionality
  breakdownHeader.addEventListener('click', () => {
    if (breakdownContainer.style.maxHeight === '0px') {
      // Expand
      breakdownContainer.style.maxHeight = '500px';
      breakdownContainer.style.opacity = '1';
      toggleBreakdown.style.transform = 'rotate(0deg)';
    } else {
      // Collapse
      breakdownContainer.style.maxHeight = '0px';
      breakdownContainer.style.opacity = '0';
      toggleBreakdown.style.transform = 'rotate(-90deg)';
    }
  });
  
  // Create service-specific breakdown items for display
  const breakdownItems = [];
  
  // Display Provider Experience Level
  const experienceLevelMap = {
    'junior': 'Junior Provider (1-2 years)',
    'intermediate': 'Intermediate Provider (3-5 years)',
    'senior': 'Senior Provider (6-10 years)',
    'expert': 'Expert Provider (10+ years)'
  };
  
  const experienceText = experienceLevelMap[quote.experienceLevel] || 'Professional Provider';
  breakdownItems.push({
    label: experienceText,
    value: null, // No direct value, just informational
    isInfo: true
  });
  
  // If it's a product service with multiple units, show quantity
  // For locksmith rekey, always show quantity even if it's 1
  if ((isProductService && quote.quantity > 1) || 
      (quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey')) {
    const unitType = (quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey') ? 'lock cylinders' : 'units';
    breakdownItems.push({
      label: `Product Quantity: ${quote.quantity} ${unitType}`,
      value: null, // No direct value, just informational
      isInfo: true
    });
  }
  
  // Common for all services: labor costs
  breakdownItems.push({
    label: `${isBeautyService(quote.jobType) ? 'Service Time' : 'Labor'} (${quote.laborHours.toFixed(1)} hrs @ $${quote.laborRate.toFixed(2)}/hr)${quote.emergency ? ' (Emergency)' : ''}`,
    value: quote.laborCost
  });
  
  // For beauty services: use "Products" instead of "Materials"
  if (isBeautyService(quote.jobType)) {
    breakdownItems.push({
      label: 'Products',
      value: quote.materialsCost
    });
  }
  // For locksmith services: display quantity in materials calculation
  else if (quote.jobType === 'locksmith') {
    const perUnitCost = quote.materialsCost / quote.quantity;
    breakdownItems.push({
      label: `Materials (${quote.quantity} ${quote.jobSubtype === 'rekey' ? 'lock cylinders' : 'units'} @ $${perUnitCost.toFixed(2)}/unit)`,
      value: quote.materialsCost
    });
  }
  // For electronic repair: add parts and diagnostics
  else if (isElectronicRepair(quote.jobType)) {
    breakdownItems.push({
      label: 'Replacement Parts',
      value: quote.materialsCost * 0.8 // 80% of materials are parts
    });
    breakdownItems.push({
      label: 'Diagnostics Fee',
      value: quote.materialsCost * 0.2 // 20% of materials are diagnostics
    });
  }
  // For automotive repair: add parts, fluids, and shop supplies
  else if (isAutomotiveRepair(quote.jobType)) {
    breakdownItems.push({
      label: 'Parts',
      value: quote.materialsCost * 0.7 // 70% of materials are parts
    });
    breakdownItems.push({
      label: 'Fluids & Lubricants',
      value: quote.materialsCost * 0.2 // 20% of materials are fluids
    });
    breakdownItems.push({
      label: 'Shop Supplies',
      value: quote.materialsCost * 0.1 // 10% of materials are shop supplies
    });
  } 
  // Default for all other services
  else {
    breakdownItems.push({
      label: 'Materials',
      value: quote.materialsCost
    });
  }
  
  // Add tax unless it's being calculated separately
  if (!isElectronicRepair(quote.jobType) && !isAutomotiveRepair(quote.jobType)) {
    breakdownItems.push({
      label: `Tax (${(quote.taxRate * 100).toFixed(2)}%)`,
      value: quote.materialsTax
    });
  }

  // Add the total as the last item
  breakdownItems.push({
    label: 'Total',
    value: quote.total,
    isTotal: true
  });

  breakdownItems.forEach(item => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.padding = '4px 0';
    row.style.fontSize = '13px';
    
    if (item.isTotal) {
      row.style.borderTop = '1px solid var(--color-border-light, #e5e7eb)';
      row.style.marginTop = '4px';
      row.style.paddingTop = '8px';
      row.style.fontWeight = 'bold';
    }
    
    const label = document.createElement('span');
    label.textContent = item.label;
    
    // For info items, display differently
    if (item.isInfo) {
      row.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
      row.style.padding = '4px 6px';
      row.style.borderRadius = '4px';
      row.style.margin = '2px 0';
      row.style.fontSize = '12px';
      row.style.fontStyle = 'italic';
      row.style.color = 'var(--color-text-secondary, #4b5563)';
      
      // Only show the label for info items
      breakdownContainer.appendChild(row);
      return;
    }
    
    const value = document.createElement('span');
    value.textContent = `$${item.value.toFixed(2)}`;
    
    row.appendChild(label);
    row.appendChild(value);
    breakdownContainer.appendChild(row);
  });
  
  // Actions
  const actions = document.createElement('div');
  actions.style.marginTop = '16px';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.flexWrap = 'wrap';
  
  // AI Insights button
  const aiInsightsButton = document.createElement('button');
  aiInsightsButton.textContent = 'AI Insights & Pricing Analysis';
  aiInsightsButton.style.backgroundColor = '#10b981'; // Green color for AI insights
  aiInsightsButton.style.color = 'white';
  aiInsightsButton.style.border = 'none';
  aiInsightsButton.style.borderRadius = '6px';
  aiInsightsButton.style.padding = '12px 16px';
  aiInsightsButton.style.fontSize = '14px';
  aiInsightsButton.style.fontWeight = 'bold';
  aiInsightsButton.style.cursor = 'pointer';
  aiInsightsButton.style.display = 'flex';
  aiInsightsButton.style.alignItems = 'center';
  aiInsightsButton.style.justifyContent = 'center';
  aiInsightsButton.style.width = '100%';
  aiInsightsButton.style.marginBottom = '12px';
  aiInsightsButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
  aiInsightsButton.style.transition = 'all 0.2s ease';
  
  // Add hover effect
  aiInsightsButton.addEventListener('mouseenter', () => {
    aiInsightsButton.style.backgroundColor = '#0d9668';
    aiInsightsButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
  });
  
  aiInsightsButton.addEventListener('mouseleave', () => {
    aiInsightsButton.style.backgroundColor = '#10b981';
    aiInsightsButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
  });
  
  // Add a small icon to the button
  const aiIcon = document.createElement('span');
  aiIcon.textContent = '🧠 ';
  aiIcon.style.marginRight = '4px';
  aiInsightsButton.prepend(aiIcon);
  
  aiInsightsButton.addEventListener('click', () => {
    // Generate AI recommendations for this specific tier
    const recommendations = generateAIRecommendations(quote);
    showAIRecommendations(recommendations, tierName);
  });
  
  // Select Quote button for contractors
  const selectButton = document.createElement('button');
  
  // Use "Select Quote" for contractors
  selectButton.textContent = 'Select Quote';
  
  selectButton.style.flex = '1';
  selectButton.style.backgroundColor = 'var(--color-primary, #4F46E5)';
  selectButton.style.color = 'white';
  selectButton.style.border = 'none';
  selectButton.style.borderRadius = '6px';
  selectButton.style.padding = '8px 16px';
  selectButton.style.fontSize = '14px';
  selectButton.style.fontWeight = 'bold';
  selectButton.style.cursor = 'pointer';
  selectButton.style.minWidth = '80px';
  
  // Add deposit info to quote for quotes over $300 (for later use)
  if (quote.total >= 300) {
    // Calculate deposit (25% of total)
    quote.depositAmount = Math.round(quote.total * 0.25);
    quote.remainingAmount = quote.total - quote.depositAmount;
  }
  
  // Add checkmark icon to select button
  const buttonContent = document.createElement('div');
  buttonContent.style.display = 'flex';
  buttonContent.style.alignItems = 'center';
  buttonContent.style.justifyContent = 'center';
  
  const selectIcon = document.createElement('span');
  selectIcon.innerHTML = '✓';
  selectIcon.style.marginRight = '6px';
  
  const buttonText = document.createElement('span');
  buttonText.textContent = 'Select Quote';
  
  buttonContent.appendChild(selectIcon);
  buttonContent.appendChild(buttonText);
  selectButton.innerHTML = '';
  selectButton.appendChild(buttonContent);
  
  selectButton.addEventListener('click', () => {
    // Show quote options modal for contractors
    showQuoteOptionsModal(quote, tierName);
  });
  
  // Print button
  const printButton = document.createElement('button');
  printButton.textContent = 'Print';
  printButton.style.backgroundColor = 'transparent';
  printButton.style.color = 'var(--color-text, #111827)';
  printButton.style.border = '1px solid var(--color-border, #e5e7eb)';
  printButton.style.borderRadius = '6px';
  printButton.style.padding = '8px 16px';
  printButton.style.fontSize = '14px';
  printButton.style.cursor = 'pointer';
  
  printButton.addEventListener('click', () => {
    printQuote(quote);
  });
  
  // Add Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.style.backgroundColor = quote.editable ? '#10b981' : 'transparent';
  saveButton.style.color = quote.editable ? 'white' : 'var(--color-text, #111827)';
  saveButton.style.border = quote.editable ? 'none' : '1px solid var(--color-border, #e5e7eb)';
  saveButton.style.borderRadius = '6px';
  saveButton.style.padding = '8px 16px';
  saveButton.style.fontSize = '14px';
  saveButton.style.cursor = 'pointer';
  
  saveButton.addEventListener('click', () => {
    saveQuote(quote, tierName);
  });
  
  // First add the AI Insights button in its own row
  const aiButtonRow = document.createElement('div');
  aiButtonRow.style.display = 'flex';
  aiButtonRow.style.width = '100%';
  aiButtonRow.style.marginBottom = '12px';
  aiButtonRow.appendChild(aiInsightsButton);
  actions.appendChild(aiButtonRow);
  
  // Then add the other buttons
  actions.appendChild(selectButton);
  actions.appendChild(printButton);
  
  // Only add save button if the quote is editable
  if (quote.editable) {
    // Create a new row for the save button to ensure it appears below on mobile
    const saveButtonRow = document.createElement('div');
    saveButtonRow.style.display = 'flex';
    saveButtonRow.style.width = '100%';
    saveButtonRow.style.marginTop = '8px';
    
    saveButton.style.flex = '1';
    saveButtonRow.appendChild(saveButton);
    
    actions.appendChild(saveButtonRow);
  }
  cardBody.appendChild(actions);
  
  card.appendChild(cardBody);
  container.appendChild(card);
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
  subtitle.textContent = `${result.jobTypeDisplay} - ${result.jobSubtypeDisplay || ''} in ${result.location}`;
  subtitle.style.fontSize = '16px';
  subtitle.style.color = 'var(--color-text-secondary)';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  resultsContainer.appendChild(header);
  
  // Create breakdown
  const breakdown = document.createElement('div');
  breakdown.style.marginBottom = '24px';
  
  const detailedBreakdownTitle = document.createElement('h4');
  detailedBreakdownTitle.textContent = 'Cost Breakdown';
  detailedBreakdownTitle.style.fontSize = '16px';
  detailedBreakdownTitle.style.fontWeight = 'bold';
  detailedBreakdownTitle.style.marginBottom = '12px';
  
  breakdown.appendChild(detailedBreakdownTitle);
  
  // Create service-specific breakdown items
  const breakdownItems = [];
  
  // Display Provider Experience Level
  const experienceLevelMap = {
    'junior': 'Junior Provider (1-2 years)',
    'intermediate': 'Intermediate Provider (3-5 years)',
    'senior': 'Senior Provider (6-10 years)',
    'expert': 'Expert Provider (10+ years)'
  };
  
  const experienceText = experienceLevelMap[result.experienceLevel] || 'Professional Provider';
  breakdownItems.push({
    label: experienceText,
    value: null, // No direct value, just informational
    isInfo: true
  });
  
  // If it's a product service with multiple units, show quantity
  // For locksmith rekey, always show quantity even if it's 1
  if ((isProductService(result.jobType) && result.quantity > 1) || 
      (result.jobType === 'locksmith' && result.jobSubtype === 'rekey')) {
    const unitType = (result.jobType === 'locksmith' && result.jobSubtype === 'rekey') ? 'lock cylinders' : 'units';
    breakdownItems.push({
      label: `Product Quantity: ${result.quantity} ${unitType}`,
      value: null, // No direct value, just informational
      isInfo: true
    });
  }
  
  // Common for all services: labor costs with service-specific label
  breakdownItems.push({
    label: `${isBeautyService(result.jobType) ? 'Service Time' : 'Labor'} (${result.laborHours.toFixed(1)} hrs @ $${result.laborRate.toFixed(2)}/hr)${result.emergency ? ' (Emergency)' : ''}`,
    value: result.laborCost
  });
  
  // For beauty services: use "Products" instead of "Materials"
  if (isBeautyService(result.jobType)) {
    breakdownItems.push({
      label: 'Products',
      value: result.materialsCost
    });
  }
  // For locksmith services: display quantity in materials calculation
  else if (result.jobType === 'locksmith') {
    const perUnitCost = result.materialsCost / result.quantity;
    breakdownItems.push({
      label: `Materials (${result.quantity} ${result.jobSubtype === 'rekey' ? 'lock cylinders' : 'units'} @ $${perUnitCost.toFixed(2)}/unit)`,
      value: result.materialsCost
    });
  }
  // For electronic repair: add parts and diagnostics
  else if (isElectronicRepair(result.jobType)) {
    breakdownItems.push({
      label: 'Replacement Parts',
      value: result.materialsCost * 0.8 // 80% of materials are parts
    });
    breakdownItems.push({
      label: 'Diagnostics Fee',
      value: result.materialsCost * 0.2 // 20% of materials are diagnostics
    });
  }
  // For automotive repair: add parts, fluids, and shop supplies
  else if (isAutomotiveRepair(result.jobType)) {
    breakdownItems.push({
      label: 'Parts',
      value: result.materialsCost * 0.7 // 70% of materials are parts
    });
    breakdownItems.push({
      label: 'Fluids & Lubricants',
      value: result.materialsCost * 0.2 // 20% of materials are fluids
    });
    breakdownItems.push({
      label: 'Shop Supplies',
      value: result.materialsCost * 0.1 // 10% of materials are shop supplies
    });
  } 
  // Default for all other services
  else {
    breakdownItems.push({
      label: 'Materials',
      value: result.materialsCost
    });
  }
  
  // Add subtotal
  breakdownItems.push({
    label: 'Subtotal',
    value: result.subtotal
  });
  
  // Add tax
  breakdownItems.push({
    label: `Tax (${(result.taxRate * 100).toFixed(2)}%)`,
    value: result.materialsTax
  });
  
  // Add total
  breakdownItems.push({
    label: 'Total',
    value: result.total,
    isTotal: true
  });
  
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
    } else if (!item.isInfo) {
      row.style.borderBottom = '1px solid var(--color-border-light, #f3f4f6)';
    }
    
    const label = document.createElement('span');
    label.textContent = item.label;
    
    // For info items, display differently
    if (item.isInfo) {
      row.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
      row.style.padding = '6px 8px';
      row.style.borderRadius = '4px';
      row.style.margin = '4px 0';
      row.style.fontSize = '13px';
      row.style.fontStyle = 'italic';
      row.style.color = 'var(--color-text-secondary, #4b5563)';
      
      // Only show the label for info items
      itemsContainer.appendChild(row);
      return;
    }
    
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
  
  // Add AI-powered business recommendations
  // Create a dedicated section for AI recommendations outside of profit analysis
  const aiRecommendations = generateAIRecommendations(result);
  
  // Enhanced AI Recommendations Box
  const aiSection = document.createElement('div');
  aiSection.style.marginTop = '24px';
  aiSection.style.marginBottom = '24px';
  aiSection.style.padding = '16px';
  aiSection.style.backgroundColor = 'rgba(239, 246, 255, 0.8)'; // Light blue background
  aiSection.style.borderRadius = '8px';
  aiSection.style.border = '1px solid rgba(59, 130, 246, 0.3)'; // Light blue border
  aiSection.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  
  // Add title with AI icon
  const aiTitle = document.createElement('div');
  aiTitle.style.display = 'flex';
  aiTitle.style.alignItems = 'center';
  aiTitle.style.marginBottom = '12px';
  
  // Add AI icon
  const aiIcon = document.createElement('div');
  aiIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #3b82f6;">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
      <circle cx="7.5" cy="14.5" r="1.5"></circle>
      <circle cx="16.5" cy="14.5" r="1.5"></circle>
    </svg>
  `;
  aiIcon.style.marginRight = '10px';
  
  const aiTitleText = document.createElement('h4');
  aiTitleText.textContent = 'Smart Business Insights';
  aiTitleText.style.fontSize = '17px';
  aiTitleText.style.fontWeight = 'bold';
  aiTitleText.style.color = '#1e3a8a'; // Dark blue text
  aiTitleText.style.margin = '0';
  
  aiTitle.appendChild(aiIcon);
  aiTitle.appendChild(aiTitleText);
  aiSection.appendChild(aiTitle);
  
  // Add subtitle explaining the AI recommendations
  const aiSubtitle = document.createElement('p');
  aiSubtitle.textContent = 'Real-time market analysis and competitive pricing insights tailored to your service';
  aiSubtitle.style.fontSize = '13px';
  aiSubtitle.style.marginTop = '0';
  aiSubtitle.style.marginBottom = '16px';
  aiSubtitle.style.color = '#4b5563';
  aiSection.appendChild(aiSubtitle);
  
  // Add recommendations in a more visual format
  const recList = document.createElement('div');
  recList.style.display = 'flex';
  recList.style.flexDirection = 'column';
  recList.style.gap = '10px';
  
  aiRecommendations.forEach((rec, index) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.padding = '10px';
    item.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    item.style.borderRadius = '6px';
    item.style.border = '1px solid rgba(209, 213, 219, 0.5)';
    
    // Create number indicator
    const numberIndicator = document.createElement('div');
    numberIndicator.style.width = '24px';
    numberIndicator.style.height = '24px';
    numberIndicator.style.borderRadius = '50%';
    numberIndicator.style.backgroundColor = '#3b82f6'; // Blue background
    numberIndicator.style.color = 'white';
    numberIndicator.style.display = 'flex';
    numberIndicator.style.alignItems = 'center';
    numberIndicator.style.justifyContent = 'center';
    numberIndicator.style.fontWeight = 'bold';
    numberIndicator.style.fontSize = '14px';
    numberIndicator.style.marginRight = '12px';
    numberIndicator.style.flexShrink = '0';
    numberIndicator.textContent = (index + 1).toString();
    
    const text = document.createElement('div');
    text.textContent = rec;
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.4';
    text.style.color = '#374151';
    
    item.appendChild(numberIndicator);
    item.appendChild(text);
    recList.appendChild(item);
  });
  
  aiSection.appendChild(recList);
  
  // Add the AI section to the document - place after profit analysis
  profitAnalysis.appendChild(document.createElement('div')).style.marginTop = '20px'; // Spacer
  profitAnalysis.appendChild(aiSection);
  
  // Also add a smaller version to the profit details for consistency
  const aiSectionInProfit = document.createElement('div');
  aiSectionInProfit.style.marginTop = '16px';
  aiSectionInProfit.style.borderTop = '1px solid var(--color-border-light, #e5e7eb)';
  aiSectionInProfit.style.paddingTop = '16px';
  
  const aiTitleInProfit = document.createElement('h5');
  aiTitleInProfit.textContent = 'AI-Powered Suggestions';
  aiTitleInProfit.style.fontSize = '14px';
  aiTitleInProfit.style.fontWeight = 'bold';
  aiTitleInProfit.style.marginBottom = '8px';
  aiTitleInProfit.style.display = 'flex';
  aiTitleInProfit.style.alignItems = 'center';
  
  const aiIconInProfit = document.createElement('span');
  aiIconInProfit.innerHTML = '🤖';
  aiIconInProfit.style.marginRight = '6px';
  aiTitleInProfit.prepend(aiIconInProfit);
  
  aiSectionInProfit.appendChild(aiTitleInProfit);
  
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
    saveQuote(result, 'Standard');
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
 * Save a quote to local storage
 * @param {Object} quote - The quote object to save
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 */
function saveQuote(quote, tierName) {
  try {
    // Create a unique identifier for the quote based on job type, location, and timestamp
    const timestamp = new Date().getTime();
    const quoteId = `quote_${quote.jobType}_${timestamp}`;
    
    // Add timestamp and tier information
    const quoteToSave = {
      ...quote,
      id: quoteId,
      tierName: tierName,
      savedAt: timestamp
    };
    
    // Get existing quotes from localStorage or initialize empty array
    let savedQuotes = [];
    const savedQuotesJson = localStorage.getItem('savedQuotes');
    if (savedQuotesJson) {
      try {
        savedQuotes = JSON.parse(savedQuotesJson);
      } catch (e) {
        console.error('Error parsing saved quotes:', e);
        savedQuotes = [];
      }
    }
    
    // Add the new quote to the array
    savedQuotes.push(quoteToSave);
    
    // Save back to localStorage
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    
    // Show success message
    if (window.showToast) {
      window.showToast(`${tierName} quote saved successfully`, 'success');
    } else {
      console.log(`${tierName} quote saved successfully`);
      alert(`${tierName} quote saved successfully`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving quote:', error);
    
    // Show error message
    if (window.showToast) {
      window.showToast('Error saving quote: ' + error.message, 'error');
    } else {
      console.error('Error saving quote:', error);
      alert('Error saving quote: ' + error.message);
    }
    
    return false;
  }
}

/**
 * Load saved quotes from local storage
 * @returns {Array} Array of saved quotes
 */
function loadSavedQuotes() {
  try {
    const savedQuotesJson = localStorage.getItem('savedQuotes');
    if (!savedQuotesJson) return [];
    
    return JSON.parse(savedQuotesJson);
  } catch (error) {
    console.error('Error loading saved quotes:', error);
    return [];
  }
}

/**
 * Display a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success or error)
 */
function showToast(message, type = 'success') {
  // First, try to use the global showToast if available
  if (window.showToast && window.showToast !== showToast) {
    return window.showToast(message, type);
  }
  
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
 * Get basic description based on job type
 * @param {string} jobType - The job type
 * @returns {string} Description
 */
function getBasicDescription(jobType) {
  const descriptions = {
    'cellphone_repair': 'Basic screen and battery repairs with standard parts',
    'computer_repair': 'Essential diagnostics and basic hardware repairs',
    'tv_repair': 'Basic troubleshooting and simple component replacement',
    'automotive_repair': 'Basic maintenance and simple repairs',
    'electronic_repair': 'Basic troubleshooting and simple component replacement'
  };
  
  return descriptions[jobType] || 'Essential service covering the basics';
}

/**
 * Get standard description based on job type
 * @param {string} jobType - The job type
 * @returns {string} Description
 */
function getStandardDescription(jobType) {
  const descriptions = {
    'cellphone_repair': 'Complete repair with quality parts and 30-day warranty',
    'computer_repair': 'Full diagnostics, repairs and basic software optimization',
    'tv_repair': 'Full repair service with mid-range replacement parts',
    'automotive_repair': 'Comprehensive service with quality parts',
    'electronic_repair': 'Complete repair with quality parts and testing'
  };
  
  return descriptions[jobType] || 'Our most popular option with great value';
}

/**
 * Get premium description based on job type
 * @param {string} jobType - The job type
 * @returns {string} Description
 */
function getPremiumDescription(jobType) {
  const descriptions = {
    'cellphone_repair': 'Premium OEM parts with 90-day warranty and water resistance treatment',
    'computer_repair': 'Complete repair, performance upgrades, and premium software optimization',
    'tv_repair': 'Premium service with OEM parts, calibration, and extended warranty',
    'automotive_repair': 'Premium service with extended warranty and premium parts',
    'electronic_repair': 'Premium repair with OEM parts, thorough testing and extended warranty'
  };
  
  return descriptions[jobType] || 'Premium service with top-tier materials and extended warranty';
}

/**
 * Get basic features based on job type
 * @param {string} jobType - The job type
 * @returns {string[]} Features
 */
function getBasicFeatures(jobType) {
  // Beauty-specific features
  if (isBeautyService(jobType)) {
    return [
      'Standard service quality',
      'Basic techniques and products',
      'Entry-level experience',
      '30-day service guarantee'
    ];
  }
  
  // Electronics-specific features
  if (isElectronicRepair(jobType)) {
    return [
      'Basic diagnostic assessment',
      'Simple component repairs',
      'Standard testing procedures',
      '30-day repair warranty'
    ];
  }
  
  // Automotive-specific features
  if (isAutomotiveRepair(jobType)) {
    return [
      'Basic vehicle diagnostics',
      'Standard parts when needed',
      'Essential repairs only',
      '30-day parts & labor warranty'
    ];
  }
  
  // Service-specific features for common services
  switch (jobType) {
    case 'cellphone_repair':
      return [
        'Screen replacement with standard parts',
        'Battery replacement',
        'Basic diagnostics',
        '30-day warranty'
      ];
    case 'computer_repair':
      return [
        'Hardware diagnostics',
        'Basic virus removal',
        'Basic component replacement',
        'Standard testing'
      ];
    case 'tv_repair':
      return [
        'Basic diagnostics',
        'Power supply issues',
        'Simple board repairs',
        '30-day limited warranty'
      ];
    case 'plumber':
      return [
        'Basic leak repairs',
        'Simple fixture replacement',
        'Standard drain clearing',
        '30-day warranty'
      ];
    case 'electrician':
      return [
        'Basic electrical repairs',
        'Simple fixture installation',
        'Standard outlet replacement',
        '30-day warranty'
      ];
    case 'hvac':
      return [
        'Basic system diagnostics',
        'Simple maintenance tasks',
        'Standard filter replacement',
        '30-day warranty'
      ];
    default:
      return [
        'Essential service coverage',
        'Standard service quality',
        '30-day warranty',
        'Basic service level'
      ];
  }
}

/**
 * Get standard features based on job type
 * @param {string} jobType - The job type
 * @returns {string[]} Features
 */
function getStandardFeatures(jobType) {
  // Beauty-specific features
  if (isBeautyService(jobType)) {
    return [
      'Enhanced service techniques',
      'Premium quality products',
      'Experienced professional service',
      'Complimentary consultation',
      '60-day service guarantee'
    ];
  }
  
  // Electronics-specific features
  if (isElectronicRepair(jobType)) {
    return [
      'Comprehensive diagnostic testing',
      'Component-level repairs',
      'Quality replacement parts when needed',
      'Full functionality testing',
      'Data recovery assistance',
      '60-day repair warranty'
    ];
  }
  
  // Automotive-specific features
  if (isAutomotiveRepair(jobType)) {
    return [
      'Thorough vehicle diagnostics',
      'Quality OEM-equivalent parts',
      'Comprehensive repairs',
      'Fluids check and top-off',
      '60-day parts and labor warranty'
    ];
  }

  // Service-specific features for common services
  switch (jobType) {
    case 'cellphone_repair':
      return [
        'Premium screen replacement',
        'High-capacity battery installation',
        'Complete diagnostics',
        'Component-level repairs',
        '60-day warranty'
      ];
    case 'computer_repair':
      return [
        'Full hardware diagnostics',
        'Complete virus removal',
        'Hardware upgrades available',
        'Data recovery',
        'OS optimization',
        '60-day warranty'
      ];
    case 'tv_repair':
      return [
        'Comprehensive diagnostics',
        'Board-level repairs',
        'Component replacement',
        'Basic calibration',
        '60-day warranty'
      ];
    case 'plumber':
      return [
        'Comprehensive plumbing services',
        'Quality fixtures and parts',
        'Water pressure optimization',
        'Complete pipe repair',
        '60-day warranty'
      ];
    case 'electrician':
      return [
        'Full electrical system checks',
        'Quality fixtures and components',
        'Panel inspection',
        'Circuit troubleshooting',
        '60-day warranty'
      ];
    case 'hvac':
      return [
        'Complete system diagnostics',
        'Quality parts replacement',
        'System efficiency testing',
        'Duct inspection',
        '60-day warranty'
      ];
    default:
      return [
        'Comprehensive service',
        'Quality service execution',
        '60-day warranty',
        'Enhanced service level',
        'Priority scheduling'
      ];
  }
}

/**
 * Get premium features based on job type
 * @param {string} jobType - The job type
 * @returns {string[]} Features
 */
function getPremiumFeatures(jobType) {
  // Beauty-specific features
  if (isBeautyService(jobType)) {
    return [
      'Premium service experience',
      'Luxury-tier products used',
      'Senior-level specialist',
      'Complimentary consultation',
      'Take-home product kit included',
      '90-day service guarantee'
    ];
  }
  
  // Electronics-specific features
  if (isElectronicRepair(jobType)) {
    return [
      'Expert-level diagnostic testing',
      'OEM or premium replacement parts',
      'Preventative maintenance included',
      'Performance optimization',
      'Comprehensive testing protocol',
      'Data backup assistance',
      '90-day comprehensive warranty'
    ];
  }
  
  // Automotive-specific features
  if (isAutomotiveRepair(jobType)) {
    return [
      'Advanced computer diagnostics',
      'Premium OEM parts',
      'Complete vehicle system check',
      'Preventative maintenance',
      'Courtesy vehicle inspection',
      'Express service option',
      '6-month parts and labor warranty'
    ];
  }

  // Service-specific features for common services
  switch (jobType) {
    case 'cellphone_repair':
      return [
        'OEM screen with enhanced protection',
        'Premium battery with extended life',
        'Water resistance treatment',
        'Performance optimization',
        'Preventative maintenance',
        '90-day warranty with accidental coverage'
      ];
    case 'computer_repair':
      return [
        'Premium diagnostics with specialized tools',
        'Performance SSD upgrade',
        'RAM optimization',
        'Complete system security setup',
        'Professional cable management',
        'Phone support for 90 days',
        '90-day comprehensive warranty'
      ];
    case 'tv_repair':
      return [
        'Advanced diagnostics with specialized equipment',
        'OEM replacement parts',
        'Professional calibration',
        'Firmware updates',
        'Dust removal and cleaning',
        'HDMI testing with all inputs',
        '90-day comprehensive warranty'
      ];
    case 'plumber':
      return [
        'Premium fixtures and parts',
        'Comprehensive plumbing inspection',
        'Water efficiency optimization',
        'Extended 90-day warranty',
        'Priority emergency response',
        'Annual maintenance plan'
      ];
    case 'electrician':
      return [
        'Complete electrical system analysis',
        'Premium components and fixtures',
        'Electrical efficiency optimization',
        'Safety inspection included',
        'Extended 90-day warranty',
        'Priority emergency service'
      ];
    case 'hvac':
      return [
        'Comprehensive system analysis',
        'Premium components and filters',
        'Energy efficiency optimization',
        'Complete duct inspection',
        'Extended 90-day warranty',
        'Preventative maintenance package'
      ];
    default:
      return [
        'Premium service coverage',
        'Top-tier quality',
        '90-day extended warranty',
        'Priority scheduling',
        'Premium service level',
        'Follow-up service included'
      ];
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
    
    // Add a unique ID and timestamp plus tier information if available
    const quoteToSave = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      tierName: quote.tier ? (quote.tier.charAt(0).toUpperCase() + quote.tier.slice(1)) : undefined
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
        .features-list {
          margin-top: 20px;
          margin-bottom: 30px;
        }
        .feature-item {
          padding: 4px 0;
          display: flex;
        }
        .feature-item:before {
          content: "✓";
          color: #4F46E5;
          font-weight: bold;
          margin-right: 8px;
        }
        .tier-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: #4F46E5;
          border: 1px solid #4F46E5;
          margin-left: 8px;
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
          <div class="section-title">
            Quote Information
            ${quote.tier ? `<span class="tier-badge">${quote.tier.toUpperCase()} TIER</span>` : ''}
          </div>
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
          ${quote.jobSubtypeDisplay ? `
          <div class="quote-info-row">
            <div><strong>Service Type:</strong></div>
            <div>${quote.jobSubtypeDisplay}</div>
          </div>
          ` : ''}
          <div class="quote-info-row">
            <div><strong>Location:</strong></div>
            <div>${quote.location}</div>
          </div>
          ${quote.experienceLevel ? `
          <div class="quote-info-row">
            <div><strong>Provider Experience:</strong></div>
            <div>${(() => {
              const experienceLevelMap = {
                'junior': 'Junior Provider (1-2 years)',
                'intermediate': 'Intermediate Provider (3-5 years)',
                'senior': 'Senior Provider (6-10 years)',
                'expert': 'Expert Provider (10+ years)'
              };
              return experienceLevelMap[quote.experienceLevel] || 'Professional Provider';
            })()}</div>
          </div>
          ` : ''}
          ${(isProductService(quote.jobType) && quote.quantity > 1) || 
            (quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey') ? `
          <div class="quote-info-row">
            <div><strong>Product Quantity:</strong></div>
            <div>${quote.quantity} ${(quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey') ? 'lock cylinders' : 'units'}</div>
          </div>
          ` : ''}
          ${quote.description ? `
          <div class="quote-info-row">
            <div><strong>Description:</strong></div>
            <div>${quote.description}</div>
          </div>
          ` : ''}
        </div>
        
        ${quote.features && quote.features.length > 0 ? `
        <div>
          <div class="section-title">Service Features</div>
          <div class="features-list">
            ${quote.features.map(feature => `
              <div class="feature-item">${feature}</div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="section-title">Cost Breakdown</div>
        <div class="breakdown-item">
          <div>Labor (${typeof quote.laborHours === 'number' ? quote.laborHours.toFixed(1) : quote.laborHours} hours @ $${quote.laborRate.toFixed(2)}/hr)${quote.emergency ? ' (Emergency)' : ''}</div>
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
          description: `${quote.jobTypeDisplay}${quote.jobSubtypeDisplay ? ` - ${quote.jobSubtypeDisplay}` : ''}${quote.emergency ? ' (Emergency)' : ''}`,
          quantity: quote.laborHours,
          unit: 'hours',
          unitPrice: quote.laborRate,
          amount: quote.laborCost,
          notes: quote.experienceLevel ? (() => {
            const experienceLevelMap = {
              'junior': 'Junior Provider (1-2 years)',
              'intermediate': 'Intermediate Provider (3-5 years)',
              'senior': 'Senior Provider (6-10 years)',
              'expert': 'Expert Provider (10+ years)'
            };
            return experienceLevelMap[quote.experienceLevel] || 'Professional Provider';
          })() : ''
        },
        {
          description: ((isProductService(quote.jobType) && quote.quantity > 1) || 
                       (quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey')) ? 
            `Materials (${quote.quantity} ${(quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey') ? 'lock cylinders' : 'units'})` : 'Materials',
          quantity: isProductService(quote.jobType) ? quote.quantity : 1,
          unit: (quote.jobType === 'locksmith' && quote.jobSubtype === 'rekey') ? 'cylinders' : 'lot',
          unitPrice: isProductService(quote.jobType) && quote.quantity > 0 ? 
            quote.materialsCost / quote.quantity : quote.materialsCost,
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
    
    // Update the user profile with the accepted quote information
    try {
      // Dynamically import the user profile module
      import('/green/user-profile.js')
        .then(module => {
          if (typeof window.appState !== 'undefined' && window.appState.user && window.appState.user.id) {
            // Initialize with the current user ID if available
            module.initUserProfile(window.appState.user.id)
              .then(() => {
                // Add this quote to the user's history
                const quoteData = {
                  jobType: quote.jobType,
                  jobSubtype: quote.jobSubtype,
                  totalAmount: quote.total,
                  margin: quote.actualProfitMargin || quote.targetMargin,
                  tier: quote.tier,
                  accepted: true,
                  date: new Date().toISOString()
                };
                
                module.addQuoteToHistory(quoteData)
                  .then(updatedProfile => {
                    console.log('Quote added to user profile history:', updatedProfile);
                  })
                  .catch(err => {
                    console.error('Error adding quote to history:', err);
                  });
              });
          }
        })
        .catch(err => {
          console.error('Error loading user profile module for quote history:', err);
        });
    } catch (profileError) {
      console.error('Error updating profile with accepted quote:', profileError);
    }
    
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
/**
 * Ensures that a user profile is initialized
 * Will attempt to initialize if not already done
 */
function ensureUserProfileInitialized() {
  try {
    // Check if user profile module is available in window.modules
    if (window.modules && window.modules['user-profile']) {
      const userProfileModule = window.modules['user-profile'];
      const currentProfile = userProfileModule.getCurrentProfile();
      
      // If no profile is loaded, try to initialize it
      if (!currentProfile) {
        console.log('No user profile found, attempting to initialize');
        
        // Try to get user ID from various sources
        let userId = null;
        
        // First try window.appState
        if (window.appState && window.appState.user && window.appState.user.id) {
          userId = window.appState.user.id;
          console.log('Using user ID from window.appState:', userId);
        } 
        // Then try localStorage
        else {
          try {
            const userData = localStorage.getItem('stackrUser');
            if (userData) {
              const user = JSON.parse(userData);
              if (user && user.id) {
                userId = user.id;
                console.log('Using user ID from localStorage:', userId);
              }
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
        
        // If we found a user ID, initialize the profile
        if (userId) {
          userProfileModule.initUserProfile(userId)
            .then(profile => {
              console.log('User profile initialized from quote generator:', profile ? 'success' : 'failed');
            })
            .catch(err => {
              console.error('Error initializing user profile from quote generator:', err);
            });
        } else {
          // Create a temporary ID if none found
          const tempId = `temp-${Date.now()}`;
          console.log('Creating temporary user ID for profile:', tempId);
          
          userProfileModule.initUserProfile(tempId)
            .then(profile => {
              console.log('User profile initialized with temporary ID:', profile ? 'success' : 'failed');
            })
            .catch(err => {
              console.error('Error initializing user profile with temporary ID:', err);
            });
        }
      } else {
        console.log('User profile already loaded:', currentProfile);
      }
    } else {
      console.log('User profile module not available in window.modules');
      
      // Try to dynamically import the module
      import('/green/user-profile.js')
        .then(module => {
          // Store for future use
          if (!window.modules) window.modules = {};
          window.modules['user-profile'] = module;
          
          console.log('User profile module imported dynamically');
          
          // Initialize user profile from various sources
          const userId = window.appState?.user?.id || 
                        (localStorage.getItem('stackrUser') ? 
                          JSON.parse(localStorage.getItem('stackrUser'))?.id : null) || 
                        `temp-${Date.now()}`;
                        
          module.initUserProfile(userId)
            .then(profile => {
              console.log('User profile initialized after dynamic import:', profile ? 'success' : 'failed');
            })
            .catch(err => {
              console.error('Error initializing user profile after dynamic import:', err);
            });
        })
        .catch(err => {
          console.error('Error importing user profile module:', err);
        });
    }
  } catch (error) {
    console.error('Error in ensureUserProfileInitialized:', error);
  }
}

/**
 * Get state abbreviation from a full location string
 * @param {string} location - Full address string
 * @returns {string} State abbreviation or default "NY"
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
    
    // Beauty service categories
    'beauty_services': 'Beauty Services (General)',
    'hair_stylist': 'Hair Styling Services',
    'nail_technician': 'Nail Salon Services',
    'makeup_artist': 'Makeup Artist Services',
    'esthetician': 'Esthetician Services',
    'massage_therapist': 'Massage Therapy',
    'spa_services': 'Spa Treatment Services',
    'waxing_services': 'Waxing Services',
    'tanning_services': 'Tanning Services',
    'eyebrow_threading': 'Eyebrow & Threading Services',
    'lash_extensions': 'Lash Extension Services',
    'facial_services': 'Facial Treatment Services',
    
    'photography': 'Photography Services',
    'graphic_design': 'Graphic Design',
    'catering': 'Catering Services',
    'interior_design': 'Interior Design',
    'moving_services': 'Moving Services',
    'cleaning_services': 'Cleaning Services'
  };
  
  return displayNames[jobType] || jobType;
}

/**
 * Get the display name for a job subtype based on the job type and subtype value
 * @param {string} jobType - The job type
 * @param {string} jobSubtype - The job subtype
 * @returns {string} The display name for the job subtype
 */
function getJobSubtypeDisplay(jobType, jobSubtype) {
  // These mappings match the ones defined in the serviceSubcategories object
  const subtypeDisplayNames = {
    'locksmith': {
      'rekey': 'Rekey Service',
      'akl': 'All Keys Lost (AKL)',
      'duplicate_key': 'Duplicate Key',
      'lockout': 'Lockout Service',
      'lock_installation': 'Lock Installation',
      'lock_repair': 'Lock Repair',
      'safe_unlock': 'Safe Unlocking',
      'smart_lock': 'Smart Lock Installation'
    },
    'plumber': {
      'leak_repair': 'Leak Repair',
      'drain_cleaning': 'Drain Cleaning',
      'fixture_installation': 'Fixture Installation',
      'pipe_repair': 'Pipe Repair/Replacement',
      'water_heater': 'Water Heater Service',
      'sump_pump': 'Sump Pump Installation/Repair',
      'backflow': 'Backflow Testing/Prevention'
    },
    'electrician': {
      'outlet_installation': 'Outlet Installation',
      'panel_upgrade': 'Panel Upgrade',
      'lighting_install': 'Lighting Installation',
      'wiring_repair': 'Wiring Repair',
      'ceiling_fan': 'Ceiling Fan Installation',
      'generator': 'Generator Installation/Service',
      'ev_charger': 'EV Charger Installation'
    },
    'hvac': {
      'ac_repair': 'AC Repair',
      'furnace_repair': 'Furnace Repair',
      'maintenance': 'Regular Maintenance',
      'installation': 'New System Installation',
      'air_quality': 'Air Quality Solutions',
      'duct_cleaning': 'Duct Cleaning'
    },
    'automotive_repair': {
      'oil_change': 'Oil Change',
      'brake_service': 'Brake Service',
      'transmission': 'Transmission Service',
      'engine_repair': 'Engine Repair',
      'suspension': 'Suspension Work',
      'electrical': 'Electrical System Repair',
      'diagnostics': 'Computer Diagnostics',
      'tire_service': 'Tire Service'
    },
    'electronic_repair': {
      'diagnostics': 'Diagnostics/Troubleshooting',
      'circuit_repair': 'Circuit Board Repair',
      'component_replacement': 'Component Replacement',
      'water_damage': 'Water Damage Repair',
      'data_recovery': 'Data Recovery'
    },
    'cellphone_repair': {
      'screen_replacement': 'Screen Replacement',
      'battery_replacement': 'Battery Replacement',
      'charging_port': 'Charging Port Repair',
      'water_damage': 'Water Damage Repair',
      'camera_repair': 'Camera Repair'
    },
    'computer_repair': {
      'virus_removal': 'Virus/Malware Removal',
      'hardware_upgrade': 'Hardware Upgrade',
      'data_recovery': 'Data Recovery',
      'os_installation': 'OS Installation',
      'troubleshooting': 'General Troubleshooting'
    },
    'tv_repair': {
      'screen_repair': 'Screen Repair',
      'power_issues': 'Power Supply Issues',
      'backlight': 'Backlight Repair',
      'hdmi_ports': 'HDMI Port Repair',
      'sound_issues': 'Sound System Repair'
    },
    'beauty_services': {
      'full_service': 'Full Service Package',
      'consultation': 'Consultation',
      'special_event': 'Special Event Styling',
      'bridal': 'Bridal Service'
    },
    'hair_stylist': {
      'haircut': 'Haircut',
      'color': 'Hair Coloring',
      'highlights': 'Highlights/Lowlights',
      'blowout': 'Blowout Styling',
      'extension': 'Extensions',
      'treatment': 'Hair Treatment'
    },
    'nail_technician': {
      'manicure': 'Basic Manicure',
      'pedicure': 'Pedicure',
      'gel': 'Gel Polish',
      'acrylic': 'Acrylic Nails',
      'dip_powder': 'Dip Powder Nails',
      'nail_art': 'Nail Art'
    },
    'makeup_artist': {
      'everyday': 'Everyday Makeup',
      'special_event': 'Special Event Makeup',
      'bridal': 'Bridal Makeup',
      'photoshoot': 'Photoshoot Makeup',
      'lesson': 'Makeup Lesson'
    }
  };
  
  // Default subcategories for services without specific options
  const defaultSubcategories = {
    'standard': 'Standard Service',
    'consultation': 'Consultation',
    'emergency': 'Emergency Service',
    'maintenance': 'Regular Maintenance',
    'specialized': 'Specialized Service'
  };
  
  // Return the display name from specific job type mapping if available
  if (subtypeDisplayNames[jobType] && subtypeDisplayNames[jobType][jobSubtype]) {
    return subtypeDisplayNames[jobType][jobSubtype];
  }
  
  // Fall back to default subcategory labels
  if (defaultSubcategories[jobSubtype]) {
    return defaultSubcategories[jobSubtype];
  }
  
  // If no mapping found, return the original value with first letter capitalized
  return jobSubtype.charAt(0).toUpperCase() + jobSubtype.slice(1).replace(/_/g, ' ');
}

/**
 * Get description for basic tier services
 * @param {string} jobType - Type of job/service
 * @returns {string} Description for basic tier service
 */
function getBasicDescription(jobType) {
  const descriptions = {
    'locksmith': 'Essential locksmith service with standard locks and basic security options.',
    'plumber': 'Basic plumbing service for standard fixtures and simple repairs.',
    'electrician': 'Essential electrical work with standard components and basic troubleshooting.',
    'carpenter': 'Standard carpentry work with basic materials and essential construction.',
    'hvac': 'Basic HVAC maintenance and simple repairs for residential systems.',
    'painter': 'Standard painting service using basic quality paints and minimal preparation.',
    'general_contractor': 'Basic contracting services with standard materials and essential construction techniques.',
    'landscaper': 'Simple landscaping work with basic design and standard plants.',
    'roofer': 'Basic roof repair with standard materials and essential waterproofing.',
    'flooring_specialist': 'Standard flooring installation with basic materials and minimal preparation.',
    'window_installer': 'Basic window installation with standard frames and essential weatherproofing.',
    'appliance_repair': 'Simple appliance repair with standard parts and basic troubleshooting.',
    'automotive_repair': 'Basic automotive repair with standard parts and essential diagnostics.',
    'electronic_repair': 'Simple electronic repairs with standard components and basic troubleshooting.',
    'cellphone_repair': 'Basic cellphone repair with standard replacement parts and simple fixes.',
    'computer_repair': 'Essential computer repair with standard diagnostics and basic hardware fixes.',
    'tv_repair': 'Simple TV repair with basic diagnostics and standard component replacement.',
    'beauty_services': 'Standard beauty services with basic techniques and essential products.',
    'hair_stylist': 'Basic hair styling with standard products and essential cutting techniques.',
    'nail_technician': 'Basic nail care with standard polishes and essential manicure techniques.',
    'makeup_artist': 'Basic makeup application with standard products and essential techniques.',
    'esthetician': 'Basic skincare treatments with standard products and essential techniques.',
    'massage_therapist': 'Basic massage therapy with standard techniques and essential oils.',
    'spa_services': 'Basic spa treatments with standard products and essential relaxation techniques.',
    'waxing_services': 'Basic waxing services with standard products and essential techniques.',
    'tanning_services': 'Basic tanning application with standard products and essential techniques.',
    'eyebrow_threading': 'Basic eyebrow shaping with standard threading and essential techniques.',
    'lash_extensions': 'Basic lash extensions with standard materials and essential application.',
    'facial_services': 'Basic facial treatments with standard products and essential skincare techniques.',
    'photography': 'Basic photography session with standard equipment and minimal editing.',
    'graphic_design': 'Simple graphic design with standard templates and basic customization.'
  };
  
  return descriptions[jobType] || 'Standard service with basic materials and essential workmanship.';
}

/**
 * Get description for standard tier services
 * @param {string} jobType - Type of job/service
 * @returns {string} Description for standard tier service
 */
function getStandardDescription(jobType) {
  const descriptions = {
    'locksmith': 'Complete locksmith service with high-quality locks and enhanced security features.',
    'plumber': 'Professional plumbing service with quality fixtures and comprehensive repairs.',
    'electrician': 'Comprehensive electrical work with quality components and thorough diagnostics.',
    'carpenter': 'Professional carpentry with quality materials and detailed workmanship.',
    'hvac': 'Complete HVAC service with thorough diagnostics and quality repair or installation.',
    'painter': 'Professional painting with quality paints and proper surface preparation.',
    'general_contractor': 'Comprehensive contracting services with quality materials and detailed execution.',
    'landscaper': 'Professional landscaping with thoughtful design and quality plants.',
    'roofer': 'Complete roofing service with quality materials and professional installation.',
    'flooring_specialist': 'Professional flooring installation with quality materials and proper subflooring preparation.',
    'window_installer': 'Complete window installation with quality frames and professional weatherproofing.',
    'appliance_repair': 'Comprehensive appliance repair with detailed diagnostics and quality parts.',
    'automotive_repair': 'Professional automotive repair with quality parts and comprehensive diagnostics.',
    'electronic_repair': 'Complete electronic repair with detailed diagnostics and quality components.',
    'cellphone_repair': 'Professional cellphone repair with quality parts and comprehensive testing.',
    'computer_repair': 'Complete computer repair with detailed diagnostics and quality hardware solutions.',
    'tv_repair': 'Professional TV repair with comprehensive diagnostics and quality component replacement.',
    'beauty_services': 'Complete beauty services with professional techniques and quality products.',
    'hair_stylist': 'Professional hair styling with quality products and detailed cutting/coloring techniques.',
    'nail_technician': 'Professional nail care with quality polishes and detailed manicure/pedicure techniques.',
    'makeup_artist': 'Professional makeup application with quality products and detailed contouring techniques.',
    'esthetician': 'Professional skincare treatments with quality products and detailed extraction techniques.',
    'massage_therapist': 'Professional massage therapy with quality techniques and detailed muscle treatment.',
    'spa_services': 'Professional spa treatments with quality products and detailed relaxation techniques.',
    'waxing_services': 'Professional waxing with quality products and detailed hair removal techniques.',
    'tanning_services': 'Professional tanning application with quality products and detailed contouring.',
    'eyebrow_threading': 'Professional eyebrow shaping with detailed threading and precise techniques.',
    'lash_extensions': 'Professional lash extensions with quality materials and detailed application.',
    'facial_services': 'Professional facial treatments with quality products and detailed skincare regimen.',
    'photography': 'Professional photography session with quality equipment and detailed editing.',
    'graphic_design': 'Complete graphic design with professional layouts and thoughtful customization.'
  };
  
  return descriptions[jobType] || 'Professional service with quality materials and detailed workmanship.';
}

/**
 * Get description for premium tier services
 * @param {string} jobType - Type of job/service
 * @returns {string} Description for premium tier service
 */
function getPremiumDescription(jobType) {
  const descriptions = {
    'locksmith': 'Premium locksmith service with top-tier security systems and advanced smart-lock integration.',
    'plumber': 'Premium plumbing service with premium fixtures and comprehensive system optimization.',
    'electrician': 'Premium electrical work with high-end components and advanced system optimization.',
    'carpenter': 'Premium carpentry with luxury materials and master craftsmanship.',
    'hvac': 'Premium HVAC service with advanced diagnostics and high-efficiency system installation.',
    'painter': 'Premium painting with top-tier paints and exceptional surface preparation and finishing.',
    'general_contractor': 'Premium contracting services with luxury materials and master craftsmanship.',
    'landscaper': 'Premium landscaping with custom design and rare/specialty plants.',
    'roofer': 'Premium roofing with top-tier materials and advanced weatherproofing systems.',
    'flooring_specialist': 'Premium flooring installation with luxury materials and advanced preparation techniques.',
    'window_installer': 'Premium window installation with high-end frames and advanced insulation systems.',
    'appliance_repair': 'Premium appliance service with advanced diagnostics and high-end parts.',
    'automotive_repair': 'Premium automotive service with dealer-grade diagnostics and OEM parts.',
    'electronic_repair': 'Premium electronic service with advanced diagnostics and high-end components.',
    'cellphone_repair': 'Premium cellphone repair with OEM parts and comprehensive device optimization.',
    'computer_repair': 'Premium computer service with advanced diagnostics and performance optimization.',
    'tv_repair': 'Premium TV repair with advanced calibration and premium component replacement.',
    'beauty_services': 'Premium beauty services with advanced techniques and high-end luxury products.',
    'hair_stylist': 'Premium hair styling with luxury products and advanced cutting/coloring techniques from master stylists.',
    'nail_technician': 'Premium nail care with luxury polishes and advanced nail art techniques from certified specialists.',
    'makeup_artist': 'Premium makeup application with high-end luxury products and advanced techniques from celebrity-trained artists.',
    'esthetician': 'Premium skincare treatments with medical-grade products and advanced techniques from certified specialists.',
    'massage_therapist': 'Premium massage therapy with luxury oils and advanced therapeutic techniques from certified therapists.',
    'spa_services': 'Premium spa treatments with high-end luxury products and advanced holistic wellness techniques.',
    'waxing_services': 'Premium waxing with luxury products and advanced painless techniques from certified specialists.',
    'tanning_services': 'Premium tanning application with organic formulas and advanced airbrush techniques from certified specialists.',
    'eyebrow_threading': 'Premium eyebrow design with advanced threading and brow mapping from certified specialists.',
    'lash_extensions': 'Premium lash extensions with luxury mink/silk materials and advanced volumizing techniques from certified artists.',
    'facial_services': 'Premium facial treatments with medical-grade products and advanced technology from certified dermatological specialists.',
    'photography': 'Premium photography with high-end equipment and advanced retouching and artistic editing.',
    'graphic_design': 'Premium graphic design with customized layouts and advanced artistic direction.'
  };
  
  return descriptions[jobType] || 'Premium service with luxury materials and master craftsmanship.';
}

/**
 * Get features for basic tier services
 * @param {string} jobType - Type of job/service
 * @returns {string[]} List of features for basic tier service
 */
function getBasicFeatures(jobType) {
  const commonFeatures = [
    'Standard service coverage',
    '30-day limited warranty',
    'Basic materials included',
    'Standard quality parts',
    'Emergency service available'
  ];
  
  const serviceSpecificFeatures = {
    'locksmith': [
      'Basic lock replacement',
      'Simple key cutting',
      'Standard doorknob installation'
    ],
    'plumber': [
      'Simple fixture replacement',
      'Basic drain cleaning',
      'Standard faucet installation'
    ],
    'electrician': [
      'Basic outlet installation',
      'Simple switch replacement',
      'Standard light fixture mounting'
    ],
    'carpenter': [
      'Basic framing and trim work',
      'Simple door installation',
      'Standard cabinet assembly'
    ],
    'hvac': [
      'Basic system diagnostics',
      'Standard filter replacement',
      'Simple vent cleaning'
    ],
    'roofer': [
      'Basic leak repair',
      'Standard shingle replacement',
      'Simple gutter cleaning'
    ],
    'flooring_specialist': [
      'Standard vinyl/laminate installation',
      'Basic subfloor preparation',
      'Simple trim work'
    ],
    'window_installer': [
      'Standard window installation',
      'Basic weatherstripping',
      'Simple frame repair'
    ],
    'automotive_repair': [
      'Basic oil and filter change',
      'Standard brake pad replacement',
      'Simple diagnostics scan'
    ],
    'electronic_repair': [
      'Basic component replacement',
      'Standard cleaning and maintenance',
      'Simple diagnostics'
    ],
    'cellphone_repair': [
      'Basic screen replacement',
      'Standard battery replacement',
      'Simple software troubleshooting'
    ],
    'computer_repair': [
      'Basic virus removal',
      'Standard hardware installation',
      'Simple software troubleshooting'
    ],
    'tv_repair': [
      'Basic component replacement',
      'Standard picture adjustment',
      'Simple cable connection setup'
    ],
    'beauty_services': [
      'Basic service package',
      'Standard beauty products',
      'Essential treatment techniques'
    ],
    'hair_stylist': [
      'Basic cut and style',
      'Standard shampoo and condition',
      'Essential styling products'
    ],
    'nail_technician': [
      'Basic manicure or pedicure',
      'Standard polish application',
      'Essential nail care'
    ],
    'makeup_artist': [
      'Basic makeup application',
      'Standard beauty products',
      'Essential color matching'
    ],
    'esthetician': [
      'Basic facial cleansing',
      'Standard exfoliation',
      'Essential moisturizing'
    ],
    'massage_therapist': [
      'Basic 30-minute massage',
      'Standard relaxation techniques',
      'Essential pressure points'
    ],
    'spa_services': [
      'Basic treatment package',
      'Standard spa products',
      'Essential relaxation techniques'
    ],
    'waxing_services': [
      'Basic waxing service',
      'Standard wax products',
      'Essential aftercare'
    ],
    'tanning_services': [
      'Basic spray tan application',
      'Standard tanning solution',
      'Essential skin preparation'
    ],
    'eyebrow_threading': [
      'Basic eyebrow shaping',
      'Standard threading technique',
      'Essential aftercare'
    ],
    'lash_extensions': [
      'Basic lash application',
      'Standard synthetic lashes',
      'Essential aftercare'
    ],
    'facial_services': [
      'Basic facial cleansing',
      'Standard exfoliation',
      'Essential moisturizing'
    ]
  };
  
  return [...commonFeatures, ...(serviceSpecificFeatures[jobType] || [])];
}

/**
 * Get features for standard tier services
 * @param {string} jobType - Type of job/service
 * @returns {string[]} List of features for standard tier service
 */
function getStandardFeatures(jobType) {
  const commonFeatures = [
    'Complete service coverage',
    '90-day comprehensive warranty',
    'Quality materials included',
    'Professional-grade parts',
    'Priority scheduling',
    'Emergency service available'
  ];
  
  const serviceSpecificFeatures = {
    'locksmith': [
      'High-security lock installation',
      'Precision key duplication',
      'Deadbolt reinforcement',
      'Lock rekeying service'
    ],
    'plumber': [
      'Comprehensive pipe repair',
      'Professional drain cleaning',
      'Quality fixture installation',
      'Water pressure optimization'
    ],
    'electrician': [
      'Circuit troubleshooting',
      'Quality fixture installation',
      'Panel inspection and maintenance',
      'GFCI outlet upgrades'
    ],
    'carpenter': [
      'Custom shelving installation',
      'Professional door hanging',
      'Quality cabinet installation',
      'Detailed trim work'
    ],
    'hvac': [
      'Comprehensive system diagnostics',
      'Complete duct cleaning',
      'Professional thermostat installation',
      'System efficiency optimization'
    ],
    'roofer': [
      'Complete leak detection and repair',
      'Professional shingle replacement',
      'Quality flashing installation',
      'Full gutter service'
    ],
    'flooring_specialist': [
      'Hardwood floor installation',
      'Professional subfloor preparation',
      'Detailed trim and transition work',
      'Quality material selection assistance'
    ],
    'window_installer': [
      'Double-pane window installation',
      'Professional frame replacement',
      'Complete weatherproofing',
      'Quality hardware installation'
    ],
    'automotive_repair': [
      'Comprehensive vehicle inspection',
      'Professional brake system service',
      'Complete fluid replacement',
      'Quality filter package replacement'
    ],
    'electronic_repair': [
      'Circuit board repair',
      'Professional calibration',
      'Comprehensive diagnostics',
      'Quality component upgrades'
    ],
    'cellphone_repair': [
      'OEM-comparable screen replacement',
      'Professional water damage treatment',
      'Complete diagnostics',
      'Data recovery assistance'
    ],
    'computer_repair': [
      'Complete system optimization',
      'Professional hardware upgrades',
      'Comprehensive malware removal',
      'System backup and recovery'
    ],
    'tv_repair': [
      'Professional panel replacement',
      'Complete circuit diagnostics',
      'Quality board replacement',
      'Basic calibration service'
    ],
    'beauty_services': [
      'Comprehensive service package',
      'Quality professional products',
      'Complete treatment techniques',
      'Personalized consultation'
    ],
    'hair_stylist': [
      'Professional cut, color, and style',
      'Quality salon products',
      'Complete hair treatment',
      'Style consultation included'
    ],
    'nail_technician': [
      'Complete manicure and pedicure',
      'Quality gel or acrylic options',
      'Detailed nail art available',
      'Extended wear treatments'
    ],
    'makeup_artist': [
      'Professional makeup application',
      'Quality beauty products',
      'Complete color matching',
      'Specialty techniques (contouring, etc.)'
    ],
    'esthetician': [
      'Comprehensive facial treatment',
      'Professional extraction techniques',
      'Quality skincare products',
      'Personalized skin assessment'
    ],
    'massage_therapist': [
      'Professional 60-minute massage',
      'Comprehensive technique selection',
      'Quality essential oils included',
      'Targeted problem area focus'
    ],
    'spa_services': [
      'Complete treatment package',
      'Professional spa products',
      'Multiple service combinations',
      'Aromatherapy included'
    ],
    'waxing_services': [
      'Complete waxing service',
      'Professional technique',
      'Quality wax products',
      'Comprehensive aftercare included'
    ],
    'tanning_services': [
      'Professional spray tan application',
      'Quality tanning solution',
      'Comprehensive skin preparation',
      'Detailed application technique'
    ],
    'eyebrow_threading': [
      'Complete eyebrow shaping and design',
      'Professional threading technique',
      'Detailed finishing work',
      'Shaping consultation included'
    ],
    'lash_extensions': [
      'Professional lash application',
      'Quality synthetic or silk lashes',
      'Comprehensive filling technique',
      'Detailed styling options'
    ],
    'facial_services': [
      'Complete facial treatment',
      'Professional extraction techniques',
      'Multiple treatment masking',
      'Comprehensive moisturizing therapy'
    ]
  };
  
  return [...commonFeatures, ...(serviceSpecificFeatures[jobType] || [])];
}

/**
 * Get features for premium tier services
 * @param {string} jobType - Type of job/service
 * @returns {string[]} List of features for premium tier service
 */
function getPremiumFeatures(jobType) {
  const commonFeatures = [
    'Premium service coverage',
    '1-year comprehensive warranty',
    'Luxury materials included',
    'Top-tier/OEM parts',
    'Next-day scheduling',
    'Priority emergency service',
    'Free follow-up inspection'
  ];
  
  const serviceSpecificFeatures = {
    'locksmith': [
      'Smart lock integration',
      'Complete security system installation',
      'Master key system setup',
      'Electronic access control',
      'Security assessment and consultation'
    ],
    'plumber': [
      'Whole house plumbing inspection',
      'Premium fixture installation',
      'Complete pipe system replacement',
      'Water filtration system installation',
      'Smart water monitoring setup'
    ],
    'electrician': [
      'Whole house electrical inspection',
      'Smart home integration',
      'Complete panel upgrade',
      'Surge protection system',
      'LED lighting conversion'
    ],
    'carpenter': [
      'Custom cabinetry installation',
      'Premium hardwood work',
      'Specialty woodworking details',
      'Architectural element restoration',
      'Designer consultation included'
    ],
    'hvac': [
      'Complete system replacement',
      'Smart thermostat integration',
      'Zoned system installation',
      'High-efficiency upgrades',
      'Extended system warranty'
    ],
    'roofer': [
      'Premium roofing material installation',
      'Complete roof system replacement',
      'Advanced waterproofing system',
      'Extended material warranty',
      'Ice dam prevention system'
    ],
    'flooring_specialist': [
      'Premium hardwood installation',
      'Custom inlay and pattern work',
      'Complete subflooring reconstruction',
      'Radiant heating integration',
      'Designer consultation included'
    ],
    'window_installer': [
      'Triple-pane window installation',
      'Custom window sizing',
      'Advanced insulation package',
      'Premium trim and finishing',
      'Energy efficiency certification'
    ],
    'automotive_repair': [
      'Dealer-level diagnostic service',
      'Premium parts package',
      'Complete system overhaul',
      'Performance optimization',
      'Detailed vehicle inspection report'
    ],
    'electronic_repair': [
      'Complete device refurbishment',
      'Premium component upgrades',
      'Performance optimization',
      'Extended warranty',
      'Preventative maintenance plan'
    ],
    'cellphone_repair': [
      'OEM part replacement',
      'Complete device restoration',
      'Performance optimization',
      'Premium screen protector',
      'Device backup and transfer service'
    ],
    'computer_repair': [
      'Complete system rebuild',
      'Premium component upgrades',
      'Performance optimization',
      'Data migration and backup',
      'Remote support included'
    ],
    'tv_repair': [
      'Professional calibration service',
      'Premium component replacement',
      'Complete system diagnostics',
      'Setup and optimization',
      'Home theater integration'
    ],
    'beauty_services': [
      'Luxury service package',
      'High-end professional products',
      'Advanced treatment techniques',
      'VIP private service experience',
      'Complimentary product samples'
    ],
    'hair_stylist': [
      'Master stylist service',
      'Luxury salon products',
      'Advanced cut and coloring techniques',
      'Comprehensive treatment package',
      'Styling lesson included'
    ],
    'nail_technician': [
      'Master nail artist service',
      'Premium product application',
      'Advanced nail art techniques',
      'Hand/foot treatment package',
      'Take-home care kit included'
    ],
    'makeup_artist': [
      'Celebrity makeup artist service',
      'Luxury brand products',
      'Advanced application techniques',
      'Complete look styling',
      'Mini product kit included'
    ],
    'esthetician': [
      'Medical-grade facial treatment',
      'Advanced technology services',
      'Premium product application',
      'Comprehensive skin analysis',
      'Personalized treatment plan'
    ],
    'massage_therapist': [
      'Master therapist 90-minute session',
      'Advanced therapeutic techniques',
      'Premium oils and hot stones',
      'Full body treatment package',
      'Personalized aftercare consultation'
    ],
    'spa_services': [
      'VIP spa experience package',
      'Premium product suite',
      'Multiple deluxe treatments',
      'Private room service',
      'Complimentary refreshments'
    ],
    'waxing_services': [
      'Master esthetician service',
      'Premium painless techniques',
      'Luxury pre/post products',
      'Full body treatment options',
      'Personalized aftercare kit'
    ],
    'tanning_services': [
      'Advanced airbrush application',
      'Premium organic formula',
      'Custom color matching',
      'Extended wear protection',
      'Take-home maintenance kit'
    ],
    'eyebrow_threading': [
      'Celebrity brow artist service',
      'Advanced mapping technique',
      'Premium tinting included',
      'Precision detailing package',
      'Maintenance kit included'
    ],
    'lash_extensions': [
      'Master lash artist service',
      'Premium silk or mink lashes',
      'Volume application technique',
      'Customized design package',
      'Aftercare kit included'
    ],
    'facial_services': [
      'Medical-grade facial system',
      'Advanced technology treatment',
      'Premium product suite',
      'Multiple targeted therapies',
      'Personalized skin regimen consultation'
    ]
  };
  
  return [...commonFeatures, ...(serviceSpecificFeatures[jobType] || [])];
}

// Make functions available globally
window.renderQuoteGeneratorPage = renderQuoteGeneratorPage;
window.QuoteGenerator = {
  generateQuote,
  generateMultiQuote,
  handleGenerateQuote,
  displayQuoteResults,
  displayMultiQuoteResults,
  createQuoteCard,
  createFormGroup,
  createSelect,
  createInput,
  initGoogleMapsAutocomplete,
  getBasicDescription,
  getStandardDescription,
  getPremiumDescription,
  getBasicFeatures,
  getStandardFeatures,
  getPremiumFeatures,
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