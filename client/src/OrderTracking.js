import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';
import './OrderTracking.css';  // Custom CSS file


function OrderTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTrackingData(null);

    try {
      const response = await axios.post('/track-order', { trackingNumber });
      setTrackingData(response.data);
    } catch (err) {
      setError('Failed to retrieve tracking information');
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
                <Button variant="primary" type="submit" className="w-100">
                  Track
                </Button>
              </Form>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {trackingData && (
                <div className="mt-4 tracking-info">
                  <h4>Tracking Information</h4>
                  <p><strong>Status:</strong> {trackingData.status}</p>
                  {/* Add more tracking details as needed */}
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
    </Container>
  );
}

export default OrderTracking;
