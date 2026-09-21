import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_USERS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    let dbUsers: any[] = [];
    try {
      const { data, error } = await insforgeAdmin.database
        .from('users')
        .select('*, profile:matrimonial_profiles(*, photos:profile_photos(*))')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbUsers = data.map((u: any) => {
          const tier = u.subscription_tier ?? u.subscriptionTier ?? 'FREE';
          const totalConn = u.total_connections ?? u.totalConnections ?? (tier === 'VIP' || tier === 'PREMIUM_PLUS' ? 300 : tier === 'PREMIUM' ? 100 : 30);
          const usedConn = u.used_connections ?? u.usedConnections ?? 0;
          const remConn = u.remaining_connections ?? u.remainingConnections ?? Math.max(0, totalConn - usedConn);

          return {
            ...u,
            isVerified: u.is_verified ?? u.isVerified ?? false,
            accountStatus: u.account_status ?? u.accountStatus ?? 'ACTIVE',
            subscriptionTier: tier,
            totalConnections: totalConn,
            usedConnections: usedConn,
            remainingConnections: remConn,
            profileIdCode: u.profile_id_code || u.profileIdCode || null,
            phone: u.phone || u.profile?.phone || null,
            whatsappNumber: u.whatsapp_number || u.whatsappNumber || u.profile?.whatsapp_number || null,
            assignedConsultantId: u.assigned_consultant_id || u.assignedConsultantId || 'consultant-1',
            avatarUrl: u.avatar_url || u.avatarUrl || u.profile?.photos?.[0]?.url,
            profileId: u.profile?.id || null,
            createdAt: u.created_at || u.createdAt,
          };
        });
      }
    } catch (dbErr) {
      console.warn('InsForge DB query fallback to initial users:', dbErr);
    }

    const data = dbUsers.length > 0 ? dbUsers : INITIAL_USERS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbUsers.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
      message: 'Users retrieved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      isVerified,
      accountStatus,
      subscriptionTier,
      totalConnections,
      usedConnections,
      remainingConnections,
      assignedConsultantId,
      phone,
      whatsappNumber,
      role,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (isVerified !== undefined) updateData.is_verified = isVerified;
    if (accountStatus !== undefined) updateData.account_status = accountStatus;
    if (subscriptionTier !== undefined) updateData.subscription_tier = subscriptionTier;
    if (totalConnections !== undefined) updateData.total_connections = Number(totalConnections);
    if (usedConnections !== undefined) updateData.used_connections = Number(usedConnections);
    if (remainingConnections !== undefined) updateData.remaining_connections = Number(remainingConnections);
    if (assignedConsultantId !== undefined) updateData.assigned_consultant_id = assignedConsultantId;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsappNumber !== undefined) updateData.whatsapp_number = whatsappNumber;
    if (role !== undefined) updateData.role = role;

    const { data: updated, error } = await insforgeAdmin.database
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'User updated successfully in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update user.' },
      { status: 500 }
    );
  }
}
