
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Share, Alert, ImageBackground, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { File, Directory, Paths } from "expo-file-system";
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
        const cacheDir = Paths.cache;
        
        if (!cacheDir) {
          console.log("Cache directory not available");
          Alert.alert("Share Error", "Could not access file system. Please try again.");
          return;
        }
        
        const newFile = new File(cacheDir, fileName);
        
        const sourceFile = new File(uri);
        await sourceFile.copy(newFile);

        const shareMessage = `${recipientName}, I wanted to share this beautiful quote with you!\n\n"${currentQuote}"\n\nExplore Daily Whispers and discover more inspiring quotes: https://dailywhispers.app`;

        await Sharing.shareAsync(newFile.uri, {
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
      const documentsDir = Paths.document;
      if (!documentsDir) {
        console.log("Documents directory not available");
        return;
      }

      const imagesDir = new Directory(documentsDir, 'uploaded_images');
      console.log("Loading images from:", imagesDir.uri);
      
      try {
        if (!imagesDir.exists) {
          console.log("Images directory does not exist yet");
          setUploadedImages([]);
          return;
        }

        const contents = imagesDir.list();
        const imageFiles = contents.filter(item => 
          item instanceof File && (
            item.name.endsWith('.png') || 
            item.name.endsWith('.jpg') || 
            item.name.endsWith('.jpeg')
          )
        ) as File[];
        
        console.log("Image files found:", imageFiles.length);
        
        const imagePaths = imageFiles.map(file => ({
          uri: file.uri,
          name: file.name
        }));
        setUploadedImages(imagePaths);
        console.log("Loaded images:", imagePaths);
      } catch (error) {
        console.log("Error reading directory:", error);
        setUploadedImages([]);
      }
    } catch (error) {
      console.log("Error loading images:", error);
      setUploadedImages([]);
    }
  };

  const handleImageUpload = async () => {
    try {
      console.log("Starting image upload process...");
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log("Image picker result:", result.canceled);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);
        
        const documentsDir = Paths.document;
        if (!documentsDir) {
          console.log("ERROR: Documents directory is null");
          Alert.alert("Error", "Could not access file system. Please try again.");
          return;
        }

        console.log("Documents directory:", documentsDir.uri);

        const imagesDir = new Directory(documentsDir, 'uploaded_images');
        console.log("Images directory path:", imagesDir.uri);
        
        try {
          if (!imagesDir.exists) {
            console.log("Creating directory...");
            imagesDir.create({ intermediates: true });
            console.log("Directory created successfully");
          } else {
            console.log("Directory already exists");
          }
        } catch (dirError) {
          console.log("Error checking/creating directory:", dirError);
          Alert.alert("Error", "Could not create image directory. Please try again.");
          return;
        }

        const fileName = `image_${Date.now()}.png`;
        const newFile = new File(imagesDir, fileName);
        console.log("Attempting to save to:", newFile.uri);

        try {
          const sourceFile = new File(imageUri);
          await sourceFile.copy(newFile);
          console.log("File copied successfully");
        } catch (copyError) {
          console.log("Copy error details:", copyError);
          Alert.alert("Error", "Failed to save image file. Please try again.");
          return;
        }

        setUploadedImages([...uploadedImages, { uri: newFile.uri, name: fileName }]);
        Alert.alert("Success", `Image uploaded!\n\nFile: ${fileName}`);
        console.log("Image saved to:", newFile.uri);
        
        await loadUploadedImages();
      } else {
        console.log("Image selection was cancelled or no assets found");
      }
    } catch (error) {
      console.log("Error uploading image:", error);
      console.log("Error type:", typeof error);
      console.log("Error keys:", error instanceof Error ? Object.keys(error) : "Not an Error object");
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const deleteImage = async (imagePath: string) => {
    try {
      const fileToDelete = new File(imagePath);
      await fileToDelete.delete();
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

            <View style={styles.uploadSection}>
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

              {uploadedImages.length > 0 && (
                <Pressable
                  style={[
                    styles.galleryButton,
                    { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                  ]}
                  onPress={() => router.push('/(tabs)/image-gallery')}
                >
                  <IconSymbol name="photo.stack" color={theme.colors.primary} size={20} />
                  <Text style={[styles.galleryButtonText, { color: theme.colors.primary }]}>
                    View Gallery ({uploadedImages.length})
                  </Text>
                </Pressable>
              )}
            </View>

            {uploadedImages.length > 0 && (
              <GlassView style={[
                styles.quickAccessSection,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]} glassEffectStyle="regular">
                <View style={styles.quickAccessHeader}>
                  <IconSymbol name="star.fill" color={theme.colors.primary} size={18} />
                  <Text style={[styles.quickAccessTitle, { color: theme.colors.text }]}>
                    Quick Access
                  </Text>
                </View>
                <Text style={[styles.quickAccessSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Your most recent uploads
                </Text>
                <View style={styles.quickAccessGrid}>
                  {uploadedImages.slice(-4).reverse().map((imageData, index) => (
                    <Pressable
                      key={index}
                      style={styles.quickAccessItem}
                      onPress={() => {
                        Alert.alert(imageData.name, '', [
                          {
                            text: 'Share',
                            onPress: () => Sharing.shareAsync(imageData.uri),
                          },
                          {
                            text: 'Delete',
                            onPress: () => deleteImage(imageData.uri),
                            style: 'destructive',
                          },
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                        ]);
                      }}
                    >
                      <Image
                        source={{ uri: imageData.uri }}
                        style={styles.quickAccessImage}
                      />
                    </Pressable>
                  ))}
                </View>
              </GlassView>
            )}

            <GlassView style={[
              styles.folderInfoSection,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]} glassEffectStyle="regular">
              <View style={styles.folderInfoHeader}>
                <IconSymbol name="info.circle.fill" color={theme.colors.primary} size={20} />
                <Text style={[styles.folderInfoTitle, { color: theme.colors.text }]}>
                  About Your Images
                </Text>
              </View>
              <Text style={[styles.folderInfoDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                Your uploaded images are securely stored in the app's internal storage. Use the Gallery view to manage, share, or delete your images. All images are stored locally on your device.
              </Text>
              <Text style={[styles.folderInfoCount, { color: theme.colors.primary }]}>
                {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} stored
              </Text>
            </GlassView>

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
  uploadSection: {
    marginBottom: 24,
    gap: 12,
  },
  uploadButton: {
    borderRadius: 12,
    padding: 16,
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
  galleryButton: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  galleryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAccessSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickAccessSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickAccessItem: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  quickAccessImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
