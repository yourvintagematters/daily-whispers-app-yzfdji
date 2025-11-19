
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text, Platform, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

interface PurchaseOption {
  id: string;
  name: string;
  description: string;
  price: number;
  count: number;
  icon: string;
}

const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'singleTheme',
    name: 'For Someone Special',
    description: 'Let someone special know you think of them',
    price: 9.99,
    count: 1,
    icon: '',
  },
  {
    id: 'bestiesBundle',
    name: 'Besties Bundle',
    description: 'Share 3x the Love for just 2x the price',
    price: 18.99,
    count: 3,
    icon: '',
  },
  {
    id: 'shareTheLoveBigTime',
    name: 'Share the Love Big Time!',
    description: 'Share 10x the Love, and feel the love back with a bonus selection for yourself', 
    price: 49.99,
    count: 10,
    icon: '',
  },
];

function OptionButton({ 
  option, 
  isHovered, 
  onPress, 
  onHoverIn, 
  onHoverOut,
  theme 
}: { 
  option: PurchaseOption; 
  isHovered: boolean; 
  onPress: () => void; 
  onHoverIn: () => void; 
  onHoverOut: () => void;
  theme: any;
}) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handleHoverIn = () => {
    onHoverIn();
    scaleValue.value = withSpring(1.02, {
      damping: 15,
      mass: 1,
      overshootClamping: false,
    });
  };

  const handleHoverOut = () => {
    onHoverOut();
    scaleValue.value = withSpring(1, {
      damping: 15,
      mass: 1,
      overshootClamping: false,
    });
  };

  const renderMultiplier = (text: string) => {
    const parts = text.split(/(3x|2x|10x)/g);
    return parts.map((part, index) => {
      if (part === '3x' || part === '2x' || part === '10x') {
        return (
          <Text key={index} style={[styles.multiplierText, { color: theme.colors.text }]}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowOpacity: isHovered ? 0.2 : 0.1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: isHovered ? 6 : 2 },
          shadowRadius: isHovered ? 8 : 4,
          elevation: isHovered ? 8 : 3,
        },
      ]}
    >
      <Pressable
        style={[
          styles.optionButton,
          { backgroundColor: theme.dark ? '#2C2C2E' : '#FFFFFF' },
          isHovered && styles.optionButtonHovered,
        ]}
        onPress={onPress}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionName, { color: theme.colors.text }]}>
              {option.name}
            </Text>
            <Text style={[styles.optionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
              {renderMultiplier(option.description)}
            </Text>
            <Text style={[styles.optionPrice, { color: '#5d8aa8' }]}>
              AUD ${option.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function PurchaseOptionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedTheme } = useLocalSearchParams();
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);

  const handleOptionSelect = (option: PurchaseOption) => {
    console.log(`Selected option: ${option.id}`);
    router.push({
      pathname: '/(tabs)/(home)/recipient-details',
      params: {
        selectedTheme,
        optionId: option.id,
        optionName: option.name,
        optionPrice: option.price.toString(),
        optionCount: option.count.toString(),
      }
    });
  };

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => router.back()}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="chevron.left" color="#5d8aa8" />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Purchase Options",
            headerLeft: renderHeaderLeft,
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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: '#5d8aa8' }]}>
              Share the Love
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
              Choose how many people you want to gift to
            </Text>
          </View>

          {/* Purchase Options */}
          <View style={styles.optionsContainer}>
            {PURCHASE_OPTIONS.map(option => (
              <OptionButton
                key={option.id}
                option={option}
                isHovered={hoveredOptionId === option.id}
                onPress={() => handleOptionSelect(option)}
                onHoverIn={() => setHoveredOptionId(option.id)}
                onHoverOut={() => setHoveredOptionId(null)}
                theme={theme}
              />
            ))}
          </View>

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: theme.dark ? 'rgba(44,44,46,0.9)' : '#FFFFFF' }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              What Happens Next?
            </Text>
            <Text style={[styles.infoText, { color: theme.dark ? '#B0B0B0' : '#555' }]}>
              1. Choose your option above{'\n'}
              2. Enter recipient details{'\n'}
              3. Select themes for each recipient{'\n'}
              4. Complete payment{'\n'}
              5. Recipients get daily quotes for a year!
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
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
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
    transition: 'all 0.3s ease-in-out',
  },
  optionButtonHovered: {
    opacity: 0.95,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  multiplierText: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '700',
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
