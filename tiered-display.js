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
  
  // Create tiered options container
  const tiersContainer = document.createElement('div');
  tiersContainer.style.display = 'flex';
  tiersContainer.style.gap = '16px';
  tiersContainer.style.marginTop = '32px';
  tiersContainer.style.flexWrap = 'wrap';
  tiersContainer.style.justifyContent = 'center';
  
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
    const card = createTierCard(tier.data, quoteResult.valueProps[tier.key.replace('tier', '').toLowerCase()], isRecommended);
    tiersContainer.appendChild(card);
  });
  
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
  
  // Button container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'space-between';
  buttonsContainer.style.marginTop = '24px';
  
  // Left-side buttons
  const leftButtons = document.createElement('div');
  leftButtons.style.display = 'flex';
  leftButtons.style.gap = '12px';
  
  // Print button
  const printButton = document.createElement('button');
  printButton.textContent = 'Print Quote';
  printButton.style.padding = '10px 16px';
  printButton.style.backgroundColor = 'white';
  printButton.style.color = 'var(--color-primary)';
  printButton.style.border = '1px solid var(--color-primary)';
  printButton.style.borderRadius = '4px';
  printButton.style.fontWeight = '500';
  printButton.style.cursor = 'pointer';
  printButton.onclick = () => printQuote(quoteResult);
  
  // Print customer version button
  const printCustomerButton = document.createElement('button');
  printCustomerButton.textContent = 'Print Customer Version';
  printCustomerButton.style.padding = '10px 16px';
  printCustomerButton.style.backgroundColor = 'white';
  printCustomerButton.style.color = 'var(--color-primary)';
  printCustomerButton.style.border = '1px solid var(--color-primary)';
  printCustomerButton.style.borderRadius = '4px';
  printCustomerButton.style.fontWeight = '500';
  printCustomerButton.style.cursor = 'pointer';
  printCustomerButton.onclick = () => printQuote(quoteResult, true);
  
  leftButtons.appendChild(printButton);
  leftButtons.appendChild(printCustomerButton);
  
  // Right-side button
  const rightButtons = document.createElement('div');
  
  // Create invoice button
  const invoiceButton = document.createElement('button');
  invoiceButton.textContent = 'Create Invoice';
  invoiceButton.style.padding = '10px 20px';
  invoiceButton.style.backgroundColor = 'var(--color-primary)';
  invoiceButton.style.color = 'white';
  invoiceButton.style.border = 'none';
  invoiceButton.style.borderRadius = '4px';
  invoiceButton.style.fontWeight = '500';
  invoiceButton.style.cursor = 'pointer';
  invoiceButton.onclick = () => createInvoiceFromQuote(quoteResult);
  
  rightButtons.appendChild(invoiceButton);
  
  buttonsContainer.appendChild(leftButtons);
  buttonsContainer.appendChild(rightButtons);
  
  // Add all sections to the result container
  resultContainer.appendChild(header);
  resultContainer.appendChild(serviceDetails);
  resultContainer.appendChild(tiersContainer);
  resultContainer.appendChild(valueCallout);
  resultContainer.appendChild(buttonsContainer);
  
  // Add the result container to the page
  resultSection.appendChild(resultContainer);
  
  // Save to local storage for later retrieval
  saveQuote(quoteResult);
}

/**
 * Create a tier card for displaying quote options
 * @param {Object} tierData - Data for this specific tier
 * @param {Array} valueProps - Value propositions for this tier
 * @param {boolean} isRecommended - Whether this tier is recommended
 * @returns {HTMLElement} The tier card element
 */
function createTierCard(tierData, valueProps, isRecommended) {
  const card = document.createElement('div');
  card.className = 'tier-card';
  card.style.flex = '1 1 300px';
  card.style.maxWidth = '350px';
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
    // Here you could add code to handle the selection, e.g., show a detailed breakdown
    
    // Show breakdown when selected
    showTierBreakdown(tierData);
  };
  
  // Add all elements to the card
  card.appendChild(header);
  card.appendChild(propsList);
  card.appendChild(warranty);
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
  breakdownList.appendChild(subtotalRow);
  breakdownList.appendChild(taxRow);
  breakdownList.appendChild(totalRow);
  
  breakdownSection.appendChild(breakdownList);
  
  // Scroll to the breakdown
  breakdownSection.scrollIntoView({ behavior: 'smooth' });
}