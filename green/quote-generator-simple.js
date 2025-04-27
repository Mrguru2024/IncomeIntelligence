/**
 * Simplified Quote Generator Module
 * 
 * A basic version that doesn't rely on any module imports.
 */

// Initialize a global QuoteGenerator object for external access
window.QuoteGenerator = {
  renderPage: function(containerId) {
    // Get the container
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }
    
    console.log('Rendering simple quote generator in container:', containerId);
    
    // Clear container
    container.innerHTML = '';
    
    // Create page container
    const pageContainer = document.createElement('div');
    pageContainer.classList.add('quote-generator-container');
    
    // Add page header
    const header = document.createElement('div');
    header.innerHTML = `
      <h2>Professional Quote Generator</h2>
      <p>Create accurate, profitable quotes for your service business in seconds</p>
    `;
    header.style.marginBottom = '20px';
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
    generalTab.classList.add('form-tab', 'active');
    
    // Automotive Tab
    const autoTab = document.createElement('div');
    autoTab.textContent = 'Automotive Services';
    autoTab.style.padding = '12px 20px';
    autoTab.style.cursor = 'pointer';
    autoTab.style.color = 'var(--color-text-secondary)';
    autoTab.dataset.tab = 'automotive';
    autoTab.classList.add('form-tab');
    
    tabsContainer.appendChild(generalTab);
    tabsContainer.appendChild(autoTab);
    pageContainer.appendChild(tabsContainer);
    
    // Create a simple form
    const form = document.createElement('form');
    form.style.padding = '20px';
    form.style.backgroundColor = 'var(--color-card-bg)';
    form.style.borderRadius = '8px';
    form.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    // Add form fields
    form.innerHTML = `
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Service Type</label>
        <select style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border);">
          <option value="locksmith">Locksmith Services</option>
          <option value="plumber">Plumbing Services</option>
          <option value="electrician">Electrical Services</option>
          <option value="carpenter">Carpentry Services</option>
          <option value="hvac">HVAC Services</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Job Description</label>
        <textarea style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); min-height: 100px;" placeholder="Describe the job in detail..."></textarea>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Location</label>
        <input type="text" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border);" placeholder="City, State or ZIP code" />
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Hourly Rate ($)</label>
        <input type="number" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border);" value="75" min="0" step="5" />
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estimated Hours</label>
        <input type="number" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border);" value="2" min="0.5" step="0.5" />
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Materials Cost ($)</label>
        <input type="number" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border);" value="50" min="0" step="10" />
      </div>
      
      <button type="button" id="generate-quote-btn" style="background-color: var(--color-primary); color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Generate Quote</button>
    `;
    
    pageContainer.appendChild(form);
    
    // Add result section
    const resultSection = document.createElement('div');
    resultSection.id = 'quote-result-section';
    resultSection.style.marginTop = '20px';
    pageContainer.appendChild(resultSection);
    
    // Add event listener for the generate button
    setTimeout(() => {
      const generateButton = document.getElementById('generate-quote-btn');
      if (generateButton) {
        generateButton.addEventListener('click', function() {
          // Simple quote calculation
          const hourlyRate = parseFloat(form.querySelector('input[type="number"]').value) || 75;
          const hours = parseFloat(form.querySelectorAll('input[type="number"]')[1].value) || 2;
          const materials = parseFloat(form.querySelectorAll('input[type="number"]')[2].value) || 50;
          
          const laborCost = hourlyRate * hours;
          const subtotal = laborCost + materials;
          const tax = subtotal * 0.07; // 7% tax
          const total = subtotal + tax;
          
          // Display the result
          resultSection.innerHTML = `
            <div style="background-color: var(--color-card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">Quote Summary</h3>
              
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Labor (${hours} hours @ $${hourlyRate}/hr):</span>
                  <span>$${laborCost.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Materials:</span>
                  <span>$${materials.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Tax (7%):</span>
                  <span>$${tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border);">
                  <span>Total:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button style="background-color: var(--color-primary); color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">Save Quote</button>
                <button style="background-color: white; color: var(--color-primary); padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 4px; cursor: pointer;">Print Quote</button>
              </div>
            </div>
          `;
          
          // Scroll to the result
          resultSection.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }, 500);
    
    // Add page to container
    container.appendChild(pageContainer);
    
    return true;
  }
};

// Log initialization
console.log('Simple Quote Generator initialized successfully');