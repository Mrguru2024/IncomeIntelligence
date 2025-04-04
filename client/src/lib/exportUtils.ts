import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// Type for export configuration options
export interface ExportOptions {
  fileName: string;
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
}

// Interface for any data that can be exported
export interface ExportableData {
  headers: string[];
  data: (string | number)[][];
}

/**
 * Convert data to CSV format and trigger a download
 */
export const exportToCSV = (data: ExportableData, options: ExportOptions): void => {
  // Create the CSV content
  const csv = Papa.unparse({
    fields: data.headers,
    data: data.data
  });

  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link to download the CSV
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${options.fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert data to PDF format and trigger a download
 */
export const exportToPDF = (data: ExportableData, options: ExportOptions): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title if provided
  if (options.title) {
    doc.setFontSize(18);
    doc.text(options.title, 14, 22);
  }
  
  // Add subtitle if provided
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.text(options.subtitle, 14, 30);
  }
  
  // Add date if requested
  if (options.includeDate) {
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, options.subtitle ? 38 : 30);
  }
  
  // Add the data table
  autoTable(doc, {
    head: [data.headers],
    body: data.data,
    startY: options.includeDate ? 42 : (options.subtitle ? 35 : 25),
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });
  
  // Save the PDF
  doc.save(`${options.fileName}.pdf`);
};

/**
 * Format income data for export
 */
export const formatIncomeData = (incomes: any[]): ExportableData => {
  const headers = ['Description', 'Amount', 'Category', 'Date', 'Notes'];
  
  const data = incomes.map(income => [
    income.description,
    `$${parseFloat(income.amount).toFixed(2)}`,
    income.category,
    new Date(income.date).toLocaleDateString(),
    income.notes || ''
  ]);
  
  return { headers, data };
};

/**
 * Format expense data for export
 */
export const formatExpenseData = (expenses: any[]): ExportableData => {
  const headers = ['Description', 'Amount', 'Category', 'Date', 'Notes'];
  
  const data = expenses.map(expense => [
    expense.description,
    `$${parseFloat(expense.amount).toFixed(2)}`,
    expense.category,
    new Date(expense.date).toLocaleDateString(),
    expense.notes || ''
  ]);
  
  return { headers, data };
};

/**
 * Format goals data for export
 */
export const formatGoalsData = (goals: any[]): ExportableData => {
  const headers = ['Name', 'Target Amount', 'Current Amount', 'Progress', 'Category', 'Target Date'];
  
  const data = goals.map(goal => {
    const progress = goal.currentAmount && goal.targetAmount 
      ? `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`
      : '0%';
      
    return [
      goal.name,
      `$${parseFloat(goal.targetAmount).toFixed(2)}`,
      `$${parseFloat(goal.currentAmount || 0).toFixed(2)}`,
      progress,
      goal.category,
      goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'
    ];
  });
  
  return { headers, data };
};

/**
 * Format budget data for export
 */
export const formatBudgetData = (budgets: any[]): ExportableData => {
  const headers = ['Category', 'Budgeted Amount', 'Actual Spent', 'Remaining', 'Period'];
  
  const data = budgets.map(budget => {
    const remaining = parseFloat(budget.budgetedAmount) - parseFloat(budget.actualSpent || 0);
    
    return [
      budget.category,
      `$${parseFloat(budget.budgetedAmount).toFixed(2)}`,
      `$${parseFloat(budget.actualSpent || 0).toFixed(2)}`,
      `$${remaining.toFixed(2)}`,
      budget.period || 'Monthly'
    ];
  });
  
  return { headers, data };
};

/**
 * Format transaction data for export
 */
export const formatTransactionData = (transactions: any[]): ExportableData => {
  const headers = ['Description', 'Amount', 'Type', 'Category', 'Date', 'Account'];
  
  const data = transactions.map(tx => [
    tx.description,
    `$${Math.abs(parseFloat(tx.amount)).toFixed(2)}`,
    parseFloat(tx.amount) > 0 ? 'Income' : 'Expense',
    tx.category || 'Uncategorized',
    new Date(tx.date).toLocaleDateString(),
    tx.accountName || 'Main Account'
  ]);
  
  return { headers, data };
};