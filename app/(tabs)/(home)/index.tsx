
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Platform, ScrollView, ImageBackground, Image } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES, APP_CUSTOMIZATION } from "@/constants/Colors";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import LogoImage from '@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png';

interface ThemeButtonProps {
  item: typeof DAILY_WHISPERS_THEMES[keyof typeof DAILY_WHISPERS_THEMES];
  onPress: (themeId: string) => void;
  onHover: (themeId: string | null) => void;
  hoveredTheme: string | null;
  themeColors: any;
}

function ThemeButton({ item, onPress, onHover, hoveredTheme, themeColors }: ThemeButtonProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePress = () => {
    console.log('Theme button pressed:', item.id);
    scaleValue.value = withSpring(1.1, { damping: 10, mass: 1 }, () => {
      scaleValue.value = withSpring(1, { damping: 10, mass: 1 });
    });
    onPress(item.id);
  };

  const handleMouseEnter = () => {
    console.log('Mouse enter on theme:', item.id);
    onHover(item.id);
  };

  const handleMouseLeave = () => {
    console.log('Mouse leave on theme:', item.id);
    onHover(null);
  };

  return (
    <View style={styles.themeButtonContainer}>
      <Animated.View style={[animatedStyle, styles.themeButtonWrapper]}>
        <Pressable
          onPress={handlePress}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={[
            styles.themeButton,
            {
              backgroundColor: item.buttonColor,
              shadowOpacity: hoveredTheme === item.id ? 0.3 : 0.15,
            },
          ]}
        >
          <Text style={styles.themeEmoji}>{item.emoji}</Text>
        </Pressable>
      </Animated.View>
      <View style={styles.themeTextContainer}>
        <Text style={[styles.themeName, { color: themeColors.text }]}>{item.name}</Text>
        <Text style={[styles.themeDescription, { color: themeColors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.themePrice, { color: themeColors.text, opacity: 0.7 }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

function QuoteCardPreview({ themeId, themeColors }: { themeId: string; themeColors: any }) {
  const theme_data = DAILY_WHISPERS_THEMES[themeId as keyof typeof DAILY_WHISPERS_THEMES];
  const quotes = DAILY_WHISPERS_QUOTES[themeId as keyof typeof DAILY_WHISPERS_QUOTES] || [];
  
  // Show only quotes from the selected theme (purchased collection)
  const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : "No quotes available";

  console.log('Rendering QuoteCardPreview for theme:', themeId, 'Quote:', randomQuote);

  return (
    <View style={[styles.quoteCardPreview, { backgroundColor: theme_data.pastelColor }]}>
      <Text style={[styles.quoteCardText, { color: themeColors.text }]}>
        "{randomQuote}"
      </Text>
      <Image
        source={LogoImage}
        style={[styles.cardDecorativeImage, { tintColor: '#FFFFFF' }]}
      />
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const themes = Object.values(DAILY_WHISPERS_THEMES);

  console.log('HomeScreen rendered, hoveredTheme:', hoveredTheme);

  const handleThemePress = (themeId: string) => {
    console.log("Theme selected:", themeId);
    router.push({
      pathname: '/(tabs)/(home)/purchase-options',
      params: { selectedTheme: themeId }
    });
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRightContainer}>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        style={styles.headerButtonContainer}
      >
        <IconSymbol name="quote.bubble.fill" color={theme.colors.primary} />
      </Pressable>
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Daily Whispers",
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <ImageBackground
        source={{ uri: APP_CUSTOMIZATION.backgroundImages.home }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={[styles.container, { backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              Platform.OS !== 'ios' && styles.scrollContainerWithTabBar
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleWithImage}>
                <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
                  Daily Whispers
                </Text>
                <Image
                  source={LogoImage}
                  style={[styles.titleDecorativeImage, { tintColor: '#000000' }]}
                />
              </View>
              <Text style={[styles.subtitle, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
                Gift someone a year of daily quotes to show them you care.
              </Text>
            </View>

            {/* Themes Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Choose a Theme
              </Text>
              <FlatList
                data={themes}
                renderItem={({ item }) => (
                  <View>
                    <ThemeButton
                      item={item}
                      onPress={handleThemePress}
                      onHover={setHoveredTheme}
                      hoveredTheme={hoveredTheme}
                      themeColors={theme.colors}
                    />
                    {hoveredTheme === item.id && (
                      <QuoteCardPreview themeId={item.id} themeColors={theme.colors} />
                    )}
                  </View>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            </View>

            {/* Info Section */}
            <View style={[styles.infoSection, { backgroundColor: '#E3DAC9' }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                How It Works
              </Text>
              <Text style={[styles.infoText, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
                1. Choose a theme{'\n'}
                2. Select your purchase option{'\n'}
                3. Enter recipient details{'\n'}
                4. Complete payment{'\n'}
                5. They receive daily quotes for a year!
              </Text>
            </View>
          </ScrollView>
        </View>
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
  titleSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeButtonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  themeButtonWrapper: {
    flexShrink: 0,
  },
  themeButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  themeEmoji: {
    fontSize: 40,
  },
  themeTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  themePrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  quoteCardPreview: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginLeft: 92,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ perspective: 1000 }, { rotateY: '-5deg' }],
    position: 'relative' as const,
  },
  quoteCardText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  cardDecorativeImage: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 48,
    height: 48,
  },
  titleWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleDecorativeImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButtonContainer: {
    padding: 6,
  },
});
