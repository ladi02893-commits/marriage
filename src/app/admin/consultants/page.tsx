'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
  Ban,
} from 'lucide-react';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { MarriageBureau } from '@/lib/types';

export default function AdminMarriageBureausPage() {
  const { bureaus, profiles, updateBureauStatus, adminCreateBureau } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  const [selectedBureauClients, setSelectedBureauClients] = useState<MarriageBureau | null>(null);
  const [reviewBureau, setReviewBureau] = useState<{ bureau: MarriageBureau; targetStatus: 'REJECTED' | 'SUSPENDED' } | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

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

  const totalPending = bureaus.filter((b) => b.approvalStatus === 'PENDING').length;
  const totalApproved = bureaus.filter((b) => b.approvalStatus === 'APPROVED').length;
  const totalClientsCount = bureaus.reduce(
    (sum, b) => sum + Math.max(b.clientCount ?? 0, bureauClientsMap.get(b.id)?.length ?? 0),
    0,
  );

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

  const modalClients = selectedBureauClients ? bureauClientsMap.get(selectedBureauClients.id) ?? [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" /> Marriage Bureaus (Daftars) Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Approve self-registered Marriage Bureaus, inspect city distribution, or onboard an official bureau office.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Approved Bureau
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-[11px] font-semibold text-zinc-400">Total Bureaus</div>
          <div className="mt-1 text-2xl font-bold text-white">{bureaus.length}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-[11px] font-semibold text-amber-300">Pending Bureau Approvals</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{totalPending}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-[11px] font-semibold text-emerald-300">Approved & Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{totalApproved}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-[11px] font-semibold text-zinc-400">Linked Bureau Clients</div>
          <div className="mt-1 text-2xl font-bold text-white">{totalClientsCount}</div>
        </div>
      </div>

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
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="ALL">All Cities</option>
          {allCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="ALL">All Approval Statuses</option>
          <option value="PENDING">Pending Approval ({totalPending})</option>
          <option value="APPROVED">Approved ({totalApproved})</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Bureaus Grid */}
      {filteredBureaus.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-400 text-xs">
          No Marriage Bureaus match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBureaus.map((bureau) => {
            const linkedClients = Math.max(bureau.clientCount ?? 0, bureauClientsMap.get(bureau.id)?.length ?? 0);
            return (
              <div
                key={bureau.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-400">{bureau.bureauCode}</span>
                        {bureau.registrationNumber && (
                          <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                            Reg: {bureau.registrationNumber}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{bureau.name}</h3>
                      <p className="text-xs text-zinc-400">Owner / Head: {bureau.ownerName}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        bureau.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : bureau.approvalStatus === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {bureau.approvalStatus === 'PENDING' && <Clock className="h-3 w-3" />}
                      {bureau.approvalStatus === 'APPROVED' && <ShieldCheck className="h-3 w-3" />}
                      {bureau.approvalStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>{bureau.city}, {bureau.country}</strong> — {bureau.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3" /> {bureau.phone}
                      </span>
                      <span>{bureau.email}</span>
                    </div>
                    {bureau.serviceCities && bureau.serviceCities.length > 0 && (
                      <div className="text-[11px] text-zinc-400">
                        Service Cities: {bureau.serviceCities.join(', ')}
                      </div>
                    )}
                    {bureau.reviewerNotes && (
                      <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-400">
                        Admin Note: {bureau.reviewerNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBureauClients(bureau)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                  >
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    {linkedClients} Client(s)
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {bureau.approvalStatus !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => void updateBureauStatus(bureau.id, 'APPROVED')}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve Bureau
                      </button>
                    )}

                    {bureau.approvalStatus === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewBureau({ bureau, targetStatus: 'REJECTED' });
                          setReviewerNote('');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}

                    {bureau.approvalStatus === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewBureau({ bureau, targetStatus: 'SUSPENDED' });
                          setReviewerNote('');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Approved Bureau Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleAddBureau}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold font-serif">Onboard Approved Marriage Bureau</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Bureau Name *</label>
                <input
                  required
                  value={newBureauForm.name}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Owner Name *</label>
                <input
                  required
                  value={newBureauForm.ownerName}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={newBureauForm.email}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Portal Password (Optional, Min 8 chars)</label>
                <input
                  type="password"
                  value={newBureauForm.password}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Creates Bureau Login if provided"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Phone *</label>
                <input
                  required
                  value={newBureauForm.phone}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Registration #</label>
                <input
                  value={newBureauForm.registrationNumber}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, registrationNumber: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
            </div>

            <CountryCitySelect
              selectedCountry={newBureauForm.country}
              selectedCity={newBureauForm.city}
              onCountryChange={(c) => setNewBureauForm((p) => ({ ...p, country: c }))}
              onCityChange={(ct) => setNewBureauForm((p) => ({ ...p, city: ct }))}
              countryClassName="bg-zinc-950 border-zinc-800 text-white"
              cityClassName="bg-zinc-950 border-zinc-800 text-white"
              labelClassName="text-zinc-400"
            />

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Office Address *</label>
                <input
                  required
                  value={newBureauForm.address}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Additional Cities Served (comma separated)</label>
                <input
                  value={newBureauForm.serviceCities}
                  onChange={(e) => setNewBureauForm((p) => ({ ...p, serviceCities: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Approved Bureau'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject / Suspend Confirmation Modal */}
      {reviewBureau && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 text-white">
            <h3 className="text-base font-bold">
              {reviewBureau.targetStatus === 'REJECTED' ? 'Reject Marriage Bureau' : 'Suspend Marriage Bureau'}
            </h3>
            <p className="text-xs text-zinc-400">
              Bureau: <strong className="text-white">{reviewBureau.bureau.name}</strong> ({reviewBureau.bureau.city})
            </p>
            <textarea
              rows={3}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Optional reason or instructions sent to the bureau owner..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewBureau(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmRejectOrSuspend()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
              >
                Confirm {reviewBureau.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Bureau Clients Modal */}
      {selectedBureauClients && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold">{selectedBureauClients.name} — Client Roster</h3>
                <p className="text-xs text-zinc-400">{modalClients.length} client profile(s) registered under this bureau</p>
              </div>
              <button type="button" onClick={() => setSelectedBureauClients(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalClients.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-400">
                No clients registered under this bureau yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {modalClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {client.fullName}{' '}
                        <span className="font-mono text-[10px] text-amber-400">({client.profileIdCode})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {client.gender} • {client.age} yrs • {client.city} •{' '}
                        {client.createdByBureau ? 'Added by Bureau' : 'Self-Registered'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold">
                        {client.approvalStatus}
                      </span>
                      <Link
                        href={`/profile/${client.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-black"
                      >
                        <Eye className="h-3 w-3" /> View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
