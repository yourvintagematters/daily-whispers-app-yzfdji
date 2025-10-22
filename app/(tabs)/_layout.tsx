
import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();

  const tabBarItems = [
    {
      name: 'Home',
      icon: 'house.fill',
      route: '/(tabs)/(home)',
    },
    {
      name: 'Profile',
      icon: 'person.fill',
      route: '/(tabs)/profile',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.dark ? '#8E8E93' : '#C7C7CC',
          tabBarStyle: {
            backgroundColor: theme.dark ? '#1C1C1E' : '#FFFFFF',
            borderTopColor: theme.dark ? '#3A3A3C' : '#E5E5EA',
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol name="house.fill" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <IconSymbol name="person.fill" color={color} size={24} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // Android and Web use FloatingTabBar
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>
      <FloatingTabBar
        tabs={tabBarItems}
        containerWidth={200}
        borderRadius={16}
        bottomMargin={20}
      />
    </View>
  );
}
