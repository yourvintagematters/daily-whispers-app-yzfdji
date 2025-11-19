
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from '@/constants/Colors';
import { IconSymbol } from '@/components/IconSymbol';

export default function DemoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('youAreLoved');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const steps = [
    {
      title: 'Welcome to Daily Whispers',
      description: 'Experience how your gift recipient will receive their daily quotes',
      icon: 'gift.fill',
    },
    {
      title: 'Choose a Theme',
      description: 'Select from 8 beautiful themes, each with 365 unique quotes',
      icon: 'sparkles',
    },
    {
      title: 'Daily Notifications',
      description: 'Recipients get a notification each day with a new inspiring quote',
      icon: 'bell.fill',
    },
    {
      title: 'View & Share',
      description: 'Open the quote, enjoy it, and share it with others',
      icon: 'square.and.arrow.up.fill',
    },
  ];

  const currentTheme = DAILY_WHISPERS_THEMES[selectedTheme as keyof typeof DAILY_WHISPERS_THEMES];
  const currentQuotes = DAILY_WHISPERS_QUOTES[selectedTheme as keyof typeof DAILY_WHISPERS_QUOTES] || [];

  useEffect(() => {
    if (showQuote) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showQuote]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowQuote(false);
    } else {
      // Demo complete, go back to home
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowQuote(false);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    console.log('Theme selected in demo:', themeId);
    setSelectedTheme(themeId);
    setCurrentQuoteIndex(0);
  };

  const handleShowQuote = () => {
    console.log('Showing quote in demo');
    setShowQuote(true);
    setCurrentQuoteIndex(Math.floor(Math.random() * currentQuotes.length));
  };

  const handleNextQuote = () => {
    console.log('Next quote in demo');
    setCurrentQuoteIndex((currentQuoteIndex + 1) % currentQuotes.length);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
              <IconSymbol
                ios_icon_name="gift.fill"
                android_material_icon_name="card_giftcard"
                size={64}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.stepDescription, { color: theme.colors.text }]}>
              This demo shows you exactly what your gift recipient will experience when they receive Daily Whispers.
            </Text>
            <Text style={[styles.stepSubtext, { color: theme.colors.text, opacity: 0.7 }]}>
              They'll receive a notification every day for a full year with a unique, inspiring quote.
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select a Theme to Preview
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themesScrollContainer}
            >
              {Object.values(DAILY_WHISPERS_THEMES).map((themeItem, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleThemeSelect(themeItem.id)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: themeItem.buttonColor,
                      borderWidth: selectedTheme === themeItem.id ? 3 : 0,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.themeCardEmoji}>{themeItem.emoji}</Text>
                  <Text style={[styles.themeCardName, { color: themeItem.textColor }]}>
                    {themeItem.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={[styles.selectedThemeInfo, { backgroundColor: currentTheme.pastelColor }]}>
              <Text style={[styles.selectedThemeText, { color: theme.colors.text }]}>
                Selected: {currentTheme.name}
              </Text>
              <Text style={[styles.selectedThemeDescription, { color: theme.colors.text, opacity: 0.8 }]}>
                {currentTheme.description}
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.notificationDemo, { backgroundColor: theme.dark ? '#2C2C2E' : '#FFFFFF' }]}>
              <View style={styles.notificationHeader}>
                <View style={[styles.notificationIcon, { backgroundColor: currentTheme.buttonColor }]}>
                  <Text style={styles.notificationEmoji}>{currentTheme.emoji}</Text>
                </View>
                <View style={styles.notificationTextContainer}>
                  <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                    Daily Whispers
                  </Text>
                  <Text style={[styles.notificationTime, { color: theme.colors.text, opacity: 0.6 }]}>
                    now
                  </Text>
                </View>
              </View>
              <Text style={[styles.notificationBody, { color: theme.colors.text }]}>
                Your daily quote from {currentTheme.name} is here! 💫
              </Text>
              <Pressable
                onPress={handleShowQuote}
                style={[styles.notificationButton, { backgroundColor: currentTheme.buttonColor }]}
              >
                <Text style={[styles.notificationButtonText, { color: currentTheme.textColor }]}>
                  Tap to View Quote
                </Text>
              </Pressable>
            </View>

            {showQuote && (
              <Animated.View
                style={[
                  styles.quoteDisplay,
                  { backgroundColor: currentTheme.pastelColor, opacity: fadeAnim },
                ]}
              >
                <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                  "{currentQuotes[currentQuoteIndex]}"
                </Text>
                <Pressable onPress={handleNextQuote} style={styles.nextQuoteButton}>
                  <Text style={[styles.nextQuoteText, { color: theme.colors.text, opacity: 0.7 }]}>
                    Tap for another sample →
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.quoteCard, { backgroundColor: currentTheme.pastelColor }]}>
              <Text style={[styles.quoteCardText, { color: theme.colors.text }]}>
                "{currentQuotes[currentQuoteIndex]}"
              </Text>
              <View style={styles.quoteCardFooter}>
                <Text style={[styles.quoteCardTheme, { color: theme.colors.text, opacity: 0.7 }]}>
                  {currentTheme.name}
                </Text>
              </View>
            </View>

            <View style={styles.shareSection}>
              <Text style={[styles.shareSectionTitle, { color: theme.colors.text }]}>
                Share Options
              </Text>
              <View style={styles.shareButtons}>
                <Pressable style={[styles.shareButton, { backgroundColor: theme.dark ? '#2C2C2E' : '#F0F0F0' }]}>
                  <IconSymbol
                    ios_icon_name="square.and.arrow.up.fill"
                    android_material_icon_name="share"
                    size={24}
                    color={theme.colors.text}
                  />
                  <Text style={[styles.shareButtonText, { color: theme.colors.text }]}>Share</Text>
                </Pressable>
                <Pressable style={[styles.shareButton, { backgroundColor: theme.dark ? '#2C2C2E' : '#F0F0F0' }]}>
                  <IconSymbol
                    ios_icon_name="heart.fill"
                    android_material_icon_name="favorite"
                    size={24}
                    color={theme.colors.text}
                  />
                  <Text style={[styles.shareButtonText, { color: theme.colors.text }]}>Save</Text>
                </Pressable>
                <Pressable style={[styles.shareButton, { backgroundColor: theme.dark ? '#2C2C2E' : '#F0F0F0' }]}>
                  <IconSymbol
                    ios_icon_name="link"
                    android_material_icon_name="link"
                    size={24}
                    color={theme.colors.text}
                  />
                  <Text style={[styles.shareButtonText, { color: theme.colors.text }]}>Copy</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.finalNote, { color: theme.colors.text, opacity: 0.7 }]}>
              Recipients can share quotes with friends, who can then discover and purchase Daily Whispers for themselves!
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Demo',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <IconSymbol
                  ios_icon_name="chevron.left"
                  android_material_icon_name="arrow_back"
                  size={24}
                  color={theme.colors.primary}
                />
              </Pressable>
            ),
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: '#E6F2F8' }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep ? theme.colors.primary : theme.dark ? '#3C3C3E' : '#D0D0D0',
                  },
                ]}
              />
            ))}
          </View>

          {/* Step Title */}
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {steps[currentStep].title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.text, opacity: 0.7 }]}>
            {steps[currentStep].description}
          </Text>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 0 && (
              <Pressable
                onPress={handlePrevious}
                style={[styles.navButton, styles.navButtonSecondary, { backgroundColor: theme.dark ? '#2C2C2E' : '#F0F0F0' }]}
              >
                <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Previous</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNext}
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                { backgroundColor: theme.colors.primary },
                currentStep === 0 && styles.navButtonFull,
              ]}
            >
              <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                {currentStep === steps.length - 1 ? 'Finish Demo' : 'Next'}
              </Text>
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
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  stepContent: {
    width: '100%',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  stepDescription: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  stepSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  themesScrollContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  themeCard: {
    width: 100,
    height: 120,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  themeCardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  themeCardName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedThemeInfo: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  selectedThemeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedThemeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationDemo: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quoteDisplay: {
    borderRadius: 16,
    padding: 24,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  nextQuoteButton: {
    padding: 8,
  },
  nextQuoteText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    marginBottom: 24,
  },
  quoteCardText: {
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  quoteCardFooter: {
    alignItems: 'center',
  },
  quoteCardTheme: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareSection: {
    marginBottom: 24,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  shareButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  finalNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonFull: {
    flex: 1,
  },
  navButtonPrimary: {
    flex: 1,
  },
  navButtonSecondary: {
    flex: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
