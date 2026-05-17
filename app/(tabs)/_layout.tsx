import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="(home)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="demo" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
