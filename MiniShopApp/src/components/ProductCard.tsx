import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRow({ rating, count }: { rating: number; count: number }) {
  const num    = Number(rating) || 0;   // guard: Laravel may return string
  const filled = Math.round(num);
  return (
    <View style={starStyles.row}>
      <View style={starStyles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[starStyles.star, i <= filled ? starStyles.starFilled : starStyles.starEmpty]}>
            ★
          </Text>
        ))}
      </View>
      <Text style={starStyles.count}>
        {num.toFixed(1)} <Text style={starStyles.countNum}>({count})</Text>
      </Text>
    </View>
  );
}

/** Decide which badge to show based on product data */
function getSmartBadge(product: Product): { label: string; bg: string; color: string } | null {
  if (product.stock === 0) return null; // out-of-stock badge handled separately

  const count = product.reviews_count ?? 0;
  const avg   = Number(product.reviews_avg_rating ?? 0);
  const createdAt = product.created_at ? new Date(product.created_at) : null;
  const daysOld = createdAt
    ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  if (count >= 10 && avg >= 4.5) {
    return { label: '🔥 Best Seller', bg: Colors.badgeBestSeller, color: Colors.badgeBestSellerText };
  }
  if (daysOld <= 14) {
    return { label: '✨ New', bg: Colors.badgeNew, color: Colors.badgeNewText };
  }
  if (count >= 5 && avg >= 4.0) {
    return { label: '⭐ Popular', bg: Colors.accentLight, color: Colors.accent };
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const hasRating  = (product.reviews_count ?? 0) > 0;
  const avgRating  = Number(product.reviews_avg_rating ?? 0);  // guard: may be string from API
  const badge      = getSmartBadge(product);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.93}>
      {/* Image */}
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        defaultSource={{ uri: 'https://placehold.co/200x200?text=...' }}
      />

      {/* Out of stock overlay */}
      {outOfStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Habis</Text>
        </View>
      )}

      {/* Smart badge (Best Seller / New / Popular) */}
      {badge && !outOfStock && (
        <View style={[styles.smartBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.smartBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      )}

      {/* Category badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText} numberOfLines={1}>{product.category}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Rating row */}
        {hasRating ? (
          <StarRow rating={avgRating} count={product.reviews_count!} />
        ) : (
          <Text style={styles.noReview}>Belum ada ulasan</Text>
        )}

        <Text style={styles.price}>
          Rp {Number(product.price).toLocaleString('id-ID')}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.stock, outOfStock && styles.stockEmpty]}>
            {outOfStock ? 'Stok habis' : `Stok: ${product.stock}`}
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
            onPress={outOfStock ? undefined : onAddToCart}
            disabled={outOfStock}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>{outOfStock ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const starStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 },
  stars: { flexDirection: 'row' },
  star:  { fontSize: 11 },
  starFilled: { color: Colors.star },
  starEmpty:  { color: Colors.starEmpty },
  count:      { fontSize: 11, color: Colors.textSecondary },
  countNum:   { color: Colors.textMuted },
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.grayLight,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  outOfStockText: { color: Colors.white, fontSize: 11, fontWeight: '700' },

  smartBadge: {
    position: 'absolute',
    top: 108, // just above the image bottom edge
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smartBadgeText: { fontSize: 10, fontWeight: '700' },

  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: CARD_WIDTH - 60,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  categoryText: { color: Colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  body:  { padding: 10, gap: 3 },
  name:  { fontSize: 13, fontWeight: '600', color: Colors.dark, lineHeight: 18 },
  noReview: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginVertical: 2 },
  price: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginTop: 2 },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  stock:      { fontSize: 11, color: Colors.textSecondary },
  stockEmpty: { color: Colors.danger },

  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.grayMid },
  addBtnText: { color: Colors.white, fontSize: 18, lineHeight: 20, fontWeight: '700' },
});
