import { User, Income, Expense } from '@shared/schema';
import { storage } from '../storage';
import { Parser } from 'json2csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { sendEmail } from '../email-service';
import fs from 'fs';
import path from 'path';
import { formatCurrency, formatDate } from '../utils/formatter';

// Types for export options
export type ExportFormat = 'csv' | 'pdf';
export type ExportDataType = 'income' | 'expenses' | 'transactions' | 'summary';
export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type ExportOptions = {
  userId: string | number;
  format: ExportFormat;
  dataType: ExportDataType;
  dateRange?: DateRange;
  categories?: string[];
  includeNotes?: boolean;
  email?: string; // If provided, the export will be emailed
  title?: string; // Custom title for the export
};

/**
 * Main export function that handles different export types and formats
 */
export async function exportFinancialData(options: ExportOptions): Promise<{ 
  success: boolean; 
  data?: string | Buffer; 
  filename?: string;
  error?: string;
}> {
  try {
    const { userId, format, dataType, dateRange, email } = options;
    
    // Generate the appropriate filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
    const filename = `stackr_${dataType}_${timestamp}.${format}`;
    
    let data: any;
    
    // Fetch the appropriate data based on the dataType
    switch (dataType) {
      case 'income':
        data = await getIncomeData(userId, dateRange);
        break;
      case 'expenses':
        data = await getExpenseData(userId, dateRange);
        break;
      case 'transactions':
        // Combine income and expenses as transactions
        const incomes = await getIncomeData(userId, dateRange);
        const expenses = await getExpenseData(userId, dateRange);
        data = [...incomes, ...expenses].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'summary':
        data = await generateFinancialSummary(userId, dateRange);
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    // If no data found, return an error
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { 
        success: false, 
        error: `No ${dataType} data found for the selected period` 
      };
    }
    
    // Generate the export in the requested format
    let exportData: string | Buffer;
    
    if (format === 'csv') {
      exportData = generateCSV(data, dataType);
    } else if (format === 'pdf') {
      exportData = await generatePDF(data, dataType, options.title);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
    
    // If email is provided, send the export via email
    if (email) {
      const emailSent = await emailExport(email, exportData, filename, format, dataType);
      
      if (!emailSent) {
        return { 
          success: false, 
          error: 'Failed to send export via email' 
        };
      }
      
      return { success: true };
    }
    
    // Return the generated export data
    return {
      success: true,
      data: exportData,
      filename
    };
  } catch (error) {
    console.error('Error in exportFinancialData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export'
    };
  }
}

/**
 * Get income data for the specified user and date range
 */
async function getIncomeData(userId: string | number, dateRange?: DateRange): Promise<any[]> {
  try {
    const incomes = await storage.getIncomesByUserId(userId.toString());
    
    // Filter by date range if provided
    if (dateRange) {
      return incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
      });
    }
    
    return incomes;
  } catch (error) {
    console.error('Error fetching income data:', error);
    throw error;
  }
}

/**
 * Get expense data for the specified user and date range
 */
async function getExpenseData(userId: string | number, dateRange?: DateRange): Promise<any[]> {
  try {
    const expenses = await storage.getExpensesByUserId(userId.toString());
    
    // Filter by date range if provided
    if (dateRange) {
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
      });
    }
    
    return expenses;
  } catch (error) {
    console.error('Error fetching expense data:', error);
    throw error;
  }
}

/**
 * Generate a financial summary including income, expenses, and balance
 */
async function generateFinancialSummary(userId: string | number, dateRange?: DateRange): Promise<any> {
  try {
    // Get income and expense data
    const incomes = await getIncomeData(userId, dateRange);
    const expenses = await getExpenseData(userId, dateRange);
    
    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount.toString()), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
    const netBalance = totalIncome - totalExpenses;
    
    // Generate category-based summaries
    const incomeByCategory = groupByCategory(incomes);
    const expensesByCategory = groupByCategory(expenses);
    
    // Calculate period description
    let periodDescription = 'All time';
    if (dateRange) {
      const startFormatted = formatDate(dateRange.startDate);
      const endFormatted = formatDate(dateRange.endDate);
      periodDescription = `${startFormatted} to ${endFormatted}`;
    }
    
    // Generate summary report object
    return {
      period: periodDescription,
      totalIncome: formatCurrency(totalIncome),
      totalExpenses: formatCurrency(Math.abs(totalExpenses)),
      netBalance: formatCurrency(netBalance),
      incomeBreakdown: incomeByCategory,
      expenseBreakdown: expensesByCategory,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    throw error;
  }
}

/**
 * Group financial data by category and calculate totals
 */
