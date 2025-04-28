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
  
  // Accept quote button (fully functional)
  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Accept Quote & Pay';
  acceptButton.style.padding = '10px 16px';
  acceptButton.style.backgroundColor = '#16a34a'; // Green
  acceptButton.style.color = 'white';
  acceptButton.style.border = 'none';
  acceptButton.style.borderRadius = '6px';
  acceptButton.style.cursor = 'pointer';
  acceptButton.style.fontWeight = 'bold';
  acceptButton.addEventListener('click', () => {
    // Transform the preview into a payable invoice
    transformToPayableInvoice(quote, tierName, modalOverlay);
  });
  
  // Request changes button (fully functional)
  const changesButton = document.createElement('button');
  changesButton.textContent = 'Request Changes';
  changesButton.style.padding = '10px 16px';
  changesButton.style.backgroundColor = '#f97316'; // Orange
  changesButton.style.color = 'white';
  changesButton.style.border = 'none';
  changesButton.style.borderRadius = '6px';
  changesButton.style.cursor = 'pointer';
  changesButton.addEventListener('click', () => {
    showRequestChangesForm(quote, tierName, modalOverlay);
  });
  
  clientActions.appendChild(acceptButton);
  clientActions.appendChild(changesButton);
  
  actionButtons.appendChild(backButton);
  actionButtons.appendChild(clientActions);
  
  content.appendChild(actionButtons);
  
  modalOverlay.appendChild(content);
  document.body.appendChild(modalOverlay);
}

/**
 * Transforms the quote preview into a payable invoice with Stripe integration
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 * @param {HTMLElement} modalOverlay - The current modal overlay to replace
 */
