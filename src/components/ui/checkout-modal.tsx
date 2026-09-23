'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan } from '@/lib/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  initialBillingCycle?: 'MONTHLY' | 'ANNUAL';
  selectedCountry?: string;
  initialDiscount?: { percent?: number; fixed?: number; code?: string } | null;
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, plan, onSuccess }: CheckoutModalProps) {
  const { currentUser, receivingAccounts, submitPaymentProof } = useAuth();
  const [accountId, setAccountId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [receipt, setReceipt] = useState<{ url: string; key: string } | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !plan) return null;
  const accounts = receivingAccounts.filter((account) => account.isActive &&
    ['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'RAAST', 'SADAPAY'].includes(account.provider));
  const selectedAccount = accounts.find((account) => account.id === accountId) ?? accounts[0];

  const uploadReceipt = async (file: File) => {
    setUploading(true);
    setReceipt(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'payment-proofs');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.success || !result.url || !result.key) throw new Error(result.error || 'Receipt upload failed.');
      setReceipt({ url: result.url, key: result.key });
      setReceiptName(file.name);
      toast.success('Receipt uploaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Receipt upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !selectedAccount || !receipt || !transactionId.trim() || !senderAccount.trim()) {
      toast.error('Select a receiving account and complete the transaction ID, sender account, and receipt.');
      return;
    }
    setSubmitting(true);
    const result = await submitPaymentProof({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '',
      planSlug: plan.slug,
      planName: plan.name,
      amount: plan.monthlyPrice,
      currency: 'PKR',
      paymentMethod: selectedAccount.provider,
      transactionId: transactionId.trim(),
      senderAccountNumber: senderAccount.trim(),
      screenshotUrl: receipt.url,
      screenshotKey: receipt.key,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setSubmitted(true);
    toast.success(result.message);
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Submit payment proof">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{submitted ? 'Payment submitted' : 'Manual payment review'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plan.name} · PKR {plan.monthlyPrice.toLocaleString()} one-time</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted" aria-label="Close">✕</button>
        </div>
        {submitted ? (
          <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-foreground">Your receipt is awaiting manual verification. Your membership will change only after an administrator confirms the transaction.</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4 text-sm">
            {!currentUser && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">Sign in before submitting payment evidence.</p>}
            {accounts.length === 0 && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">No receiving account is available. Please try again later; do not transfer funds without official account details.</p>}
            {accounts.length > 0 && <>
              <label className="block font-semibold text-foreground">Receiving account
                <select value={selectedAccount?.id ?? ''} onChange={(event) => setAccountId(event.target.value)} className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-foreground">
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.provider.replaceAll('_', ' ')} — {account.bankName}</option>)}
                </select>
              </label>
              {selectedAccount && <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-foreground">
                <p><strong>Account title:</strong> {selectedAccount.accountTitle}</p>
                <p className="mt-1"><strong>Account number:</strong> {selectedAccount.accountNumber}</p>
                {selectedAccount.iban && <p className="mt-1"><strong>IBAN:</strong> {selectedAccount.iban}</p>}
                {selectedAccount.instructions && <p className="mt-2 text-muted-foreground">{selectedAccount.instructions}</p>}
              </div>}
            </>}
            <label className="block font-semibold text-foreground">Transaction/reference ID
              <input required value={transactionId} onChange={(event) => setTransactionId(event.target.value)} maxLength={100} className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-foreground" />
            </label>
            <label className="block font-semibold text-foreground">Your sender account or mobile number
              <input required value={senderAccount} onChange={(event) => setSenderAccount(event.target.value)} maxLength={80} className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-foreground" />
            </label>
            <label className="block font-semibold text-foreground">Payment receipt image
              <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadReceipt(file); }} className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-foreground" />
              {receiptName && <span className="mt-1 block text-xs text-emerald-600">Uploaded: {receiptName}</span>}
            </label>
            <button type="submit" disabled={!currentUser || !selectedAccount || !receipt || uploading || submitting} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white disabled:opacity-50">
              {uploading ? 'Uploading receipt…' : submitting ? 'Submitting…' : 'Submit receipt for verification'}
            </button>
            <p className="text-xs text-muted-foreground">Card payments, coupons, and foreign-currency billing are not enabled. Transfer the exact PKR amount shown above only after checking the official account details.</p>
          </form>
        )}
      </div>
    </div>
  );
}
