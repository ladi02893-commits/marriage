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
    BASIC: {
      canSendInterest: true,
      interestMonthlyLimit: 30,
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: false,
      hasPrioritySupport: false,
      hasFeaturedBadge: false,
      maxGalleryPhotos: 5,
    },
    PREMIUM: {
      canSendInterest: true,
      interestMonthlyLimit: 100,
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: true,
      hasPrioritySupport: true,
      hasFeaturedBadge: true,
      maxGalleryPhotos: 10,
    },
    PREMIUM_PLUS: {
      canSendInterest: true,
      interestMonthlyLimit: 300,
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: true,
      hasPrioritySupport: true,
      hasFeaturedBadge: true,
      maxGalleryPhotos: 20,
    },
    VIP: {
      canSendInterest: true,
      interestMonthlyLimit: 300,
      canSendDirectMessages: true,
      canViewVisitors: true,
      canViewVerifiedContacts: true,
      canUseAdvancedFilters: true,
      canBoostProfile: true,
      hasPrioritySupport: true,
      hasFeaturedBadge: true,
      maxGalleryPhotos: 25,
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
