
import React from 'react';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

interface TabBarItem {
  name: string;
  icon: string;
  route: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = 200,
  borderRadius = 16,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const handleTabPress = (route: string) => {
    console.log('Navigating to:', route);
    router.push(route);
  };

  const isActive = (route: string) => {
    return pathname.includes(route.split('/').pop() || '');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          position: 'absolute',
          bottom: bottomMargin,
          left: 0,
          right: 0,
          alignItems: 'center',
        },
      ]}
      edges={['bottom']}
    >
      <BlurView intensity={90} style={styles.blurContainer}>
        <View
          style={[
            styles.container,
            {
              width: containerWidth,
              borderRadius: borderRadius,
              backgroundColor: theme.dark
                ? 'rgba(28, 28, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabItem,
                {
                  borderRightWidth: index < tabs.length - 1 ? 1 : 0,
                  borderRightColor: theme.dark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                },
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabContent,
                  {
                    backgroundColor: isActive(tab.route)
                      ? theme.colors.primary + '20'
                      : 'transparent',
                  },
                ]}
              >
                <IconSymbol
                  name={tab.icon}
                  color={
                    isActive(tab.route)
                      ? theme.colors.primary
                      : theme.dark
                        ? '#8E8E93'
                        : '#C7C7CC'
                  }
                  size={24}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive(tab.route)
                        ? theme.colors.primary
                        : theme.dark
                          ? '#8E8E93'
                          : '#C7C7CC',
                      fontSize: 10,
                    },
                  ]}
                >
                  {tab.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    justifyContent: 'center',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    width: '100%',
  },
  tabLabel: {
    marginTop: 4,
    fontWeight: '600',
  },
});
