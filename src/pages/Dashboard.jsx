import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, listingsAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { MessageCircle, X, PlusCircle, MapPin, Calendar, ChevronDown, ChevronUp, Check } from 'lucide-react';
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
  const [listingBookings, setListingBookings] = useState({});
  const [expandedListing, setExpandedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const isHost = user?.role === 'HOST' || user?.role === 'BOTH';
      const promises = [bookingsAPI.getMine()];
      if (isHost) promises.push(listingsAPI.getMine());
      const [bookRes, listingsRes] = await Promise.all(promises);
      setBookings(bookRes.data || []);
      setHostListings(listingsRes?.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleListingBookings = async (listingId) => {
    if (expandedListing === listingId) { setExpandedListing(null); return; }
    setExpandedListing(listingId);
    if (!listingBookings[listingId]) {
      try {
        const res = await bookingsAPI.getForListing(listingId);
        setListingBookings(prev => ({ ...prev, [listingId]: res.data }));
      } catch {
        toast.error('Failed to load bookings');
      }
    }
  };

  const handleBookingAction = async (bookingId, status, listingId) => {
    try {
      await bookingsAPI.updateStatus(bookingId, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      const res = await bookingsAPI.getForListing(listingId);
      setListingBookings(prev => ({ ...prev, [listingId]: res.data }));
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const openChat = async (bookingId) => {
    setChatBookingId(bookingId);
    try {
      const res = await messagesAPI.getConversation(bookingId);
      setMessages(res.data);
    } catch { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const res = await messagesAPI.send({ bookingId: chatBookingId, content: newMsg });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
    } catch { toast.error('Failed to send message'); }
  };

  const updateBooking = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

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
              Hosting ({hostListings.length})
            </button>
          )}
        </div>

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">🍽️</p>
                <h3>No bookings yet</h3>
                <p>Browse upcoming dinners and book your first seat.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/listings')}>Find a dinner</button>
              </div>
            ) : bookings.map(b => (
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
                        onClick={() => updateBooking(b.id, 'CANCELLED')}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HOSTING TAB */}
        {tab === 'hosting' && (
          <div className="bookings-list">
            {hostListings.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">👨‍🍳</p>
                <h3>No hosted dinners yet</h3>
                <p>Create your first dinner and start hosting guests.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/host/create')}>
                  Create your first dinner
                </button>
              </div>
            ) : hostListings.map(listing => (
              <div key={listing.id} className="booking-row card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div className="booking-row-main">
                  <div>
                    <div className="booking-row-header">
                      <h3 className="booking-row-title">{listing.title}</h3>
                      <span className={`badge ${listing.status === 'ACTIVE' ? 'badge-green' : 'badge-stone'}`}>{listing.status}</span>
                    </div>
                    <div className="booking-row-meta">
                      <span><Calendar size={13} /> {listing.dinnerDate ? format(new Date(listing.dinnerDate), 'EEE, MMM d · h:mm a') : '—'}</span>
                      <span><MapPin size={13} /> {listing.neighborhood}, {listing.city}</span>
                      <span>👥 {listing.confirmedGuests}/{listing.maxGuests} guests</span>
                      <span>₹{listing.pricePerSeat} per seat</span>
                    </div>
                  </div>
                  <div className="booking-row-actions">
                    <button className="btn btn-ghost" onClick={() => navigate(`/listings/${listing.id}`)}>View</button>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => toggleListingBookings(listing.id)}>
                      Requests {expandedListing === listing.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Booking requests panel */}
                {expandedListing === listing.id && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                    {!listingBookings[listing.id] ? (
                      <div className="loading-center"><div className="spinner" style={{ width: 20, height: 20 }} /></div>
                    ) : listingBookings[listing.id].length === 0 ? (
                      <p style={{ color: 'var(--stone)', fontSize: 14, padding: '4px 0' }}>No booking requests yet.</p>
                    ) : listingBookings[listing.id].map(b => (
                      <div key={b.id} style={{
                        background: 'var(--cream)', borderRadius: 10, padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 12, flexWrap: 'wrap', marginBottom: 8,
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--charcoal)' }}>{b.guestName}</span>
                            <span className={`badge ${STATUS_COLORS[b.status]}`} style={{ fontSize: 11 }}>{b.status}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--stone)', display: 'flex', gap: 12 }}>
                            <span>👥 {b.seats} seat{b.seats > 1 ? 's' : ''}</span>
                            <span>₹{b.totalAmount?.toLocaleString()}</span>
                            {b.specialRequests && <span>📝 {b.specialRequests}</span>}
                          </div>
                        </div>
                        {b.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                              onClick={() => handleBookingAction(b.id, 'CONFIRMED', listing.id)}>
                              <Check size={14} /> Confirm
                            </button>
                            <button className="btn btn-outline"
                              style={{ padding: '6px 14px', fontSize: 13, color: 'var(--error)', borderColor: 'currentColor' }}
                              onClick={() => handleBookingAction(b.id, 'DECLINED', listing.id)}>
                              <X size={14} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHAT DRAWER */}
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
              <input type="text" className="form-input" placeholder="Type a message..."
                value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button className="btn btn-primary" onClick={sendMessage} disabled={!newMsg.trim()}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}