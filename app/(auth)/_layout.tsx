import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/providers/session-provider';

export default function AuthLayout() {
  const { user, isHydrating } = useSession();

  if (isHydrating) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
