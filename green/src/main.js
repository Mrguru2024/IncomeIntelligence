// GREEN Edition - No dependencies on any external libraries - completely self-contained
// Simple single-page application with route handling

// In-memory data store
const appState = {
  currentPage: 'dashboard',
  incomeEntries: [],
  user: {
    name: 'User',
    splitRatio: {
      needs: 40,
      investments: 30,
      savings: 30
    },
    // This simulates authenticated user
    isAuthenticated: false
  }
};

// Load data from localStorage if available
function loadStateFromStorage() {
  const savedState = localStorage.getItem('stackrGreenState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Merge with existing state
    appState.incomeEntries = parsedState.incomeEntries || [];
    if (parsedState.user) {
      appState.user.name = parsedState.user.name || 'User';
      appState.user.splitRatio = parsedState.user.splitRatio || { needs: 40, investments: 30, savings: 30 };
      appState.user.isAuthenticated = parsedState.user.isAuthenticated || false;
    }
    console.log('Data loaded from localStorage');
  }
}

// Save data to localStorage
function saveStateToStorage() {
  localStorage.setItem('stackrGreenState', JSON.stringify({
    incomeEntries: appState.incomeEntries,
    user: appState.user
  }));
  console.log('Data saved to localStorage');
}

// Router function
function navigateTo(page) {
  appState.currentPage = page;
  renderApp();
  // Update URL without page reload
  window.history.pushState(null, '', `#${page}`);
}

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  appState.currentPage = hash;
  renderApp();
});

// Create common layout elements
function createHeader() {
  const header = document.createElement('header');
  header.style.backgroundColor = '#34A853';
  header.style.color = 'white';
  header.style.padding = '20px';
  header.style.textAlign = 'center';
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr Finance';
  logo.style.margin = '0';
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => navigateTo('dashboard'));
  header.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'GREEN Edition - 100% Firebase-free';
  subtitle.style.margin = '5px 0 0 0';
  header.appendChild(subtitle);
  
  // Add navigation
  const nav = document.createElement('nav');
  nav.style.display = 'flex';
  nav.style.justifyContent = 'center';
  nav.style.gap = '20px';
  nav.style.marginTop = '15px';
  
  const pages = [
    { id: 'dashboard', title: 'Dashboard' },
    { id: 'income', title: 'Income Tracker' },
    { id: 'gigs', title: 'Stackr Gigs' },
    { id: 'settings', title: 'Settings' }
  ];
  
  pages.forEach(page => {
    const link = document.createElement('a');
    link.textContent = page.title;
    link.href = `#${page.id}`;
    link.style.color = 'white';
    link.style.textDecoration = appState.currentPage === page.id ? 'underline' : 'none';
    link.style.fontWeight = appState.currentPage === page.id ? 'bold' : 'normal';
    link.style.cursor = 'pointer';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(page.id);
    });
    nav.appendChild(link);
  });
  
  header.appendChild(nav);
  
  return header;
}

function createFooter() {
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#f5f5f5';
  footer.style.padding = '20px';
  footer.style.textAlign = 'center';
  footer.style.marginTop = '40px';
  
  const footerText = document.createElement('p');
  footerText.textContent = '© ' + new Date().getFullYear() + ' Stackr Finance - GREEN Edition';
  footer.appendChild(footerText);
  
  return footer;
}

// Create a reusable card component
function createCard(title, content) {
  const card = document.createElement('div');
  card.style.backgroundColor = '#f5f5f5';
  card.style.borderRadius = '8px';
  card.style.padding = '20px';
  card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  card.style.marginBottom = '30px';
  
  if (title) {
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;
    cardTitle.style.marginTop = '0';
    cardTitle.style.marginBottom = '15px';
    card.appendChild(cardTitle);
  }
  
  if (content) {
    if (typeof content === 'string') {
      const cardContent = document.createElement('p');
      cardContent.textContent = content;
      card.appendChild(cardContent);
    } else {
      card.appendChild(content);
    }
  }
  
  return card;
}

// Create a button component
function createButton(text, onClick, color = '#34A853') {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.backgroundColor = color;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '16px';
  button.style.marginRight = '10px';
  button.style.marginBottom = '10px';
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  return button;
}

