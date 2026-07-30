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

export default function RegisterScreen() {
  const router  = useRouter();
  const { register } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Lengkapi data', 'Nama, email, dan password wajib diisi.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password terlalu pendek', 'Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined);
      router.replace('/');
    } catch (err: any) {
      const firstError = Object.values(err?.response?.data?.errors ?? {})?.[0] as string[] | undefined;
      const message    = firstError?.[0] ?? err?.response?.data?.message ?? 'Registrasi gagal.';
      Alert.alert('Gagal', message);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Buat Akun Baru</Text>
        </View>

        <View style={styles.form}>
          <Field label="Nama Lengkap *" value={name} onChange={setName}
            placeholder="Nama kamu" autoComplete="name" />
          <Field label="Email *" value={email} onChange={setEmail}
            placeholder="kamu@email.com" keyboardType="email-address"
            autoCapitalize="none" autoComplete="email" />
          <Field label="Nomor HP" value={phone} onChange={setPhone}
            placeholder="08xx xxxx xxxx" keyboardType="phone-pad" />
          <Field label="Password *" value={password} onChange={setPassword}
            placeholder="Minimal 8 karakter" secureTextEntry autoComplete="new-password" />

          <Text style={styles.hint}>
            Dengan mendaftar, kamu menyetujui syarat & ketentuan MiniShop.
          </Text>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.registerBtnText}>Daftar</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace('/login' as any)}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, autoCapitalize, autoComplete, secureTextEntry }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any;
  autoCapitalize?: any; autoComplete?: any; secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoComplete={autoComplete}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { flexGrow: 1, padding: 24, paddingTop: 56 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 18, color: Colors.dark, lineHeight: 20 },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.dark },

  form:  { gap: 14 },
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
  hint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },

  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  registerBtnDisabled: { backgroundColor: Colors.grayMid, shadowOpacity: 0 },
  registerBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
