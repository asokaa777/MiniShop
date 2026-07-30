import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Review } from '../types';
import api from '../services/api';

// ─── Star selector ────────────────────────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={ss.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <Text style={[ss.star, i <= value ? ss.filled : ss.empty]}>★</Text>
        </TouchableOpacity>
      ))}
      <Text style={ss.label}>{value > 0 ? `${value}/5` : 'Pilih bintang'}</Text>
    </View>
  );
}

const ss = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star:   { fontSize: 32 },
  filled: { color: Colors.star },
  empty:  { color: Colors.starEmpty },
  label:  { fontSize: 14, color: Colors.textSecondary, marginLeft: 6 },
});

// ─── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating ? '★' : '☆');
  const date  = new Date(review.created_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View style={rc.card}>
      <View style={rc.header}>
        <View style={rc.avatar}>
          <Text style={rc.avatarText}>{review.reviewer_name[0].toUpperCase()}</Text>
        </View>
        <View style={rc.meta}>
          <Text style={rc.name}>{review.reviewer_name}</Text>
          <Text style={rc.date}>{date}</Text>
        </View>
        <Text style={rc.stars}>
          {stars.map((s, i) => (
            <Text key={i} style={{ color: i < review.rating ? Colors.star : Colors.starEmpty }}>{s}</Text>
          ))}
        </Text>
      </View>
      {!!review.comment && <Text style={rc.comment}>{review.comment}</Text>}
    </View>
  );
}

const rc = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  meta: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  date: { fontSize: 12, color: Colors.textMuted },
  stars: { fontSize: 14 },
  comment: { fontSize: 14, color: Colors.text, lineHeight: 21, marginTop: 4 },
});

// ─── Rating summary bar ───────────────────────────────────────────────────────
function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <View style={rs.container}>
      {/* Big number */}
      <View style={rs.avgBlock}>
        <Text style={rs.avgNum}>{avg.toFixed(1)}</Text>
        <Text style={rs.avgStars}>{'★'.repeat(Math.round(avg))}</Text>
        <Text style={rs.avgCount}>{reviews.length} ulasan</Text>
      </View>

      {/* Bar chart */}
      <View style={rs.bars}>
        {dist.map(({ star, count }) => {
          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <View key={star} style={rs.barRow}>
              <Text style={rs.barLabel}>{star}★</Text>
              <View style={rs.barTrack}>
                <View style={[rs.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={rs.barCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const rs = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avgBlock: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  avgNum:   { fontSize: 36, fontWeight: '800', color: Colors.dark },
  avgStars: { fontSize: 16, color: Colors.star, letterSpacing: 2 },
  avgCount: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bars:     { flex: 1, justifyContent: 'space-between' },
  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { fontSize: 11, color: Colors.textSecondary, width: 24 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.grayLight, overflow: 'hidden' },
  barFill:  { height: '100%', backgroundColor: Colors.star, borderRadius: 3 },
  barCount: { fontSize: 11, color: Colors.textMuted, width: 20, textAlign: 'right' },
});

// ─── Write review modal ───────────────────────────────────────────────────────
function WriteReviewModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, rating: number, comment: string) => Promise<void>;
}) {
  const [name,    setName]    = useState('');
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setName(''); setRating(0); setComment(''); };

  const handleSubmit = async () => {
    if (!name.trim())   return Alert.alert('Perlu nama', 'Masukkan nama kamu.');
    if (rating === 0)   return Alert.alert('Perlu bintang', 'Pilih rating bintang.');

    setLoading(true);
    try {
      await onSubmit(name.trim(), rating, comment.trim());
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={wr.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={wr.header}>
          <TouchableOpacity onPress={onClose} style={wr.closeBtn}>
            <Text style={wr.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={wr.title}>Tulis Ulasan</Text>
          <TouchableOpacity
            style={[wr.submitBtn, (loading || rating === 0) && wr.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading || rating === 0}
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={wr.submitText}>Kirim</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={wr.body}>
          {/* Star rating */}
          <Text style={wr.label}>Rating kamu</Text>
          <StarSelector value={rating} onChange={setRating} />

          {/* Name */}
          <Text style={[wr.label, { marginTop: 20 }]}>Nama</Text>
          <TextInput
            style={wr.input}
            value={name}
            onChangeText={setName}
            placeholder="Nama kamu..."
            placeholderTextColor={Colors.textMuted}
            maxLength={60}
          />

          {/* Comment */}
          <Text style={[wr.label, { marginTop: 16 }]}>Komentar <Text style={wr.optional}>(opsional)</Text></Text>
          <TextInput
            style={[wr.input, wr.inputMulti]}
            value={comment}
            onChangeText={setComment}
            placeholder="Ceritakan pengalamanmu dengan produk ini..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={wr.charCount}>{comment.length}/500</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const wr = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: Colors.dark },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.dark },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    minWidth: 60, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.grayMid },
  submitText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  body: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontWeight: '400', textTransform: 'none', fontSize: 12 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: Colors.dark,
  },
  inputMulti: { height: 110, paddingTop: 11 },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
});

// ─── Main exported component ──────────────────────────────────────────────────
interface ReviewSectionProps {
  productId: number;
  onRatingChange?: (avg: number, count: number) => void;
}

export function ReviewSection({ productId, onRatingChange }: ReviewSectionProps) {
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get<Review[]>(`/products/${productId}/reviews`);
      setReviews(res.data);
      if (onRatingChange && res.data.length > 0) {
        const avg = res.data.reduce((s, r) => s + r.rating, 0) / res.data.length;
        onRatingChange(avg, res.data.length);
      }
    } catch {
      // silent — reviews are non-critical
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (name: string, rating: number, comment: string) => {
    await api.post(`/products/${productId}/reviews`, {
      reviewer_name: name,
      rating,
      comment,
    });
    await fetchReviews();
  };

  return (
    <View>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Ulasan Pembeli
          {reviews.length > 0 && (
            <Text style={styles.sectionCount}> ({reviews.length})</Text>
          )}
        </Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.writeBtnText}>✏️  Tulis Ulasan</Text>
        </TouchableOpacity>
      </View>

      {/* Rating summary */}
      {reviews.length > 0 && <RatingSummary reviews={reviews} />}

      {/* Reviews list */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>Belum ada ulasan. Jadilah yang pertama!</Text>
        </View>
      ) : (
        reviews.map((r) => <ReviewCard key={r.id} review={r} />)
      )}

      {/* Write review modal */}
      <WriteReviewModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
  },
  sectionCount: {
    fontWeight: '400',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  writeBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  writeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
