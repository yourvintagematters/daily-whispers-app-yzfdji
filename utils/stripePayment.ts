
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

/** @deprecated Raw card details are no longer sent to the server. Use paymentMethodId from Stripe SDK instead. */
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
 * Confirm a payment using a Stripe payment method ID (token) via Supabase Edge Function.
 * Raw card details are never sent to the server.
 */
export async function confirmPayment(
  paymentIntentId: string,
  clientSecret: string,
  paymentMethodId: string
): Promise<PaymentResult> {
  try {
    console.log('[confirmPayment] Confirming payment for intent:', paymentIntentId, 'with paymentMethodId:', paymentMethodId);

    // Call Supabase Edge Function to confirm payment
    const { data: result, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        paymentIntentId,
        paymentMethodId,
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

// validateCardNumber, validateExpiryDate, validateCVV, getCardType removed —
// Stripe's CardField component handles all card validation natively.
