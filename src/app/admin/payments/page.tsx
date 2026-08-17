'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  MessageCircle,
  Eye,
  Filter,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Building,
  Smartphone,
  Wallet,
  Calendar,
  User,
  Check,
  X,
  Printer,
  Edit2,
  Trash2,
  Power,
  Copy,
  Landmark,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { PaymentProof, ReceivingAccount, SubscriptionTier } from '@/lib/types';
import { PaymentSlipDisplay } from '@/components/ui/payment-slip-display';

export default function AdminPaymentsManagementPage() {
  const {
    paymentProofs,
    approvePaymentProof,
    rejectPaymentProof,
    submitPaymentProof,
    receivingAccounts,
    addReceivingAccount,
    updateReceivingAccount,
    deleteReceivingAccount,
    toggleReceivingAccountStatus,
    users,
  } = useAuth();

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'VERIFICATION_QUEUE' | 'ACCOUNTS' | 'ANALYTICS'>('LEDGER');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [gatewayFilter, setGatewayFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [previewProof, setPreviewProof] = useState<PaymentProof | null>(null);
  const [rejectingProofId, setRejectingProofId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentProof | null>(null);

  // Receiving Accounts Modals & State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ReceivingAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState<{
    provider: 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'RAAST' | 'SADAPAY' | 'NAYAPAY' | 'OTHER';
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchName: string;
    instructions: string;
    isActive: boolean;
    isPrimary: boolean;
  }>({
    provider: 'JAZZCASH',
    bankName: '',
    accountTitle: 'Compatible Matrimonials',
    accountNumber: '',
    iban: '',
    branchName: '',
    instructions: 'Send fee via App or Online Banking & attach receipt with Trx ID.',
    isActive: true,
    isPrimary: false,
  });

  // Manual payment form state
  const [manualForm, setManualForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    planSlug: 'PREMIUM',
    amount: 15000,
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
    senderAccountNumber: '',
    notes: 'Manually logged by Administrator',
  });

  // Filtered payments list
  const filteredProofs = useMemo(() => {
    return paymentProofs.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (gatewayFilter !== 'ALL' && p.paymentMethod !== gatewayFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = p.userName.toLowerCase().includes(term);
        const matchEmail = p.userEmail.toLowerCase().includes(term);
        const matchPhone = p.userPhone.toLowerCase().includes(term);
        const matchTrx = p.transactionId.toLowerCase().includes(term);
        const matchPlan = p.planName.toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchPhone && !matchTrx && !matchPlan) return false;
      }
      return true;
    });
  }, [paymentProofs, statusFilter, gatewayFilter, searchTerm]);

  // Statistics & Financial Totals
  const totalVerifiedRevenue = useMemo(() => {
    return paymentProofs
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [paymentProofs]);

  const totalPendingRevenue = useMemo(() => {
    return paymentProofs
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [paymentProofs]);

  const pendingCount = paymentProofs.filter((p) => p.status === 'PENDING').length;
  const verifiedCount = paymentProofs.filter((p) => p.status === 'VERIFIED').length;
  const rejectedCount = paymentProofs.filter((p) => p.status === 'REJECTED').length;

  // Gateway Breakdown Analytics
  const gatewayBreakdown = useMemo(() => {
    const verifiedOnly = paymentProofs.filter((p) => p.status === 'VERIFIED');
    const total = verifiedOnly.reduce((s, p) => s + p.amount, 0) || 1;

    const byMethod: Record<string, { count: number; total: number }> = {
      JAZZCASH: { count: 0, total: 0 },
      EASYPAISA: { count: 0, total: 0 },
      BANK_TRANSFER: { count: 0, total: 0 },
      RAAST: { count: 0, total: 0 },
    };

    verifiedOnly.forEach((p) => {
      if (!byMethod[p.paymentMethod]) {
        byMethod[p.paymentMethod] = { count: 0, total: 0 };
      }
      byMethod[p.paymentMethod].count += 1;
      byMethod[p.paymentMethod].total += p.amount;
    });

    return Object.entries(byMethod).map(([key, data]) => ({
      key,
      name: key.replace('_', ' '),
      count: data.count,
      total: data.total,
      percentage: Math.round((data.total / total) * 100),
    }));
  }, [paymentProofs]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Actions
  const handleApprove = (proof: PaymentProof) => {
    approvePaymentProof(proof.id);
    toast.success(`Payment verified! ${proof.userName}'s membership has been upgraded to ${proof.planName}.`);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProofId) return;
    rejectPaymentProof(rejectingProofId, rejectionReason || 'Payment verification unconfirmed.');
    toast.error('Payment rejected and reason logged.');
    setRejectingProofId(null);
    setRejectionReason('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.userName || !manualForm.userEmail || !manualForm.transactionId) {
      toast.error('Please fill in applicant name, email, and transaction ID.');
      return;
    }

    const planNames: Record<string, string> = {
      BASIC: 'Basic Matchmaking Plan',
      PREMIUM: 'Elite Executive Plan',
      VIP: 'VIP Bespoke Matchmaking',
    };

    submitPaymentProof({
      userId: `user-${Date.now()}`,
      userName: manualForm.userName,
      userEmail: manualForm.userEmail,
      userPhone: manualForm.userPhone || '+92 300 0000000',
      planSlug: manualForm.planSlug,
      planName: planNames[manualForm.planSlug] || manualForm.planSlug,
      amount: Number(manualForm.amount),
      currency: 'PKR',
      paymentMethod: manualForm.paymentMethod as any,
      transactionId: manualForm.transactionId,
      senderAccountNumber: manualForm.senderAccountNumber,
      screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    });

    toast.success(`Logged manual payment of PKR ${Number(manualForm.amount).toLocaleString()} for ${manualForm.userName}!`);
    setIsManualModalOpen(false);
    setManualForm({
      userName: '',
      userEmail: '',
      userPhone: '',
      planSlug: 'PREMIUM',
      amount: 15000,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: '',
      senderAccountNumber: '',
      notes: 'Manually logged by Administrator',
    });
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.bankName || !accountForm.accountTitle || !accountForm.accountNumber) {
      toast.error('Please fill in Bank/Provider name, Account Title, and Account Number.');
      return;
    }

    if (editingAccount) {
      updateReceivingAccount(editingAccount.id, {
        provider: accountForm.provider,
        bankName: accountForm.bankName,
        accountTitle: accountForm.accountTitle,
        accountNumber: accountForm.accountNumber,
        iban: accountForm.iban || undefined,
        branchName: accountForm.branchName || undefined,
        instructions: accountForm.instructions,
        isActive: accountForm.isActive,
        isPrimary: accountForm.isPrimary,
      });
      toast.success('Receiving account details updated successfully!');
    } else {
      addReceivingAccount({
        provider: accountForm.provider,
        bankName: accountForm.bankName,
        accountTitle: accountForm.accountTitle,
        accountNumber: accountForm.accountNumber,
        iban: accountForm.iban || undefined,
        branchName: accountForm.branchName || undefined,
        instructions: accountForm.instructions,
        isActive: accountForm.isActive,
        isPrimary: accountForm.isPrimary,
      });
      toast.success('New receiving account added and live in registration portal!');
    }

    setIsAccountModalOpen(false);
    setEditingAccount(null);
    setAccountForm({
      provider: 'JAZZCASH',
      bankName: '',
      accountTitle: 'Compatible Matrimonials',
      accountNumber: '',
      iban: '',
      branchName: '',
      instructions: 'Send fee via App or Online Banking & attach receipt with Trx ID.',
      isActive: true,
      isPrimary: false,
    });
  };

  const handleOpenEditAccount = (acc: ReceivingAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      provider: acc.provider,
      bankName: acc.bankName,
      accountTitle: acc.accountTitle,
      accountNumber: acc.accountNumber,
      iban: acc.iban || '',
      branchName: acc.branchName || '',
      instructions: acc.instructions || '',
      isActive: acc.isActive,
      isPrimary: !!acc.isPrimary,
    });
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (acc: ReceivingAccount) => {
    if (confirm(`Are you sure you want to delete "${acc.bankName} (${acc.accountNumber})"?`)) {
      deleteReceivingAccount(acc.id);
      toast.error('Receiving account removed.');
    }
  };

  const handleExportCSV = () => {
    if (filteredProofs.length === 0) {
      toast.info('No payment records to export.');
      return;
    }

    const headers = ['Record ID', 'Applicant Name', 'Email', 'Phone', 'Plan', 'Amount (PKR)', 'Gateway', 'Trx ID', 'Status', 'Date'];
    const rows = filteredProofs.map((p) => [
      p.id,
      `"${p.userName}"`,
      p.userEmail,
      p.userPhone,
      p.planName,
      p.amount,
      p.paymentMethod,
      p.transactionId,
      p.status,
      new Date(p.submittedAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payments Ledger CSV exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20 mb-1">
            <CreditCard className="h-3.5 w-3.5" /> Financial Operations & Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Payments & Receiving Accounts Management
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit incoming transactions, manage receiving bank accounts, and control platform revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={() => {
              setEditingAccount(null);
              setAccountForm({
                provider: 'BANK_TRANSFER',
                bankName: '',
                accountTitle: 'Compatible Matrimonials',
                accountNumber: '',
                iban: '',
                branchName: '',
                instructions: 'Send fee via App or Online Banking & attach receipt with Trx ID.',
                isActive: true,
                isPrimary: false,
              });
              setIsAccountModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition shadow-sm"
          >
            <Landmark className="h-4 w-4" /> + Add Receiving Account
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
          >
            <Plus className="h-4 w-4" /> Record Manual Payment
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Total Verified Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-serif pt-1">
            PKR {totalVerifiedRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {verifiedCount} Verified Transactions
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Pending Review Volume</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-serif pt-1">
            PKR {totalPendingRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium">
            {pendingCount} Slips Awaiting Review
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Official Receiving Accounts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-serif pt-1">
            {receivingAccounts.filter((a) => a.isActive).length} Active Accounts
          </div>
          <div className="text-[11px] text-blue-400">
            {receivingAccounts.length} Total Configured
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Total Invoices Issued</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-serif pt-1">
            {paymentProofs.length} Records
          </div>
          <div className="text-[11px] text-zinc-400">
            {rejectedCount} Rejected / Unmatched
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'LEDGER'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> Master Transactions Ledger ({filteredProofs.length})
          </button>
          <button
            onClick={() => setActiveTab('VERIFICATION_QUEUE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'VERIFICATION_QUEUE'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Clock className="h-4 w-4" /> Slip Inspection Queue
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-400 text-black px-1.5 py-0.2 text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ACCOUNTS'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Landmark className="h-4 w-4" /> 🏦 Receiving Accounts ({receivingAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ANALYTICS'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Gateway Breakdown
          </button>
        </div>

        {activeTab === 'ACCOUNTS' && (
          <button
            onClick={() => {
              setEditingAccount(null);
              setAccountForm({
                provider: 'BANK_TRANSFER',
                bankName: '',
                accountTitle: 'Compatible Matrimonials',
                accountNumber: '',
                iban: '',
                branchName: '',
                instructions: 'Send fee via App or Online Banking & attach receipt with Trx ID.',
                isActive: true,
                isPrimary: false,
              });
              setIsAccountModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> Add New Bank / Wallet
          </button>
        )}
      </div>

      {/* ================= TAB 1: MASTER TRANSACTIONS LEDGER ================= */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant, Trx ID, email..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      statusFilter === s
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Gateway Filter */}
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="ALL">All Gateways</option>
                <option value="JAZZCASH">JazzCash</option>
                <option value="EASYPAISA">Easypaisa</option>
                <option value="BANK_TRANSFER">Bank Transfer (Meezan/IBFT)</option>
                <option value="RAAST">Raast Instant ID</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Date & Trx ID</th>
                    <th className="px-5 py-4 font-semibold">Applicant Dossier</th>
                    <th className="px-5 py-4 font-semibold">Package & Tier</th>
                    <th className="px-5 py-4 font-semibold">Gateway & Channel</th>
                    <th className="px-5 py-4 font-semibold text-right">Amount (PKR)</th>
                    <th className="px-5 py-4 font-semibold text-center">Audit Status</th>
                    <th className="px-5 py-4 font-semibold text-right">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProofs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/50 text-zinc-400 mb-3">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-300">No payment transaction records found</p>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                          When users submit Easypaisa, JazzCash, or bank receipts during registration, they will appear here in real-time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProofs.map((p) => {
                      const waNumber = p.userPhone.replace(/[^0-9]/g, '');
                      return (
                        <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                          {/* Date & Trx ID */}
                          <td className="px-5 py-4">
                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{p.transactionId}</span>
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(p.submittedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </td>

                          {/* Applicant Dossier */}
                          <td className="px-5 py-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-amber-400" />
                              {p.userName}
                            </div>
                            <div className="text-[11px] text-zinc-400">{p.userEmail}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">{p.userPhone}</div>
                          </td>

                          {/* Plan */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                              {p.planName}
                            </span>
                          </td>

                          {/* Payment Method */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {p.paymentMethod === 'BANK_TRANSFER' && <Building className="h-4 w-4 text-blue-400" />}
                              {p.paymentMethod === 'JAZZCASH' && <Smartphone className="h-4 w-4 text-red-400" />}
                              {p.paymentMethod === 'EASYPAISA' && <Wallet className="h-4 w-4 text-emerald-400" />}
                              {p.paymentMethod === 'RAAST' && <Smartphone className="h-4 w-4 text-purple-400" />}
                              <span className="font-medium text-white">{p.paymentMethod.replace('_', ' ')}</span>
                            </div>
                            {p.senderAccountNumber && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Sender: {p.senderAccountNumber}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 text-right">
                            <span className="font-mono text-sm font-black text-white">
                              PKR {p.amount.toLocaleString()}
                            </span>
                          </td>

                          {/* Audit Status */}
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                                p.status === 'VERIFIED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : p.status === 'PENDING'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {p.status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3" />}
                              {p.status === 'PENDING' && <Clock className="h-3 w-3" />}
                              {p.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                              {p.status}
                            </span>
                          </td>

                          {/* Ledger Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Slip */}
                              {p.screenshotUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewScreenshotUrl(p.screenshotUrl || 'digital-slip');
                                    setPreviewProof(p);
                                  }}
                                  title="Inspect Payment Slip"
                                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* View Invoice */}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(p)}
                                title="View Membership Invoice"
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                              >
                                <Receipt className="h-3.5 w-3.5 text-amber-400" />
                              </button>

                              {/* WhatsApp Direct */}
                              <a
                                href={`https://wa.me/${waNumber}?text=Assalam-o-Alaikum%20${encodeURIComponent(
                                  p.userName
                                )},%20regarding%20your%20Compatible%20Matrimonials%20payment%20(Trx:%20${p.transactionId}):`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Message on WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/60 transition"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>

                              {/* Approve Button */}
                              {p.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(p)}
                                  title="Verify & Upgrade"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Reject Button */}
                              {p.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => setRejectingProofId(p.id)}
                                  title="Reject Payment"
                                  className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-[11px] transition"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SLIP INSPECTION QUEUE ================= */}
      {activeTab === 'VERIFICATION_QUEUE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white">Visual Receipt Verification Grid</h3>
              <p className="text-xs text-zinc-400">
                Inspect high-resolution transaction slips submitted via mobile wallets and online bank apps.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {pendingCount} Pending Verifications
            </span>
          </div>

          {filteredProofs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-semibold text-white">All Payment Slips Reviewed</p>
              <p className="text-xs mt-1">There are no pending receipts requiring manual audit at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProofs.map((proof) => {
                const waNumber = proof.userPhone.replace(/[^0-9]/g, '');
                return (
                  <div
                    key={proof.id}
                    className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl"
                  >
                    {/* Slip Image Preview */}
                    <div
                      onClick={() => {
                        setPreviewScreenshotUrl(proof.screenshotUrl || 'digital-slip');
                        setPreviewProof(proof);
                      }}
                      className="relative aspect-video w-full bg-zinc-950 overflow-hidden cursor-pointer group border-b border-zinc-800"
                    >
                      <PaymentSlipDisplay
                        proof={proof}
                        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-xs">
                        <Eye className="h-4 w-4" /> Click to Inspect Full Slip
                      </div>
                      <span
                        className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                          proof.status === 'VERIFIED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : proof.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {proof.status}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-white text-sm">{proof.userName}</h4>
                          <span className="font-mono font-black text-amber-400 text-sm">
                            PKR {proof.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 space-y-1">
                          <p className="flex items-center justify-between">
                            <span>Plan:</span>
                            <strong className="text-zinc-200">{proof.planName}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Gateway:</span>
                            <span className="text-zinc-300 font-medium">
                              {proof.paymentMethod.replace('_', ' ')}
                            </span>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Trx ID:</span>
                            <span className="font-mono text-zinc-200 font-bold">{proof.transactionId}</span>
                          </p>
                          {proof.senderAccountNumber && (
                            <p className="flex items-center justify-between">
                              <span>Sender Acc:</span>
                              <span className="font-mono text-zinc-400">{proof.senderAccountNumber}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Footer */}
                      {proof.status === 'PENDING' ? (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                          <button
                            type="button"
                            onClick={() => handleApprove(proof)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingProofId(proof.id)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 py-2.5 text-xs font-bold text-rose-300 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500">
                          Reviewed: {proof.reviewedBy || 'Admin'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: RECEIVING BANK & WALLET ACCOUNTS ================= */}
      {activeTab === 'ACCOUNTS' && (
        <div className="space-y-6">
          {/* Informational Banner */}
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Official Payment Receiving Accounts</h3>
                <p className="text-xs text-zinc-400 max-w-2xl mt-0.5 leading-relaxed">
                  These accounts are dynamically displayed to candidate applicants on Step 4 of the registration wizard and during package checkout. Any update or new account added here is published immediately.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAccount(null);
                setAccountForm({
                  provider: 'BANK_TRANSFER',
                  bankName: '',
                  accountTitle: 'Compatible Matrimonials',
                  accountNumber: '',
                  iban: '',
                  branchName: '',
                  instructions: 'Send fee via App or Online Banking & attach receipt with Trx ID.',
                  isActive: true,
                  isPrimary: false,
                });
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition shrink-0"
            >
              <Plus className="h-4 w-4" /> Add New Receiving Account
            </button>
          </div>

          {/* Accounts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivingAccounts.map((acc) => {
              const isJazz = acc.provider === 'JAZZCASH';
              const isEasy = acc.provider === 'EASYPAISA';
              const isBank = acc.provider === 'BANK_TRANSFER';
              const isRaast = acc.provider === 'RAAST';
              const isSada = acc.provider === 'SADAPAY';
              const isNaya = acc.provider === 'NAYAPAY';

              return (
                <div
                  key={acc.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition duration-300 ${
                    acc.isActive
                      ? 'border-zinc-800 bg-zinc-900 hover:border-amber-500/50'
                      : 'border-zinc-800/50 bg-zinc-950 opacity-60'
                  }`}
                >
                  {/* Top Badges & Provider Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                          isJazz
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isEasy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isRaast
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : isSada
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : isNaya
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {isBank && <Building className="h-3.5 w-3.5" />}
                        {isJazz && <Smartphone className="h-3.5 w-3.5" />}
                        {isEasy && <Wallet className="h-3.5 w-3.5" />}
                        {isRaast && <Smartphone className="h-3.5 w-3.5" />}
                        {acc.provider.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {acc.isPrimary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                            <Star className="h-3 w-3 fill-amber-400" /> Primary
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            acc.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {acc.isActive ? 'Live / Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Bank / Provider Name */}
                    <h4 className="text-base font-bold text-white font-serif">{acc.bankName}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Title: <strong className="text-zinc-200">{acc.accountTitle}</strong></p>

                    {/* Account Number & IBAN */}
                    <div className="mt-4 space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                          <span>Account / Mobile Number:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acc.accountNumber, `${acc.bankName} Number`)}
                            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                          >
                            {copiedKey === `${acc.bankName} Number` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                          </button>
                        </div>
                        <p className="font-mono text-sm font-black text-white">{acc.accountNumber}</p>
                      </div>

                      {acc.iban && (
                        <div className="pt-2 border-t border-zinc-900">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                            <span>IBAN (24 Digits):</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.iban!, `${acc.bankName} IBAN`)}
                              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                            >
                              {copiedKey === `${acc.bankName} IBAN` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                            </button>
                          </div>
                          <p className="font-mono text-xs font-bold text-emerald-400 break-all">{acc.iban}</p>
                        </div>
                      )}

                      {acc.branchName && (
                        <div className="text-[11px] text-zinc-500 pt-1">
                          Branch: {acc.branchName}
                        </div>
                      )}
                    </div>

                    {/* Payment Instructions */}
                    {acc.instructions && (
                      <p className="text-[11px] text-zinc-400 mt-3 italic bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                        "{acc.instructions}"
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReceivingAccountStatus(acc.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        acc.isActive
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {acc.isActive ? 'Deactivate' : 'Enable Account'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAccount(acc)}
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                        title="Edit Account Details"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-amber-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-2 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/60 transition"
                        title="Delete Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: GATEWAY ANALYTICS ================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Distribution by Method */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Revenue by Payment Gateway</h3>
              <p className="text-xs text-zinc-400">Breakdown of verified collections across payment channels.</p>
            </div>

            <div className="space-y-4">
              {gatewayBreakdown.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      {item.key === 'BANK_TRANSFER' && <Building className="h-4 w-4 text-blue-400" />}
                      {item.key === 'JAZZCASH' && <Smartphone className="h-4 w-4 text-red-400" />}
                      {item.key === 'EASYPAISA' && <Wallet className="h-4 w-4 text-emerald-400" />}
                      {item.key === 'RAAST' && <Smartphone className="h-4 w-4 text-purple-400" />}
                      {item.name}
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      PKR {item.total.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.key === 'BANK_TRANSFER'
                          ? 'bg-blue-500'
                          : item.key === 'JAZZCASH'
                          ? 'bg-red-500'
                          : item.key === 'EASYPAISA'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Assurance & Verification Guidelines */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Verification Compliance & SLA</h3>
              <p className="text-xs text-zinc-400">Security standards for manual subscription approvals.</p>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Cross-Check Statement:</strong>
                  Cross-verify the submitted Transaction ID and claimed amount against your Easypaisa/JazzCash/Bank account statement before clicking Approve.
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Missing Screenshot Protocol:</strong>
                  Use the WhatsApp Applicant button to prompt candidates if a screenshot is cropped, blurry, or missing transaction reference.
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Automatic Badge & Privileges:</strong>
                  Approving a payment automatically issues the blue verified ID badge and unlocks mutual contact privileges for the candidate.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ADD / EDIT RECEIVING ACCOUNT ================= */}
      {isAccountModalOpen && (
        <div
          onClick={() => setIsAccountModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl text-xs text-zinc-300"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold font-serif text-white">
                    {editingAccount ? 'Edit Receiving Account Details' : 'Add Official Receiving Account'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Displayed directly to applicants on registration & checkout forms.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              {/* Provider Type */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Account Provider Channel *
                </label>
                <select
                  value={accountForm.provider}
                  onChange={(e) => setAccountForm({ ...accountForm, provider: e.target.value as any })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="JAZZCASH">JazzCash Wallet / Merchant</option>
                  <option value="EASYPAISA">Easypaisa Mobile Account</option>
                  <option value="BANK_TRANSFER">Bank Account (IBFT / Meezan / HBL / Alfalah)</option>
                  <option value="RAAST">Raast Instant ID</option>
                  <option value="SADAPAY">SadaPay</option>
                  <option value="NAYAPAY">NayaPay</option>
                  <option value="OTHER">Other Gateway / Channel</option>
                </select>
              </div>

              {/* Bank / Provider Name */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Bank / Wallet Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.bankName}
                  onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  placeholder="e.g. Meezan Bank Ltd, JazzCash Merchant, HBL"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Account Title & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Account Title / Beneficiary *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.accountTitle}
                    onChange={(e) => setAccountForm({ ...accountForm, accountTitle: e.target.value })}
                    placeholder="Compatible Matrimonials"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Account / Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    placeholder="0300-1234567 or 0101-0103456789"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* IBAN (Optional) & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    IBAN (Optional for Banks)
                  </label>
                  <input
                    type="text"
                    value={accountForm.iban}
                    onChange={(e) => setAccountForm({ ...accountForm, iban: e.target.value.toUpperCase() })}
                    placeholder="PK36MEZN0001010103456789"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Branch Name & City (Optional)
                  </label>
                  <input
                    type="text"
                    value={accountForm.branchName}
                    onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                    placeholder="DHA Phase 5, Lahore"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Payment Instructions for Applicants
                </label>
                <textarea
                  rows={2}
                  value={accountForm.instructions}
                  onChange={(e) => setAccountForm({ ...accountForm, instructions: e.target.value })}
                  placeholder="e.g. Please transfer fee via Raast or IBFT and upload receipt."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountForm.isActive}
                    onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span className="text-xs font-semibold text-white">Active (Show in Registration)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountForm.isPrimary}
                    onChange={(e) => setAccountForm({ ...accountForm, isPrimary: e.target.checked })}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span className="text-xs font-semibold text-amber-400">Mark as Primary</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                >
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FULL SCREEN SLIP LIGHTBOX ================= */}
      {previewScreenshotUrl && (
        <div
          onClick={() => {
            setPreviewScreenshotUrl(null);
            setPreviewProof(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-zinc-900 p-4 shadow-2xl border border-zinc-800"
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-800 mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-400" /> Payment Slip Inspection
              </h3>
              <button
                onClick={() => {
                  setPreviewScreenshotUrl(null);
                  setPreviewProof(null);
                }}
                className="text-xs text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center max-h-[80vh] overflow-auto bg-zinc-950 rounded-2xl">
              <PaymentSlipDisplay
                proof={previewProof || undefined}
                screenshotUrl={previewScreenshotUrl}
                isFullView={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INVOICE & RECEIPT VIEW ================= */}
      {selectedInvoice && (
        <div
          onClick={() => setSelectedInvoice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-6 shadow-2xl text-xs text-zinc-300"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-white">Official Membership Invoice</h3>
                <p className="text-[11px] text-zinc-400">Invoice Ref: INV-{selectedInvoice.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-400">Applicant:</span>
                <strong className="text-white">{selectedInvoice.userName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="text-zinc-300">{selectedInvoice.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Phone:</span>
                <span className="font-mono text-zinc-300">{selectedInvoice.userPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Transaction ID:</span>
                <span className="font-mono font-bold text-amber-400">{selectedInvoice.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Gateway:</span>
                <span className="text-zinc-300">{selectedInvoice.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Status:</span>
                <span
                  className={`font-bold ${
                    selectedInvoice.status === 'VERIFIED'
                      ? 'text-emerald-400'
                      : selectedInvoice.status === 'PENDING'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex justify-between text-zinc-300">
                <span>{selectedInvoice.planName}</span>
                <span className="font-mono font-bold text-white">PKR {selectedInvoice.amount.toLocaleString()}</span>
              </div>
              <div className="border-t border-amber-500/20 pt-2 flex justify-between font-bold text-sm text-amber-400">
                <span>Total Amount</span>
                <span className="font-mono">PKR {selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: RECORD MANUAL PAYMENT ================= */}
      {isManualModalOpen && (
        <div
          onClick={() => setIsManualModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl text-xs text-zinc-300"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold font-serif text-white">Record Manual / Direct Payment</h3>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Applicant Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.userName}
                    onChange={(e) => setManualForm({ ...manualForm, userName: e.target.value })}
                    placeholder="e.g. Dr. Bilal Ahmed"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={manualForm.userEmail}
                    onChange={(e) => setManualForm({ ...manualForm, userEmail: e.target.value })}
                    placeholder="bilal@gmail.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={manualForm.userPhone}
                    onChange={(e) => setManualForm({ ...manualForm, userPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Package Tier *</label>
                  <select
                    value={manualForm.planSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const amounts: Record<string, number> = { BASIC: 0, PREMIUM: 15000, VIP: 35000 };
                      setManualForm({
                        ...manualForm,
                        planSlug: slug,
                        amount: amounts[slug] ?? 15000,
                      });
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PREMIUM">Elite Executive Plan (PKR 15,000)</option>
                    <option value="VIP">VIP Bespoke Matchmaking (PKR 35,000)</option>
                    <option value="BASIC">Basic Free Plan (PKR 0)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Payment Method</label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Direct Bank Transfer (Meezan/IBFT)</option>
                    <option value="JAZZCASH">JazzCash</option>
                    <option value="EASYPAISA">Easypaisa</option>
                    <option value="RAAST">Raast Instant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Transaction ID / Ref *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.transactionId}
                    onChange={(e) => setManualForm({ ...manualForm, transactionId: e.target.value })}
                    placeholder="e.g. TRX-99882211"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Sender Account (Optional)</label>
                  <input
                    type="text"
                    value={manualForm.senderAccountNumber}
                    onChange={(e) => setManualForm({ ...manualForm, senderAccountNumber: e.target.value })}
                    placeholder="0300-XXXXXXX"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-md"
                >
                  Record Payment & Upgrade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: REJECT REASON ================= */}
      {rejectingProofId && (
        <div
          onClick={() => setRejectingProofId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl text-xs text-zinc-300"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-white">Specify Rejection Reason</h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Please state why this transaction could not be verified (e.g. invalid Transaction ID, amount mismatch, or duplicate slip).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction ID not found in bank statement. Amount received differs from claimed package fee."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingProofId(null)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
