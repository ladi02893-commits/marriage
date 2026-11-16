'use client';

import React, { useEffect, useState } from 'react';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sliders,
  Monitor,
  Smartphone,
  Sparkles,
  Save,
  Send,
  RotateCcw,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  Music,
} from 'lucide-react';
import { useCustomization } from '@/lib/customization-context';
import {
  FooterColumnItem,
  FooterLinkItem,
  SocialPlatform,
} from '@/lib/types';
import { toast } from 'sonner';

type CustomizationTab =
  | 'branding'
  | 'company'
  | 'columns'
  | 'social'
  | 'copyright'
  | 'design'
  | 'preview';

function SocialIconPreview({ platform, className }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'tiktok':
      return <Music className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function WebsiteCustomizationPage() {
  const {
    draftCustomization,
    hasUnpublishedChanges,
    fetchAdminCustomization,
    updateLocalDraft,
    saveDraft,
    publishCustomization,
    resetToDefault,
    isSaving,
    isPublishing,
    isResetting,
  } = useCustomization();

  const [activeTab, setActiveTab] = useState<CustomizationTab>('branding');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadingLogoType, setUploadingLogoType] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // New column modal state
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);

  // New link modal state
  const [activeColumnForNewLink, setActiveColumnForNewLink] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkNewTab, setNewLinkNewTab] = useState(false);

  useEffect(() => {
    fetchAdminCustomization();
  }, [fetchAdminCustomization]);

  // Handle Logo Uploads
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'primary' | 'alt' | 'footer'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (<= 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PNG, JPG, WebP, or SVG.');
      return;
    }

    setUploadingLogoType(type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'website-branding');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!json.success || !json.url) {
        toast.error(json.error || 'Failed to upload logo.');
        return;
      }

      // Update draft state with the new logo URL and key
      updateLocalDraft((prev) => {
        const next = { ...prev, branding: { ...prev.branding } };
        if (type === 'primary') {
          next.branding.primaryLogoUrl = json.url;
          next.branding.primaryLogoKey = json.key || '';
        } else if (type === 'alt') {
          next.branding.altLogoUrl = json.url;
          next.branding.altLogoKey = json.key || '';
        } else if (type === 'footer') {
          next.branding.footerLogoUrl = json.url;
          next.branding.footerLogoKey = json.key || '';
        }
        return next;
      });

      toast.success(`${type.toUpperCase()} logo uploaded successfully.`);
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Network error while uploading logo.');
    } finally {
      setUploadingLogoType(null);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = (type: 'primary' | 'alt' | 'footer') => {
    updateLocalDraft((prev) => {
      const next = { ...prev, branding: { ...prev.branding } };
      if (type === 'primary') {
        next.branding.primaryLogoUrl = '';
        next.branding.primaryLogoKey = '';
      } else if (type === 'alt') {
        next.branding.altLogoUrl = '';
        next.branding.altLogoKey = '';
      } else if (type === 'footer') {
        next.branding.footerLogoUrl = '';
        next.branding.footerLogoKey = '';
      }
      return next;
    });
    toast.info(`${type.toUpperCase()} logo removed. Default branding badge will be used.`);
  };

  // Add a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newCol: FooterColumnItem = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      enabled: true,
      order: (draftCustomization.columns || []).length + 1,
      links: [],
    };
    updateLocalDraft((prev) => ({
      ...prev,
      columns: [...(prev.columns || []), newCol],
    }));
    setNewColumnTitle('');
    setAddingColumn(false);
    toast.success('New footer column added.');
  };

  // Delete a column
  const handleDeleteColumn = (colId: string) => {
    updateLocalDraft((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== colId),
    }));
    toast.info('Footer column removed.');
  };

  // Move column order
  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const cols = [...draftCustomization.columns];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cols.length) return;

    const temp = cols[index];
    cols[index] = cols[targetIdx];
    cols[targetIdx] = temp;

    // Re-assign orders
    cols.forEach((c, idx) => {
      c.order = idx + 1;
    });

    updateLocalDraft((prev) => ({ ...prev, columns: cols }));
  };

  // Add link to column
  const handleAddLink = () => {
    if (!activeColumnForNewLink || !newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const newLink: FooterLinkItem = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      enabled: true,
      order: 99,
      openInNewTab: newLinkNewTab,
    };

    updateLocalDraft((prev) => {
      const nextCols = prev.columns.map((c) => {
        if (c.id === activeColumnForNewLink) {
          const links = [...(c.links || []), { ...newLink, order: (c.links || []).length + 1 }];
          return { ...c, links };
        }
        return c;
      });
      return { ...prev, columns: nextCols };
    });

    setActiveColumnForNewLink(null);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkNewTab(false);
    toast.success('Link added to column.');
  };

  // Delete link from column
  const handleDeleteLink = (colId: string, linkId: string) => {
    updateLocalDraft((prev) => {
      const nextCols = prev.columns.map((c) => {
        if (c.id === colId) {
          return { ...c, links: c.links.filter((l) => l.id !== linkId) };
        }
        return c;
      });
      return { ...prev, columns: nextCols };
    });
  };

  // Move link order
  const handleMoveLink = (colId: string, linkIdx: number, direction: 'up' | 'down') => {
    updateLocalDraft((prev) => {
      const nextCols = prev.columns.map((c) => {
        if (c.id === colId) {
          const links = [...c.links];
          const targetIdx = direction === 'up' ? linkIdx - 1 : linkIdx + 1;
          if (targetIdx < 0 || targetIdx >= links.length) return c;

          const temp = links[linkIdx];
          links[linkIdx] = links[targetIdx];
          links[targetIdx] = temp;

          links.forEach((l, i) => {
            l.order = i + 1;
          });
          return { ...c, links };
        }
        return c;
      });
      return { ...prev, columns: nextCols };
    });
  };

  // Toggle social link
  const handleToggleSocial = (socId: string, enabled: boolean) => {
    updateLocalDraft((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s) => (s.id === socId ? { ...s, enabled } : s)),
    }));
  };

  // Update social URL
  const handleUpdateSocialUrl = (socId: string, url: string) => {
    updateLocalDraft((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s) => (s.id === socId ? { ...s, url } : s)),
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-white">Website Customization</h1>
              <p className="text-xs text-zinc-400">
                Manage company branding, logo assets, footer columns, social channels, and design.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badge */}
          {hasUnpublishedChanges ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Unpublished Draft</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" />
              <span>Live & Published</span>
            </div>
          )}

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isResetting}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Defaults</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => saveDraft()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition shadow-sm"
          >
            <Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Publish Live */}
          <button
            type="button"
            onClick={() => publishCustomization()}
            disabled={isPublishing}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-black hover:from-amber-400 hover:to-amber-500 transition shadow-md shadow-amber-500/20"
          >
            <Send className={`h-3.5 w-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
            <span>{isPublishing ? 'Publishing...' : 'Publish to Website'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Reset Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Reset to Default Settings?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will restore all branding logos, company info, footer columns, social channels, and color styles back to factory default VIP Royal settings.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowResetConfirm(false);
                  await resetToDefault();
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-md shadow-rose-600/20"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-800 pb-2">
        {[
          { id: 'branding', label: '1. Logos & Branding', icon: ImageIcon },
          { id: 'company', label: '2. Company Information', icon: Building2 },
          { id: 'columns', label: '3. Footer Navigation', icon: Sliders },
          { id: 'social', label: '4. Social Media', icon: MessageCircle },
          { id: 'copyright', label: '5. Copyright & Legal', icon: Sparkles },
          { id: 'design', label: '6. Colors & Design', icon: Palette },
          { id: 'preview', label: '7. Live Preview', icon: Monitor },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CustomizationTab)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LOGOS & BRANDING */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Website Logo Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-amber-400" />
                Primary Website Logo
              </h3>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Header & Nav
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Displayed in the navbar, header, and public authentication portals. Supported: PNG, JPG, WebP, SVG (Max 5MB).
            </p>

            {/* Logo Preview Box */}
            <div className="h-32 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              {draftCustomization.branding.primaryLogoUrl ? (
                <img
                  src={draftCustomization.branding.primaryLogoUrl}
                  alt="Primary Logo"
                  style={{
                    width: `${draftCustomization.branding.primaryLogoWidth || 40}px`,
                    height: `${draftCustomization.branding.primaryLogoHeight || 40}px`,
                    objectFit: 'contain',
                  }}
                  className="rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] text-zinc-500 block">Default Royal Badge Active</span>
                </div>
              )}
            </div>

            {/* Upload & Remove Controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingLogoType === 'primary' ? 'Uploading...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload(e, 'primary')}
                  className="hidden"
                  disabled={uploadingLogoType === 'primary'}
                />
              </label>

              {draftCustomization.branding.primaryLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogo('primary')}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition"
                  title="Remove Logo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Width & Height Sliders */}
            <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span>Display Width:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {draftCustomization.branding.primaryLogoWidth || 40}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={draftCustomization.branding.primaryLogoWidth || 40}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, primaryLogoWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span>Display Height:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {draftCustomization.branding.primaryLogoHeight || 40}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={draftCustomization.branding.primaryLogoHeight || 40}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, primaryLogoHeight: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span>Mobile Logo Width:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {draftCustomization.branding.mobileLogoWidth || 36}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={draftCustomization.branding.mobileLogoWidth || 36}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, mobileLogoWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-zinc-300 font-medium">Show Company Name Text:</span>
                <input
                  type="checkbox"
                  checked={draftCustomization.branding.showTextWithLogo}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, showTextWithLogo: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Logo Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-emerald-400" />
                Footer Dedicated Logo
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If uploaded, will be displayed in the footer branding section instead of the primary header logo.
            </p>

            <div className="h-32 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              {draftCustomization.branding.footerLogoUrl ? (
                <img
                  src={draftCustomization.branding.footerLogoUrl}
                  alt="Footer Logo"
                  style={{
                    width: `${draftCustomization.branding.footerLogoWidth || 40}px`,
                    height: `${draftCustomization.branding.footerLogoHeight || 40}px`,
                    objectFit: 'contain',
                  }}
                  className="rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] text-zinc-500 block">Inheriting Primary Logo</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingLogoType === 'footer' ? 'Uploading...' : 'Upload Footer Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload(e, 'footer')}
                  className="hidden"
                  disabled={uploadingLogoType === 'footer'}
                />
              </label>

              {draftCustomization.branding.footerLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogo('footer')}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition"
                  title="Remove Footer Logo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span>Footer Logo Width:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {draftCustomization.branding.footerLogoWidth || 40}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={draftCustomization.branding.footerLogoWidth || 40}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, footerLogoWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span>Footer Logo Height:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {draftCustomization.branding.footerLogoHeight || 40}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={draftCustomization.branding.footerLogoHeight || 40}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, footerLogoHeight: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Alternative Logo Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-400" />
                Alternative / Dark Mode Logo
              </h3>
              <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monochrome or high-contrast alternative logo asset for light/dark theme switches or certificates.
            </p>

            <div className="h-32 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              {draftCustomization.branding.altLogoUrl ? (
                <img
                  src={draftCustomization.branding.altLogoUrl}
                  alt="Alt Logo"
                  className="h-10 w-10 object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] text-zinc-500 block">No Alt Logo Assigned</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingLogoType === 'alt' ? 'Uploading...' : 'Upload Alt Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload(e, 'alt')}
                  className="hidden"
                  disabled={uploadingLogoType === 'alt'}
                />
              </label>

              {draftCustomization.branding.altLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogo('alt')}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition"
                  title="Remove Alt Logo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY INFORMATION */}
      {/* ========================================================================= */}
      {activeTab === 'company' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-400" />
                Company Branding & Contact Details
              </h3>
              <p className="text-xs text-zinc-400">
                These values are dynamically rendered on the website navbar, footer, contact links, and email headers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Company / Website Name:</label>
              <input
                type="text"
                value={draftCustomization.company.companyName}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, companyName: e.target.value },
                  }))
                }
                placeholder="e.g. VIP ROYAL"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Company Tagline:</label>
              <input
                type="text"
                value={draftCustomization.company.tagline}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, tagline: e.target.value },
                  }))
                }
                placeholder="e.g. Matchmaking Concierge"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">Header Top Ribbon Subtext:</label>
              <input
                type="text"
                value={draftCustomization.company.subtext}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, subtext: e.target.value },
                  }))
                }
                placeholder="Pakistan’s Premier Connection-Based Matrimonial Platform"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Short Company Description:</label>
              <input
                type="text"
                value={draftCustomization.company.shortDescription}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, shortDescription: e.target.value },
                  }))
                }
                placeholder="Dedicated senior matchmaker concierge for respectable families"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Physical / Office Address:</label>
              <input
                type="text"
                value={draftCustomization.company.address}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, address: e.target.value },
                  }))
                }
                placeholder="Executive Office: Gulberg III & DHA Phase 5, Lahore, Pakistan"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Contact Phone Number:</label>
              <input
                type="text"
                value={draftCustomization.company.contactPhone}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, contactPhone: e.target.value },
                  }))
                }
                placeholder="+92 300 4112201"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Contact Email Address:</label>
              <input
                type="email"
                value={draftCustomization.company.contactEmail}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, contactEmail: e.target.value },
                  }))
                }
                placeholder="concierge@viproyalmatchmaking.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">WhatsApp Concierge Number:</label>
              <input
                type="text"
                value={draftCustomization.company.whatsappNumber}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, whatsappNumber: e.target.value },
                  }))
                }
                placeholder="+92 300 4112201"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">Footer Extended Narrative Description:</label>
              <textarea
                rows={3}
                value={draftCustomization.company.footerDescription}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    company: { ...prev.company, footerDescription: e.target.value },
                  }))
                }
                placeholder="Describe your platform’s mission and target demographic..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FOOTER NAVIGATION & COLUMNS */}
      {/* ========================================================================= */}
      {activeTab === 'columns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                Footer Columns & Links Management
              </h3>
              <p className="text-xs text-zinc-400">
                Organize footer navigation columns and manage links inside each column.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAddingColumn(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Column</span>
            </button>
          </div>

          {/* Add Column Dialog */}
          {addingColumn && (
            <div className="rounded-2xl border border-amber-500/40 bg-zinc-900/95 p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">New Column Heading</h4>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. Legal & Compliance"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setAddingColumn(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Link Dialog */}
          {activeColumnForNewLink && (
            <div className="rounded-2xl border border-emerald-500/40 bg-zinc-900/95 p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Add Link to Column: {draftCustomization.columns.find((c) => c.id === activeColumnForNewLink)?.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Link Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Success Stories"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Destination URL / Path:</label>
                  <input
                    type="text"
                    placeholder="e.g. /stories or https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLinkNewTab}
                    onChange={(e) => setNewLinkNewTab(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span>Open in New Tab</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                  >
                    Add Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveColumnForNewLink(null)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {draftCustomization.columns.map((column, colIdx) => (
              <div
                key={column.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400">
                        {colIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={column.title}
                        onChange={(e) =>
                          updateLocalDraft((prev) => ({
                            ...prev,
                            columns: prev.columns.map((c) =>
                              c.id === column.id ? { ...c, title: e.target.value } : c
                            ),
                          }))
                        }
                        className="font-bold text-xs text-white bg-transparent border-b border-dashed border-zinc-700 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(colIdx, 'up')}
                        disabled={colIdx === 0}
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(colIdx, 'down')}
                        disabled={colIdx === draftCustomization.columns.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteColumn(column.id)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 ml-1"
                        title="Delete Column"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Enable/Disable Column */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2">
                    <span>Show Column on Website:</span>
                    <input
                      type="checkbox"
                      checked={column.enabled}
                      onChange={(e) =>
                        updateLocalDraft((prev) => ({
                          ...prev,
                          columns: prev.columns.map((c) =>
                            c.id === column.id ? { ...c, enabled: e.target.checked } : c
                          ),
                        }))
                      }
                      className="h-3.5 w-3.5 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Column Links List */}
                  <div className="space-y-1.5 pt-1">
                    {(column.links || []).map((link, linkIdx) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-zinc-950 p-2 text-xs border border-zinc-800/80 group"
                      >
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) =>
                              updateLocalDraft((prev) => ({
                                ...prev,
                                columns: prev.columns.map((c) =>
                                  c.id === column.id
                                    ? {
                                        ...c,
                                        links: c.links.map((l) =>
                                          l.id === link.id ? { ...l, title: e.target.value } : l
                                        ),
                                      }
                                    : c
                                ),
                              }))
                            }
                            className="font-medium text-xs text-white bg-transparent border-none focus:outline-none w-full"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              updateLocalDraft((prev) => ({
                                ...prev,
                                columns: prev.columns.map((c) =>
                                  c.id === column.id
                                    ? {
                                        ...c,
                                        links: c.links.map((l) =>
                                          l.id === link.id ? { ...l, url: e.target.value } : l
                                        ),
                                      }
                                    : c
                                ),
                              }))
                            }
                            className="text-[10px] text-zinc-500 font-mono bg-transparent border-none focus:outline-none w-full"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) =>
                              updateLocalDraft((prev) => ({
                                ...prev,
                                columns: prev.columns.map((c) =>
                                  c.id === column.id
                                    ? {
                                        ...c,
                                        links: c.links.map((l) =>
                                          l.id === link.id ? { ...l, enabled: e.target.checked } : l
                                        ),
                                      }
                                    : c
                                ),
                              }))
                            }
                            title="Enable / Disable link"
                            className="h-3 w-3 rounded accent-amber-500 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handleMoveLink(column.id, linkIdx, 'up')}
                            disabled={linkIdx === 0}
                            className="text-zinc-500 hover:text-white disabled:opacity-20 p-0.5"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink(column.id, linkIdx, 'down')}
                            disabled={linkIdx === column.links.length - 1}
                            className="text-zinc-500 hover:text-white disabled:opacity-20 p-0.5"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(column.id, link.id)}
                            className="text-rose-400 hover:text-rose-300 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveColumnForNewLink(column.id)}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-zinc-700 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-500 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Link to this Column</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SOCIAL MEDIA LINKS */}
      {/* ========================================================================= */}
      {activeTab === 'social' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-5">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              Social Media Channels & Icons
            </h3>
            <p className="text-xs text-zinc-400">
              Configure URLs and enable/disable icons shown in the footer branding section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftCustomization.socialLinks.map((soc) => (
              <div
                key={soc.id}
                className="flex items-center gap-3.5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    soc.enabled
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-800/40 border-zinc-800 text-zinc-600'
                  }`}
                >
                  <SocialIconPreview platform={soc.platform} className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white capitalize">{soc.label}</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                      <span>{soc.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={soc.enabled}
                        onChange={(e) => handleToggleSocial(soc.id, e.target.checked)}
                        className="h-3.5 w-3.5 rounded accent-amber-500 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={soc.url}
                    onChange={(e) => handleUpdateSocialUrl(soc.id, e.target.value)}
                    placeholder={`https://${soc.platform}.com/...`}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COPYRIGHT & LEGAL */}
      {/* ========================================================================= */}
      {activeTab === 'copyright' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-5">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Copyright & Legal Section
            </h3>
            <p className="text-xs text-zinc-400">
              Customize copyright notice, corporate entity name, and legal disclosures in the footer bottom bar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Copyright Notice Suffix:</label>
              <input
                type="text"
                value={draftCustomization.copyright.copyrightText}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    copyright: { ...prev.copyright, copyrightText: e.target.value },
                  }))
                }
                placeholder="All rights reserved."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Company Name in Copyright:</label>
              <input
                type="text"
                value={draftCustomization.copyright.companyName}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    copyright: { ...prev.copyright, companyName: e.target.value },
                  }))
                }
                placeholder="VIP Royal Matchmaking Pvt Ltd"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={draftCustomization.copyright.useDynamicYear}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      copyright: { ...prev.copyright, useDynamicYear: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                />
                <span>Automatically compute current year ({new Date().getFullYear()})</span>
              </label>
            </div>

            {!draftCustomization.copyright.useDynamicYear && (
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Custom Fixed Year:</label>
                <input
                  type="text"
                  value={draftCustomization.copyright.customYear}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      copyright: { ...prev.copyright, customYear: e.target.value },
                    }))
                  }
                  placeholder="2026"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">Additional Footer Highlight Pills:</label>
              <input
                type="text"
                value={draftCustomization.copyright.additionalText}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    copyright: { ...prev.copyright, additionalText: e.target.value },
                  }))
                }
                placeholder="Consent-based introductions • No Monthly Expiry on Connections • Strict Family Confidentiality"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">Optional Legal & Registration Info:</label>
              <input
                type="text"
                value={draftCustomization.copyright.legalInfo || ''}
                onChange={(e) =>
                  updateLocalDraft((prev) => ({
                    ...prev,
                    copyright: { ...prev.copyright, legalInfo: e.target.value },
                  }))
                }
                placeholder="Registered with SECP & Pakistan Corporate Matrimonial Registry."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: COLORS & DESIGN */}
      {/* ========================================================================= */}
      {activeTab === 'design' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-400" />
              Footer Styling, Colors & Layout
            </h3>
            <p className="text-xs text-zinc-400">
              Customize colors, font scale, padding, and layout density with live instant previews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Background Color */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
              <label className="block text-zinc-300 font-bold">Footer Background Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draftCustomization.design.backgroundColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, backgroundColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={draftCustomization.design.backgroundColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, backgroundColor: e.target.value },
                    }))
                  }
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
              <label className="block text-zinc-300 font-bold">Footer Text Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draftCustomization.design.textColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, textColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={draftCustomization.design.textColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, textColor: e.target.value },
                    }))
                  }
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Heading Color */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
              <label className="block text-zinc-300 font-bold">Column Heading Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draftCustomization.design.headingColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, headingColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={draftCustomization.design.headingColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, headingColor: e.target.value },
                    }))
                  }
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Link Color */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
              <label className="block text-zinc-300 font-bold">Link Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draftCustomization.design.linkColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, linkColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={draftCustomization.design.linkColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, linkColor: e.target.value },
                    }))
                  }
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Border Color */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
              <label className="block text-zinc-300 font-bold">Footer Border Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draftCustomization.design.borderColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, borderColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={draftCustomization.design.borderColor}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: { ...prev.design, borderColor: e.target.value },
                    }))
                  }
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Font Size & Padding */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Font Scale:</label>
                <select
                  value={draftCustomization.design.fontSize}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: {
                        ...prev.design,
                        fontSize: e.target.value as 'xs' | 'sm' | 'base',
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  <option value="xs">Compact (xs)</option>
                  <option value="sm">Standard (sm)</option>
                  <option value="base">Large (base)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Vertical Padding:</label>
                <select
                  value={draftCustomization.design.paddingY}
                  onChange={(e) =>
                    updateLocalDraft((prev) => ({
                      ...prev,
                      design: {
                        ...prev.design,
                        paddingY: e.target.value as 'compact' | 'normal' | 'spacious',
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  <option value="compact">Compact (py-8)</option>
                  <option value="normal">Normal (py-12)</option>
                  <option value="spacious">Spacious (py-16)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REAL-TIME LIVE PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="h-4 w-4 text-amber-400" />
                Real-Time Live Footer Preview
              </h3>
              <p className="text-xs text-zinc-400">
                Inspect exactly how the public website footer will render before publishing.
              </p>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  previewDevice === 'desktop'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  previewDevice === 'mobile'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Preview Container Frame */}
          <div
            className={`mx-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}
          >
            {/* Simulated Browser Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono">https://viproyalmatchmaking.com</span>
              <div className="w-8" />
            </div>

            {/* Live Simulated Footer Component */}
            <div
              style={{
                backgroundColor: draftCustomization.design.backgroundColor || '#ffffff',
                color: draftCustomization.design.textColor || '#71717a',
                borderColor: draftCustomization.design.borderColor || '#e4e4e7',
              }}
              className="p-6 rounded-b-2xl overflow-hidden transition-colors"
            >
              <div
                className={`grid grid-cols-1 ${
                  previewDevice === 'desktop' ? 'md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1'
                } gap-6`}
              >
                {/* Brand Details */}
                <div className={`${previewDevice === 'desktop' ? 'lg:col-span-2' : ''} space-y-3`}>
                  <div className="flex items-center gap-2.5">
                    {draftCustomization.branding.footerLogoUrl || draftCustomization.branding.primaryLogoUrl ? (
                      <img
                        src={
                          draftCustomization.branding.footerLogoUrl ||
                          draftCustomization.branding.primaryLogoUrl
                        }
                        alt="Logo"
                        style={{
                          width: `${
                            previewDevice === 'mobile'
                              ? draftCustomization.branding.mobileLogoWidth || 36
                              : draftCustomization.branding.footerLogoWidth || 40
                          }px`,
                          height: `${draftCustomization.branding.footerLogoHeight || 40}px`,
                          objectFit: 'contain',
                        }}
                        className="rounded-xl shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-900 to-gold-600 text-white shadow-md">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    )}
                    {draftCustomization.branding.showTextWithLogo && (
                      <div>
                        <div className="text-base font-bold font-serif leading-none text-zinc-900 dark:text-white">
                          {draftCustomization.company.companyName}
                        </div>
                        <div className="text-[8px] uppercase tracking-widest font-bold text-amber-600">
                          {draftCustomization.company.tagline}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed opacity-90 max-w-sm">
                    {draftCustomization.company.footerDescription || draftCustomization.company.shortDescription}
                  </p>

                  <div className="space-y-1 text-xs opacity-80 pt-1">
                    {draftCustomization.company.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                        <span className="truncate">{draftCustomization.company.address}</span>
                      </div>
                    )}
                    {draftCustomization.company.contactPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>{draftCustomization.company.contactPhone}</span>
                      </div>
                    )}
                    {draftCustomization.company.contactEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>{draftCustomization.company.contactEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div className="flex items-center gap-2 pt-2">
                    {draftCustomization.socialLinks
                      .filter((s) => s.enabled)
                      .map((soc) => (
                        <div
                          key={soc.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/50 text-zinc-700 dark:text-zinc-300"
                        >
                          <SocialIconPreview platform={soc.platform} className="h-3.5 w-3.5" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Columns */}
                {draftCustomization.columns
                  .filter((c) => c.enabled)
                  .map((col) => (
                    <div key={col.id} className="space-y-2">
                      <h4
                        style={{ color: draftCustomization.design.headingColor || '#18181b' }}
                        className="text-xs font-bold uppercase tracking-wider font-mono"
                      >
                        {col.title}
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {col.links
                          .filter((l) => l.enabled)
                          .map((link) => (
                            <li
                              key={link.id}
                              style={{ color: draftCustomization.design.linkColor || '#71717a' }}
                              className="hover:underline cursor-pointer"
                            >
                              {link.title}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>

              {/* Bottom Copyright bar */}
              <div
                style={{ borderColor: draftCustomization.design.borderColor || '#e4e4e7' }}
                className="mt-8 border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-80"
              >
                <p>
                  ©{' '}
                  {draftCustomization.copyright.useDynamicYear
                    ? new Date().getFullYear()
                    : draftCustomization.copyright.customYear}{' '}
                  {draftCustomization.copyright.companyName}. {draftCustomization.copyright.copyrightText}
                </p>
                <p className="text-[11px]">{draftCustomization.copyright.additionalText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
