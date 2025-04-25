/**
 * Data Export module for Stackr Finance
 * This module enables exporting data in CSV and PDF formats
 */

import { appState } from './src/main.js';

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Format date for export
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Export income data to CSV
function exportIncomeToCSV() {
  if (!appState.income || appState.income.length === 0) {
    alert('No income data to export');
    return;
  }
  
  // CSV header
  let csvContent = 'Date,Source,Amount,Category,Notes\n';
  
  // Add data rows
  appState.income.forEach(item => {
    const date = formatDate(item.date);
    const source = item.source.replace(/,/g, ''); // Remove commas to avoid CSV issues
    const amount = item.amount;
    const category = item.category || 'Uncategorized';
    const notes = item.notes ? item.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : ''; // Clean notes
    
    csvContent += `${date},${source},${amount},${category},${notes}\n`;
  });
  
  // Create download link
  downloadCSV(csvContent, 'stackr-income-data.csv');
}

// Export expenses data to CSV
function exportExpensesToCSV() {
  if (!appState.expenses || appState.expenses.length === 0) {
    alert('No expense data to export');
    return;
  }
  
  // CSV header
  let csvContent = 'Date,Description,Amount,Category,Payment Method,Notes\n';
  
  // Add data rows
  appState.expenses.forEach(item => {
    const date = formatDate(item.date);
    const description = item.description.replace(/,/g, ''); // Remove commas to avoid CSV issues
    const amount = item.amount;
    const category = item.category || 'Uncategorized';
    const paymentMethod = item.paymentMethod || '';
    const notes = item.notes ? item.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : ''; // Clean notes
    
    csvContent += `${date},${description},${amount},${category},${paymentMethod},${notes}\n`;
  });
  
  // Create download link
  downloadCSV(csvContent, 'stackr-expenses-data.csv');
}

// Export savings goals to CSV
function exportGoalsToCSV() {
  if (!appState.goals || appState.goals.length === 0) {
    alert('No savings goals data to export');
    return;
  }
  
  // CSV header
  let csvContent = 'Name,Category,Current Amount,Target Amount,Start Date,Target Date,Progress %,Priority,Notes\n';
  
  // Add data rows
  appState.goals.forEach(goal => {
    const name = goal.name.replace(/,/g, ''); // Remove commas to avoid CSV issues
    const category = goal.category || 'Other';
    const current = goal.current;
    const target = goal.target;
    const startDate = formatDate(goal.startDate);
    const targetDate = formatDate(goal.targetDate);
    const progress = Math.round((goal.current / goal.target) * 100);
    const priority = goal.priority || 'Low';
    const notes = goal.notes ? goal.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : ''; // Clean notes
    
    csvContent += `${name},${category},${current},${target},${startDate},${targetDate},${progress},${priority},${notes}\n`;
  });
  
  // Create download link
  downloadCSV(csvContent, 'stackr-goals-data.csv');
}

// Export bank transactions to CSV
function exportTransactionsToCSV() {
  if (!appState.bankConnections || appState.bankConnections.length === 0) {
    alert('No bank transactions to export');
    return;
  }
  
  // CSV header
  let csvContent = 'Date,Description,Amount,Category,Account,Institution\n';
  
  // Collect all transactions
  const transactions = [];
  
  appState.bankConnections.forEach(connection => {
    if (connection.recentTransactions && connection.recentTransactions.length > 0) {
      connection.recentTransactions.forEach(transaction => {
        transactions.push({
          ...transaction,
          accountName: connection.name,
          institution: connection.institution
        });
      });
    }
  });
  
  if (transactions.length === 0) {
    alert('No transactions found in your bank connections');
    return;
  }
  
  // Add data rows
  transactions.forEach(transaction => {
    const date = formatDate(transaction.date);
    const description = transaction.description.replace(/,/g, ''); // Remove commas to avoid CSV issues
    const amount = transaction.amount;
    const category = transaction.category || 'Uncategorized';
    const accountName = transaction.accountName;
    const institution = transaction.institution;
    
    csvContent += `${date},${description},${amount},${category},${accountName},${institution}\n`;
  });
  
  // Create download link
  downloadCSV(csvContent, 'stackr-transactions-data.csv');
}

