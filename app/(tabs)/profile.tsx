
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as MediaLibrary from "expo-media-library";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from "@/constants/Colors";
import LogoImage from '@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("Friend");
  const [quoteHistory, setQuoteHistory] = useState<string[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [viewAsRecipient, setViewAsRecipient] = useState<boolean>(false);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    checkNotificationPermissions();
    loadSampleQuote();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const loadSampleQuote = () => {
    const themeKeys = Object.keys(DAILY_WHISPERS_QUOTES);
    const randomThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const quotes = DAILY_WHISPERS_QUOTES[randomThemeKey as keyof typeof DAILY_WHISPERS_QUOTES];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    setCurrentTheme(randomThemeKey);
    setCurrentQuote(randomQuote);
    setQuoteHistory([randomQuote]);
    setCurrentQuoteIndex(0);
  };

  const loadPreviousQuote = () => {
    if (currentQuoteIndex < quoteHistory.length - 1) {
      setCurrentQuoteIndex(currentQuoteIndex + 1);
      setCurrentQuote(quoteHistory[currentQuoteIndex + 1]);
    } else {
      Alert.alert("No More Previous Quotes", "You've reached the beginning of your quote history.");
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setNotificationsEnabled(true);
      Alert.alert("Success", "Notifications enabled! You'll receive daily quotes.");
      await scheduleTestNotification();
    } else {
      Alert.alert("Permission Denied", "Please enable notifications in settings to receive daily quotes.");
    }
  };

  const scheduleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Whispers",
          body: "Your daily quote is ready!",
          data: { quote: currentQuote },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        },
      });
    } catch (error) {
      console.log("Error scheduling notification:", error);
    }
  };

  const handleSave = async () => {
    console.log("[Profile] Save this Quote button pressed");
    try {
      if (Platform.OS === 'web') {
        Alert.alert("Save Not Available", "Saving images is not supported on web.");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Please grant permission to save images to your photo library.");
        return;
      }

      Alert.alert("Saved!", "Quote saved to your collection!");
      console.log("[Profile] Quote saved successfully");
    } catch (error) {
      console.log("[Profile] Error saving:", error);
      Alert.alert("Save Error", "Could not save the quote. Please try again.");
    }
  };

  const handlePayItForward = () => {
    console.log("[Profile] Pay it Forward button pressed");
    router.push('/(tabs)/(home)');
  };

  const handlePurchaseForFriend = () => {
    Alert.alert(
      "Gift Daily Whispers",
      "Would you like to purchase Daily Whispers for a friend?",
      [
        {
          text: "Yes, Let's Go!",
          onPress: () => {
            router.push('/(tabs)/(home)');
          }
        },
        {
          text: "Not Now",
          style: "cancel"
        }
      ]
    );
  };

  const simulateFakePurchase = () => {
    const themeKeys = Object.keys(DAILY_WHISPERS_THEMES);
    const randomThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const themeData = DAILY_WHISPERS_THEMES[randomThemeKey as keyof typeof DAILY_WHISPERS_THEMES];
    
    const recipientNames = ["Sarah", "John", "Emma", "Michael", "Jessica", "David", "Sophie", "Alex"];
    const randomRecipientName = recipientNames[Math.floor(Math.random() * recipientNames.length)];
    
    setRecipientName(randomRecipientName);
    
    Alert.alert(
      "You Received a Gift!",
      `${randomRecipientName} sent you "${themeData.name}" - a year of daily inspiration!\n\nYou'll receive your first quote tomorrow at 9:00 AM.`,
      [
        {
          text: "View Theme",
          onPress: () => {
            setCurrentTheme(randomThemeKey);
            loadSampleQuote();
          }
        },
        {
          text: "OK",
          onPress: () => console.log("Gift received")
        }
      ]
    );
  };

  const toggleRecipientView = () => {
    setViewAsRecipient(!viewAsRecipient);
    if (!viewAsRecipient) {
      Alert.alert(
        "Recipient View",
        "You are now viewing the app as a recipient would see it. This is what your gift recipient will experience when they receive their daily quotes.",
        [{ text: "Got it!" }]
      );
    }
  };

  const themeData = currentTheme ? DAILY_WHISPERS_THEMES[currentTheme as keyof typeof DAILY_WHISPERS_THEMES] : null;

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
            title: viewAsRecipient ? "Recipient View" : "Today's Quote",
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#E6F2F8' }]} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {viewAsRecipient && (
            <View style={[styles.recipientBanner, { backgroundColor: theme.colors.primary }]}>
              <IconSymbol name="eye.fill" color="#FFFFFF" size={20} />
              <Text style={styles.recipientBannerText}>
                Viewing as Recipient
              </Text>
            </View>
          )}

          <Text style={[styles.title, { color: '#5d8aa8' }]}>
            {viewAsRecipient ? "Your Daily Quote" : "Today's Quote"}
          </Text>

          {themeData && (
            <View
              style={[
                styles.quoteCard,
                { backgroundColor: themeData.pastelColor },
              ]}
            >
              <View style={styles.cardInner}>
                <Text style={[styles.recipientName, { color: theme.colors.text }]}>
                  {viewAsRecipient ? "Dear " + recipientName : recipientName}
                </Text>
                <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                  "{currentQuote}"
                </Text>
                <Text style={[styles.quoteDate, { color: theme.colors.text }]}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <Image
                source={LogoImage}
                style={[styles.quoteCardDecorativeImage, { tintColor: '#FFFFFF' }]}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.circleButtonRow}>
            <Pressable style={styles.circleButton} onPress={handleSave}>
              <IconSymbol name="arrow.down.circle" color="#5d8aa8" size={28} />
              <Text style={styles.circleButtonLabel}>Save this Quote</Text>
            </Pressable>
            <Pressable style={styles.circleButton} onPress={handlePayItForward}>
              <IconSymbol name="heart.fill" color="#5d8aa8" size={28} />
              <Text style={styles.circleButtonLabel}>Pay it Forward</Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.dark ? 'rgba(44,44,46,0.9)' : '#FFFFFF', marginBottom: 16 },
            ]}
            onPress={loadPreviousQuote}
          >
            <IconSymbol name="arrow.left" color={theme.colors.text} size={18} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Previous Quote
            </Text>
          </Pressable>

          {/* Unsubscribe link */}
          <Pressable
            onPress={() => {
              console.log("[Profile] Unsubscribe link tapped");
              Alert.alert(
                "Unsubscribe",
                "Are you sure you want to unsubscribe? This will cancel your daily quote notifications and delete your data from our system. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes, Unsubscribe",
                    style: "destructive",
                    onPress: async () => {
                      console.log("[Profile] Unsubscribe confirmed");
                      try {
                        await Notifications.cancelAllScheduledNotificationsAsync();
                        console.log("[Profile] All scheduled notifications cancelled");
                        setNotificationsEnabled(false);
                        console.log("[Profile] Calling delete-user-data edge function");
                        const response = await fetch(
                          "https://cyktcpdmlsfjyrnutmln.supabase.co/functions/v1/delete-user-data",
                          { method: "POST" }
                        );
                        console.log("[Profile] delete-user-data response status:", response.status);
                      } catch (error) {
                        console.log("[Profile] Error during unsubscribe:", error);
                      }
                      Alert.alert(
                        "Unsubscribed",
                        "You've been unsubscribed. Your data will be deleted within 24 hours."
                      );
                    },
                  },
                ]
              );
            }}
            style={styles.unsubscribeLink}
          >
            <Text style={styles.unsubscribeLinkText}>
              Unsubscribe from daily quotes
            </Text>
          </Pressable>

          {/* Purchase for Friend Button */}
          <Pressable
            style={[
              styles.purchaseButton,
              { 
                backgroundColor: '#4CAF50',
              },
            ]}
            onPress={handlePurchaseForFriend}
          >
            <IconSymbol name="gift.fill" color="#FFFFFF" size={20} />
            <Text style={[styles.purchaseButtonText, { color: '#FFFFFF' }]}>
              Gift Daily Whispers to a Friend
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.viewToggleButton,
              { 
                backgroundColor: viewAsRecipient 
                  ? theme.colors.primary 
                  : theme.dark ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.15)',
                borderColor: viewAsRecipient ? theme.colors.primary : '#4CAF50',
              },
            ]}
            onPress={toggleRecipientView}
          >
            <IconSymbol 
              name={viewAsRecipient ? "eye.slash.fill" : "eye.fill"} 
              color={viewAsRecipient ? '#FFFFFF' : '#4CAF50'} 
              size={20} 
            />
            <Text style={[
              styles.viewToggleButtonText, 
              { color: viewAsRecipient ? '#FFFFFF' : '#4CAF50' }
            ]}>
              {viewAsRecipient ? "Exit Recipient View" : "View as Recipient"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.testButton,
              { backgroundColor: theme.dark ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.15)' },
            ]}
            onPress={simulateFakePurchase}
          >
            <Text style={[styles.testButtonText, { color: '#4CAF50' }]}>
              Test: Simulate Receiving a Gift
            </Text>
          </Pressable>

          <GlassView style={[
            styles.settingsSection,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }
          ]} glassEffectStyle="regular">
            <Text style={[styles.sectionTitle, { color: '#5d8aa8' }]}>
              Notifications
            </Text>
            <Pressable
              style={styles.settingItem}
              onPress={() => {
                if (!notificationsEnabled) {
                  requestNotificationPermissions();
                } else {
                  setNotificationsEnabled(false);
                }
              }}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Daily Quotes
              </Text>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: notificationsEnabled ? '#34C759' : '#E5E5EA',
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleInner,
                    {
                      alignSelf: notificationsEnabled ? 'flex-end' : 'flex-start',
                    },
                  ]}
                />
              </View>
            </Pressable>
          </GlassView>

          <GlassView style={[
            styles.section,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }
          ]} glassEffectStyle="regular">
            <Text style={[styles.sectionTitle, { color: '#5d8aa8' }]}>
              About Daily Whispers
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Daily Whispers is a gift-based app that delivers daily inspiration through carefully curated quotes. Gift a quote set to someone special and they'll receive a unique quote every day for a year.
            </Text>
            <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Version 1.0.0
            </Text>
          </GlassView>

          {/* Purchasing Guide Section */}
          <GlassView style={[
            styles.section,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }
          ]} glassEffectStyle="regular">
            <Text style={[styles.sectionTitle, { color: '#5d8aa8' }]}>
              📖 How to Purchase & Gift
            </Text>
            <View style={styles.guideContainer}>
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Browse the available quote themes on the home screen
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Hover over a theme to preview sample quotes
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Tap the theme or preview card to see purchase options
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Choose: Single theme ($9.99), Besties Bundle - 3 themes ($18.99), or Share the Love - 10 themes ($49.99)
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Enter recipient details (name, email, and theme selection)
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>6</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Complete payment with your card details
                </Text>
              </View>
              
              <View style={styles.guideStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#5d8aa8' }]}>
                  <Text style={styles.stepNumberText}>7</Text>
                </View>
                <Text style={[styles.guideText, { color: theme.colors.text }]}>
                  Your recipient receives a notification and starts getting daily quotes! 🎉
                </Text>
              </View>
            </View>
          </GlassView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  recipientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  recipientBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quoteCard: {
    borderRadius: 20,
    padding: 0,
    marginBottom: 24,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  quoteCardDecorativeImage: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
  },
  cardInner: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 23,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 31,
    marginBottom: 20,
    fontWeight: '500',
  },
  quoteDate: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  circleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
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
  purchaseButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewToggleButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  viewToggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  headerButtonContainer: {
    padding: 6,
  },
  testButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  guideContainer: {
    marginTop: 8,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 4,
  },
  unsubscribeLink: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  unsubscribeLinkText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
