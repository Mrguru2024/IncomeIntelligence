/**
 * Invoices Page Component for GREEN version
 * This file handles the invoice creation, management, and PDF generation functionality
 */

// Cache for invoices data to avoid unnecessary API calls
let invoicesCache = null;

// User customization preferences (for Pro users)
const defaultCustomizationOptions = {
  logo: null, // Base64 encoded image
  colorTheme: 'default', // default, blue, green, purple, orange, red
  fontFamily: 'Inter, sans-serif', // Default font
  headerStyle: 'standard', // standard, minimal, bold
  footerText: '', // Custom footer text
};

// Current customization options
let invoiceCustomizationOptions = { ...defaultCustomizationOptions };

// Pro-only features check
function isProUser() {
  try {
    // Import from auth.js if available
    if (typeof getUserSubscriptionTier === 'function') {
      const tier = getUserSubscriptionTier();
      return tier === 'pro' || tier === 'lifetime';
    }
    
    // Fallback - try to get tier from sidebar user object
    if (window.user && window.user.subscriptionStatus) {
      return window.user.subscriptionStatus === 'pro' || window.user.subscriptionStatus === 'lifetime';
    }
    
    // For demo purposes, consider all users as Pro
    return true;
  } catch (error) {
    console.error('Error checking pro status:', error);
    // Default to true for testing
    return true;
  }
}

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

// Helper for showing notifications
function showNotification(message, type = 'success') {
  // Simple notification implementation with vanilla JS
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 16px';
  notification.style.borderRadius = '6px';
  notification.style.maxWidth = '300px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.zIndex = '9999';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '8px';
  notification.style.animation = 'slide-in 0.3s ease-out forwards';
  
  // Set colors based on notification type
  if (type === 'success') {
    notification.style.backgroundColor = '#10B981';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#EF4444';
    notification.style.color = 'white';
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#F59E0B';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = '#3B82F6';
    notification.style.color = 'white';
  }
  
  // Add icon based on type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  } else {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  }
  
  const icon = document.createElement('div');
  icon.innerHTML = iconSvg;
  
  const text = document.createElement('div');
  text.textContent = message;
  text.style.flex = '1';
  
  notification.appendChild(icon);
  notification.appendChild(text);
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'inherit';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.padding = '0';
  closeBtn.style.marginLeft = '8px';
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  closeBtn.addEventListener('click', () => {
    notification.style.animation = 'slide-out 0.3s ease-in forwards';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  });
  
  notification.appendChild(closeBtn);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slide-out 0.3s ease-in forwards';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 5000);
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
}

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
        <div style="display: flex; gap: 12px; align-items: center;">
          ${isProUser() ? `
            <button id="customize-invoices-btn" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: var(--color-text-secondary); font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Customize
              <span style="display: inline-flex; align-items: center; justify-content: center; background: #6366F1; color: white; font-size: 10px; font-weight: bold; height: 18px; padding: 0 6px; border-radius: 9px; margin-left: 4px;">PRO</span>
            </button>
          ` : ''}
          <button id="create-invoice-btn" style="padding: 8px 16px; background-color: var(--color-primary); color: white; border: none; border-radius: 6px; font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Invoice
          </button>
        </div>
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
                    <div class="action-buttons" style="display: flex; gap: 8px; flex-wrap: nowrap;">
                      <button class="view-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;" title="View Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button class="edit-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;" title="Edit Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="send-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;" title="Send Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                      <button class="download-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: var(--color-primary); cursor: pointer;" title="Download Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
                      <button class="delete-invoice-btn" data-id="${invoice.id}" style="padding: 6px; background: transparent; border: none; color: #EF4444; cursor: pointer;" title="Delete Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
  
  // Save the invoices data for later use
  invoicesCache = invoices;
  
  // Add event listeners
  document.getElementById('create-invoice-btn')?.addEventListener('click', openCreateInvoiceModal);
  document.getElementById('empty-create-invoice-btn')?.addEventListener('click', openCreateInvoiceModal);
  
  // Add customize button event listener for pro users
  document.getElementById('customize-invoices-btn')?.addEventListener('click', openCustomizationModal);
  
  // Add event listeners to all buttons
  document.querySelectorAll('.view-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      viewInvoice(invoiceId);
    });
  });
  
  document.querySelectorAll('.edit-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      editInvoice(invoiceId);
    });
  });
  
  document.querySelectorAll('.send-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      sendInvoice(invoiceId);
    });
  });
  
  document.querySelectorAll('.download-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      downloadInvoicePdf(invoiceId);
    });
  });
  
  document.querySelectorAll('.delete-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invoiceId = e.currentTarget.getAttribute('data-id');
      deleteInvoice(invoiceId);
    });
  });
  
  // Make the table responsive
  makeTableResponsive();
}

