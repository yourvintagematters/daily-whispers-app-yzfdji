
/**
 * Payment configuration for the app
 * This file centralizes all payment-related settings
 */

export const PAYMENT_CONFIG = {
  // Stripe configuration
  stripe: {
    // Use test mode by default
    testMode: true,
    // Test API keys (replace with your actual keys)
    testPublishableKey: 'pk_test_51234567890abcdefghijklmnop',
    testSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    // Production keys (only use in production)
    livePublishableKey: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || '',
    liveSecretKey: process.env.STRIPE_LIVE_SECRET_KEY || '',
  },

  // Payment processing settings
  payment: {
    currency: 'usd',
    // Timeout for payment processing (in milliseconds)
    timeout: 30000,
    // Retry attempts for failed payments
    maxRetries: 3,
  },

  // Test card numbers for development
  testCards: {
    visa: '4242424242424242',
    visaDebit: '4000056655665556',
    mastercard: '5555555555554444',
    amex: '378282246310005',
    declined: '4000000000000002',
    cvcError: '4000000000000127',
    expiredCard: '4000000000000069',
  },

  // Test expiry dates
  testExpiry: {
    valid: '12/25',
    expired: '01/20',
  },

  // Test CVV
  testCVV: '123',
};

/**
 * Get the appropriate Stripe key based on environment
 */
export function getStripeKey(type: 'publishable' | 'secret'): string {
  const isProduction = process.env.NODE_ENV === 'production';

  if (type === 'publishable') {
    return isProduction
      ? PAYMENT_CONFIG.stripe.livePublishableKey
      : PAYMENT_CONFIG.stripe.testPublishableKey;
  }

  return isProduction
    ? PAYMENT_CONFIG.stripe.liveSecretKey
    : PAYMENT_CONFIG.stripe.testSecretKey;
}

/**
 * Check if we're in test mode
 */
export function isTestMode(): boolean {
  return PAYMENT_CONFIG.stripe.testMode;
}
