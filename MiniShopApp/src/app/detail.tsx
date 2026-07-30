import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Product, ProductVariant } from '../types';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Loading } from '../components/Loading';
import { ReviewSection } from '../components/ReviewSection';

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  const num = Number(rating) || 0;
  const filled = Math.round(num);
  return (
    <View style={sd.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[sd.star, i <= filled ? sd.filled : sd.empty]}>★</Text>
      ))}
      <Text style={sd.label}>{num.toFixed(1)}</Text>
      <Text style={sd.count}>({count} ulasan)</Text>
    </View>
  );
}

const sd = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  star: { fontSize: 16 },
  filled: { color: Colors.star },
  empty: { color: Colors.starEmpty },
  label: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginLeft: 4 },
  count: { fontSize: 13, color: Colors.textSecondary },
});

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qty, setQty] = useState(1);
  const [liveAvg, setLiveAvg] = useState<number | null>(null);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  const fetchProduct = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get<Product>(`/products/${id}`);
      setProduct(res.data);
      if (res.data.variants && res.data.variants.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      }
    } catch {
      Alert.alert('Error', 'Gagal memuat detail produk.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  if (loading || !product) return <Loading fullScreen message="Memuat detail..." />;

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const inCart = cart.find(
    (i) => i.product.id === product.id && i.variant?.id === selectedVariant?.id
  )?.qty ?? 0;

  const maxQty = currentStock - inCart;
  const outOfStock = currentStock === 0;

  const displayAvg = Number(liveAvg ?? product.reviews_avg_rating ?? 0);
  const displayCnt = liveCount ?? product.reviews_count ?? 0;

  const handleAddToCart = () => {
    if (outOfStock) {
      Alert.alert('Stok Habis', 'Varian ini sudah habis.');
      return;
    }
    if (qty > maxQty) {
      Alert.alert('Stok Tidak Cukup', `Kamu sudah punya ${inCart} di keranjang. Sisa stok: ${maxQty}.`);
      return;
    }
    addToCart(product, selectedVariant ?? undefined, qty);
    Alert.alert(
      '✓ Berhasil',
      `${qty}x ${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''} ditambahkan ke keranjang.`,
      [
        { text: 'Lanjut Belanja', onPress: () => router.back() },
        { text: 'Ke Keranjang', onPress: () => router.push('/cart' as any) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProduct(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          {outOfStock && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>STOK HABIS</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <Text style={[styles.stockText, outOfStock && styles.stockEmpty]}>
              {outOfStock ? '✕ Habis' : `✓ Stok: ${currentStock}`}
            </Text>
          </View>

          <Text style={styles.name}>{product.name}</Text>

          {displayCnt > 0 && (
            <StarDisplay rating={displayAvg} count={displayCnt} />
          )}

          <Text style={styles.price}>
            Rp {Number(currentPrice).toLocaleString('id-ID')}
          </Text>

          {/* Variants section */}
          {product.variants && product.variants.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>PILIH VARIAN</Text>
              <View style={styles.variantContainer}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variantChip,
                        isSelected && styles.variantChipSelected,
                        v.stock === 0 && styles.variantChipDisabled,
                      ]}
                      onPress={() => {
                        setSelectedVariant(v);
                        setQty(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.variantChipText,
                          isSelected && styles.variantChipTextSelected,
                          v.stock === 0 && styles.variantChipTextDisabled,
                        ]}
                      >
                        {v.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DESKRIPSI PRODUK</Text>
          <Text style={styles.description}>{product.description}</Text>

          {!outOfStock && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>JUMLAH</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty >= maxQty && styles.qtyBtnDisabled]}
                  onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.qtyHint}>
                  {inCart > 0 ? `(${inCart} di keranjang)` : `Maks ${currentStock}`}
                </Text>
              </View>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  Rp {(currentPrice * qty).toLocaleString('id-ID')}
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />
          <ReviewSection
            productId={product.id}
            onRatingChange={(avg, count) => {
              setLiveAvg(avg);
              setLiveCount(count);
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={outOfStock}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>
            {outOfStock ? 'Stok Habis' : '🛒  Tambah ke Keranjang'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { position: 'relative', height: 300 },
  image: { width: '100%', height: 300, backgroundColor: Colors.grayLight },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: Colors.white, fontSize: 20, lineHeight: 22 },
  soldOutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  soldOutText: { color: Colors.white, fontSize: 24, fontWeight: '800', letterSpacing: 2 },

  content: { padding: 20, paddingBottom: 120 },

  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  categoryText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  stockText: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  stockEmpty: { color: Colors.danger },

  name: { fontSize: 22, fontWeight: '700', color: Colors.dark, lineHeight: 30, marginBottom: 6 },
  price: { fontSize: 24, fontWeight: '800', color: Colors.primary, marginBottom: 4 },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  description: { fontSize: 15, color: Colors.text, lineHeight: 24 },

  variantContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  variantChipSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryLight,
  },
  variantChipDisabled: {
    borderColor: Colors.border, backgroundColor: Colors.grayLight, opacity: 0.5,
  },
  variantChipText: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  variantChipTextSelected: { color: Colors.primary },
  variantChipTextDisabled: { color: Colors.textMuted, textDecorationLine: 'line-through' },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: Colors.grayLight },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: Colors.primary, lineHeight: 22 },
  qtyValue: { fontSize: 20, fontWeight: '700', color: Colors.dark, minWidth: 28, textAlign: 'center' },
  qtyHint: { fontSize: 13, color: Colors.textMuted, flex: 1 },
  subtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, backgroundColor: Colors.successLight, padding: 14, borderRadius: 12,
  },
  subtotalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '500' },
  subtotalValue: { fontSize: 18, fontWeight: '700', color: Colors.success },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.grayMid },
  addBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
