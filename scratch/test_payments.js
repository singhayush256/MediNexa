const { PrismaClient } = require('@prisma/client');

async function testPayment() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
  });

  const patient = await prisma.patientProfile.findFirst();
  console.log('Using patient:', patient.id);

  const orderRes = await fetch('http://localhost:3001/api/v1/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 1500,
      context: 'APPOINTMENT',
      patientId: patient.id,
    }),
  });
  const orderData = await orderRes.json();
  console.log('Order created:', orderRes.status, orderData.orderId, 'Tax:', orderData.taxBreakdown);

  const verifyRes = await fetch('http://localhost:3001/api/v1/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: 'pay_mdnx_test_' + Date.now(),
      razorpaySignature: 'test_signature_mock_hash_64char_long_mock_signature_for_sandbox',
      patientId: patient.id,
      context: 'APPOINTMENT',
      amount: 1500,
    }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify payment:', verifyRes.status, verifyData.invoiceNumber, verifyData.status);

  // Test receipt
  const receiptRes = await fetch('http://localhost:3001/api/v1/payments/receipt/' + verifyData.invoiceNumber);
  const receiptData = await receiptRes.json();
  console.log('Receipt fetched:', receiptRes.status, receiptData.hospital?.name, 'Total:', receiptData.totalAmount);

  // Test refund
  const refundRes = await fetch('http://localhost:3001/api/v1/payments/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentId: verifyData.razorpayPaymentId,
      invoiceNumber: verifyData.invoiceNumber,
      amount: 1500,
      reason: 'Patient cancellation with full refund guarantee',
    }),
  });
  const refundData = await refundRes.json();
  console.log('Refund status:', refundRes.status, refundData.status, 'Refund ID:', refundData.refundId);

  await prisma.$disconnect();
}

testPayment().catch(console.error);