// Create an input field component
function createInput(type, placeholder, value = '', onChange) {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.style.padding = '10px';
  input.style.borderRadius = '4px';
  input.style.border = '1px solid #ccc';
  input.style.fontSize = '16px';
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  input.style.marginBottom = '15px';
  if (onChange) {
    input.addEventListener('input', onChange);
  }
  return input;
}

// Create a form group with label
function createFormGroup(labelText, inputElement) {
  const formGroup = document.createElement('div');
  formGroup.style.marginBottom = '15px';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '5px';
  label.style.fontWeight = 'bold';
  
  formGroup.appendChild(label);
  formGroup.appendChild(inputElement);
  
  return formGroup;
}

// Split ratio visualization
function createSplitVisualization(splitRatio) {
  const container = document.createElement('div');
  
  // Create the split description
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'Your income allocation:';
  container.appendChild(splitDesc);
  
  // Create the colored bars to represent the split
  const barContainer = document.createElement('div');
  barContainer.style.display = 'flex';
  barContainer.style.height = '40px';
  barContainer.style.borderRadius = '4px';
  barContainer.style.overflow = 'hidden';
  barContainer.style.marginBottom = '10px';
  
  const needsBar = document.createElement('div');
  needsBar.style.width = `${splitRatio.needs}%`;
  needsBar.style.backgroundColor = '#34A853'; // Green
  barContainer.appendChild(needsBar);
  
  const investBar = document.createElement('div');
  investBar.style.width = `${splitRatio.investments}%`;
  investBar.style.backgroundColor = '#4285F4'; // Blue
  barContainer.appendChild(investBar);
  
  const savingsBar = document.createElement('div');
  savingsBar.style.width = `${splitRatio.savings}%`;
  savingsBar.style.backgroundColor = '#FBBC05'; // Yellow
  barContainer.appendChild(savingsBar);
  
  container.appendChild(barContainer);
  
  // Create labels for the split sections
  const labelsContainer = document.createElement('div');
  labelsContainer.style.display = 'flex';
  labelsContainer.style.justifyContent = 'space-between';
  
  const needsLabel = document.createElement('div');
  needsLabel.innerHTML = `<strong>${splitRatio.needs}%</strong> Needs`;
  needsLabel.style.width = '33%';
  labelsContainer.appendChild(needsLabel);
  
  const investLabel = document.createElement('div');
  investLabel.innerHTML = `<strong>${splitRatio.investments}%</strong> Invest`;
  investLabel.style.width = '33%';
  labelsContainer.appendChild(investLabel);
  
  const savingsLabel = document.createElement('div');
  savingsLabel.innerHTML = `<strong>${splitRatio.savings}%</strong> Save`;
  savingsLabel.style.width = '33%';
  labelsContainer.appendChild(savingsLabel);
  
  container.appendChild(labelsContainer);
  
  return container;
}

// Calculate total income and allocations
function calculateIncomeStats() {
  const total = appState.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const splitRatio = appState.user.splitRatio;
  
  return {
    total,
    needs: (total * splitRatio.needs / 100).toFixed(2),
    investments: (total * splitRatio.investments / 100).toFixed(2),
    savings: (total * splitRatio.savings / 100).toFixed(2)
  };
}

