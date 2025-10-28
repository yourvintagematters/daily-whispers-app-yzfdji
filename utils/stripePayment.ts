
import Stripe from 'stripe';

// Initialize Stripe with the secret key
// In a production app, this should be stored securely in environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

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
 * This should be called from your backend
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

    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.warn('Stripe secret key not configured. Using test mode.');
      // For testing purposes, return a mock response
      return {
        success: true,
        paymentIntentId: `pi_test_${Date.now()}`,
        clientSecret: `pi_test_${Date.now()}_secret_test`,
      };
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || 'usd',
      description: data.description,
      metadata: data.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
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
 * This is a simplified version - in production, use Stripe.js or a payment library
 */
export async function confirmPayment(
  paymentIntentId: string,
  cardToken: string
): Promise<PaymentResult> {
  try {
    console.log('Confirming payment for intent:', paymentIntentId);

    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      // For testing purposes, return a mock response
      return {
        success: true,
        paymentIntentId,
      };
    }

    // In a real implementation, you would confirm the payment intent
    // with the card token from the client
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId,
      };
    }

    return {
      success: false,
      error: `Payment status: ${paymentIntent.status}`,
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
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return 'succeeded';
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
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
