import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, listingsAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { MessageCircle, Check, X, PlusCircle, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_COLORS = {
  PENDING: 'badge-stone',
  CONFIRMED: 'badge-green',
  DECLINED: 'badge-stone',
  CANCELLED: 'badge-stone',
  COMPLETED: 'badge-terracotta',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [hostListings, setHostListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookRes] = await Promise.all([bookingsAPI.getMine()]);
      setBookings(bookRes.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (bookingId) => {
    setChatBookingId(bookingId);
    try {
      const res = await messagesAPI.getConversation(bookingId);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const res = await messagesAPI.send({ bookingId: chatBookingId, content: newMsg });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const updateBooking = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="section-title">My Dashboard</h1>
            <p className="dashboard-sub">Welcome back, {user?.fullName?.split(' ')[0]}</p>
          </div>
          {(user?.role === 'HOST' || user?.role === 'BOTH') && (
            <button className="btn btn-primary" onClick={() => navigate('/host/create')}>
              <PlusCircle size={16} /> New Dinner
            </button>
          )}
        </div>

        <div className="dashboard-tabs">
          <button className={`dash-tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
            My Bookings ({bookings.length})
          </button>
          {(user?.role === 'HOST' || user?.role === 'BOTH') && (
            <button className={`dash-tab ${tab === 'hosting' ? 'active' : ''}`} onClick={() => setTab('hosting')}>
              Hosting
            </button>
          )}
        </div>

        {tab === 'bookings' && (
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">🍽️</p>
                <h3>No bookings yet</h3>
                <p>Browse upcoming dinners and book your first seat.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/listings')}>
                  Find a dinner
                </button>
              </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="booking-row card">
                  <div className="booking-row-main">
                    <div>
                      <div className="booking-row-header">
                        <h3 className="booking-row-title">{b.listingTitle}</h3>
                        <span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </div>

                      <div className="booking-row-meta">
                        <span><Calendar size={13} /> {b.dinnerDate ? format(new Date(b.dinnerDate), 'EEE, MMM d · h:mm a') : '—'}</span>
                        <span><MapPin size={13} /> {b.exactAddress || `${b.neighborhood}, ${b.city}`}</span>
                        <span>👥 {b.seats} seat{b.seats > 1 ? 's' : ''}</span>
                        <span>₹{b.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="booking-row-actions">
                      {b.status === 'CONFIRMED' && (
                        <button className="btn btn-ghost" onClick={() => openChat(b.id)}>
                          <MessageCircle size={15} /> Message host
                        </button>
                      )}
                      {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                        <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'currentColor' }}
                          onClick={() => updateBooking(b.id, 'CANCELLED')}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'hosting' && (
          <div className="empty-state">
            <p className="empty-icon">👨‍🍳</p>
            <h3>Your hosted dinners will appear here</h3>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/host/create')}>
              Create your first dinner
            </button>
          </div>
        )}
      </div>

      {/* Chat drawer */}
      {chatBookingId && (
        <div className="chat-overlay" onClick={() => setChatBookingId(null)}>
          <div className="chat-drawer" onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <h3>Message host</h3>
              <button className="btn btn-ghost" onClick={() => setChatBookingId(null)}><X size={18} /></button>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && <p className="chat-empty">No messages yet. Say hello!</p>}
              {messages.map(m => (
                <div key={m.id} className={`chat-bubble ${m.senderEmail === user?.email ? 'mine' : 'theirs'}`}>
                  <span className="chat-sender">{m.senderName}</span>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={!newMsg.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
