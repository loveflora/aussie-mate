import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, signInWithProvider } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        Alert.alert('회원가입 오류', error.message);
      } else {
        Alert.alert(
          '회원가입 성공', 
          '이메일을 확인하여 계정을 활성화해주세요.',
          [{ text: '확인', onPress: () => router.replace('/auth/login') }]
        );
      }
    } catch (err: any) {
      Alert.alert('오류', err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    
    try {
      const { error } = await signInWithProvider(provider);
      
      if (error) {
        Alert.alert('소셜 회원가입 오류', error.message);
      }
      // The OAuth redirect will handle navigation
    } catch (err: any) {
      Alert.alert('오류', err.message || '소셜 회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>회원가입</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.signupButton}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signupButtonText}>회원가입</Text>
        )}
      </TouchableOpacity>
      
      {/* <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <View style={styles.socialButtons}>
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]}
          onPress={() => handleSocialSignup('google')}
          disabled={isLoading}
        >
          <FontAwesome name="google" size={20} color="#DB4437" />
          <Text style={styles.socialButtonText}>구글로 회원가입</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.socialButton, styles.facebookButton]}
          onPress={() => handleSocialSignup('facebook')}
          disabled={isLoading}
        >
          <FontAwesome name="facebook" size={20} color="#4267B2" />
          <Text style={styles.socialButtonText}>페이스북으로 회원가입</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.socialButton, styles.appleButton]}
          onPress={() => handleSocialSignup('apple')}
          disabled={isLoading}
        >
          <FontAwesome name="apple" size={20} color="#000" />
          <Text style={styles.socialButtonText}>애플로 회원가입</Text>
        </TouchableOpacity>
      </View>
       */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>로그인</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  googleButton: {},
  facebookButton: {},
  appleButton: {},
  socialButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
});
