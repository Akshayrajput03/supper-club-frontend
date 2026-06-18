import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Shield, ChefHat, ArrowRight } from 'lucide-react';
import './Home.css';

const CUISINES = ['South Indian', 'Italian', 'Thai', 'Japanese', 'Mexican', 'Lebanese', 'French', 'Korean'];

const FEATURED = [
  {
    id: 1,
    title: 'A Tamil Feast: Chettinad Night',
    host: 'Meena Krishnamurthy',
    rating: 4.9,
    reviews: 34,
    price: 850,
    seats: 3,
    neighborhood: 'Adyar',
    cuisine: 'South Indian',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80',
    date: 'Sat, Jun 21',
  },
  {
    id: 2,
    title: 'Homemade Pasta & Slow Wine',
    host: 'Rahul D\'Souza',
    rating: 5.0,
    reviews: 18,
    price: 1200,
    seats: 6,
    neighborhood: 'Nungambakkam',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
    date: 'Fri, Jun 27',
  },
  {
    id: 3,
    title: 'Sunday Thai Family Spread',
    host: 'Priya Nair',
    rating: 4.8,
    reviews: 27,
    price: 950,
    seats: 2,
    neighborhood: 'Velachery',
    cuisine: 'Thai',
    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80',
    date: 'Sun, Jun 22',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('Chennai');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <p className="hero-eyebrow">Neighborhood Supper Club</p>
          <h1 className="hero-headline">
            Dinner at a<br />
            <em>neighbor's table</em>
          </h1>
          <p className="hero-sub">
            Home cooks host intimate dinners. You show up, eat well, and leave with new friends.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-field">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Your city or neighborhood"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary search-btn">
              Find Dinners <ArrowRight size={15} />
            </button>
          </form>

          <div className="hero-cuisines">
            {CUISINES.map(c => (
              <button key={c} className="cuisine-chip"
                onClick={() => navigate(`/listings?city=${encodeURIComponent(city)}&cuisine=${encodeURIComponent(c)}`)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title how-title">How it works</h2>
          <div className="how-steps">
            {[
              { step: '01', title: 'Browse dinners', desc: 'Find home-cooked dinners in your neighborhood, sorted by cuisine and date.' },
              { step: '02', title: 'Book a seat', desc: 'Reserve your spot and pay securely. Exact address is shared after booking.' },
              { step: '03', title: 'Show up & eat', desc: 'Arrive, meet the host, and enjoy a meal that no restaurant could replicate.' },
            ].map(s => (
              <div key={s.step} className="how-step">
                <span className="how-number">{s.step}</span>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header">
            <h2 className="section-title">Upcoming dinners in Chennai</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/listings?city=Chennai')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid-3">
            {FEATURED.map(l => (
              <div key={l.id} className="card listing-card" onClick={() => navigate(`/listings/${l.id}`)}>
                <div className="listing-img-wrap">
                  <img src={l.image} alt={l.title} className="listing-img" />
                  <span className="listing-cuisine badge badge-terracotta">{l.cuisine}</span>
                </div>
                <div className="listing-body">
                  <div className="listing-meta">
                    <span className="listing-date">{l.date}</span>
                    <span className="listing-seats">{l.seats} seats left</span>
                  </div>
                  <h3 className="listing-title">{l.title}</h3>
                  <p className="listing-host">by {l.host} · {l.neighborhood}</p>
                  <div className="listing-footer">
                    <div className="listing-rating">
                      <Star size={13} fill="currentColor" className="star" />
                      <span>{l.rating}</span>
                      <span className="listing-reviews">({l.reviews})</span>
                    </div>
                    <span className="listing-price">₹{l.price.toLocaleString()} / seat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="host-cta">
        <div className="container host-cta-inner">
          <ChefHat size={40} className="host-cta-icon" />
          <div>
            <h2 className="host-cta-title">Cook for your neighborhood</h2>
            <p className="host-cta-sub">Share the food you love and earn on your own schedule. We handle payments.</p>
          </div>
          <button className="btn btn-primary host-cta-btn" onClick={() => navigate('/register')}>
            Start hosting
          </button>
        </div>
      </section>

      {/* Trust */}
      <section className="trust-section">
        <div className="container trust-inner">
          {[
            { icon: <Shield size={22} />, title: 'Secure payments', desc: 'Stripe handles every transaction. Hosts get paid after the dinner.' },
            { icon: <Star size={22} />, title: 'Verified reviews', desc: 'Only guests who attended can review. Hosts review guests too.' },
            { icon: <ChefHat size={22} />, title: 'Real home cooks', desc: 'Every host has a profile, bio, and visible history of dinners.' },
          ].map(t => (
            <div key={t.title} className="trust-item">
              <div className="trust-icon">{t.icon}</div>
              <h3 className="trust-title">{t.title}</h3>
              <p className="trust-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
