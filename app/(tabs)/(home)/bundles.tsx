
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Alert, Platform, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { DAILY_WHISPERS_BUNDLES, DAILY_WHISPERS_THEMES } from "@/constants/Colors";
import { IconSymbol } from "@/components/IconSymbol";

export default function BundlesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedTheme } = useLocalSearchParams();

  const renderBundleButton = ({ item }: { item: typeof DAILY_WHISPERS_BUNDLES[0] }) => (
    <Pressable
      style={[
        styles.bundleButton,
        { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' },
      ]}
      onPress={() => {
        Alert.alert(
          "Purchase Bundle",
          `Purchase "${item.name}" for $${item.price.toFixed(2)}? (${item.savings})`,
          [
            { text: "Cancel", onPress: () => console.log("Cancelled"), style: "cancel" },
            {
              text: "Purchase",
              onPress: () => {
                Alert.alert("Success", `${item.name} purchased! You can now gift these quote sets.`);
              },
            },
          ]
        );
      }}
    >
      <View style={styles.bundleContent}>
        <Text style={[styles.bundleName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.bundleDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
          {item.description}
        </Text>
        <Text style={[styles.bundleSavings, { color: '#34C759' }]}>{item.savings}</Text>
      </View>
      <Text style={[styles.bundlePrice, { color: theme.colors.primary }]}>
        ${item.price.toFixed(2)}
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
            title: "Bundle Deals",
            headerLeft: renderHeaderLeft,
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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Bundle Deals
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Save more when you buy multiple quote sets
            </Text>
          </View>

          {/* Bundles List */}
          <FlatList
            data={DAILY_WHISPERS_BUNDLES}
            renderItem={renderBundleButton}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: theme.dark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Why Buy a Bundle?
            </Text>
            <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
              • Save money on multiple quote sets{'\n'}
              • Gift different themes to different people{'\n'}
              • Enjoy variety throughout the year{'\n'}
              • Perfect for group gifting
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
  bundleButton: {
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
  bundleContent: {
    flex: 1,
  },
  bundleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bundleDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  bundleSavings: {
    fontSize: 12,
    fontWeight: '600',
  },
  bundlePrice: {
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
