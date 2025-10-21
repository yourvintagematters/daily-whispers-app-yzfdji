import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Daily Whispers'
        }}
      />
      <Stack.Screen
        name="bundles"
        options={{
          title: 'Bundle Deals',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
