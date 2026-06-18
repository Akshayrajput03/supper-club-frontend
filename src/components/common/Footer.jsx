import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <ChefHat size={20} />
            <span>SupperClub</span>
          </div>
          <p className="footer-tagline">Home cooking. Real community.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">Discover</span>
            <Link to="/listings">Browse dinners</Link>
            <Link to="/register">Join SupperClub</Link>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Host</span>
            <Link to="/host/create">Host a dinner</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SupperClub. Built with React + Spring Boot.</p>
      </div>
    </footer>
  );
}
