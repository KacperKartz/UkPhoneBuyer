import React from 'react'
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';


const Contact = () => {
  return (
    <div>
          <Card className="shadow-lg tracking-card">
            <Card.Body>
              <h2 className="text-center mb-4">Contact Us</h2>
              <h5 className="text-muted text-center mt-5">
                If you have any queries regarding your order please contact us via the email below
                </h5>
              <h5 className='text-center mt-5'> 
              buyback@theukphonefixer.co.uk
              </h5>
              <p className='text-muted text-center mt-3'>
                We will do our best to respone as soon as possible, thank you for your patience
              </p>
              </Card.Body>
            </Card>
    </div>
  )
} 

export default Contact