// Page Components
function renderDashboardPage() {
  const container = document.createElement('div');
  
  const welcomeHeading = document.createElement('h2');
  welcomeHeading.textContent = `Welcome to your dashboard, ${appState.user.name}!`;
  welcomeHeading.style.marginBottom = '20px';
  container.appendChild(welcomeHeading);
  
  // Income summary card
  const stats = calculateIncomeStats();
  const incomeSummary = document.createElement('div');
  
  const totalIncomeHeading = document.createElement('h3');
  totalIncomeHeading.textContent = `Total Income: $${stats.total.toFixed(2)}`;
  totalIncomeHeading.style.color = '#34A853';
  incomeSummary.appendChild(totalIncomeHeading);
  
  // Allocations list
  const allocations = document.createElement('ul');
  allocations.style.listStyleType = 'none';
  allocations.style.padding = '0';
  
  const needsItem = document.createElement('li');
  needsItem.innerHTML = `<strong>Needs (${appState.user.splitRatio.needs}%):</strong> $${stats.needs}`;
  needsItem.style.marginBottom = '10px';
  allocations.appendChild(needsItem);
  
  const investmentsItem = document.createElement('li');
  investmentsItem.innerHTML = `<strong>Investments (${appState.user.splitRatio.investments}%):</strong> $${stats.investments}`;
  investmentsItem.style.marginBottom = '10px';
  allocations.appendChild(investmentsItem);
  
  const savingsItem = document.createElement('li');
  savingsItem.innerHTML = `<strong>Savings (${appState.user.splitRatio.savings}%):</strong> $${stats.savings}`;
  allocations.appendChild(savingsItem);
  
  incomeSummary.appendChild(allocations);
  
  const incomeCard = createCard('Income Summary', incomeSummary);
  container.appendChild(incomeCard);
  
  // Split ratio visualization card
  const splitVisual = createSplitVisualization(appState.user.splitRatio);
  const splitCard = createCard('Stackr Split', splitVisual);
  container.appendChild(splitCard);
  
  // Quick actions
  const actionsContainer = document.createElement('div');
  actionsContainer.style.display = 'flex';
  actionsContainer.style.flexWrap = 'wrap';
  actionsContainer.style.gap = '10px';
  actionsContainer.style.marginTop = '20px';
  
  const addIncomeBtn = createButton('Add Income', () => navigateTo('income'), '#34A853');
  actionsContainer.appendChild(addIncomeBtn);
  
  const viewGigsBtn = createButton('Find Gigs', () => navigateTo('gigs'), '#4285F4');
  actionsContainer.appendChild(viewGigsBtn);
  
  const settingsBtn = createButton('Adjust Split', () => navigateTo('settings'), '#FBBC05');
  actionsContainer.appendChild(settingsBtn);
  
  container.appendChild(actionsContainer);
  
  return container;
}

