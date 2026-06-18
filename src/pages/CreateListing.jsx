import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './CreateListing.css';

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    cuisineType: '',
    menuItems: [''],
    dinnerDate: '',
    maxGuests: 6,
    pricePerSeat: '',
    neighborhood: '',
    city: '',
    exactAddress: '',
    photoUrls: [''],
    instantBook: true,
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setVal = (field, val) => setForm({ ...form, [field]: val });

  const setMenuItem = (i, val) => {
    const items = [...form.menuItems];
    items[i] = val;
    setForm({ ...form, menuItems: items });
  };

  const addMenuItem = () => setForm({ ...form, menuItems: [...form.menuItems, ''] });
  const removeMenuItem = (i) => setForm({ ...form, menuItems: form.menuItems.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        menuItems: form.menuItems.filter(m => m.trim()),
        photoUrls: form.photoUrls.filter(p => p.trim()),
        maxGuests: Number(form.maxGuests),
        pricePerSeat: Number(form.pricePerSeat),
      };
      const res = await listingsAPI.create(payload);
      toast.success('Dinner listing created!');
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="container create-container">
        <div className="create-header">
          <h1 className="section-title">Host a dinner</h1>
          <p className="create-sub">Share a meal you're proud of. Set your own price, date, and guest count.</p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Basics */}
          <div className="create-section">
            <h2 className="create-section-title">The dinner</h2>
            <div className="form-group">
              <label className="form-label">Dinner title *</label>
              <input type="text" className="form-input" placeholder="e.g. Chettinad Night — 7 Course Feast"
                value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} placeholder="Tell guests what makes this dinner special..."
                value={form.description} onChange={set('description')} />
            </div>

            <div className="create-row">
              <div className="form-group">
                <label className="form-label">Cuisine type *</label>
                <input type="text" className="form-input" placeholder="e.g. South Indian, Italian..."
                  value={form.cuisineType} onChange={set('cuisineType')} required />
              </div>

              <div className="form-group">
                <label className="form-label">Max guests *</label>
                <input type="number" className="form-input" min={2} max={20}
                  value={form.maxGuests} onChange={e => setVal('maxGuests', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="create-section">
            <h2 className="create-section-title">Menu</h2>
            <div className="menu-builder">
              {form.menuItems.map((item, i) => (
                <div key={i} className="menu-row">
                  <input type="text" className="form-input" placeholder={`Dish ${i + 1}`}
                    value={item} onChange={e => setMenuItem(i, e.target.value)} />
                  {form.menuItems.length > 1 && (
                    <button type="button" className="btn btn-ghost menu-remove" onClick={() => removeMenuItem(i)}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline add-dish-btn" onClick={addMenuItem}>
                <Plus size={15} /> Add dish
              </button>
            </div>
          </div>

          {/* Date & Price */}
          <div className="create-section">
            <h2 className="create-section-title">Date & price</h2>
            <div className="create-row">
              <div className="form-group">
                <label className="form-label">Dinner date & time *</label>
                <input type="datetime-local" className="form-input"
                  value={form.dinnerDate} onChange={set('dinnerDate')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price per seat (₹) *</label>
                <input type="number" className="form-input" placeholder="850"
                  value={form.pricePerSeat} onChange={set('pricePerSeat')} min={100} required />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="create-section">
            <h2 className="create-section-title">Location</h2>
            <p className="create-hint">Guests only see neighborhood until their booking is confirmed.</p>
            <div className="create-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" className="form-input" placeholder="Chennai"
                  value={form.city} onChange={set('city')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Neighborhood *</label>
                <input type="text" className="form-input" placeholder="Adyar"
                  value={form.neighborhood} onChange={set('neighborhood')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Exact address * (shared post-booking)</label>
              <input type="text" className="form-input" placeholder="12 Lake View Road, Adyar"
                value={form.exactAddress} onChange={set('exactAddress')} required />
            </div>
          </div>

          {/* Photos */}
          <div className="create-section">
            <h2 className="create-section-title">Photos</h2>
            <p className="create-hint">Add photo URLs (Unsplash, Cloudinary, etc.)</p>
            <div className="form-group">
              <input type="url" className="form-input" placeholder="https://..."
                value={form.photoUrls[0]} onChange={e => { const u = [...form.photoUrls]; u[0] = e.target.value; setVal('photoUrls', u); }} />
            </div>
          </div>

          {/* Booking type */}
          <div className="create-section">
            <h2 className="create-section-title">Booking type</h2>
            <div className="book-type-options">
              {[
                { value: true, label: '⚡ Instant book', desc: 'Guests are confirmed automatically' },
                { value: false, label: '✋ Request to book', desc: 'You review and approve each guest' },
              ].map(opt => (
                <div
                  key={String(opt.value)}
                  className={`book-type-card ${form.instantBook === opt.value ? 'active' : ''}`}
                  onClick={() => setVal('instantBook', opt.value)}
                >
                  <span className="book-type-label">{opt.label}</span>
                  <span className="book-type-desc">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="create-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Publish dinner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
