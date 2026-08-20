
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Animated,
  Linking,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GiftConfirmationScreen() {
  const router = useRouter();
  const { optionName, optionPrice, recipientName, buyerName } = useLocalSearchParams();

  const resolvedRecipientName = (recipientName as string) || "your recipient";
  const resolvedBuyerName = (buyerName as string) || "A friend";
  const resolvedOptionName = (optionName as string) || "";
  const resolvedOptionPrice = (optionPrice as string) || "";

  const messageTemplate = `Dear ${resolvedRecipientName}, Just a quick note to let you know I am sending you a gift. Keep an eye out for an email from dailywhispers@derryth.com.au. If you click the link you can download the app to receive a year of daily quotes from me to you. Please enjoy! From ${resolvedBuyerName}.`;

  const [message, setMessage] = useState(messageTemplate);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const formattedPrice = `AUD $${Number(resolvedOptionPrice).toFixed(2)}`;

  const handleSMS = () => {
    console.log('[GiftConfirmation] SMS share button pressed');
    const url = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open SMS on this device.");
    });
  };

  const handleEmail = () => {
    console.log('[GiftConfirmation] Email share button pressed');
    const url = `mailto:?subject=${encodeURIComponent("A gift is coming your way!")}&body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open email on this device.");
    });
  };

  const handleWhatsApp = () => {
    console.log('[GiftConfirmation] WhatsApp share button pressed');
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("WhatsApp Not Found", "WhatsApp doesn't appear to be installed on this device.");
    });
  };

  const handleDone = () => {
    console.log('[GiftConfirmation] Done button pressed, navigating to home');
    router.replace("/(tabs)/(home)");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated checkmark */}
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={48} color="#5d8aa8" />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>
            Gift Sent!
          </Text>
          <Text style={styles.titleEmoji}>
            💌
          </Text>

          {/* Order summary card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Plan
              </Text>
              <Text style={styles.summaryValue}>
                {resolvedOptionName}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>
                Amount Charged
              </Text>
              <Text style={styles.summaryTotalValue}>
                {formattedPrice}
              </Text>
            </View>
          </View>

          {/* Share section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Let them know it's coming
            </Text>
            <Text style={styles.cardSubtitle}>
              Edit and share this message with your recipient
            </Text>

            <TextInput
              style={styles.messageInput}
              multiline
              value={message}
              onChangeText={(text) => {
                console.log('[GiftConfirmation] Message text edited');
                setMessage(text);
              }}
              textAlignVertical="top"
              scrollEnabled={false}
            />

            {/* Share buttons */}
            <View style={styles.shareButtonsRow}>
              <Pressable
                style={[styles.shareButton, styles.shareButtonSMS]}
                onPress={handleSMS}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>
                  SMS
                </Text>
              </Pressable>

              <Pressable
                style={[styles.shareButton, styles.shareButtonEmail]}
                onPress={handleEmail}
              >
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>
                  Email
                </Text>
              </Pressable>

              <Pressable
                style={[styles.shareButton, styles.shareButtonWhatsApp]}
                onPress={handleWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>
                  WhatsApp
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Done button */}
          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>
              Done
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
    backgroundColor: "#E6F2F8",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  titleEmoji: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 14,
    marginTop: -6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#555",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5d8aa8",
  },
  messageInput: {
    backgroundColor: "#F8FBFD",
    borderColor: "#d0e4f0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    minHeight: 140,
    marginBottom: 16,
  },
  shareButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  shareButtonSMS: {
    backgroundColor: "#5d8aa8",
  },
  shareButtonEmail: {
    backgroundColor: "#5d8aa8",
  },
  shareButtonWhatsApp: {
    backgroundColor: "#25D366",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  doneButton: {
    width: "100%",
    backgroundColor: "#5d8aa8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