function transformToPayableInvoice(quote, tierName, modalOverlay) {
  // First, remove the existing modal
  document.body.removeChild(modalOverlay);
  
  // Create new modal for payment
  const paymentModal = document.createElement('div');
  paymentModal.style.position = 'fixed';
  paymentModal.style.top = '0';
  paymentModal.style.left = '0';
  paymentModal.style.width = '100%';
  paymentModal.style.height = '100%';
  paymentModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  paymentModal.style.display = 'flex';
  paymentModal.style.alignItems = 'center';
  paymentModal.style.justifyContent = 'center';
  paymentModal.style.zIndex = '9999';
  
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  content.style.width = '90%';
  content.style.maxWidth = '650px';
  content.style.maxHeight = '90vh';
  content.style.overflow = 'auto';
  content.style.padding = '24px';
  
  // Payment header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h3');
  title.textContent = 'Complete Your Payment';
  title.style.margin = '0';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(paymentModal);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  content.appendChild(header);
  
  // Order summary section
  const orderSummary = document.createElement('div');
  orderSummary.style.backgroundColor = '#f9fafb';
  orderSummary.style.borderRadius = '6px';
  orderSummary.style.padding = '16px';
  orderSummary.style.marginBottom = '24px';
  
  const summaryTitle = document.createElement('h4');
  summaryTitle.textContent = 'Order Summary';
  summaryTitle.style.margin = '0 0 12px 0';
  summaryTitle.style.fontSize = '16px';
  summaryTitle.style.fontWeight = 'bold';
  
  const serviceLine = document.createElement('div');
  serviceLine.style.display = 'flex';
  serviceLine.style.justifyContent = 'space-between';
  serviceLine.style.marginBottom = '8px';
  
  const serviceLabel = document.createElement('span');
  serviceLabel.textContent = `${tierName} ${quote.jobTypeDisplay} Service`;
  
  const serviceValue = document.createElement('span');
  serviceValue.textContent = formatCurrency(quote.total);
  serviceValue.style.fontWeight = 'bold';
  
  serviceLine.appendChild(serviceLabel);
  serviceLine.appendChild(serviceValue);
  
  // Calculate deposit amount (25% of total)
  const depositAmount = quote.total * 0.25;
  const depositLine = document.createElement('div');
  depositLine.style.display = 'flex';
  depositLine.style.justifyContent = 'space-between';
  depositLine.style.marginBottom = '8px';
  depositLine.style.padding = '8px 0';
  depositLine.style.borderTop = '1px dashed #e5e7eb';
  
  const depositLabel = document.createElement('span');
  depositLabel.textContent = 'Deposit Due Now (25%)';
  depositLabel.style.fontWeight = 'bold';
  
  const depositValue = document.createElement('span');
  depositValue.textContent = formatCurrency(depositAmount);
  depositValue.style.fontWeight = 'bold';
  depositValue.style.color = '#16a34a';
  
  depositLine.appendChild(depositLabel);
  depositLine.appendChild(depositValue);
  
  // Calculate remaining balance
  const remainingAmount = quote.total - depositAmount;
  const remainingLine = document.createElement('div');
  remainingLine.style.display = 'flex';
  remainingLine.style.justifyContent = 'space-between';
  
  const remainingLabel = document.createElement('span');
  remainingLabel.textContent = 'Remaining Balance (due after service)';
  remainingLabel.style.fontSize = '14px';
  remainingLabel.style.color = '#6b7280';
  
  const remainingValue = document.createElement('span');
  remainingValue.textContent = formatCurrency(remainingAmount);
  remainingValue.style.fontSize = '14px';
  remainingValue.style.color = '#6b7280';
  
  remainingLine.appendChild(remainingLabel);
  remainingLine.appendChild(remainingValue);
  
  orderSummary.appendChild(summaryTitle);
  orderSummary.appendChild(serviceLine);
  orderSummary.appendChild(depositLine);
  orderSummary.appendChild(remainingLine);
  
  content.appendChild(orderSummary);
  
  // Payment method section
  const paymentSection = document.createElement('div');
  paymentSection.style.marginBottom = '24px';
  
  const paymentTitle = document.createElement('h4');
  paymentTitle.textContent = 'Payment Method';
  paymentTitle.style.margin = '0 0 16px 0';
  paymentTitle.style.fontSize = '16px';
  paymentTitle.style.fontWeight = 'bold';
  
  // Create a container for the Stripe Elements
  const stripeContainer = document.createElement('div');
  stripeContainer.id = 'stripe-payment-element';
  stripeContainer.style.padding = '20px';
  stripeContainer.style.border = '1px solid #e5e7eb';
  stripeContainer.style.borderRadius = '6px';
  stripeContainer.style.backgroundColor = 'white';
  
  // Placeholder until Stripe loads
  const stripePlaceholder = document.createElement('div');
  stripePlaceholder.style.textAlign = 'center';
  
  const cardIcon = document.createElement('div');
  cardIcon.innerHTML = '💳';
  cardIcon.style.fontSize = '24px';
  cardIcon.style.marginBottom = '12px';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Loading secure payment form...';
  loadingText.style.margin = '0';
  
  stripePlaceholder.appendChild(cardIcon);
  stripePlaceholder.appendChild(loadingText);
  stripeContainer.appendChild(stripePlaceholder);
  
  paymentSection.appendChild(paymentTitle);
  paymentSection.appendChild(stripeContainer);
  
  // Payment terms acceptance
  const termsSection = document.createElement('div');
  termsSection.style.marginBottom = '24px';
  
  const termsCheckbox = document.createElement('div');
  termsCheckbox.style.display = 'flex';
  termsCheckbox.style.alignItems = 'flex-start';
  termsCheckbox.style.marginBottom = '8px';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'accept-terms';
  checkbox.style.marginRight = '10px';
  checkbox.style.marginTop = '5px';
  
  const termsLabel = document.createElement('label');
  termsLabel.htmlFor = 'accept-terms';
  termsLabel.innerHTML = 'I agree to the <a href="#" style="color: #4F46E5;">terms and conditions</a> and authorize a payment of ' + formatCurrency(depositAmount) + ' as a deposit for this service.';
  termsLabel.style.fontSize = '14px';
  termsLabel.style.lineHeight = '1.5';
  
  termsCheckbox.appendChild(checkbox);
  termsCheckbox.appendChild(termsLabel);
  termsSection.appendChild(termsCheckbox);
  
  content.appendChild(paymentSection);
  content.appendChild(termsSection);
  
  // Pay now button
  const payButton = document.createElement('button');
  payButton.textContent = `Pay Deposit ${formatCurrency(depositAmount)}`;
  payButton.style.backgroundColor = '#16a34a';
  payButton.style.color = 'white';
  payButton.style.border = 'none';
  payButton.style.borderRadius = '6px';
  payButton.style.padding = '12px 24px';
  payButton.style.fontSize = '16px';
  payButton.style.fontWeight = 'bold';
  payButton.style.cursor = 'pointer';
  payButton.style.width = '100%';
  payButton.style.marginTop = '8px';
  
  // Disable button initially until terms are accepted
  payButton.disabled = true;
  payButton.style.opacity = '0.7';
  
  // Enable button when terms are accepted
  checkbox.addEventListener('change', function() {
    payButton.disabled = !this.checked;
    payButton.style.opacity = this.checked ? '1' : '0.7';
  });
  
  // Handle payment when button is clicked
  payButton.addEventListener('click', () => {
    // In a real implementation, this would handle the Stripe payment
    // For now, simulate by showing a confirmation message
    if (checkbox.checked) {
      processPayment(quote, tierName, depositAmount, paymentModal);
    } else {
      alert('Please accept the terms and conditions to proceed with payment.');
    }
  });
  
  content.appendChild(payButton);
  
  // Security note
  const securityNote = document.createElement('div');
  securityNote.style.display = 'flex';
  securityNote.style.alignItems = 'center';
  securityNote.style.justifyContent = 'center';
  securityNote.style.marginTop = '16px';
  
  const lockIcon = document.createElement('span');
  lockIcon.innerHTML = '🔒';
  lockIcon.style.marginRight = '8px';
  
  const securityText = document.createElement('span');
  securityText.textContent = 'Secure payment processing by Stripe';
  securityText.style.fontSize = '12px';
  securityText.style.color = '#6b7280';
  
  securityNote.appendChild(lockIcon);
  securityNote.appendChild(securityText);
  
  content.appendChild(securityNote);
  
  paymentModal.appendChild(content);
  document.body.appendChild(paymentModal);
  
  // In a real implementation, this would initialize Stripe
  // For now, just simulate with a timer
  setTimeout(() => {
    // Replace placeholder with a mockup of Stripe Elements
    stripePlaceholder.innerHTML = '';
    
    const mockStripeElement = document.createElement('div');
    mockStripeElement.style.height = '40px';
    mockStripeElement.style.backgroundColor = '#f9fafb';
    mockStripeElement.style.border = '1px solid #e5e7eb';
    mockStripeElement.style.borderRadius = '4px';
    mockStripeElement.style.padding = '10px';
    mockStripeElement.style.fontSize = '14px';
    mockStripeElement.style.color = '#6b7280';
    mockStripeElement.style.marginBottom = '12px';
    mockStripeElement.textContent = 'Card Number: 4242 4242 4242 4242';
    
    const mockExpiryElement = document.createElement('div');
    mockExpiryElement.style.height = '40px';
    mockExpiryElement.style.backgroundColor = '#f9fafb';
    mockExpiryElement.style.border = '1px solid #e5e7eb';
    mockExpiryElement.style.borderRadius = '4px';
    mockExpiryElement.style.padding = '10px';
    mockExpiryElement.style.fontSize = '14px';
    mockExpiryElement.style.color = '#6b7280';
    mockExpiryElement.style.marginBottom = '12px';
    mockExpiryElement.textContent = 'MM/YY: 12/25    CVC: 123';
    
    stripePlaceholder.appendChild(mockStripeElement);
    stripePlaceholder.appendChild(mockExpiryElement);
    
    // Add note for demo purposes
    const demoNote = document.createElement('div');
    demoNote.style.marginTop = '12px';
    demoNote.style.fontSize = '12px';
    demoNote.style.color = '#6b7280';
    demoNote.style.fontStyle = 'italic';
    demoNote.textContent = 'This is a demonstration of how the payment form would look with Stripe integration.';
    stripePlaceholder.appendChild(demoNote);
  }, 1500);
}

