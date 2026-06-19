import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './ListingDetail.css';

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={readOnly ? 13 : 24}
          fill={(hovered || value) >= i ? 'currentColor' : 'none'}
          className="star"
          style={{ cursor: readOnly ? 'default' : 'pointer', color: 'var(--terracotta)' }}
          onClick={() => !readOnly && onChange && onChange(i)}
          onMouseEnter={() => !readOnly && setHovered(i)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        />
      ))}
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myBooking, setMyBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const res = await listingsAPI.get(id);
      setListing(res.data);

      if (res.data.host?.id) {
        const rev = await reviewsAPI.getForUser(res.data.host.id);
        setReviews(rev.data || []);
      }

      if (user) {
        try {
          const bookRes = await bookingsAPI.getMine();
          const found = (bookRes.data || []).find(
            b => String(b.listingId) === String(id) &&
              (b.status === 'COMPLETED' || b.status === 'CONFIRMED')
          );
          setMyBooking(found || null);
        } catch { /* not logged in */ }
      }
    } catch {
      toast.error('Listing not found');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const refreshReviews = async () => {
    if (listing?.host?.id) {
      const rev = await reviewsAPI.getForUser(listing.host.id);
      setReviews(rev.data || []);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login', { state: { from: `/listings/${id}` } }); return; }
    setBooking(true);
    try {
      const res = await bookingsAPI.create({ listingId: id, seats, specialRequests });
      const msg = res.data?.paymentMessage || (listing.instantBook ? 'Booking confirmed!' : 'Booking requested!');
      toast.success(msg, { duration: 6000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        bookingId: myBooking.id,
        rating: reviewRating,
        comment: reviewComment,
        type: 'HOST_REVIEW',
      });
      toast.success('Review submitted! Thank you.');
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      setMyBooking(null); // hide form after submit
      await refreshReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!listing) return null;

  const date = listing.dinnerDate ? format(new Date(listing.dinnerDate), 'EEEE, MMMM d · h:mm a') : '';
  const total = (listing.pricePerSeat * seats).toLocaleString();
  const alreadyReviewed = reviews.some(r => r.reviewerName === user?.fullName);

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="detail-layout">
          {/* ── Left ── */}
          <div className="detail-main">
            <div className="detail-gallery">
              <img
                src={listing.photoUrls?.[activeImg] || 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80'}
                alt={listing.title}
                className="detail-main-img"
              />
              {listing.photoUrls?.length > 1 && (
                <div className="detail-thumbs">
                  {listing.photoUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className={`detail-thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)} />
                  ))}
                </div>
              )}
            </div>

            <div className="detail-info">
              <span className="badge badge-terracotta">{listing.cuisineType}</span>
              <h1 className="detail-title">{listing.title}</h1>

              <div className="detail-meta-row">
                <span className="detail-meta-item"><Calendar size={15} /> {date}</span>
                <span className="detail-meta-item"><MapPin size={15} /> {listing.neighborhood}, {listing.city}</span>
                <span className="detail-meta-item"><Users size={15} /> {listing.availableSeats} seats available</span>
              </div>

              <p className="detail-description">{listing.description}</p>

              {listing.menuItems?.length > 0 && (
                <div className="detail-section">
                  <h2 className="detail-section-title">What's on the table</h2>
                  <ul className="menu-list">
                    {listing.menuItems.map((item, i) => (
                      <li key={i} className="menu-item"><span className="menu-dot" />{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Host */}
              <div className="detail-section">
                <h2 className="detail-section-title">Your host</h2>
                <div className="host-card">
                  <div className="host-avatar">{listing.host?.fullName?.[0]?.toUpperCase()}</div>
                  <div className="host-info">
                    <h3 className="host-name">{listing.host?.fullName}</h3>
                    {listing.host?.averageRating > 0 && (
                      <div className="host-rating" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating value={Math.round(listing.host.averageRating)} readOnly />
                        <span style={{ fontSize: 13, color: 'var(--stone)' }}>
                          {listing.host.averageRating} ({listing.host.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews section */}
              <div className="detail-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 className="detail-section-title" style={{ margin: 0 }}>
                    Guest reviews {reviews.length > 0 && `(${reviews.length})`}
                  </h2>
                  {myBooking && !alreadyReviewed && (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 13, padding: '6px 14px' }}
                      onClick={() => setShowReviewForm(v => !v)}
                    >
                      {showReviewForm ? 'Cancel' : '+ Write a review'}
                    </button>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <div style={{
                    background: 'var(--cream)', borderRadius: 12, padding: 20,
                    marginBottom: 20, border: '1px solid var(--border)',
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--charcoal)' }}>
                      How was your experience?
                    </p>
                    <div style={{ marginBottom: 12 }}>
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <textarea
                      className="form-input"
                      placeholder="Share your experience with other guests..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      style={{ marginBottom: 12 }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewRating}
                    >
                      {submittingReview
                        ? <span className="spinner" style={{ width: 16, height: 16 }} />
                        : 'Submit review'}
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--stone)', fontSize: 14 }}>
                    No reviews yet.{myBooking && !alreadyReviewed ? ' Be the first to review!' : ''}
                  </p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map(r => (
                      <div key={r.id} className="review-item">
                        <div className="review-header">
                          <span className="review-author">{r.reviewerName}</span>
                          <StarRating value={r.rating} readOnly />
                        </div>
                        {r.comment && <p className="review-comment">{r.comment}</p>}
                        <p style={{ fontSize: 12, color: 'var(--stone)', marginTop: 4 }}>
                          {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Booking panel ── */}
          <div className="booking-panel">
            <div className="booking-price">
              <span className="booking-price-amount">₹{listing.pricePerSeat?.toLocaleString()}</span>
              <span className="booking-price-label"> / seat</span>
            </div>

            {listing.status === 'ACTIVE' && listing.availableSeats > 0 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Seats</label>
                  <select className="form-input" value={seats} onChange={e => setSeats(Number(e.target.value))}>
                    {[...Array(Math.min(listing.availableSeats, 6))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} seat{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Special requests (optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Dietary requirements, allergies..."
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="booking-total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                <button className="btn btn-primary booking-btn" onClick={handleBook} disabled={booking}>
                  {booking
                    ? <span className="spinner" style={{ width: 18, height: 18 }} />
                    : (listing.instantBook ? 'Book instantly' : 'Request to book')}
                </button>
                {!listing.instantBook && (
                  <p className="booking-note">The host will review and confirm your request.</p>
                )}
              </>
            ) : (
              <div className="booking-full">
                <p>This dinner is fully booked.</p>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/listings')}>
                  Browse other dinners
                </button>
              </div>
            )}

            {/* Confirmed/Completed booking notice */}
            {myBooking && (
              <div style={{
                marginTop: 16, padding: '12px 14px', background: '#f0f7f0',
                borderRadius: 10, fontSize: 13, color: '#2d6a2d',
                border: '1px solid #c3e0c3',
              }}>
                ✅ {myBooking.status === 'CONFIRMED' ? 'Your booking is confirmed!' : 'You attended this dinner.'}
                {listing.host?.phone && (
                  <p style={{ marginTop: 6, fontWeight: 600, color: '#1a4a1a' }}>
                    📞 Host contact: {listing.host.phone}
                  </p>
                )}
                {myBooking.status === 'COMPLETED' && !alreadyReviewed && (
                  <p style={{ marginTop: 4 }}>Leave a review above!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}