function groupByCategory(items: any[]): Record<string, any> {
  const categoryMap: Record<string, { total: number, count: number }> = {};
  
  for (const item of items) {
    const category = item.category || 'Uncategorized';
    const amount = parseFloat(item.amount.toString());
    
    if (!categoryMap[category]) {
      categoryMap[category] = { total: 0, count: 0 };
    }
    
    categoryMap[category].total += Math.abs(amount);
    categoryMap[category].count += 1;
  }
  
  // Convert to array and sort by total (descending)
  return Object.entries(categoryMap).reduce((acc, [category, data]) => {
    acc[category] = {
      total: formatCurrency(data.total),
      count: data.count,
      averagePerTransaction: formatCurrency(data.total / data.count)
    };
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Generate a CSV file from the provided data
 */
function generateCSV(data: any, dataType: ExportDataType): string {
  try {
    // Define fields based on data type
    let fields: string[];
    
    switch (dataType) {
      case 'income':
        fields = ['id', 'description', 'amount', 'date', 'source', 'category', 'notes'];
        break;
      case 'expenses':
        fields = ['id', 'description', 'amount', 'date', 'category', 'paymentMethod', 'location', 'notes'];
        break;
      case 'transactions':
        fields = ['id', 'type', 'description', 'amount', 'date', 'category', 'notes'];
        break;
      case 'summary':
        // For summary, we need to flatten the structure
        return JSON.stringify(data, null, 2);
      default:
        throw new Error(`Unsupported data type for CSV: ${dataType}`);
    }
    
    // Process data for transactions to include type
    if (dataType === 'transactions') {
      data = data.map((item: any) => {
        // Determine if this is income or expense based on available fields
        const type = item.hasOwnProperty('source') ? 'income' : 'expense';
        return {
          ...item,
          type,
          // Ensure amount is displayed as positive for income, negative for expense
          amount: type === 'income' ? 
            Math.abs(parseFloat(item.amount.toString())) : 
            -Math.abs(parseFloat(item.amount.toString()))
        };
      });
    }
    
    // Create JSON to CSV parser
    const parser = new Parser({ fields });
    
    // Convert to CSV
    return parser.parse(data);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
}

/**
 * Generate a PDF file from the provided data
 */
async function generatePDF(data: any, dataType: ExportDataType, customTitle?: string): Promise<Buffer> {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add the Stackr logo and title
    doc.setFontSize(20);
    doc.text('Stackr Finance', 15, 15);
    
    // Add subtitle based on data type
    let title: string;
    switch (dataType) {
      case 'income':
        title = customTitle || 'Income Report';
        break;
      case 'expenses':
        title = customTitle || 'Expense Report';
        break;
      case 'transactions':
        title = customTitle || 'Transaction Report';
        break;
      case 'summary':
        title = customTitle || 'Financial Summary';
        break;
      default:
        title = 'Financial Report';
    }
    
    doc.setFontSize(16);
    doc.text(title, 15, 25);
    
    // Add date generated
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 32);
    
    // Add content based on data type
    if (dataType === 'summary') {
      // Add summary data
      generateSummaryPDF(doc, data);
    } else {
      // For transaction-based data types
      generateTransactionPDF(doc, data, dataType);
    }
    
    // Convert the PDF to a buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate a summary PDF with financial overview
 */
function generateSummaryPDF(doc: any, data: any): void {
  try {
    // Add period
    doc.setFontSize(12);
    doc.text(`Period: ${data.period}`, 15, 42);
    
    // Add summary totals
    doc.setFontSize(14);
    doc.text('Financial Summary', 15, 52);
    
    doc.setFontSize(12);
    doc.text(`Total Income: ${data.totalIncome}`, 15, 62);
    doc.text(`Total Expenses: ${data.totalExpenses}`, 15, 69);
    
    // Add net balance with color based on positive/negative
    const isPositive = !data.netBalance.includes('-');
    doc.setTextColor(isPositive ? 0 : 255, isPositive ? 128 : 0, 0);
    doc.text(`Net Balance: ${data.netBalance}`, 15, 76);
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Add income breakdown
    doc.setFontSize(14);
    doc.text('Income Breakdown', 15, 90);
    
    // Format income breakdown into a table
    const incomeHeaders = [['Category', 'Transactions', 'Total', 'Average']];
    const incomeRows = Object.entries(data.incomeBreakdown).map(([category, info]: [string, any]) => [
      category,
      info.count.toString(),
      info.total,
      info.averagePerTransaction
    ]);
    
    // @ts-ignore - jspdf-autotable typings
    doc.autoTable({
      head: incomeHeaders,
      body: incomeRows,
      startY: 95,
    });
    
    // Add expense breakdown
    // @ts-ignore - jspdf-autotable typings
    const incomeTableHeight = doc.autoTable.previous.finalY || 95;
    
    doc.setFontSize(14);
    doc.text('Expense Breakdown', 15, incomeTableHeight + 15);
    
    // Format expense breakdown into a table
    const expenseHeaders = [['Category', 'Transactions', 'Total', 'Average']];
    const expenseRows = Object.entries(data.expenseBreakdown).map(([category, info]: [string, any]) => [
      category,
      info.count.toString(),
      info.total,
      info.averagePerTransaction
    ]);
    
    // @ts-ignore - jspdf-autotable typings
    doc.autoTable({
      head: expenseHeaders,
      body: expenseRows,
      startY: incomeTableHeight + 20,
    });
  } catch (error) {
    console.error('Error generating summary PDF:', error);
    throw error;
  }
}

/**
 * Generate a transaction PDF with data in tabular format
 */
function generateTransactionPDF(doc: any, data: any, dataType: ExportDataType): void {
  try {
    // Define table headers based on data type
    let headers: string[][];
    let rows: any[][];
    
    switch (dataType) {
      case 'income':
        headers = [['ID', 'Description', 'Amount', 'Date', 'Source', 'Category', 'Notes']];
        rows = data.map((item: any) => [
          item.id,
          item.description,
          formatCurrency(item.amount),
          formatDate(item.date),
          item.source || 'N/A',
          item.category || 'Uncategorized',
          item.notes || ''
        ]);
        break;
      case 'expenses':
        headers = [['ID', 'Description', 'Amount', 'Date', 'Category', 'Payment Method', 'Location', 'Notes']];
        rows = data.map((item: any) => [
          item.id,
          item.description,
          formatCurrency(Math.abs(item.amount)),
          formatDate(item.date),
          item.category || 'Uncategorized',
          item.paymentMethod || 'N/A',
          item.location || 'N/A',
          item.notes || ''
        ]);
        break;
      case 'transactions':
        headers = [['ID', 'Type', 'Description', 'Amount', 'Date', 'Category', 'Notes']];
        rows = data.map((item: any) => {
          const isIncome = item.hasOwnProperty('source');
          return [
            item.id,
            isIncome ? 'Income' : 'Expense',
            item.description,
            formatCurrency(isIncome ? item.amount : -Math.abs(item.amount)),
            formatDate(item.date),
            item.category || 'Uncategorized',
            item.notes || ''
          ];
        });
        break;
      default:
        throw new Error(`Unsupported data type for transaction PDF: ${dataType}`);
    }
    
    // Generate table
    // @ts-ignore - jspdf-autotable typings
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 42,
      styles: { overflow: 'linebreak' },
      columnStyles: { notes: { cellWidth: 30 } },
    });
    
    // Add summary at the bottom
    // @ts-ignore - jspdf-autotable typings
    const tableEndY = doc.autoTable.previous.finalY;
    
    doc.setFontSize(12);
    doc.text(`Total Records: ${data.length}`, 15, tableEndY + 15);
    
    // Add total amount if applicable
    if (dataType === 'income' || dataType === 'expenses') {
      const total = data.reduce((sum: number, item: any) => 
        sum + parseFloat(item.amount.toString()), 0);
      
      doc.text(`Total Amount: ${formatCurrency(Math.abs(total))}`, 15, tableEndY + 22);
    } else if (dataType === 'transactions') {
      // Calculate separate income and expense totals
      const incomeTotal = data
        .filter((item: any) => item.hasOwnProperty('source'))
        .reduce((sum: number, item: any) => sum + parseFloat(item.amount.toString()), 0);
      
      const expenseTotal = data
        .filter((item: any) => !item.hasOwnProperty('source'))
        .reduce((sum: number, item: any) => sum + parseFloat(item.amount.toString()), 0);
      
      doc.text(`Total Income: ${formatCurrency(incomeTotal)}`, 15, tableEndY + 22);
      doc.text(`Total Expenses: ${formatCurrency(Math.abs(expenseTotal))}`, 15, tableEndY + 29);
      doc.text(`Net Balance: ${formatCurrency(incomeTotal - Math.abs(expenseTotal))}`, 15, tableEndY + 36);
    }
  } catch (error) {
    console.error('Error generating transaction PDF:', error);
    throw error;
  }
}

/**
 * Email an export file to the specified email address
 */
async function emailExport(
  email: string, 
  data: string | Buffer, 
  filename: string, 
  format: ExportFormat,
  dataType: ExportDataType
): Promise<boolean> {
  try {
    // Determine attachment content type
    const contentType = format === 'csv' ? 'text/csv' : 'application/pdf';
    
    // Create a readable name for the data type
    let dataTypeName: string;
    switch (dataType) {
      case 'income':
        dataTypeName = 'Income';
        break;
      case 'expenses':
        dataTypeName = 'Expense';
        break;
      case 'transactions':
        dataTypeName = 'Transaction';
        break;
      case 'summary':
        dataTypeName = 'Financial Summary';
        break;
      default:
        dataTypeName = 'Financial';
    }
    
    // Send email with attachment
    const emailResult = await sendEmail({
      to: email,
      from: 'exports@stackr.finance',
      subject: `Your Stackr ${dataTypeName} Export`,
      html: `
        <h1>Stackr Financial Export</h1>
        <p>Thank you for using Stackr Finance. Your requested ${dataTypeName.toLowerCase()} export is attached.</p>
        <p>This export was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
        <p>If you didn't request this export, please contact support immediately.</p>
        <br>
        <p>The Stackr Finance Team</p>
      `,
      attachments: [
        {
          filename,
          content: data,
          type: contentType,
          disposition: 'attachment'
        }
      ]
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error emailing export:', error);
    return false;
  }
}

/**
 * Schedule a regular export to be emailed on a specific schedule
 */
export async function scheduleExport(
  userId: string | number,
  email: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  dataType: ExportDataType,
  format: ExportFormat
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Create a scheduled export in the database
    const scheduledExport = await storage.createScheduledExport({
      userId: userId.toString(),
      email,
      frequency,
      dataType,
      format,
      isActive: true,
      createdAt: new Date(),
      lastSentAt: null,
      nextSendAt: calculateNextSendDate(frequency),
    });
    
    if (!scheduledExport) {
      return {
        success: false,
        error: 'Failed to schedule export'
      };
    }
    
    return {
      success: true,
      message: `Successfully scheduled ${frequency} ${dataType} export to ${email}`
    };
  } catch (error) {
    console.error('Error scheduling export:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error scheduling export'
    };
  }
}

/**
 * Calculate the next send date based on frequency
 */
function calculateNextSendDate(frequency: 'weekly' | 'biweekly' | 'monthly'): Date {
  const now = new Date();
  const nextSend = new Date(now);
  
  switch (frequency) {
    case 'weekly':
      nextSend.setDate(nextSend.getDate() + 7);
      break;
    case 'biweekly':
      nextSend.setDate(nextSend.getDate() + 14);
      break;
    case 'monthly':
      nextSend.setMonth(nextSend.getMonth() + 1);
      break;
  }
  
  return nextSend;
}

/**
 * Process scheduled exports that are due to be sent
 * This function would be called by a cron job or scheduled task
 */
export async function processScheduledExports(): Promise<{ 
  success: boolean; 
  processedCount: number; 
  error?: string 
}> {
  try {
    // Get all scheduled exports that are due
    const dueExports = await storage.getDueScheduledExports();
    
    let successCount = 0;
    
    // Process each due export
    for (const scheduledExport of dueExports) {
      try {
        const { userId, email, dataType, format, frequency } = scheduledExport;
        
        // Calculate date range based on frequency
        const dateRange = getDateRangeForFrequency(frequency);
        
        // Generate and email the export
        const result = await exportFinancialData({
          userId,
          format: format as ExportFormat,
          dataType: dataType as ExportDataType,
          email,
          dateRange,
          title: `Your Scheduled ${frequency} ${dataType} Report`
        });
        
        if (result.success) {
          // Update the scheduled export with new dates
          await storage.updateScheduledExport(scheduledExport.id, {
            lastSentAt: new Date(),
            nextSendAt: calculateNextSendDate(frequency as 'weekly' | 'biweekly' | 'monthly')
          });
          
          successCount++;
        } else {
          console.error(`Failed to process scheduled export ID ${scheduledExport.id}:`, result.error);
        }
      } catch (exportError) {
        console.error(`Error processing scheduled export ID ${scheduledExport.id}:`, exportError);
      }
    }
    
    return {
      success: true,
      processedCount: successCount
    };
  } catch (error) {
    console.error('Error processing scheduled exports:', error);
    return {
      success: false,
      processedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error processing scheduled exports'
    };
  }
}

/**
 * Get a date range based on the frequency
 */
function getDateRangeForFrequency(frequency: string): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (frequency) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'biweekly':
      startDate.setDate(startDate.getDate() - 14);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      // Default to last 30 days
      startDate.setDate(startDate.getDate() - 30);
  }
  
  return { startDate, endDate };
}