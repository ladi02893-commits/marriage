'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Globe,
  PlusCircle,
  Search,
  Settings,
  ShieldAlert,
  UserPlus,
  Users,
  XCircle,
  FileCheck,
  Upload,
  Menu,
  X,
  LogOut,
  ChevronRight,
  TrendingUp,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { ProfileCard } from '@/components/profile/profile-card';
import { useAuth } from '@/lib/auth-context';
import { BureauPlanSlug, BureauRishtaScope } from '@/lib/types';
import { toast } from 'sonner';

type BureauTab = 'overview' | 'clients' | 'add-client' | 'explore' | 'recharge' | 'settings';

export default function MarriageBureauPortalPage() {
  const router = useRouter();
  const {
    currentUser,
    ownBureau,
    bureauPlans,
    receivingAccounts,
    profiles,
    createBureauClient,
    updateBureauProfile,
    submitBureauCnicVerification,
    submitBureauProfileForApproval,
    submitBureauRecharge,
    getDocumentSignedUrl,
    bureauOverviewStats,
    allRecharges,
    platformMatchmakingStats,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<BureauTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Recharge state
  const [selectedRechargeSlug, setSelectedRechargeSlug] = useState<BureauPlanSlug>('BUREAU_1M');
  const [rechargeMethod, setRechargeMethod] = useState('BANK_TRANSFER');
  const [rechargeSenderName, setRechargeSenderName] = useState('');
  const [rechargeSenderAccount, setRechargeSenderAccount] = useState('');
  const [rechargeTxId, setRechargeTxId] = useState('');
  const [rechargeReceiptKey, setRechargeReceiptKey] = useState('');
  const [rechargeReceiptPreview, setRechargeReceiptPreview] = useState<string | null>(null);
  const [rechargeNotes, setRechargeNotes] = useState('');
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // CNIC verification state
  const [cnicNumber, setCnicNumber] = useState(ownBureau?.cnicNumber || '');
  const [cnicFrontKey, setCnicFrontKey] = useState(ownBureau?.cnicFrontKey || '');
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null);
  const [cnicBackKey, setCnicBackKey] = useState(ownBureau?.cnicBackKey || '');
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null);
  const [isUploadingCnicFront, setIsUploadingCnicFront] = useState(false);
  const [isUploadingCnicBack, setIsUploadingCnicBack] = useState(false);
  const [isSubmittingCnic, setIsSubmittingCnic] = useState(false);
  const [isSubmittingProfileReview, setIsSubmittingProfileReview] = useState(false);

  // Client search & filters
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
    rishtaScope: (ownBureau?.rishtaScope || 'ALL_PLATFORM') as BureauRishtaScope,
    registrationNumber: ownBureau?.registrationNumber || '',
  });

  useEffect(() => {
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
        registrationNumber: ownBureau.registrationNumber || '',
      });
      setCnicNumber(ownBureau.cnicNumber || '');
      setCnicFrontKey(ownBureau.cnicFrontKey || '');
      setCnicBackKey(ownBureau.cnicBackKey || '');
      setClientForm((prev) => ({
        ...prev,
        country: prev.country || ownBureau.country,
        city: prev.city || ownBureau.city,
      }));

      // Load preview URLs for existing CNIC keys
      if (ownBureau.cnicFrontKey) {
        getDocumentSignedUrl(ownBureau.cnicFrontKey, 'verification-documents').then((url) => {
          if (url) setCnicFrontPreview(url);
        });
      }
      if (ownBureau.cnicBackKey) {
        getDocumentSignedUrl(ownBureau.cnicBackKey, 'verification-documents').then((url) => {
          if (url) setCnicBackPreview(url);
        });
      }
    }
  }, [ownBureau, getDocumentSignedUrl]);

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

  // Document upload handler
  const handleFileUpload = async (
    file: File,
    purpose: 'bureau-cnic' | 'bureau-receipts',
  ): Promise<{ key: string; signedUrl?: string } | null> => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size exceeds the 8MB limit.');
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed.');
      }
      const signedUrl = await getDocumentSignedUrl(
        data.key,
        purpose === 'bureau-cnic' ? 'verification-documents' : 'payment-evidence',
      );
      return { key: data.key, signedUrl: signedUrl || undefined };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'File upload failed.');
      return null;
    }
  };

  const handleCnicFrontChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCnicFront(true);
    const uploaded = await handleFileUpload(file, 'bureau-cnic');
    setIsUploadingCnicFront(false);
    if (uploaded) {
      setCnicFrontKey(uploaded.key);
      if (uploaded.signedUrl) setCnicFrontPreview(uploaded.signedUrl);
      toast.success('CNIC Front document uploaded.');
    }
  };

  const handleCnicBackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCnicBack(true);
    const uploaded = await handleFileUpload(file, 'bureau-cnic');
    setIsUploadingCnicBack(false);
    if (uploaded) {
      setCnicBackKey(uploaded.key);
      if (uploaded.signedUrl) setCnicBackPreview(uploaded.signedUrl);
      toast.success('CNIC Back document uploaded.');
    }
  };

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    const uploaded = await handleFileUpload(file, 'bureau-receipts');
    setIsUploadingReceipt(false);
    if (uploaded) {
      setRechargeReceiptKey(uploaded.key);
      if (uploaded.signedUrl) setRechargeReceiptPreview(uploaded.signedUrl);
      toast.success('Payment receipt uploaded.');
    }
  };

  const handleSubmitCnic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicNumber.trim() || cnicNumber.trim().length < 10) {
      toast.error('Please enter a valid CNIC number (minimum 10 characters).');
      return;
    }
    if (!cnicFrontKey || !cnicBackKey) {
      toast.error('Please upload both CNIC Front and CNIC Back documents.');
      return;
    }
    setIsSubmittingCnic(true);
    const ok = await submitBureauCnicVerification({
      cnicNumber: cnicNumber.trim(),
      cnicFrontKey,
      cnicBackKey,
    });
    setIsSubmittingCnic(false);
  };

  const handleSubmitProfileApproval = async () => {
    setIsSubmittingProfileReview(true);
    await submitBureauProfileForApproval();
    setIsSubmittingProfileReview(false);
  };

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
      rishtaScope: officeForm.rishtaScope,
      registrationNumber: officeForm.registrationNumber,
    });
    setSettingsSaving(false);
  };

  const handleSubmitRechargeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeSenderName.trim() || !rechargeSenderAccount.trim() || !rechargeTxId.trim()) {
      toast.error('Sender Name, Account/Wallet Number, and Transaction ID are required.');
      return;
    }
    if (!rechargeReceiptKey) {
      toast.error('Please upload your payment screenshot / receipt proof.');
      return;
    }

    // Duplicate check
    if (ownBureau?.pendingRechargeRequest) {
      toast.error('A recharge request is already pending verification. Please wait for Admin review.');
      return;
    }

    setIsSubmittingRecharge(true);
    const ok = await submitBureauRecharge({
      planSlug: selectedRechargeSlug,
      paymentMethod: rechargeMethod,
      senderName: rechargeSenderName.trim(),
      senderAccount: rechargeSenderAccount.trim(),
      transactionId: rechargeTxId.trim(),
      receiptKey: rechargeReceiptKey,
      notes: rechargeNotes.trim() || undefined,
    });
    setIsSubmittingRecharge(false);
    if (ok) {
      setRechargeSenderName('');
      setRechargeSenderAccount('');
      setRechargeTxId('');
      setRechargeReceiptKey('');
      setRechargeReceiptPreview(null);
      setRechargeNotes('');
      setActiveTab('overview');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-brand-600" />
          <h1 className="text-xl font-bold font-serif">Marriage Bureau Portal</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in with your Marriage Bureau credentials or register your Daftar office to continue.
          </p>
          <div className="flex flex-col gap-2.5 pt-3">
            <Link href="/login?returnTo=/bureau" className="rounded-xl bg-brand-900 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-950 transition">
              Sign In to Bureau Portal
            </Link>
            <Link href="/register/bureau" className="rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition">
              Register New Marriage Bureau
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-4">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="text-xl font-bold font-serif">Bureau Owner Access Only</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are signed in as a matrimonial candidate. Visit your Member Dashboard to view your assigned Marriage Bureau.
          </p>
          <Link href="/dashboard/consultant" className="inline-block rounded-xl bg-brand-900 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-950 transition">
            Go to My Marriage Bureau
          </Link>
        </div>
      </div>
    );
  }

  const selectedPlanObj = bureauPlans.find((p) => p.slug === selectedRechargeSlug) || bureauPlans[0];
  const isApproved = ownBureau?.approvalStatus === 'APPROVED';

  // Navigation Links
  const navItems = [
    { id: 'overview' as BureauTab, label: 'Overview & Statistics', icon: TrendingUp },
    { id: 'clients' as BureauTab, label: 'My Registered Clients', icon: Users, badge: ownClients.length },
    { id: 'add-client' as BureauTab, label: 'Register Walk-In Client', icon: UserPlus },
    { id: 'explore' as BureauTab, label: 'Platform Matchmaking', icon: Globe },
    { id: 'recharge' as BureauTab, label: 'Packages & Recharge', icon: CreditCard, badge: ownBureau?.creditsRemaining !== undefined ? `${ownBureau.creditsRemaining} cr` : undefined },
    { id: 'settings' as BureauTab, label: 'Office & Identity Settings', icon: Settings, badge: ownBureau?.cnicVerificationStatus === 'PENDING_VERIFICATION' ? 'Pending' : undefined },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-gold-400 border border-gold-500/30">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-serif leading-tight">{ownBureau?.name || 'Marriage Bureau'}</div>
            <div className="text-[9px] text-muted-foreground font-mono">{ownBureau?.bureauCode || 'MB-DAFTAR'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-xl border border-border p-2 text-foreground hover:bg-muted"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-card border-r border-border p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-600" />
                <span className="font-serif font-bold text-sm">Bureau Control</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    activeTab === item.id
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Unified Sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-border bg-gradient-to-b from-brand-950/20 to-transparent">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-900 to-brand-700 text-gold-400 border border-gold-500/30 shadow-md">
              <Building2 className="h-5 w-5 fill-gold-400" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground font-serif leading-tight truncate max-w-[170px]">
                {ownBureau?.name || 'Marriage Bureau'}
              </div>
              <div className="text-[9px] tracking-widest text-gold-600 dark:text-gold-400 uppercase font-semibold">
                Daftar Office Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Bureau Status Badge Card */}
        <div className="p-4 border-b border-border bg-brand-50/30 dark:bg-brand-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono text-[10px]">{ownBureau?.bureauCode || 'MB-PENDING'}</span>
            {ownBureau?.approvalStatus === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                <CheckCircle2 className="h-3 w-3" /> Approved
              </span>
            ) : ownBureau?.approvalStatus === 'PENDING' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                <Clock className="h-3 w-3" /> Pending Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-bold">
                <XCircle className="h-3 w-3" /> {ownBureau?.approvalStatus}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-muted-foreground">Credits Balance:</span>
            <strong className="font-mono text-foreground font-bold">{ownBureau?.creditsRemaining ?? 0} Credits</strong>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-900 text-white shadow-sm font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-gold-400' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-between rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <span>Public Website</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Verification Alert Banner if Not Approved */}
        {ownBureau && ownBureau.approvalStatus !== 'APPROVED' && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold text-amber-900 dark:text-amber-300 block">
                  Office Approval Status: {ownBureau.approvalStatus}
                </strong>
                <span className="text-amber-800/80 dark:text-amber-400">
                  {ownBureau.profileRejectionReason
                    ? `Admin Note: ${ownBureau.profileRejectionReason}`
                    : 'Complete your profile and upload your CNIC identity documents to receive full platform approval.'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow shrink-0"
            >
              <FileCheck className="h-3.5 w-3.5" /> Complete Verification
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW & STATISTICS (Requirement 6) */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-serif text-foreground">
                  Marriage Bureau Workspace
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Private client records, available match credits, and platform rishta connectivity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('add-client')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 px-4 py-2.5 text-xs font-bold text-white shadow transition"
                >
                  <UserPlus className="h-4 w-4" /> Add Walk-In Client
                </button>
                <button
                  onClick={() => setActiveTab('recharge')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gold-500/50 bg-gold-500/10 hover:bg-gold-500/20 px-4 py-2.5 text-xs font-bold text-gold-700 dark:text-gold-400 shadow-sm transition"
                >
                  <CreditCard className="h-4 w-4" /> Recharge Credits
                </button>
              </div>
            </div>

            {/* SECTION A: BUREAU REGISTERED USERS */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-brand-600 dark:text-brand-400">
                    Private Office Client Base
                  </span>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    Section A: Bureau Registered Users
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('clients')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 transition inline-flex items-center gap-1"
                >
                  View All Clients ({ownClients.length}) <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Total Office Clients</span>
                  <div className="text-2xl font-black font-serif text-foreground">{ownClients.length}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Under this Daftar</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Female Clients</span>
                  <div className="text-2xl font-black font-serif text-rose-600">
                    {ownClients.filter((c) => c.gender === 'FEMALE').length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Registered brides</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Male Clients</span>
                  <div className="text-2xl font-black font-serif text-blue-600">
                    {ownClients.filter((c) => c.gender === 'MALE').length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Registered grooms</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Completed Profiles</span>
                  <div className="text-2xl font-black font-serif text-emerald-600">
                    {ownClients.filter((c) => (c.completionPercentage || 0) >= 70).length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Dossier ready</span>
                </div>
              </div>

              {/* Recent Client Signups Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Recent Client Registrations
                </h3>
                {ownClients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground">No walk-in or assigned clients registered yet.</p>
                    <button
                      onClick={() => setActiveTab('add-client')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Register your first client now
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Client Name</th>
                          <th className="py-2.5 px-3 font-semibold">Profile Code</th>
                          <th className="py-2.5 px-3 font-semibold">Gender</th>
                          <th className="py-2.5 px-3 font-semibold">City</th>
                          <th className="py-2.5 px-3 font-semibold">Completion</th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ownClients.slice(0, 5).map((client) => (
                          <tr key={client.id} className="hover:bg-muted/30 transition">
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {client.fullName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                              {client.profileIdCode || 'PENDING'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                client.gender === 'FEMALE' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}>
                                {client.gender}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{client.city}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-brand-600">{client.completionPercentage}%</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {client.approvalStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link
                                href={`/profile/${client.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                              >
                                <Eye className="h-3 w-3" /> Dossier
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION B: AVAILABLE CREDITS OVERVIEW */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-gold-600 dark:text-gold-400">
                    Matchmaking Allowance & Ledger
                  </span>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    Section B: Available Credits Overview
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('recharge')}
                  className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-4 py-2 text-xs font-bold text-brand-950 shadow transition inline-flex items-center gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5" /> Recharge Account Now
                </button>
              </div>

              {/* Credits Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-50/50 to-background dark:from-gold-950/20 p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-gold-700 dark:text-gold-400 font-mono">Available Remaining</span>
                  <div className="text-3xl font-black font-serif text-foreground">
                    {ownBureau?.creditsRemaining ?? 0}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">Usable connection credits</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground font-mono">Total Credits Purchased</span>
                  <div className="text-3xl font-black font-serif text-foreground">
                    {ownBureau?.creditsTotal ?? 0}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">Lifetime purchased</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground font-mono">Credits Consumed</span>
                  <div className="text-3xl font-black font-serif text-brand-900 dark:text-gold-400">
                    {ownBureau?.creditsUsed ?? 0}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">Used for client unlocks</span>
                </div>
              </div>

              {/* Package Recharge Status & History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Package Recharge Status & History
                  </h3>
                  {ownBureau?.subscriptionExpiresAt && (
                    <span className="text-xs font-semibold text-emerald-600">
                      Subscription Active Until: {new Date(ownBureau.subscriptionExpiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {ownBureau?.pendingRechargeRequest && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                          Recharge Verification in Progress
                        </strong>
                        <span className="text-amber-800/80 dark:text-amber-400">
                          Package: {ownBureau.pendingRechargeRequest.planName} • Rs. {ownBureau.pendingRechargeRequest.amountPKR} • TxID: {ownBureau.pendingRechargeRequest.transactionId}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-200 dark:bg-amber-900 px-3 py-1 text-[10px] font-bold text-amber-900 dark:text-amber-200 shrink-0">
                      Pending Admin Review
                    </span>
                  </div>
                )}

                {/* History Table */}
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Package Name</th>
                        <th className="py-2.5 px-3 font-semibold">Amount</th>
                        <th className="py-2.5 px-3 font-semibold">Duration</th>
                        <th className="py-2.5 px-3 font-semibold">Transaction ID</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ownBureau?.subscriptionPlanSlug && (
                        <tr className="hover:bg-muted/30 transition">
                          <td className="py-2.5 px-3 font-bold text-foreground">
                            {bureauPlans.find((p) => p.slug === ownBureau.subscriptionPlanSlug)?.name || ownBureau.subscriptionPlanSlug}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                            Rs. {bureauPlans.find((p) => p.slug === ownBureau.subscriptionPlanSlug)?.pricePKR ?? '—'}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">Active Subscription</td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">VERIFIED</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      )}
                      {(!ownBureau?.subscriptionPlanSlug && !ownBureau?.pendingRechargeRequest) && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            No recharge records yet. Click &quot;Recharge Account Now&quot; to purchase your subscription.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECTION C: OVERALL MATCHMAKING CLIENTS */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400">
                    Platform-Wide Rishta Pool
                  </span>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    Section C: Overall Matchmaking Clients
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition inline-flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" /> Explore Matchmaking Pool
                </button>
              </div>

              {/* Platform Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Approved Profiles</span>
                  <div className="text-2xl font-black font-serif text-foreground">
                    {profiles.filter((p) => p.approvalStatus === 'APPROVED').length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Ready for matching</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Platform Brides</span>
                  <div className="text-2xl font-black font-serif text-rose-600">
                    {profiles.filter((p) => p.approvalStatus === 'APPROVED' && p.gender === 'FEMALE').length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Verified female proposals</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Platform Grooms</span>
                  <div className="text-2xl font-black font-serif text-blue-600">
                    {profiles.filter((p) => p.approvalStatus === 'APPROVED' && p.gender === 'MALE').length}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Verified male proposals</span>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium block">Matching Scope</span>
                  <div className="text-base font-bold font-serif text-foreground mt-1 truncate">
                    {ownBureau?.rishtaScope === 'BUREAU_PRIORITY' ? 'Bureau Priority' : 'All Platform'}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Full visibility enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MY REGISTERED CLIENTS */}
        {/* ================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-serif text-foreground">
                  My Bureau Clients
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Private client profiles managed exclusively under {ownBureau?.name || 'your Marriage Bureau'}.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('add-client')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 px-4 py-2.5 text-xs font-bold text-white shadow transition"
              >
                <UserPlus className="h-4 w-4" /> Add Walk-In Client
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, ID, city..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Status:</span>
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING_APPROVAL">Pending Review</option>
                  <option value="CHANGES_REQUESTED">Changes Requested</option>
                </select>
              </div>
            </div>

            {/* Clients Grid */}
            {filteredClients.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <h3 className="font-serif font-bold text-base text-foreground">No matching clients found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {clientSearch ? 'Try a different search query or filter.' : 'Register your walk-in matrimonial clients to manage their proposals and introductions.'}
                </p>
                <button
                  onClick={() => setActiveTab('add-client')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white shadow"
                >
                  <UserPlus className="h-4 w-4" /> Add Walk-In Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <div key={client.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                          {client.profileIdCode || 'ID Pending'}
                        </span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                          {client.approvalStatus}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold font-serif text-base text-foreground">{client.fullName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {client.age} yrs • {client.educationCareer?.highestDegree || 'Graduate'} • {client.city}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Caste / Clan:</span>
                          <strong className="text-foreground">{client.caste || 'Open'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profession:</span>
                          <strong className="text-foreground">{client.educationCareer?.profession || 'Professional'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completion:</span>
                          <strong className="text-brand-600 font-mono">{client.completionPercentage}%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <Link
                        href={`/profile/${client.id}`}
                        className="flex-1 rounded-xl border border-border py-2 text-center text-xs font-semibold hover:bg-muted transition"
                      >
                        View Dossier
                      </Link>
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow flex items-center gap-1"
                        >
                          <PhoneCall className="h-3.5 w-3.5" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: REGISTER WALK-IN CLIENT */}
        {/* ================================================================= */}
        {activeTab === 'add-client' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                Register Walk-In Client Profile
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add an in-office client dossier under your Marriage Bureau. Walk-in profiles are automatically linked to your daftar.
              </p>
            </div>

            <form onSubmit={handleCreateClient} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syeda Fatima Zahra"
                    value={clientForm.fullName}
                    onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Gender *</label>
                  <select
                    value={clientForm.gender}
                    onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="FEMALE">Female (Bride Proposal)</option>
                    <option value="MALE">Male (Groom Proposal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={clientForm.dateOfBirth}
                    onChange={(e) => setClientForm({ ...clientForm, dateOfBirth: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Client Email (optional)</label>
                  <input
                    type="email"
                    placeholder="client@example.com (or leave blank to auto-generate)"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={clientForm.whatsappNumber}
                    onChange={(e) => setClientForm({ ...clientForm, whatsappNumber: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <CountryCitySelect
                    selectedCountry={clientForm.country}
                    selectedCity={clientForm.city}
                    onCountryChange={(val) => setClientForm({ ...clientForm, country: val })}
                    onCityChange={(val) => setClientForm({ ...clientForm, city: val })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Caste / Community</label>
                  <input
                    type="text"
                    placeholder="e.g. Syed, Rajput, Arain"
                    value={clientForm.caste}
                    onChange={(e) => setClientForm({ ...clientForm, caste: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Highest Education</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MS Computer Science"
                    value={clientForm.highestDegree}
                    onChange={(e) => setClientForm({ ...clientForm, highestDegree: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Profession / Job</label>
                  <input
                    type="text"
                    placeholder="e.g. Doctor, Software Engineer, Business"
                    value={clientForm.profession}
                    onChange={(e) => setClientForm({ ...clientForm, profession: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Government Officer (Retd), Businessman"
                    value={clientForm.fatherOccupation}
                    onChange={(e) => setClientForm({ ...clientForm, fatherOccupation: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Bio Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Practicing Doctor from respectable Lahore family"
                    value={clientForm.bioHeadline}
                    onChange={(e) => setClientForm({ ...clientForm, bioHeadline: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">About Family & Expectations</label>
                  <textarea
                    rows={3}
                    placeholder="Add brief details about the client's family background, values, and rishta expectations."
                    value={clientForm.aboutMe}
                    onChange={(e) => setClientForm({ ...clientForm, aboutMe: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('clients')}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-900 hover:bg-brand-950 px-6 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50"
                >
                  {isCreatingClient ? 'Publishing...' : 'Save & Publish Walk-In Client'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PLATFORM MATCHMAKING EXPLORER */}
        {/* ================================================================= */}
        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                Platform Matchmaking Explorer
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore approved matrimonial proposals across Pakistan and overseas to find suitable matches for your clients.
              </p>
            </div>

            {/* Filter controls */}
            <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono block mb-1">
                  Scope
                </label>
                <select
                  value={exploreScope}
                  onChange={(e) => setExploreScope(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="ALL_PLATFORM">All Approved Platform Profiles</option>
                  <option value="MY_BUREAU">Only My Bureau Clients</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono block mb-1">
                  Looking For
                </label>
                <select
                  value={exploreGender}
                  onChange={(e) => setExploreGender(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="ALL">All Genders</option>
                  <option value="FEMALE">Female Candidates (Brides)</option>
                  <option value="MALE">Male Candidates (Grooms)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono block mb-1">
                  City Filter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Islamabad..."
                  value={exploreCity}
                  onChange={(e) => setExploreCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Explorer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {explorerProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: PACKAGES & RECHARGE (Requirement 4) */}
        {/* ================================================================= */}
        {activeTab === 'recharge' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                Bureau Packages & Credit Recharge
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recharge your Marriage Bureau account to receive connection credits and keep your office subscription active.
              </p>
            </div>

            {/* Pending Recharge Warning Banner */}
            {ownBureau?.pendingRechargeRequest && (
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-950/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>Package Recharge Request Pending Administrative Verification</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  You submitted a recharge for <strong>{ownBureau.pendingRechargeRequest.planName}</strong> (Rs. {ownBureau.pendingRechargeRequest.amountPKR}) on {new Date(ownBureau.pendingRechargeRequest.submittedAt).toLocaleDateString()} with Transaction ID: <strong className="font-mono">{ownBureau.pendingRechargeRequest.transactionId}</strong>. Credits will be allocated immediately upon Admin review.
                </p>
              </div>
            )}

            {/* Packages Selector */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                1. Select Bureau Subscription Package
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {bureauPlans.map((plan) => {
                  const isSelected = selectedRechargeSlug === plan.slug;
                  return (
                    <div
                      key={plan.slug}
                      onClick={() => setSelectedRechargeSlug(plan.slug)}
                      className={`cursor-pointer rounded-2xl border p-5 transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-brand-900 ring-2 ring-brand-900 bg-brand-50/20 dark:bg-brand-950/30'
                          : 'border-border bg-card hover:border-brand-500/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase font-mono text-muted-foreground">
                          {plan.durationMonths === 12 ? 'Annual Subscription' : `${plan.durationMonths} Months`}
                        </span>
                        <h3 className="font-serif font-bold text-base text-foreground">{plan.name}</h3>
                        <div className="text-2xl font-black font-serif text-brand-950 dark:text-gold-400">
                          Rs. {plan.pricePKR.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{plan.description}</p>
                      </div>

                      <div className="pt-2 border-t border-border/80">
                        <span className={`inline-block w-full py-1.5 rounded-lg text-center text-xs font-bold ${
                          isSelected ? 'bg-brand-900 text-white' : 'bg-muted text-foreground'
                        }`}>
                          {isSelected ? '✓ Selected Plan' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Payment Accounts Information */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                2. Send Payment to Official Receiving Accounts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {receivingAccounts.filter((a) => a.isActive).slice(0, 3).map((account) => (
                  <div key={account.id} className="rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5 shadow-sm">
                    <span className="font-bold text-brand-900 dark:text-gold-400 uppercase text-[10px] block font-mono">
                      {account.bankName || account.provider}
                    </span>
                    <strong className="text-sm font-mono text-foreground block">{account.accountNumber}</strong>
                    <span className="text-muted-foreground text-[11px] block">Title: {account.accountTitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharge Submission Form */}
            <form onSubmit={handleSubmitRechargeForm} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                3. Submit Recharge Proof for Administrative Approval
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Selected Package</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedPlanObj.name} (Rs. ${selectedPlanObj.pricePKR})`}
                    className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Payment Method *</label>
                  <select
                    value={rechargeMethod}
                    onChange={(e) => setRechargeMethod(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (1Link / Raast)</option>
                    <option value="JAZZCASH">JazzCash</option>
                    <option value="EASYPAISA">EasyPaisa</option>
                    <option value="RAAST">Raast Instant Payment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Sender Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name on sending bank or wallet"
                    value={rechargeSenderName}
                    onChange={(e) => setRechargeSenderName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Sender Account / Wallet Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03001234567 or IBAN"
                    value={rechargeSenderAccount}
                    onChange={(e) => setRechargeSenderAccount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Transaction ID / Reference Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN-9988223344"
                    value={rechargeTxId}
                    onChange={(e) => setRechargeTxId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                  />
                </div>

                {/* Receipt Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    Upload Payment Screenshot / Receipt *
                  </label>
                  <div className="rounded-2xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center">
                    {rechargeReceiptPreview ? (
                      <div className="space-y-2">
                        <img
                          src={rechargeReceiptPreview}
                          alt="Receipt Preview"
                          className="h-32 object-contain mx-auto rounded-xl border border-border"
                        />
                        <span className="text-[11px] text-emerald-600 font-bold block">✓ Receipt uploaded</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to upload payment receipt (.jpg, .png, .pdf, max 8MB)</p>
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-semibold text-foreground transition">
                      <span>{rechargeReceiptKey ? 'Replace Receipt' : 'Select Receipt File'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleReceiptChange}
                        disabled={isUploadingReceipt}
                        className="hidden"
                      />
                    </label>
                    {isUploadingReceipt && <span className="text-xs text-brand-600 animate-pulse">Uploading receipt...</span>}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Additional Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any special remarks or payment notes for the Admin verification team."
                    value={rechargeNotes}
                    onChange={(e) => setRechargeNotes(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingRecharge || isUploadingReceipt}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-900 hover:bg-brand-950 px-6 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50"
                >
                  {isSubmittingRecharge ? 'Submitting...' : 'Submit Recharge for Verification'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: OFFICE SETTINGS & CNIC VERIFICATION (Requirements 2 & 3) */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                Office Settings & CNIC Verification
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete your Daftar profile, verify national identity credentials, and configure office service details.
              </p>
            </div>

            {/* REQUIREMENT 2: PROFILE COMPLETION AND APPROVAL SYSTEM */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-brand-600 dark:text-brand-400">
                    Bureau Approval Workflow
                  </span>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    Profile Completion & Verification
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">Status:</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    ownBureau?.profileCompletionStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ownBureau?.profileCompletionStatus === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : ownBureau?.profileCompletionStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-muted text-foreground'
                  }`}>
                    {ownBureau?.profileCompletionStatus || 'INCOMPLETE'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Profile Completion Progress</span>
                  <strong className="font-mono text-brand-600 dark:text-gold-400">
                    {ownBureau?.profileCompletionPercentage ?? 40}%
                  </strong>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${ownBureau?.profileCompletionPercentage ?? 40}%` }}
                  />
                </div>
              </div>

              {/* Rejection Alert if Rejected */}
              {ownBureau?.profileCompletionStatus === 'REJECTED' && ownBureau.profileRejectionReason && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:bg-rose-950/40 text-xs space-y-1">
                  <strong className="text-rose-900 dark:text-rose-300 font-bold block">
                    Admin Review Feedback:
                  </strong>
                  <p className="text-rose-800 dark:text-rose-400 leading-relaxed">
                    {ownBureau.profileRejectionReason}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Ensure all office contact numbers, address, and CNIC identity documents are provided.
                </p>
                <button
                  type="button"
                  onClick={handleSubmitProfileApproval}
                  disabled={isSubmittingProfileReview || ownBureau?.profileCompletionStatus === 'PENDING_APPROVAL'}
                  className="rounded-xl bg-brand-900 hover:bg-brand-950 px-5 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50 transition shrink-0"
                >
                  {isSubmittingProfileReview
                    ? 'Submitting...'
                    : ownBureau?.profileCompletionStatus === 'PENDING_APPROVAL'
                    ? 'Submitted for Review'
                    : 'Submit Profile for Admin Review'}
                </button>
              </div>
            </div>

            {/* REQUIREMENT 3: CNIC / NATIONAL IDENTITY CARD VERIFICATION */}
            <form onSubmit={handleSubmitCnic} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400">
                    Confidential Identity Verification
                  </span>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    CNIC / National Identity Card Verification
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">CNIC Status:</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    ownBureau?.cnicVerificationStatus === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ownBureau?.cnicVerificationStatus === 'PENDING_VERIFICATION'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : ownBureau?.cnicVerificationStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-muted text-foreground'
                  }`}>
                    {ownBureau?.cnicVerificationStatus || 'NOT_SUBMITTED'}
                  </span>
                </div>
              </div>

              {/* Rejection Alert if Rejected */}
              {ownBureau?.cnicVerificationStatus === 'REJECTED' && ownBureau.cnicRejectionReason && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:bg-rose-950/40 text-xs space-y-1">
                  <strong className="text-rose-900 dark:text-rose-300 font-bold block">
                    CNIC Rejection Reason:
                  </strong>
                  <p className="text-rose-800 dark:text-rose-400 leading-relaxed">
                    {ownBureau.cnicRejectionReason}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    CNIC Number (National Identity Card) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 35202-1234567-1"
                    value={cnicNumber}
                    onChange={(e) => setCnicNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CNIC Front */}
                  <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <label className="text-xs font-semibold text-foreground block">
                      CNIC Front Image *
                    </label>
                    {cnicFrontPreview ? (
                      <div className="space-y-2">
                        <img
                          src={cnicFrontPreview}
                          alt="CNIC Front"
                          className="h-32 w-full object-contain rounded-xl border border-border bg-card"
                        />
                        <span className="text-[10px] text-emerald-600 font-bold block text-center">✓ Front Document Ready</span>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-center p-3">
                        <span className="text-xs text-muted-foreground">Upload clear photo of CNIC front</span>
                      </div>
                    )}
                    <label className="cursor-pointer block text-center rounded-xl border border-border bg-card hover:bg-muted py-2 text-xs font-semibold transition">
                      <span>{cnicFrontKey ? 'Replace Front' : 'Upload CNIC Front'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleCnicFrontChange}
                        disabled={isUploadingCnicFront}
                        className="hidden"
                      />
                    </label>
                    {isUploadingCnicFront && <span className="text-[11px] text-brand-600 block text-center animate-pulse">Uploading...</span>}
                  </div>

                  {/* CNIC Back */}
                  <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <label className="text-xs font-semibold text-foreground block">
                      CNIC Back Image *
                    </label>
                    {cnicBackPreview ? (
                      <div className="space-y-2">
                        <img
                          src={cnicBackPreview}
                          alt="CNIC Back"
                          className="h-32 w-full object-contain rounded-xl border border-border bg-card"
                        />
                        <span className="text-[10px] text-emerald-600 font-bold block text-center">✓ Back Document Ready</span>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-center p-3">
                        <span className="text-xs text-muted-foreground">Upload clear photo of CNIC back</span>
                      </div>
                    )}
                    <label className="cursor-pointer block text-center rounded-xl border border-border bg-card hover:bg-muted py-2 text-xs font-semibold transition">
                      <span>{cnicBackKey ? 'Replace Back' : 'Upload CNIC Back'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleCnicBackChange}
                        disabled={isUploadingCnicBack}
                        className="hidden"
                      />
                    </label>
                    {isUploadingCnicBack && <span className="text-[11px] text-brand-600 block text-center animate-pulse">Uploading...</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingCnic || isUploadingCnicFront || isUploadingCnicBack}
                  className="rounded-xl bg-brand-900 hover:bg-brand-950 px-6 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50 transition"
                >
                  {isSubmittingCnic ? 'Submitting...' : 'Submit CNIC for Identity Verification'}
                </button>
              </div>
            </form>

            {/* OFFICE DETAILS FORM */}
            <form onSubmit={handleSaveOffice} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono border-b border-border pb-3">
                Office Information & Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Daftar / Office Name *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.name}
                    onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">In-Charge / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.ownerName}
                    onChange={(e) => setOfficeForm({ ...officeForm, ownerName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Office Phone *</label>
                  <input
                    type="tel"
                    required
                    value={officeForm.phone}
                    onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={officeForm.whatsappNumber}
                    onChange={(e) => setOfficeForm({ ...officeForm, whatsappNumber: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Registration / License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. REG-LHR-4021"
                    value={officeForm.registrationNumber}
                    onChange={(e) => setOfficeForm({ ...officeForm, registrationNumber: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Rishta Scope</label>
                  <select
                    value={officeForm.rishtaScope}
                    onChange={(e) => setOfficeForm({ ...officeForm, rishtaScope: e.target.value as BureauRishtaScope })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL_PLATFORM">All Platform Visibility</option>
                    <option value="BUREAU_PRIORITY">Bureau Priority Matching</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Physical Office Address *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.address}
                    onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Service Cities (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Lahore, Kasur, Sheikhupura..."
                    value={officeForm.serviceCities}
                    onChange={(e) => setOfficeForm({ ...officeForm, serviceCities: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Specializations (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Doctors & Engineers, Business Families, Overseas Settled..."
                    value={officeForm.specializations}
                    onChange={(e) => setOfficeForm({ ...officeForm, specializations: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground block mb-1">Office Description / Bio</label>
                  <textarea
                    rows={3}
                    value={officeForm.description}
                    onChange={(e) => setOfficeForm({ ...officeForm, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="rounded-xl bg-brand-900 hover:bg-brand-950 px-6 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50 transition"
                >
                  {settingsSaving ? 'Saving...' : 'Save Office Details'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