// Helper function to ensure table is responsive on mobile and foldable devices
function makeTableResponsive() {
  // Check for different device types
  const isFoldableDevice = window.innerWidth < 400;
  const isMobile = window.innerWidth < 768;
  
  if (isMobile || isFoldableDevice) {
    // Get the table
    const table = document.querySelector('.invoices-container table');
    if (!table) return;
    
    // Add responsive styles
    table.style.display = 'block';
    table.style.overflowX = 'auto';
    
    // Apply specific styles for foldable devices
    if (isFoldableDevice) {
      console.log("Applying foldable device optimizations to invoice table");
      table.style.fontSize = '13px';
      
      // Add more compact container style for foldable
      const container = document.querySelector('.invoices-container');
      if (container) {
        container.style.padding = '8px';
      }
    }
    
    // Handle column visibility for small screens
    const allRows = table.querySelectorAll('tr');
    allRows.forEach(row => {
      // Hide date column on all mobile devices
      const dateCell = row.children[3];
      if (dateCell) {
        dateCell.style.display = 'none';
      }
      
      // For foldable devices, hide the status column as well
      if (isFoldableDevice) {
        const statusCell = row.children[4];
        if (statusCell) {
          statusCell.style.display = 'none';
        }
        
        // Make client name column narrower on foldable
        const clientCell = row.children[1];
        if (clientCell) {
          clientCell.style.maxWidth = '80px';
          clientCell.style.overflow = 'hidden';
          clientCell.style.textOverflow = 'ellipsis';
          clientCell.style.whiteSpace = 'nowrap';
        }
      }
    });
    
    // Make action buttons scrollable in their cell
    const actionCells = table.querySelectorAll('td:last-child');
    actionCells.forEach(cell => {
      // Smaller action area for foldable
      if (isFoldableDevice) {
        cell.style.maxWidth = '80px';
      } else {
        cell.style.maxWidth = '100px';
      }
      cell.style.overflow = 'auto';
    });
  }
}

