/**
 * Quote Generator Module - Fixed Version
 * 
 * This module provides a quote generation system for service providers (locksmiths, 
 * tradespeople, contractors) to create profitable quotes based on job details, 
 * market rates, and other factors.
 */

// Add debugging
console.log('Quote Generator module initialized');

// Global function that will be directly available to the application
function renderQuoteGeneratorPage(containerId) {
  console.log('renderQuoteGeneratorPage called with containerId:', containerId);
  
  // Basic implementation to show the function is working
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return false;
  }
  
  // Create a simple quote form with the essential functionality
  container.innerHTML = `
    <div class="quote-generator-container">
      <h2>Professional Service Quote Generator</h2>
      <p>Create accurate, profitable quotes for your service business</p>
      
      <div class="quote-tabs">
        <div class="form-tab active" data-tab="general">General Services</div>
        <div class="form-tab" data-tab="automotive">Auto Services</div>
      </div>
      
      <form id="general-quote-form" class="quote-form">
        <div class="form-group">
          <label>Service Type</label>
          <select name="serviceType">
            <option value="locksmith">Locksmith Services</option>
            <option value="plumbing">Plumbing Services</option>
            <option value="electrical">Electrical Services</option>
            <option value="hvac">HVAC Services</option>
            <option value="carpentry">Carpentry</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Job Description</label>
          <textarea name="jobDescription" placeholder="Describe the job in detail..."></textarea>
        </div>
        
        <div class="form-group">
          <label>Estimated Hours</label>
          <input type="number" name="hours" value="2" min="0.5" step="0.5">
        </div>
        
        <div class="form-group">
          <label>Hourly Rate ($)</label>
          <input type="number" name="hourlyRate" value="75" min="0">
        </div>
        
        <div class="form-group">
          <label>Materials Cost ($)</label>
          <input type="number" name="materialsCost" value="50" min="0">
        </div>
        
        <div class="form-group">
          <label>Travel Distance (miles)</label>
          <input type="number" name="travelDistance" value="5" min="0">
        </div>
        
        <button type="button" id="generate-quote-btn" class="primary-button">Generate Quote</button>
      </form>
      
      <form id="auto-quote-form" class="quote-form" style="display: none;">
        <div class="form-group">
          <label>Service Type</label>
          <select name="autoServiceType">
            <option value="oil-change">Oil Change</option>
            <option value="tire-rotation">Tire Rotation</option>
            <option value="brake-service">Brake Service</option>
            <option value="engine-tune">Engine Tune-up</option>
            <option value="diagnostic">Diagnostic</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Starting Address</label>
          <input type="text" name="startAddress" id="auto-address-input" placeholder="Your location">
        </div>
        
        <div class="form-group">
          <label>Customer Location</label>
          <input type="text" name="endAddress" id="auto-destination-input" placeholder="Customer location">
        </div>
        
        <div class="form-group">
          <label>Vehicle Type</label>
          <select name="vehicleType">
            <option value="sedan">Sedan</option>
            <option value="suv">SUV/Crossover</option>
            <option value="truck">Truck</option>
            <option value="luxury">Luxury Vehicle</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Service Complexity</label>
          <select name="complexity">
            <option value="standard">Standard</option>
            <option value="complex">Complex</option>
            <option value="specialized">Specialized</option>
          </select>
        </div>
        
        <button type="button" id="auto-generate-quote-btn" class="primary-button">Generate Auto Service Quote</button>
      </form>
      
      <div id="quote-result"></div>
    </div>
  `;
  
  // Setup event listeners
  setupQuoteGeneratorEvents();
  
  return true;
}