// Export financial summary report
function exportSummaryToCSV() {
  // CSV header
  let csvContent = 'Category,Value\n';
  
  // Calculate totals
  const incomeTotal = appState.income ? appState.income.reduce((sum, item) => sum + item.amount, 0) : 0;
  const expensesTotal = appState.expenses ? appState.expenses.reduce((sum, item) => sum + item.amount, 0) : 0;
  const savingsTotal = appState.goals ? appState.goals.reduce((sum, goal) => sum + goal.current, 0) : 0;
  
  // Calculate 40/30/30 split
  let needsTotal = 0;
  let investmentsTotal = 0;
  let savingsAllocationTotal = 0;
  
  const splitRatio = appState.user?.splitRatio || { needs: 40, investments: 30, savings: 30 };
  
  if (appState.expenses) {
    needsTotal = appState.expenses
      .filter(expense => expense.category === 'Housing' || 
                         expense.category === 'Utilities' || 
                         expense.category === 'Groceries' || 
                         expense.category === 'Transportation' || 
                         expense.category === 'Insurance' ||
                         expense.category === 'Health')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }
  
  // Add rows
  csvContent += `Total Income,${incomeTotal}\n`;
  csvContent += `Total Expenses,${expensesTotal}\n`;
  csvContent += `Total Savings,${savingsTotal}\n`;
  csvContent += `Net Cashflow,${incomeTotal - expensesTotal}\n\n`;
  
  // Split allocation
  csvContent += `Income Split Ratio - Needs,${splitRatio.needs}%\n`;
  csvContent += `Income Split Ratio - Investments,${splitRatio.investments}%\n`;
  csvContent += `Income Split Ratio - Savings,${splitRatio.savings}%\n\n`;
  
  // Actual allocations
  csvContent += `Actual Needs Spending,${needsTotal}\n`;
  csvContent += `Recommended Needs Budget,${(incomeTotal * splitRatio.needs) / 100}\n\n`;
  
  // Bank account summary
  if (appState.bankConnections && appState.bankConnections.length > 0) {
    csvContent += 'Bank Accounts\n';
    csvContent += 'Account,Institution,Balance\n';
    
    appState.bankConnections.forEach(connection => {
      csvContent += `${connection.name},${connection.institution},${connection.balance}\n`;
    });
  }
  
  // Create download link
  downloadCSV(csvContent, 'stackr-financial-summary.csv');
}

// Helper function to trigger CSV download
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate PDF with income data
function exportIncomeToPDF() {
  if (!window.jsPDF) {
    alert('PDF export library not loaded. Please try exporting as CSV instead.');
    return;
  }
  
  if (!appState.income || appState.income.length === 0) {
    alert('No income data to export');
    return;
  }
  
  try {
    const doc = new window.jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Stackr Finance - Income Report', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // Total
    const total = appState.income.reduce((sum, item) => sum + item.amount, 0);
    doc.setFontSize(12);
    doc.text(`Total Income: ${formatCurrency(total)}`, 14, 36);
    
    // Create table
    const tableColumn = ['Date', 'Source', 'Amount', 'Category', 'Notes'];
    const tableRows = [];
    
    // Add data rows
    appState.income.forEach(item => {
      const date = formatDate(item.date);
      const source = item.source.substring(0, 20); // Limit length
      const amount = formatCurrency(item.amount);
      const category = item.category || 'Uncategorized';
      const notes = item.notes ? item.notes.substring(0, 25) : ''; // Limit length
      
      tableRows.push([date, source, amount, category, notes]);
    });
    
    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [52, 168, 83] }
    });
    
    // Save PDF
    doc.save('stackr-income-report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try exporting as CSV instead.');
  }
}

// Generate PDF with expenses data
function exportExpensesToPDF() {
  if (!window.jsPDF) {
    alert('PDF export library not loaded. Please try exporting as CSV instead.');
    return;
  }
  
  if (!appState.expenses || appState.expenses.length === 0) {
    alert('No expense data to export');
    return;
  }
  
  try {
    const doc = new window.jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Stackr Finance - Expenses Report', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // Total
    const total = appState.expenses.reduce((sum, item) => sum + item.amount, 0);
    doc.setFontSize(12);
    doc.text(`Total Expenses: ${formatCurrency(total)}`, 14, 36);
    
    // Create table
    const tableColumn = ['Date', 'Description', 'Amount', 'Category'];
    const tableRows = [];
    
    // Add data rows
    appState.expenses.forEach(item => {
      const date = formatDate(item.date);
      const description = item.description.substring(0, 20); // Limit length
      const amount = formatCurrency(item.amount);
      const category = item.category || 'Uncategorized';
      
      tableRows.push([date, description, amount, category]);
    });
    
    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [52, 168, 83] }
    });
    
    // Save PDF
    doc.save('stackr-expenses-report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try exporting as CSV instead.');
  }
}

