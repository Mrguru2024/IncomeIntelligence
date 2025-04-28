/**
 * Client Preview Modal
 * 
 * This module provides functionality to preview quotes as they would appear to clients
 * before sending them via email or as payable invoices.
 */

// Plain JavaScript version of the client preview function
// This is made available globally immediately

/**
 * Shows a modal that previews how the quote will appear to clients
 * @param {Object} quote - The quote data object
 * @param {string} tierName - The name of the quote tier (Basic, Standard, Premium)
 */
function showClientPreviewModal(quote, tierName) {
  console.log('Client preview modal called with:', { quote, tierName });
  
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
  
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  content.style.width = '90%';
  content.style.maxWidth = '650px';
  content.style.maxHeight = '90vh';
  content.style.overflow = 'auto';
  content.style.padding = '24px';
  
  // Modal header with title and close button
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h3');
  title.textContent = 'Client Quote Preview';
  title.style.margin = '0';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  
  const previewBadge = document.createElement('span');
  previewBadge.textContent = 'PREVIEW MODE';
  previewBadge.style.fontSize = '12px';
  previewBadge.style.fontWeight = 'bold';
  previewBadge.style.color = 'white';
  previewBadge.style.backgroundColor = '#f97316'; // Orange color for visibility
  previewBadge.style.padding = '4px 8px';
  previewBadge.style.borderRadius = '4px';
  previewBadge.style.marginLeft = '12px';
  
  title.appendChild(previewBadge);
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  content.appendChild(header);
  
  // Instructions note about preview mode
  const instructions = document.createElement('div');
  instructions.style.backgroundColor = '#f9fafb';
  instructions.style.borderRadius = '6px';
  instructions.style.padding = '12px 16px';
  instructions.style.marginBottom = '20px';
  instructions.style.borderLeft = '4px solid #f97316';
  
  const instructionsText = document.createElement('p');
  instructionsText.innerHTML = '<strong>Preview Mode:</strong> This is how your quote will appear to clients when sent via email or as a payable invoice. Review all details carefully before sending.';
  instructionsText.style.margin = '0';
  instructionsText.style.fontSize = '14px';
  
  instructions.appendChild(instructionsText);
  content.appendChild(instructions);
  
  // Create business card section (mimicking the sender information)
  const businessCard = document.createElement('div');
  businessCard.style.backgroundColor = '#f0f9ff'; // Light blue background
  businessCard.style.borderRadius = '6px';
  businessCard.style.padding = '16px';
  businessCard.style.marginBottom = '24px';
  businessCard.style.display = 'flex';
  businessCard.style.alignItems = 'center';
  
  // Business icon/avatar
  const businessAvatar = document.createElement('div');
  businessAvatar.style.width = '50px';
  businessAvatar.style.height = '50px';
  businessAvatar.style.borderRadius = '50%';
  businessAvatar.style.backgroundColor = '#0284c7'; // Blue
  businessAvatar.style.display = 'flex';
  businessAvatar.style.alignItems = 'center';
  businessAvatar.style.justifyContent = 'center';
  businessAvatar.style.marginRight = '16px';
  businessAvatar.style.color = 'white';
  businessAvatar.style.fontWeight = 'bold';
  businessAvatar.style.fontSize = '24px';
  
  // Get business name initial or fallback to "P" for professional
  const businessName = window.UserProfile && window.UserProfile.getCurrentProfile && window.UserProfile.getCurrentProfile() ? 
    window.UserProfile.getCurrentProfile().businessName || "Professional Services" : "Professional Services";
  businessAvatar.textContent = businessName.charAt(0).toUpperCase();
  
  const businessInfo = document.createElement('div');
  
  const businessNameElement = document.createElement('h4');
  businessNameElement.textContent = businessName;
  businessNameElement.style.margin = '0 0 4px 0';
  businessNameElement.style.fontWeight = '600';
  
  const businessDetail = document.createElement('p');
  businessDetail.textContent = `Professional ${quote.jobTypeDisplay} Services`;
  businessDetail.style.margin = '0';
  businessDetail.style.fontSize = '14px';
  businessDetail.style.color = '#4b5563';
  
  businessInfo.appendChild(businessNameElement);
  businessInfo.appendChild(businessDetail);
  
  businessCard.appendChild(businessAvatar);
  businessCard.appendChild(businessInfo);
  
  content.appendChild(businessCard);
  
  // Quote title section
  const quoteTitle = document.createElement('h2');
  quoteTitle.textContent = `${tierName} ${quote.jobTypeDisplay} Service Quote`;
  quoteTitle.style.fontSize = '22px';
  quoteTitle.style.fontWeight = 'bold';
  quoteTitle.style.marginBottom = '8px';
  quoteTitle.style.textAlign = 'center';
  
  const quoteDateElement = document.createElement('p');
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  quoteDateElement.textContent = `Quote issued: ${currentDate}`;
  quoteDateElement.style.textAlign = 'center';
  quoteDateElement.style.fontSize = '14px';
  quoteDateElement.style.color = '#6b7280';
  quoteDateElement.style.marginBottom = '24px';
  
  content.appendChild(quoteTitle);
  content.appendChild(quoteDateElement);
  
  // Quote details section
  const quoteDetails = document.createElement('div');
  quoteDetails.style.marginBottom = '24px';
  
  // Service details
  const serviceDetails = document.createElement('div');
  serviceDetails.style.marginBottom = '16px';
  
  const serviceTitle = document.createElement('h4');
  serviceTitle.textContent = 'Service Details';
  serviceTitle.style.fontSize = '16px';
  serviceTitle.style.fontWeight = '600';
  serviceTitle.style.marginBottom = '8px';
  
  const serviceType = document.createElement('p');
  serviceType.innerHTML = `<strong>Service:</strong> ${quote.jobSubtypeDisplay || quote.jobTypeDisplay}`;
  serviceType.style.margin = '0 0 4px 0';
  
  const serviceLocation = document.createElement('p');
  serviceLocation.innerHTML = `<strong>Location:</strong> ${quote.location}`;
  serviceLocation.style.margin = '0 0 4px 0';
  
  const serviceScope = document.createElement('p');
  serviceScope.innerHTML = `<strong>Scope:</strong> ${quote.quantity} unit(s), ${quote.laborHours} labor hour(s)`;
  serviceScope.style.margin = '0';
  
  serviceDetails.appendChild(serviceTitle);
  serviceDetails.appendChild(serviceType);
  serviceDetails.appendChild(serviceLocation);
  serviceDetails.appendChild(serviceScope);
  
  quoteDetails.appendChild(serviceDetails);
  
  // Cost breakdown section
  const costBreakdown = document.createElement('div');
  
  const breakdownTitle = document.createElement('h4');
  breakdownTitle.textContent = 'Cost Breakdown';
  breakdownTitle.style.fontSize = '16px';
  breakdownTitle.style.fontWeight = '600';
  breakdownTitle.style.marginBottom = '12px';
  
  costBreakdown.appendChild(breakdownTitle);
  
  // Table for pricing
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  
  // Table head
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Item', 'Details', 'Amount'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.textAlign = 'left';
    th.style.padding = '8px 12px';
    th.style.borderBottom = '2px solid #e5e7eb';
    th.style.fontSize = '14px';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  // Add labor costs
  const laborRow = document.createElement('tr');
  
  const laborLabel = document.createElement('td');
  laborLabel.textContent = 'Labor';
  laborLabel.style.padding = '8px 12px';
  laborLabel.style.borderBottom = '1px solid #e5e7eb';
  
  const laborDetails = document.createElement('td');
  laborDetails.textContent = `${quote.laborHours} hours`;
  laborDetails.style.padding = '8px 12px';
  laborDetails.style.borderBottom = '1px solid #e5e7eb';
  
  const laborCost = document.createElement('td');
  laborCost.textContent = formatCurrency(quote.laborCost);
  laborCost.style.padding = '8px 12px';
  laborCost.style.borderBottom = '1px solid #e5e7eb';
  
  laborRow.appendChild(laborLabel);
  laborRow.appendChild(laborDetails);
  laborRow.appendChild(laborCost);
  tbody.appendChild(laborRow);
  
  // Add materials costs
  const materialsRow = document.createElement('tr');
  
  const materialsLabel = document.createElement('td');
  materialsLabel.textContent = 'Materials';
  materialsLabel.style.padding = '8px 12px';
  materialsLabel.style.borderBottom = '1px solid #e5e7eb';
  
  const materialsDetails = document.createElement('td');
  materialsDetails.textContent = quote.materialsCost > 0 ? 'Required materials' : 'None required';
  materialsDetails.style.padding = '8px 12px';
  materialsDetails.style.borderBottom = '1px solid #e5e7eb';
  
  const materialsCost = document.createElement('td');
  materialsCost.textContent = formatCurrency(quote.materialsCost);
  materialsCost.style.padding = '8px 12px';
  materialsCost.style.borderBottom = '1px solid #e5e7eb';
  
  materialsRow.appendChild(materialsLabel);
  materialsRow.appendChild(materialsDetails);
  materialsRow.appendChild(materialsCost);
  tbody.appendChild(materialsRow);
  
  // Add travel costs if applicable
  if (quote.travelCost > 0) {
    const travelRow = document.createElement('tr');
    
    const travelLabel = document.createElement('td');
    travelLabel.textContent = 'Travel';
    travelLabel.style.padding = '8px 12px';
    travelLabel.style.borderBottom = '1px solid #e5e7eb';
    
    const travelDetails = document.createElement('td');
    travelDetails.textContent = 'Service location travel fee';
    travelDetails.style.padding = '8px 12px';
    travelDetails.style.borderBottom = '1px solid #e5e7eb';
    
    const travelCost = document.createElement('td');
    travelCost.textContent = formatCurrency(quote.travelCost);
    travelCost.style.padding = '8px 12px';
    travelCost.style.borderBottom = '1px solid #e5e7eb';
    
    travelRow.appendChild(travelLabel);
    travelRow.appendChild(travelDetails);
    travelRow.appendChild(travelCost);
    tbody.appendChild(travelRow);
  }
  
  // Add taxes if applicable
  if (quote.laborTax > 0 || quote.materialsTax > 0) {
    const taxRow = document.createElement('tr');
    
    const taxLabel = document.createElement('td');
    taxLabel.textContent = 'Taxes';
    taxLabel.style.padding = '8px 12px';
    taxLabel.style.borderBottom = '1px solid #e5e7eb';
    
    const taxDetails = document.createElement('td');
    taxDetails.textContent = 'Local sales taxes';
    taxDetails.style.padding = '8px 12px';
    taxDetails.style.borderBottom = '1px solid #e5e7eb';
    
    const taxCost = document.createElement('td');
    taxCost.textContent = formatCurrency((quote.laborTax || 0) + (quote.materialsTax || 0));
    taxCost.style.padding = '8px 12px';
    taxCost.style.borderBottom = '1px solid #e5e7eb';
    
    taxRow.appendChild(taxLabel);
    taxRow.appendChild(taxDetails);
    taxRow.appendChild(taxCost);
    tbody.appendChild(taxRow);
  }
  
  // Add total row
  const totalRow = document.createElement('tr');
  
  const totalLabel = document.createElement('td');
  totalLabel.textContent = 'Total';
  totalLabel.style.padding = '12px';
  totalLabel.style.fontWeight = 'bold';
  totalLabel.style.backgroundColor = '#f9fafb';
  
  const totalDetails = document.createElement('td');
  totalDetails.textContent = tierName;
  totalDetails.style.padding = '12px';
  totalDetails.style.fontWeight = 'bold';
  totalDetails.style.backgroundColor = '#f9fafb';
  
  const totalCost = document.createElement('td');
  totalCost.textContent = formatCurrency(quote.total);
  totalCost.style.padding = '12px';
  totalCost.style.fontWeight = 'bold';
  totalCost.style.backgroundColor = '#f9fafb';
  
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalDetails);
  totalRow.appendChild(totalCost);
  tbody.appendChild(totalRow);
  
  table.appendChild(tbody);
  costBreakdown.appendChild(table);
  
  quoteDetails.appendChild(costBreakdown);
  content.appendChild(quoteDetails);
  
  // Additional information section
  const additionalInfo = document.createElement('div');
  additionalInfo.style.marginTop = '20px';
  additionalInfo.style.fontSize = '14px';
  additionalInfo.style.color = '#6b7280';
  additionalInfo.style.padding = '16px';
  additionalInfo.style.backgroundColor = '#f9fafb';
  additionalInfo.style.borderRadius = '6px';
  
  const additionalInfoTitle = document.createElement('h4');
  additionalInfoTitle.textContent = 'Additional Information';
  additionalInfoTitle.style.margin = '0 0 8px 0';
  additionalInfoTitle.style.fontSize = '16px';
  additionalInfoTitle.style.color = '#111827';
  
  const additionalInfoText = document.createElement('p');
  additionalInfoText.innerHTML = `
    This quote is valid for 30 days from the issue date.<br>
    Payment terms: 50% deposit required to secure booking.<br>
    Please contact us with any questions regarding this quote.
  `;
  additionalInfoText.style.margin = '0';
  additionalInfoText.style.lineHeight = '1.5';
  
  additionalInfo.appendChild(additionalInfoTitle);
  additionalInfo.appendChild(additionalInfoText);
  
  content.appendChild(additionalInfo);
  
  // Action buttons section
  const actionButtons = document.createElement('div');
  actionButtons.style.marginTop = '24px';
  actionButtons.style.display = 'flex';
  actionButtons.style.justifyContent = 'space-between';
  actionButtons.style.gap = '12px';
  
  // Back button
  const backButton = document.createElement('button');
  backButton.textContent = 'Close Preview';
  backButton.style.padding = '10px 16px';
  backButton.style.border = '1px solid #d1d5db';
  backButton.style.borderRadius = '6px';
  backButton.style.backgroundColor = 'white';
  backButton.style.cursor = 'pointer';
  backButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Client view options section - what clients would see
  const clientActions = document.createElement('div');
  clientActions.style.display = 'flex';
  clientActions.style.gap = '12px';
  
  // Accept quote button (shown as disabled in preview)
  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Accept Quote';
  acceptButton.style.padding = '10px 16px';
  acceptButton.style.backgroundColor = '#16a34a'; // Green
  acceptButton.style.color = 'white';
  acceptButton.style.border = 'none';
  acceptButton.style.borderRadius = '6px';
  acceptButton.style.cursor = 'default';
  acceptButton.style.opacity = '0.7';
  acceptButton.title = 'This button is for preview only, clients would see this option';
  
  // Request changes button (shown as disabled in preview)
  const changesButton = document.createElement('button');
  changesButton.textContent = 'Request Changes';
  changesButton.style.padding = '10px 16px';
  changesButton.style.backgroundColor = '#f97316'; // Orange
  changesButton.style.color = 'white';
  changesButton.style.border = 'none';
  changesButton.style.borderRadius = '6px';
  changesButton.style.cursor = 'default';
  changesButton.style.opacity = '0.7';
  changesButton.title = 'This button is for preview only, clients would see this option';
  
  clientActions.appendChild(acceptButton);
  clientActions.appendChild(changesButton);
  
  actionButtons.appendChild(backButton);
  actionButtons.appendChild(clientActions);
  
  content.appendChild(actionButtons);
  
  modalOverlay.appendChild(content);
  document.body.appendChild(modalOverlay);
}

// Helper function for formatting currency values
function formatCurrency(value) {
  return `$${(value || 0).toFixed(2)}`;
}

// Log confirmation of function availability
console.log('Client preview function loaded successfully');