import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faFileContract, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/support-2025/privacy">
            <FontAwesomeIcon icon={faShieldHalved} className="footer-icon" />
            <span>Privacy Policy</span>
          </Link>
          <Link to="/support-2025/terms">
            <FontAwesomeIcon icon={faFileContract} className="footer-icon" />
            <span>Terms of Service</span>
          </Link>
          <Link to="/support-2025/contact">
            <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
            <span>Contact</span>
          </Link>
        </div>
        <p className="copyright">© {currentYear} Support 2025. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 