import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Product, ProductVariant } from '../types';
import api from '../services/api';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

export type VariantForm = {
  id?: number;
  name: string;
  price: string;
  stock: string;
  sku: string;
};

export type FormData = {
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  stock: string;
  variants: VariantForm[];
};

const emptyForm: FormData = {
  name: '',
  price: '',
  description: '',
  image: '',
  category: '',
  stock: '',
  variants: [],
};

function ProductFormModal({
  visible,
  onClose,
  onSave,
  initial,
  saving,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initial?: FormData;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial ?? emptyForm);

  useEffect(() => {
    setForm(initial ?? emptyForm);
  }, [initial, visible]);

  const set = (key: keyof FormData, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { name: '', price: '', stock: '0', sku: '' }],
    }));
  };

  const updateVariant = (index: number, key: keyof VariantForm, val: string) => {
    setForm((f) => {
      const updated = [...f.variants];
      updated[index] = { ...updated[index], [key]: val };
      return { ...f, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

  const isEdit = !!initial?.name;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </Text>
          <TouchableOpacity
            style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
            onPress={() => onSave(form)}
            disabled={saving}
          >
            <Text style={styles.modalSaveText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          {form.image ? (
            <Image
              source={{ uri: form.image }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷 Preview Gambar</Text>
            </View>
          )}

          <Field label="Nama Produk *" value={form.name} onChangeText={(v) => set('name', v)} placeholder="Contoh: Kaos Polos" />
          <PriceField value={form.price} onChange={(v) => set('price', v)} />
          <Field label="Kategori *" value={form.category} onChangeText={(v) => set('category', v)} placeholder="Contoh: Pakaian" />
          <Field label="Stok Utama *" value={form.stock} onChangeText={(v) => set('stock', v)} placeholder="Contoh: 10" keyboardType="numeric" />
          <Field label="URL Gambar" value={form.image} onChangeText={(v) => set('image', v)} placeholder="https://..." />
          <Field label="Deskripsi" value={form.description} onChangeText={(v) => set('description', v)} placeholder="Deskripsi singkat produk..." multiline />

          {/* Variants section */}
          <View style={styles.variantHeaderRow}>
            <Text style={styles.fieldLabel}>VARIAN PRODUK (OPSIONAL)</Text>
            <TouchableOpacity style={styles.addVariantBtn} onPress={addVariant}>
              <Text style={styles.addVariantText}>+ Varian</Text>
            </TouchableOpacity>
          </View>

          {form.variants.map((variant, idx) => (
            <View key={idx} style={styles.variantBox}>
              <View style={styles.variantBoxHeader}>
                <Text style={styles.variantBoxTitle}>Varian #{idx + 1}</Text>
                <TouchableOpacity onPress={() => removeVariant(idx)}>
                  <Text style={styles.removeVariantText}>Hapus ✕</Text>
                </TouchableOpacity>
              </View>

              <Field
                label="Nama Varian *"
                value={variant.name}
                onChangeText={(v) => updateVariant(idx, 'name', v)}
                placeholder="Contoh: Hitam - M"
              />
              <Field
                label="Stok Varian *"
                value={variant.stock}
                onChangeText={(v) => updateVariant(idx, 'stock', v)}
                placeholder="10"
                keyboardType="numeric"
              />
              <Field
                label="Harga Varian (Bisa dikosongkan jika sama)"
                value={variant.price}
                onChangeText={(v) => updateVariant(idx, 'price', v)}
                placeholder="Contoh: 75000"
                keyboardType="numeric"
              />
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PriceField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const format = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('id-ID').replace(/,/g, '.');
  };

  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/[^\d]/g, '');
    onChange(digitsOnly);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Harga Utama (Rp) *</Text>
      <View style={styles.priceRow}>
        <View style={styles.pricePrefix}>
          <Text style={styles.pricePrefixText}>Rp</Text>
        </View>
        <TextInput
          style={styles.priceInput}
          value={format(value)}
          onChangeText={handleChange}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get<Product[]>('/products');
      setProducts(res.data);
    } catch {
      Alert.alert('Error', 'Gagal memuat produk.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleSave = async (form: FormData) => {
    if (!form.name.trim() || !form.price || !form.category.trim() || !form.stock) {
      Alert.alert('Validasi', 'Nama, harga, kategori, dan stok wajib diisi.');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      image: form.image.trim() || 'https://placehold.co/400x400?text=No+Image',
      category: form.category.trim(),
      stock: Number(form.stock),
      variants: form.variants.map((v) => ({
        name: v.name.trim(),
        price: v.price ? Number(v.price) : null,
        stock: Number(v.stock || 0),
        sku: v.sku.trim() || null,
      })),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        Alert.alert('Berhasil', 'Produk berhasil diupdate.');
      } else {
        await api.post('/products', payload);
        Alert.alert('Berhasil', 'Produk berhasil ditambahkan.');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan produk.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Hapus Produk',
      `Yakin ingin menghapus "${product.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/products/${product.id}`);
              fetchProducts();
            } catch {
              Alert.alert('Error', 'Gagal menghapus produk.');
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loading fullScreen message="Memuat data admin..." />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛠 Admin</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {products.length} produk · {products.filter((p) => p.stock === 0).length} habis · {products.filter((p) => p.stock > 0 && p.stock <= 5).length} hampir habis
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="📦" title="Belum ada produk" subtitle="Tap '+ Tambah' untuk menambahkan produk pertama." />
        }
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              defaultSource={{ uri: 'https://placehold.co/60x60?text=...' }}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
              <Text style={styles.productPrice}>
                Rp {Number(item.price).toLocaleString('id-ID')}
              </Text>
              <View style={styles.stockRow}>
                <View style={[
                  styles.stockBadge,
                  item.stock === 0 ? styles.stockBadgeDanger
                    : item.stock <= 5 ? styles.stockBadgeWarning
                    : styles.stockBadgeSuccess,
                ]}>
                  <Text style={styles.stockBadgeText}>
                    Stok: {item.stock} {item.variants && item.variants.length > 0 ? `(${item.variants.length} varian)` : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEdit(item)}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ProductFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
        initial={
          editingProduct
            ? {
                name: editingProduct.name,
                price: String(editingProduct.price),
                description: editingProduct.description ?? '',
                image: editingProduct.image ?? '',
                category: editingProduct.category,
                stock: String(editingProduct.stock),
                variants: (editingProduct.variants ?? []).map((v) => ({
                  id: v.id,
                  name: v.name,
                  price: v.price ? String(v.price) : '',
                  stock: String(v.stock),
                  sku: v.sku ?? '',
                })),
              }
            : undefined
        }
      />
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.dark },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.grayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsText: { fontSize: 12, color: Colors.textSecondary },

  list: { padding: 16, paddingBottom: 40 },

  productRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
  },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  productCategory: { fontSize: 12, color: Colors.textMuted },
  productPrice: { fontSize: 13, fontWeight: '700', color: Colors.success, marginTop: 2 },
  stockRow: { flexDirection: 'row', marginTop: 4 },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stockBadgeDanger: { backgroundColor: Colors.dangerLight },
  stockBadgeWarning: { backgroundColor: Colors.warningLight },
  stockBadgeSuccess: { backgroundColor: Colors.successLight },
  stockBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.dark },

  actions: { gap: 6 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: Colors.dark },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.dark },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSaveBtnDisabled: { backgroundColor: Colors.border },
  modalSaveText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  modalBody: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: Colors.grayLight,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: { fontSize: 14, color: Colors.textMuted },

  fieldContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.dark,
  },
  fieldInputMulti: { height: 90, paddingTop: 10 },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  pricePrefix: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.grayLight,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
  },
  pricePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.dark,
  },

  variantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  addVariantBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addVariantText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  variantBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
  },
  removeVariantText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
});