// Generate PDF with financial summary
function exportSummaryToPDF() {
  if (!window.jsPDF) {
    alert('PDF export library not loaded. Please try exporting as CSV instead.');
    return;
  }
  
  try {
    const doc = new window.jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Stackr Finance - Financial Summary', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // Calculate totals
    const incomeTotal = appState.income ? appState.income.reduce((sum, item) => sum + item.amount, 0) : 0;
    const expensesTotal = appState.expenses ? appState.expenses.reduce((sum, item) => sum + item.amount, 0) : 0;
    const savingsTotal = appState.goals ? appState.goals.reduce((sum, goal) => sum + goal.current, 0) : 0;
    const netCashflow = incomeTotal - expensesTotal;
    
    // Split ratio
    const splitRatio = appState.user?.splitRatio || { needs: 40, investments: 30, savings: 30 };
    
    // Summary table
    const summaryColumn = ['Category', 'Amount'];
    const summaryRows = [
      ['Total Income', formatCurrency(incomeTotal)],
      ['Total Expenses', formatCurrency(expensesTotal)],
      ['Net Cashflow', formatCurrency(netCashflow)],
      ['Total Savings', formatCurrency(savingsTotal)]
    ];
    
    // Generate summary table
    doc.autoTable({
      head: [summaryColumn],
      body: summaryRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [52, 168, 83] }
    });
    
    // Income split table
    const splitColumn = ['Allocation', 'Percentage', 'Amount'];
    const splitRows = [
      ['Needs', `${splitRatio.needs}%`, formatCurrency((incomeTotal * splitRatio.needs) / 100)],
      ['Investments', `${splitRatio.investments}%`, formatCurrency((incomeTotal * splitRatio.investments) / 100)],
      ['Savings', `${splitRatio.savings}%`, formatCurrency((incomeTotal * splitRatio.savings) / 100)]
    ];
    
    // Add section header
    doc.setFontSize(14);
    doc.text('Income Allocation', 14, doc.lastAutoTable.finalY + 15);
    
    // Generate split table
    doc.autoTable({
      head: [splitColumn],
      body: splitRows,
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'grid',
      headStyles: { fillColor: [52, 168, 83] }
    });
    
    // Bank accounts table if available
    if (appState.bankConnections && appState.bankConnections.length > 0) {
      // Add section header
      doc.setFontSize(14);
      doc.text('Bank Accounts', 14, doc.lastAutoTable.finalY + 15);
      
      const accountsColumn = ['Account', 'Institution', 'Balance'];
      const accountsRows = appState.bankConnections.map(connection => [
        connection.name,
        connection.institution,
        formatCurrency(connection.balance)
      ]);
      
      // Generate accounts table
      doc.autoTable({
        head: [accountsColumn],
        body: accountsRows,
        startY: doc.lastAutoTable.finalY + 20,
        theme: 'grid',
        headStyles: { fillColor: [52, 168, 83] }
      });
    }
    
    // Save PDF
    doc.save('stackr-financial-summary.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try exporting as CSV instead.');
  }
}

// Load PDF library if not loaded
function loadPDFLibrary() {
  return new Promise((resolve, reject) => {
    if (window.jsPDF) {
      resolve();
      return;
    }
    
    // Load jsPDF and dependencies
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    
    const autoTableScript = document.createElement('script');
    autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
    autoTableScript.async = true;
    
    jsPDFScript.onload = () => {
      // Load the autotable plugin after jsPDF is loaded
      document.head.appendChild(autoTableScript);
    };
    
    autoTableScript.onload = () => {
      resolve();
    };
    
    autoTableScript.onerror = jsPDFScript.onerror = () => {
      reject(new Error('Failed to load PDF export libraries'));
    };
    
    document.head.appendChild(jsPDFScript);
  });
}

