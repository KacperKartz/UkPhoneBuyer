import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Logo */}
          <a className="navbar-brand" href="/">
            <img src="/Logo2-01.png" alt="Logo" className="d-inline-block align-top" height="30" />
          </a>

          {/* Hamburger Button */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu Links */}
          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/phonePage">Phone Catalog</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/FAQ">FAQ & Terms and conditions</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Trustpilot Section */}
      <div className="trustpilot-navbar bg-black">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a className="navbar-brandtp" href="https://uk.trustpilot.com/review/theukphonefixer.co.uk">
            <img src="https://cdn.trustpilot.net/brand-assets/4.3.0/logo-white.svg" alt="trustPilotLogo" className="tpLogo" height="30" />
          </a>
          <img src="https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-4.5.svg" alt="trustPilotStars" className="stars" height="30" />
        </div>
      </div>
    </>
  );
}

export default Navbar;
