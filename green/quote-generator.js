/**
 * Quote Generator Module - Simple Version
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

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
  "roofer": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 90, "west": 110, "south": 80
  },
  "flooring_specialist": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
  },
  "window_installer": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 85, "west": 100, "south": 75
  },
  "appliance_repair": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 80, "west": 95, "south": 70
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
  
  // Beauty services
  "beauty_services": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 75, "west": 95, "south": 70
  },
  "hair_stylist": {
    "northeast": 105, "midwest": 85, "southeast": 80, "southwest": 85, "west": 110, "south": 80
  },
  "nail_technician": {
    "northeast": 75, "midwest": 65, "southeast": 60, "southwest": 65, "west": 80, "south": 60
  },
  "makeup_artist": {
    "northeast": 115, "midwest": 95, "southeast": 90, "southwest": 95, "west": 120, "south": 90
  },
  "esthetician": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 80, "west": 100, "south": 75
  },
  "massage_therapist": {
    "northeast": 105, "midwest": 90, "southeast": 85, "southwest": 90, "west": 110, "south": 85
  },
  "eyebrow_threading": {
    "northeast": 70, "midwest": 60, "southeast": 55, "southwest": 60, "west": 75, "south": 55
  },
  "spa_services": {
    "northeast": 110, "midwest": 95, "southeast": 90, "southwest": 95, "west": 115, "south": 90
  },
  "waxing_services": {
    "northeast": 75, "midwest": 65, "southeast": 60, "southwest": 65, "west": 80, "south": 60
  },
  "tanning_services": {
    "northeast": 70, "midwest": 60, "southeast": 55, "southwest": 60, "west": 75, "south": 55
  },
  "lash_extensions": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 80, "west": 100, "south": 75
  },
  "facial_services": {
    "northeast": 110, "midwest": 95, "southeast": 90, "southwest": 95, "west": 115, "south": 90
  },
  
  // Repair services
  "electronic_repair": {
    "northeast": 90, "midwest": 75, "southeast": 70, "southwest": 75, "west": 95, "south": 70
  },
  "cellphone_repair": {
    "northeast": 85, "midwest": 70, "southeast": 65, "southwest": 70, "west": 90, "south": 65
  },
  "computer_repair": {
    "northeast": 95, "midwest": 80, "southeast": 75, "southwest": 80, "west": 100, "south": 75
  },
  "tv_repair": {
    "northeast": 100, "midwest": 85, "southeast": 80, "southwest": 85, "west": 105, "south": 80
  },
  "automotive_repair": {
    "northeast": 115, "midwest": 100, "southeast": 95, "southwest": 100, "west": 120, "south": 95
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
    
    // Define service subcategories with detailed options for all service types
    const serviceSubcategories = {
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
  
  // Generate the three quote options
  const basicQuote = generateQuoteForTier('basic', data, commonData, baseRate);
  const standardQuote = generateQuoteForTier('standard', data, commonData, baseRate);
  const premiumQuote = generateQuoteForTier('premium', data, commonData, baseRate);
  
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
  const materialsTax = materialsCost * commonData.taxRate;
  const subtotal = laborCost + materialsCost;
  const total = subtotal + materialsTax;
  
  // Calculate profit
  const targetMarginDecimal = targetMargin / 100;
  const cost = subtotal / (1 - targetMarginDecimal);
  const profit = total - cost;
  const actualProfitMargin = (profit / total) * 100;
  
  // Generate profit assessment
  let profitAssessment;
  if (actualProfitMargin < 15) {
    profitAssessment = 'Low profit margin. Consider reducing costs or increasing prices.';
  } else if (actualProfitMargin < 25) {
    profitAssessment = 'Acceptable profit margin, but could be improved.';
  } else {
    profitAssessment = 'Good profit margin. This quote should be profitable.';
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
function generateAIRecommendations(quote) {
  const recommendations = [];
  
  // Profit margin recommendations
  if (quote.actualProfitMargin < 15) {
    recommendations.push(`Consider increasing your rates as your current profit margin of ${quote.actualProfitMargin.toFixed(1)}% is below industry standard.`);
    recommendations.push(`For ${quote.jobTypeDisplay} in ${quote.region}, the average hourly rate is $${(marketRates[quote.jobType]?.[quote.region] || 85).toFixed(2)}.`);
  } else if (quote.actualProfitMargin > 40) {
    recommendations.push(`Your profit margin is high at ${quote.actualProfitMargin.toFixed(1)}%. Consider offering premium services or upgrades to justify premium pricing.`);
  }
  
  // Service-specific recommendations
  if (isBeautyService(quote.jobType)) {
    recommendations.push(`Beauty service customers often value add-ons. Consider suggesting complementary treatments.`);
    if (quote.tier === 'premium') {
      recommendations.push(`Premium beauty clients typically spend 30% more on take-home products. Include retail options in your quote.`);
    }
  } else if (isElectronicRepair(quote.jobType)) {
    recommendations.push(`Based on market data, ${quote.jobTypeDisplay} clients often want extended warranties. Consider offering a 90-day warranty option.`);
    if (quote.tier !== 'basic') {
      recommendations.push(`Advanced diagnostics should be emphasized for all non-basic electronic repair tiers.`);
    }
  } else if (isAutomotiveRepair(quote.jobType)) {
    recommendations.push(`Consider offering a complimentary follow-up check after 30 days, which increases customer retention by up to 40%.`);
    if (quote.laborHours > 4) {
      recommendations.push(`For jobs over 4 hours, offering a courtesy vehicle/ride service increases customer satisfaction by 65%.`);
    }
  } else if (quote.jobType === 'plumber' || quote.jobType === 'electrician') {
    if (quote.tier === 'premium') {
      recommendations.push(`Premium ${quote.jobTypeDisplay} clients value preventative maintenance plans. Consider offering an annual service package.`);
    }
    recommendations.push(`Jobs in ${quote.location} typically require permits. Ensure you've factored in permitting costs and time.`);
  }
  
  // Season-specific recommendations
  const currentMonth = new Date().getMonth();
  if ((quote.jobType === 'hvac' || quote.jobType === 'plumber') && (currentMonth < 2 || currentMonth > 9)) {
    recommendations.push(`During winter months, emergency calls for ${quote.jobTypeDisplay} increase by 40%. Consider adjusting your availability.`);
  } else if (quote.jobType === 'landscaper' && (currentMonth > 2 && currentMonth < 9)) {
    recommendations.push(`Spring/Summer is peak season for landscaping. Consider offering package deals for recurring service.`);
  }
  
  // Emergency pricing
  if (quote.emergency) {
    recommendations.push(`Your emergency rate is 50% above standard. The market average for ${quote.region} is 35-75% higher, so you're appropriately priced.`);
  }
  
  // Materials recommendations
  if (quote.materialsCost > quote.laborCost * 1.5) {
    recommendations.push(`Your materials cost (${quote.materialsCost.toFixed(2)}) is high relative to labor. Verify material estimates and consider alternate suppliers.`);
  }
  
  // Location-specific recommendations
  if (quote.region === 'west' || quote.region === 'northeast') {
    recommendations.push(`${quote.region === 'west' ? 'Western' : 'Northeastern'} markets typically support 10-15% higher pricing than national averages for ${quote.jobTypeDisplay}.`);
  }
  
  // Random selection to prevent overwhelming with too many tips
  if (recommendations.length > 3) {
    // Shuffle and pick 3 recommendations
    for (let i = recommendations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
    }
    return recommendations.slice(0, 3);
  }
  
  return recommendations;
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
  const profit = total - costBasis;
  const actualProfitMargin = (profit / total) * 100;
  
  // Profit assessment based on target margin
  let profitAssessment;
  if (actualProfitMargin < targetMarginDecimal * 100 - 5) {
    profitAssessment = 'Margin below target due to tax adjustments. Consider increasing base price.';
  } else if (Math.abs(actualProfitMargin - targetMarginDecimal * 100) <= 5) {
    profitAssessment = `On target profit margin of approximately ${targetMarginDecimal * 100}%.`;
  } else if (actualProfitMargin > targetMarginDecimal * 100 + 5) {
    profitAssessment = 'Margin exceeding target. Good pricing structure.';
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
  if (isProductService(quotes.basic.jobType) && quotes.basic.quantity > 1) {
    const quantityInfo = document.createElement('p');
    quantityInfo.textContent = `Product Quantity: ${quotes.basic.quantity} units`;
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
  
  // Add price-specific features
  if (total >= highPriceThreshold) {
    // High-price features
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
      priceFeatures.push('Expedited service guarantee');
      priceFeatures.push('Premium material upgrades included');
    }
  } else if (total >= midPriceThreshold) {
    // Mid-price features
    if (isBeautyService(jobType)) {
      priceFeatures.push('Premium product application');
    } else if (isElectronicRepair(jobType)) {
      priceFeatures.push('90-day warranty on parts and labor');
    } else if (isAutomotiveRepair(jobType)) {
      priceFeatures.push('Complimentary vehicle health report');
    } else {
      priceFeatures.push('Quality assurance follow-up');
    }
  }
  
  // Experience-based features
  const experienceFeatures = [];
  if (experienceLevel === 'expert') {
    if (isBeautyService(jobType)) {
      experienceFeatures.push('Service by master-certified beauty professional');
    } else if (isElectronicRepair(jobType)) {
      experienceFeatures.push('Repair by certified master technician');
    } else if (isAutomotiveRepair(jobType)) {
      experienceFeatures.push('Service by ASE Master certified technician');
    } else {
      experienceFeatures.push('Work completed by industry-certified expert');
    }
  } else if (experienceLevel === 'senior') {
    experienceFeatures.push('Service by senior professional with 10+ years experience');
  }
  
  // Quantity-based features (only for product services)
  const quantityFeatures = [];
  if (quantity > 1) {
    if (quantity >= 5) {
      quantityFeatures.push(`Multi-unit discount: ${Math.min(25, quantity * 5)}% savings`);
      quantityFeatures.push('Bulk service efficiency guarantee');
    } else if (quantity >= 3) {
      quantityFeatures.push(`Multi-unit discount: ${quantity * 5}% savings`);
    } else if (quantity === 2) {
      quantityFeatures.push('Second unit discount applied');
    }
  }
  
  // Combine all features, removing duplicates
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
  
  // Features list
  const featuresList = document.createElement('ul');
  featuresList.style.listStyleType = 'none';
  featuresList.style.padding = '0';
  featuresList.style.marginBottom = '16px';
  
  quote.features.forEach((feature, index) => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.marginBottom = '8px';
    item.style.fontSize = '14px';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'flex-start';
    
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
        quote.features.push(newFeature.trim());
        
        // Clear and rebuild the features list
        featuresList.innerHTML = '';
        createQuoteCard(quote, tierName, bgColor, container, recommended);
        
        if (window.showToast) {
          window.showToast('Feature added', 'success');
        }
      }
    });
    
    featuresList.appendChild(addItem);
  }
  
  cardBody.appendChild(featuresList);
  
  // Cost breakdown
  const breakdownTitle = document.createElement('h5');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '14px';
  breakdownTitle.style.fontWeight = 'bold';
  breakdownTitle.style.marginBottom = '8px';
  cardBody.appendChild(breakdownTitle);
  
  // Create service-specific breakdown items
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
  if (isProductService && quote.quantity > 1) {
    breakdownItems.push({
      label: `Product Quantity: ${quote.quantity} units`,
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
      cardBody.appendChild(row);
      return;
    }
    
    const value = document.createElement('span');
    value.textContent = `$${item.value.toFixed(2)}`;
    
    row.appendChild(label);
    row.appendChild(value);
    cardBody.appendChild(row);
  });
  
  // Actions
  const actions = document.createElement('div');
  actions.style.marginTop = '16px';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.flexWrap = 'wrap';
  
  // Select button
  const selectButton = document.createElement('button');
  selectButton.textContent = 'Select';
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
  
  selectButton.addEventListener('click', () => {
    displayQuoteResults(quote);
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
  
  const breakdownTitle = document.createElement('h4');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '16px';
  breakdownTitle.style.fontWeight = 'bold';
  breakdownTitle.style.marginBottom = '12px';
  
  breakdown.appendChild(breakdownTitle);
  
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
  if (isProductService(result.jobType) && result.quantity > 1) {
    breakdownItems.push({
      label: `Product Quantity: ${result.quantity} units`,
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
  const aiRecommendations = generateAIRecommendations(result);
  const aiSection = document.createElement('div');
  aiSection.style.marginTop = '16px';
  aiSection.style.borderTop = '1px solid var(--color-border-light, #e5e7eb)';
  aiSection.style.paddingTop = '16px';
  
  const aiTitle = document.createElement('h5');
  aiTitle.textContent = 'AI-Powered Suggestions';
  aiTitle.style.fontSize = '14px';
  aiTitle.style.fontWeight = 'bold';
  aiTitle.style.marginBottom = '8px';
  aiTitle.style.display = 'flex';
  aiTitle.style.alignItems = 'center';
  
  // Add AI icon
  const aiIcon = document.createElement('span');
  aiIcon.innerHTML = '🤖';
  aiIcon.style.marginRight = '6px';
  aiTitle.prepend(aiIcon);
  
  aiSection.appendChild(aiTitle);
  
  // Add recommendations
  const recList = document.createElement('ul');
  recList.style.listStyleType = 'none';
  recList.style.padding = '0';
  recList.style.margin = '0';
  
  aiRecommendations.forEach(rec => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.marginBottom = '6px';
    item.style.fontSize = '13px';
    
    const bulletPoint = document.createElement('span');
    bulletPoint.innerHTML = '•';
    bulletPoint.style.color = 'var(--color-primary, #4F46E5)';
    bulletPoint.style.marginRight = '8px';
    bulletPoint.style.fontWeight = 'bold';
    
    const text = document.createElement('span');
    text.textContent = rec;
    
    item.appendChild(bulletPoint);
    item.appendChild(text);
    recList.appendChild(item);
  });
  
  aiSection.appendChild(recList);
  profitDetails.appendChild(aiSection);
  
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
          ${isProductService(quote.jobType) && quote.quantity > 1 ? `
          <div class="quote-info-row">
            <div><strong>Product Quantity:</strong></div>
            <div>${quote.quantity} units</div>
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
          description: isProductService(quote.jobType) && quote.quantity > 1 ? 
            `Materials (${quote.quantity} units)` : 'Materials',
          quantity: isProductService(quote.jobType) ? quote.quantity : 1,
          unit: 'lot',
          unitPrice: isProductService(quote.jobType) && quote.quantity > 1 ? 
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