function renderIncomePage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Income Tracker';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Income Entry Form Card
  const formCard = document.createElement('div');
  formCard.style.backgroundColor = '#f5f5f5';
  formCard.style.borderRadius = '8px';
  formCard.style.padding = '20px';
  formCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  formCard.style.marginBottom = '30px';
  
  const formHeading = document.createElement('h3');
  formHeading.textContent = 'Add New Income';
  formHeading.style.marginTop = '0';
  formCard.appendChild(formHeading);
  
  // Create form
  const form = document.createElement('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    
    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    
    if (description && amount && date) {
      // Add new income entry
      const newEntry = {
        id: Date.now(), // Use timestamp as ID
        description,
        amount,
        date,
        source,
        timestamp: new Date().toISOString()
      };
      
      appState.incomeEntries.push(newEntry);
      saveStateToStorage();
      renderApp(); // Re-render the app
      
      // Reset form
      form.reset();
    }
  };
  
  // Form fields
  const descriptionInput = createInput('text', 'Description', '', null);
  descriptionInput.id = 'income-description';
  descriptionInput.required = true;
  form.appendChild(createFormGroup('Description', descriptionInput));
  
  const amountInput = createInput('number', 'Amount', '', null);
  amountInput.id = 'income-amount';
  amountInput.min = '0.01';
  amountInput.step = '0.01';
  amountInput.required = true;
  form.appendChild(createFormGroup('Amount ($)', amountInput));
  
  const dateInput = createInput('date', '', new Date().toISOString().split('T')[0], null);
  dateInput.id = 'income-date';
  dateInput.required = true;
  form.appendChild(createFormGroup('Date', dateInput));
  
  const sourceInput = createInput('text', 'Source (e.g., Client, Gig, Job)', '', null);
  sourceInput.id = 'income-source';
  form.appendChild(createFormGroup('Source', sourceInput));
  
  const submitBtn = createButton('Add Income', null, '#34A853');
  submitBtn.type = 'submit';
  form.appendChild(submitBtn);
  
  formCard.appendChild(form);
  container.appendChild(formCard);
  
  // Income History Card
  const historyCard = document.createElement('div');
  historyCard.style.backgroundColor = '#f5f5f5';
  historyCard.style.borderRadius = '8px';
  historyCard.style.padding = '20px';
  historyCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  
  const historyHeading = document.createElement('h3');
  historyHeading.textContent = 'Income History';
  historyHeading.style.marginTop = '0';
  historyCard.appendChild(historyHeading);
  
  if (appState.incomeEntries.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No income entries yet. Add your first income above!';
    emptyMessage.style.fontStyle = 'italic';
    historyCard.appendChild(emptyMessage);
  } else {
    // Create table for income entries
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Description', 'Amount', 'Date', 'Source', 'Actions'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.textAlign = 'left';
      th.style.padding = '10px';
      th.style.borderBottom = '2px solid #ddd';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    // Sort entries by date (newest first)
    const sortedEntries = [...appState.incomeEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    sortedEntries.forEach(entry => {
      const row = document.createElement('tr');
      
      const descCell = document.createElement('td');
      descCell.textContent = entry.description;
      descCell.style.padding = '10px';
      descCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(descCell);
      
      const amountCell = document.createElement('td');
      amountCell.textContent = `$${entry.amount.toFixed(2)}`;
      amountCell.style.padding = '10px';
      amountCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(amountCell);
      
      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(entry.date).toLocaleDateString();
      dateCell.style.padding = '10px';
      dateCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(dateCell);
      
      const sourceCell = document.createElement('td');
      sourceCell.textContent = entry.source || '-';
      sourceCell.style.padding = '10px';
      sourceCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(sourceCell);
      
      const actionsCell = document.createElement('td');
      actionsCell.style.padding = '10px';
      actionsCell.style.borderBottom = '1px solid #ddd';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.backgroundColor = '#EA4335';
      deleteBtn.style.color = 'white';
      deleteBtn.style.border = 'none';
      deleteBtn.style.padding = '5px 10px';
      deleteBtn.style.borderRadius = '4px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.onclick = () => {
        appState.incomeEntries = appState.incomeEntries.filter(item => item.id !== entry.id);
        saveStateToStorage();
        renderApp();
      };
      
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    historyCard.appendChild(table);
    
    // Add total
    const totalContainer = document.createElement('div');
    totalContainer.style.marginTop = '20px';
    totalContainer.style.fontWeight = 'bold';
    totalContainer.style.fontSize = '18px';
    totalContainer.style.textAlign = 'right';
    
    const total = appState.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    totalContainer.textContent = `Total Income: $${total.toFixed(2)}`;
    
    historyCard.appendChild(totalContainer);
  }
  
  container.appendChild(historyCard);
  
  return container;
}

function renderGigsPage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Stackr Gigs';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  const description = document.createElement('p');
  description.textContent = 'Find opportunities to earn extra income with these gig options:';
  container.appendChild(description);
  
  // List of gig categories in cards
  const gigCategories = [
    {
      title: 'Freelance Services',
      description: 'Offer your professional skills on platforms like Upwork, Fiverr or Freelancer.',
      color: '#34A853'
    },
    {
      title: 'Affiliate Marketing',
      description: 'Earn commission by promoting products you love through affiliate programs.',
      color: '#4285F4'
    },
    {
      title: 'Content Creation',
      description: 'Create and monetize blogs, videos, podcasts or other digital content.',
      color: '#FBBC05'
    },
    {
      title: 'Sell Digital Products',
      description: 'Create and sell e-books, courses, templates, or digital art.',
      color: '#EA4335'
    },
    {
      title: 'Local Services',
      description: 'Offer services in your community like tutoring, pet sitting, or handyman work.',
      color: '#34A853'
    }
  ];
  
  const gigGrid = document.createElement('div');
  gigGrid.style.display = 'grid';
  gigGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  gigGrid.style.gap = '20px';
  gigGrid.style.marginTop = '20px';
  
  gigCategories.forEach(gig => {
    const gigCard = document.createElement('div');
    gigCard.style.backgroundColor = '#f5f5f5';
    gigCard.style.borderRadius = '8px';
    gigCard.style.overflow = 'hidden';
    gigCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    
    // Color accent at the top
    const colorBar = document.createElement('div');
    colorBar.style.height = '8px';
    colorBar.style.backgroundColor = gig.color;
    gigCard.appendChild(colorBar);
    
    const content = document.createElement('div');
    content.style.padding = '20px';
    
    const title = document.createElement('h3');
    title.textContent = gig.title;
    title.style.marginTop = '0';
    title.style.color = gig.color;
    content.appendChild(title);
    
    const desc = document.createElement('p');
    desc.textContent = gig.description;
    content.appendChild(desc);
    
    const exploreBtn = createButton('Explore', null, gig.color);
    exploreBtn.style.marginTop = '10px';
    content.appendChild(exploreBtn);
    
    gigCard.appendChild(content);
    gigGrid.appendChild(gigCard);
  });
  
  container.appendChild(gigGrid);
  
  // Income Generation Program Highlight
  const programHighlight = document.createElement('div');
  programHighlight.style.backgroundColor = '#34A853';
  programHighlight.style.color = 'white';
  programHighlight.style.padding = '30px';
  programHighlight.style.borderRadius = '8px';
  programHighlight.style.marginTop = '40px';
  programHighlight.style.textAlign = 'center';
  
  const programTitle = document.createElement('h3');
  programTitle.textContent = 'Stackr Referral Program';
  programTitle.style.fontSize = '24px';
  programTitle.style.marginTop = '0';
  programHighlight.appendChild(programTitle);
  
  const programDesc = document.createElement('p');
  programDesc.textContent = 'Invite friends to use Stackr and earn $10 for each person who signs up for a Pro account!';
  programDesc.style.fontSize = '18px';
  programDesc.style.marginBottom = '20px';
  programHighlight.appendChild(programDesc);
  
  const learnMoreBtn = createButton('Learn More', null, '#FBBC05');
  learnMoreBtn.style.backgroundColor = 'white';
  learnMoreBtn.style.color = '#34A853';
  learnMoreBtn.style.fontWeight = 'bold';
  programHighlight.appendChild(learnMoreBtn);
  
  container.appendChild(programHighlight);
  
  return container;
}

