/**
 * Invoices Page Component for GREEN version
 * This file handles the invoice creation, management, and PDF generation functionality
 */

// Display loading state on page
function showLoadingState(containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  container.innerHTML = `
    <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
      <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(79, 70, 229, 0.2); border-radius: 50%; border-top-color: #4F46E5; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 16px; color: #6b7280; font-size: 16px;">Loading invoices...</p>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Render the invoices page
export function renderInvoicesPage(containerId = 'app-container') {
  console.log("Invoices page rendering started with container ID:", containerId);
  
  // Get container
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  console.log("Container found:", container);
  
  // Show loading state initially
  showLoadingState(containerId);
  
  // Build the invoices page with data
  fetch('/api/invoices')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    })
    .then(invoices => {
      renderInvoiceUI(container, invoices);
    })
    .catch(error => {
      console.error('Error loading invoices:', error);
      
      // Show error state
      container.innerHTML = `
        <div class="error-container" style="padding: 24px; text-align: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style="margin-top: 16px; font-size: 20px; color: #374151;">Error Loading Invoices</h2>
          <p style="margin-top: 8px; color: #6b7280;">${error.message || 'Failed to load invoice data'}</p>
          <button id="retry-invoices" style="margin-top: 16px; padding: 8px 16px; background-color: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
        </div>
      `;
      
      // Add retry button handler
      document.getElementById('retry-invoices')?.addEventListener('click', () => {
        renderInvoicesPage(containerId);
      });
    });
}

// Render the invoice UI with data
function renderInvoiceUI(container, invoices) {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };
  
  // Create status badge
  const getStatusBadge = (status) => {
    let color;
    
    switch (status.toLowerCase()) {
      case 'paid':
        color = 'green';
        break;
      case 'pending':
        color = 'orange';
        break;
      case 'overdue':
        color = 'red';
        break;
      case 'draft':
        color = 'gray';
        break;
      default:
        color = 'blue';
    }
    
    return `
      <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: var(--color-${color}-100); color: var(--color-${color}-800);">
        ${status}
      </span>
    `;
  };

  // Build the UI
  container.innerHTML = `
    <div class="invoices-container" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: var(--color-text-primary);">Invoices</h1>
        <button id="create-invoice-btn" style="padding: 8px 16px; background-color: var(--color-primary); color: white; border: none; border-radius: 6px; font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Invoice
        </button>
      </div>
      
      <div style="background-color: var(--color-background-card); border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        ${invoices && invoices.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-border); text-align: left;">
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Invoice #</th>
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Client</th>
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Amount</th>
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Date</th>
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Status</th>
                <th style="padding: 16px; font-weight: 500; color: var(--color-text-secondary);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(invoice => `
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 16px; color: var(--color-text-primary);">#${invoice.invoiceNumber || invoice.id}</td>
                  <td style="padding: 16px; color: var(--color-text-primary);">${invoice.clientName}</td>
                  <td style="padding: 16px; color: var(--color-text-primary); font-weight: 500;">${formatCurrency(invoice.totalAmount)}</td>
                  <td style="padding: 16px; color: var(--color-text-secondary);">${formatDate(invoice.issuedDate)}</td>
                  <td style="padding: 16px;">${getStatusBadge(invoice.status)}</td>
                  <td style="padding: 16px;">
                    <div style="display: flex; gap: 8px;">
                      <button class="view-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button class="download-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="padding: 48px 24px; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 style="margin-top: 16px; font-size: 18px; color: var(--color-text-primary);">No Invoices Yet</h3>
            <p style="margin-top: 8px; color: var(--color-text-secondary); max-width: 400px; margin-left: auto; margin-right: auto;">
              Start creating invoices for your clients and get paid faster. Track payment status and send reminders all in one place.
            </p>
            <button id="empty-create-invoice-btn" style="margin-top: 16px; padding: 8px 16px; background-color: var(--color-primary); color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Create Your First Invoice
            </button>
          </div>
        `}
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('create-invoice-btn')?.addEventListener('click', openCreateInvoiceModal);
  document.getElementById('empty-create-invoice-btn')?.addEventListener('click', openCreateInvoiceModal);
  
  // Add event listeners to view and download buttons
  document.querySelectorAll('.view-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      viewInvoice(invoiceId);
    });
  });
  
  document.querySelectorAll('.download-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      downloadInvoicePdf(invoiceId);
    });
  });
}

// Open invoice creation modal
function openCreateInvoiceModal() {
  // Show an alert message for now
  alert('Coming Soon! Invoice creation functionality will be available in the next update.');
  
  // In a future update, we would implement a proper modal here
}

// View invoice details
function viewInvoice(invoiceId) {
  // Show an alert message for now
  alert('Coming Soon! Invoice details view will be available in the next update.');
  
  // In a future update, we would implement a detail view
}

// Download invoice as PDF
function downloadInvoicePdf(invoiceId) {
  // Show an alert message for now
  alert('Coming Soon! PDF download functionality will be available in the next update.');
  
  // In a future update, we would implement PDF generation
}

// No need for export default
// We're already using the named export for renderInvoicesPage at line 30