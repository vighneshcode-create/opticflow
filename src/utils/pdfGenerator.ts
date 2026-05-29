import { jsPDF } from 'jspdf';
import { Customer, Order, Prescription } from '../types';
import { getStoreSettings } from './storeSettings';

export function generateAndDownloadPdfBill(customer: Customer, order: Order, prescription?: Prescription) {
  const settings = getStoreSettings();
  
  // Create a standard A4 portrait PDF document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette (Sage elements adapted for PDF print standard)
  const cSage = [112, 130, 113];     // Primary Sage Green
  const cDark = [45, 49, 46];       // Primary text Charcoal
  const cGray = [138, 132, 124];     // Decorative light gray
  
  // Set font
  doc.setFont('Helvetica', 'normal');

  // Page title / Header
  doc.setFillColor(cSage[0], cSage[1], cSage[2]);
  doc.rect(0, 0, 210, 40, 'F'); // Header Banner
  
  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('Helvetica', 'bold');
  doc.text(settings.storeName.toUpperCase(), 15, 16);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('CLINICAL REFRACTION & SPECTACLES EYE SHOP', 15, 22);
  doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email}`, 15, 27);
  doc.setFontSize(8);
  doc.text(`Address: ${settings.address}`, 15, 32);

  // Invoice / Bill Title Block
  doc.setFillColor(242, 240, 235);
  doc.rect(140, 0, 70, 40, 'F'); // Contrast Block
  doc.setTextColor(cD_and_C(cDark));
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('E-INVOICE', 148, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Invoice No: #${order.id}`, 148, 22);
  doc.text(`Date: ${order.date}`, 148, 28);
  doc.text(`Since: ${customer.customerSince}`, 148, 34);

  let currentY = 50;

  // CUSTOMER INFORMATION SECTION
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(cSage[0], cSage[1], cSage[2]);
  doc.text('CUSTOMER DETAILS', 15, currentY);
  doc.line(15, currentY + 2, 195, currentY + 2); // Section divider
  doc.setTextColor(cD_and_C(cDark));
  
  currentY += 8;
  doc.setFont('Helvetica', 'bold');
  doc.text(`Name:`, 15, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(customer.name, 35, currentY);
  
  doc.setFont('Helvetica', 'bold');
  doc.text(`Mobile:`, 110, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(customer.mobile, 130, currentY);

  currentY += 6;
  doc.setFont('Helvetica', 'bold');
  doc.text(`Email:`, 15, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(customer.email || 'N/A', 35, currentY);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Clinic Practitioner:`, 110, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(prescription?.doctorName || settings.practitionerName, 150, currentY);

  // PRESCRIPTION CHART SECTION
  if (prescription) {
    currentY += 12;
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(cSage[0], cSage[1], cSage[2]);
    doc.text('OPHTHALMIC PRESCRIPTION LEDGER', 15, currentY);
    doc.line(15, currentY + 2, 195, currentY + 2);

    currentY += 8;
    // Table Header
    doc.setFillColor(242, 240, 235);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(cD_and_C(cDark));
    doc.text('EYE', 18, currentY + 5);
    doc.text('SPHERE (SPH)', 45, currentY + 5);
    doc.text('CYLINDER (CYL)', 75, currentY + 5);
    doc.text('AXIS', 110, currentY + 5);
    doc.text('ADDITION (ADD)', 135, currentY + 5);
    doc.text('VA', 175, currentY + 5);

    // Row 1 - OD (Right Eye)
    currentY += 8;
    doc.rect(15, currentY, 180, 8);
    doc.setFont('Helvetica', 'bold');
    doc.text('R (OD)', 18, currentY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.text(prescription.odSph || '0.00', 45, currentY + 5);
    doc.text(prescription.odCyl || '0.00', 75, currentY + 5);
    doc.text(prescription.odAxis || '0', 110, currentY + 5);
    doc.text(prescription.odAdd || '0.00', 135, currentY + 5);
    doc.text(prescription.odVa || '6/6', 175, currentY + 5);

    // Row 2 - OS (Left Eye)
    currentY += 8;
    doc.rect(15, currentY, 180, 8);
    doc.setFont('Helvetica', 'bold');
    doc.text('L (OS)', 18, currentY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.text(prescription.osSph || '0.00', 45, currentY + 5);
    doc.text(prescription.osCyl || '0.00', 75, currentY + 5);
    doc.text(prescription.osAxis || '0', 110, currentY + 5);
    doc.text(prescription.osAdd || '0.00', 135, currentY + 5);
    doc.text(prescription.osVa || '6/6', 175, currentY + 5);

    currentY += 12;
    doc.setFont('Helvetica', 'bold');
    doc.text(`Pupillary Distance (PD): ${prescription.pd || 'N/A'} mm`, 15, currentY);
    
    currentY += 5;
    doc.setFont('Helvetica', 'bold');
    doc.text('Ocular Recommendation Notes:', 15, currentY);
    doc.setFont('Helvetica', 'oblique');
    doc.text(prescription.notes || 'No specific comments.', 15, currentY + 5, { maxWidth: 175 });
    currentY += 10;
  } else {
    currentY += 8;
  }

  // BILLING DETAILS SECTION
  currentY += 12;
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(cSage[0], cSage[1], cSage[2]);
  doc.text('STATEMENT OF PURCHASE ITEMS', 15, currentY);
  doc.line(15, currentY + 2, 195, currentY + 2);

  currentY += 8;
  // Item Table Header
  doc.setFillColor(242, 240, 235);
  doc.rect(15, currentY, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(cD_and_C(cDark));
  doc.text('Category', 18, currentY + 5);
  doc.text('Description', 50, currentY + 5);
  doc.text('Unit Price (Rs)', 120, currentY + 5);
  doc.text('Qty', 155, currentY + 5);
  doc.text('Amount (Rs)', 175, currentY + 5);

  // Rows of items
  doc.setFont('Helvetica', 'normal');
  order.items.forEach((item) => {
    currentY += 8;
    doc.rect(15, currentY, 180, 8);
    doc.text(item.category, 18, currentY + 5);
    doc.text(item.name, 50, currentY + 5);
    doc.text(item.price.toFixed(2), 120, currentY + 5);
    doc.text(item.quantity.toString(), 155, currentY + 5);
    doc.text((item.price * item.quantity).toFixed(2), 175, currentY + 5);
  });

  // Calculation details on bottom right
  currentY += 12;
  const rightX = 140;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(cD_and_C(cDark));
  doc.text('Subtotal:', rightX, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Rs. ${order.subtotal.toFixed(2)}`, rightX + 30, currentY);

  currentY += 6;
  doc.setFont('Helvetica', 'bold');
  doc.text('Discount:', rightX, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Rs. ${order.discount.toFixed(2)}`, rightX + 30, currentY);

  currentY += 6;
  doc.setFont('Helvetica', 'bold');
  doc.text('Tax (18% GST):', rightX, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Rs. ${order.tax.toFixed(2)}`, rightX + 30, currentY);

  currentY += 8;
  doc.setFillColor(242, 240, 235);
  doc.rect(rightX - 5, currentY - 5, 60, 8, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.text('TOTAL PAID:', rightX, currentY);
  doc.text(`Rs. ${order.total.toFixed(2)}`, rightX + 30, currentY);

  // Info Block / Terms and Signature
  currentY += 15;
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text('Terms & Conditions:', 15, currentY);
  doc.setFont('Helvetica', 'normal');
  doc.text('1. Specific lenses once cut and processed are completely custom and cannot be refunded.', 15, currentY + 4);
  doc.text('2. Frames bought here come with a 1-year manufacturing defect warranty.', 15, currentY + 8);
  doc.text('3. This bill serves as a proof of receipt for optical consultation and eye care testing.', 15, currentY + 12);

  // Signature Block
  doc.setFontSize(10);
  doc.setTextColor(cD_and_C(cDark));
  doc.setFont('Helvetica', 'bold');
  doc.text('Prepared By:', 15, currentY + 25);
  doc.setFont('Helvetica', 'normal');
  doc.text(settings.practitionerName, 15, currentY + 30);
  doc.setFont('Helvetica', 'italic');
  doc.text(`(${settings.storeName} Authorized ${settings.practitionerTitle})`, 15, currentY + 34);

  // Save/Download PDF named by customer and receipt ID
  const cleanStoreName = settings.storeName.replace(/\s+/g, '_');
  const cleanName = customer.name.replace(/\s+/g, '_');
  doc.save(`${cleanStoreName}_${cleanName}_Receipt_${order.id}.pdf`);
}

// Helpers to get direct color array values for typescript compliance
function cD_and_C(col: number[]): number {
  return col[0];
}
