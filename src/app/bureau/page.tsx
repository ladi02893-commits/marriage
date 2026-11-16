'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  Globe,
  MapPin,
  MessageCircle,
  PlusCircle,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { ProfileCard } from '@/components/profile/profile-card';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type BureauTab = 'clients' | 'add-client' | 'explore' | 'settings';

export default function MarriageBureauPortalPage() {
  const {
    currentUser,
    ownBureau,
    profiles,
    createBureauClient,
    approveBureauClientProfile,
    updateBureauProfile,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<BureauTab>('clients');
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('ALL');

  // Rishta Explorer filters
  const [exploreScope, setExploreScope] = useState<'ALL_PLATFORM' | 'MY_BUREAU'>('ALL_PLATFORM');
  const [exploreGender, setExploreGender] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [exploreCity, setExploreCity] = useState('');

  // Add client form
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    country: ownBureau?.country || 'Pakistan',
    city: ownBureau?.city || 'Lahore',
    maritalStatus: 'NEVER_MARRIED',
    religion: 'ISLAM',
    caste: 'Syed',
    highestDegree: "Bachelor's Degree",
    profession: '',
    height: '5 ft 4 in (162 cm)',
    familyType: 'NUCLEAR',
    fatherOccupation: '',
    bioHeadline: '',
    aboutMe: '',
  });

  // Bureau settings form
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    name: ownBureau?.name || '',
    ownerName: ownBureau?.ownerName || '',
    phone: ownBureau?.phone || '',
    whatsappNumber: ownBureau?.whatsappNumber || '',
    address: ownBureau?.address || '',
    serviceCities: (ownBureau?.serviceCities ?? []).join(', '),
    specializations: (ownBureau?.specializations ?? []).join(', '),
    description: ownBureau?.description || '',
    rishtaScope: ownBureau?.rishtaScope || 'ALL_PLATFORM',
  });

  React.useEffect(() => {
    if (ownBureau) {
      setOfficeForm({
        name: ownBureau.name,
        ownerName: ownBureau.ownerName,
        phone: ownBureau.phone,
        whatsappNumber: ownBureau.whatsappNumber || ownBureau.phone,
        address: ownBureau.address,
        serviceCities: (ownBureau.serviceCities ?? []).join(', '),
        specializations: (ownBureau.specializations ?? []).join(', '),
        description: ownBureau.description || '',
        rishtaScope: ownBureau.rishtaScope || 'ALL_PLATFORM',
      });
      setClientForm((prev) => ({
        ...prev,
        country: prev.country || ownBureau.country,
        city: prev.city || ownBureau.city,
      }));
    }
  }, [ownBureau]);

  const ownClients = useMemo(() => {
    if (!ownBureau) return [];
    return profiles.filter((p) => p.bureauId === ownBureau.id || p.assignedConsultantId === ownBureau.id);
  }, [profiles, ownBureau]);

  const filteredClients = useMemo(() => {
    return ownClients.filter((p) => {
      if (clientStatusFilter !== 'ALL' && p.approvalStatus !== clientStatusFilter) return false;
      if (clientSearch.trim()) {
        const q = clientSearch.trim().toLowerCase();
        const hay = `${p.fullName} ${p.displayName} ${p.city} ${p.profileIdCode || ''} ${p.educationCareer?.profession || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ownClients, clientSearch, clientStatusFilter]);

  const explorerProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (p.approvalStatus !== 'APPROVED') return false;
      if (exploreScope === 'MY_BUREAU' && ownBureau && p.bureauId !== ownBureau.id) return false;
      if (exploreGender !== 'ALL' && p.gender !== exploreGender) return false;
      if (exploreCity.trim() && !(p.city || '').toLowerCase().includes(exploreCity.trim().toLowerCase())) return false;
      return true;
    });
  }, [profiles, exploreScope, ownBureau, exploreGender, exploreCity]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownBureau || ownBureau.approvalStatus !== 'APPROVED') {
      toast.error('Your Marriage Bureau must be approved by an Administrator first.');
      return;
    }
    if (!clientForm.fullName.trim() || !clientForm.dateOfBirth || !clientForm.country || !clientForm.city) {
      toast.error('Please enter client full name, date of birth, country, and city.');
      return;
    }
    setIsCreatingClient(true);
    const ok = await createBureauClient({
      ...clientForm,
      bureauId: ownBureau.id,
    });
    setIsCreatingClient(false);
    if (ok) {
      setClientForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        whatsappNumber: '',
        gender: 'FEMALE',
        dateOfBirth: '',
        country: ownBureau.country || 'Pakistan',
        city: ownBureau.city || 'Lahore',
        maritalStatus: 'NEVER_MARRIED',
        religion: 'ISLAM',
        caste: 'Syed',
        highestDegree: "Bachelor's Degree",
        profession: '',
        height: '5 ft 4 in (162 cm)',
        familyType: 'NUCLEAR',
        fatherOccupation: '',
        bioHeadline: '',
        aboutMe: '',
      });
      setActiveTab('clients');
    }
  };

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownBureau) return;
    setSettingsSaving(true);
    await updateBureauProfile(ownBureau.id, {
      name: officeForm.name,
      ownerName: officeForm.ownerName,
      phone: officeForm.phone,
      whatsappNumber: officeForm.whatsappNumber,
      address: officeForm.address,
      serviceCities: officeForm.serviceCities.split(',').map((s) => s.trim()).filter(Boolean),
      specializations: officeForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
      description: officeForm.description,
      rishtaScope: officeForm.rishtaScope === 'BUREAU_PRIORITY' ? 'BUREAU_PRIORITY' : 'ALL_PLATFORM',
    });
    setSettingsSaving(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <Building2 className="mx-auto h-10 w-10 text-brand-600" />
            <h1 className="text-xl font-bold font-serif">Marriage Bureau Portal</h1>
            <p className="text-xs text-muted-foreground">Please sign in with your Marriage Bureau account or register your Daftar office.</p>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login?returnTo=/bureau" className="rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white">
                Sign In to Bureau Portal
              </Link>
              <Link href="/register/bureau" className="rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted">
                Register New Marriage Bureau
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.role === 'USER') {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="text-xl font-bold font-serif">Bureau Owner Access Only</h1>
            <p className="text-xs text-muted-foreground">
              You are signed in as a Member. Visit your Member Dashboard to view your selected Marriage Bureau.
            </p>
            <Link href="/dashboard/consultant" className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white">
              Go to My Marriage Bureau
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role) && !ownBureau) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <Crown className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="text-xl font-bold font-serif">Administrator Control</h1>
            <p className="text-xs text-muted-foreground">
              Approve, suspend, and inspect all registered Marriage Bureaus from the Admin Control Room.
            </p>
            <Link href="/admin/consultants" className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white">
              Open Admin Marriage Bureaus
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isApproved = ownBureau?.approvalStatus === 'APPROVED';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Bureau Header Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-3 py-0.5 text-[11px] font-bold">
                <Building2 className="h-3.5 w-3.5" /> {ownBureau?.bureauCode || 'MB-OFFICE'}
              </span>
              {ownBureau?.approvalStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-0.5 text-[11px] font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin Approved Bureau
                </span>
              )}
              {ownBureau?.approvalStatus === 'PENDING' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-0.5 text-[11px] font-bold">
                  <Clock className="h-3.5 w-3.5" /> Pending Admin Approval
                </span>
              )}
              {(ownBureau?.approvalStatus === 'REJECTED' || ownBureau?.approvalStatus === 'SUSPENDED') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-3 py-0.5 text-[11px] font-bold">
                  <XCircle className="h-3.5 w-3.5" /> {ownBureau.approvalStatus}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
              {ownBureau?.name || currentUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                {ownBureau ? `${ownBureau.address}, ${ownBureau.city}, ${ownBureau.country}` : 'Office Details'}
              </span>
              {ownBureau?.ownerName && <span>In-Charge: <strong className="text-foreground">{ownBureau.ownerName}</strong></span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('add-client')}
              disabled={!isApproved}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" /> Add Walk-in Client
            </button>
          </div>
        </div>

        {/* Status Alert if Pending or Suspended */}
        {ownBureau && ownBureau.approvalStatus !== 'APPROVED' && (
          <div className={`rounded-2xl border p-4 text-xs flex items-start gap-3 ${
            ownBureau.approvalStatus === 'PENDING'
              ? 'border-amber-300 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
              : 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
          }`}>
            <Clock className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {ownBureau.approvalStatus === 'PENDING'
                  ? 'Your Marriage Bureau registration is under Administrator review.'
                  : `Your Marriage Bureau status is currently ${ownBureau.approvalStatus}.`}
              </div>
              <p className="mt-1 opacity-90">
                {ownBureau.approvalStatus === 'PENDING'
                  ? `Once an Administrator approves your office, "${ownBureau.name}" will appear in ${ownBureau.city}'s user signup dropdown and you can add/approve client profiles.`
                  : ownBureau.reviewerNotes || 'Please contact platform support for review details.'}
              </p>
            </div>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold text-muted-foreground">Total Bureau Clients</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{ownClients.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold text-muted-foreground">Pending Approvals</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">
              {ownClients.filter((p) => p.approvalStatus !== 'APPROVED').length}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold text-muted-foreground">Joined via City Signup</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              {ownClients.filter((p) => !p.createdByBureau).length}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold text-muted-foreground">Walk-In Clients Added</div>
            <div className="mt-1 text-2xl font-bold text-brand-600">
              {ownClients.filter((p) => p.createdByBureau).length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: 'clients', label: `My Bureau Clients (${ownClients.length})`, icon: Users },
            { id: 'add-client', label: 'Add Walk-in Client', icon: PlusCircle },
            { id: 'explore', label: 'Rishta Explorer (All vs Bureau)', icon: Globe },
            { id: 'settings', label: 'Office Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as BureauTab)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: My Bureau Clients */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search clients by name, ID, profession, or city..."
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved & Live</option>
                <option value="CHANGES_REQUESTED">Changes Requested</option>
              </select>
            </div>

            {filteredClients.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="text-base font-bold text-foreground">No clients under your bureau yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Users registering in {ownBureau?.city || 'your city'} who pick your bureau appear here automatically, or you can add walk-in clients directly.
                </p>
                {isApproved && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('add-client')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white"
                  >
                    <UserPlus className="h-4 w-4" /> Add Your First Client
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-[10px] font-bold text-gold-700 dark:text-gold-400">
                            {client.profileIdCode || client.id}
                          </div>
                          <h4 className="font-bold text-sm text-foreground">{client.fullName}</h4>
                          <div className="text-[11px] text-muted-foreground">
                            {client.gender} • {client.age} yrs • {client.city}
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          client.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {client.approvalStatus.replaceAll('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground">
                          {client.createdByBureau ? 'Added by Bureau Office' : 'Self-Registered via City'}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                          {client.educationCareer?.profession || 'Professional'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "{client.bioHeadline || client.aboutMe || 'Matrimonial dossier'}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                      <Link
                        href={`/profile/${client.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-[11px] font-semibold hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" /> Dossier
                      </Link>
                      {(client.whatsappNumber || client.phone) && (
                        <a
                          href={`https://wa.me/${(client.whatsappNumber || client.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                      {isApproved && client.approvalStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => void approveBureauClientProfile(client.id, 'APPROVED')}
                          className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve Client Profile
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Add Walk-in Client */}
        {activeTab === 'add-client' && (
          <form onSubmit={handleCreateClient} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold font-serif">Register Walk-in Client Under {ownBureau?.name}</h2>
              <p className="text-xs text-muted-foreground">
                Add a bride or groom client directly from your Daftar. Their profile will automatically be linked to {ownBureau?.bureauCode} and published across the platform.
              </p>
            </div>

            {!isApproved && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                Your Marriage Bureau must be Admin Approved before adding client profiles.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.fullName}
                  onChange={(e) => setClientForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Ayesha Siddiqa"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Gender *</label>
                <select
                  value={clientForm.gender}
                  onChange={(e) => setClientForm((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                >
                  <option value="FEMALE">Female (Bride)</option>
                  <option value="MALE">Male (Groom)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={clientForm.dateOfBirth}
                  onChange={(e) => setClientForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Family Mobile / Phone *</label>
                <input
                  type="tel"
                  required
                  value={clientForm.phone}
                  onChange={(e) => setClientForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Client Email (Optional)</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Auto-generated if left blank"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Portal Login Password (Optional)</label>
                <input
                  type="password"
                  value={clientForm.password}
                  onChange={(e) => setClientForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 8 chars if giving client login"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Marital Status</label>
                <select
                  value={clientForm.maritalStatus}
                  onChange={(e) => setClientForm((p) => ({ ...p, maritalStatus: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Religion</label>
                <select
                  value={clientForm.religion}
                  onChange={(e) => setClientForm((p) => ({ ...p, religion: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                >
                  <option value="ISLAM">Islam</option>
                  <option value="CHRISTIANITY">Christianity</option>
                  <option value="HINDUISM">Hinduism</option>
                  <option value="SIKHISM">Sikhism</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Caste / Zaat</label>
                <input
                  type="text"
                  value={clientForm.caste}
                  onChange={(e) => setClientForm((p) => ({ ...p, caste: e.target.value }))}
                  placeholder="e.g. Syed, Arain, Rajput"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Highest Education</label>
                <input
                  type="text"
                  value={clientForm.highestDegree}
                  onChange={(e) => setClientForm((p) => ({ ...p, highestDegree: e.target.value }))}
                  placeholder="e.g. MBBS, BSCS, MBA"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Profession</label>
                <input
                  type="text"
                  value={clientForm.profession}
                  onChange={(e) => setClientForm((p) => ({ ...p, profession: e.target.value }))}
                  placeholder="e.g. Medical Doctor, Software Engineer"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Father Occupation</label>
                <input
                  type="text"
                  value={clientForm.fatherOccupation}
                  onChange={(e) => setClientForm((p) => ({ ...p, fatherOccupation: e.target.value }))}
                  placeholder="e.g. Businessman / Retired Govt Officer"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <CountryCitySelect
              selectedCountry={clientForm.country}
              selectedCity={clientForm.city}
              onCountryChange={(c) => setClientForm((p) => ({ ...p, country: c }))}
              onCityChange={(ct) => setClientForm((p) => ({ ...p, city: ct }))}
              countryLabel="Client Country *"
              cityLabel="Client City *"
              required
            />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Headline Summary</label>
                <input
                  type="text"
                  value={clientForm.bioHeadline}
                  onChange={(e) => setClientForm((p) => ({ ...p, bioHeadline: e.target.value }))}
                  placeholder="e.g. Educated doctor family from Gulberg seeking compatible proposal"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Detailed Profile & Family Expectations</label>
                <textarea
                  rows={3}
                  value={clientForm.aboutMe}
                  onChange={(e) => setClientForm((p) => ({ ...p, aboutMe: e.target.value }))}
                  placeholder="Include family background, lifestyle, and rishta preferences..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isApproved || isCreatingClient}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {isCreatingClient ? 'Saving Client...' : 'Create Client Under My Bureau'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Rishta Explorer */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
              <select
                value={exploreScope}
                onChange={(e) => setExploreScope(e.target.value as 'ALL_PLATFORM' | 'MY_BUREAU')}
                className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-bold focus:outline-none"
              >
                <option value="ALL_PLATFORM">Scope: All Platform Approved Rishtas</option>
                <option value="MY_BUREAU">Scope: My Bureau Clients Only</option>
              </select>

              <select
                value={exploreGender}
                onChange={(e) => setExploreGender(e.target.value as 'ALL' | 'FEMALE' | 'MALE')}
                className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">Brides & Grooms</option>
                <option value="FEMALE">Brides Only</option>
                <option value="MALE">Grooms Only</option>
              </select>

              <input
                type="text"
                value={exploreCity}
                onChange={(e) => setExploreCity(e.target.value)}
                placeholder="Filter by city (e.g. Lahore)"
                className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs focus:outline-none"
              />
              <span className="ml-auto text-xs text-muted-foreground font-semibold">
                {explorerProfiles.length} rishtas available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {explorerProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} showScore={false} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Office Settings */}
        {activeTab === 'settings' && ownBureau && (
          <form onSubmit={handleSaveOffice} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold font-serif">Bureau Office Settings</h2>
              <p className="text-xs text-muted-foreground">
                Update public office details displayed to members selecting {ownBureau.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Bureau Name</label>
                <input
                  type="text"
                  value={officeForm.name}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Owner / Matchmaker Name</label>
                <input
                  type="text"
                  value={officeForm.ownerName}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  value={officeForm.phone}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={officeForm.whatsappNumber}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold block mb-1">Office Address</label>
                <input
                  type="text"
                  value={officeForm.address}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Additional Service Cities (comma separated)</label>
                <input
                  type="text"
                  value={officeForm.serviceCities}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, serviceCities: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Default Rishta Scope</label>
                <select
                  value={officeForm.rishtaScope}
                  onChange={(e) => setOfficeForm((p) => ({
                    ...p,
                    rishtaScope: e.target.value === 'BUREAU_PRIORITY' ? 'BUREAU_PRIORITY' : 'ALL_PLATFORM',
                  }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                >
                  <option value="ALL_PLATFORM">All Approved Platform Rishtas</option>
                  <option value="BUREAU_PRIORITY">Prioritize Bureau Clients First</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold block mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={officeForm.specializations}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, specializations: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold block mb-1">About Bureau</label>
                <textarea
                  rows={3}
                  value={officeForm.description}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={settingsSaving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {settingsSaving ? 'Saving...' : 'Save Office Profile'}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
