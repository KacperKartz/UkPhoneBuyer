import React, { useState, useContext } from 'react';
import './ShippingDetailsPage.css'; 
import axios from 'axios';
import { LinearProgress } from '@mui/material';
import { AppContext } from './AppContext';

const ShippingDetailsPage = () => {
  const { deviceInfo, setUserInfo, totalCost } = useContext(AppContext); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    let isValid = true;
    let errors = {};
  
    if (!name.trim()) {
      isValid = false;
      errors.name = 'Name is required';
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      isValid = false;
      errors.email = 'Email is invalid';
    }
    if (!address.trim()) {
      isValid = false;
      errors.address = 'Address is required';
    }
    if (!phone.match(/^\d{11}$/)) {
      isValid = false;
      errors.phone = 'Phone number must be 10 digits';
    }
    if (!accountNumber.match(/^\d{8}$/)) {
      isValid = false;
      errors.accountNumber = 'Account number must be 8 digits';
    }
    if (!sortCode.match(/^\d{2}-\d{2}-\d{2}$/)) {
      isValid = false;
      errors.sortCode = 'Sort code must be in the format XX-XX-XX';
    }
  
    if (!isValid) {
      let errorMessages = Object.values(errors).join('\n');
      alert(errorMessages);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        // Send the form and multiple devices' data to the backend
        await axios.post(`http://localhost:5000/submit-details-m`, {
          name,
          email,
          address,
          phone,
          devices: Array.isArray(deviceInfo) ? deviceInfo : [deviceInfo],
          accountNumber,
          sortCode
        });

        try {
          await axios.post(`http://localhost:5000/send-email`, {
            "to": email,
            "subject": "Device Submission Confirmation",
            "text": "Thank you for submitting your devices. We will process them soon."
          });
        } catch (error) {
          console.error("Failed to send confirmation email");
        }

        setLoading(false);
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting details', error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="container">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="shipping-form">
          <div className="header">
            <h1>Customer Details</h1>
          </div>

          <div className="device-info">
  <h3>Your Device Information:</h3>
  {deviceInfo.map((device, index) => (
  <div key={index} className="device-summary">
    <p><strong>Model:</strong> {device.model}</p>
    <p><strong>Storage:</strong> {device.storage}</p>
    <p><strong>Condition:</strong> {device.condition}</p>
    <p><strong>Estimated Value:</strong> £{device.estimatedValue}</p>
  </div>
))}
          <h2><strong>Total estimated value:</strong> £{totalCost}</h2>
</div>

          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Please enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Please enter your Email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Please enter your address"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="00000000000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Account Number:</label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              placeholder="00000000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sortCode">Sort Code:</label>
            <input
              type="text"
              id="sortCode"
              value={sortCode}
              onChange={(e) => setSortCode(e.target.value)}
              required
              placeholder="00-00-00"
            />
          </div>

          {loading ? (
            <LinearProgress className="progress-bar" />
          ) : (
            <button type="submit" className="submitbtn">Submit</button>
          )}
        </form>
      ) : (
        <div className="success-message">
          <h3>Success! Your Details Have Been Submitted.</h3>
          <h5>Thank you for submitting your devices. A confirmation email has been sent to you.</h5>
          <p>If you selected to post your devices, please send them to:</p>
          <p>TheUKPhoneBuyer, Unit 6B Park Farm Business Centre, IP286TS, Bury St Edmunds</p>
        </div>
      )}
    </div>
  );
};

export default ShippingDetailsPage;
