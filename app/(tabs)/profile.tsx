
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Share, Alert, ImageBackground, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from "@/constants/Colors";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("Friend");
  const [quoteHistory, setQuoteHistory] = useState<string[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [uploadedImages, setUploadedImages] = useState<{ uri: string; name: string }[]>([]);
  const quoteCardRef = useRef<View>(null);

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
    loadUploadedImages();
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

  const handleShare = async () => {
    try {
      Alert.alert("Sharing Quote", "Preparing your quote card to share...");
      
      if (quoteCardRef.current) {
        const uri = await captureRef(quoteCardRef, {
          format: "png",
          quality: 0.95,
        });

        const fileName = `DailyWhispers_${Date.now()}.png`;
        const cacheDir = FileSystem.cacheDirectory || '';
        
        if (!cacheDir) {
          console.log("Cache directory not available");
          Alert.alert("Share Error", "Could not access file system. Please try again.");
          return;
        }
        
        const newPath = `${cacheDir}${fileName}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: newPath,
        });

        const shareMessage = `${recipientName}, I wanted to share this beautiful quote with you!\n\n"${currentQuote}"\n\nExplore Daily Whispers and discover more inspiring quotes: https://dailywhispers.app`;

        await Sharing.shareAsync(newPath, {
          mimeType: "image/png",
          dialogTitle: "Share Your Daily Whispers Quote",
          UTI: "com.apple.share",
        });

        console.log("Quote shared successfully!");
      }
    } catch (error) {
      console.log("Error sharing:", error);
      Alert.alert("Share Error", "Could not share the quote. Please try again.");
    }
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

  const loadUploadedImages = async () => {
    try {
      const documentsDir = FileSystem.documentDirectory || '';
      if (!documentsDir) {
        console.log("Documents directory not available");
        return;
      }

      const imagesDir = `${documentsDir}uploaded_images/`;
      
      try {
        const files = await FileSystem.readDirectoryAsync(imagesDir);
        const imageFiles = files.filter(file => 
          file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
        );
        
        const imagePaths = imageFiles.map(file => ({
          uri: `${imagesDir}${file}`,
          name: file
        }));
        setUploadedImages(imagePaths);
        console.log("Loaded images:", imagePaths);
      } catch (error) {
        console.log("Images directory does not exist yet, will create on first upload");
      }
    } catch (error) {
      console.log("Error loading images:", error);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Create the uploaded_images directory if it doesn't exist
        const documentsDir = FileSystem.documentDirectory || '';
        if (!documentsDir) {
          Alert.alert("Error", "Could not access file system.");
          return;
        }

        const imagesDir = `${documentsDir}uploaded_images/`;
        
        try {
          await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
        } catch (error) {
          console.log("Directory already exists or error creating:", error);
        }

        // Generate a unique filename
        const fileName = `image_${Date.now()}.png`;
        const savedPath = `${imagesDir}${fileName}`;

        // Copy the image to the uploaded_images folder
        await FileSystem.copyAsync({
          from: imageUri,
          to: savedPath,
        });

        setUploadedImages([...uploadedImages, { uri: savedPath, name: fileName }]);
        Alert.alert("Success", `Image uploaded!\n\nFile: ${fileName}`);
        console.log("Image saved to:", savedPath);
        
        // Reload images to ensure they're displayed
        await loadUploadedImages();
      }
    } catch (error) {
      console.log("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const deleteImage = async (imagePath: string) => {
    try {
      await FileSystem.deleteAsync(imagePath);
      const newImages = uploadedImages.filter(img => img.uri !== imagePath);
      setUploadedImages(newImages);
      Alert.alert("Success", "Image deleted successfully.");
      console.log("Image deleted:", imagePath);
    } catch (error) {
      console.log("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image.");
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
            title: "Today's Quote",
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1600&fit=crop' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]} edges={['top']}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.contentContainer,
              Platform.OS !== 'ios' && styles.contentContainerWithTabBar
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>Today's Quote</Text>

            {themeData && (
              <View
                ref={quoteCardRef}
                style={[
                  styles.quoteCard,
                  { backgroundColor: themeData.pastelColor },
                ]}
              >
                <View style={styles.cardInner}>
                  <Text style={[styles.recipientName, { color: theme.colors.text }]}>
                    {recipientName}
                  </Text>
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
                <Image
                  source={require('@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png')}
                  style={[styles.quoteCardDecorativeImage, { tintColor: '#FFFFFF' }]}
                />
              </View>
            )}

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
                  { backgroundColor: theme.dark ? 'rgba(44,44,46,0.9)' : 'rgba(227,218,201,0.9)' },
                ]}
                onPress={loadPreviousQuote}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Previous Quote
                </Text>
              </Pressable>
            </View>

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

            <Pressable
              style={[
                styles.uploadButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleImageUpload}
            >
              <IconSymbol name="photo.badge.plus" color="#FFFFFF" size={20} />
              <Text style={[styles.uploadButtonText, { color: '#FFFFFF' }]}>
                Upload Image
              </Text>
            </Pressable>

            <GlassView style={[
              styles.folderInfoSection,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]} glassEffectStyle="regular">
              <View style={styles.folderInfoHeader}>
                <IconSymbol name="folder.fill" color={theme.colors.primary} size={20} />
                <Text style={[styles.folderInfoTitle, { color: theme.colors.text }]}>
                  Uploaded Images Folder
                </Text>
              </View>
              <Text style={[styles.folderPath, { color: theme.dark ? '#98989D' : '#666' }]}>
                {FileSystem.documentDirectory}uploaded_images/
              </Text>
              <Text style={[styles.folderInfoDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                This is where your uploaded images are stored. This folder is part of the app's internal storage and is not visible in your device's file explorer.
              </Text>
              <Text style={[styles.folderInfoCount, { color: theme.colors.primary }]}>
                {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} stored
              </Text>
            </GlassView>

            {uploadedImages.length > 0 && (
              <View style={styles.imagesSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Uploaded Images ({uploadedImages.length})
                </Text>
                <View style={styles.imagesGrid}>
                  {uploadedImages.map((imageData, index) => (
                    <View key={index} style={styles.imageCard}>
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: imageData.uri }}
                          style={styles.uploadedImage}
                        />
                        <Pressable
                          style={styles.deleteImageButton}
                          onPress={() => deleteImage(imageData.uri)}
                        >
                          <IconSymbol name="xmark.circle.fill" color="#FF3B30" size={24} />
                        </Pressable>
                      </View>
                      <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={2}>
                        {imageData.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

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
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
    fontWeight: '500',
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
  headerButtonContainer: {
    padding: 6,
  },
  testButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  uploadButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagesSection: {
    marginBottom: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imageCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  folderInfoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  folderInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  folderInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  folderPath: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  folderInfoDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  folderInfoCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