/**
 * Process the payment using Stripe
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 * @param {number} amount - The amount to charge
 * @param {HTMLElement} modal - The payment modal
 */
function processPayment(quote, tierName, amount, modal) {
  // Remove the existing modal
  document.body.removeChild(modal);
  
  // Create a processing indicator
  const processingOverlay = document.createElement('div');
  processingOverlay.style.position = 'fixed';
  processingOverlay.style.top = '0';
  processingOverlay.style.left = '0';
  processingOverlay.style.width = '100%';
  processingOverlay.style.height = '100%';
  processingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  processingOverlay.style.display = 'flex';
  processingOverlay.style.flexDirection = 'column';
  processingOverlay.style.alignItems = 'center';
  processingOverlay.style.justifyContent = 'center';
  processingOverlay.style.zIndex = '10000';
  
  const spinner = document.createElement('div');
  spinner.style.border = '5px solid #f3f3f3';
  spinner.style.borderTop = '5px solid #4F46E5';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '50px';
  spinner.style.height = '50px';
  spinner.style.animation = 'spin 1s linear infinite';
  
  // Add keyframes for spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  const processingText = document.createElement('p');
  processingText.textContent = 'Processing your payment...';
  processingText.style.marginTop = '16px';
  processingText.style.fontSize = '18px';
  processingText.style.fontWeight = 'bold';
  
  processingOverlay.appendChild(spinner);
  processingOverlay.appendChild(processingText);
  document.body.appendChild(processingOverlay);
  
  // Simulate payment processing with Stripe (in a real app, this would call the Stripe API)
  setTimeout(() => {
    document.body.removeChild(processingOverlay);
    showPaymentConfirmation(quote, tierName, amount);
  }, 2500);
}

