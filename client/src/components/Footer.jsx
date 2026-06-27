import React from 'react';
import Logo from './Logo';
import { Globe, Phone, MessageSquare, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'rgba(255, 255, 255, 0.02)', 
      borderTop: '1px solid rgba(79, 70, 229, 0.1)',
      padding: '4rem 6rem 2rem',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '4rem', maxWidth: '1200px', margin: '0 auto 4rem auto' }}>
        {/* Brand Section */}
        <div>
          <div style={{ marginLeft: '-12px' }}>
            <Logo size={40} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '1.5rem', maxWidth: '300px' }}>
            Transforming education through AI-powered transcription, interactive learning, and personalized study guides.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {[Globe, Phone, MessageSquare, Mail].map((Icon, i) => (
              <a key={i} href="#" style={{ 
                color: 'var(--text-muted)', 
                padding: '8px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px',
                display: 'flex',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Playfair Display, serif' }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Smart Transcription', 'AI Study Guides', 'Interactive Chat', 'Mentor Dashboard'].map(link => (
              <li key={link}><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} className="footer-link">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Playfair Display, serif' }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['About Us', 'Careers', 'Blog', 'Contact'].map(link => (
              <li key={link}><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} className="footer-link">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Playfair Display, serif' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
              <li key={link}><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} className="footer-link">{link}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '2rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>&copy; {new Date().getFullYear()} MindForge. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Designed for modern learning</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
