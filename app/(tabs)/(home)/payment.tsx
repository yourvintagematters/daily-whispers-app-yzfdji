
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { 
  createPaymentIntent, 
  confirmPayment, 
  validateCardNumber, 
  validateExpiryDate,
  validateCVV,
  getCardType,
  CardDetails 
} from "@/utils/stripePayment";
import { isTestMode } from "@/utils/paymentConfig";
import { supabase } from "@/app/integrations/supabase/client";

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { optionName, optionPrice, recipientsData, buyerTheme, optionId } = useLocalSearchParams();
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string>('');

  const updatePaymentData = (field: keyof PaymentFormData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
    setPaymentError(null); // Clear error when user types
    
    // Update card type when card number changes
    if (field === 'cardNumber') {
      setCardType(getCardType(value));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validatePaymentData = (): { valid: boolean; error?: string } => {
    const cardNumberCleaned = paymentData.cardNumber.replace(/\s/g, '');
    
    if (!paymentData.cardholderName.trim()) {
      return { valid: false, error: 'Please enter the cardholder name' };
    }

    if (!validateCardNumber(cardNumberCleaned)) {
      return { valid: false, error: 'Please enter a valid card number' };
    }

    const expiryParts = paymentData.expiryDate.split('/');
    if (expiryParts.length !== 2) {
      return { valid: false, error: 'Please enter expiry date in MM/YY format' };
    }

    const [month, year] = expiryParts;
    if (!validateExpiryDate(month, year)) {
      return { valid: false, error: 'Card has expired or expiry date is invalid' };
    }

    if (!validateCVV(paymentData.cvv, cardNumberCleaned)) {
      return { valid: false, error: `Please enter a valid ${cardType === 'American Express' ? '4' : '3'}-digit CVV` };
    }

    return { valid: true };
  };

  const handleCompletePayment = async () => {
    // Validate payment data
    const validation = validatePaymentData();
    if (!validation.valid) {
      setPaymentError(validation.error || 'Invalid payment details');
      Alert.alert('Validation Error', validation.error);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      console.log('Processing payment with Stripe...');
      console.log('Test mode:', isTestMode());
      console.log('Payment amount:', optionPrice);

      // Step 1: Create payment intent
      const recipients = recipientsData ? JSON.parse(recipientsData as string) : [];
      const paymentIntentResult = await createPaymentIntent({
        amount: parseFloat(optionPrice as string),
        currency: 'aud',
        description: `Daily Whispers - ${optionName}`,
        metadata: {
          optionName: optionName as string,
          buyerTheme: buyerTheme as string,
          recipientCount: recipients.length.toString(),
        },
        recipientEmail: recipients.length > 0 ? recipients[0].email : undefined,
        recipientName: recipients.length > 0 ? recipients[0].name : undefined,
      });

      if (!paymentIntentResult.success) {
        console.error('Payment intent creation failed:', paymentIntentResult.error);
        setPaymentError(paymentIntentResult.error || 'Failed to create payment intent');
        Alert.alert('Payment Error', paymentIntentResult.error || 'Failed to create payment intent');
        setIsProcessing(false);
        return;
      }

      console.log('Payment intent created:', paymentIntentResult.paymentIntentId);

      // Step 2: Prepare card details
      const expiryParts = paymentData.expiryDate.split('/');
      const cardDetails: CardDetails = {
        cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
        expiryMonth: expiryParts[0],
        expiryYear: `20${expiryParts[1]}`, // Convert YY to YYYY
        cvv: paymentData.cvv,
        cardholderName: paymentData.cardholderName,
      };

      // Step 3: Confirm payment
      const confirmResult = await confirmPayment(
        paymentIntentResult.paymentIntentId!,
        paymentIntentResult.clientSecret!,
        cardDetails
      );

      if (!confirmResult.success) {
        console.error('Payment confirmation failed:', confirmResult.error);
        setPaymentError(confirmResult.error || 'Payment failed');
        Alert.alert(
          'Payment Failed',
          confirmResult.error || 'There was an error processing your payment. Please try again.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      console.log('Payment processed successfully');

      // Step 4: Record payment in database
      try {
        const recipients = recipientsData ? JSON.parse(recipientsData as string) : [];
        const { data: recordResult, error: recordError } = await supabase.functions.invoke('record-payment', {
          body: {
            paymentIntentId: confirmResult.paymentIntentId,
            amount: parseFloat(optionPrice as string),
            currency: 'aud',
            status: 'succeeded',
            optionName: optionName as string,
            optionId: optionId,
            buyerTheme: buyerTheme as string,
            recipientCount: recipients.length,
            recipients,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        });

        if (recordError) {
          console.error('Error recording payment:', recordError);
          // Don't fail the payment if recording fails
        } else {
          console.log('Payment recorded in database:', recordResult);
        }
      } catch (recordError) {
        console.error('Error recording payment:', recordError);
        // Don't fail the payment if recording fails
      }

      // Step 5: Show success message and navigate
      Alert.alert(
        'Payment Successful! 🎉',
        'Your purchase has been completed. Recipients will receive their daily quotes starting tomorrow!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/(home)');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      Alert.alert(
        'Payment Error',
        'There was an unexpected error processing your payment. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => router.back()}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="chevron.left" color={theme.colors.primary} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Payment",
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: '#E6F2F8' }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && styles.scrollContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Complete Payment
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Secure payment for your gift
            </Text>
            {isTestMode() && (
              <View style={[styles.testModeIndicator, { backgroundColor: theme.dark ? '#3C3C3E' : '#FFF3CD' }]}>
                <IconSymbol name="info.circle.fill" color={theme.dark ? '#FFB81C' : '#FF9500'} />
                <Text style={[styles.testModeText, { color: theme.dark ? '#FFB81C' : '#FF9500' }]}>
                  Test Mode - Use card: 4242 4242 4242 4242
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={[
            styles.summaryCard,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                {optionName}
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                AUD ${optionPrice}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA' }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotal, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text style={[styles.summaryTotalPrice, { color: theme.colors.primary }]}>
                AUD ${optionPrice}
              </Text>
            </View>
          </View>

          {/* Error Display */}
          {paymentError && (
            <View style={[styles.errorCard, { backgroundColor: theme.dark ? '#3C1F1F' : '#FFE5E5' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" color="#FF3B30" />
              <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                {paymentError}
              </Text>
            </View>
          )}

          {/* Payment Form */}
          <View style={[
            styles.formCard,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Card Details
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Cardholder Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#3C3C3E' : '#F2F2F7',
                    color: theme.colors.text,
                    borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                  }
                ]}
                placeholder="John Doe"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                value={paymentData.cardholderName}
                onChangeText={(text) => updatePaymentData('cardholderName', text)}
                editable={!isProcessing}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Card Number
                </Text>
                {cardType && (
                  <Text style={[styles.cardTypeLabel, { color: theme.colors.primary }]}>
                    {cardType}
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#3C3C3E' : '#F2F2F7',
                    color: theme.colors.text,
                    borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                  }
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                keyboardType="numeric"
                value={formatCardNumber(paymentData.cardNumber)}
                onChangeText={(text) => updatePaymentData('cardNumber', text)}
                maxLength={19}
                editable={!isProcessing}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Expiry Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.dark ? '#3C3C3E' : '#F2F2F7',
                      color: theme.colors.text,
                      borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                    }
                  ]}
                  placeholder="MM/YY"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  keyboardType="numeric"
                  value={formatExpiryDate(paymentData.expiryDate)}
                  onChangeText={(text) => updatePaymentData('expiryDate', text)}
                  maxLength={5}
                  editable={!isProcessing}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  CVV
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.dark ? '#3C3C3E' : '#F2F2F7',
                      color: theme.colors.text,
                      borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                    }
                  ]}
                  placeholder="123"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  keyboardType="numeric"
                  value={paymentData.cvv}
                  onChangeText={(text) => updatePaymentData('cvv', text)}
                  maxLength={4}
                  secureTextEntry
                  editable={!isProcessing}
                />
              </View>
            </View>
          </View>

          {/* Security Notice */}
          <View style={[
            styles.securityNotice,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <IconSymbol name="lock.fill" color={theme.colors.primary} />
            <Text style={[styles.securityText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Your payment information is secure and encrypted with Stripe
            </Text>
          </View>

          {/* Complete Payment Button */}
          <Pressable
            style={[
              styles.completeButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: isProcessing ? 0.6 : 1,
              }
            ]}
            onPress={handleCompletePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={[styles.completeButtonText, { marginLeft: 8 }]}>
                  Processing...
                </Text>
              </View>
            ) : (
              <Text style={styles.completeButtonText}>
                Complete Payment
              </Text>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isProcessing}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scrollContainerWithTabBar: {
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
  },
  testModeIndicator: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testModeText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
    borderTopWidth: 1,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  securityNotice: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    flex: 1,
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtonContainer: {
    padding: 6,
  },
});
