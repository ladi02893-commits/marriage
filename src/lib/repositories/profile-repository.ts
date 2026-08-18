import { insforgeAdmin } from '@/lib/insforge/server';
import { Religion, Gender, MaritalStatus } from '@/lib/types';

export class ProfileRepository {
  /**
   * Search candidate profiles with filters
   */
  static async searchProfiles(filters: {
    gender?: Gender;
    religion?: Religion;
    minAge?: number;
    maxAge?: number;
    country?: string;
    city?: string;
    maritalStatus?: MaritalStatus;
    page?: number;
    pageSize?: number;
  }) {
    const {
      gender,
      religion,
      minAge,
      maxAge,
      country,
      city,
      maritalStatus,
      page = 1,
      pageSize = 12,
    } = filters;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = insforgeAdmin.database
      .from('matrimonial_profiles')
      .select(
        '*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*), user:users(id, name, is_verified, subscription_tier, account_status)',
        { count: 'exact' }
      );

    if (gender) query = query.eq('gender', gender);
    if (religion) query = query.eq('religion', religion);
    if (maritalStatus) query = query.eq('marital_status', maritalStatus);
    if (country) query = query.ilike('country', `%${country}%`);
    if (city) query = query.ilike('city', `%${city}%`);

    if (minAge || maxAge) {
      const now = new Date();
      if (maxAge) {
        const minDob = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
        query = query.gte('date_of_birth', minDob.toISOString());
      }
      if (minAge) {
        const maxDob = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        query = query.lte('date_of_birth', maxDob.toISOString());
      }
    }

    const { data: profiles, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in searchProfiles:', error);
      return {
        profiles: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }

    const total = count || (profiles ? profiles.length : 0);

    return {
      profiles: profiles || [],
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get single matrimonial dossier by ID
   */
  static async getProfileById(profileId: string) {
    const { data, error } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .select(
        '*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*), user:users(id, email, name, is_verified, subscription_tier, account_status)'
      )
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error in getProfileById:', error);
      return null;
    }

    return data;
  }

  /**
   * Increment profile view count
   */
  static async incrementViewCount(profileId: string) {
    const { data: profile } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .select('view_count')
      .eq('id', profileId)
      .single();

    const currentCount = profile?.view_count || 0;

    const { data, error } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .update({ view_count: currentCount + 1 })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error in incrementViewCount:', error);
    }

    return data;
  }
}
