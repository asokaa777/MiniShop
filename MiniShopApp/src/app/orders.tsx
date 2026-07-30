import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import api from '../services/api';
import { Order } from '../types';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get<Order[]>('/orders/mine');
      setOrders(data);
    } catch {
      // handled silently — user sees empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return <Loading fullScreen message="Memuat pesanan..." />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Pesanan</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(order) => String(order.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="Belum ada pesanan"
            subtitle="Pesanan yang kamu buat akan muncul di sini."
          />
        }
        renderItem={({ item: order }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderTop}>
              <Text style={styles.orderNumber}>{order.order_number}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </Text>
            <Text style={styles.orderItems}>
              {order.items?.length ?? 0} item
            </Text>
            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>
                Rp {Number(order.total_price).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

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
  backText: { fontSize: 18, color: Colors.dark, lineHeight: 20 },
  title:    { fontSize: 17, fontWeight: '700', color: Colors.dark },

  list: { padding: 16, paddingBottom: 40 },

  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700', color: Colors.success, textTransform: 'capitalize' },
  orderDate:  { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  orderItems: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  orderBottom: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  orderTotal:  { fontSize: 16, fontWeight: '800', color: Colors.primary },
});
