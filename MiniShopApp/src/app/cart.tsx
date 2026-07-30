import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { CartItemRow } from '../components/CartItemRow';
import { EmptyState } from '../components/EmptyState';
import api from '../services/api';
import { Order, Product } from '../types';

export default function CartScreen() {
  const router = useRouter();
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (cart.length === 0) return;
    setRefreshing(true);
    try {
      const ids = Array.from(new Set(cart.map((i) => i.product.id)));
      const results = await Promise.all(
        ids.map((id) => api.get<Product>(`/products/${id}`).then((r) => r.data))
      );
      results.forEach((fresh) => {
        cart.forEach((item) => {
          if (item.product.id === fresh.id) {
            const currentStock = item.variant
              ? fresh.variants?.find((v) => v.id === item.variant?.id)?.stock ?? 0
              : fresh.stock;

            if (item.qty > currentStock) {
              if (currentStock === 0) {
                Alert.alert(
                  'Stok Habis',
                  `"${item.product.name}" ${item.variant ? `(${item.variant.name})` : ''} sudah habis dan dihapus dari keranjang.`
                );
                removeFromCart(item.product.id, item.variant?.id);
              } else {
                Alert.alert(
                  'Stok Berubah',
                  `"${item.product.name}" ${item.variant ? `(${item.variant.name})` : ''} stok tersisa ${currentStock}. Qty disesuaikan.`
                );
                updateQty(item.product.id, item.variant?.id, currentStock);
              }
            }
          }
        });
      });
    } catch {
      Alert.alert('Error', 'Gagal memperbarui data keranjang.');
    } finally {
      setRefreshing(false);
    }
  }, [cart, updateQty, removeFromCart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    Alert.alert(
      'Konfirmasi Checkout',
      `Total: Rp ${cartTotal.toLocaleString('id-ID')}\n\nLanjutkan checkout?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await api.post<{ message: string; order: Order }>('/orders', {
                items: cart.map((i) => ({
                  id: i.product.id,
                  variant_id: i.variant?.id,
                  qty: i.qty,
                })),
              });
              clearCart();
              router.replace({
                pathname: '/success',
                params: { order: JSON.stringify(res.data.order) },
              });
            } catch (err: any) {
              const msg =
                err?.response?.data?.errors?.stock?.[0] ||
                err?.response?.data?.message ||
                'Checkout gagal. Coba lagi.';
              Alert.alert('Gagal', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Keranjang</Text>
        {cart.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Kosongkan Keranjang', 'Yakin ingin menghapus semua item?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus Semua', style: 'destructive', onPress: clearCart },
              ])
            }
          >
            <Text style={styles.clearText}>Hapus Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <EmptyState
            icon="🛍"
            title="Keranjang Kosong"
            subtitle="Tarik ke bawah untuk refresh, atau tambahkan produk dulu."
          />
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => `${item.product.id}_${item.variant?.id ?? 0}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            renderItem={({ item }) => (
              <CartItemRow
                item={item}
                onIncrease={() => updateQty(item.product.id, item.variant?.id, item.qty + 1)}
                onDecrease={() =>
                  item.qty <= 1
                    ? Alert.alert('Hapus Item', `Hapus ${item.product.name} dari keranjang?`, [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Hapus', style: 'destructive', onPress: () => removeFromCart(item.product.id, item.variant?.id) },
                      ])
                    : updateQty(item.product.id, item.variant?.id, item.qty - 1)
                }
                onRemove={() =>
                  Alert.alert('Hapus Item', `Hapus ${item.product.name} dari keranjang?`, [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Hapus', style: 'destructive', onPress: () => removeFromCart(item.product.id, item.variant?.id) },
                  ])
                }
              />
            )}
            ListFooterComponent={
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Ringkasan Belanja</Text>
                {cart.map((item) => {
                  const itemPrice = item.variant?.price ?? item.product.price;
                  return (
                    <View key={`${item.product.id}_${item.variant?.id ?? 0}`} style={styles.summaryRow}>
                      <Text style={styles.summaryItem} numberOfLines={1}>
                        {item.product.name} {item.variant ? `(${item.variant.name})` : ''} ×{item.qty}
                      </Text>
                      <Text style={styles.summaryPrice}>
                        Rp {(itemPrice * item.qty).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            }
          />

          <View style={styles.bottomBar}>
            <View style={styles.totalMini}>
              <Text style={styles.totalMiniLabel}>Total</Text>
              <Text style={styles.totalMiniValue}>
                Rp {cartTotal.toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>
                {loading ? 'Memproses...' : 'Checkout →'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, color: Colors.dark, lineHeight: 20 },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.dark },
  clearText: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  list: { padding: 16, paddingBottom: 180 },
  emptyScroll: { flex: 1 },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryItem: { flex: 1, fontSize: 13, color: Colors.textSecondary, marginRight: 8 },
  summaryPrice: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.success },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalMini: { flex: 1 },
  totalMiniLabel: { fontSize: 12, color: Colors.textSecondary },
  totalMiniValue: { fontSize: 17, fontWeight: '800', color: Colors.dark },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: { backgroundColor: Colors.border },
  checkoutText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
