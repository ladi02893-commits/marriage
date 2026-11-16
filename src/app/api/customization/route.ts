import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rejectCrossSiteMutation } from '@/lib/api-auth';
import {
  getPublishedWebsiteCustomization,
  getWebsiteCustomizationState,
  publishWebsiteCustomization,
  resetWebsiteCustomizationToDefault,
  saveDraftWebsiteCustomization,
} from '@/lib/customization-store';
import { WebsiteCustomizationConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode');

    // Admin mode: returns draft, published, and hasUnpublishedChanges flag
    if (mode === 'admin') {
      const auth = await requireAdmin();
      if (auth.response) return auth.response;

      const state = await getWebsiteCustomizationState();
      return NextResponse.json({ success: true, data: state });
    }

    // Public website mode: returns published configuration
    const published = await getPublishedWebsiteCustomization();
    return NextResponse.json(
      { success: true, data: published },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get customization:', error);
    return NextResponse.json({ success: false, error: 'Could not load customization' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const action = String(body.action || '').toUpperCase();
    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (action === 'SAVE_DRAFT') {
      const updates = (body.updates || {}) as Partial<WebsiteCustomizationConfig>;
      const updatedDraft = await saveDraftWebsiteCustomization(updates, auth.user, ipAddress);
      const state = await getWebsiteCustomizationState();
      return NextResponse.json({
        success: true,
        message: 'Draft changes saved successfully.',
        data: {
          draft: updatedDraft,
          published: state.published,
          hasUnpublishedChanges: state.hasUnpublishedChanges,
        },
      });
    }

    if (action === 'PUBLISH') {
      const published = await publishWebsiteCustomization(auth.user, ipAddress);
      const state = await getWebsiteCustomizationState();
      return NextResponse.json({
        success: true,
        message: 'Website branding and footer customization published live.',
        data: {
          draft: state.draft,
          published,
          hasUnpublishedChanges: false,
        },
      });
    }

    if (action === 'RESET_DEFAULT') {
      const resetConfig = await resetWebsiteCustomizationToDefault(auth.user, ipAddress);
      return NextResponse.json({
        success: true,
        message: 'Website customization restored to default values.',
        data: {
          draft: resetConfig,
          published: resetConfig,
          hasUnpublishedChanges: false,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid customization action.' }, { status: 400 });
  } catch (error) {
    console.error('Customization mutation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process customization request' }, { status: 500 });
  }
}
