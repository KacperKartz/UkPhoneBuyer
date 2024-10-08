import React, { useState, useContext  } from 'react';
import './ShippingDetailsPage.css'; 
import axios from 'axios';
import { LinearProgress } from '@mui/material';
import { AppContext, AppProvider } from './AppContext';

const ShippingDetailsPage = () => {
  const { deviceInfo, setUserInfo } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setsortCode] = useState('');
   

  
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
      errors.accountNumber = 'Account number must be 10 digits';
    }
    if (!sortCode.match(/^\d{2}-\d{2}-\d{2}$/)) {
      isValid = false;
      errors.sortCode = 'Sort code must be 6 digits in the format XX-XX-XX';
    }
  
    if (!isValid) {
      let errorMessages = Object.values(errors).join('\n');
      alert(errorMessages);
    }

    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Debug: Check if the form is validated properly
    const isFormValid = validateForm();
    console.log('Form validation result:', isFormValid);
  
    if(isFormValid) {
      setLoading(true);
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_API}/submit-details`, {
          name,
          email,
          address,
          phone,
          phoneModel: deviceInfo.phoneModel,
          storage: deviceInfo.storage,
          condition: deviceInfo.condition,
          estimatedValue: deviceInfo.estimatedValue,
          serialNumber: deviceInfo.serialNumber,
          accountNumber,
          sortCode
        });

          try{
            await axios.post(`http://localhost:5000/send-email  `,{
              "to": email,
              "subject": "Test Email",
              "text": "This is a test email."
            })
          }
          catch{
            console.error("Failed to send mail")
          }

        setLoading(false);
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting details', error);
        setLoading(false);
      }
    } else {
      console.error('Form validation failed');
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
      <p><strong>Model:</strong> {deviceInfo.phoneModel}</p>
      <p><strong>Storage:</strong> {deviceInfo.storage} </p>
      <p><strong>Condition:</strong> {deviceInfo.condition}</p>
      <p><strong>Estimated Value:</strong> £{deviceInfo.estimatedValue}</p>
      </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder='Please enter your full name'
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
              placeholder='Please enter your Email address'
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder='Please enter your address'
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
              placeholder='00000000000'
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
            placeholder='00000000'
            />
          </div>
          <div className="form-group">
            <label htmlFor="sortCode">sortCode:</label>
            <input
              type="text"
              id="sortCode"
              value={sortCode}
              onChange={(e) => setsortCode(e.target.value)}
              required
              placeholder='00-00-00'
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
          <br></br>
          <h5>
            Thank you for submitting your phone's details. We've received your information, and a confirmation email has been sent to you with the next steps.
          </h5>
          <br></br>
          <p>
            If you have selected to post it yourself please post to this address:
          TheUKPhoneBuyer Unit 6B Park Farm Business Centre IP286TS Bury St Edmunds
          </p>
        </div>
      )}
    </div>
  );
}

export default ShippingDetailsPage;
