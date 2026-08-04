
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from "@react-navigation/native";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import { IconSymbol } from "@/components/IconSymbol";
import {
  createPaymentIntent,
  confirmPayment,
} from "@/utils/stripePayment";
import { isTestMode } from "@/utils/paymentConfig";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const stripe = useStripe();
  const { optionName, optionPrice, recipientsData, buyerTheme, optionId, buyerName, buyerEmail } = useLocalSearchParams();

  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleCompletePayment = async () => {
    console.log('[Payment] Complete Payment button pressed');

    if (!cardComplete) {
      const msg = 'Please enter complete card details';
      setPaymentError(msg);
      Alert.alert('Validation Error', msg);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log('[Payment] Processing payment with Stripe SDK...');
      console.log('[Payment] Test mode:', isTestMode());
      console.log('[Payment] Payment amount:', optionPrice);

      // Step 1: Tokenize card via Stripe SDK — no raw card data leaves the device
      console.log('[Payment] Creating payment method via Stripe SDK...');
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (pmError || !paymentMethod) {
        const errMsg = pmError?.message ?? 'Failed to tokenize card';
        console.error('[Payment] createPaymentMethod error:', pmError);
        setPaymentError(errMsg);
        Alert.alert('Card Error', errMsg);
        setIsProcessing(false);
        return;
      }

      console.log('[Payment] Payment method created:', paymentMethod.id);

      // Step 2: Create payment intent on the server
      const recipients = recipientsData ? JSON.parse(recipientsData as string) : [];
      console.log('[Payment] Creating payment intent on server...');
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
        console.error('[Payment] Payment intent creation failed:', paymentIntentResult.error);
        setPaymentError(paymentIntentResult.error || 'Failed to create payment intent');
        Alert.alert('Payment Error', paymentIntentResult.error || 'Failed to create payment intent');
        setIsProcessing(false);
        return;
      }

      console.log('[Payment] Payment intent created:', paymentIntentResult.paymentIntentId);

      // Step 3: Confirm payment with payment method ID (no raw card data)
      console.log('[Payment] Confirming payment with paymentMethodId:', paymentMethod.id);
      const confirmResult = await confirmPayment(
        paymentIntentResult.paymentIntentId!,
        paymentIntentResult.clientSecret!,
        paymentMethod.id
      );

      if (!confirmResult.success) {
        console.error('[Payment] Payment confirmation failed:', confirmResult.error);
        setPaymentError(confirmResult.error || 'Payment failed');
        Alert.alert(
          'Payment Failed',
          confirmResult.error || 'There was an error processing your payment. Please try again.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      console.log('[Payment] Payment confirmed successfully');

      // Step 4: Record payment in database
      try {
        console.log('[Payment] Recording payment in database...');
        console.log('[Payment] Invoking record-payment with buyerName:', buyerName);
        const { data: recordResult, error: recordError } = await supabase.functions.invoke('record-payment', {
          body: {
            paymentIntentId: confirmResult.paymentIntentId,
            amount: parseFloat(optionPrice as string),
            currency: 'aud',
            status: 'succeeded',
            optionName: optionName as string,
            optionId: optionId,
            buyerTheme: buyerTheme as string,
            buyerName: buyerName as string || null,
            buyerEmail: buyerEmail as string || null,
            recipientCount: recipients.length,
            recipients,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        });

        if (recordError) {
          console.error('[Payment] Error recording payment:', recordError);
        } else {
          console.log('[Payment] Payment recorded in database:', recordResult);
        }
      } catch (recordError) {
        console.error('[Payment] Error recording payment:', recordError);
      }

      // Step 5: Show success and navigate
      Alert.alert(
        'Payment Successful! 🎉',
        'Your purchase has been completed. Recipients will receive their daily quotes starting tomorrow!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('[Payment] Navigating to home after successful payment');
              router.replace('/(tabs)/(home)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Payment] Unexpected payment error:', error);
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
      onPress={() => {
        console.log('[Payment] Back button pressed');
        router.back();
      }}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="chevron.left" color="#5d8aa8" />
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
            Platform.OS !== 'ios' && styles.scrollContainerWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Complete Payment
            </Text>
            <Text style={styles.subtitle}>
              Secure payment for your gift
            </Text>
            {isTestMode() && (
              <View style={styles.testModeIndicator}>
                <IconSymbol name="info.circle.fill" color="#FF9500" />
                <Text style={styles.testModeText}>
                  Test Mode - Use card: 4242 4242 4242 4242
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {optionName}
              </Text>
              <Text style={styles.summaryValue}>
                AUD ${optionPrice}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>
                Total
              </Text>
              <Text style={styles.summaryTotalPrice}>
                AUD ${optionPrice}
              </Text>
            </View>
          </View>

          {/* Error Display */}
          {paymentError && (
            <View style={styles.errorCard}>
              <IconSymbol name="exclamationmark.triangle.fill" color="#FF3B30" />
              <Text style={styles.errorText}>
                {paymentError}
              </Text>
            </View>
          )}

          {/* Payment Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Card Details
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Cardholder Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={cardholderName}
                onChangeText={(text) => {
                  console.log('[Payment] Cardholder name updated');
                  setCardholderName(text);
                  setPaymentError(null);
                }}
                editable={!isProcessing}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Card Information
              </Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{ number: '4242 4242 4242 4242' }}
                cardStyle={{
                  backgroundColor: '#F2F2F7',
                  textColor: '#1a1a1a',
                  placeholderColor: '#999999',
                  borderColor: '#E5E5EA',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                style={styles.cardField}
                onCardChange={(details) => {
                  console.log('[Payment] Card field changed, complete:', details.complete);
                  setCardComplete(details.complete);
                  setPaymentError(null);
                }}
              />
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <IconSymbol name="lock.fill" color="#5d8aa8" />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted with Stripe
            </Text>
          </View>

          {/* Complete Payment Button */}
          <Pressable
            style={[
              styles.completeButton,
              { opacity: isProcessing ? 0.6 : 1 },
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
            onPress={() => {
              console.log('[Payment] Cancel button pressed');
              router.back();
            }}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </Pressable>

          {/* Privacy Policy & Terms of Service */}
          <View style={styles.legalLinksRow}>
            <Pressable
              onPress={() => {
                console.log('[Payment] Privacy Policy link pressed');
                WebBrowser.openBrowserAsync('https://raw.githubusercontent.com/yourvintagematters/Privacy_Policy/refs/heads/main/Privacy_Policy');
              }}
            >
              <Text style={styles.privacyLinkText}>Privacy Policy</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>·</Text>
            <Pressable
              onPress={() => {
                console.log('[Payment] Terms of Service link pressed');
                router.push('/terms');
              }}
            >
              <Text style={styles.privacyLinkText}>Terms of Service</Text>
            </Pressable>
          </View>
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
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
    color: '#2c5f7a',
  },
  testModeIndicator: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3CD',
  },
  testModeText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    color: '#FF9500',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
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
    color: '#1a1a1a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#2c5f7a',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5d8aa8',
  },
  errorCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE5E5',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    color: '#FF3B30',
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F2F2F7',
    color: '#1a1a1a',
    borderColor: '#E5E5EA',
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  securityNotice: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  securityText: {
    fontSize: 13,
    flex: 1,
    color: '#2c5f7a',
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#5d8aa8',
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
    borderColor: '#5d8aa8',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5d8aa8',
  },
  headerButtonContainer: {
    padding: 6,
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    gap: 6,
  },
  legalSeparator: {
    fontSize: 12,
    color: '#5d8aa8',
  },
  privacyLinkText: {
    fontSize: 12,
    color: '#5d8aa8',
    textDecorationLine: 'underline',
  },
});