/**
 * Show payment confirmation after successful payment
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 * @param {number} amount - The amount charged
 */
function showPaymentConfirmation(quote, tierName, amount) {
  const confirmationModal = document.createElement('div');
  confirmationModal.style.position = 'fixed';
  confirmationModal.style.top = '0';
  confirmationModal.style.left = '0';
  confirmationModal.style.width = '100%';
  confirmationModal.style.height = '100%';
  confirmationModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  confirmationModal.style.display = 'flex';
  confirmationModal.style.alignItems = 'center';
  confirmationModal.style.justifyContent = 'center';
  confirmationModal.style.zIndex = '9999';
  
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  content.style.width = '90%';
  content.style.maxWidth = '500px';
  content.style.padding = '32px';
  content.style.textAlign = 'center';
  
  // Success icon
  const successIcon = document.createElement('div');
  successIcon.innerHTML = '✅';
  successIcon.style.fontSize = '48px';
  successIcon.style.marginBottom = '16px';
  
  const confirmationTitle = document.createElement('h3');
  confirmationTitle.textContent = 'Payment Successful!';
  confirmationTitle.style.fontSize = '24px';
  confirmationTitle.style.fontWeight = 'bold';
  confirmationTitle.style.marginBottom = '16px';
  
  const confirmationMessage = document.createElement('p');
  confirmationMessage.innerHTML = `Your deposit of <strong>${formatCurrency(amount)}</strong> for the ${tierName} ${quote.jobTypeDisplay} service has been processed successfully.`;
  confirmationMessage.style.marginBottom = '24px';
  confirmationMessage.style.fontSize = '16px';
  confirmationMessage.style.lineHeight = '1.5';
  
  // Receipt details
  const receiptBox = document.createElement('div');
  receiptBox.style.backgroundColor = '#f0fdf4'; // Light green
  receiptBox.style.borderRadius = '6px';
  receiptBox.style.padding = '16px';
  receiptBox.style.marginBottom = '24px';
  receiptBox.style.textAlign = 'left';
  
  const receiptTitle = document.createElement('h4');
  receiptTitle.textContent = 'Payment Receipt';
  receiptTitle.style.fontSize = '16px';
  receiptTitle.style.fontWeight = 'bold';
  receiptTitle.style.marginBottom = '12px';
  
  const transactionId = document.createElement('p');
  // Generate a fake transaction ID
  const fakeTransactionId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
  transactionId.innerHTML = `<strong>Transaction ID:</strong> ${fakeTransactionId}`;
  transactionId.style.margin = '0 0 8px 0';
  transactionId.style.fontSize = '14px';
  
  const paymentDate = document.createElement('p');
  paymentDate.innerHTML = `<strong>Date:</strong> ${new Date().toLocaleDateString()}`;
  paymentDate.style.margin = '0 0 8px 0';
  paymentDate.style.fontSize = '14px';
  
  const paymentAmount = document.createElement('p');
  paymentAmount.innerHTML = `<strong>Amount:</strong> ${formatCurrency(amount)}`;
  paymentAmount.style.margin = '0 0 8px 0';
  paymentAmount.style.fontSize = '14px';
  
  const paymentMethod = document.createElement('p');
  paymentMethod.innerHTML = `<strong>Payment Method:</strong> Credit Card (Stripe)`;
  paymentMethod.style.margin = '0';
  paymentMethod.style.fontSize = '14px';
  
  receiptBox.appendChild(receiptTitle);
  receiptBox.appendChild(transactionId);
  receiptBox.appendChild(paymentDate);
  receiptBox.appendChild(paymentAmount);
  receiptBox.appendChild(paymentMethod);
  
  // Next steps message
  const nextSteps = document.createElement('p');
  nextSteps.innerHTML = 'A confirmation email has been sent to your registered email address. Your service provider will contact you shortly to schedule your service.';
  nextSteps.style.fontSize = '14px';
  nextSteps.style.lineHeight = '1.5';
  nextSteps.style.marginBottom = '24px';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Return to Dashboard';
  closeButton.style.backgroundColor = '#4F46E5';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.padding = '12px 24px';
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(confirmationModal);
    // In a real app, this would redirect to the dashboard
    if (typeof window.navigateTo === 'function') {
      window.navigateTo('dashboard');
    }
  });
  
  content.appendChild(successIcon);
  content.appendChild(confirmationTitle);
  content.appendChild(confirmationMessage);
  content.appendChild(receiptBox);
  content.appendChild(nextSteps);
  content.appendChild(closeButton);
  
  confirmationModal.appendChild(content);
  document.body.appendChild(confirmationModal);
}

