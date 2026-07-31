import React, { useEffect, useState } from 'react';
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

// Required so the browser popup closes and returns to the app on Android
WebBrowser.maybeCompleteAuthSession();

export function GoogleSignInButton() {
  const router = useRouter();
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  // Hook must be at top level — no try/catch, no conditional
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Only Web Client ID is needed when testing with Expo Go
    // Android/iOS Client IDs are needed only for standalone builds
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const accessToken = response.authentication?.accessToken;

    if (!accessToken) {
      Alert.alert('Google Login Error', 'Token dari Google tidak ditemukan. Coba lagi.');
      return;
    }

    const signIn = async () => {
      setLoading(true);
      try {
        // Sends { token: accessToken } to POST /api/auth/social/google
        await socialLogin('google', accessToken);
        router.replace('/');
      } catch (err: any) {
        const message =
          err?.response?.data?.message ??
          err?.response?.data?.errors?.token?.[0] ??
          'Login dengan Google gagal. Coba lagi.';
        Alert.alert('Gagal', message);
      } finally {
        setLoading(false);
      }
    };

    signIn();
  }, [response]);

  const handlePress = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Konfigurasi Belum Lengkap',
        'Tambahkan EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ke file .env.local lalu restart Expo dengan: npx expo start -c',
      );
      return;
    }

    if (!request) {
      Alert.alert('Belum siap', 'Google Sign-In sedang memuat. Tunggu sebentar.');
      return;
    }

    try {
      await promptAsync();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Gagal membuka Google Sign-In.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={Colors.dark} size="small" />
      ) : (
        <>
          <Text style={styles.icon}>G</Text>
          <Text style={styles.text}>Lanjutkan dengan Google</Text>
        </>
      )}
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
