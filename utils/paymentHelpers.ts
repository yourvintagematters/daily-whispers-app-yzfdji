
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRecord {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  option_name: string;
  option_id: string;
  buyer_theme?: string;
  recipient_count: number;
  recipients?: any;
  metadata?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get payment by payment intent ID
 */
export async function getPaymentByIntentId(
  paymentIntentId: string
): Promise<{ data: PaymentRecord | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return { data: null, error };
  }
}

/**
 * Get all payments (for admin/history view)
 */
export async function getAllPayments(
  limit: number = 50
): Promise<{ data: PaymentRecord[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching payments:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { data: null, error };
  }
}

/**
 * Get payments by status
 */
export async function getPaymentsByStatus(
  status: string,
  limit: number = 50
): Promise<{ data: PaymentRecord[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching payments by status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payments by status:', error);
    return { data: null, error };
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<{
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  totalPayments: number;
  error: any;
}> {
  try {
    // Get all payments
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('amount, status');

    if (allError) {
      console.error('Error fetching payment stats:', allError);
      return {
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalPayments: 0,
        error: allError,
      };
    }

    // Calculate statistics
    const totalPayments = allPayments?.length || 0;
    const successfulPayments = allPayments?.filter(p => p.status === 'succeeded').length || 0;
    const failedPayments = allPayments?.filter(p => p.status === 'failed').length || 0;
    const totalRevenue = allPayments
      ?.filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      totalRevenue,
      successfulPayments,
      failedPayments,
      totalPayments,
      error: null,
    };
  } catch (error) {
    console.error('Error calculating payment stats:', error);
    return {
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      totalPayments: 0,
      error,
    };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    succeeded: 'Successful',
    failed: 'Failed',
    canceled: 'Canceled',
    refunded: 'Refunded',
    processing: 'Processing',
    requires_action: 'Requires Action',
  };

  return statusMap[status] || status;
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    succeeded: '#34C759', // Green
    failed: '#FF3B30', // Red
    canceled: '#FF9500', // Orange
    refunded: '#5856D6', // Purple
    processing: '#007AFF', // Blue
    requires_action: '#FFB81C', // Yellow
  };

  return colorMap[status] || '#8E8E93'; // Gray for unknown
}

/**
 * Check if payment is complete
 */
export function isPaymentComplete(status: string): boolean {
  return ['succeeded', 'refunded'].includes(status);
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(status: string): boolean {
  return ['failed', 'canceled'].includes(status);
}

/**
 * Check if payment is pending
 */
export function isPaymentPending(status: string): boolean {
  return ['processing', 'requires_action'].includes(status);
}
