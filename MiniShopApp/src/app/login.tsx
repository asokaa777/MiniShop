import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { FacebookSignInButton } from '../components/FacebookSignInButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lengkapi data', 'Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (err: any) {
      const message = err?.response?.data?.errors?.email?.[0]
        ?? err?.response?.data?.message
        ?? 'Login gagal. Periksa email dan password.';
      Alert.alert('Login Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brandSection}>
          <Text style={styles.brandIcon}>🛒</Text>
          <Text style={styles.brandName}>MiniShop</Text>
          <Text style={styles.brandTagline}>Masuk ke akun kamu</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="kamu@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.loginBtnText}>Masuk</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login buttons */}
          <GoogleSignInButton />
          <FacebookSignInButton />

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: 24 },

  brandSection: { alignItems: 'center', marginBottom: 40 },
  brandIcon:    { fontSize: 56, marginBottom: 8 },
  brandName:    { fontSize: 28, fontWeight: '800', color: Colors.dark },
  brandTagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  form:  { gap: 16 },
  field: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.dark,
  },

  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: { backgroundColor: Colors.grayMid, shadowOpacity: 0 },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textMuted },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
