import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    city: '', neighborhood: '', role: 'GUEST',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <ChefHat size={28} />
          <span>SupperClub</span>
        </div>

        <h1 className="auth-title">Join SupperClub</h1>
        <p className="auth-sub">Find dinner — or host one</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input type="text" className="form-input" placeholder="Your name" value={form.fullName} onChange={set('fullName')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" placeholder="e.g. Chennai" value={form.city} onChange={set('city')} />
            </div>
            <div className="form-group">
              <label className="form-label">Neighborhood</label>
              <input type="text" className="form-input" placeholder="e.g. Adyar" value={form.neighborhood} onChange={set('neighborhood')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="role-tabs">
              {[
                { value: 'GUEST', label: '🍽️ Find dinners' },
                { value: 'HOST', label: '👨‍🍳 Host dinners' },
                { value: 'BOTH', label: '✨ Both' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-tab ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
