import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Daily Whispers'
        }}
      />
      <Stack.Screen
        name="purchase-options"
        options={{
          title: 'Purchase Options',
        }}
      />
      <Stack.Screen
        name="recipient-details"
        options={{
          title: 'Recipient Details',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
        }}
      />
    </Stack>
  );
}
