
import React from 'react';
import './Footer.css'; 

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 TheUkBuyer. All rights reserved.</p>
        <nav>
          <ul className="footer-links">
            <li><a href="/FAQ">About</a></li>
            <li><a href="/FAQ">Contact</a></li>
            <li><a href="/FAQ">Privacy Policy</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
