import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

/**
 * Facebook Sign-In button using expo-auth-session.
 *
 * Flow mirrors GoogleSignInButton:
 * 1. Opens Facebook OAuth in a browser popup on-device
 * 2. Facebook returns an access token to the app
 * 3. We send that token to Laravel → Socialite verifies → Sanctum token returned
 *
 * Required env vars (add to .env.local and Expo secrets):
 *   EXPO_PUBLIC_FACEBOOK_APP_ID — from https://developers.facebook.com
 */
export function FacebookSignInButton() {
  const router = useRouter();
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '',
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const accessToken = response.authentication?.accessToken;
    if (!accessToken) return;

    const signIn = async () => {
      setLoading(true);
      try {
        await socialLogin('facebook', accessToken);
        router.replace('/');
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? 'Login dengan Facebook gagal. Coba lagi.';
        Alert.alert('Gagal', message);
      } finally {
        setLoading(false);
      }
    };

    signIn();
  }, [response]);

  const handlePress = async () => {
    if (!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID) {
      Alert.alert(
        'Konfigurasi Facebook Login',
        'Fitur Facebook Login membutuhkan App ID dari Facebook Developer Console.\n\nTambahkan EXPO_PUBLIC_FACEBOOK_APP_ID ke file .env.local.',
      );
      return;
    }

    try {
      await promptAsync();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Gagal membuka Facebook Sign-In.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handlePress}
      disabled={!request || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <>
          <Text style={styles.icon}>f</Text>
          <Text style={styles.text}>Lanjutkan dengan Facebook</Text>
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
    backgroundColor: '#1877F2',
    borderRadius: 14,
    height: 52,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
