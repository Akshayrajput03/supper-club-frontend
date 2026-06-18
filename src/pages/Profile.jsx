import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Star, LogOut, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const roleLabel = {
    GUEST: 'Guest',
    HOST: 'Host',
    BOTH: 'Host & Guest',
  }[user.role] || user.role;

  return (
    <div style={{ minHeight: '80vh', padding: '48px 0', background: 'var(--cream)' }}>
      <div className="container" style={{ maxWidth: 600 }}>

        {/* Avatar + name */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--terracotta)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700,
            margin: '0 auto 16px',
          }}>
            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--charcoal)', marginBottom: 4 }}>
            {user.fullName}
          </h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 14px', fontSize: 13, color: 'var(--stone)',
          }}>
            {user.role === 'HOST' || user.role === 'BOTH'
              ? <ChefHat size={13} />
              : <User size={13} />}
            {roleLabel}
          </span>
        </div>

        {/* Details */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 20 }}>
            Account Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={18} color="var(--terracotta)" />
              <div>
                <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Email</p>
                <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>{user.email}</p>
              </div>
            </div>

            {user.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color="var(--terracotta)" />
                <div>
                  <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Location</p>
                  <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>
                    {user.neighborhood ? `${user.neighborhood}, ` : ''}{user.city}
                  </p>
                </div>
              </div>
            )}

            {user.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Star size={18} color="var(--terracotta)" />
                <div>
                  <p style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 2 }}>Rating</p>
                  <p style={{ fontSize: 15, color: 'var(--charcoal)', fontWeight: 500 }}>
                    {user.averageRating?.toFixed(1)} · {user.totalReviews} review{user.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '16px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#B94040', fontSize: 15, fontWeight: 500, padding: '8px 0',
              }}
            >
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