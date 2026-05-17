import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen key="home" name="(home)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="demo" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
