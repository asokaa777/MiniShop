import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

try {
  WebBrowser.maybeCompleteAuthSession();
} catch {
  // handled safely
}

export function GoogleSignInButton() {
  const router = useRouter();
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  let request: any = null;
  let response: any = null;
  let promptAsync: any = null;

  try {
    if (typeof Google?.useAuthRequest === 'function') {
      const authRes = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy_android_id',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'dummy_ios_id',
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy_web_id',
      });
      request = authRes[0];
      response = authRes[1];
      promptAsync = authRes[2];
    }
  } catch {
    // fallback if Google auth session hook fails
  }

  useEffect(() => {
    if (response?.type !== 'success') return;

    const accessToken = response.authentication?.accessToken;
    if (!accessToken) return;

    const signIn = async () => {
      setLoading(true);
      try {
        await socialLogin('google', accessToken);
        router.replace('/');
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Login dengan Google gagal. Silakan coba lagi.';
        Alert.alert('Gagal Google Login', msg);
      } finally {
        setLoading(false);
      }
    };

    signIn();
  }, [response]);

  const handlePress = async () => {
    const hasClientId =
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    if (!hasClientId) {
      Alert.alert(
        'Konfigurasi Google Login',
        'Fitur Google Login membutuhkan Client ID dari Google Cloud Console di file .env (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).\n\nSilakan gunakan registrasi/login biasa dengan Email & Password.'
      );
      return;
    }

    if (promptAsync) {
      try {
        const res = await promptAsync();
        if (res?.type === 'dismiss' || res?.type === 'cancel') {
          // User cancelled sign in
        }
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Gagal membuka Google Sign-In.');
      }
    } else {
      Alert.alert('Google Login', 'Google Sign-In belum siap atau tidak tersedia di platform ini.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={Colors.dark} size="small" />
        : (
          <>
            <Text style={styles.icon}>G</Text>
            <Text style={styles.text}>Lanjutkan dengan Google</Text>
          </>
        )
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
});
