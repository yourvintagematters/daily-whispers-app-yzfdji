
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, TextInput, Alert, ImageBackground } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { createPaymentIntent, validateCardNumber, createTestToken } from "@/utils/stripePayment";
import { isTestMode } from "@/utils/paymentConfig";

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { optionName, optionPrice, recipientsData, buyerTheme } = useLocalSearchParams();
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updatePaymentData = (field: keyof PaymentFormData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
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

  const validatePaymentData = () => {
    const cardNumberCleaned = paymentData.cardNumber.replace(/\s/g, '');
    
    if (!validateCardNumber(cardNumberCleaned)) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }
    if (!paymentData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Error', 'Please enter expiry date in MM/YY format');
      return false;
    }
    if (!paymentData.cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    if (!paymentData.cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    return true;
  };

  const handleCompletePayment = async () => {
    if (!validatePaymentData()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Processing payment with Stripe...');
      console.log('Test mode:', isTestMode());
      console.log('Payment amount:', optionPrice);

      // Create payment intent with Stripe
      const paymentIntentResult = await createPaymentIntent({
        amount: parseFloat(optionPrice as string),
        currency: 'usd',
        description: `Daily Whispers - ${optionName}`,
        metadata: {
          optionName: optionName as string,
          buyerTheme: buyerTheme as string,
          recipientCount: recipientsData ? JSON.parse(recipientsData as string).length.toString() : '0',
        },
      });

      if (!paymentIntentResult.success) {
        Alert.alert('Payment Error', paymentIntentResult.error || 'Failed to create payment intent');
        setIsProcessing(false);
        return;
      }

      console.log('Payment intent created:', paymentIntentResult.paymentIntentId);

      // Create a test token for the card
      const cardToken = createTestToken(paymentData.cardNumber);
      console.log('Card token created:', cardToken);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would confirm the payment with Stripe
      // For now, we'll simulate a successful payment
      console.log('Payment processed successfully');

      Alert.alert(
        'Payment Successful!',
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
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
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
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1600&fit=crop' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={[styles.container, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]}>
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
                  Test Mode - Use test card numbers
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={[
            styles.summaryCard,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#e3dac9' }
          ]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                {optionName}
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${optionPrice}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA' }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotal, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text style={[styles.summaryTotalPrice, { color: theme.colors.primary }]}>
                ${optionPrice}
              </Text>
            </View>
          </View>

          {/* Payment Form */}
          <View style={[
            styles.formCard,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#e3dac9' }
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
                    backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.dark ? '#5C5C5E' : '#d4cfc0',
                  }
                ]}
                placeholder="John Doe"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                value={paymentData.cardholderName}
                onChangeText={(text) => updatePaymentData('cardholderName', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Card Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.dark ? '#5C5C5E' : '#d4cfc0',
                  }
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                keyboardType="numeric"
                value={formatCardNumber(paymentData.cardNumber)}
                onChangeText={(text) => updatePaymentData('cardNumber', text)}
                maxLength={19}
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
                      backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                      color: theme.colors.text,
                      borderColor: theme.dark ? '#5C5C5E' : '#d4cfc0',
                    }
                  ]}
                  placeholder="MM/YY"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  keyboardType="numeric"
                  value={formatExpiryDate(paymentData.expiryDate)}
                  onChangeText={(text) => updatePaymentData('expiryDate', text)}
                  maxLength={5}
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
                      backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                      color: theme.colors.text,
                      borderColor: theme.dark ? '#5C5C5E' : '#d4cfc0',
                    }
                  ]}
                  placeholder="123"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  keyboardType="numeric"
                  value={paymentData.cvv}
                  onChangeText={(text) => updatePaymentData('cvv', text)}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Security Notice */}
          <View style={[
            styles.securityNotice,
            { backgroundColor: theme.dark ? '#2C2C2E' : '#e3dac9' }
          ]}>
            <IconSymbol name="lock.fill" color={theme.colors.primary} />
            <Text style={[styles.securityText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Your payment information is secure and encrypted
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
            <Text style={styles.completeButtonText}>
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </Text>
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
      </ImageBackground>
    </>
  );
}


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
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
