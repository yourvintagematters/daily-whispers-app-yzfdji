
import React, { useState, useEffect } from "react";
import { Stack, Link, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Alert, Platform, ScrollView } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_BUNDLES, DAILY_WHISPERS_QUOTES } from "@/constants/Colors";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const ICON_COLOR = "#007AFF";

interface ThemeButtonProps {
  item: typeof DAILY_WHISPERS_THEMES[keyof typeof DAILY_WHISPERS_THEMES];
  isSelected: boolean;
  onPress: (themeId: string) => void;
  themeColors: any;
}

function ThemeButton({ item, isSelected, onPress, themeColors }: ThemeButtonProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(1.1, { damping: 10, mass: 1 }, () => {
      scaleValue.value = withSpring(1, { damping: 10, mass: 1 });
    });
    onPress(item.id);
  };

  const textColor = item.textColor || '#FFFFFF';
  const borderColor = isSelected ? item.buttonColor : 'transparent';

  return (
    <View style={styles.themeButtonContainer}>
      <Animated.View style={[animatedStyle, styles.themeButtonWrapper]}>
        <Pressable
          onPress={handlePress}
          style={[
            styles.themeButton,
            {
              backgroundColor: item.buttonColor,
              borderColor: borderColor,
              borderWidth: isSelected ? 3 : 0,
            },
          ]}
        >
          <Text style={styles.themeEmoji}>{item.emoji}</Text>
        </Pressable>
      </Animated.View>
      <View style={styles.themeTextContainer}>
        <Text style={[styles.themeName, { color: themeColors.text }]}>{item.name}</Text>
        <Text style={[styles.themeDescription, { color: themeColors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.themePrice, { color: themeColors.text, opacity: 0.7 }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const themes = Object.values(DAILY_WHISPERS_THEMES);

  const handleThemePress = (themeId: string) => {
    setSelectedTheme(themeId);
    setShowExamples(true);
  };

  const renderExampleQuotes = () => {
    if (!selectedTheme || !showExamples) return null;

    const theme_data = DAILY_WHISPERS_THEMES[selectedTheme as keyof typeof DAILY_WHISPERS_THEMES];
    const quotes = DAILY_WHISPERS_QUOTES[selectedTheme as keyof typeof DAILY_WHISPERS_QUOTES] || [];

    return (
      <View style={[styles.examplesContainer, { backgroundColor: theme_data.pastelColor }]}>
        <View style={styles.examplesHeader}>
          <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
            Sample Quotes
          </Text>
          <Pressable onPress={() => setShowExamples(false)}>
            <Text style={[styles.closeButton, { color: theme.colors.text }]}>✕</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.quotesList} showsVerticalScrollIndicator={false}>
          {quotes.slice(0, 3).map((quote, index) => (
            <View key={index} style={styles.quoteItem}>
              <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                "{quote}"
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.examplesButtonContainer}>
          <Pressable
            style={[styles.purchaseButton, { backgroundColor: theme_data.buttonColor }]}
            onPress={() => {
              Alert.alert(
                "Purchase",
                `Purchase "${theme_data.name}" for $${theme_data.price.toFixed(2)}?`,
                [
                  { text: "Cancel", onPress: () => console.log("Cancelled"), style: "cancel" },
                  {
                    text: "Purchase",
                    onPress: () => {
                      Alert.alert("Success", "Quote set purchased! You can now gift it or start receiving daily quotes.");
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.purchaseButtonText, { color: theme_data.textColor || '#FFFFFF' }]}>
              Purchase for ${theme_data.price.toFixed(2)}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.bundlesButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/(home)/purchase-options',
                params: { selectedTheme }
              });
            }}
          >
            <Text style={[styles.bundlesButtonText, { color: '#FFFFFF' }]}>
              View Options
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => Alert.alert("Settings", "Settings not yet implemented")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="gear" color={theme.colors.primary} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Daily Whispers",
            headerRight: renderHeaderRight,
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
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
              Daily Whispers
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Gift someone you care about a whole year of love
            </Text>
          </View>

          {/* Themes Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Choose a Theme
            </Text>
            <FlatList
              data={themes}
              renderItem={({ item }) => (
                <ThemeButton
                  item={item}
                  isSelected={selectedTheme === item.id}
                  onPress={handleThemePress}
                  themeColors={theme.colors}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>

          {/* Example Quotes Section */}
          {renderExampleQuotes()}

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              How It Works
            </Text>
            <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
              1. Choose a theme and purchase a quote set{'\n'}
              2. Gift it to someone special{'\n'}
              3. They receive a daily notification with a unique quote{'\n'}
              4. Each day for 365 days, a new quote arrives
            </Text>
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
  titleSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeButtonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  themeButtonWrapper: {
    flexShrink: 0,
  },
  themeButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  themeEmoji: {
    fontSize: 40,
  },
  themeTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  themePrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  examplesContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  examplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '600',
  },
  quotesList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  quoteItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  examplesButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  purchaseButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bundlesButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bundlesButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