/**
 * Show the request changes form
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name (Basic, Standard, Premium)
 * @param {HTMLElement} modalOverlay - The current modal overlay
 */
function showRequestChangesForm(quote, tierName, modalOverlay) {
  // First, remove the existing modal
  document.body.removeChild(modalOverlay);
  
  // Create new modal for changes request
  const changesModal = document.createElement('div');
  changesModal.style.position = 'fixed';
  changesModal.style.top = '0';
  changesModal.style.left = '0';
  changesModal.style.width = '100%';
  changesModal.style.height = '100%';
  changesModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  changesModal.style.display = 'flex';
  changesModal.style.alignItems = 'center';
  changesModal.style.justifyContent = 'center';
  changesModal.style.zIndex = '9999';
  
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  content.style.width = '90%';
  content.style.maxWidth = '600px';
  content.style.maxHeight = '90vh';
  content.style.overflow = 'auto';
  content.style.padding = '24px';
  
  // Form header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h3');
  title.textContent = 'Request Changes to Quote';
  title.style.margin = '0';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(changesModal);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  content.appendChild(header);
  
  // Brief quote summary for reference
  const quoteSummary = document.createElement('div');
  quoteSummary.style.backgroundColor = '#f9fafb';
  quoteSummary.style.borderRadius = '6px';
  quoteSummary.style.padding = '16px';
  quoteSummary.style.marginBottom = '24px';
  
  const summaryTitle = document.createElement('h4');
  summaryTitle.textContent = `Original ${tierName} Quote`;
  summaryTitle.style.margin = '0 0 12px 0';
  summaryTitle.style.fontSize = '16px';
  summaryTitle.style.fontWeight = 'bold';
  
  const originalDetails = document.createElement('p');
  originalDetails.innerHTML = `
    <strong>Service:</strong> ${quote.jobTypeDisplay}<br>
    <strong>Location:</strong> ${quote.location}<br>
    <strong>Total:</strong> ${formatCurrency(quote.total)}
  `;
  originalDetails.style.margin = '0';
  originalDetails.style.fontSize = '14px';
  originalDetails.style.lineHeight = '1.6';
  
  quoteSummary.appendChild(summaryTitle);
  quoteSummary.appendChild(originalDetails);
  content.appendChild(quoteSummary);
  
  // Changes form
  const form = document.createElement('form');
  form.style.marginBottom = '24px';
  
  // Request type
  const requestTypeSection = document.createElement('div');
  requestTypeSection.style.marginBottom = '20px';
  
  const requestTypeLabel = document.createElement('label');
  requestTypeLabel.textContent = 'Type of Request';
  requestTypeLabel.style.display = 'block';
  requestTypeLabel.style.marginBottom = '8px';
  requestTypeLabel.style.fontWeight = 'bold';
  
  const requestTypeSelect = document.createElement('select');
  requestTypeSelect.style.width = '100%';
  requestTypeSelect.style.padding = '10px';
  requestTypeSelect.style.border = '1px solid #e5e7eb';
  requestTypeSelect.style.borderRadius = '6px';
  requestTypeSelect.style.backgroundColor = 'white';
  
  const requestOptions = [
    'Request price adjustment',
    'Change scope of work',
    'Adjust materials',
    'Change service date',
    'Other changes'
  ];
  
  requestOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    requestTypeSelect.appendChild(optionElement);
  });
  
  requestTypeSection.appendChild(requestTypeLabel);
  requestTypeSection.appendChild(requestTypeSelect);
  
  // Details textarea
  const detailsSection = document.createElement('div');
  detailsSection.style.marginBottom = '20px';
  
  const detailsLabel = document.createElement('label');
  detailsLabel.textContent = 'Provide Details';
  detailsLabel.style.display = 'block';
  detailsLabel.style.marginBottom = '8px';
  detailsLabel.style.fontWeight = 'bold';
  
  const detailsTextarea = document.createElement('textarea');
  detailsTextarea.placeholder = 'Please describe the changes you would like to request...';
  detailsTextarea.style.width = '100%';
  detailsTextarea.style.padding = '10px';
  detailsTextarea.style.border = '1px solid #e5e7eb';
  detailsTextarea.style.borderRadius = '6px';
  detailsTextarea.style.minHeight = '120px';
  detailsTextarea.style.resize = 'vertical';
  
  detailsSection.appendChild(detailsLabel);
  detailsSection.appendChild(detailsTextarea);
  
  // Communication preference
  const preferenceSection = document.createElement('div');
  
  const preferenceLabel = document.createElement('label');
  preferenceLabel.textContent = 'Preferred Contact Method';
  preferenceLabel.style.display = 'block';
  preferenceLabel.style.marginBottom = '8px';
  preferenceLabel.style.fontWeight = 'bold';
  
  const preferenceOptions = document.createElement('div');
  
  const emailOption = document.createElement('div');
  emailOption.style.marginBottom = '8px';
  
  const emailRadio = document.createElement('input');
  emailRadio.type = 'radio';
  emailRadio.name = 'contactPreference';
  emailRadio.id = 'contact-email';
  emailRadio.value = 'email';
  emailRadio.checked = true;
  emailRadio.style.marginRight = '8px';
  
  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'contact-email';
  emailLabel.textContent = 'Email';
  
  emailOption.appendChild(emailRadio);
  emailOption.appendChild(emailLabel);
  
  const phoneOption = document.createElement('div');
  phoneOption.style.marginBottom = '8px';
  
  const phoneRadio = document.createElement('input');
  phoneRadio.type = 'radio';
  phoneRadio.name = 'contactPreference';
  phoneRadio.id = 'contact-phone';
  phoneRadio.value = 'phone';
  phoneRadio.style.marginRight = '8px';
  
  const phoneLabel = document.createElement('label');
  phoneLabel.htmlFor = 'contact-phone';
  phoneLabel.textContent = 'Phone';
  
  phoneOption.appendChild(phoneRadio);
  phoneOption.appendChild(phoneLabel);
  
  preferenceOptions.appendChild(emailOption);
  preferenceOptions.appendChild(phoneOption);
  
  preferenceSection.appendChild(preferenceLabel);
  preferenceSection.appendChild(preferenceOptions);
  
  form.appendChild(requestTypeSection);
  form.appendChild(detailsSection);
  form.appendChild(preferenceSection);
  
  content.appendChild(form);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Change Request';
  submitButton.style.backgroundColor = '#f97316'; // Orange
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '6px';
  submitButton.style.padding = '12px 24px';
  submitButton.style.fontSize = '16px';
  submitButton.style.fontWeight = 'bold';
  submitButton.style.cursor = 'pointer';
  submitButton.style.width = '100%';
  
  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Validate form
    if (!detailsTextarea.value.trim()) {
      alert('Please provide details about your requested changes.');
      return;
    }
    
    // In a real app, this would submit the form to the server
    submitChangeRequest(quote, tierName, {
      requestType: requestTypeSelect.value,
      details: detailsTextarea.value,
      contactPreference: document.querySelector('input[name="contactPreference"]:checked').value
    }, changesModal);
  });
  
  content.appendChild(submitButton);
  
  changesModal.appendChild(content);
  document.body.appendChild(changesModal);
}

