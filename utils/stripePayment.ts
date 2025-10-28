
// Client-side Stripe payment utilities for React Native
// Note: This is a simplified implementation for testing purposes
// In production, you should use a proper backend service to handle payments

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Create a payment intent for Stripe payment processing
 * In a real app, this would call your backend API
 */
export async function createPaymentIntent(
  data: PaymentIntentData
): Promise<PaymentResult> {
  try {
    console.log('Creating payment intent with data:', data);

    // Validate input
    if (!data.amount || data.amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount',
      };
    }

    // For testing purposes, return a mock response
    // In production, call your backend API to create a real payment intent
    const mockPaymentIntentId = `pi_test_${Date.now()}`;
    const mockClientSecret = `${mockPaymentIntentId}_secret_test`;

    console.log('Payment intent created (test mode):', mockPaymentIntentId);

    return {
      success: true,
      paymentIntentId: mockPaymentIntentId,
      clientSecret: mockClientSecret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Confirm a payment with card details
 * This is a simplified version - in production, use a proper backend service
 */
export async function confirmPayment(
  paymentIntentId: string,
  cardToken: string
): Promise<PaymentResult> {
  try {
    console.log('Confirming payment for intent:', paymentIntentId);

    // For testing purposes, return a mock response
    // In production, call your backend API to confirm the payment
    return {
      success: true,
      paymentIntentId,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    };
  }
}

/**
 * Retrieve payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
  try {
    console.log('Retrieving payment intent status:', paymentIntentId);
    // For testing purposes, return succeeded
    // In production, call your backend API to get the real status
    return 'succeeded';
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return 'error';
  }
}

/**
 * Create a test token for development
 * This generates a mock token for testing without real card processing
 */
export function createTestToken(cardNumber: string): string {
  // In test mode, we create a mock token
  // In production, use Stripe.js to tokenize the card
  const tokenHash = `tok_test_${cardNumber.slice(-4)}_${Date.now()}`;
  console.log('Created test token:', tokenHash);
  return tokenHash;
}

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
