
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView, Image } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { DAILY_WHISPERS_THEMES, DAILY_WHISPERS_QUOTES } from "@/constants/Colors";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import LogoImage from '@/assets/images/b84729c0-4f36-41ea-9d92-e46ccc02a67c.png';

interface ThemeButtonProps {
  item: typeof DAILY_WHISPERS_THEMES[keyof typeof DAILY_WHISPERS_THEMES];
  onPress: (themeId: string) => void;
  onHoverIn: (themeId: string) => void;
  onHoverOut: () => void;
  hoveredTheme: string | null;
  themeColors: any;
}

function ThemeButton({ item, onPress, onHoverIn, onHoverOut, hoveredTheme, themeColors }: ThemeButtonProps) {
  const scaleValue = useSharedValue(1);
  const isHovered = hoveredTheme === item.id;

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

  const handleHoverIn = () => {
    scaleValue.value = withSpring(1.05, { damping: 10, mass: 1 });
    onHoverIn(item.id);
  };

  const handleHoverOut = () => {
    scaleValue.value = withSpring(1, { damping: 10, mass: 1 });
    onHoverOut();
  };

  return (
    <View style={styles.themeButtonContainer}>
      <Animated.View style={[animatedStyle, styles.themeButtonWrapper]}>
        <Pressable
          onPress={handlePress}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
          style={[
            styles.themeButton,
            {
              backgroundColor: item.buttonColor,
              shadowOpacity: isHovered ? 0.3 : 0.15,
            },
          ]}
        >
          <Text style={styles.themeEmoji}>{item.emoji}</Text>
        </Pressable>
      </Animated.View>
      <View style={styles.themeTextContainer}>
        <Text style={styles.themeName}>{item.name}</Text>
        <Text style={styles.themeDescription}>
          {item.description}
        </Text>
        <Text style={styles.themePrice}>
          AUD ${item.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

function QuoteCardPreview({ themeId, themeColors, onPress }: { themeId: string; themeColors: any; onPress: () => void }) {
  const theme_data = DAILY_WHISPERS_THEMES[themeId as keyof typeof DAILY_WHISPERS_THEMES];
  const quotes = DAILY_WHISPERS_QUOTES[themeId as keyof typeof DAILY_WHISPERS_QUOTES] || [];
  
  const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : "No quotes available";

  console.log('Rendering QuoteCardPreview for theme:', themeId, 'Quote:', randomQuote);

  return (
    <Pressable onPress={onPress} style={styles.quoteCardPressable}>
      <View style={[styles.quoteCardPreview, { backgroundColor: theme_data.pastelColor }]}>
        <Text style={styles.quoteCardText}>
          "{randomQuote}"
        </Text>
        <Image
          source={LogoImage}
          style={[styles.cardDecorativeImage, { tintColor: '#FFFFFF' }]}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const universalThemes = [
    DAILY_WHISPERS_THEMES.youAreLoved,
    DAILY_WHISPERS_THEMES.funnySideOfLife,
    DAILY_WHISPERS_THEMES.gratitudePearls,
    DAILY_WHISPERS_THEMES.threadsOfConnection,
  ];

  const specialThemes = [
    DAILY_WHISPERS_THEMES.motherhood,
    DAILY_WHISPERS_THEMES.aDogsLife,
    DAILY_WHISPERS_THEMES.aCatsLife,
    DAILY_WHISPERS_THEMES.whispersFromNature,
  ];

  console.log('HomeScreen rendered');
  console.log('Universal themes:', universalThemes.map(t => t.id));
  console.log('Special themes:', specialThemes.map(t => t.id));
  console.log('Hovered theme:', hoveredTheme);

  const handleThemePress = (themeId: string) => {
    console.log("Theme pressed - navigating to purchase options:", themeId);
    router.push({
      pathname: '/(tabs)/(home)/purchase-options',
      params: { selectedTheme: themeId }
    });
  };

  const handleCardPress = (themeId: string) => {
    console.log("Card pressed - navigating to purchase options");
    router.push({
      pathname: '/(tabs)/(home)/purchase-options',
      params: { selectedTheme: themeId }
    });
  };

  const handleHoverIn = (themeId: string) => {
    console.log("Hovering over theme:", themeId);
    setHoveredTheme(themeId);
  };

  const handleHoverOut = () => {
    console.log("Hover ended");
    setHoveredTheme(null);
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRightContainer}>
      <Pressable
        onPress={() => router.push('/(tabs)/demo')}
        style={styles.headerButtonContainer}
      >
        <IconSymbol 
          ios_icon_name="play.circle.fill" 
          android_material_icon_name="play_circle" 
          size={24}
          color="#5d8aa8" 
        />
      </Pressable>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        style={styles.headerButtonContainer}
      >
        <IconSymbol 
          ios_icon_name="quote.bubble.fill" 
          android_material_icon_name="format_quote" 
          size={24}
          color="#5d8aa8" 
        />
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
      <View style={[styles.container, { backgroundColor: '#E6F2F8' }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && styles.scrollContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              Daily Whispers
            </Text>
            
            {/* Bird Logo in Circle */}
            <View style={styles.logoCircle}>
              <Image
                source={LogoImage}
                style={[styles.logoImage, { tintColor: '#FFFFFF' }]}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.subtitle}>
              Gift someone a year of daily quotes to show them you care.
            </Text>
          </View>

          {/* Choose a Theme Section */}
          <View style={styles.section}>
            <Text style={styles.chooseThemeHeading}>
              Choose a Theme
            </Text>
            
            {/* Universal Themes */}
            <Text style={styles.subSectionTitle}>
              Universal
            </Text>
            {universalThemes.map((item, index) => (
              <View key={index}>
                <ThemeButton
                  item={item}
                  onPress={handleThemePress}
                  onHoverIn={handleHoverIn}
                  onHoverOut={handleHoverOut}
                  hoveredTheme={hoveredTheme}
                  themeColors={theme.colors}
                />
                {hoveredTheme === item.id && (
                  <QuoteCardPreview 
                    themeId={item.id} 
                    themeColors={theme.colors}
                    onPress={() => handleCardPress(item.id)}
                  />
                )}
              </View>
            ))}

            {/* Special Themes */}
            <Text style={[styles.subSectionTitle, { marginTop: 8 }]}>
              Special
            </Text>
            {specialThemes.map((item, index) => (
              <View key={index}>
                <ThemeButton
                  item={item}
                  onPress={handleThemePress}
                  onHoverIn={handleHoverIn}
                  onHoverOut={handleHoverOut}
                  hoveredTheme={hoveredTheme}
                  themeColors={theme.colors}
                />
                {hoveredTheme === item.id && (
                  <QuoteCardPreview 
                    themeId={item.id} 
                    themeColors={theme.colors}
                    onPress={() => handleCardPress(item.id)}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              How It Works
            </Text>
            <Text style={styles.infoText}>
              This is <Text style={styles.underlinedText}>not</Text> an automatic subscription-based app. It is a simple gift of love that lasts a year.{'\n\n'}
              1. Choose a theme{'\n'}
              2. Select your purchase option{'\n'}
              3. Enter recipient details{'\n'}
              4. Complete payment{'\n'}
              5. They receive daily quotes for a year!
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/demo')}
              style={styles.demoButton}
            >
              <IconSymbol 
                ios_icon_name="play.circle.fill" 
                android_material_icon_name="play_circle" 
                size={20}
                color="#FFFFFF" 
              />
              <Text style={styles.demoButtonText}>
                Try Interactive Demo
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
  scrollContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scrollContainerWithTabBar: {
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 8,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    color: '#5d8aa8',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#5d8aa8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 0,
    color: '#2c5f7a',
  },
  section: {
    marginBottom: 16,
  },
  chooseThemeHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#5d8aa8',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 0,
    opacity: 0.8,
    color: '#2c5f7a',
  },
  themeButtonContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    gap: 12,
  },
  themeButtonWrapper: {
    flexShrink: 0,
  },
  themeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 36,
  },
  themeTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    color: '#1a1a1a',
  },
  themeDescription: {
    fontSize: 13,
    lineHeight: 15,
    marginBottom: 3,
    color: '#2c5f7a',
  },
  themePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    opacity: 0.7,
  },
  quoteCardPressable: {
    marginBottom: 8,
    marginLeft: 82,
  },
  quoteCardPreview: {
    borderRadius: 16,
    padding: 20,
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
    overflow: 'hidden',
  },
  quoteCardText: {
    fontSize: 19,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 27,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  cardDecorativeImage: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 43,
    height: 43,
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: '#2c5f7a',
  },
  underlinedText: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    backgroundColor: '#5d8aa8',
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
