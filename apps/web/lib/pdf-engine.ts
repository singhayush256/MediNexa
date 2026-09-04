import { jsPDF } from 'jspdf';

export interface HospitalHeaderInfo {
  name: string;
  location: string;
  gstin: string;
  phone: string;
  email: string;
}

const DEFAULT_HOSPITAL: HospitalHeaderInfo = {
  name: 'MEDINEXA MULTISPECIALITY HOSPITAL',
  location: 'Sector 62, Institutional Area, Noida, Uttar Pradesh - 201309',
  gstin: 'GSTIN: 09AABCM1234F1Z8 | NABH & NABL Accredited',
  phone: 'Tel: +91 120 456 7890',
  email: 'Email: contact.noida@medinexa.in',
};

/**
 * Draw hospital header on any PDF page
 */
function renderHeader(doc: jsPDF, title: string, docNumber?: string) {
  // Brand Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(DEFAULT_HOSPITAL.name, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(DEFAULT_HOSPITAL.location, 14, 18);
  doc.text(`${DEFAULT_HOSPITAL.phone}  |  ${DEFAULT_HOSPITAL.email}`, 14, 23);
  doc.text(DEFAULT_HOSPITAL.gstin, 14, 28);

  // Document Badge
  doc.setFillColor(13, 148, 136); // teal-600
  doc.roundedRect(140, 8, 56, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, 168, 16, { align: 'center' });
  if (docNumber) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(docNumber, 168, 22, { align: 'center' });
  }

  doc.setTextColor(15, 23, 42);
}

/**
 * Draw patient summary panel
 */
