'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Crown,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  ArrowRight,
  FileBadge,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RegisterBureauPage() {
  const router = useRouter();
  const { registerBureau } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bureauName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsappNumber: '',
    country: 'Pakistan',
    province: '',
    city: 'Lahore',
    serviceCities: '',
    address: '',
    registrationNumber: '',
    specializations: '',
    description: '',
    rishtaScope: 'ALL_PLATFORM',
    agreeTerms: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bureauName.trim() || !formData.ownerName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.country || !formData.city || !formData.address.trim()) {
      toast.error('Please fill in all required bureau office and owner details.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!formData.agreeTerms) {
      toast.error('Please confirm the Marriage Bureau terms and authenticity pledge.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your Marriage Bureau registration...');

    const result = await registerBureau({
      bureauName: formData.bureauName,
      ownerName: formData.ownerName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber || formData.phone,
      country: formData.country,
      stateProvince: formData.province,
      city: formData.city,
      serviceCities: formData.serviceCities,
      address: formData.address,
      registrationNumber: formData.registrationNumber,
      specializations: formData.specializations,
      description: formData.description,
      rishtaScope: formData.rishtaScope,
    });

    setIsSubmitting(false);
    toast.dismiss(toastId);

    if (!result.success) {
      toast.error(result.error || 'Bureau registration could not be completed.');
      return;
    }

    toast.success('Marriage Bureau registered! Pending Admin approval.');
    router.push(result.redirectUrl || '/bureau');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-50/70 dark:bg-gold-950/30 px-3.5 py-1 text-xs font-bold text-gold-800 dark:text-gold-300">
            <Building2 className="h-3.5 w-3.5 text-gold-600" /> Partner Office Onboarding • Marriage Bureau (Daftar)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Register Your Marriage Bureau Office
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Register your licensed Rishta Daftar to manage walk-in family clients, receive direct city-based user registrations, and connect across the platform after Administrator approval.
          </p>
        </div>

        {/* Role Clarity Info Strip */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
              <FileBadge className="h-4 w-4 text-brand-600" /> 1. Submit Office Details
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enter your Daftar name, city, physical address, and owner credentials.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> 2. Admin Verification
            </div>
            <p className="text-[11px] text-muted-foreground">
              Platform Administrators review and approve your bureau before listing you in user sign-ups.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 3. Manage City Clients
            </div>
            <p className="text-[11px] text-muted-foreground">
              Users in your city select your bureau on signup, and you can add your own walk-in clients directly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Bureau & Office Information</h2>
              <p className="text-xs text-muted-foreground">All fields marked with * are required for verification.</p>
            </div>
            <Link href="/register" className="text-xs font-bold text-brand-600 hover:underline">
              Looking for personal rishta signup? Register as Member →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1">Marriage Bureau / Daftar Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.bureauName}
                  onChange={(e) => updateField('bureauName', e.target.value)}
                  placeholder="e.g. Al-Noor Royal Marriage Bureau"
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Owner / Authorized Matchmaker Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => updateField('ownerName', e.target.value)}
                  placeholder="e.g. Haji Muhammad Siddique"
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Office Registration / License / NTN (Optional)</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => updateField('registrationNumber', e.target.value)}
                placeholder="e.g. REG-LHR-9041"
                className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Official Email Address (Login ID) *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="office@yourbureau.pk"
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Office Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => updateField('whatsappNumber', e.target.value)}
                placeholder="Leave blank if same as mobile"
                className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Default Client Rishta Scope</label>
              <select
                value={formData.rishtaScope}
                onChange={(e) => updateField('rishtaScope', e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
              >
                <option value="ALL_PLATFORM">All Approved Platform Rishtas (Global + Bureau)</option>
                <option value="BUREAU_PRIORITY">Prioritize Own Bureau Network First</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-600" /> Office City & Physical Location
            </h3>

            <CountryCitySelect
              selectedCountry={formData.country}
              selectedCity={formData.city}
              onCountryChange={(c) => updateField('country', c)}
              onCityChange={(ct) => updateField('city', ct)}
              countryLabel="Office Country *"
              cityLabel="Primary Office City *"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Complete Office Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="e.g. Office 12, 2nd Floor, Liberty Commercial Plaza, Gulberg III"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Additional Nearby Cities Served (Comma separated)</label>
                <input
                  type="text"
                  value={formData.serviceCities}
                  onChange={(e) => updateField('serviceCities', e.target.value)}
                  placeholder="e.g. Kasur, Sheikhupura, Gujranwala"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Specializations (Comma separated)</label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => updateField('specializations', e.target.value)}
                  placeholder="e.g. Doctors & Engineers, Business Families, UK/US Diaspora"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">About Your Daftar</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief note about years of experience and family verification process"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => updateField('agreeTerms', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-muted-foreground">
              I confirm that this Marriage Bureau is a genuine, physical/licensed matchmaking office and will handle all client family data confidentially according to platform rules.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
            <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-brand-600">
              Already registered a bureau? Sign In →
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-800 via-brand-700 to-rose-800 px-8 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition disabled:opacity-50"
            >
              <Crown className="h-4 w-4 text-gold-300" />
              {isSubmitting ? 'Submitting Bureau Application...' : 'Submit Marriage Bureau for Admin Approval'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
