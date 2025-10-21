import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from "@/constants/Colors";

export default function ProfileScreen() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState<string>("");

  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Check notification permissions
    checkNotificationPermissions();

    // Load a sample quote
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${currentQuote}"\n\nReceive daily inspiration with Daily Whispers! Download the app to get your own daily quotes.`,
        title: "Daily Whispers Quote",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const themeData = currentTheme ? DAILY_WHISPERS_THEMES[currentTheme as keyof typeof DAILY_WHISPERS_THEMES] : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Today's Quote</Text>

        {/* Quote Display */}
        {themeData && (
          <View
            style={[
              styles.quoteContainer,
              { backgroundColor: themeData.pastelColor },
            ]}
          >
            <Text style={styles.quoteEmoji}>{themeData.emoji}</Text>
            <Text style={[styles.quoteText, { color: theme.colors.text }]}>
              {currentQuote}
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
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleShare}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Share
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' },
            ]}
            onPress={loadSampleQuote}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Next Quote
            </Text>
          </Pressable>
        </View>

        {/* Notification Settings */}
        <GlassView style={[
          styles.settingsSection,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
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

        {/* About Section */}
        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About Daily Whispers
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Daily Whispers is a gift-based app that delivers daily inspiration through carefully curated quotes. Gift a quote set to someone special and they'll receive a unique quote every day for a year.
          </Text>
          <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Version 1.0.0
          </Text>
        </GlassView>
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quoteContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quoteEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
  },
  quoteDate: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});