function renderPatientBox(
  doc: jsPDF,
  patient: { name: string; uhid: string; age?: number | string; gender?: string; phone?: string; date?: string },
  startY = 42,
) {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, startY, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Patient: ${patient.name}`, 18, startY + 7);
  doc.text(`UHID: ${patient.uhid}`, 18, startY + 14);
  doc.text(`Phone: ${patient.phone || '+91 98XXXXXXXX'}`, 18, startY + 20);

  doc.text(`Age / Gender: ${patient.age || '32'} Yrs / ${patient.gender || 'Patient'}`, 110, startY + 7);
  doc.text(`Date: ${patient.date || new Date().toISOString().split('T')[0]}`, 110, startY + 14);
  doc.text(`Facility: MediNexa Noida (OPD)`, 110, startY + 20);
}

/**
 * Draw doctor verification stamp & QR code seal
 */
function renderFooterAndSignature(
  doc: jsPDF,
  doctorName = 'Dr. Sanjay Deshmukh',
  regNumber = 'MCI-2004-12948',
  startY = 245,
) {
  // QR Seal Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, 44, 30, 2, 2, 'FD');

  // Simulated QR pattern
  doc.setFillColor(15, 23, 42);
  doc.rect(18, startY + 4, 8, 8, 'F');
  doc.rect(28, startY + 4, 4, 4, 'F');
  doc.rect(18, startY + 14, 4, 4, 'F');
  doc.rect(24, startY + 14, 8, 8, 'F');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('VERIFY RECORD', 18, startY + 26);
  doc.text('Scan for DISHA verification', 18, startY + 29);

  // Doctor Signature Stamp
  doc.text('Digitally Authenticated by:', 130, startY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(doctorName, 130, startY + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`MCI Reg: ${regNumber}`, 130, startY + 19);
  doc.text(`MediNexa Tertiary Healthcare Services`, 130, startY + 24);

  // Bottom Notice
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a statutory computer-generated medical record under the Indian IT Act 2000. Valid without physical ink signature.',
    105,
    286,
    { align: 'center' },
  );
}

// ============================================================================
// 1. ELECTRONIC PRESCRIPTION PDF
// ============================================================================
export function generatePrescriptionPdf(data: {
  prescriptionNumber: string;
  patient: { name: string; uhid: string; age?: number | string; gender?: string; phone?: string; date?: string };
  doctor: { name: string; specialty: string; registrationNumber: string };
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  advice?: string;
}) {
  const doc = new jsPDF();
  renderHeader(doc, 'E-PRESCRIPTION', data.prescriptionNumber);
  renderPatientBox(doc, data.patient, 42);

  // Doctor & Diagnosis Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Prescribing Specialist: ${data.doctor.name} (${data.doctor.specialty})`, 14, 73);
  doc.text(`Clinical Diagnosis: ${data.diagnosis}`, 14, 79);

  // Rx Table Header
  let currentY = 88;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(8);
  doc.text('#', 16, currentY + 5.5);
  doc.text('Medication & Generic Form', 24, currentY + 5.5);
  doc.text('Dosage', 85, currentY + 5.5);
  doc.text('Frequency', 115, currentY + 5.5);
  doc.text('Duration', 145, currentY + 5.5);
  doc.text('Instructions', 165, currentY + 5.5);

  currentY += 12;
  data.medications.forEach((med, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${idx + 1}.`, 16, currentY);
    doc.text(med.name, 24, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(med.dosage, 85, currentY);
    doc.text(med.frequency, 115, currentY);
    doc.text(med.duration, 145, currentY);
    doc.text(med.instructions, 165, currentY);

    currentY += 8;
  });

  // Clinical Advice
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('General Clinical Advice & Lifestyle Guidelines:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    data.advice ||
      '• Take medications with lukewarm water after meals.\n• Maintain low-sodium dietary intake and hydrate adequately.\n• SOS Follow-up in 14 days or immediately if acute symptoms recur.',
    14,
    currentY + 5,
  );

  renderFooterAndSignature(doc, data.doctor.name, data.doctor.registrationNumber, 240);
  doc.save(`${data.prescriptionNumber}.pdf`);
  return doc;
}

// ============================================================================
// 2. DIAGNOSTIC LAB REPORT PDF (NABL FORMAT)
// ============================================================================
export function generateLabReportPdf(data: {
  reportNumber: string;
  patient: { name: string; uhid: string; age?: number | string; gender?: string; phone?: string; date?: string };
  doctor: { name: string; specialty: string };
  panelName: string;
  specimenType: string;
  items: Array<{
    testName: string;
    resultValue: string;
    unit: string;
    referenceRange: string;
    flag: string;
  }>;
}) {
  const doc = new jsPDF();
  renderHeader(doc, 'DIAGNOSTIC REPORT', data.reportNumber);
  renderPatientBox(doc, data.patient, 42);

  let currentY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Diagnostic Investigation: ${data.panelName}`, 14, currentY);
  doc.text(`Specimen: ${data.specimenType}  |  Referred by: ${data.doctor.name}`, 14, currentY + 6);

  // Table Header
  currentY += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(8);
  doc.text('Test Parameter', 16, currentY + 5.5);
  doc.text('Observed Value', 85, currentY + 5.5);
  doc.text('Biological Ref Interval', 125, currentY + 5.5);
  doc.text('Unit', 160, currentY + 5.5);
  doc.text('Flag', 180, currentY + 5.5);

  currentY += 12;
  data.items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.testName, 16, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text(item.resultValue, 85, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(item.referenceRange, 125, currentY);
    doc.text(item.unit, 160, currentY);

    if (item.flag === 'NORMAL') {
      doc.setTextColor(16, 185, 129); // green
      doc.text('NORMAL', 180, currentY);
    } else {
      doc.setTextColor(225, 29, 72); // rose
      doc.text('ABNORMAL', 180, currentY);
    }
    doc.setTextColor(15, 23, 42);

    currentY += 8;
  });

  renderFooterAndSignature(doc, 'Dr. Rakesh Tiwari (Radiology & Pathology)', 'MCI-2007-90124', 240);
  doc.save(`${data.reportNumber}.pdf`);
  return doc;
}

