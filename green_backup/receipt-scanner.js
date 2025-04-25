/**
 * Receipt Scanner Module for Expense Tracking
 * This module uses OCR to extract data from receipt images and populate expense form fields
 */

import { navigateTo } from './sidebar.js';
import { hasProAccess, createUpgradePrompt } from './utils/subscription-utils.js';

// OpenAI API service for image analysis (needs to check for API key)
async function analyzeReceiptWithAI(base64Image) {
  try {
    // Check if API key is available
    if (!window.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // The newest model with vision capabilities
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the following information from this receipt image: merchant/store name, total amount, date, and line items with their individual costs. Format the response as JSON with fields: 'merchant', 'total', 'date', 'items' (as an array of objects with 'name' and 'price'), and 'category' (your best guess at expense category). For the date, use YYYY-MM-DD format."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const extractedData = JSON.parse(data.choices[0].message.content);
    return extractedData;
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
}

/**
 * Create and render the receipt scanner UI
 * @param {Object} appState - Application state
 * @returns {HTMLElement} - Receipt scanner UI component
 */
export function createReceiptScanner(appState) {
  const container = document.createElement('div');
  container.className = 'receipt-scanner';
  container.style.padding = '20px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.borderRadius = '8px';
  container.style.marginBottom = '30px';
  container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

  // Check if user has Pro access for this feature
  if (!hasProAccess(appState.user)) {
    return createUpgradePrompt('Receipt Scanner');
  }

  // Add heading
  const heading = document.createElement('h3');
  heading.textContent = 'Scan Receipt';
  heading.style.marginTop = '0';
  heading.style.display = 'flex';
  heading.style.alignItems = 'center';
  heading.style.gap = '10px';

  // Pro badge
  const proBadge = document.createElement('span');
  proBadge.textContent = 'PRO';
  proBadge.style.fontSize = '12px';
  proBadge.style.padding = '3px 8px';
  proBadge.style.borderRadius = '4px';
  proBadge.style.backgroundColor = '#FFD700';
  proBadge.style.color = '#000';
  proBadge.style.fontWeight = 'bold';
  heading.appendChild(proBadge);

  container.appendChild(heading);

  // Description
  const description = document.createElement('p');
  description.textContent = 'Take a photo or upload an image of your receipt. We will extract the details automatically.';
  description.style.marginBottom = '20px';
  container.appendChild(description);

  // File input container with styling
  const fileInputContainer = document.createElement('div');
  fileInputContainer.style.border = '2px dashed #ccc';
  fileInputContainer.style.borderRadius = '8px';
  fileInputContainer.style.padding = '30px 20px';
  fileInputContainer.style.textAlign = 'center';
  fileInputContainer.style.marginBottom = '20px';
  fileInputContainer.style.backgroundColor = 'white';
  fileInputContainer.style.transition = 'all 0.3s ease';
  fileInputContainer.style.cursor = 'pointer';

  // File input styling - hover effects
  fileInputContainer.addEventListener('mouseover', () => {
    fileInputContainer.style.borderColor = 'var(--color-primary)';
    fileInputContainer.style.backgroundColor = '#f9f9f9';
  });

  fileInputContainer.addEventListener('mouseout', () => {
    fileInputContainer.style.borderColor = '#ccc';
    fileInputContainer.style.backgroundColor = 'white';
  });

  // Upload icon
  const uploadIcon = document.createElement('div');
  uploadIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`;
  uploadIcon.style.marginBottom = '15px';
  uploadIcon.style.color = 'var(--color-primary)';
  fileInputContainer.appendChild(uploadIcon);

  // Upload text
  const uploadText = document.createElement('p');
  uploadText.textContent = 'Click to select a receipt image or drag & drop it here';
  uploadText.style.margin = '0';
  uploadText.style.fontWeight = '500';
  fileInputContainer.appendChild(uploadText);

  // Supported formats
  const formatsText = document.createElement('p');
  formatsText.textContent = 'Supports: JPG, PNG, HEIC (iPhone photos)';
  formatsText.style.margin = '5px 0 0 0';
  formatsText.style.fontSize = '12px';
  formatsText.style.color = '#666';
  fileInputContainer.appendChild(formatsText);

  // Actual file input (hidden but functional)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'receipt-file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInputContainer.appendChild(fileInput);

  // Handle the file selection
  fileInputContainer.addEventListener('click', () => {
    fileInput.click();
  });

  // Preview container
  const previewContainer = document.createElement('div');
  previewContainer.id = 'receipt-preview-container';
  previewContainer.style.display = 'none';
  previewContainer.style.marginBottom = '20px';
  container.appendChild(previewContainer);

  // Loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'scanning-indicator';
  loadingIndicator.style.display = 'none';
  loadingIndicator.style.textAlign = 'center';
  loadingIndicator.style.padding = '20px';
  
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)';
  spinner.style.borderLeft = '4px solid var(--color-primary)';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '30px';
  spinner.style.height = '30px';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.margin = '0 auto 15px';
  loadingIndicator.appendChild(spinner);
  
  // Add keyframes for spinner animation
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Scanning receipt, please wait...';
  loadingText.style.margin = '0';
  loadingIndicator.appendChild(loadingText);
  
  container.appendChild(loadingIndicator);

  // Results container (initially hidden)
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'scanning-results';
  resultsContainer.style.display = 'none';
  resultsContainer.style.marginTop = '20px';
  resultsContainer.style.padding = '15px';
  resultsContainer.style.backgroundColor = 'white';
  resultsContainer.style.borderRadius = '8px';
  resultsContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  container.appendChild(resultsContainer);

  // Error container (initially hidden)
  const errorContainer = document.createElement('div');
  errorContainer.id = 'scanning-error';
  errorContainer.style.display = 'none';
  errorContainer.style.marginTop = '20px';
  errorContainer.style.padding = '15px';
  errorContainer.style.backgroundColor = '#FFF5F5';
  errorContainer.style.color = '#E53E3E';
  errorContainer.style.borderRadius = '8px';
  errorContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  container.appendChild(errorContainer);

  // Handle file selection
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(event) {
      // Hide any previous results or errors
      previewContainer.style.display = 'block';
      previewContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
      errorContainer.style.display = 'none';
      
      // Create image preview
      const previewImage = document.createElement('img');
      previewImage.src = event.target.result;
      previewImage.style.maxWidth = '100%';
      previewImage.style.maxHeight = '300px';
      previewImage.style.borderRadius = '8px';
      previewImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      previewContainer.appendChild(previewImage);
      
      // Show scanning button
      const scanButton = document.createElement('button');
      scanButton.textContent = 'Scan Receipt';
      scanButton.style.backgroundColor = 'var(--color-primary)';
      scanButton.style.color = 'white';
      scanButton.style.border = 'none';
      scanButton.style.padding = '10px 20px';
      scanButton.style.borderRadius = '4px';
      scanButton.style.cursor = 'pointer';
      scanButton.style.marginTop = '15px';
      scanButton.style.fontWeight = '500';
      
      scanButton.addEventListener('click', async () => {
        // Start scanning process
        scanButton.disabled = true;
        scanButton.textContent = 'Scanning...';
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        try {
          // Get base64 image data (remove data:image/* prefix)
          const base64Image = event.target.result.split(',')[1];
          
          // Call AI analysis function
          const receiptData = await analyzeReceiptWithAI(base64Image);
          
          // Hide loading indicator
          loadingIndicator.style.display = 'none';
          
          // Display results
          displayResults(receiptData);
        } catch (error) {
          // Hide loading indicator
          loadingIndicator.style.display = 'none';
          
          // Show error
          errorContainer.style.display = 'block';
          errorContainer.innerHTML = `
            <h4 style="margin-top: 0; color: #C53030;">Error Scanning Receipt</h4>
            <p>${error.message || 'Failed to analyze receipt. Please try again or enter details manually.'}</p>
          `;
          
          // Re-enable scan button
          scanButton.disabled = false;
          scanButton.textContent = 'Try Again';
        }
      });
      
      previewContainer.appendChild(scanButton);
    };
    
    reader.readAsDataURL(file);
  });

  // Process and display results
  function displayResults(data) {
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    // Success header
    const successHeader = document.createElement('div');
    successHeader.style.display = 'flex';
    successHeader.style.alignItems = 'center';
    successHeader.style.marginBottom = '15px';
    
    const checkIcon = document.createElement('div');
    checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    checkIcon.style.color = 'var(--color-success)';
    checkIcon.style.marginRight = '10px';
    successHeader.appendChild(checkIcon);
    
    const successTitle = document.createElement('h4');
    successTitle.textContent = 'Receipt Scanned Successfully';
    successTitle.style.margin = '0';
    successHeader.appendChild(successTitle);
    
    resultsContainer.appendChild(successHeader);
    
    // Results list
    const resultsList = document.createElement('div');
    resultsList.style.marginBottom = '20px';
    
    // Merchant
    if (data.merchant) {
      const merchantItem = document.createElement('div');
      merchantItem.style.marginBottom = '8px';
      merchantItem.innerHTML = `<strong>Merchant:</strong> ${data.merchant}`;
      resultsList.appendChild(merchantItem);
    }
    
    // Total
    if (data.total) {
      const totalItem = document.createElement('div');
      totalItem.style.marginBottom = '8px';
      totalItem.innerHTML = `<strong>Total:</strong> $${typeof data.total === 'number' ? data.total.toFixed(2) : data.total}`;
      resultsList.appendChild(totalItem);
    }
    
    // Date
    if (data.date) {
      const dateItem = document.createElement('div');
      dateItem.style.marginBottom = '8px';
      dateItem.innerHTML = `<strong>Date:</strong> ${data.date}`;
      resultsList.appendChild(dateItem);
    }
    
    // Category
    if (data.category) {
      const categoryItem = document.createElement('div');
      categoryItem.style.marginBottom = '8px';
      categoryItem.innerHTML = `<strong>Category:</strong> ${data.category}`;
      resultsList.appendChild(categoryItem);
    }
    
    // Items (if available)
    if (data.items && data.items.length > 0) {
      const itemsTitle = document.createElement('div');
      itemsTitle.innerHTML = '<strong>Items:</strong>';
      itemsTitle.style.marginBottom = '8px';
      resultsList.appendChild(itemsTitle);
      
      const itemsList = document.createElement('ul');
      itemsList.style.margin = '0 0 0 20px';
      itemsList.style.paddingLeft = '0';
      
      data.items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - $${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`;
        itemsList.appendChild(listItem);
      });
      
      resultsList.appendChild(itemsList);
    }
    
    resultsContainer.appendChild(resultsList);
    
    // Buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '10px';
    
    // Create expense button
    const createExpenseBtn = document.createElement('button');
    createExpenseBtn.textContent = 'Create Expense Entry';
    createExpenseBtn.style.backgroundColor = 'var(--color-primary)';
    createExpenseBtn.style.color = 'white';
    createExpenseBtn.style.border = 'none';
    createExpenseBtn.style.padding = '10px 20px';
    createExpenseBtn.style.borderRadius = '4px';
    createExpenseBtn.style.cursor = 'pointer';
    createExpenseBtn.style.fontWeight = '500';
    createExpenseBtn.style.flex = '1';
    
    createExpenseBtn.addEventListener('click', () => {
      // Fill expense form fields with the extracted data
      const descriptionField = document.getElementById('expense-description');
      const amountField = document.getElementById('expense-amount');
      const dateField = document.getElementById('expense-date');
      const categoryField = document.getElementById('expense-category');
      
      if (descriptionField) descriptionField.value = data.merchant || '';
      if (amountField) amountField.value = data.total || '';
      if (dateField && data.date) {
        // Ensure date is in the correct format for the date input (YYYY-MM-DD)
        const formattedDate = new Date(data.date).toISOString().split('T')[0];
        dateField.value = formattedDate;
      }
      
      // Try to match the detected category with available options
      if (categoryField && data.category) {
        // Get all options from the category select
        const options = [...categoryField.options];
        
        // Try to find a match
        const matchingOption = options.find(option => 
          option.textContent.toLowerCase().includes(data.category.toLowerCase())
        );
        
        if (matchingOption) {
          categoryField.value = matchingOption.value;
        }
      }
      
      // Scroll to the expense form
      document.getElementById('expense-description')?.scrollIntoView({ behavior: 'smooth' });
      
      // Flash the form to highlight it
      const formCard = document.querySelector('.expense-form-card');
      if (formCard) {
        formCard.style.transition = 'background-color 0.5s ease';
        formCard.style.backgroundColor = '#E6F7FF';
        setTimeout(() => {
          formCard.style.backgroundColor = '#f5f5f5';
        }, 1000);
      }
    });
    
    buttonsContainer.appendChild(createExpenseBtn);
    
    // Try another button
    const tryAnotherBtn = document.createElement('button');
    tryAnotherBtn.textContent = 'Scan Another';
    tryAnotherBtn.style.backgroundColor = 'transparent';
    tryAnotherBtn.style.color = 'var(--color-primary)';
    tryAnotherBtn.style.border = '1px solid var(--color-primary)';
    tryAnotherBtn.style.padding = '10px 20px';
    tryAnotherBtn.style.borderRadius = '4px';
    tryAnotherBtn.style.cursor = 'pointer';
    tryAnotherBtn.style.fontWeight = '500';
    
    tryAnotherBtn.addEventListener('click', () => {
      // Reset the scanner
      previewContainer.style.display = 'none';
      resultsContainer.style.display = 'none';
      errorContainer.style.display = 'none';
      fileInput.value = '';
      fileInput.click();
    });
    
    buttonsContainer.appendChild(tryAnotherBtn);
    resultsContainer.appendChild(buttonsContainer);
  }

  // Handle drag and drop
  fileInputContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileInputContainer.style.borderColor = 'var(--color-primary)';
    fileInputContainer.style.backgroundColor = '#f0f9ff';
  });

  fileInputContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileInputContainer.style.borderColor = '#ccc';
    fileInputContainer.style.backgroundColor = 'white';
  });

  fileInputContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInputContainer.style.borderColor = '#ccc';
    fileInputContainer.style.backgroundColor = 'white';
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  });

  container.appendChild(fileInputContainer);

  // Add API key configuration option
  const apiKeySection = document.createElement('div');
  apiKeySection.style.marginTop = '20px';
  apiKeySection.style.padding = '15px';
  apiKeySection.style.backgroundColor = '#f0f9ff';
  apiKeySection.style.borderRadius = '8px';
  apiKeySection.style.borderLeft = '4px solid var(--color-accent)';
  
  const apiKeyTitle = document.createElement('h4');
  apiKeyTitle.textContent = 'Configure AI Vision API';
  apiKeyTitle.style.margin = '0 0 10px 0';
  apiKeyTitle.style.fontSize = '16px';
  apiKeySection.appendChild(apiKeyTitle);
  
  const apiKeyDescription = document.createElement('p');
  apiKeyDescription.textContent = 'For optimal performance, receipts are scanned using OpenAI\'s vision capabilities. Enter your API key to enable this feature.';
  apiKeyDescription.style.margin = '0 0 15px 0';
  apiKeyDescription.style.fontSize = '14px';
  apiKeySection.appendChild(apiKeyDescription);
  
  const apiKeyInput = document.createElement('input');
  apiKeyInput.type = 'password';
  apiKeyInput.placeholder = 'Enter your OpenAI API key';
  apiKeyInput.value = window.OPENAI_API_KEY || '';
  apiKeyInput.style.width = '100%';
  apiKeyInput.style.padding = '10px';
  apiKeyInput.style.borderRadius = '4px';
  apiKeyInput.style.border = '1px solid #ddd';
  apiKeyInput.style.marginBottom = '10px';
  apiKeySection.appendChild(apiKeyInput);
  
  const saveKeyButton = document.createElement('button');
  saveKeyButton.textContent = 'Save API Key';
  saveKeyButton.style.backgroundColor = 'var(--color-accent)';
  saveKeyButton.style.color = 'white';
  saveKeyButton.style.border = 'none';
  saveKeyButton.style.padding = '8px 16px';
  saveKeyButton.style.borderRadius = '4px';
  saveKeyButton.style.cursor = 'pointer';
  saveKeyButton.style.fontWeight = '500';
  
  saveKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      window.OPENAI_API_KEY = apiKey;
      // Store in localStorage for persistence
      localStorage.setItem('openai_api_key', apiKey);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'API key saved successfully!';
      successMsg.style.color = 'var(--color-success)';
      successMsg.style.marginTop = '10px';
      successMsg.style.fontSize = '14px';
      
      // Remove previous success message if exists
      const previousMsg = apiKeySection.querySelector('.success-msg');
      if (previousMsg) {
        apiKeySection.removeChild(previousMsg);
      }
      
      successMsg.className = 'success-msg';
      apiKeySection.appendChild(successMsg);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        if (apiKeySection.contains(successMsg)) {
          apiKeySection.removeChild(successMsg);
        }
      }, 3000);
    }
  });
  
  apiKeySection.appendChild(saveKeyButton);
  container.appendChild(apiKeySection);

  // Load API key from localStorage if available
  const savedApiKey = localStorage.getItem('openai_api_key');
  if (savedApiKey) {
    window.OPENAI_API_KEY = savedApiKey;
    apiKeyInput.value = savedApiKey;
  }

  return container;
}

/**
 * Render the full expenses page with receipt scanner
 * @returns {HTMLElement} - Expenses page with receipt scanner
 */
export function renderExpensesPageWithScanner() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Expense Tracker';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Get app state
  const appState = window.appState || {
    user: { username: 'User' },
    expenseEntries: []
  };

  // Add receipt scanner at the top
  const receiptScanner = createReceiptScanner(appState);
  receiptScanner.classList.add('receipt-scanner-section');
  container.appendChild(receiptScanner);
  
  // Use the global renderExpensesPage function directly
  if (typeof window.renderExpensesPage === 'function') {
    const expensesPage = window.renderExpensesPage();
    
    // Add a class to the expense form for targeting
    const formCard = expensesPage.querySelector('div:nth-child(2)');
    if (formCard) {
      formCard.classList.add('expense-form-card');
    }
    
    container.appendChild(expensesPage);
  } else {
    // Fallback - just show a notice
    const notice = document.createElement('div');
    notice.textContent = 'Expense tracker is loading...';
    notice.style.padding = '20px';
    notice.style.backgroundColor = '#f5f5f5';
    notice.style.borderRadius = '8px';
    container.appendChild(notice);
    
    console.error('renderExpensesPage function not found.');
  }
  
  return container;
}