import { DEFAULT_WEBSITE_CUSTOMIZATION } from './default-customization';
import { insforgeAdmin } from './insforge/server';
import { SessionUser } from './api-auth';
import { WebsiteCustomizationConfig, WebsiteCustomizationState } from './types';

const CMS_DRAFT_KEY = 'website_customization_draft';
const CMS_PUBLISHED_KEY = 'website_customization_published';

/**
 * Merge partial configuration onto the default structure so no fields are undefined.
 */
function mergeWithDefaults(
  source?: Partial<WebsiteCustomizationConfig> | null
): WebsiteCustomizationConfig {
  if (!source) return { ...DEFAULT_WEBSITE_CUSTOMIZATION };

  return {
    version: source.version ?? DEFAULT_WEBSITE_CUSTOMIZATION.version,
    branding: {
      ...DEFAULT_WEBSITE_CUSTOMIZATION.branding,
      ...(source.branding || {}),
    },
    company: {
      ...DEFAULT_WEBSITE_CUSTOMIZATION.company,
      ...(source.company || {}),
    },
    columns: Array.isArray(source.columns) && source.columns.length > 0
      ? source.columns.map((col, cIdx) => ({
          id: col.id || `col-${cIdx + 1}`,
          title: col.title || `Column ${cIdx + 1}`,
          enabled: col.enabled !== false,
          order: typeof col.order === 'number' ? col.order : cIdx + 1,
          links: Array.isArray(col.links)
            ? col.links.map((link, lIdx) => ({
                id: link.id || `link-${cIdx + 1}-${lIdx + 1}`,
                title: link.title || 'Link',
                url: link.url || '#',
                enabled: link.enabled !== false,
                order: typeof link.order === 'number' ? link.order : lIdx + 1,
                openInNewTab: Boolean(link.openInNewTab),
              }))
            : [],
        }))
      : DEFAULT_WEBSITE_CUSTOMIZATION.columns,
    socialLinks: Array.isArray(source.socialLinks) && source.socialLinks.length > 0
      ? source.socialLinks.map((s, sIdx) => ({
          id: s.id || `soc-${s.platform || sIdx + 1}`,
          platform: s.platform || 'whatsapp',
          label: s.label || s.platform || 'Social Link',
          url: s.url || '',
          enabled: Boolean(s.enabled),
          order: typeof s.order === 'number' ? s.order : sIdx + 1,
        }))
      : DEFAULT_WEBSITE_CUSTOMIZATION.socialLinks,
    copyright: {
      ...DEFAULT_WEBSITE_CUSTOMIZATION.copyright,
      ...(source.copyright || {}),
    },
    design: {
      ...DEFAULT_WEBSITE_CUSTOMIZATION.design,
      ...(source.design || {}),
    },
    updatedAt: source.updatedAt || new Date().toISOString(),
    publishedAt: source.publishedAt || DEFAULT_WEBSITE_CUSTOMIZATION.publishedAt,
    publishedBy: source.publishedBy,
  };
}

