import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Calendar, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingsAPI.get(id);
      setListing(res.data);
      if (res.data.host?.id) {
        const rev = await reviewsAPI.getForUser(res.data.host.id);
        setReviews(rev.data.slice(0, 5));
      }
    } catch {
      toast.error('Listing not found');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login', { state: { from: `/listings/${id}` } }); return; }
    setBooking(true);
    try {
      await bookingsAPI.create({ listingId: id, seats, specialRequests });
      toast.success('Booking requested! Check your dashboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!listing) return null;

  const date = listing.dinnerDate ? format(new Date(listing.dinnerDate), 'EEEE, MMMM d · h:mm a') : '';
  const total = (listing.pricePerSeat * seats).toLocaleString();

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="detail-layout">
          {/* Left: Images + Info */}
          <div className="detail-main">
            {/* Images */}
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

            {/* Title & host */}
            <div className="detail-info">
              <span className="badge badge-terracotta">{listing.cuisineType}</span>
              <h1 className="detail-title">{listing.title}</h1>

              <div className="detail-meta-row">
                <span className="detail-meta-item">
                  <Calendar size={15} /> {date}
                </span>
                <span className="detail-meta-item">
                  <MapPin size={15} /> {listing.neighborhood}, {listing.city}
                </span>
                <span className="detail-meta-item">
                  <Users size={15} /> {listing.availableSeats} seats available
                </span>
              </div>

              <p className="detail-description">{listing.description}</p>

              {/* Menu */}
              {listing.menuItems?.length > 0 && (
                <div className="detail-section">
                  <h2 className="detail-section-title">What's on the table</h2>
                  <ul className="menu-list">
                    {listing.menuItems.map((item, i) => (
                      <li key={i} className="menu-item">
                        <span className="menu-dot" />
                        {item}
                      </li>
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
                    {listing.host?.cookingStyle && <p className="host-style">{listing.host.cookingStyle}</p>}
                    {listing.host?.averageRating > 0 && (
                      <div className="host-rating">
                        <Star size={13} fill="currentColor" className="star" />
                        <span>{listing.host.averageRating}</span>
                        <span className="listing-reviews">({listing.host.totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div className="detail-section">
                  <h2 className="detail-section-title">Guest reviews</h2>
                  <div className="reviews-list">
                    {reviews.map(r => (
                      <div key={r.id} className="review-item">
                        <div className="review-header">
                          <span className="review-author">{r.reviewerName}</span>
                          <div className="review-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} className="star" />
                            ))}
                          </div>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking panel */}
          <div className="booking-panel">
            <div className="booking-price">
              <span className="booking-price-amount">₹{listing.pricePerSeat?.toLocaleString()}</span>
              <span className="booking-price-label"> / seat</span>
            </div>

            {listing.status === 'ACTIVE' && listing.availableSeats > 0 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Seats</label>
                  <select
                    className="form-input"
                    value={seats}
                    onChange={e => setSeats(Number(e.target.value))}
                  >
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
                  {booking ? <span className="spinner" style={{ width: 18, height: 18 }} /> : (listing.instantBook ? 'Book instantly' : 'Request to book')}
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
          </div>
        </div>
      </div>
    </div>
  );
}