// Open invoice creation modal
function openCreateInvoiceModal() {
  // Create the modal element
  const modal = document.createElement('div');
  modal.className = 'invoice-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';
  modal.style.padding = '20px';
  
  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '100%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Add heading and close button
  modalContent.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #111827;">Create New Invoice</h2>
        <button class="close-modal" style="background: transparent; border: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <form id="create-invoice-form" style="padding: 20px;">
      <div style="margin-bottom: 16px;">
        <label for="client-name" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Name</label>
        <input type="text" id="client-name" name="clientName" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="client-email" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Email</label>
        <input type="email" id="client-email" name="clientEmail" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="client-phone" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Phone Number</label>
        <input type="tel" id="client-phone" name="clientPhone" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" placeholder="(optional)">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Delivery Method</label>
        <div style="display: flex; gap: 16px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="email" checked style="margin-right: 8px;">
            <span>Email</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="sms" style="margin-right: 8px;">
            <span>SMS</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="both" style="margin-right: 8px;">
            <span>Both</span>
          </label>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <label for="issue-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Issue Date</label>
          <input type="date" id="issue-date" name="issuedDate" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
        </div>
        <div>
          <label for="due-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Due Date</label>
          <input type="date" id="due-date" name="dueDate" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Invoice Items</label>
        <div id="invoice-items" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
          <div class="invoice-item" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
            <script>
              // Check if we're on a foldable device
              const isFoldableDevice = window.innerWidth < 400;
              
              // Document write the appropriate grid based on device size
              if (isFoldableDevice) {
                document.write(
                  '<div style="display: grid; grid-template-rows: auto auto auto; gap: 6px;">' +
                  '<input type="text" name="description[]" placeholder="Description" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;" required>'
                    + '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">' +
                      '<input type="number" name="quantity[]" placeholder="Qty" min="1" value="1" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;" required>' +
                      '<input type="number" name="price[]" placeholder="Price" min="0" step="0.01" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;" required>' +
                    '</div>' +
                  '</div>'
                );
              } else {
                document.write(
                  '<div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">' +
                    '<input type="text" name="description[]" placeholder="Description" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>' +
                    '<input type="number" name="quantity[]" placeholder="Quantity" min="1" value="1" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>' +
                    '<input type="number" name="price[]" placeholder="Price" min="0" step="0.01" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>' +
                  '</div>'
                );
              }
            </script>
          </div>
        </div>
        <button type="button" id="add-item-btn" style="width: 100%; padding: 8px; background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 6px; color: #6b7280; cursor: pointer;">
          + Add Another Item
        </button>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="invoice-notes" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Notes</label>
        <textarea id="invoice-notes" name="notes" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 80px;"></textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
        <button type="button" class="cancel-btn" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563;">Cancel</button>
        <button type="submit" style="padding: 8px 16px; background-color: var(--color-primary); border: none; border-radius: 6px; color: white; font-weight: 500;">Create Invoice</button>
      </div>
    </form>
  `;
  
  // Add the modal to the DOM
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Set default dates
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14); // Set due date to 14 days from now
  
  document.getElementById('issue-date').valueAsDate = today;
  document.getElementById('due-date').valueAsDate = dueDate;
  
  // Add event listeners
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.querySelector('.cancel-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.getElementById('add-item-btn').addEventListener('click', () => {
    const itemsContainer = document.getElementById('invoice-items');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.style.marginBottom = '12px';
    newItem.style.paddingBottom = '12px';
    newItem.style.borderBottom = '1px solid #e5e7eb';
    
    newItem.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px;">
        <input type="text" name="description[]" placeholder="Description" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <input type="number" name="quantity[]" placeholder="Quantity" min="1" value="1" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <input type="number" name="price[]" placeholder="Price" min="0" step="0.01" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <button type="button" class="remove-item" style="padding: 4px; background: transparent; border: none; color: #EF4444; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </button>
      </div>
    `;
    
    itemsContainer.appendChild(newItem);
    
    // Add remove item event listener
    newItem.querySelector('.remove-item').addEventListener('click', () => {
      itemsContainer.removeChild(newItem);
    });
  });
  
  // Handle form submission
  document.getElementById('create-invoice-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show processing state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    // Get form data
    const formData = new FormData(e.target);
    
    // Prepare invoice data
    const invoiceData = {
      clientName: formData.get('clientName'),
      clientEmail: formData.get('clientEmail'),
      clientPhone: formData.get('clientPhone'),
      deliveryMethod: formData.get('deliveryMethod'),
      issuedDate: formData.get('issuedDate'),
      dueDate: formData.get('dueDate'),
      notes: formData.get('notes'),
      status: 'draft',
      items: [],
    };
    
    // Get all descriptions, quantities, and prices
    const descriptions = formData.getAll('description[]');
    const quantities = formData.getAll('quantity[]');
    const prices = formData.getAll('price[]');
    
    // Calculate total amount and create items array
    let totalAmount = 0;
    for (let i = 0; i < descriptions.length; i++) {
      const quantity = parseInt(quantities[i], 10);
      const price = parseFloat(prices[i]);
      const amount = quantity * price;
      
      invoiceData.items.push({
        description: descriptions[i],
        quantity,
        price,
        amount
      });
      
      totalAmount += amount;
    }
    
    invoiceData.totalAmount = totalAmount;
    
    // Create the invoice
    fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create invoice');
        }
        return response.json();
      })
      .then(data => {
        // Close the modal
        document.body.removeChild(modal);
        
        // Show success notification
        showNotification('Invoice created successfully', 'success');
        
        // Refresh the invoices list
        renderInvoicesPage();
      })
      .catch(error => {
        console.error('Error creating invoice:', error);
        
        // Show error notification
        showNotification('Failed to create invoice: ' + error.message, 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}

// View invoice details
function viewInvoice(invoiceId) {
  // Find the invoice in the cache
  const invoice = invoicesCache.find(inv => inv.id === invoiceId);
  
  if (!invoice) {
    showNotification('Invoice not found', 'error');
    return;
  }
  
  // Create the modal element
  const modal = document.createElement('div');
  modal.className = 'invoice-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';
  modal.style.padding = '20px';
  
  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '100%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Calculate total items and amount
  const totalItems = invoice.items ? invoice.items.length : 0;
  
  // Format dates
  const issuedDate = formatDate(invoice.issuedDate);
  const dueDate = formatDate(invoice.dueDate);
  
  // Add heading and close button
  modalContent.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #111827;">Invoice #${invoice.invoiceNumber || invoice.id}</h2>
        <button class="close-modal" style="background: transparent; border: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <div style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
        <div>
          <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 8px;">From</h3>
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">Your Company Name</p>
          <p style="color: #6b7280; margin-bottom: 4px;">your-email@example.com</p>
        </div>
        
        <div>
          <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 8px;">To</h3>
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">${invoice.clientName}</p>
          <p style="color: #6b7280; margin-bottom: 4px;">${invoice.clientEmail || 'No email provided'}</p>
          ${invoice.clientPhone ? `<p style="color: #6b7280; margin-bottom: 4px;">${invoice.clientPhone}</p>` : ''}
          ${invoice.deliveryMethod ? `<p style="color: #6b7280; margin-bottom: 0;"><span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; background-color: #EFF6FF; color: #1E40AF;">Delivery: ${invoice.deliveryMethod.charAt(0).toUpperCase() + invoice.deliveryMethod.slice(1)}</span></p>` : ''}
        </div>
        
        <div>
          <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 8px;">Invoice Details</h3>
          <div style="display: flex; gap: 20px;">
            <div>
              <p style="color: #6b7280; margin-bottom: 4px;">Date Issued:</p>
              <p style="color: #6b7280; margin-bottom: 4px;">Due Date:</p>
              <p style="color: #6b7280; margin-bottom: 4px;">Status:</p>
            </div>
            <div>
              <p style="font-weight: 500; color: #111827; margin-bottom: 4px;">${issuedDate}</p>
              <p style="font-weight: 500; color: #111827; margin-bottom: 4px;">${dueDate}</p>
              <p style="margin-bottom: 4px;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; 
                  background-color: ${invoice.status.toLowerCase() === 'paid' ? '#DCFCE7' : 
                                      invoice.status.toLowerCase() === 'pending' ? '#FEF3C7' :
                                      invoice.status.toLowerCase() === 'overdue' ? '#FEE2E2' : '#F3F4F6'}; 
                  color: ${invoice.status.toLowerCase() === 'paid' ? '#166534' : 
                          invoice.status.toLowerCase() === 'pending' ? '#92400E' :
                          invoice.status.toLowerCase() === 'overdue' ? '#B91C1C' : '#4B5563'};">
                  ${invoice.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 12px;">Invoice Items</h3>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 12px 16px; font-weight: 500; color: #6b7280;">Description</th>
                <th style="text-align: right; padding: 12px 16px; font-weight: 500; color: #6b7280;">Quantity</th>
                <th style="text-align: right; padding: 12px 16px; font-weight: 500; color: #6b7280;">Price</th>
                <th style="text-align: right; padding: 12px 16px; font-weight: 500; color: #6b7280;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items ? invoice.items.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 16px; color: #111827;">${item.description}</td>
                  <td style="text-align: right; padding: 12px 16px; color: #111827;">${item.quantity}</td>
                  <td style="text-align: right; padding: 12px 16px; color: #111827;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right; padding: 12px 16px; color: #111827; font-weight: 500;">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4" style="padding: 12px 16px; color: #6b7280; text-align: center;">No items</td>
                </tr>
              `}
            </tbody>
            <tfoot>
              <tr style="background-color: #f9fafb;">
                <td colspan="3" style="padding: 12px 16px; text-align: right; font-weight: 500; color: #111827;">Total:</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #111827; font-size: 16px;">${formatCurrency(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      ${invoice.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 8px;">Notes</h3>
          <p style="color: #6b7280; white-space: pre-line;">${invoice.notes}</p>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
        <button type="button" class="edit-invoice-btn" data-id="${invoice.id}" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563; display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        
        <button type="button" class="download-pdf-btn" data-id="${invoice.id}" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563; display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
        
        <button type="button" class="send-email-btn" data-id="${invoice.id}" style="padding: 8px 16px; background-color: var(--color-primary); border: none; border-radius: 6px; color: white; font-weight: 500; display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send Invoice
        </button>
      </div>
    </div>
  `;
  
  // Add the modal to the DOM
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listeners
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Edit invoice button
  document.querySelector('.edit-invoice-btn').addEventListener('click', (e) => {
    document.body.removeChild(modal);
    editInvoice(invoiceId);
  });
  
  // Download PDF button
  document.querySelector('.download-pdf-btn').addEventListener('click', (e) => {
    downloadInvoicePdf(invoiceId);
  });
  
  // Send email button
  document.querySelector('.send-email-btn').addEventListener('click', (e) => {
    sendInvoice(invoiceId);
  });
}

// Edit invoice
function editInvoice(invoiceId) {
  // Find the invoice in the cache
  const invoice = invoicesCache.find(inv => inv.id === invoiceId);
  
  if (!invoice) {
    showNotification('Invoice not found', 'error');
    return;
  }
  
  // Create the modal element
  const modal = document.createElement('div');
  modal.className = 'invoice-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';
  modal.style.padding = '20px';
  
  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '100%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Format dates for input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Add heading and close button
  modalContent.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #111827;">Edit Invoice #${invoice.invoiceNumber || invoice.id}</h2>
        <button class="close-modal" style="background: transparent; border: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <form id="edit-invoice-form" style="padding: 20px;">
      <div style="margin-bottom: 16px;">
        <label for="client-name" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Name</label>
        <input type="text" id="client-name" name="clientName" value="${invoice.clientName}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="client-email" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Email</label>
        <input type="email" id="client-email" name="clientEmail" value="${invoice.clientEmail || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="client-phone" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Client Phone Number</label>
        <input type="tel" id="client-phone" name="clientPhone" value="${invoice.clientPhone || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" placeholder="(optional)">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Delivery Method</label>
        <div style="display: flex; gap: 16px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="email" ${!invoice.deliveryMethod || invoice.deliveryMethod === 'email' ? 'checked' : ''} style="margin-right: 8px;">
            <span>Email</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="sms" ${invoice.deliveryMethod === 'sms' ? 'checked' : ''} style="margin-right: 8px;">
            <span>SMS</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="deliveryMethod" value="both" ${invoice.deliveryMethod === 'both' ? 'checked' : ''} style="margin-right: 8px;">
            <span>Both</span>
          </label>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <label for="issue-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Issue Date</label>
          <input type="date" id="issue-date" name="issuedDate" value="${formatDateForInput(invoice.issuedDate)}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
        </div>
        <div>
          <label for="due-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Due Date</label>
          <input type="date" id="due-date" name="dueDate" value="${formatDateForInput(invoice.dueDate)}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;" required>
        </div>
        <div>
          <label for="status" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Status</label>
          <select id="status" name="status" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; background-color: white;" required>
            <option value="draft" ${invoice.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="overdue" ${invoice.status === 'overdue' ? 'selected' : ''}>Overdue</option>
          </select>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Invoice Items</label>
        <div id="invoice-items" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
          ${invoice.items && invoice.items.length > 0 ? invoice.items.map((item, index) => `
            <div class="invoice-item" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px;">
                <input type="text" name="description[]" value="${item.description}" placeholder="Description" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
                <input type="number" name="quantity[]" value="${item.quantity}" placeholder="Quantity" min="1" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
                <input type="number" name="price[]" value="${item.price}" placeholder="Price" min="0" step="0.01" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
                ${index > 0 ? `
                  <button type="button" class="remove-item" style="padding: 4px; background: transparent; border: none; color: #EF4444; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </button>
                ` : '<div></div>'}
              </div>
            </div>
          `).join('') : `
            <div class="invoice-item" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" name="description[]" placeholder="Description" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
                <input type="number" name="quantity[]" placeholder="Quantity" min="1" value="1" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
                <input type="number" name="price[]" placeholder="Price" min="0" step="0.01" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
              </div>
            </div>
          `}
        </div>
        <button type="button" id="add-item-btn" style="width: 100%; padding: 8px; background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 6px; color: #6b7280; cursor: pointer;">
          + Add Another Item
        </button>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label for="invoice-notes" style="display: block; margin-bottom: 6px; font-size: 14px; color: #4b5563; font-weight: 500;">Notes</label>
        <textarea id="invoice-notes" name="notes" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 80px;">${invoice.notes || ''}</textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
        <button type="button" class="cancel-btn" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563;">Cancel</button>
        <button type="submit" style="padding: 8px 16px; background-color: var(--color-primary); border: none; border-radius: 6px; color: white; font-weight: 500;">Save Changes</button>
      </div>
    </form>
  `;
  
  // Add the modal to the DOM
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listeners
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.querySelector('.cancel-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Add remove item event listeners
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemElement = btn.closest('.invoice-item');
      if (itemElement) {
        itemElement.parentElement.removeChild(itemElement);
      }
    });
  });
  
  document.getElementById('add-item-btn').addEventListener('click', () => {
    const itemsContainer = document.getElementById('invoice-items');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.style.marginBottom = '12px';
    newItem.style.paddingBottom = '12px';
    newItem.style.borderBottom = '1px solid #e5e7eb';
    
    newItem.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px;">
        <input type="text" name="description[]" placeholder="Description" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <input type="number" name="quantity[]" placeholder="Quantity" min="1" value="1" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <input type="number" name="price[]" placeholder="Price" min="0" step="0.01" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" required>
        <button type="button" class="remove-item" style="padding: 4px; background: transparent; border: none; color: #EF4444; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </button>
      </div>
    `;
    
    itemsContainer.appendChild(newItem);
    
    // Add remove item event listener
    newItem.querySelector('.remove-item').addEventListener('click', () => {
      itemsContainer.removeChild(newItem);
    });
  });
  
  // Handle form submission
  document.getElementById('edit-invoice-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show processing state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    // Get form data
    const formData = new FormData(e.target);
    
    // Prepare invoice data
    const invoiceData = {
      id: invoice.id,
      clientName: formData.get('clientName'),
      clientEmail: formData.get('clientEmail'),
      clientPhone: formData.get('clientPhone'),
      deliveryMethod: formData.get('deliveryMethod'),
      issuedDate: formData.get('issuedDate'),
      dueDate: formData.get('dueDate'),
      status: formData.get('status'),
      notes: formData.get('notes'),
      items: [],
    };
    
    // Get all descriptions, quantities, and prices
    const descriptions = formData.getAll('description[]');
    const quantities = formData.getAll('quantity[]');
    const prices = formData.getAll('price[]');
    
    // Calculate total amount and create items array
    let totalAmount = 0;
    for (let i = 0; i < descriptions.length; i++) {
      const quantity = parseInt(quantities[i], 10);
      const price = parseFloat(prices[i]);
      const amount = quantity * price;
      
      invoiceData.items.push({
        description: descriptions[i],
        quantity,
        price,
        amount
      });
      
      totalAmount += amount;
    }
    
    invoiceData.totalAmount = totalAmount;
    
    // Update the invoice
    fetch(`/api/invoices/${invoice.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update invoice');
        }
        return response.json();
      })
      .then(data => {
        // Close the modal
        document.body.removeChild(modal);
        
        // Show success notification
        showNotification('Invoice updated successfully', 'success');
        
        // Refresh the invoices list
        renderInvoicesPage();
      })
      .catch(error => {
        console.error('Error updating invoice:', error);
        
        // Show error notification
        showNotification('Failed to update invoice: ' + error.message, 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}

// Send invoice email
function sendInvoice(invoiceId) {
  // Find the invoice in the cache
  const invoice = invoicesCache.find(inv => inv.id === invoiceId);
  
  if (!invoice) {
    showNotification('Invoice not found', 'error');
    return;
  }
  
  // Determine delivery method - use stored delivery method if available, otherwise default to email
  const deliveryMethod = invoice.deliveryMethod || 'email';
  
  // Validate contact information based on delivery method
  if (deliveryMethod === 'email' || deliveryMethod === 'both') {
    if (!invoice.clientEmail) {
      showNotification('This invoice has no client email. Please edit the invoice and add an email address.', 'warning');
      return;
    }
  }
  
  if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
    if (!invoice.clientPhone) {
      showNotification('This invoice has no client phone number. Please edit the invoice and add a phone number.', 'warning');
      return;
    }
  }
  
  // Format confirmation message based on delivery method
  let confirmMessage = `Send invoice #${invoice.invoiceNumber || invoice.id} `;
  if (deliveryMethod === 'email') {
    confirmMessage += `via email to ${invoice.clientEmail}?`;
  } else if (deliveryMethod === 'sms') {
    confirmMessage += `via SMS to ${invoice.clientPhone}?`;
  } else if (deliveryMethod === 'both') {
    confirmMessage += `via email to ${invoice.clientEmail} AND via SMS to ${invoice.clientPhone}?`;
  }
  
  // Show confirmation dialog
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Send the invoice
  showNotification(`Sending invoice via ${deliveryMethod}...`, 'info');
  
  fetch(`/api/invoices/${invoice.id}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deliveryMethod: deliveryMethod
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }
      return response.json();
    })
    .then(data => {
      // Show success notification based on delivery status
      let successMessage = '';
      
      if (data.emailSent && data.smsSent) {
        successMessage = `Invoice sent successfully via email and SMS`;
      } else if (data.emailSent) {
        successMessage = `Invoice sent successfully via email to ${invoice.clientEmail}`;
      } else if (data.smsSent) {
        successMessage = `Invoice sent successfully via SMS to ${invoice.clientPhone}`;
      } else {
        // This shouldn't happen if the server is configured properly, but just in case
        throw new Error('Invoice was not sent. Please check your delivery settings.');
      }
      
      showNotification(successMessage, 'success');
      
      // Refresh the invoices list
      renderInvoicesPage();
    })
    .catch(error => {
      console.error('Error sending invoice:', error);
      
      // Show error notification
      showNotification('Failed to send invoice: ' + error.message, 'error');
    });
}

// Delete invoice
function deleteInvoice(invoiceId) {
  // Find the invoice in the cache
  const invoice = invoicesCache.find(inv => inv.id === invoiceId);
  
  if (!invoice) {
    showNotification('Invoice not found', 'error');
    return;
  }
  
  // Show confirmation dialog
  if (!confirm(`Are you sure you want to delete invoice #${invoice.invoiceNumber || invoice.id}? This action cannot be undone.`)) {
    return;
  }
  
  // Delete the invoice
  fetch(`/api/invoices/${invoice.id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      return response.json();
    })
    .then(data => {
      // Show success notification
      showNotification('Invoice deleted successfully', 'success');
      
      // Refresh the invoices list
      renderInvoicesPage();
    })
    .catch(error => {
      console.error('Error deleting invoice:', error);
      
      // Show error notification
      showNotification('Failed to delete invoice: ' + error.message, 'error');
    });
}

// Open customization modal for Pro users
function openCustomizationModal() {
  // Check if user is Pro
  if (!isProUser()) {
    showNotification('This feature is only available for Pro users. Please upgrade to customize your invoices.', 'warning');
    return;
  }
  
  // Create the modal element
  const modal = document.createElement('div');
  modal.className = 'customize-invoice-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';
  modal.style.padding = '20px';
  
  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '100%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Add heading and close button
  modalContent.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #111827;">Customize Invoices</h2>
        <button class="close-modal" style="background: transparent; border: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <form id="customize-invoice-form" style="padding: 20px;">
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4338CA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
          </svg>
          <span style="font-weight: 500; color: #111827;">Pro Feature</span>
        </div>
        <p style="color: #6b7280; margin: 0;">Changes you make here will apply to all your invoices. Your customizations are saved automatically.</p>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #4b5563; font-weight: 500;">Company Logo</label>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div id="logo-preview" style="width: 80px; height: 80px; border: 1px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #f9fafb;">
            ${invoiceCustomizationOptions.logo ? 
              `<img src="${invoiceCustomizationOptions.logo}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">` : 
              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>`
            }
          </div>
          <div style="flex: 1;">
            <input type="file" id="logo-upload" accept="image/*" style="display: none;">
            <button type="button" id="upload-logo-btn" style="width: 100%; padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563; font-weight: 500; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Logo
            </button>
            ${invoiceCustomizationOptions.logo ? 
              `<button type="button" id="remove-logo-btn" style="width: 100%; padding: 8px 16px; background-color: #FEE2E2; border: 1px solid #FECACA; border-radius: 6px; color: #B91C1C; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                Remove Logo
              </button>` : ''
            }
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label for="color-theme" style="display: block; margin-bottom: 8px; font-size: 14px; color: #4b5563; font-weight: 500;">Color Theme</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'default' ? 'selected' : ''}" data-value="default" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'default' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #4F46E5, #6366F1); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Default
            </div>
          </div>
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'green' ? 'selected' : ''}" data-value="green" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'green' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #059669, #10B981); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Green
            </div>
          </div>
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'blue' ? 'selected' : ''}" data-value="blue" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'blue' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #2563EB, #3B82F6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Blue
            </div>
          </div>
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'purple' ? 'selected' : ''}" data-value="purple" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'purple' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #7C3AED, #8B5CF6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Purple
            </div>
          </div>
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'orange' ? 'selected' : ''}" data-value="orange" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'orange' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #D97706, #F59E0B); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Orange
            </div>
          </div>
          <div class="color-option ${invoiceCustomizationOptions.colorTheme === 'red' ? 'selected' : ''}" data-value="red" style="cursor: pointer; border-radius: 6px; padding: 4px; border: 2px solid ${invoiceCustomizationOptions.colorTheme === 'red' ? '#4F46E5' : 'transparent'};">
            <div style="height: 40px; border-radius: 4px; background: linear-gradient(to right, #DC2626, #EF4444); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
              Red
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label for="font-family" style="display: block; margin-bottom: 8px; font-size: 14px; color: #4b5563; font-weight: 500;">Font Style</label>
        <select id="font-family" name="fontFamily" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; background-color: white;">
          <option value="Inter, sans-serif" ${invoiceCustomizationOptions.fontFamily === 'Inter, sans-serif' ? 'selected' : ''}>Inter (Default)</option>
          <option value="'Roboto', sans-serif" ${invoiceCustomizationOptions.fontFamily === "'Roboto', sans-serif" ? 'selected' : ''}>Roboto</option>
          <option value="'Poppins', sans-serif" ${invoiceCustomizationOptions.fontFamily === "'Poppins', sans-serif" ? 'selected' : ''}>Poppins</option>
          <option value="'Montserrat', sans-serif" ${invoiceCustomizationOptions.fontFamily === "'Montserrat', sans-serif" ? 'selected' : ''}>Montserrat</option>
          <option value="'Lato', sans-serif" ${invoiceCustomizationOptions.fontFamily === "'Lato', sans-serif" ? 'selected' : ''}>Lato</option>
          <option value="'Open Sans', sans-serif" ${invoiceCustomizationOptions.fontFamily === "'Open Sans', sans-serif" ? 'selected' : ''}>Open Sans</option>
          <option value="'Playfair Display', serif" ${invoiceCustomizationOptions.fontFamily === "'Playfair Display', serif" ? 'selected' : ''}>Playfair Display</option>
        </select>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label for="header-style" style="display: block; margin-bottom: 8px; font-size: 14px; color: #4b5563; font-weight: 500;">Header Style</label>
        <select id="header-style" name="headerStyle" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; background-color: white;">
          <option value="standard" ${invoiceCustomizationOptions.headerStyle === 'standard' ? 'selected' : ''}>Standard</option>
          <option value="minimal" ${invoiceCustomizationOptions.headerStyle === 'minimal' ? 'selected' : ''}>Minimal</option>
          <option value="bold" ${invoiceCustomizationOptions.headerStyle === 'bold' ? 'selected' : ''}>Bold</option>
        </select>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label for="footer-text" style="display: block; margin-bottom: 8px; font-size: 14px; color: #4b5563; font-weight: 500;">Custom Footer Text</label>
        <textarea id="footer-text" name="footerText" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 80px; resize: vertical;">${invoiceCustomizationOptions.footerText}</textarea>
        <p style="margin-top: 8px; color: #6b7280; font-size: 12px;">This text will appear at the bottom of all your invoices. You can include terms and conditions or thank you messages.</p>
      </div>
      
      <div id="preview-section" style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; margin-bottom: 12px; color: #111827; font-weight: 500;">Preview</h3>
        <div style="border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;">
          <div style="padding: 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="preview-logo" style="width: 48px; height: 48px; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: white;">
                ${invoiceCustomizationOptions.logo ? 
                  `<img src="${invoiceCustomizationOptions.logo}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">` : 
                  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>`
                }
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Your Company Name</h3>
                <p style="margin: 0; color: #6b7280;">INVOICE #12345</p>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #6b7280;">Date: April 26, 2025</p>
              <p style="margin: 0; color: #6b7280;">Due: May 10, 2025</p>
            </div>
          </div>
          <div style="padding: 20px;">
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
              <div>
                <h4 style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">FROM</h4>
                <p style="margin: 0; color: #111827; font-weight: 500;">Your Company Name</p>
                <p style="margin: 0; color: #6b7280;">your-email@example.com</p>
              </div>
              <div style="text-align: right;">
                <h4 style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">TO</h4>
                <p style="margin: 0; color: #111827; font-weight: 500;">Client Name</p>
                <p style="margin: 0; color: #6b7280;">client-email@example.com</p>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <th style="padding: 8px 12px; text-align: left; color: #6b7280; font-weight: 500;">Item</th>
                  <th style="padding: 8px 12px; text-align: right; color: #6b7280; font-weight: 500;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; color: #6b7280; font-weight: 500;">Price</th>
                  <th style="padding: 8px 12px; text-align: right; color: #6b7280; font-weight: 500;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; color: #111827;">Website Design</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">1</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">$1,200.00</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">$1,200.00</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; color: #111827;">Hosting (Annual)</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">1</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">$200.00</td>
                  <td style="padding: 12px; text-align: right; color: #111827;">$200.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; color: #111827;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">$1,400.00</td>
                </tr>
              </tfoot>
            </table>
            <div id="preview-footer" style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 14px;">
              ${invoiceCustomizationOptions.footerText ? invoiceCustomizationOptions.footerText : 'Thank you for your business!'}
            </div>
          </div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
        <button type="button" id="reset-defaults-btn" style="padding: 8px 16px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; color: #4b5563;">Reset to Defaults</button>
        <button type="submit" style="padding: 8px 16px; background-color: var(--color-primary); border: none; border-radius: 6px; color: white; font-weight: 500;">Save Changes</button>
      </div>
    </form>
  `;
  
  // Add the modal to the DOM
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listeners
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Handle logo upload
  const logoUpload = document.getElementById('logo-upload');
  const uploadLogoBtn = document.getElementById('upload-logo-btn');
  const logoPreview = document.getElementById('logo-preview');
  const previewLogo = document.getElementById('preview-logo');
  
  uploadLogoBtn.addEventListener('click', () => {
    logoUpload.click();
  });
  
  logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Logo image must be less than 2MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const logoDataUrl = event.target.result;
      
      // Update logo preview
      logoPreview.innerHTML = `<img src="${logoDataUrl}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">`;
      previewLogo.innerHTML = `<img src="${logoDataUrl}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">`;
      
      // Update customization options
      invoiceCustomizationOptions.logo = logoDataUrl;
      
      // Add remove button if it doesn't exist
      if (!document.getElementById('remove-logo-btn')) {
        const removeBtn = document.createElement('button');
        removeBtn.id = 'remove-logo-btn';
        removeBtn.type = 'button';
        removeBtn.style.width = '100%';
        removeBtn.style.padding = '8px 16px';
        removeBtn.style.backgroundColor = '#FEE2E2';
        removeBtn.style.border = '1px solid #FECACA';
        removeBtn.style.borderRadius = '6px';
        removeBtn.style.color = '#B91C1C';
        removeBtn.style.fontWeight = '500';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.display = 'flex';
        removeBtn.style.alignItems = 'center';
        removeBtn.style.justifyContent = 'center';
        removeBtn.style.gap = '8px';
        removeBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          Remove Logo
        `;
        uploadLogoBtn.parentNode.appendChild(removeBtn);
        
        // Add event listener
        removeBtn.addEventListener('click', handleRemoveLogo);
      }
    };
    reader.readAsDataURL(file);
  });
  
  // Handle remove logo
  function handleRemoveLogo() {
    // Reset logo preview
    logoPreview.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    `;
    previewLogo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    `;
    
    // Clear logo data
    invoiceCustomizationOptions.logo = null;
    
    // Remove the remove button
    const removeBtn = document.getElementById('remove-logo-btn');
    if (removeBtn) {
      removeBtn.parentNode.removeChild(removeBtn);
    }
  }
  
  // Add event listener for existing remove logo button
  const removeLogoBtn = document.getElementById('remove-logo-btn');
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', handleRemoveLogo);
  }
  
  // Handle color theme selection
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      colorOptions.forEach(opt => {
        opt.style.border = '2px solid transparent';
      });
      
      // Add selected class to clicked option
      option.style.border = '2px solid #4F46E5';
      
      // Update customization options
      invoiceCustomizationOptions.colorTheme = option.dataset.value;
    });
  });
  
  // Handle font family change
  const fontFamilySelect = document.getElementById('font-family');
  fontFamilySelect.addEventListener('change', () => {
    invoiceCustomizationOptions.fontFamily = fontFamilySelect.value;
  });
  
  // Handle header style change
  const headerStyleSelect = document.getElementById('header-style');
  headerStyleSelect.addEventListener('change', () => {
    invoiceCustomizationOptions.headerStyle = headerStyleSelect.value;
  });
  
  // Handle footer text change
  const footerTextArea = document.getElementById('footer-text');
  const previewFooter = document.getElementById('preview-footer');
  footerTextArea.addEventListener('input', () => {
    invoiceCustomizationOptions.footerText = footerTextArea.value;
    previewFooter.textContent = footerTextArea.value || 'Thank you for your business!';
  });
  
  // Handle reset to defaults
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
  resetDefaultsBtn.addEventListener('click', () => {
    // Reset customization options
    invoiceCustomizationOptions = { ...defaultCustomizationOptions };
    
    // Update UI
    if (invoiceCustomizationOptions.logo) {
      logoPreview.innerHTML = `<img src="${invoiceCustomizationOptions.logo}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">`;
      previewLogo.innerHTML = `<img src="${invoiceCustomizationOptions.logo}" alt="Company Logo" style="max-width: 100%; max-height: 100%;">`;
    } else {
      logoPreview.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      `;
      previewLogo.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      `;
      
      // Remove the remove button
      const removeBtn = document.getElementById('remove-logo-btn');
      if (removeBtn) {
        removeBtn.parentNode.removeChild(removeBtn);
      }
    }
    
    // Update color options
    colorOptions.forEach(option => {
      option.style.border = option.dataset.value === invoiceCustomizationOptions.colorTheme ? '2px solid #4F46E5' : '2px solid transparent';
    });
    
    // Update select inputs
    fontFamilySelect.value = invoiceCustomizationOptions.fontFamily;
    headerStyleSelect.value = invoiceCustomizationOptions.headerStyle;
    
    // Update footer text
    footerTextArea.value = invoiceCustomizationOptions.footerText;
    previewFooter.textContent = invoiceCustomizationOptions.footerText || 'Thank you for your business!';
    
    showNotification('Reset to default settings', 'info');
  });
  
  // Handle form submission
  document.getElementById('customize-invoice-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Save customization options (already updated via event listeners)
    
    // Show success notification
    showNotification('Invoice customization settings saved', 'success');
    
    // Close the modal
    document.body.removeChild(modal);
  });
}

// Download invoice as PDF
function downloadInvoicePdf(invoiceId) {
  // Show notification
  showNotification('Generating PDF...', 'info');
  
  // Apply Pro user customizations if available
  const customizationData = isProUser() ? invoiceCustomizationOptions : defaultCustomizationOptions;
  
  // Send request to download PDF
  fetch(`/api/invoices/${invoiceId}/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customizationData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      return response.blob();
    })
    .then(blob => {
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      
      // Append the link to the body
      document.body.appendChild(a);
      
      // Click the link to start the download
      a.click();
      
      // Remove the link from the DOM
      document.body.removeChild(a);
      
      // Release the URL object
      window.URL.revokeObjectURL(url);
      
      // Show success notification
      showNotification('PDF downloaded successfully', 'success');
    })
    .catch(error => {
      console.error('Error downloading PDF:', error);
      
      // Show error notification
      showNotification('Failed to download PDF: ' + error.message, 'error');
    });
}

// No need for export default
// We're already using the named export for renderInvoicesPage at line 30