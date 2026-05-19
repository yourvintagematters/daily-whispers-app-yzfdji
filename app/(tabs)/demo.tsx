
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from '@/constants/Colors';
import { IconSymbol } from '@/components/IconSymbol';
import LogoImage from '@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png';

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
      title: 'Daily Notifications',
      description: 'Recipients get a notification each day with a new inspiring quote',
      icon: 'bell.fill',
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
  }, [showQuote, fadeAnim]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowQuote(false);
    } else {
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

  const handleSave = () => {
    console.log('Save button pressed in demo');
    // Save functionality would go here
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#5d8aa8' }]}>
              <Image
                source={LogoImage}
                style={[styles.logoImage, { tintColor: '#FFFFFF' }]}
                resizeMode="contain"
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
                Your daily quote from John is here! 💫
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
              <View style={styles.quoteContainer}>
                <Animated.View
                  style={[
                    styles.quoteDisplay,
                    { backgroundColor: currentTheme.pastelColor, opacity: fadeAnim },
                  ]}
                >
                  <Text style={[styles.recipientNameTop, { color: theme.colors.text }]}>
                    Dear Sarah
                  </Text>
                  <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                    "{currentQuotes[currentQuoteIndex]}"
                  </Text>
                  <Image
                    source={LogoImage}
                    style={[styles.quoteCardDecorativeImage, { tintColor: '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.purchaserNameBottom, { color: theme.colors.text }]}>
                    Love, John
                  </Text>
                </Animated.View>
                
                {/* Action Buttons - Now outside and below the card */}
                <View style={styles.circleButtonRow}>
                  <Pressable style={styles.circleButton} onPress={handleSave}>
                    <IconSymbol
                      ios_icon_name="arrow.down.circle.fill"
                      android_material_icon_name="save"
                      size={28}
                      color="#5d8aa8"
                    />
                    <Text style={styles.circleButtonLabel}>Save this Quote</Text>
                  </Pressable>
                  <Pressable
                    style={styles.circleButton}
                    onPress={() => {
                      console.log('Pay it Forward button pressed in demo');
                      router.push('/(tabs)/(home)');
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="heart.fill"
                      android_material_icon_name="favorite"
                      size={28}
                      color="#5d8aa8"
                    />
                    <Text style={styles.circleButtonLabel}>Pay it Forward</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const renderStepTitle = () => {
    if (currentStep === 0) {
      return (
        <View style={styles.titleContainer}>
          <Text style={[styles.stepTitleSmall, { color: theme.colors.text, opacity: 0.7 }]}>
            Welcome to
          </Text>
          <Text style={[styles.stepTitleLarge, { color: '#5d8aa8' }]}>
            Daily Whispers
          </Text>
        </View>
      );
    }
    return (
      <Text style={[styles.stepTitle, { color: '#5d8aa8' }]}>
        {steps[currentStep].title}
      </Text>
    );
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
                  color="#5d8aa8"
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
                    backgroundColor: index <= currentStep ? '#5d8aa8' : theme.dark ? '#3C3C3E' : '#D0D0D0',
                  },
                ]}
              />
            ))}
          </View>

          {/* Step Title */}
          {renderStepTitle()}
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
                style={[styles.navButton, styles.navButtonSecondary, { backgroundColor: '#FFFFFF' }]}
              >
                <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Previous</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNext}
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                { backgroundColor: '#5d8aa8' },
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitleSmall: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepTitleLarge: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
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
  logoImage: {
    width: 80,
    height: 80,
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
  quoteContainer: {
    width: '100%',
    alignItems: 'center',
  },
  quoteDisplay: {
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    width: '100%',
  },
  recipientNameTop: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 21,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 31,
    marginBottom: 16,
  },
  quoteCardDecorativeImage: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
  },
  purchaserNameBottom: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 0,
    textAlign: 'center',
    opacity: 0.8,
  },
  circleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  circleButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d0e4f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  circleButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#5d8aa8',
    textAlign: 'center',
    marginTop: 4,
    width: 80,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
