import { Platform, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';

function SettingsButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        console.log('[HomeLayout] Settings button pressed');
        router.push('/(tabs)/settings');
      }}
      style={{ paddingRight: 8 }}
      accessibilityLabel="Open Settings"
    >
      <Settings size={22} color="#5d8aa8" strokeWidth={2} />
    </Pressable>
  );
}

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: Platform.OS === 'ios',
        headerRight: () => <SettingsButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Daily Whispers' }} />
      <Stack.Screen name="purchase-options" options={{ title: 'Purchase Options' }} />
      <Stack.Screen name="recipient-details" options={{ title: 'Recipient Details' }} />
      <Stack.Screen name="payment" options={{ title: 'Payment' }} />
    </Stack>
  );
}
