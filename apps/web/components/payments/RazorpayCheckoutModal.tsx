'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Download,
  Receipt,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface PaymentItem {
  name: string;
  category: string;
  amount: number;
}

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  amount: number; // In Rupees
  context: 'APPOINTMENT' | 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'ADMISSION_ADVANCE';
  entityId?: string;
  description?: string;
  onSuccess?: (paymentResult: any) => void;
}

export function RazorpayCheckoutModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientEmail,
  amount,
  context,
  entityId,
  description,
  onSuccess,
}: RazorpayCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [upiVpa, setUpiVpa] = useState('patient@okhdfcbank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settledResult, setSettledResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Calculate GST
  const gstRate = context === 'PHARMACY' ? 0.12 : context === 'LAB' ? 0.05 : 0.00;
  const taxableSubtotal = gstRate > 0 ? Math.round((amount / (1 + gstRate)) * 100) / 100 : amount;
  const gstAmount = Math.round((amount - taxableSubtotal) * 100) / 100;

  const handlePayNow = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

      // 1. Create Razorpay Order
      const orderRes = await fetch(`${apiUrl}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          context,
          patientId,
          entityId,
          notes: description || `Payment for ${context} at MediNexa Noida`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to initiate Razorpay order');

      // 2. Simulate Razorpay Instant Settlement & Verification
      const mockPayId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const verifyRes = await fetch(`${apiUrl}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPayId,
          razorpaySignature: 'razorpay_hmac_verified_signature_token_' + Date.now(),
          patientId,
          context,
          amount,
          entityId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');

      setSettledResult(verifyData);
      if (onSuccess) {
        onSuccess(verifyData);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col font-sans">
        {/* Header with Razorpay Co-Branding */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <span>MediNexa Pay</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Razorpay</span>
              </div>
              <h3 className="text-base font-black">₹{amount.toLocaleString('en-IN')} INR</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {settledResult ? (
            /* Success State */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Payment Successful</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tax Invoice Issued: <span className="font-mono font-bold text-teal-600">{settledResult.invoiceNumber}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {settledResult.razorpayPaymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-black text-slate-900 dark:text-white">₹{amount} (INR)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST Status:</span>
                  <span className="text-emerald-600 font-bold">Paid & Reconciled</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="primary"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Checkout Details */
            <>
              {/* Order Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Patient:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{patientName}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Category:</span>
                  <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">{context}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{taxableSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST ({Math.round(gstRate * 100)}%):</span>
                  <span>{gstAmount > 0 ? `₹${gstAmount}` : 'Exempt (SAC 999311)'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-slate-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span className="text-sm text-teal-600 dark:text-teal-400">₹{amount}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'UPI'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'NET_BANKING'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Method Detail */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Pay via Google Pay, PhonePe, Paytm, or BHIM:
                  </div>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Visa, MasterCard, RuPay, Maestro accepted:
                  </div>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Demo Ready)"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500"
                  />
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    All major Indian banks supported (HDFC, ICICI, SBI, Axis):
                  </div>
                  <select className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Pay Button */}
              <Button
                onClick={handlePayNow}
                disabled={loading}
                variant="primary"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                {loading ? 'Processing via Razorpay...' : `Pay ₹${amount} Securely`}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted • PCI-DSS Level 1 Certified</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