/**
 * Submit the change request
 * @param {Object} quote - The quote data
 * @param {string} tierName - The tier name
 * @param {Object} requestData - The change request data
 * @param {HTMLElement} modal - The modal element
 */
function submitChangeRequest(quote, tierName, requestData, modal) {
  // Remove the modal
  document.body.removeChild(modal);
  
  // Create a confirmation modal
  const confirmationModal = document.createElement('div');
  confirmationModal.style.position = 'fixed';
  confirmationModal.style.top = '0';
  confirmationModal.style.left = '0';
  confirmationModal.style.width = '100%';
  confirmationModal.style.height = '100%';
  confirmationModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  confirmationModal.style.display = 'flex';
  confirmationModal.style.alignItems = 'center';
  confirmationModal.style.justifyContent = 'center';
  confirmationModal.style.zIndex = '9999';
  
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  content.style.width = '90%';
  content.style.maxWidth = '500px';
  content.style.padding = '32px';
  content.style.textAlign = 'center';
  
  // Success icon
  const successIcon = document.createElement('div');
  successIcon.innerHTML = '✅';
  successIcon.style.fontSize = '48px';
  successIcon.style.marginBottom = '16px';
  
  const confirmationTitle = document.createElement('h3');
  confirmationTitle.textContent = 'Change Request Submitted!';
  confirmationTitle.style.fontSize = '24px';
  confirmationTitle.style.fontWeight = 'bold';
  confirmationTitle.style.marginBottom = '16px';
  
  const confirmationMessage = document.createElement('p');
  confirmationMessage.textContent = `Your request for changes to the ${tierName} ${quote.jobTypeDisplay} quote has been received. The service provider will contact you shortly.`;
  confirmationMessage.style.marginBottom = '24px';
  confirmationMessage.style.fontSize = '16px';
  confirmationMessage.style.lineHeight = '1.5';
  
  // Request details summary
  const requestSummary = document.createElement('div');
  requestSummary.style.backgroundColor = '#fef3c7'; // Light yellow
  requestSummary.style.borderRadius = '6px';
  requestSummary.style.padding = '16px';
  requestSummary.style.marginBottom = '24px';
  requestSummary.style.textAlign = 'left';
  
  const requestSummaryTitle = document.createElement('h4');
  requestSummaryTitle.textContent = 'Request Summary';
  requestSummaryTitle.style.fontSize = '16px';
  requestSummaryTitle.style.fontWeight = 'bold';
  requestSummaryTitle.style.marginBottom = '12px';
  
  const requestType = document.createElement('p');
  requestType.innerHTML = `<strong>Request Type:</strong> ${requestData.requestType}`;
  requestType.style.margin = '0 0 8px 0';
  requestType.style.fontSize = '14px';
  
  const requestDetails = document.createElement('p');
  requestDetails.innerHTML = `<strong>Details:</strong> ${requestData.details}`;
  requestDetails.style.margin = '0 0 8px 0';
  requestDetails.style.fontSize = '14px';
  
  const contactPreference = document.createElement('p');
  contactPreference.innerHTML = `<strong>Contact Preference:</strong> ${requestData.contactPreference}`;
  contactPreference.style.margin = '0';
  contactPreference.style.fontSize = '14px';
  
  requestSummary.appendChild(requestSummaryTitle);
  requestSummary.appendChild(requestType);
  requestSummary.appendChild(requestDetails);
  requestSummary.appendChild(contactPreference);
  
  // Next steps message
  const nextSteps = document.createElement('p');
  nextSteps.innerHTML = 'You will receive a notification when the service provider responds to your request. Thank you for your patience.';
  nextSteps.style.fontSize = '14px';
  nextSteps.style.lineHeight = '1.5';
  nextSteps.style.marginBottom = '24px';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Return to Dashboard';
  closeButton.style.backgroundColor = '#4F46E5';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.padding = '12px 24px';
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(confirmationModal);
    // In a real app, this would redirect to the dashboard
    if (typeof window.navigateTo === 'function') {
      window.navigateTo('dashboard');
    }
  });
  
  content.appendChild(successIcon);
  content.appendChild(confirmationTitle);
  content.appendChild(confirmationMessage);
  content.appendChild(requestSummary);
  content.appendChild(nextSteps);
  content.appendChild(closeButton);
  
  confirmationModal.appendChild(content);
  document.body.appendChild(confirmationModal);
}

// Helper function for formatting currency values
function formatCurrency(value) {
  return `$${(value || 0).toFixed(2)}`;
}

// Log confirmation of function availability
console.log('Client preview function loaded successfully');