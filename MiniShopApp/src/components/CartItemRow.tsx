import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { CartItem } from '../types';

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: CartItemRowProps) {
  const itemPrice = item.variant?.price ?? item.product.price;
  const itemStock = item.variant ? item.variant.stock : item.product.stock;
  const subtotal = itemPrice * item.qty;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
        {item.variant && (
          <View style={styles.variantBadge}>
            <Text style={styles.variantText}>Varian: {item.variant.name}</Text>
          </View>
        )}
        <Text style={styles.price}>
          Rp {Number(itemPrice).toLocaleString('id-ID')}
        </Text>

        <View style={styles.qtyRow}>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={[styles.qtyBtn, item.qty <= 1 && styles.qtyBtnDisabled]}
              onPress={onDecrease}
              disabled={item.qty <= 1}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{item.qty}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, item.qty >= itemStock && styles.qtyBtnDisabled]}
              onPress={onIncrease}
              disabled={item.qty >= itemStock}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>
            Rp {Number(subtotal).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    lineHeight: 19,
  },
  variantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  variantText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  price: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: Colors.grayLight,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 18,
  },
  qty: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
  },
});
