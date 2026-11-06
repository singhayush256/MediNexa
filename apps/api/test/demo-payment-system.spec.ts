import { describe, it } from 'node:test';
import * as assert from 'node:assert';

describe('MediNexa Phase 13 — Demo Payment System (Hackathon Readiness Suite)', () => {
  // Mock In-Memory Database for Payment Testing
  const db = {
    patientProfiles: [
      { id: 'pat-1', user: { firstName: 'Arjun', lastName: 'Nair', email: 'arjun@medinexa.in', phone: '+91 9876543210' } },
    ],
    facilities: [
      { id: 'fac-1', name: 'MediNexa Multispeciality Hospital' },
    ],
    invoices: [] as any[],
    lineItems: [] as any[],
    transactions: [] as any[],
  };

  // Mock Payment Service implementing Phase 13 specifications
  class MockPaymentService {
    isDemoMode() {
      return true; // Always true in hackathon simulation
    }

    async createOrder(dto: { amount: number; context: string; patientId: string; facilityId?: string }) {
      if (!dto.amount || dto.amount <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }
      const patient = db.patientProfiles.find((p) => p.id === dto.patientId);
      if (!patient) throw new Error('Patient not found.');

      const isDemo = this.isDemoMode();
      const orderId = isDemo ? `DEMO_ORD_${Date.now()}_abc123` : `order_live_${Date.now()}`;

      return {
        orderId,
        amount: dto.amount,
        amountInPaise: dto.amount * 100,
        currency: 'INR',
        keyId: 'DEMO_KEY_MEDINEXA_HEALTH',
        context: dto.context,
        isDemo: true,
        demoNotice: 'DEMO — NO REAL MONEY TRANSACTION',
        customer: {
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          email: patient.user.email,
        },
      };
    }

    async verifyPayment(dto: {
      razorpayOrderId: string;
      razorpayPaymentId?: string;
      patientId: string;
      facilityId?: string;
      context: string;
      amount: number;
      simulationState?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
      paymentMethod?: string;
    }) {
      const simState = dto.simulationState || 'SUCCESS';
      const isDemo = true;

      // 1. Simulated Bank Decline
      if (simState === 'FAILED') {
        return {
          success: false,
          status: 'FAILED',
          isDemo: true,
          demoNotice: 'DEMO — NO REAL MONEY TRANSACTION',
          orderId: dto.razorpayOrderId,
          message: 'Payment declined: Simulated transaction failed as requested by demo test.',
        };
      }

      // 2. Simulated Cancellation
      if (simState === 'CANCELLED') {
        return {
          success: false,
          status: 'CANCELLED',
          isDemo: true,
          demoNotice: 'DEMO — NO REAL MONEY TRANSACTION',
          orderId: dto.razorpayOrderId,
          message: 'Payment cancelled: Simulated transaction was aborted by the user.',
        };
      }

      // 3. Fictional Transaction ID with DEMO_ prefix
      const txnReference = dto.razorpayPaymentId?.startsWith('DEMO_TXN_')
        ? dto.razorpayPaymentId
        : `DEMO_TXN_${Date.now()}_TEST01`;

      // 4. Idempotency Check
      const existingTxn = db.transactions.find((t) => t.transactionReference === txnReference);
      if (existingTxn) {
        const inv = db.invoices.find((i) => i.id === existingTxn.invoiceId);
        return {
          success: true,
          isDemo: true,
          demoNotice: 'DEMO — NO REAL MONEY TRANSACTION',
          invoiceNumber: inv.invoiceNumber,
          transactionReference: txnReference,
          status: 'PAID',
          message: 'Payment already processed and reconciled (Idempotent replay).',
        };
      }

      // 5. Create Invoice & Settle
      const invoiceNumber = `INV-2026-${Date.now().toString().slice(-6)}`;
      const invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        patientId: dto.patientId,
        facilityId: dto.facilityId || 'fac-1',
        totalAmount: dto.amount,
        amountPaid: dto.amount,
        balanceDue: 0,
        paymentStatus: 'PAID',
        invoiceStatus: 'PAID',
        notes: `DEMO — NO REAL MONEY TRANSACTION | Ref: ${txnReference}`,
      };
      db.invoices.push(invoice);

      const transaction = {
        id: `txn-${Date.now()}`,
        invoiceId: invoice.id,
        paymentMethod: dto.paymentMethod || 'UPI',
        transactionReference: txnReference,
        amount: dto.amount,
        status: 'SUCCESS',
      };
      db.transactions.push(transaction);

      return {
        success: true,
        isDemo: true,
        demoNotice: 'DEMO — NO REAL MONEY TRANSACTION',
        invoiceNumber,
        invoiceId: invoice.id,
        transactionId: transaction.id,
        transactionReference: txnReference,
        amount: dto.amount,
        status: 'PAID',
        message: `[DEMO SIMULATION] Payment of ₹${dto.amount} settled successfully. Invoice ${invoiceNumber} issued.`,
      };
    }
  }

  const paymentService = new MockPaymentService();

  describe('1. Demo Order Creation & Fictional IDs', () => {
    it('generates order ID with DEMO_ORD_ prefix and includes DEMO notice', async () => {
      const order = await paymentService.createOrder({
        amount: 1400,
        context: 'CONSULTATION',
        patientId: 'pat-1',
      });

      assert.strictEqual(order.isDemo, true);
      assert.strictEqual(order.demoNotice, 'DEMO — NO REAL MONEY TRANSACTION');
      assert.match(order.orderId, /^DEMO_ORD_/);
      assert.strictEqual(order.amount, 1400);
      assert.strictEqual(order.currency, 'INR');
    });

    it('rejects zero or negative payment amounts', async () => {
      await assert.rejects(
        async () => {
          await paymentService.createOrder({
            amount: 0,
            context: 'CONSULTATION',
            patientId: 'pat-1',
          });
        },
        /Payment amount must be greater than zero/,
      );
    });
  });

  describe('2. Simulated Success Payment', () => {
    it('settles payment with DEMO_TXN_ prefix and issues reconciled tax invoice', async () => {
      const res = await paymentService.verifyPayment({
        razorpayOrderId: 'DEMO_ORD_1001',
        patientId: 'pat-1',
        context: 'CONSULTATION',
        amount: 1400,
        simulationState: 'SUCCESS',
        paymentMethod: 'UPI',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isDemo, true);
      assert.strictEqual(res.demoNotice, 'DEMO — NO REAL MONEY TRANSACTION');
      assert.strictEqual(res.status, 'PAID');
      assert.match(res.transactionReference, /^DEMO_TXN_/);
      assert.match(res.invoiceNumber, /^INV-2026-/);

      // Verify database persistence
      const savedInv = db.invoices.find((i) => i.invoiceNumber === res.invoiceNumber);
      assert.ok(savedInv);
      assert.strictEqual(savedInv.balanceDue, 0);
      assert.strictEqual(savedInv.paymentStatus, 'PAID');
      assert.match(savedInv.notes, /DEMO — NO REAL MONEY TRANSACTION/);
    });
  });

  describe('3. Simulated Bank Decline / Failure', () => {
    it('returns declined status without creating a paid invoice', async () => {
      const invoicesBefore = db.invoices.length;

      const res = await paymentService.verifyPayment({
        razorpayOrderId: 'DEMO_ORD_1002',
        patientId: 'pat-1',
        context: 'CONSULTATION',
        amount: 1400,
        simulationState: 'FAILED',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.status, 'FAILED');
      assert.strictEqual(res.isDemo, true);
      assert.match(res.message, /declined/i);

      // Zero new paid invoices created
      assert.strictEqual(db.invoices.length, invoicesBefore);
    });
  });

  describe('4. Simulated User Cancellation', () => {
    it('returns cancelled status without charging patient', async () => {
      const invoicesBefore = db.invoices.length;

      const res = await paymentService.verifyPayment({
        razorpayOrderId: 'DEMO_ORD_1003',
        patientId: 'pat-1',
        context: 'CONSULTATION',
        amount: 1400,
        simulationState: 'CANCELLED',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.status, 'CANCELLED');
      assert.strictEqual(res.isDemo, true);
      assert.match(res.message, /cancelled/i);

      // Zero new paid invoices created
      assert.strictEqual(db.invoices.length, invoicesBefore);
    });
  });

  describe('5. Transaction Idempotency', () => {
    it('prevents double billing on duplicate transaction replay', async () => {
      const txnRef = `DEMO_TXN_${Date.now()}_REPLAY`;

      // First call
      const res1 = await paymentService.verifyPayment({
        razorpayOrderId: 'DEMO_ORD_1004',
        razorpayPaymentId: txnRef,
        patientId: 'pat-1',
        context: 'CONSULTATION',
        amount: 2500,
        simulationState: 'SUCCESS',
      });
      assert.strictEqual(res1.status, 'PAID');

      const invoicesCount = db.invoices.length;

      // Duplicate replay
      const res2 = await paymentService.verifyPayment({
        razorpayOrderId: 'DEMO_ORD_1004',
        razorpayPaymentId: txnRef,
        patientId: 'pat-1',
        context: 'CONSULTATION',
        amount: 2500,
        simulationState: 'SUCCESS',
      });

      assert.strictEqual(res2.status, 'PAID');
      assert.strictEqual(res2.transactionReference, txnRef);
      assert.match(res2.message, /Idempotent replay/);

      // Invoices count must not increase
      assert.strictEqual(db.invoices.length, invoicesCount);
    });
  });
});