async function recordAuditLog(
  adminUser: SessionUser,
  action: string,
  details: string,
  ipAddress = '127.0.0.1'
) {
  try {
    await insforgeAdmin.database.from('admin_audit_logs').insert([
      {
        admin_id: adminUser.id,
        admin_name: adminUser.name || adminUser.email || 'Admin',
        action,
        target_type: 'WEBSITE_CUSTOMIZATION',
        target_id: 'branding-and-footer',
        details,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('Failed to record customization audit log:', err);
  }
}

/**
 * Fetch the published customization directly for public rendering.
 */
export async function getPublishedWebsiteCustomization(): Promise<WebsiteCustomizationConfig> {
  try {
    // 1. Try public table
    const { data: tableRow } = await insforgeAdmin.database
      .from('website_customizations')
      .select('data')
      .eq('id', 'published')
      .maybeSingle();

    if (tableRow && tableRow.data && typeof tableRow.data === 'object') {
      return mergeWithDefaults(tableRow.data as Partial<WebsiteCustomizationConfig>);
    }

    // 2. Fallback to cms_contents
    const { data: cmsRow } = await insforgeAdmin.database
      .from('cms_contents')
      .select('data')
      .eq('key', CMS_PUBLISHED_KEY)
      .maybeSingle();

    if (cmsRow && cmsRow.data && typeof cmsRow.data === 'object') {
      return mergeWithDefaults(cmsRow.data as Partial<WebsiteCustomizationConfig>);
    }
  } catch (err) {
    console.warn('Could not query published customization from DB, using fallback defaults:', err);
  }

  return { ...DEFAULT_WEBSITE_CUSTOMIZATION };
}

/**
 * Fetch draft & published customization state for Admin.
 */
export async function getWebsiteCustomizationState(): Promise<WebsiteCustomizationState> {
  let published: WebsiteCustomizationConfig = { ...DEFAULT_WEBSITE_CUSTOMIZATION };
  let draft: WebsiteCustomizationConfig = { ...DEFAULT_WEBSITE_CUSTOMIZATION };

  try {
    // 1. Check website_customizations table
    const [draftTable, publishedTable] = await Promise.all([
      insforgeAdmin.database
        .from('website_customizations')
        .select('data')
        .eq('id', 'draft')
        .maybeSingle(),
      insforgeAdmin.database
        .from('website_customizations')
        .select('data')
        .eq('id', 'published')
        .maybeSingle(),
    ]);

    if (publishedTable?.data) {
      published = mergeWithDefaults(publishedTable.data as Partial<WebsiteCustomizationConfig>);
    }
    if (draftTable?.data) {
      draft = mergeWithDefaults(draftTable.data as Partial<WebsiteCustomizationConfig>);
    } else if (publishedTable?.data) {
      draft = { ...published };
    }

    // If both table queries missed, check cms_contents fallback
    if (!publishedTable?.data && !draftTable?.data) {
      const [cmsDraft, cmsPublished] = await Promise.all([
        insforgeAdmin.database.from('cms_contents').select('data').eq('key', CMS_DRAFT_KEY).maybeSingle(),
        insforgeAdmin.database.from('cms_contents').select('data').eq('key', CMS_PUBLISHED_KEY).maybeSingle(),
      ]);

      if (cmsPublished?.data) {
        published = mergeWithDefaults(cmsPublished.data as Partial<WebsiteCustomizationConfig>);
      }
      if (cmsDraft?.data) {
        draft = mergeWithDefaults(cmsDraft.data as Partial<WebsiteCustomizationConfig>);
      } else if (cmsPublished?.data) {
        draft = { ...published };
      }
    }
  } catch (err) {
    console.error('Error fetching website customization state:', err);
  }

  const hasUnpublishedChanges =
    JSON.stringify(draft.branding) !== JSON.stringify(published.branding) ||
    JSON.stringify(draft.company) !== JSON.stringify(published.company) ||
    JSON.stringify(draft.columns) !== JSON.stringify(published.columns) ||
    JSON.stringify(draft.socialLinks) !== JSON.stringify(published.socialLinks) ||
    JSON.stringify(draft.copyright) !== JSON.stringify(published.copyright) ||
    JSON.stringify(draft.design) !== JSON.stringify(published.design);

  return {
    draft,
    published,
    hasUnpublishedChanges,
  };
}

/**
 * Save draft customization (without publishing to live site).
 */
export async function saveDraftWebsiteCustomization(
  updates: Partial<WebsiteCustomizationConfig>,
  adminUser: SessionUser,
  ipAddress = '127.0.0.1'
): Promise<WebsiteCustomizationConfig> {
  const currentState = await getWebsiteCustomizationState();
  const mergedDraft = mergeWithDefaults({
    ...currentState.draft,
    ...updates,
    branding: {
      ...currentState.draft.branding,
      ...(updates.branding || {}),
    },
    company: {
      ...currentState.draft.company,
      ...(updates.company || {}),
    },
    copyright: {
      ...currentState.draft.copyright,
      ...(updates.copyright || {}),
    },
    design: {
      ...currentState.draft.design,
      ...(updates.design || {}),
    },
    columns: updates.columns ?? currentState.draft.columns,
    socialLinks: updates.socialLinks ?? currentState.draft.socialLinks,
    updatedAt: new Date().toISOString(),
  });

  const now = new Date().toISOString();

  // 1. Try saving to website_customizations table
  try {
    await insforgeAdmin.database.from('website_customizations').upsert(
      [
        {
          id: 'draft',
          data: mergedDraft,
          updated_by: adminUser.id,
          updated_at: now,
        },
      ],
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Failed saving draft to website_customizations table, falling back to cms_contents:', err);
  }

  // 2. Also persist to cms_contents for dual-persistence redundancy
  try {
    await insforgeAdmin.database.from('cms_contents').upsert(
      [
        {
          key: CMS_DRAFT_KEY,
          data: mergedDraft,
          updated_at: now,
        },
      ],
      { onConflict: 'key' }
    );
  } catch (err) {
    console.error('Failed saving draft to cms_contents:', err);
  }

  await recordAuditLog(adminUser, 'SAVE_DRAFT_CUSTOMIZATION', 'Updated website customization draft settings', ipAddress);

  return mergedDraft;
}

/**
 * Publish draft customization to the live website.
 */
export async function publishWebsiteCustomization(
  adminUser: SessionUser,
  ipAddress = '127.0.0.1'
): Promise<WebsiteCustomizationConfig> {
  const state = await getWebsiteCustomizationState();
  const now = new Date().toISOString();

  const publishedConfig: WebsiteCustomizationConfig = {
    ...state.draft,
    publishedAt: now,
    publishedBy: adminUser.email || adminUser.name || adminUser.id,
    updatedAt: now,
  };

  // 1. Save published to website_customizations table
  try {
    await insforgeAdmin.database.from('website_customizations').upsert(
      [
        {
          id: 'published',
          data: publishedConfig,
          updated_by: adminUser.id,
          updated_at: now,
          published_at: now,
        },
      ],
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Failed publishing to website_customizations table, falling back to cms_contents:', err);
  }

  // 2. Persist published to cms_contents
  try {
    await insforgeAdmin.database.from('cms_contents').upsert(
      [
        {
          key: CMS_PUBLISHED_KEY,
          data: publishedConfig,
          updated_at: now,
        },
      ],
      { onConflict: 'key' }
    );
  } catch (err) {
    console.error('Failed publishing to cms_contents:', err);
  }

  await recordAuditLog(
    adminUser,
    'PUBLISH_CUSTOMIZATION',
    `Published website branding & footer changes live to public site (by ${adminUser.email})`,
    ipAddress
  );

  return publishedConfig;
}

/**
 * Reset customization to factory defaults.
 */
export async function resetWebsiteCustomizationToDefault(
  adminUser: SessionUser,
  ipAddress = '127.0.0.1'
): Promise<WebsiteCustomizationConfig> {
  const now = new Date().toISOString();
  const defaultConfig: WebsiteCustomizationConfig = {
    ...DEFAULT_WEBSITE_CUSTOMIZATION,
    updatedAt: now,
    publishedAt: now,
    publishedBy: adminUser.email || adminUser.name,
  };

  try {
    await insforgeAdmin.database.from('website_customizations').upsert(
      [
        { id: 'draft', data: defaultConfig, updated_by: adminUser.id, updated_at: now },
        { id: 'published', data: defaultConfig, updated_by: adminUser.id, updated_at: now, published_at: now },
      ],
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Failed resetting in website_customizations table, falling back to cms_contents:', err);
  }

  try {
    await insforgeAdmin.database.from('cms_contents').upsert(
      [
        { key: CMS_DRAFT_KEY, data: defaultConfig, updated_at: now },
        { key: CMS_PUBLISHED_KEY, data: defaultConfig, updated_at: now },
      ],
      { onConflict: 'key' }
    );
  } catch (err) {
    console.error('Failed resetting in cms_contents:', err);
  }

  await recordAuditLog(adminUser, 'RESET_CUSTOMIZATION', 'Reset website branding and footer settings to defaults', ipAddress);

  return defaultConfig;
}
