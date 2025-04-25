import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";
import { Invoice } from "@shared/schema";

/**
 * Generate a PDF invoice and save it to the filesystem
 * @param invoice The invoice data
 * @returns The path to the generated PDF file
 */
export async function generateInvoicePdf(invoice: Invoice): Promise<string> {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add company info
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // Dark blue
  doc.text("Stackr Finance", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray
  doc.text("Professional Financial Services", 14, 30);
  doc.text("123 Finance Street", 14, 35);
  doc.text("New York, NY 10001", 14, 40);
  doc.text("contact@stackr.finance", 14, 45);
  
  // Add invoice info
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text("INVOICE", 140, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 140, 30);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 140, 35);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 40);
  doc.text(`Status: ${invoice.paid ? "Paid" : "Unpaid"}`, 140, 45);
  
  // Add client info
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text("Bill To:", 14, 60);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.clientName, 14, 68);
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 14, 73);
  }
  
  // Add line items table
  autoTable(doc, {
    startY: 85,
    head: [["Description", "Quantity", "Unit Price", "Amount"]],
    body: invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]),
    foot: [
      ["", "", "Total", `$${invoice.total}`]
    ],
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255]
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [44, 62, 80],
      fontStyle: "bold"
    }
  });
  
  // Add payment info
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text("Payment Details", 14, finalY);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Payment Method: ${invoice.paymentMethod}`, 14, finalY + 8);
  
  // Add thank you note
  doc.setFontSize(10);
  doc.text("Thank you for your business!", 14, finalY + 20);
  
  // Add payment link if not paid
  if (!invoice.paid) {
    doc.setTextColor(41, 128, 185); // Blue
    doc.text("To pay this invoice online, visit:", 14, finalY + 30);
    doc.setFontSize(9);
    doc.text(`https://stackr.finance/invoices/${invoice.id}/pay`, 14, finalY + 35);
  } else if (invoice.paidAt) {
    doc.setTextColor(39, 174, 96); // Green
    doc.text(`Paid on: ${new Date(invoice.paidAt).toLocaleDateString()}`, 14, finalY + 30);
  }
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads", "invoices");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Save the PDF
  const filename = `invoice-${invoice.invoiceNumber.replace(/\s+/g, "-")}.pdf`;
  const filepath = path.join(uploadsDir, filename);
  
  // Convert PDF to buffer and save to file
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(filepath, pdfBuffer);
  
  return filepath;
}

/**
 * Send an invoice to a client via email
 * @param invoice The invoice data
 * @param sendEmail Function to send email
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  sendEmail: (params: { to: string; from: string; subject: string; html: string; text?: string; attachments?: any[] }) => Promise<boolean>
): Promise<boolean> {
  if (!invoice.clientEmail) {
    console.error("Cannot send invoice email: no client email provided");
    return false;
  }
  
  try {
    // Generate the PDF invoice
    const pdfPath = await generateInvoicePdf(invoice);
    
    // Prepare the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Invoice from Stackr Finance</h2>
        <p>Dear ${invoice.clientName},</p>
        <p>Please find attached your invoice #${invoice.invoiceNumber} for a total of $${invoice.total}.</p>
        <p>Due date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        
        ${!invoice.paid ? `
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://stackr.finance/invoices/${invoice.id}/pay" 
             style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Pay Invoice Online
          </a>
        </div>
        ` : ''}
        
        <p>If you have any questions about this invoice, please contact us at billing@stackr.finance.</p>
        <p>Thank you for your business!</p>
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          Stackr Finance<br>
          123 Finance Street<br>
          New York, NY 10001<br>
          contact@stackr.finance
        </p>
      </div>
    `;
    
    const textContent = `
Invoice from Stackr Finance

Dear ${invoice.clientName},

Please find attached your invoice #${invoice.invoiceNumber} for a total of $${invoice.total}.
Due date: ${new Date(invoice.dueDate).toLocaleDateString()}

${!invoice.paid ? `To pay online, visit: https://stackr.finance/invoices/${invoice.id}/pay` : ''}

If you have any questions about this invoice, please contact us at billing@stackr.finance.

Thank you for your business!

Stackr Finance
123 Finance Street
New York, NY 10001
contact@stackr.finance
    `;
    
    // Read the PDF file and convert to base64
    const pdfContent = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfContent.toString("base64");
    
    // Send the email
    const emailSent = await sendEmail({
      to: invoice.clientEmail,
      from: "invoices@stackr.finance",
      subject: `Invoice #${invoice.invoiceNumber} from Stackr Finance`,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          content: pdfBase64,
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    });
    
    return emailSent;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return false;
  }
}