
// Client-side Stripe payment utilities for React Native
import { supabase } from '@/integrations/supabase/client';
import { getPaymentErrorMessage } from './paymentConfig';

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
  recipientEmail?: string;
  recipientName?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
  errorCode?: string;
}

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

/**
 * Create a payment intent via Supabase Edge Function
 * This keeps your secret key secure on the server
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
        errorCode: 'invalid_amount',
      };
    }

    // Call Supabase Edge Function to create payment intent
    const { data: result, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'aud',
        description: data.description,
        metadata: data.metadata,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
      },
    });

    if (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: getPaymentErrorMessage('network_error'),
        errorCode: 'network_error',
      };
    }

    if (!result.success) {
      console.error('Payment intent creation failed:', result.error);
      return {
        success: false,
        error: getPaymentErrorMessage(result.errorCode || 'unknown'),
        errorCode: result.errorCode || 'unknown',
      };
    }

    console.log('Payment intent created:', result.paymentIntentId);

    return {
      success: true,
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: getPaymentErrorMessage('unknown'),
      errorCode: 'unknown',
    };
  }
}

/**
 * Confirm a payment with card details via Supabase Edge Function
 */
export async function confirmPayment(
  paymentIntentId: string,
  clientSecret: string,
  cardDetails: CardDetails
): Promise<PaymentResult> {
  try {
    console.log('Confirming payment for intent:', paymentIntentId);

    // Call Supabase Edge Function to confirm payment
    const { data: result, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        paymentIntentId,
        clientSecret,
        cardDetails: {
          number: cardDetails.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(cardDetails.expiryMonth, 10),
          exp_year: parseInt(cardDetails.expiryYear, 10),
          cvc: cardDetails.cvv,
          name: cardDetails.cardholderName,
        },
      },
    });

    if (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: getPaymentErrorMessage('network_error'),
        errorCode: 'network_error',
      };
    }

    if (!result.success) {
      console.error('Payment confirmation failed:', result.error);
      return {
        success: false,
        error: getPaymentErrorMessage(result.errorCode || 'unknown'),
        errorCode: result.errorCode || 'unknown',
      };
    }

    console.log('Payment confirmed successfully');

    return {
      success: true,
      paymentIntentId: result.paymentIntentId,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: getPaymentErrorMessage('unknown'),
      errorCode: 'unknown',
    };
  }
}

/**
 * Retrieve payment intent status via Supabase Edge Function
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<{
  status: string;
  error?: string;
}> {
  try {
    console.log('Retrieving payment intent status:', paymentIntentId);

    const { data: result, error } = await supabase.functions.invoke('get-payment-status', {
      body: { paymentIntentId },
    });

    if (error) {
      console.error('Error retrieving payment intent:', error);
      return { status: 'error', error: 'Network error' };
    }

    return { status: result.status };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return { status: 'error', error: 'Unknown error' };
  }
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

/**
 * Validate expiry date
 */
export function validateExpiryDate(month: string, year: string): boolean {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  if (yearNum < currentYear) {
    return false;
  }

  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Validate CVV
 */
export function validateCVV(cvv: string, cardNumber: string): boolean {
  // American Express cards have 4-digit CVV
  const isAmex = cardNumber.replace(/\s/g, '').startsWith('34') || 
                 cardNumber.replace(/\s/g, '').startsWith('37');
  
  const expectedLength = isAmex ? 4 : 3;
  return cvv.length === expectedLength && /^\d+$/.test(cvv);
}

/**
 * Get card type from card number
 */
export function getCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  
  return 'Unknown';
}
