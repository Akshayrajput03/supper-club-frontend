import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { Search, SlidersHorizontal, Star, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import './Listings.css';

const CUISINES = ['All', 'South Indian', 'Italian', 'Thai', 'Japanese', 'Mexican', 'Lebanese', 'French', 'Korean'];

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(params.get('city') || 'Chennai');
  const [cuisine, setCuisine] = useState(params.get('cuisine') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [city, cuisine, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.browse({
        city, cuisine: cuisine || undefined, page, size: 9
      });
      setListings(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      // show empty state
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setParams({ city, ...(cuisine ? { cuisine } : {}) });
  };

  return (
    <div className="listings-page">
      <div className="container">
        <div className="listings-header">
          <h1 className="section-title">Dinners in <em style={{ fontStyle: 'italic', color: 'var(--terracotta)' }}>{city}</em></h1>

          <form className="listings-search" onSubmit={handleSearch}>
            <div className="form-group" style={{ flex: 1 }}>
              <div className="search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="City or neighborhood"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {/* Cuisine filter */}
        <div className="cuisine-filter">
          {CUISINES.map(c => (
            <button
              key={c}
              className={`cuisine-chip ${(c === 'All' ? !cuisine : cuisine === c) ? 'active' : ''}`}
              onClick={() => { setCuisine(c === 'All' ? '' : c); setPage(0); }}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🍽️</p>
            <h3>No dinners found</h3>
            <p>Try a different city or cuisine — or be the first to host here!</p>
          </div>
        ) : (
          <>
            <div className="grid-3">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => navigate(`/listings/${l.id}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  Previous
                </button>
                <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing, onClick }) {
  const date = listing.dinnerDate
    ? format(new Date(listing.dinnerDate), 'EEE, MMM d · h:mm a')
    : '';

  return (
    <div className="card listing-card" onClick={onClick}>
      <div className="listing-img-wrap">
        {listing.photoUrls?.[0] ? (
          <img src={listing.photoUrls[0]} alt={listing.title} className="listing-img" />
        ) : (
          <div className="listing-img-placeholder">🍽️</div>
        )}
        <span className="listing-cuisine badge badge-terracotta">{listing.cuisineType}</span>
        {listing.availableSeats <= 2 && listing.availableSeats > 0 && (
          <span className="listing-urgent">Only {listing.availableSeats} left!</span>
        )}
      </div>
      <div className="listing-body">
        <p className="listing-date-text">{date}</p>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-host">
          by {listing.host?.fullName} ·
          <MapPin size={11} style={{ display: 'inline', margin: '0 2px' }} />
          {listing.neighborhood}
        </p>
        <div className="listing-footer">
          <div className="listing-rating">
            {listing.host?.averageRating > 0 && (
              <>
                <Star size={12} fill="currentColor" className="star" />
                <span>{listing.host.averageRating}</span>
                <span className="listing-reviews">({listing.host.totalReviews})</span>
              </>
            )}
          </div>
          <span className="listing-price">₹{listing.pricePerSeat?.toLocaleString()} / seat</span>
        </div>
      </div>
    </div>
  );
}
