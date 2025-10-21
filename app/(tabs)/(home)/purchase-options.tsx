
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, ImageBackground } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";

interface PurchaseOption {
  id: string;
  name: string;
  description: string;
  price: number;
  count: number;
  icon: string;
}

const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'singleTheme',
    name: 'A Special Someone',
    description: 'Gift one quote set to a special person',
    price: 9.99,
    count: 1,
    icon: '💝',
  },
  {
    id: 'bestiesBundle',
    name: 'Share 3 x the love',
    description: 'Gift 3 different quote sets to 3 people',
    price: 18.99,
    count: 3,
    icon: '👯',
  },
  {
    id: 'shareTheLoveBigTime',
    name: 'Share 10 x the love',
    description: 'Gift 10 quote sets to 10 people + bonus theme for you',
    price: 49.99,
    count: 10,
    icon: '🌍',
  },
];

export default function PurchaseOptionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedTheme } = useLocalSearchParams();

  const handleOptionSelect = (option: PurchaseOption) => {
    console.log(`Selected option: ${option.id}`);
    router.push({
      pathname: '/(tabs)/(home)/recipient-details',
      params: {
        selectedTheme,
        optionId: option.id,
        optionName: option.name,
        optionPrice: option.price.toString(),
        optionCount: option.count.toString(),
      }
    });
  };

  const renderOptionButton = (option: PurchaseOption) => (
    <Pressable
      key={option.id}
      style={[
        styles.optionButton,
        { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' },
      ]}
      onPress={() => handleOptionSelect(option)}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionIcon}>{option.icon}</Text>
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionName, { color: theme.colors.text }]}>
            {option.name}
          </Text>
          <Text style={[styles.optionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
            {option.description}
          </Text>
        </View>
      </View>
      <Text style={[styles.optionPrice, { color: theme.colors.primary }]}>
        ${option.price.toFixed(2)}
      </Text>
    </Pressable>
  );

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
            title: "Purchase Options",
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
                How Many People?
              </Text>
              <Text style={[styles.subtitle, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
                Choose how many people you want to gift to
              </Text>
            </View>

            {/* Purchase Options */}
            <View style={styles.optionsContainer}>
              {PURCHASE_OPTIONS.map(option => renderOptionButton(option))}
            </View>

            {/* Info Section */}
            <View style={[styles.infoSection, { backgroundColor: theme.dark ? 'rgba(44,44,46,0.9)' : 'rgba(242,242,247,0.9)' }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                What Happens Next?
              </Text>
              <Text style={[styles.infoText, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
                1. Choose your option above{'\n'}
                2. Enter recipient details{'\n'}
                3. Select themes for each recipient{'\n'}
                4. Complete payment{'\n'}
                5. Recipients get daily quotes for a year!
              </Text>
            </View>
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
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerButtonContainer: {
    padding: 6,
  },
});
