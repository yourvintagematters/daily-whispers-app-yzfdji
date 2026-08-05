import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  ImageSourcePropType,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { captureRef } from 'react-native-view-shot';
import { supabase } from '@/integrations/supabase/client';
import { DAILY_WHISPERS_THEMES } from '@/constants/Colors';
import { IconSymbol } from '@/components/IconSymbol';

const ASYNC_KEY_TOKEN = 'recipient_token';
const ASYNC_KEY_NOTIF_REQUESTED = 'notifications_requested';

const LogoImage = require('@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png');

function resolveImageSource(
  source: string | number | ImageSourcePropType | undefined
): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface QuoteData {
  quote: string;
  recipientName: string;
  buyerName: string;
  theme: string;
  currentDay: number;
  pastelColor: string;
}

export default function RecipientScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardRef = useRef<View>(null);

  // ── 1. Resolve token from URL param or AsyncStorage ──────────────────────
  useEffect(() => {
    const resolveToken = async () => {
      console.log('[RecipientScreen] Resolving token. URL param:', params.token);
      if (params.token) {
        console.log('[RecipientScreen] Token found in URL, storing in AsyncStorage');
        await AsyncStorage.setItem(ASYNC_KEY_TOKEN, params.token);
        setToken(params.token);
      } else {
        const stored = await AsyncStorage.getItem(ASYNC_KEY_TOKEN);
        console.log('[RecipientScreen] Token from AsyncStorage:', stored ? 'found' : 'not found');
        if (stored) {
          setToken(stored);
        } else {
          console.warn('[RecipientScreen] No token available');
          setError('No gift token found. Please open the link from your welcome email.');
          setLoading(false);
        }
      }
    };
    resolveToken();
  }, [params.token]);

  // ── 2. Fetch quote once token is resolved ────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchQuote = async () => {
      console.log('[RecipientScreen] Fetching quote for token:', token.slice(0, 8) + '...');
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'get-recipient-quote',
          { body: { token } }
        );
        if (fnError) {
          console.error('[RecipientScreen] Edge function error:', fnError.message);
          throw new Error(fnError.message);
        }
        console.log('[RecipientScreen] Quote fetched successfully. Day:', data?.currentDay);
        setQuoteData(data as QuoteData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load your quote.';
        console.error('[RecipientScreen] Fetch error:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [token]);

  // ── 3. Fade-in animation once quote loads ────────────────────────────────
  useEffect(() => {
    if (quoteData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [quoteData, fadeAnim]);

  // ── 4. Notification permission prompt (once, after 1s delay) ────────────
  useEffect(() => {
    if (!quoteData) return;
    const checkAndPrompt = async () => {
      const alreadyRequested = await AsyncStorage.getItem(ASYNC_KEY_NOTIF_REQUESTED);
      console.log('[RecipientScreen] Notifications already requested:', alreadyRequested);
      if (!alreadyRequested) {
        setTimeout(() => {
          console.log('[RecipientScreen] Showing notification permission modal');
          setShowNotifModal(true);
        }, 1000);
      }
    };
    checkAndPrompt();
  }, [quoteData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAllowNotifications = async () => {
    console.log('[RecipientScreen] User tapped Allow Notifications');
    setShowNotifModal(false);
    await AsyncStorage.setItem(ASYNC_KEY_NOTIF_REQUESTED, 'true');
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[RecipientScreen] Notification permission status:', status);
    if (status === 'granted') {
      console.log('[RecipientScreen] Notification permission granted');
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        console.log('[RecipientScreen] Fetching Expo push token, projectId:', projectId);
        const expoPushToken = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log('[RecipientScreen] Expo push token obtained:', expoPushToken.data);
        const { error: supabaseError } = await supabase
          .from('recipient_tokens')
          .update({ expo_push_token: expoPushToken.data, notifications_enabled: true })
          .eq('token', token);
        if (supabaseError) {
          console.error('[RecipientScreen] Failed to save push token to Supabase:', supabaseError);
        } else {
          console.log('[RecipientScreen] Push token saved to Supabase successfully');
        }
      } catch (err) {
        console.error('[RecipientScreen] Error obtaining or saving push token:', err);
      }
    } else {
      console.log('[RecipientScreen] Notification permission denied');
    }
  };

  const handleDismissNotifModal = async () => {
    console.log('[RecipientScreen] User dismissed notification modal');
    setShowNotifModal(false);
    await AsyncStorage.setItem(ASYNC_KEY_NOTIF_REQUESTED, 'true');
  };

  const handleSaveQuote = async () => {
    console.log('[RecipientScreen] Save this Quote button pressed');
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log('[RecipientScreen] Media library permission status:', status);
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save quotes.'
        );
        setSaving(false);
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      console.log('[RecipientScreen] Card captured, saving to media library');
      await MediaLibrary.saveToLibraryAsync(uri);
      console.log('[RecipientScreen] Quote saved to photo library successfully');
      Alert.alert('Saved!', 'Your quote has been saved to your photo library.');
    } catch (err) {
      console.error('[RecipientScreen] Save error:', err);
      Alert.alert('Error', 'Could not save the quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayItForward = () => {
    console.log('[RecipientScreen] Pay it Forward button pressed');
    router.push('/(tabs)/(home)');
  };

  const handleUnsubscribe = () => {
    console.log('[RecipientScreen] Unsubscribe link tapped');
    Alert.alert(
      'Stop Daily Quotes?',
      'Are you sure you want to stop receiving your daily quotes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Unsubscribe',
          style: 'destructive',
          onPress: confirmUnsubscribe,
        },
      ]
    );
  };

  const confirmUnsubscribe = async () => {
    console.log('[RecipientScreen] Unsubscribe confirmed, calling edge function');
    setUnsubscribing(true);
    try {
      const { error: fnError } = await supabase.functions.invoke(
        'unsubscribe-recipient',
        { body: { token } }
      );
      if (fnError) {
        console.error('[RecipientScreen] Unsubscribe edge function error:', fnError.message);
        throw new Error(fnError.message);
      }
      console.log('[RecipientScreen] Unsubscribe successful, clearing token from AsyncStorage');
      await AsyncStorage.removeItem(ASYNC_KEY_TOKEN);
      Alert.alert(
        "You've been unsubscribed.",
        "You won't receive any more daily quotes.",
        [{ text: 'OK', onPress: () => router.push('/(tabs)/(home)') }]
      );
    } catch (err) {
      console.error('[RecipientScreen] Unsubscribe error:', err);
      Alert.alert('Something went wrong. Please try again.');
    } finally {
      setUnsubscribing(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const themeKey = quoteData?.theme as keyof typeof DAILY_WHISPERS_THEMES | undefined;
  const themeObj = themeKey ? DAILY_WHISPERS_THEMES[themeKey] : null;
  const cardColor = quoteData?.pastelColor ?? themeObj?.pastelColor ?? '#c7dae1';
  const buttonColor = themeObj?.buttonColor ?? '#5d8aa8';

  const dearText = quoteData ? `Dear ${quoteData.recipientName}` : '';
  const loveText = quoteData ? `With love, ${quoteData.buyerName}` : '';
  const dayText = quoteData ? `Day ${quoteData.currentDay} of 365` : '';
  const quoteText = quoteData ? `"${quoteData.quote}"` : '';

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5d8aa8" />
          <Text style={styles.loadingText}>Loading your daily quote...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>💌</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Day counter above card */}
          <Text style={styles.dayCounter}>{dayText}</Text>

          {/* Quote Card */}
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <View
              ref={cardRef}
              style={[styles.card, { backgroundColor: cardColor }]}
              collapsable={false}
            >
              <Text style={styles.dearText}>{dearText}</Text>
              <Text style={styles.quoteText}>{quoteText}</Text>
              <Image
                source={resolveImageSource(LogoImage)}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.loveText}>{loveText}</Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.circleButton, saving && styles.circleButtonDisabled]}
              onPress={handleSaveQuote}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={buttonColor} />
              ) : (
                <IconSymbol
                  ios_icon_name="arrow.down.circle.fill"
                  android_material_icon_name="save"
                  size={28}
                  color={buttonColor}
                />
              )}
              <Text style={[styles.circleButtonLabel, { color: buttonColor }]}>
                Save this Quote
              </Text>
            </Pressable>

            <Pressable style={styles.circleButton} onPress={handlePayItForward}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={28}
                color={buttonColor}
              />
              <Text style={[styles.circleButtonLabel, { color: buttonColor }]}>
                Pay it Forward
              </Text>
            </Pressable>
          </View>

          {/* Unsubscribe link */}
          <Pressable
            onPress={handleUnsubscribe}
            disabled={unsubscribing}
            style={styles.unsubscribeLink}
          >
            {unsubscribing ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <Text style={styles.unsubscribeLinkText}>Unsubscribe from daily quotes</Text>
            )}
          </Pressable>
        </ScrollView>

        {/* Notification Permission Modal */}
        <Modal
          visible={showNotifModal}
          transparent
          animationType="fade"
          onRequestClose={handleDismissNotifModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🔔</Text>
              <Text style={styles.modalTitle}>Never Miss a Quote</Text>
              <Text style={styles.modalBody}>
                Allow notifications so you never miss your daily quote — they arrive each morning at 9:30 AM.
              </Text>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#5d8aa8' }]}
                onPress={handleAllowNotifications}
              >
                <Text style={styles.modalButtonText}>Allow Notifications</Text>
              </Pressable>
              <Pressable style={styles.modalSkip} onPress={handleDismissNotifModal}>
                <Text style={styles.modalSkipText}>Maybe Later</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E6F2F8',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: '#E6F2F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5d8aa8',
    textAlign: 'center',
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5d8aa8',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  dayCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5d8aa8',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  dearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 21,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  logoImage: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    opacity: 0.6,
  },
  loveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 28,
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
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  circleButtonDisabled: {
    opacity: 0.6,
  },
  circleButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    width: 80,
  },
  unsubscribeLink: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  unsubscribeLinkText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSkip: {
    paddingVertical: 8,
  },
  modalSkipText: {
    fontSize: 14,
    color: '#999',
  },
});
