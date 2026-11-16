'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CreditCard,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  FileCheck,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { BureauRechargeRequest, MarriageBureau } from '@/lib/types';
import { toast } from 'sonner';

type AdminBureauTab = 'directory' | 'cnic' | 'recharges' | 'credits';

export default function AdminMarriageBureausPage() {
  const {
    bureaus,
    profiles,
    allRecharges,
    updateBureauStatus,
    adminCreateBureau,
    adminReviewCnic,
    adminReviewRecharge,
    adminAdjustBureauCredits,
    getDocumentSignedUrl,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminBureauTab>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  // Modals state
  const [selectedBureauClients, setSelectedBureauClients] = useState<MarriageBureau | null>(null);
  const [reviewBureau, setReviewBureau] = useState<{ bureau: MarriageBureau; targetStatus: 'REJECTED' | 'SUSPENDED' } | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  // CNIC inspection modal
  const [inspectCnicBureau, setInspectCnicBureau] = useState<MarriageBureau | null>(null);
  const [cnicFrontSignedUrl, setCnicFrontSignedUrl] = useState<string | null>(null);
  const [cnicBackSignedUrl, setCnicBackSignedUrl] = useState<string | null>(null);
  const [cnicRejectionNote, setCnicRejectionNote] = useState('');
  const [isProcessingCnic, setIsProcessingCnic] = useState(false);

  // Recharge inspection modal
  const [inspectRecharge, setInspectRecharge] = useState<BureauRechargeRequest | null>(null);
  const [receiptSignedUrl, setReceiptSignedUrl] = useState<string | null>(null);
  const [rechargeRejectionNote, setRechargeRejectionNote] = useState('');
  const [isProcessingRecharge, setIsProcessingRecharge] = useState(false);

  // Credit adjustment modal
  const [creditAdjustmentBureau, setCreditAdjustmentBureau] = useState<MarriageBureau | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(50);
  const [adjustmentDescription, setAdjustmentDescription] = useState('Administrative credit bonus');
  const [isProcessingCredits, setIsProcessingCredits] = useState(false);

  // Add bureau modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBureauForm, setNewBureauForm] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    country: 'Pakistan',
    city: 'Lahore',
    serviceCities: '',
    address: '',
    registrationNumber: '',
    specializations: '',
    description: '',
  });

  const allCities = useMemo(() => {
    const set = new Set<string>();
    for (const b of bureaus) {
      if (b.city) set.add(b.city);
    }
    return Array.from(set).sort();
  }, [bureaus]);

  const bureauClientsMap = useMemo(() => {
    const map = new Map<string, typeof profiles>();
    for (const p of profiles) {
      const bId = p.bureauId || p.assignedConsultantId;
      if (!bId) continue;
      const list = map.get(bId) ?? [];
      list.push(p);
      map.set(bId, list);
    }
    return map;
  }, [profiles]);

  const filteredBureaus = useMemo(() => {
    return bureaus.filter((b) => {
      if (statusFilter !== 'ALL' && b.approvalStatus !== statusFilter) return false;
      if (cityFilter !== 'ALL' && b.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${b.name} ${b.ownerName} ${b.bureauCode} ${b.city} ${b.email} ${b.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bureaus, statusFilter, cityFilter, searchQuery]);

  const pendingCnicCount = bureaus.filter((b) => b.cnicVerificationStatus === 'PENDING_VERIFICATION').length;
  const pendingRechargesCount = (allRecharges || []).filter((r) => r.status === 'PENDING').length;
  const totalPending = bureaus.filter((b) => b.approvalStatus === 'PENDING').length;
  const totalApproved = bureaus.filter((b) => b.approvalStatus === 'APPROVED').length;


  const handleAddBureau = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const ok = await adminCreateBureau(newBureauForm);
    setIsCreating(false);
    if (ok) {
      setShowAddModal(false);
      setNewBureauForm({
        name: '',
        ownerName: '',
        email: '',
        password: '',
        phone: '',
        whatsappNumber: '',
        country: 'Pakistan',
        city: 'Lahore',
        serviceCities: '',
        address: '',
        registrationNumber: '',
        specializations: '',
        description: '',
      });
    }
  };

  const handleConfirmRejectOrSuspend = async () => {
    if (!reviewBureau) return;
    await updateBureauStatus(reviewBureau.bureau.id, reviewBureau.targetStatus, reviewerNote);
    setReviewBureau(null);
    setReviewerNote('');
  };

  const handleOpenCnicInspector = async (bureau: MarriageBureau) => {
    setInspectCnicBureau(bureau);
    setCnicFrontSignedUrl(null);
    setCnicBackSignedUrl(null);
    setCnicRejectionNote('');
    if (bureau.cnicFrontKey) {
      const fUrl = await getDocumentSignedUrl(bureau.cnicFrontKey, 'verification-documents');
      if (fUrl) setCnicFrontSignedUrl(fUrl);
    }
    if (bureau.cnicBackKey) {
      const bUrl = await getDocumentSignedUrl(bureau.cnicBackKey, 'verification-documents');
      if (bUrl) setCnicBackSignedUrl(bUrl);
    }
  };

  const handleReviewCnicDecision = async (decision: 'VERIFIED' | 'REJECTED') => {
    if (!inspectCnicBureau) return;
    if (decision === 'REJECTED' && !cnicRejectionNote.trim()) {
      toast.error('Please specify a rejection reason for the bureau owner.');
      return;
    }
    setIsProcessingCnic(true);
    await adminReviewCnic(inspectCnicBureau.id, decision, cnicRejectionNote.trim() || undefined);
    setIsProcessingCnic(false);
    setInspectCnicBureau(null);
  };

  const handleOpenRechargeInspector = async (recharge: BureauRechargeRequest) => {
    setInspectRecharge(recharge);
    setReceiptSignedUrl(null);
    setRechargeRejectionNote('');
    if (recharge.receiptKey) {
      const url = await getDocumentSignedUrl(recharge.receiptKey, 'payment-evidence');
      if (url) setReceiptSignedUrl(url);
    }
  };

  const handleReviewRechargeDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!inspectRecharge) return;
    if (decision === 'REJECTED' && !rechargeRejectionNote.trim()) {
      toast.error('Please specify why this recharge receipt is rejected.');
      return;
    }
    setIsProcessingRecharge(true);
    await adminReviewRecharge(inspectRecharge.id, decision, rechargeRejectionNote.trim() || undefined);
    setIsProcessingRecharge(false);
    setInspectRecharge(null);
  };

  const handleApplyCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAdjustmentBureau) return;
    if (adjustmentAmount === 0) {
      toast.error('Credit adjustment amount must be non-zero.');
      return;
    }
    setIsProcessingCredits(true);
    await adminAdjustBureauCredits(
      creditAdjustmentBureau.id,
      adjustmentAmount,
      adjustmentDescription.trim() || undefined,
    );
    setIsProcessingCredits(false);
    setCreditAdjustmentBureau(null);
  };

  const modalClients = selectedBureauClients ? bureauClientsMap.get(selectedBureauClients.id) ?? [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" /> Marriage Bureaus Administration
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Verify Daftar credentials, review CNIC documents, approve package recharges, and allocate matchmaking credits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition"
          >
            <CreditCard className="h-4 w-4" /> Edit Package Prices
          </Link>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Approved Bureau
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-[11px] font-semibold text-zinc-400">Total Bureaus</div>
          <div className="mt-1 text-2xl font-bold text-white">{bureaus.length}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-[11px] font-semibold text-amber-300">Pending CNIC Verifications</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{pendingCnicCount}</div>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="text-[11px] font-semibold text-blue-300">Pending Package Recharges</div>
          <div className="mt-1 text-2xl font-bold text-blue-400">{pendingRechargesCount}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-[11px] font-semibold text-emerald-300">Approved & Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{totalApproved}</div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            activeTab === 'directory'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Building2 className="h-4 w-4" /> Bureau Directory ({bureaus.length})
        </button>

        <button
          onClick={() => setActiveTab('cnic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            activeTab === 'cnic'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <FileCheck className="h-4 w-4" /> CNIC Verifications
          {pendingCnicCount > 0 && (
            <span className="rounded-full bg-rose-500 text-white px-2 py-0.2 text-[10px] font-mono">
              {pendingCnicCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('recharges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            activeTab === 'recharges'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CreditCard className="h-4 w-4" /> Package Recharges
          {pendingRechargesCount > 0 && (
            <span className="rounded-full bg-blue-500 text-white px-2 py-0.2 text-[10px] font-mono">
              {pendingRechargesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            activeTab === 'credits'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <DollarSign className="h-4 w-4" /> Bureau Credits Ledger
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: BUREAU DIRECTORY */}
      {/* ================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bureau name, code, city, or owner..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Cities ({allCities.length})</option>
              {allCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review ({totalPending})</option>
              <option value="APPROVED">Approved & Active ({totalApproved})</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBureaus.map((bureau) => {
              const clients = bureauClientsMap.get(bureau.id) ?? [];
              const clientCount = Math.max(bureau.clientCount ?? 0, clients.length);
              return (
                <div
                  key={bureau.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                          {bureau.bureauCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            bureau.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : bureau.approvalStatus === 'PENDING'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {bureau.approvalStatus}
                        </span>
                        {bureau.cnicVerificationStatus === 'VERIFIED' && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck className="h-3 w-3" /> CNIC Verified
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-white mt-1.5">{bureau.name}</h3>
                      <p className="text-xs text-zinc-400">Owner: {bureau.ownerName}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs font-mono font-bold text-amber-400">
                        {bureau.creditsRemaining ?? 0} Credits
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Completion: {bureau.profileCompletionPercentage ?? 50}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 rounded-xl bg-zinc-950 p-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{bureau.city}, {bureau.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono truncate">{bureau.phone}</span>
                    </div>
                    <div className="col-span-2 text-zinc-400 text-[11px] truncate">
                      Address: {bureau.address}
                    </div>
                  </div>

                  {bureau.reviewerNotes && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl">
                      <strong>Admin Note:</strong> {bureau.reviewerNotes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBureauClients(bureau)}
                      className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                    >
                      <Users className="h-3.5 w-3.5 inline mr-1 text-amber-400" />
                      View Clients ({clientCount})
                    </button>

                    <div className="flex items-center gap-1.5">
                      {bureau.approvalStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => updateBureauStatus(bureau.id, 'APPROVED')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                        >
                          Approve Bureau
                        </button>
                      )}
                      {bureau.approvalStatus !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => setReviewBureau({ bureau, targetStatus: 'REJECTED' })}
                          className="rounded-xl border border-rose-800/50 bg-rose-950/30 hover:bg-rose-950/60 px-2.5 py-1.5 text-xs font-semibold text-rose-300"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: CNIC VERIFICATIONS QUEUE (Requirement 3) */}
      {/* ================================================================= */}
      {activeTab === 'cnic' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-bold text-white font-serif">CNIC Identity Verification Queue</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review National Identity Card front and back documents submitted by Marriage Bureau owners. Documents are served through short-lived signed URLs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Bureau / Office</th>
                  <th className="py-3 px-4 font-semibold">Owner Name</th>
                  <th className="py-3 px-4 font-semibold">CNIC Number</th>
                  <th className="py-3 px-4 font-semibold">Documents Status</th>
                  <th className="py-3 px-4 font-semibold">Verification Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {bureaus.map((bureau) => {
                  const hasCnic = Boolean(bureau.cnicNumber && bureau.cnicFrontKey && bureau.cnicBackKey);
                  return (
                    <tr key={bureau.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{bureau.name}</div>
                        <span className="text-[10px] font-mono text-zinc-500">{bureau.bureauCode} • {bureau.city}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{bureau.ownerName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {bureau.cnicNumber || 'Not Provided'}
                      </td>
                      <td className="py-3 px-4">
                        {hasCnic ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ Front & Back Uploaded</span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Incomplete Uploads</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            bureau.cnicVerificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : bureau.cnicVerificationStatus === 'PENDING_VERIFICATION'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : bureau.cnicVerificationStatus === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {bureau.cnicVerificationStatus || 'NOT_SUBMITTED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCnicInspector(bureau)}
                          disabled={!hasCnic}
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-sm disabled:opacity-40"
                        >
                          Inspect CNIC
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: PACKAGE RECHARGE REQUESTS (Requirement 4) */}
      {/* ================================================================= */}
      {activeTab === 'recharges' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-bold text-white font-serif">Bureau Package Recharge Requests</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and approve package subscription recharges submitted by Marriage Bureaus. Approving automatically allocates connection credits and extends subscription validity.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Bureau Office</th>
                  <th className="py-3 px-4 font-semibold">Package / Amount</th>
                  <th className="py-3 px-4 font-semibold">Method & Sender</th>
                  <th className="py-3 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(allRecharges || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No recharge requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  allRecharges.map((recharge) => (
                    <tr key={recharge.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {recharge.bureauName || recharge.bureauId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{recharge.planName}</div>
                        <span className="font-mono text-amber-400">Rs. {recharge.amountPKR} (+{recharge.creditsAllocated || 50} cr)</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        <div className="font-semibold">{recharge.paymentMethod}</div>
                        <span className="text-[11px] text-zinc-400">{recharge.senderName} ({recharge.senderAccount})</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-200">
                        {recharge.transactionId}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(recharge.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            recharge.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : recharge.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {recharge.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenRechargeInspector(recharge)}
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-sm"
                        >
                          Inspect Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: BUREAU CREDITS MANAGEMENT */}
      {/* ================================================================= */}
      {activeTab === 'credits' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white font-serif">Bureau Credits & Balances</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manually adjust credits, allocate promotional top-ups, or audit usage balances per Marriage Bureau.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Bureau Name</th>
                  <th className="py-3 px-4 font-semibold">Code / City</th>
                  <th className="py-3 px-4 font-semibold">Total Purchased</th>
                  <th className="py-3 px-4 font-semibold">Credits Used</th>
                  <th className="py-3 px-4 font-semibold">Remaining Balance</th>
                  <th className="py-3 px-4 font-semibold text-right">Adjust Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {bureaus.map((bureau) => (
                  <tr key={bureau.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{bureau.name}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{bureau.bureauCode} • {bureau.city}</td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{bureau.creditsTotal ?? 0}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{bureau.creditsUsed ?? 0}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">
                      {bureau.creditsRemaining ?? 0} Credits
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCreditAdjustmentBureau(bureau);
                          setAdjustmentAmount(50);
                          setAdjustmentDescription('Administrative bonus credits');
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-amber-400"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: CNIC INSPECTION MODAL */}
      {/* ================================================================= */}
      {inspectCnicBureau && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  CNIC Identity Inspection: {inspectCnicBureau.name}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Owner: {inspectCnicBureau.ownerName} • CNIC: {inspectCnicBureau.cnicNumber}
                </span>
              </div>
              <button onClick={() => setInspectCnicBureau(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-center">
                <span className="text-xs font-bold text-zinc-300 block">CNIC Front Document</span>
                {cnicFrontSignedUrl ? (
                  <img
                    src={cnicFrontSignedUrl}
                    alt="CNIC Front"
                    className="h-44 w-full object-contain rounded-xl border border-zinc-800 bg-zinc-900"
                  />
                ) : (
                  <div className="h-44 flex items-center justify-center text-xs text-zinc-500">
                    Generating signed document preview...
                  </div>
                )}
                {cnicFrontSignedUrl && (
                  <a
                    href={cnicFrontSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                  >
                    Open Full Size <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-center">
                <span className="text-xs font-bold text-zinc-300 block">CNIC Back Document</span>
                {cnicBackSignedUrl ? (
                  <img
                    src={cnicBackSignedUrl}
                    alt="CNIC Back"
                    className="h-44 w-full object-contain rounded-xl border border-zinc-800 bg-zinc-900"
                  />
                ) : (
                  <div className="h-44 flex items-center justify-center text-xs text-zinc-500">
                    Generating signed document preview...
                  </div>
                )}
                {cnicBackSignedUrl && (
                  <a
                    href={cnicBackSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                  >
                    Open Full Size <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Rejection Note input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                Rejection Note (required only if rejecting identity)
              </label>
              <input
                type="text"
                placeholder="e.g. CNIC photo blurry or expired. Please upload high-resolution scan."
                value={cnicRejectionNote}
                onChange={(e) => setCnicRejectionNote(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectCnicBureau(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewCnicDecision('REJECTED')}
                  disabled={isProcessingCnic}
                  className="rounded-xl border border-rose-800 bg-rose-950/40 hover:bg-rose-950 px-4 py-2 text-xs font-bold text-rose-300 disabled:opacity-50"
                >
                  Reject Identity
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewCnicDecision('VERIFIED')}
                  disabled={isProcessingCnic}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow disabled:opacity-50"
                >
                  {isProcessingCnic ? 'Verifying...' : 'Approve & Mark Verified'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: RECHARGE INSPECTION MODAL */}
      {/* ================================================================= */}
      {inspectRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Package Recharge: {inspectRecharge.planName}
                </h3>
                <span className="text-xs text-amber-400 font-mono">
                  Rs. {inspectRecharge.amountPKR} • Bureau: {inspectRecharge.bureauName}
                </span>
              </div>
              <button onClick={() => setInspectRecharge(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-400 block text-[10px]">Payment Method</span>
                <strong className="text-white font-semibold">{inspectRecharge.paymentMethod}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Transaction ID</span>
                <strong className="text-amber-400 font-mono font-bold">{inspectRecharge.transactionId}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Sender Name</span>
                <strong className="text-white">{inspectRecharge.senderName}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Sender Account / Wallet</span>
                <strong className="text-white font-mono">{inspectRecharge.senderAccount}</strong>
              </div>
              {inspectRecharge.notes && (
                <div className="col-span-2 pt-1 border-t border-zinc-800 text-zinc-300">
                  <span className="text-zinc-400 block text-[10px]">Bureau Notes:</span>
                  {inspectRecharge.notes}
                </div>
              )}
            </div>

            {/* Receipt Preview */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-center">
              <span className="text-xs font-bold text-zinc-300 block">Payment Screenshot / Receipt</span>
              {receiptSignedUrl ? (
                <img
                  src={receiptSignedUrl}
                  alt="Receipt Preview"
                  className="h-48 w-full object-contain rounded-xl border border-zinc-800 bg-zinc-900"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-zinc-500">
                  Generating signed receipt preview...
                </div>
              )}
              {receiptSignedUrl && (
                <a
                  href={receiptSignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                >
                  Open Full Size <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Rejection Note */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                Rejection Note (required only if rejecting receipt)
              </label>
              <input
                type="text"
                placeholder="e.g. Transaction ID not found in bank statement."
                value={rechargeRejectionNote}
                onChange={(e) => setRechargeRejectionNote(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectRecharge(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewRechargeDecision('REJECTED')}
                  disabled={isProcessingRecharge}
                  className="rounded-xl border border-rose-800 bg-rose-950/40 hover:bg-rose-950 px-4 py-2 text-xs font-bold text-rose-300 disabled:opacity-50"
                >
                  Reject Recharge
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewRechargeDecision('APPROVED')}
                  disabled={isProcessingRecharge}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow disabled:opacity-50"
                >
                  {isProcessingRecharge ? 'Approving...' : 'Approve & Allocate Credits'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: CREDIT ADJUSTMENT MODAL */}
      {/* ================================================================= */}
      {creditAdjustmentBureau && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleApplyCreditAdjustment}
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif font-bold text-base text-white">
                Adjust Credits: {creditAdjustmentBureau.name}
              </h3>
              <button onClick={() => setCreditAdjustmentBureau(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-zinc-950 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Current Remaining:</span>
                <strong className="text-amber-400 font-mono">{creditAdjustmentBureau.creditsRemaining ?? 0} Credits</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Lifetime Purchased:</span>
                <strong className="text-white font-mono">{creditAdjustmentBureau.creditsTotal ?? 0} Credits</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Adjustment Amount (positive to add, negative to deduct)
              </label>
              <input
                type="number"
                required
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Reason / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Promotional campaign bonus"
                value={adjustmentDescription}
                onChange={(e) => setAdjustmentDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreditAdjustmentBureau(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingCredits}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow disabled:opacity-50"
              >
                {isProcessingCredits ? 'Applying...' : 'Apply Credit Adjustment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: BUREAU CLIENTS MODAL */}
      {/* ================================================================= */}
      {selectedBureauClients && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Clients of {selectedBureauClients.name}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedBureauClients.bureauCode} • {selectedBureauClients.city}
                </span>
              </div>
              <button onClick={() => setSelectedBureauClients(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {modalClients.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No registered clients associated with this bureau yet.
                </div>
              ) : (
                modalClients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{client.fullName}</h4>
                      <p className="text-zinc-400 text-[11px]">
                        {client.gender} • {client.age} yrs • {client.city} • Code: {client.profileIdCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                        {client.approvalStatus}
                      </span>
                      <Link
                        href={`/profile/${client.id}`}
                        className="rounded-lg border border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-800"
                      >
                        Dossier
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBureauClients(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 5: ADD APPROVED BUREAU MODAL */}
      {/* ================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddBureau}
            className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif font-bold text-base text-white">
                Add Approved Marriage Bureau
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-zinc-300 block mb-1">Bureau / Daftar Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Marriage Bureau"
                  value={newBureauForm.name}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Owner / In-Charge Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Muhammad Tariq"
                  value={newBureauForm.ownerName}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, ownerName: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="bureau@example.pk"
                  value={newBureauForm.email}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Owner Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Set owner login password"
                  value={newBureauForm.password}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Official Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  value={newBureauForm.phone}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <CountryCitySelect
                  selectedCountry={newBureauForm.country}
                  selectedCity={newBureauForm.city}
                  onCountryChange={(val) => setNewBureauForm({ ...newBureauForm, country: val })}
                  onCityChange={(val) => setNewBureauForm({ ...newBureauForm, city: val })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-zinc-300 block mb-1">Office Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Full office suite / street address"
                  value={newBureauForm.address}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, address: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Registration / License No.</label>
                <input
                  type="text"
                  placeholder="REG-2026-99"
                  value={newBureauForm.registrationNumber}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, registrationNumber: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Service Cities</label>
                <input
                  type="text"
                  placeholder="Lahore, Sheikhupura..."
                  value={newBureauForm.serviceCities}
                  onChange={(e) => setNewBureauForm({ ...newBureauForm, serviceCities: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create & Approve Bureau'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 6: REJECT / SUSPEND PROMPT MODAL */}
      {/* ================================================================= */}
      {reviewBureau && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-white">
              {reviewBureau.targetStatus === 'REJECTED' ? 'Reject Marriage Bureau' : 'Suspend Bureau'}
            </h3>
            <p className="text-xs text-zinc-400">
              Provide feedback for {reviewBureau.bureau.name}. This note will be sent as a notification to the bureau owner.
            </p>

            <textarea
              rows={3}
              placeholder="Specify the reason for rejection or suspension..."
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white focus:outline-none resize-none"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setReviewBureau(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectOrSuspend}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow"
              >
                Confirm {reviewBureau.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
