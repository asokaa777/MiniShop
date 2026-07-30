import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Order } from '../types';

export default function SuccessScreen() {
  const { order: orderJson } = useLocalSearchParams<{ order: string }>();
  const router = useRouter();

  const order: Order | null = useMemo(() => {
    try {
      return orderJson ? JSON.parse(orderJson) : null;
    } catch {
      return null;
    }
  }, [orderJson]);

  // Success page has no refetchable data; PTR just gives a familiar UX gesture
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Data order tidak ditemukan.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')}>
          <Text style={styles.btnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Success hero */}
        <View style={styles.hero}>
          <Text style={styles.checkmark}>✅</Text>
          <Text style={styles.heroTitle}>Order Berhasil!</Text>
          <Text style={styles.heroSubtitle}>
            Terima kasih sudah berbelanja di MiniShop
          </Text>
        </View>

        {/* Order info card */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <Text style={styles.cardTitle}>Ringkasan Order</Text>
            <View style={styles.orderNumberBadge}>
              <Text style={styles.orderNumber}>{order.order_number}</Text>
            </View>
          </View>

          <Text style={styles.orderDate}>
            📅{' '}
            {new Date(order.created_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          <View style={styles.divider} />

          {/* Items */}
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name ?? `Produk #${item.product_id}`}
                </Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
              <Text style={styles.itemSubtotal}>
                Rp {Number(item.subtotal).toLocaleString('id-ID')}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>
              Rp {Number(order.total_price).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Status Order</Text>
            <Text style={styles.statusValue}>
              {order.status === 'pending' ? 'Menunggu Konfirmasi' : order.status}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.status?.toUpperCase() ?? 'PENDING'}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>🛍  Lanjut Belanja</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { fontSize: 16, color: Colors.textSecondary, marginBottom: 20 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  checkmark: { fontSize: 72, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  orderNumberBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orderNumber: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  orderDate: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, color: Colors.dark, fontWeight: '500', lineHeight: 19 },
  itemQty: { fontSize: 12, color: Colors.textMuted },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: Colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  totalValue: { fontSize: 20, fontWeight: '800', color: Colors.success },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIcon: { fontSize: 28 },
  statusTitle: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  statusValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  homeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  homeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  btnText: { color: Colors.white, fontWeight: '600' },
});
