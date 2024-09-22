import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Card, Spinner, Alert, Container, Row, Col, Modal } from 'react-bootstrap';

const AdminPage = () => {
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');

        // Fetch user data with multiple devices
        const userResponse = await axios.get(`http://localhost:5000/users-with-devices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(userResponse.data);

        // Fetch product data
        const productResponse = await axios.get(`http://localhost:5000/phones`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProductData(productResponse.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePriceChange = (e) => {
    setEditedPrice(e.target.value);
  };

  const handleEditPrice = (product) => {
    setEditingProductId(product.id);
    setEditedPrice(product.price);
  };

  const handleSavePrice = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/phones/${editingProductId}`,
        { price: editedPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProductData(
        productData.map((product) =>
          product.id === editingProductId ? { ...product, price: editedPrice } : product
        )
      );
      setEditingProductId(null);
      setEditedPrice('');
    } catch (error) {
      setError(error);
      console.error('Error updating price:', error);
    }
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error.message}</Alert>;
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4 text-center">Admin Dashboard</h2>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>User Data</Card.Title>
              <Table responsive bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Devices</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <ul>
                          {user.devices.map((device) => (
                            <li key={device.id}>
                              {device.phone_model}, {device.storage}GB, {device.device_condition}, Estimated Value: £{device.estimated_value}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <Button variant="info" size="sm" onClick={() => handleShowDetails(user)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Product Data</Card.Title>
              <Table responsive bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.brand}</td>
                      <td>{product.model}</td>
                      <td>
                        {editingProductId === product.id ? (
                          <input
                            type="number"
                            value={editedPrice}
                            onChange={handlePriceChange}
                            className="form-control"
                            step="0.01"
                          />
                        ) : (
                          `£${product.price}`
                        )}
                      </td>
                      <td>
                        {editingProductId === product.id ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={handleSavePrice}
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingProductId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditPrice(product)}
                          >
                            Edit Price
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Address:</strong> {selectedUser.address}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <ul>
                {selectedUser.devices.map((device) => (
                  <li key={device.id}>
                    <p><strong>Phone Model:</strong> {device.phone_model}</p>
                    <p><strong>Storage:</strong> {device.storage}GB</p>
                    <p><strong>Condition:</strong> {device.device_condition}</p>
                    <p><strong>Estimated Value:</strong> £{device.estimated_value}</p>
                    <p><strong>Serial Number:</strong> {device.serial_number}</p>
                  </li>
                ))}
              </ul>
              <p><strong>Account Number:</strong> {selectedUser.account_number}</p>
              <p><strong>Sort Code:</strong> {selectedUser.sort_code}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;
