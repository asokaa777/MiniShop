import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
              router.replace('/login' as any);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  if (!user) return null;

  const avatarInitial = user.name[0].toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user.role === 'admin' ? '🛠 Admin' : '🛍 Customer'}
            </Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <InfoRow icon="✉️" label="Email" value={user.email} />
          {user.phone && <InfoRow icon="📱" label="Nomor HP" value={user.phone} />}
        </View>

        {/* Order history shortcut (customer only) */}
        {user.role === 'customer' && (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/orders' as any)}
          >
            <Text style={styles.menuIcon}>📦</Text>
            <Text style={styles.menuLabel}>Riwayat Pesanan</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Admin dashboard shortcut */}
        {user.role === 'admin' && (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/admin')}
          >
            <Text style={styles.menuIcon}>🛠</Text>
            <Text style={styles.menuLabel}>Dashboard Admin</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Keluar...' : '🚪 Keluar dari Akun'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  icon:  { fontSize: 20, width: 28 },
  label: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 15, color: Colors.dark, fontWeight: '500', marginTop: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backText:    { fontSize: 18, color: Colors.dark, lineHeight: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark },

  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatarImage: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: Colors.primary },
  userName:      { fontSize: 22, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  roleBadge: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  roleText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  infoCard: {
    backgroundColor: Colors.white, marginHorizontal: 16,
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: 12,
  },

  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
    gap: 12,
  },
  menuIcon:  { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.dark },
  menuArrow: { fontSize: 20, color: Colors.textMuted },

  logoutBtn: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 40,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
