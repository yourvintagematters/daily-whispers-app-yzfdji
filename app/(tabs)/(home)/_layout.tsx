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
        name="purchase-options"
        options={{
          title: 'Purchase Options',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="recipient-details"
        options={{
          title: 'Recipient Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
