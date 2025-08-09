import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="auth/login" options={{ title: '로그인' }} />
          <Stack.Screen name="auth/signup" options={{ title: '회원가입' }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </>
  );
}
