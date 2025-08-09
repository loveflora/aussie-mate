import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from 'api';
import Colors from '../../constants/Colors';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check if we have a session
        const { data: sessionData, error: sessionError } = await authApi.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setError("로그인 처리 중 오류가 발생했습니다.");
          return;
        }

        if (sessionData.session) {
          // If we have a session, navigate to home
          router.replace('/');
        } else {
          // No session found, redirect back to login
          setError("로그인 세션을 찾을 수 없습니다. 다시 시도해주세요.");
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError("로그인 처리 중 오류가 발생했습니다.");
      }
    };

    processCallback();
  }, [router, params]);

  return (
    <View style={styles.container}>
      {error ? (
        <View>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.redirectText}>로그인 화면으로 돌아갑니다...</Text>
        </View>
      ) : (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>로그인 처리 중...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  redirectText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});
