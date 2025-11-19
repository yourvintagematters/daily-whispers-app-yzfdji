
/**
 * Payment configuration for the app
 * This file centralizes all payment-related settings
 */

export const PAYMENT_CONFIG = {
  // Stripe configuration
  stripe: {
    // PRODUCTION MODE - Set to false for live deployment
    testMode: false,
    // Test API keys (for development only)
    testPublishableKey: 'pk_test_51SN0VCD17kmTdMDJe4HOvt0h9XSdRMqtui4g4jgbMgKd4mmAEvKuW4NGVUdwyRCbIatOj6X75fE6x98lmABoTstG00tg3PE9L4',
    // Production keys - Your live publishable key
    livePublishableKey: 'pk_live_51SN0VCD17kmTdMDJ7hWhbpcjEBmbQXG1qodb58IvAyqukZOWCHDl8Ht1eZ7CJPyq2jiTODJ7qSUWHQYvv8cA46zG00oP7nHikR',
  },

  // Payment processing settings
  payment: {
    currency: 'usd',
    // Timeout for payment processing (in milliseconds)
    timeout: 30000,
    // Retry attempts for failed payments
    maxRetries: 3,
  },

  // Test card numbers for development (DO NOT USE IN PRODUCTION)
  testCards: {
    visa: '4242424242424242',
    visaDebit: '4000056655665556',
    mastercard: '5555555555554444',
    amex: '378282246310005',
    declined: '4000000000000002',
    insufficientFunds: '4000000000009995',
    lostCard: '4000000000009987',
    stolenCard: '4000000000009979',
    expiredCard: '4000000000000069',
    incorrectCVC: '4000000000000127',
    processingError: '4000000000000119',
    rateLimit: '4000000000006975',
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
 * Get the appropriate Stripe publishable key based on environment
 */
export function getStripePublishableKey(): string {
  // In production, we use the live key
  return PAYMENT_CONFIG.stripe.testMode
    ? PAYMENT_CONFIG.stripe.testPublishableKey
    : PAYMENT_CONFIG.stripe.livePublishableKey;
}

/**
 * Check if we're in test mode
 */
export function isTestMode(): boolean {
  return PAYMENT_CONFIG.stripe.testMode;
}

/**
 * Get user-friendly error messages for Stripe errors
 */
export function getPaymentErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'insufficient_funds': 'Your card has insufficient funds. Please try a different card.',
    'lost_card': 'This card has been reported lost. Please use a different card.',
    'stolen_card': 'This card has been reported stolen. Please use a different card.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'The security code (CVV) is incorrect. Please check and try again.',
    'processing_error': 'An error occurred while processing your card. Please try again.',
    'incorrect_number': 'The card number is incorrect. Please check and try again.',
    'invalid_expiry_month': 'The expiration month is invalid. Please check and try again.',
    'invalid_expiry_year': 'The expiration year is invalid. Please check and try again.',
    'rate_limit': 'Too many requests. Please wait a moment and try again.',
    'network_error': 'Network connection error. Please check your internet and try again.',
    'timeout': 'The request timed out. Please try again.',
    'unknown': 'An unexpected error occurred. Please try again or contact support.',
  };

  return errorMessages[errorCode] || errorMessages['unknown'];
}