// ============================================================================
// 3. HOSPITAL GST TAX INVOICE PDF
// ============================================================================
export function generateGstInvoicePdf(data: {
  invoiceNumber: string;
  patient: { name: string; uhid: string; phone?: string; date?: string };
  paymentMethod: string;
  transactionReference: string;
  items: Array<{
    description: string;
    hsnSac?: string;
    quantity: number;
    unitPrice: number;
    taxPercent: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}) {
  const doc = new jsPDF();
  renderHeader(doc, 'TAX INVOICE', data.invoiceNumber);
  renderPatientBox(doc, data.patient, 42);

  let currentY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Payment Method: ${data.paymentMethod}  |  Txn Ref: ${data.transactionReference}`, 14, currentY);
  doc.text(`GST Status: Fully Paid & Reconciled (SAC 999311 / HSN 3004)`, 14, currentY + 6);

  // Table Header
  currentY += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(8);
  doc.text('Description of Service / Goods', 16, currentY + 5.5);
  doc.text('HSN/SAC', 95, currentY + 5.5);
  doc.text('Qty', 120, currentY + 5.5);
  doc.text('Rate (INR)', 135, currentY + 5.5);
  doc.text('GST %', 158, currentY + 5.5);
  doc.text('Total (INR)', 175, currentY + 5.5);

  currentY += 12;
  data.items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(item.description.slice(0, 42), 16, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(item.hsnSac || 'SAC 999311', 95, currentY);
    doc.text(item.quantity.toString(), 122, currentY);
    doc.text(`₹${item.unitPrice}`, 135, currentY);
    doc.text(`${item.taxPercent}%`, 160, currentY);
    doc.text(`₹${item.total}`, 175, currentY);

    currentY += 8;
  });

  // Summary box
  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Taxable Subtotal:`, 130, currentY);
  doc.text(`₹${data.subtotal.toLocaleString('en-IN')}`, 175, currentY);

  currentY += 6;
  doc.text(`CGST (6%):`, 130, currentY);
  doc.text(`₹${(data.taxAmount / 2).toLocaleString('en-IN')}`, 175, currentY);

  currentY += 6;
  doc.text(`SGST (6%):`, 130, currentY);
  doc.text(`₹${(data.taxAmount / 2).toLocaleString('en-IN')}`, 175, currentY);

  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Net Total Paid:`, 130, currentY);
  doc.text(`₹${data.totalAmount.toLocaleString('en-IN')}`, 175, currentY);

  renderFooterAndSignature(doc, 'Rajesh Kumar (Finance Admin)', 'FAC-2026-001', 240);
  doc.save(`${data.invoiceNumber}.pdf`);
  return doc;
}

// ============================================================================
// 4. INPATIENT DISCHARGE SUMMARY PDF
// ============================================================================
export function generateDischargeSummaryPdf(data: {
  admissionNumber: string;
  patient: { name: string; uhid: string; age?: number | string; gender?: string; phone?: string; date?: string };
  admissionDate: string;
  dischargeDate: string;
  wardName: string;
  primaryPhysician: string;
  primaryDiagnosis: string;
  clinicalCourse: string;
  dischargeVitals: string;
  dischargeMedications: string;
  followUp: string;
}) {
  const doc = new jsPDF();
  renderHeader(doc, 'DISCHARGE SUMMARY', data.admissionNumber);
  renderPatientBox(doc, data.patient, 42);

  let currentY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Admission Date: ${data.admissionDate}  |  Discharge Date: ${data.dischargeDate}`, 14, currentY);
  doc.text(`Ward/Bed: ${data.wardName}  |  Treating Consultant: ${data.primaryPhysician}`, 14, currentY + 6);
  doc.text(`Primary Diagnosis: ${data.primaryDiagnosis}`, 14, currentY + 12);

  currentY += 22;
  doc.text('Hospital Clinical Course & Interventions:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.clinicalCourse, 14, currentY + 5, { maxWidth: 182 });

  currentY += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Vitals at Discharge:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.dischargeVitals, 14, currentY + 5);

  currentY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Discharge Medications & Regimen:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.dischargeMedications, 14, currentY + 5, { maxWidth: 182 });

  currentY += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Follow-up Instructions & Emergency Signs:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.followUp, 14, currentY + 5, { maxWidth: 182 });

  renderFooterAndSignature(doc, data.primaryPhysician, 'MCI-REG-VALID', 240);
  doc.save(`${data.admissionNumber}-Discharge.pdf`);
  return doc;
}

// ============================================================================
// 5. LONGITUDINAL MEDICAL HISTORY / EHR PDF
// ============================================================================
export function generateMedicalHistoryPdf(data: {
  patient: { name: string; uhid: string; age?: number | string; gender?: string; phone?: string; date?: string };
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  pastEncounters: Array<{ date: string; doctor: string; diagnosis: string }>;
}) {
  const doc = new jsPDF();
  renderHeader(doc, 'LONGITUDINAL EHR', data.patient.uhid);
  renderPatientBox(doc, data.patient, 42);

  let currentY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Blood Group: ${data.bloodGroup}  |  Patient Portal EHR Summary`, 14, currentY);

  currentY += 10;
  doc.text('Documented Drug & Food Allergies:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.allergies.join(', ') || 'No known drug allergies (NKDA)', 14, currentY + 5);

  currentY += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Chronic Clinical Conditions & Risk Factors:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.chronicConditions.join(', ') || 'None documented', 14, currentY + 5);

  currentY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Past Clinical Consultations & Encounters Timeline:', 14, currentY);

  currentY += 8;
  data.pastEncounters.forEach((enc) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${enc.date} - ${enc.doctor}`, 16, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessment: ${enc.diagnosis}`, 16, currentY + 4);
    currentY += 10;
  });

  renderFooterAndSignature(doc, 'MediNexa Clinical Records Officer', 'REG-CRO-2026', 240);
  doc.save(`${data.patient.uhid}-EHR-History.pdf`);
  return doc;
}
