
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
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
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
      <IconSymbol name="chevron.left" color="#5d8aa8" />
    </Pressable>
  );

  const renderThemeSelector = (recipientId: string, currentTheme: string) => {
    // Split themes into two rows of 4
    const firstRow = themes.slice(0, 4);
    const secondRow = themes.slice(4, 8);

    return (
      <View style={styles.themeSelectorContainer}>
        <Text style={styles.themeSelectorLabel}>
          Select Theme
        </Text>
        <View style={styles.themeGrid}>
          <View style={styles.themeRow}>
            {firstRow.map(t => (
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
                onMouseEnter={() => setHoveredTheme(t.id)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
                {hoveredTheme === t.id && (
                  <View style={styles.themeTooltip}>
                    <Text style={styles.themeTooltipText}>
                      {t.name}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <View style={styles.themeRow}>
            {secondRow.map(t => (
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
                onMouseEnter={() => setHoveredTheme(t.id)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
                {hoveredTheme === t.id && (
                  <View style={styles.themeTooltip}>
                    <Text style={styles.themeTooltipText}>
                      {t.name}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderBuyerThemeSelector = () => {
    const firstRow = themes.slice(0, 4);
    const secondRow = themes.slice(4, 8);

    return (
      <View style={styles.themeGrid}>
        <View style={styles.themeRow}>
          {firstRow.map(t => (
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
              onMouseEnter={() => setHoveredTheme(t.id)}
              onMouseLeave={() => setHoveredTheme(null)}
            >
              <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
              {hoveredTheme === t.id && (
                <View style={styles.themeTooltip}>
                  <Text style={styles.themeTooltipText}>
                    {t.name}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.themeRow}>
          {secondRow.map(t => (
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
              onMouseEnter={() => setHoveredTheme(t.id)}
              onMouseLeave={() => setHoveredTheme(null)}
            >
              <Text style={styles.themeOptionEmoji}>{t.emoji}</Text>
              {hoveredTheme === t.id && (
                <View style={styles.themeTooltip}>
                  <Text style={styles.themeTooltipText}>
                    {t.name}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

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
            <Text style={styles.title}>
              {optionName}
            </Text>
            <Text style={styles.subtitle}>
              Enter details for {count} recipient{count > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Recipients Section */}
          <View style={styles.recipientsContainer}>
            {recipients.map((recipient, index) => (
              <View 
                key={recipient.id}
                style={styles.recipientCard}
              >
                <Text style={styles.recipientNumber}>
                  Recipient {index + 1}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Name
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient's name"
                    placeholderTextColor="#999"
                    value={recipient.name}
                    onChangeText={(text) => updateRecipient(recipient.id, 'name', text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient's email"
                    placeholderTextColor="#999"
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
            <View style={styles.buyerThemeCard}>
              <Text style={styles.buyerThemeTitle}>
                🎁 Your Bonus Theme
              </Text>
              <Text style={styles.buyerThemeSubtitle}>
                Choose a theme for yourself as a bonus!
              </Text>
              {renderBuyerThemeSelector()}
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            style={styles.continueButton}
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
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2c5f7a',
  },
  recipientsContainer: {
    marginBottom: 24,
  },
  recipientCard: {
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
  recipientNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  themeSelectorContainer: {
    marginTop: 12,
  },
  themeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  themeGrid: {
    gap: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  themeOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative' as const,
  },
  themeOptionEmoji: {
    fontSize: 28,
  },
  themeTooltip: {
    position: 'absolute',
    top: -35,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  themeTooltipText: {
    fontSize: 12,
    fontWeight: '600',
    whiteSpace: 'nowrap',
    color: '#1a1a1a',
  },
  buyerThemeCard: {
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
  buyerThemeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  buyerThemeSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    color: '#2c5f7a',
  },
  continueButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#5d8aa8',
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
