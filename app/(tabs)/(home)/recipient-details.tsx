
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, TextInput, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { DAILY_WHISPERS_THEMES } from "@/constants/Colors";
import { IconSymbol } from "@/components/IconSymbol";

interface Recipient {
  id: string;
  name: string;
  email: string;
  selectedTheme: string;
}

export default function RecipientDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedTheme, optionId, optionName, optionPrice, optionCount } = useLocalSearchParams();
  
  const count = parseInt(optionCount as string) || 1;
  const [recipients, setRecipients] = useState<Recipient[]>(
    Array.from({ length: count }, (_, i) => ({
      id: `recipient-${i}`,
      name: '',
      email: '',
      selectedTheme: selectedTheme as string || '',
    }))
  );
  
  const [buyerTheme, setBuyerTheme] = useState<string>('');
  const themes = Object.values(DAILY_WHISPERS_THEMES);

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const validateRecipients = () => {
    for (const recipient of recipients) {
      if (!recipient.name.trim()) {
        Alert.alert('Error', 'Please enter a name for all recipients');
        return false;
      }
      if (!recipient.email.trim() || !recipient.email.includes('@')) {
        Alert.alert('Error', 'Please enter a valid email for all recipients');
        return false;
      }
      if (!recipient.selectedTheme) {
        Alert.alert('Error', 'Please select a theme for all recipients');
        return false;
      }
    }

    if (optionId === 'shareTheLoveBigTime' && !buyerTheme) {
      Alert.alert('Error', 'Please select a bonus theme for yourself');
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (validateRecipients()) {
      console.log('Recipients validated:', recipients);
      console.log('Buyer theme:', buyerTheme);
      router.push({
        pathname: '/(tabs)/(home)/payment',
        params: {
          optionId,
          optionName,
          optionPrice,
          recipientsData: JSON.stringify(recipients),
          buyerTheme,
        }
      });
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

  const renderThemeSelector = (recipientId: string, currentTheme: string) => (
    <View style={styles.themeSelectorContainer}>
      <Text style={[styles.themeSelectorLabel, { color: theme.colors.text }]}>
        Select Theme
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.themeSelectorScroll}
      >
        {themes.map(t => (
          <Pressable
            key={t.id}
            style={[
              styles.themeOption,
              {
                backgroundColor: t.buttonColor,
                borderWidth: currentTheme === t.id ? 3 : 0,
                borderColor: currentTheme === t.id ? '#000' : 'transparent',
              }
            ]}
            onPress={() => updateRecipient(recipientId, 'selectedTheme', t.id)}
          >
            <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Recipient Details",
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              {optionName}
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Enter details for {count} recipient{count > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Recipients Section */}
          <View style={styles.recipientsContainer}>
            {recipients.map((recipient, index) => (
              <View 
                key={recipient.id}
                style={[
                  styles.recipientCard,
                  { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' }
                ]}
              >
                <Text style={[styles.recipientNumber, { color: theme.colors.text }]}>
                  Recipient {index + 1}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                        color: theme.colors.text,
                        borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                      }
                    ]}
                    placeholder="Enter recipient's name"
                    placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                    value={recipient.name}
                    onChangeText={(text) => updateRecipient(recipient.id, 'name', text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.dark ? '#3C3C3E' : '#FFFFFF',
                        color: theme.colors.text,
                        borderColor: theme.dark ? '#5C5C5E' : '#E5E5EA',
                      }
                    ]}
                    placeholder="Enter recipient's email"
                    placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                    keyboardType="email-address"
                    value={recipient.email}
                    onChangeText={(text) => updateRecipient(recipient.id, 'email', text)}
                  />
                </View>

                {renderThemeSelector(recipient.id, recipient.selectedTheme)}
              </View>
            ))}
          </View>

          {/* Buyer Theme Section (for Share the Love Big Time) */}
          {optionId === 'shareTheLoveBigTime' && (
            <View style={[
              styles.buyerThemeCard,
              { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' }
            ]}>
              <Text style={[styles.buyerThemeTitle, { color: theme.colors.text }]}>
                🎁 Your Bonus Theme
              </Text>
              <Text style={[styles.buyerThemeSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Choose a theme for yourself as a bonus!
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.themeSelectorScroll}
              >
                {themes.map(t => (
                  <Pressable
                    key={t.id}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: t.buttonColor,
                        borderWidth: buyerTheme === t.id ? 3 : 0,
                        borderColor: buyerTheme === t.id ? '#000' : 'transparent',
                      }
                    ]}
                    onPress={() => setBuyerTheme(t.id)}
                  >
                    <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleContinueToPayment}
          >
            <Text style={styles.continueButtonText}>
              Continue to Payment
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
  },
  recipientsContainer: {
    marginBottom: 24,
  },
  recipientCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  themeSelectorContainer: {
    marginTop: 12,
  },
  themeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  themeSelectorScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  themeOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeOptionEmoji: {
    fontSize: 28,
  },
  buyerThemeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyerThemeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buyerThemeSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  continueButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButtonContainer: {
    padding: 6,
  },
});
