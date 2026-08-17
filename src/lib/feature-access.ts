import { SubscriptionTier } from './types';

export interface FeaturePermissions {
  canSendInterest: boolean;
  interestMonthlyLimit: number;
  canSendDirectMessages: boolean;
  canViewVisitors: boolean;
  canViewVerifiedContacts: boolean;
  canUseAdvancedFilters: boolean;
  canBoostProfile: boolean;
  hasPrioritySupport: boolean;
  hasFeaturedBadge: boolean;
  maxGalleryPhotos: number;
}

export class FeatureAccessService {
  private static tierPermissions: Record<SubscriptionTier, FeaturePermissions> = {
    FREE: {
      canSendInterest: true,
      interestMonthlyLimit: 5,
      canSendDirectMessages: false, // Only after mutual accept or with premium
      canViewVisitors: false,
      canViewVerifiedContacts: false,
      canUseAdvancedFilters: false,
      canBoostProfile: false,
      hasPrioritySupport: false,
      hasFeaturedBadge: false,
      maxGalleryPhotos: 2,
    },
    PREMIUM: {
      canSendInterest: true,
      interestMonthlyLimit: 50,
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: false,
      hasPrioritySupport: true,
      hasFeaturedBadge: true,
      maxGalleryPhotos: 8,
    },
    PREMIUM_PLUS: {
      canSendInterest: true,
      interestMonthlyLimit: 9999, // unlimited
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: true,
      hasPrioritySupport: true,
      hasFeaturedBadge: true,
      maxGalleryPhotos: 15,
    },
  };

  static getPermissions(tier: SubscriptionTier): FeaturePermissions {
    return this.tierPermissions[tier] || this.tierPermissions.FREE;
  }

  static canPerformAction(
    tier: SubscriptionTier,
    action: keyof FeaturePermissions
  ): boolean {
    const perms = this.getPermissions(tier);
    const val = perms[action];
    return typeof val === 'boolean' ? val : Boolean(val);
  }
}
