const DEFAULT_AFFILIATE_SIGNUP_URL = 'https://deriv.com/signup/';

/**
 * Centralized destination for all Tradeske marketing sign-up CTAs.
 * Configure NEXT_PUBLIC_DERIV_REFERRAL_LINK to attach affiliate attribution.
 */
export const TRADESKE_SIGNUP_URL =
  process.env.NEXT_PUBLIC_DERIV_REFERRAL_LINK?.trim() ||
  DEFAULT_AFFILIATE_SIGNUP_URL;