// Set up event listeners for the quote generator forms
function setupQuoteGeneratorEvents() {
  // Tab switching
  const tabs = document.querySelectorAll('.form-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show/hide forms based on tab
      const isGeneral = this.getAttribute('data-tab') === 'general';
      document.getElementById('general-quote-form').style.display = isGeneral ? 'block' : 'none';
      document.getElementById('auto-quote-form').style.display = isGeneral ? 'none' : 'block';
    });
  });
  
  // General quote generation
  const generateBtn = document.getElementById('generate-quote-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      const form = document.getElementById('general-quote-form');
      const hours = parseFloat(form.querySelector('[name="hours"]').value) || 0;
      const hourlyRate = parseFloat(form.querySelector('[name="hourlyRate"]').value) || 0;
      const materialsCost = parseFloat(form.querySelector('[name="materialsCost"]').value) || 0;
      const travelDistance = parseFloat(form.querySelector('[name="travelDistance"]').value) || 0;
      
      const laborCost = hours * hourlyRate;
      const travelCost = travelDistance * 0.58; // $0.58 per mile
      const subtotal = laborCost + materialsCost + travelCost;
      const tax = subtotal * 0.07; // 7% tax
      const total = subtotal + tax;
      
      // Display quote
      displayQuote({
        laborCost,
        materialsCost,
        travelCost,
        subtotal,
        tax,
        total,
        hours,
        hourlyRate
      });
    });
  }
  
  // Auto service quote generation
  const autoGenerateBtn = document.getElementById('auto-generate-quote-btn');
  if (autoGenerateBtn) {
    autoGenerateBtn.addEventListener('click', function() {
      const form = document.getElementById('auto-quote-form');
      const serviceType = form.querySelector('[name="autoServiceType"]').value;
      const vehicleType = form.querySelector('[name="vehicleType"]').value;
      const complexity = form.querySelector('[name="complexity"]').value;
      
      // Base prices by service type
      const basePrices = {
        'oil-change': 35,
        'tire-rotation': 20,
        'brake-service': 150,
        'engine-tune': 100,
        'diagnostic': 80
      };
      
      // Vehicle type multipliers
      const vehicleMultipliers = {
        'sedan': 1,
        'suv': 1.2,
        'truck': 1.3,
        'luxury': 1.5
      };
      
      // Complexity multipliers
      const complexityMultipliers = {
        'standard': 1,
        'complex': 1.3,
        'specialized': 1.6
      };
      
      // Calculate service cost
      const basePrice = basePrices[serviceType] || 50;
      const vehicleMultiplier = vehicleMultipliers[vehicleType] || 1;
      const complexityMultiplier = complexityMultipliers[complexity] || 1;
      
      const serviceCost = basePrice * vehicleMultiplier * complexityMultiplier;
      const partsCost = serviceCost * 0.4; // Parts cost is 40% of service cost
      const subtotal = serviceCost + partsCost;
      const tax = subtotal * 0.07; // 7% tax
      const total = subtotal + tax;
      
      // Display auto service quote
      displayAutoQuote({
        serviceType,
        vehicleType,
        complexity,
        serviceCost,
        partsCost,
        subtotal,
        tax,
        total
      });
    });
  }
}

// Display general service quote
function displayQuote(quoteData) {
  const resultDiv = document.getElementById('quote-result');
  if (!resultDiv) return;
  
  resultDiv.innerHTML = `
    <div class="quote-result-container">
      <h3>Service Quote</h3>
      <div class="quote-breakdown">
        <div class="breakdown-row">
          <span>Labor (${quoteData.hours} hrs @ $${quoteData.hourlyRate}/hr)</span>
          <span>$${quoteData.laborCost.toFixed(2)}</span>
        </div>
        <div class="breakdown-row">
          <span>Materials</span>
          <span>$${quoteData.materialsCost.toFixed(2)}</span>
        </div>
        <div class="breakdown-row">
          <span>Travel</span>
          <span>$${quoteData.travelCost.toFixed(2)}</span>
        </div>
        <div class="breakdown-row subtotal">
          <span>Subtotal</span>
          <span>$${quoteData.subtotal.toFixed(2)}</span>
        </div>
        <div class="breakdown-row">
          <span>Tax (7%)</span>
          <span>$${quoteData.tax.toFixed(2)}</span>
        </div>
        <div class="breakdown-row total">
          <span>Total</span>
          <span>$${quoteData.total.toFixed(2)}</span>
        </div>
      </div>
      <div class="quote-actions">
        <button class="primary-button">Save Quote</button>
        <button class="secondary-button">Print Quote</button>
      </div>
    </div>
  `;
}

// Display auto service quote
function displayAutoQuote(quoteData) {
  const resultDiv = document.getElementById('quote-result');
  if (!resultDiv) return;
  
  // Format service type for display
  const serviceTypeDisplay = {
    'oil-change': 'Oil Change',
    'tire-rotation': 'Tire Rotation',
    'brake-service': 'Brake Service',
    'engine-tune': 'Engine Tune-up',
    'diagnostic': 'Diagnostic'
  }[quoteData.serviceType] || quoteData.serviceType;
  
  resultDiv.innerHTML = `
    <div class="quote-result-container">
      <h3>Auto Service Quote</h3>
      <div class="quote-breakdown">
        <div class="breakdown-row">
          <span>Service: ${serviceTypeDisplay}</span>
          <span>$${quoteData.serviceCost.toFixed(2)}</span>
        </div>
        <div class="breakdown-row">
          <span>Parts & Materials</span>
          <span>$${quoteData.partsCost.toFixed(2)}</span>
        </div>
        <div class="breakdown-row subtotal">
          <span>Subtotal</span>
          <span>$${quoteData.subtotal.toFixed(2)}</span>
        </div>
        <div class="breakdown-row">
          <span>Tax (7%)</span>
          <span>$${quoteData.tax.toFixed(2)}</span>
        </div>
        <div class="breakdown-row total">
          <span>Total</span>
          <span>$${quoteData.total.toFixed(2)}</span>
        </div>
      </div>
      <div class="quote-actions">
        <button class="primary-button">Save Quote</button>
        <button class="secondary-button">Print Quote</button>
      </div>
    </div>
  `;
}

// Make the function globally available
window.renderQuoteGeneratorPage = renderQuoteGeneratorPage;