import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Star, LogOut, ChefHat, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfileData(res.data);
      setPhone(res.data.phone || '');
    } catch {
      // fallback to auth user data
      setProfileData(user);
    }
  };

  const handleSavePhone = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', { phone });
      setProfileData(res.data);
      setEditing(false);
      toast.success('Phone number saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  const data = profileData || user;
  const roleLabel = { GUEST: 'Guest', HOST: 'Host', BOTH: 'Host & Guest' }[data.role] || data.role;

  return (
    <div style={{ minHeight: '80vh', padding: '48px 0', background: 'var(--cream)' }}>
      <div className="container" style={{ maxWidth: 600 }}>

        {/* Avatar + name */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '40px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--terracotta)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, margin: '0 auto 16px',
          }}>
            {data.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--charcoal)', marginBottom: 4 }}>
            {data.fullName}
          </h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 14px', fontSize: 13, color: 'var(--stone)',
          }}>
            {data.role === 'HOST' || data.role === 'BOTH' ? <ChefHat size={13} /> : <User size={13} />}
            {roleLabel}
          </span>
        </div>

        {/* Details */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '24px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 20 }}>
            Account Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={18} color="var(--terracotta)" />
              <div>
                <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Email</p>
                <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>{data.email}</p>
              </div>
            </div>

            {data.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color="var(--terracotta)" />
                <div>
                  <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Location</p>
                  <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>
                    {data.neighborhood ? `${data.neighborhood}, ` : ''}{data.city}
                  </p>
                </div>
              </div>
            )}

            {/* Phone field */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Phone size={18} color="var(--terracotta)" style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 6 }}>
                  Contact Number <span style={{ color: 'var(--terracotta)', fontSize: 11 }}>(shown to confirmed guests)</span>
                </p>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ flex: 1, fontSize: 14 }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={handleSavePhone}
                      disabled={saving}
                    >
                      {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Save size={14} /> Save</>}
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p style={{ fontSize: 15, color: data.phone ? 'var(--charcoal)' : 'var(--stone)', fontWeight: data.phone ? 500 : 400 }}>
                      {data.phone || 'Not set'}
                    </p>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 13, padding: '4px 10px' }}
                      onClick={() => setEditing(true)}
                    >
                      {data.phone ? 'Edit' : '+ Add'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {data.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Star size={18} color="var(--terracotta)" />
                <div>
                  <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Rating</p>
                  <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>
                    {data.averageRating?.toFixed(1)} · {data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sign out */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#B94040', fontSize: 15, fontWeight: 500, padding: '8px 0',
            }}>
              <LogOut size={18} /> Sign out
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--stone)', margin: 0 }}>Sure you want to sign out?</p>
              <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={handleLogout}>
                Yes, sign out
              </button>
              <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}