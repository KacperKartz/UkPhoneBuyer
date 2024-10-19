import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
import { Table, Button, Card, Spinner, Alert, Container, Row, Col, Modal,Form  } from 'react-bootstrap';

const AdminPage = () => {
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedBrand, setEditedBrand] = useState('');
  const [editedModel, setEditedModel] = useState('');
  const [editingUserId, setEditingUserId] = useState(null); 
  const [newStatus, setNewStatus] = useState('');
  

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ brand: '', model: '', price: '' });


  const navigate = useNavigate();

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/addPhone`,
        // `${process.env.REACT_APP_BACKEND_API}/addPhone`,
        newProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update productData with the new product from the server
      setProductData([...productData, response.data]);
      setNewProduct({ brand: '', model: '', price: '' });
    } catch (error) {
      setError(error);
      console.error('Error adding product:', error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      // await axios.delete(`${process.env.REACT_APP_BACKEND_API}/phones/${productId}`, {
      await axios.delete(`${process.env.REACT_APP_BACKEND_API}/phones/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the product from the list after deletion
      setProductData(productData.filter(product => product.id !== productId));
    } catch (error) {
      setError(error);
      console.error('Error deleting product:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          navigate('/adminlogin'); // Redirect to the login page if not logged in
        }



        // Fetch user data with multiple devices
        // const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users-with-devices`, {
        const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users-with-devices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(userResponse.data);

        // Fetch product data
        // const productResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API}/phones`, {
        const productResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API}/phones`, {
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
  }, [navigate]);

  const handlePriceChange = (e) => {
    setEditedPrice(e.target.value);
  };

  const handleEditPrice = (product) => {
    setEditingProductId(product.id);
    setEditedPrice(product.price);
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditedBrand(product.brand);
    setEditedModel(product.model);
    setEditedPrice(product.price);
  };
  

  const handleSaveProduct = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/phones/${editingProductId}`,
        { brand: editedBrand, model: editedModel, price: editedPrice },
        {
          headers: {
            Authorization: `Bearer ${
              token}`,
          },
        }
      );
  
      // Update the local state with the new changes
      setProductData(
        productData.map((product) =>
          product.id === editingProductId
            ? { ...product, brand: editedBrand, model: editedModel, price: editedPrice }
            : product
        )
      );
  
      setEditingProductId(null);
      setEditedBrand('');
      setEditedModel('');
      setEditedPrice('');
    } catch (error) {
      setError(error);
      console.error('Error updating product:', error);
    }
  };
  
  const handleChangeStatus = (userId, currentStatus) => {
    setEditingUserId(userId); // Set the current user for editing
    setNewStatus(currentStatus); // Initialize dropdown with current status
  };
  
  const handleStatusUpdate = (userId) => {
    fetch(`${process.env.REACT_APP_BACKEND_API}/update-status/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Status updated successfully');
          window.location.reload(false);
        } else {
          alert('Error updating status');
        }
        setEditingUserId(null); // Exit edit mode
      })
      .catch((error) => console.error('Error:', error));
  };


  const handleSavePrice = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/phones/${editingProductId}`,
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
      <Table responsive bordered hover className="mb-0" style={{ maxWidth: "none" }}>
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Devices</th>
          <th>Order Status</th>
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
                  <li key={device.serial_number}>
                    {device.phone_model}, {device.storage}GB, {device.device_condition}, Estimated Value: £{device.estimated_value}
                  </li>
                ))}
              </ul>
            </td>
            <td>
              {editingUserId === user.id ? (
                // Show dropdown if editing status
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Processing">Processing</option>
                  <option value="Awaiting Delivery">Awaiting Delivery</option>
                  <option value="Inspecting Device">Inspecting Device</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                </Form.Select>
              ) : (
                user.order_status
              )}
            </td>
            <td>
              {editingUserId === user.id ? (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate(user.id)}
                    className="me-2"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingUserId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowDetails(user)}
                    className="me-2"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleChangeStatus(user.id, user.order_status)}
                  >
                    Change Status
                  </Button>
                </>
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


      <Row>
      <Col lg={12} className="mb-4">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Add New Product</Card.Title>
            <Row style={{display: "block"}}>
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brand"
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleNewProductChange}
                />
              </Col>
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Model"
                  name="model"
                  value={newProduct.model}
                  onChange={handleNewProductChange}
                />
              </Col>
              <Col md={2}>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  step="0.01"
                />
              </Col>
              <Col md={2}>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Year"
                  name="year"
                  value={newProduct.year}
                  onChange={handleNewProductChange}
                />
              </Col>
              <Col md={1}>
                <Button variant="primary" onClick={handleAddProduct}>
                  Add
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Row>
      <Col lg={12} className="mb-4">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Product Data</Card.Title>
            <Table responsive bordered hover className="mb-0" style={{maxWidth: "none"}}>
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
        <td>
          {editingProductId === product.id ? (
            <input
              type="text"
              value={editedBrand}
              onChange={(e) => setEditedBrand(e.target.value)}
              className="form-control"
            />
          ) : (
            product.brand
          )}
        </td>
        <td>
          {editingProductId === product.id ? (
            <input
              type="text"
              value={editedModel}
              onChange={(e) => setEditedModel(e.target.value)}
              className="form-control"
            />
          ) : (
            product.model
          )}
        </td>
        <td>
          {editingProductId === product.id ? (
            <input
              type="number"
              value={editedPrice}
              onChange={(e) => setEditedPrice(e.target.value)}
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
              <Button variant="success" size="sm" className="me-2" onClick={handleSaveProduct}>
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingProductId(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="warning" size="sm" onClick={() => handleEditProduct(product)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleRemoveProduct(product.id)}>
                Delete
              </Button>
            </>
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

      {/* <Row>
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
      </Row> */}

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
