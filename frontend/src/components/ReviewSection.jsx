import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = "sm" }) {
  const num    = Number(rating) || 0;
  const filled = Math.round(num);
  const sz     = size === "lg" ? "fs-4" : "small";
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= filled ? "#FBBF24" : "#D1D5DB" }} className={sz}>
          ★
        </span>
      ))}
    </span>
  );
}

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex gap-1 align-items-center">
      {[1,2,3,4,5].map((i) => (
        <span
          key={i}
          role="button"
          style={{
            fontSize: "1.8rem",
            cursor: "pointer",
            color: i <= (hovered || value) ? "#FBBF24" : "#D1D5DB",
            transition: "color 0.1s",
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          ★
        </span>
      ))}
      {value > 0 && (
        <span className="text-muted small ms-1">{value}/5</span>
      )}
    </div>
  );
}

// ─── Rating summary bar ───────────────────────────────────────────────────────

function RatingSummary({ reviews }) {
  if (reviews.length === 0) return null;
  const avg  = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="d-flex gap-4 align-items-center p-3 rounded-3 mb-3"
         style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
      {/* Big number */}
      <div className="text-center" style={{ minWidth: 72 }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, color: "#0F172A" }}>
          {avg.toFixed(1)}
        </div>
        <StarDisplay rating={avg} size="sm" />
        <div className="text-muted small mt-1">{reviews.length} ulasan</div>
      </div>

      {/* Bar chart */}
      <div className="flex-grow-1">
        {dist.map(({ star, count }) => {
          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="d-flex align-items-center gap-2 mb-1">
              <span className="small text-muted" style={{ width: 28 }}>{star}★</span>
              <div className="flex-grow-1 rounded-pill overflow-hidden"
                   style={{ height: 6, backgroundColor: "#E2E8F0" }}>
                <div style={{ width: `${pct}%`, height: "100%",
                              backgroundColor: "#FBBF24", borderRadius: 999 }} />
              </div>
              <span className="small text-muted" style={{ width: 20 }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const initial = review.reviewer_name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="d-flex gap-3 py-3 border-bottom">
      {/* Avatar */}
      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
           style={{ width: 40, height: 40, backgroundColor: "#EEF2FF",
                    color: "#6366F1", fontWeight: 700, fontSize: "1rem" }}>
        {initial}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">{review.reviewer_name}</span>
          <span className="text-muted small">{date}</span>
        </div>
        <StarDisplay rating={review.rating} size="sm" />
        {review.comment && (
          <p className="mb-0 mt-1 text-secondary small">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

// ─── Write review form ────────────────────────────────────────────────────────

function WriteReviewForm({ productId, onSuccess }) {
  const [name,    setName]    = useState("");
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())  return alert("Masukkan nama kamu.");
    if (rating === 0)  return alert("Pilih rating bintang.");

    setLoading(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim(),
      });
      setName(""); setRating(0); setComment("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Gagal mengirim ulasan.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => setOpen(true)}
      >
        ✏️ Tulis Ulasan
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit}
          className="p-3 rounded-3 mb-3"
          style={{ border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary text-uppercase">
          Rating kamu
        </label>
        <StarSelector value={rating} onChange={setRating} />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary text-uppercase">
          Nama
        </label>
        <input
          className="form-control form-control-sm"
          placeholder="Nama kamu..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary text-uppercase">
          Komentar <span className="text-muted fw-normal">(opsional)</span>
        </label>
        <textarea
          className="form-control form-control-sm"
          rows={3}
          placeholder="Ceritakan pengalamanmu..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <div className="text-end text-muted" style={{ fontSize: "0.75rem" }}>
          {comment.length}/500
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Ulasan"}
        </button>
        <button type="button" className="btn btn-light btn-sm"
                onClick={() => setOpen(false)}>
          Batal
        </button>
      </div>
    </form>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function ReviewSection({ productId, onRatingChange }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      setReviews(res.data);
      if (onRatingChange && res.data.length > 0) {
        const avg = res.data.reduce((s, r) => s + r.rating, 0) / res.data.length;
        onRatingChange(avg, res.data.length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <div>
      {/* Section header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">
          Ulasan Pembeli
          {reviews.length > 0 && (
            <span className="text-muted fw-normal ms-1">({reviews.length})</span>
          )}
        </h6>
        <WriteReviewForm productId={productId} onSuccess={fetchReviews} />
      </div>

      {/* Rating summary */}
      <RatingSummary reviews={reviews} />

      {/* Reviews */}
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <div style={{ fontSize: "2rem" }}>💬</div>
          <p className="mb-0 small">Belum ada ulasan. Jadilah yang pertama!</p>
        </div>
      ) : (
        reviews.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </div>
  );
}