function renderSettingsPage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Settings';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Profile Card
  const profileCard = document.createElement('div');
  profileCard.style.backgroundColor = '#f5f5f5';
  profileCard.style.borderRadius = '8px';
  profileCard.style.padding = '20px';
  profileCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  profileCard.style.marginBottom = '30px';
  
  const profileHeading = document.createElement('h3');
  profileHeading.textContent = 'Profile Settings';
  profileHeading.style.marginTop = '0';
  profileCard.appendChild(profileHeading);
  
  // Profile form
  const profileForm = document.createElement('form');
  profileForm.onsubmit = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value;
    
    if (name) {
      appState.user.name = name;
      saveStateToStorage();
      renderApp();
    }
  };
  
  const nameInput = createInput('text', 'Your Name', appState.user.name, null);
  nameInput.id = 'user-name';
  nameInput.required = true;
  profileForm.appendChild(createFormGroup('Name', nameInput));
  
  const saveProfileBtn = createButton('Save Profile', null, '#34A853');
  saveProfileBtn.type = 'submit';
  profileForm.appendChild(saveProfileBtn);
  
  profileCard.appendChild(profileForm);
  container.appendChild(profileCard);
  
  // Stackr Split Settings Card
  const splitCard = document.createElement('div');
  splitCard.style.backgroundColor = '#f5f5f5';
  splitCard.style.borderRadius = '8px';
  splitCard.style.padding = '20px';
  splitCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  
  const splitHeading = document.createElement('h3');
  splitHeading.textContent = 'Income Split Settings';
  splitHeading.style.marginTop = '0';
  splitCard.appendChild(splitHeading);
  
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'Customize your income allocation percentages. The total must equal 100%.';
  splitCard.appendChild(splitDesc);
  
  // Current split visualization
  const currentSplit = createSplitVisualization(appState.user.splitRatio);
  splitCard.appendChild(currentSplit);
  
  // Split adjustment form
  const splitForm = document.createElement('form');
  splitForm.style.marginTop = '20px';
  splitForm.onsubmit = (e) => {
    e.preventDefault();
    
    const needs = parseInt(document.getElementById('needs-percent').value);
    const investments = parseInt(document.getElementById('investments-percent').value);
    const savings = parseInt(document.getElementById('savings-percent').value);
    
    if (needs + investments + savings === 100) {
      appState.user.splitRatio = { needs, investments, savings };
      saveStateToStorage();
      renderApp();
    } else {
      alert('The total percentage must equal 100%');
    }
  };
  
  // Needs percent input
  const needsInput = createInput('number', 'Needs %', appState.user.splitRatio.needs.toString(), null);
  needsInput.id = 'needs-percent';
  needsInput.min = '0';
  needsInput.max = '100';
  needsInput.required = true;
  splitForm.appendChild(createFormGroup('Needs %', needsInput));
  
  // Investments percent input
  const investmentsInput = createInput('number', 'Investments %', appState.user.splitRatio.investments.toString(), null);
  investmentsInput.id = 'investments-percent';
  investmentsInput.min = '0';
  investmentsInput.max = '100';
  investmentsInput.required = true;
  splitForm.appendChild(createFormGroup('Investments %', investmentsInput));
  
  // Savings percent input
  const savingsInput = createInput('number', 'Savings %', appState.user.splitRatio.savings.toString(), null);
  savingsInput.id = 'savings-percent';
  savingsInput.min = '0';
  savingsInput.max = '100';
  savingsInput.required = true;
  splitForm.appendChild(createFormGroup('Savings %', savingsInput));
  
  // Form controls
  const formControls = document.createElement('div');
  formControls.style.display = 'flex';
  formControls.style.gap = '10px';
  
  const saveSplitBtn = createButton('Save Split', null, '#34A853');
  saveSplitBtn.type = 'submit';
  formControls.appendChild(saveSplitBtn);
  
  const resetBtn = createButton('Reset to 40/30/30', () => {
    document.getElementById('needs-percent').value = '40';
    document.getElementById('investments-percent').value = '30';
    document.getElementById('savings-percent').value = '30';
  }, '#FBBC05');
  resetBtn.type = 'button';
  formControls.appendChild(resetBtn);
  
  splitForm.appendChild(formControls);
  splitCard.appendChild(splitForm);
  
  container.appendChild(splitCard);
  
  // Data management card
  const dataCard = document.createElement('div');
  dataCard.style.backgroundColor = '#f5f5f5';
  dataCard.style.borderRadius = '8px';
  dataCard.style.padding = '20px';
  dataCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  dataCard.style.marginTop = '30px';
  
  const dataHeading = document.createElement('h3');
  dataHeading.textContent = 'Data Management';
  dataHeading.style.marginTop = '0';
  dataCard.appendChild(dataHeading);
  
  const dataControls = document.createElement('div');
  dataControls.style.display = 'flex';
  dataControls.style.gap = '10px';
  dataControls.style.marginTop = '15px';
  
  const exportBtn = createButton('Export Data', () => {
    // Create a JSON file with all data
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `stackr-green-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, '#4285F4');
  dataControls.appendChild(exportBtn);
  
  const clearBtn = createButton('Clear All Data', () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      appState.incomeEntries = [];
      saveStateToStorage();
      renderApp();
    }
  }, '#EA4335');
  dataControls.appendChild(clearBtn);
  
  dataCard.appendChild(dataControls);
  container.appendChild(dataCard);
  
  return container;
}

// Main render function
function renderApp() {
  const root = document.getElementById('root');
  root.innerHTML = ''; // Clear previous content
  
  // Build page structure
  const header = createHeader();
  root.appendChild(header);
  
  // Create main content container
  const main = document.createElement('main');
  main.style.padding = '40px 20px';
  main.style.maxWidth = '1000px';
  main.style.margin = '0 auto';
  
  // Render different pages based on the current page state
  switch(appState.currentPage) {
    case 'dashboard':
      main.appendChild(renderDashboardPage());
      break;
    case 'income':
      main.appendChild(renderIncomePage());
      break;
    case 'gigs':
      main.appendChild(renderGigsPage());
      break;
    case 'settings':
      main.appendChild(renderSettingsPage());
      break;
    default:
      main.appendChild(renderDashboardPage());
  }
  
  root.appendChild(main);
  
  // Add footer
  const footer = createFooter();
  root.appendChild(footer);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Load saved data
  loadStateFromStorage();
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  appState.currentPage = hash;
  
  // Render the initial state
  renderApp();
  
  console.log('GREEN Firebase-free version loaded successfully!');
});