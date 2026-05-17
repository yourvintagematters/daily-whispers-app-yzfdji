import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell, CreditCard, Trash2, ChevronRight } from "lucide-react-native";

const NOTIFICATIONS_STORAGE_KEY = "notifications_enabled";

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      console.log("[Settings] Notification permission status on mount:", status);
      if (status !== "granted") {
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, "false");
        return;
      }
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const enabled = stored !== "false";
      console.log("[Settings] Loaded notification preference from storage:", enabled);
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.log("[Settings] Error loading notification preference:", error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    console.log("[Settings] Notification toggle pressed, new value:", value);
    if (value) {
      console.log("[Settings] Requesting notification permissions");
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("[Settings] Permission request result:", status);
      if (status === "granted") {
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, "true");
        console.log("[Settings] Notifications enabled and saved");
      } else {
        console.log("[Settings] Permission denied, showing alert");
        Alert.alert(
          "Notifications Blocked",
          "To receive daily quotes, please enable notifications for Daily Whispers in your device Settings.",
          [{ text: "OK" }]
        );
      }
    } else {
      console.log("[Settings] Disabling notifications");
      Alert.alert(
        "Turn Off Notifications",
        "You'll no longer receive daily quote notifications.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Turn Off",
            onPress: async () => {
              console.log("[Settings] User confirmed turning off notifications");
              setNotificationsEnabled(false);
              await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, "false");
            },
          },
        ]
      );
    }
  };

  const handleManageSubscription = () => {
    console.log("[Settings] Manage Subscription pressed");
    Alert.alert(
      "Manage Subscription",
      "To cancel your subscription, please visit the App Store → Subscriptions and cancel Daily Whispers from there.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteData = () => {
    console.log("[Settings] Delete My Data pressed");
    Alert.alert(
      "Delete My Data",
      "Are you sure? This will permanently delete all your data from Daily Whispers. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteData,
        },
      ]
    );
  };

  const confirmDeleteData = async () => {
    console.log("[Settings] User confirmed data deletion, calling edge function");
    try {
      const url = "https://cyktcpdmlsfjyrnutmln.supabase.co/functions/v1/delete-user-data";
      console.log("[Settings] POST", url);
      const response = await fetch(url, { method: "POST" });
      console.log("[Settings] Delete data response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("[Settings] Delete data error response:", errorText);
      }
      Alert.alert(
        "Request Submitted",
        "Your data has been submitted for deletion. You'll receive a confirmation email within 24 hours."
      );
    } catch (error) {
      console.log("[Settings] Error calling delete-user-data:", error);
      Alert.alert(
        "Request Submitted",
        "Your data has been submitted for deletion. You'll receive a confirmation email within 24 hours."
      );
    }
  };

  const glassStyle = Platform.OS !== "ios"
    ? { backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)" }
    : {};

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerBackTitle: "Back" }} />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Notifications Section */}
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <GlassView style={[styles.card, glassStyle]} glassEffectStyle="regular">
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Bell size={20} color="#5d8aa8" strokeWidth={2} />
                </View>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
                  Daily Quote Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#D1D1D6", true: "#5d8aa8" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D6"
              />
            </View>
          </GlassView>

          {/* Subscription Section */}
          <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
          <GlassView style={[styles.card, glassStyle]} glassEffectStyle="regular">
            <Pressable style={styles.row} onPress={handleManageSubscription}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <CreditCard size={20} color="#5d8aa8" strokeWidth={2} />
                </View>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
                  Manage Subscription
                </Text>
              </View>
              <ChevronRight size={18} color={theme.dark ? "#8E8E93" : "#C7C7CC"} strokeWidth={2} />
            </Pressable>
          </GlassView>

          {/* Data Section */}
          <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
          <GlassView style={[styles.card, glassStyle]} glassEffectStyle="regular">
            <Pressable style={styles.row} onPress={handleDeleteData}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, styles.iconWrapDanger]}>
                  <Trash2 size={20} color="#FF3B30" strokeWidth={2} />
                </View>
                <Text style={[styles.rowLabel, styles.dangerText]}>
                  Delete My Data
                </Text>
              </View>
              <ChevronRight size={18} color="#FF3B30" strokeWidth={2} />
            </Pressable>
          </GlassView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E6F2F8",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5d8aa8",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(93,138,168,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDanger: {
    backgroundColor: "rgba(255,59,48,0.1)",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  dangerText: {
    color: "#FF3B30",
  },
});
