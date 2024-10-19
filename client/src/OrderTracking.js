import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';
import './OrderTracking.css';  // Custom CSS file

function OrderTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Add loading state
  const navigate = useNavigate();

  // Go back to homepage
  const goHome = (e) => {
    navigate(`/`);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setTrackingData(null); // Reset tracking data
    setLoading(true); // Set loading state to true

    if (!trackingNumber) {
        setError('Tracking number is required');
        setLoading(false);
        return;
    }
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/track-order/${trackingNumber}`);
        setTrackingData(response.data); // Set the new tracking data
      } catch (err) {
        console.error('Error retrieving tracking information:', err);
        setError('Failed to retrieve tracking information. Please try again');
      } finally {
        setLoading(false); // Reset loading state in finally block
      }
  
};

  return (
    <Container fluid className="tracking-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg tracking-card">
            <Card.Body>
              <h2 className="text-center mb-4">Track Your Order</h2>
              <p className="text-muted text-center">Enter your tracking number to check the status of your order.</p>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="trackingNumber" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </Form>
              
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              
              {trackingData && (
    <div className="mt-4 tracking-info">
        <h4>Tracking Information</h4>
        <p><strong>Status:</strong> {trackingData.order_status}</p>
        <div className="progress">
            <div
                className={`progress-bar progress-bar-striped ${trackingData.progressColor}`}
                role="progressbar"
                style={{ width: `${trackingData.progress}%` }}
                aria-valuenow={trackingData.progress}
                aria-valuemin="0"
                aria-valuemax="100"
            >
                {trackingData.progress}%
            </div>
        </div>
    </div>
)}

            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <button type="button" className="btn btn-primary btn-lg px-4 gap-3 mt-4 w-50 homebtn" onClick={goHome}>Go Home</button>
      </div>

      <h2 className='text-dark text-center mt-4'>
        If you have any questions please feel free to contact us
      </h2>
    </Container>
  );
}

export default OrderTracking;