// Render the Data Export page
export function renderDataExportPage() {
  // Main container
  const exportContainer = document.createElement('div');
  exportContainer.className = 'data-export-container p-4 max-w-6xl mx-auto';
  
  // Header section
  const header = document.createElement('header');
  header.className = 'mb-6';
  header.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Data Export</h1>
        <p class="text-gray-600">Export your financial data in various formats</p>
      </div>
    </div>
  `;
  exportContainer.appendChild(header);
  
  // Create export options
  const exportOptions = document.createElement('div');
  exportOptions.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
  
  // CSV Export Card
  const csvCard = document.createElement('div');
  csvCard.className = 'export-card bg-white p-6 rounded-lg shadow-sm';
  csvCard.innerHTML = `
    <div class="card-header mb-4 flex items-center">
      <div class="text-3xl mr-3">📊</div>
      <div>
        <h2 class="text-xl font-bold">CSV Export</h2>
        <p class="text-gray-600 text-sm">Download your data as CSV for use in spreadsheets</p>
      </div>
    </div>
    
    <div class="export-options space-y-3">
      <button id="csv-income" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Income Data</span>
        <span class="text-primary">Download</span>
      </button>
      
      <button id="csv-expenses" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Expenses Data</span>
        <span class="text-primary">Download</span>
      </button>
      
      <button id="csv-goals" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Savings Goals</span>
        <span class="text-primary">Download</span>
      </button>
      
      <button id="csv-transactions" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Bank Transactions</span>
        <span class="text-primary">Download</span>
      </button>
      
      <button id="csv-summary" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Financial Summary</span>
        <span class="text-primary">Download</span>
      </button>
    </div>
  `;
  
  // PDF Export Card
  const pdfCard = document.createElement('div');
  pdfCard.className = 'export-card bg-white p-6 rounded-lg shadow-sm';
  pdfCard.innerHTML = `
    <div class="card-header mb-4 flex items-center">
      <div class="text-3xl mr-3">📄</div>
      <div>
        <h2 class="text-xl font-bold">PDF Reports</h2>
        <p class="text-gray-600 text-sm">Generate professional financial reports</p>
      </div>
    </div>
    
    <div class="export-options space-y-3">
      <button id="pdf-income" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Income Report</span>
        <span class="text-primary">Generate</span>
      </button>
      
      <button id="pdf-expenses" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Expenses Report</span>
        <span class="text-primary">Generate</span>
      </button>
      
      <button id="pdf-summary" class="export-button w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
        <span>Financial Summary</span>
        <span class="text-primary">Generate</span>
      </button>
    </div>
    
    <div class="mt-4 text-xs text-gray-500">
      <p>PDF generation requires an internet connection to load the PDF library.</p>
    </div>
  `;
  
  exportOptions.appendChild(csvCard);
  exportOptions.appendChild(pdfCard);
  exportContainer.appendChild(exportOptions);
  
  // Data privacy section
  const privacySection = document.createElement('div');
  privacySection.className = 'privacy-section mt-8 bg-white p-6 rounded-lg shadow-sm';
  privacySection.innerHTML = `
    <h2 class="text-lg font-bold mb-3">Data Privacy & Security</h2>
    <p class="text-gray-600 mb-4">
      All data exports are generated locally in your browser. Your financial data is never sent to our servers 
      during the export process, ensuring your financial information remains private and secure.
    </p>
    
    <div class="bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
      <div class="flex items-start">
        <div class="text-xl mr-2">ℹ️</div>
        <div>
          <p class="mb-2">Exported files will download directly to your device. No data is transmitted over the internet.</p>
          <p>If you're exporting sensitive financial information, make sure to store the downloaded files in a secure location.</p>
        </div>
      </div>
    </div>
  `;
  exportContainer.appendChild(privacySection);
  
  // Add event listeners
  setTimeout(() => {
    // CSV Export Buttons
    document.getElementById('csv-income').addEventListener('click', exportIncomeToCSV);
    document.getElementById('csv-expenses').addEventListener('click', exportExpensesToCSV);
    document.getElementById('csv-goals').addEventListener('click', exportGoalsToCSV);
    document.getElementById('csv-transactions').addEventListener('click', exportTransactionsToCSV);
    document.getElementById('csv-summary').addEventListener('click', exportSummaryToCSV);
    
    // PDF Export Buttons
    document.getElementById('pdf-income').addEventListener('click', async () => {
      try {
        await loadPDFLibrary();
        exportIncomeToPDF();
      } catch (error) {
        console.error('Failed to load PDF library:', error);
        alert('Could not load PDF generation library. Please try exporting as CSV instead.');
      }
    });
    
    document.getElementById('pdf-expenses').addEventListener('click', async () => {
      try {
        await loadPDFLibrary();
        exportExpensesToPDF();
      } catch (error) {
        console.error('Failed to load PDF library:', error);
        alert('Could not load PDF generation library. Please try exporting as CSV instead.');
      }
    });
    
    document.getElementById('pdf-summary').addEventListener('click', async () => {
      try {
        await loadPDFLibrary();
        exportSummaryToPDF();
      } catch (error) {
        console.error('Failed to load PDF library:', error);
        alert('Could not load PDF generation library. Please try exporting as CSV instead.');
      }
    });
  }, 100);
  
  return exportContainer;
}