'use client';

import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  User,
  Hash,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { toast } from 'sonner';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  userName?: string;
  userEmail?: string;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  invoice,
  userName = 'Valued Member',
  userEmail = 'member@example.com',
}: InvoiceReceiptModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success(`Receipt #${invoice.invoiceNumber} downloaded as PDF.`);
  };

  const isPaid = invoice.status === 'PAID';
  const isPending = invoice.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl text-foreground">
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-serif text-foreground">Official Payment Receipt</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : isPending
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              title="Print Receipt"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
              title="Download PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Receipt Printable Canvas */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-serif tracking-tight text-brand-600 dark:text-brand-400">
                  Compatible Matrimonials
                </span>
                <ShieldCheck className="h-5 w-5 text-brand-600" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pakistan's #1 Secure & Sharia-Compliant Matrimonial Matchmaking Network
              </p>
              <p className="text-[10px] text-muted-foreground">
                NTN / Reg: PK-MAT-2025-9988 | support@compatiblematrimonials.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Receipt Number</div>
              <div className="text-lg font-black font-mono text-foreground">{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-muted-foreground">
                Date: {new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Customer & Payment Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-muted/40 p-4 border border-border text-xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Billed To (Member)
              </span>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <User className="h-3.5 w-3.5 text-brand-600" />
                <span>{userName}</span>
              </div>
              <div className="text-muted-foreground pl-5">{userEmail}</div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Payment Channel
              </span>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CreditCard className="h-3.5 w-3.5 text-brand-600" />
                <span>{invoice.paymentMethod}</span>
              </div>
              <div className="text-muted-foreground pl-5">
                Status:{' '}
                <span className={isPaid ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {isPaid ? 'Payment Confirmed' : 'Verification in Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Tax / Surcharge</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-semibold text-foreground">
                    <div>{invoice.planName}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">
                      Verified Contact Unlocks, Priority Matching & Full Dossier Access
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">Standard Period</td>
                  <td className="p-3 text-muted-foreground">Included (0%)</td>
                  <td className="p-3 text-right font-black font-serif text-sm">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/30 border-t border-border font-bold text-foreground">
                <tr>
                  <td colSpan={3} className="p-3 text-right text-xs">
                    Total Paid / Payable:
                  </td>
                  <td className="p-3 text-right font-serif text-base font-black text-brand-600 dark:text-brand-400">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification / Security Footer Notice */}
          <div className="rounded-2xl border border-border/80 bg-background p-4 text-[11px] text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Authenticity & Official Verification Notice</span>
            </div>
            <p>
              This is an official electronically generated invoice by Compatible Matrimonials. In accordance with
              terms of service, matrimonial memberships are non-transferable and subject to our community safety rules.
            </p>
            {isPending && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Under Verification:</strong> Your payment proof has been queued for verification. Once
                  reviewed by our billing officer, this receipt will automatically update to PAID status.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Close Receipt
          </button>
          <button
            onClick={handleDownload}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-brand-700 transition"
          >
            Download Invoice PDF
          </button>
        </div>
      </div>
    </div>
  );
}
