'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_WEBSITE_CUSTOMIZATION } from './default-customization';
import { WebsiteCustomizationConfig } from './types';
import { toast } from 'sonner';

interface CustomizationContextType {
  customization: WebsiteCustomizationConfig; // Active live configuration (for public pages)
  draftCustomization: WebsiteCustomizationConfig; // Draft configuration (for admin editing)
  publishedCustomization: WebsiteCustomizationConfig;
  hasUnpublishedChanges: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isResetting: boolean;
  fetchAdminCustomization: () => Promise<void>;
  updateLocalDraft: (updater: (prev: WebsiteCustomizationConfig) => WebsiteCustomizationConfig) => void;
  saveDraft: (explicitUpdates?: Partial<WebsiteCustomizationConfig>) => Promise<boolean>;
  publishCustomization: () => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
}

const CustomizationContext = createContext<CustomizationContextType>({
  customization: DEFAULT_WEBSITE_CUSTOMIZATION,
  draftCustomization: DEFAULT_WEBSITE_CUSTOMIZATION,
  publishedCustomization: DEFAULT_WEBSITE_CUSTOMIZATION,
  hasUnpublishedChanges: false,
  isLoading: false,
  isSaving: false,
  isPublishing: false,
  isResetting: false,
  fetchAdminCustomization: async () => {},
  updateLocalDraft: () => {},
  saveDraft: async () => false,
  publishCustomization: async () => false,
  resetToDefault: async () => false,
});

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [customization, setCustomization] = useState<WebsiteCustomizationConfig>(DEFAULT_WEBSITE_CUSTOMIZATION);
  const [draftCustomization, setDraftCustomization] = useState<WebsiteCustomizationConfig>(DEFAULT_WEBSITE_CUSTOMIZATION);
  const [publishedCustomization, setPublishedCustomization] = useState<WebsiteCustomizationConfig>(DEFAULT_WEBSITE_CUSTOMIZATION);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Initial load of published configuration for public pages
  useEffect(() => {
    let isMounted = true;
    async function loadPublished() {
      try {
        const res = await fetch('/api/customization');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setCustomization(json.data);
            setPublishedCustomization(json.data);
            setDraftCustomization(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load published customization, using local default:', err);
      }
    }
    loadPublished();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch admin-level draft & published configurations
  const fetchAdminCustomization = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customization?mode=admin');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDraftCustomization(json.data.draft);
          setPublishedCustomization(json.data.published);
          setHasUnpublishedChanges(Boolean(json.data.hasUnpublishedChanges));
          setCustomization(json.data.published);
        }
      }
    } catch (err) {
      console.error('Error fetching admin customization:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time local draft editor
  const updateLocalDraft = useCallback((updater: (prev: WebsiteCustomizationConfig) => WebsiteCustomizationConfig) => {
    setDraftCustomization((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  // Save draft changes
  const saveDraft = useCallback(
    async (explicitUpdates?: Partial<WebsiteCustomizationConfig>): Promise<boolean> => {
      setIsSaving(true);
      try {
        const payload = explicitUpdates || draftCustomization;
        const res = await fetch('/api/customization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SAVE_DRAFT', updates: payload }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setDraftCustomization(json.data.draft);
          setPublishedCustomization(json.data.published);
          setHasUnpublishedChanges(Boolean(json.data.hasUnpublishedChanges));
          toast.success('Website customization draft saved successfully.');
          return true;
        } else {
          toast.error(json.error || 'Failed to save draft changes.');
          return false;
        }
      } catch (err) {
        console.error('Save draft error:', err);
        toast.error('Network error saving draft changes.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [draftCustomization]
  );

  // Publish changes live to the website
  const publishCustomization = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    try {
      // If there are unsaved local modifications in draftCustomization, save draft first
      await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_DRAFT', updates: draftCustomization }),
      });

      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PUBLISH' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomization(json.data.published);
        setPublishedCustomization(json.data.published);
        setDraftCustomization(json.data.published);
        setHasUnpublishedChanges(false);
        toast.success('Customization published! Live website has been updated.');
        return true;
      } else {
        toast.error(json.error || 'Failed to publish changes.');
        return false;
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Network error publishing changes.');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [draftCustomization]);

  // Reset to default
  const resetToDefault = useCallback(async (): Promise<boolean> => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DEFAULT' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomization(json.data.published);
        setPublishedCustomization(json.data.published);
        setDraftCustomization(json.data.draft);
        setHasUnpublishedChanges(false);
        toast.success('Website branding and footer restored to original defaults.');
        return true;
      } else {
        toast.error(json.error || 'Failed to reset defaults.');
        return false;
      }
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Network error resetting customization.');
      return false;
    } finally {
      setIsResetting(false);
    }
  }, []);

  return (
    <CustomizationContext.Provider
      value={{
        customization,
        draftCustomization,
        publishedCustomization,
        hasUnpublishedChanges,
        isLoading,
        isSaving,
        isPublishing,
        isResetting,
        fetchAdminCustomization,
        updateLocalDraft,
        saveDraft,
        publishCustomization,
        resetToDefault,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
}
