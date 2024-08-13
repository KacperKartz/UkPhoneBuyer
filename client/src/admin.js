import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const AdminPage = () => {
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');

        // Fetch user data
        const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserData(userResponse.data);

        // Fetch product data
        const productResponse = await axios.get(`http://localhost:5000/phones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      await axios.put(`http://localhost:5000/phones/${editingProductId}`, { price: editedPrice }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProductData(productData.map(product => 
        product.id === editingProductId ? { ...product, price: editedPrice } : product
      ));
      setEditingProductId(null);
      setEditedPrice('');
    } catch (error) {
      setError(error);
      console.error('Error updating price:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h2>User Data</h2>
      <Table striped bordered hover className='shadow'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Phone Model</th>
            <th>Storage</th>
            <th>Condition</th>
            <th>Estimated Value</th>
            <th>Serial Number</th>
            <th>Account Number</th>
            <th>Sort Code</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.phone}</td>
              <td>{user.phone_model}</td>
              <td>{user.storage}</td>
              <td>{user.condition}</td>
              <td>{user.estimated_value}</td>
              <td>{user.serialNumber}</td>
              <td>{user.accountnumber}</td>
              <td>{user.sortcode}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2>Product Data</h2>
      <Table striped bordered hover className='shadow'>
        <thead>
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
                    step="0.01"
                  />
                ) : (
                  product.price
                )}
              </td>
              <td>
                {editingProductId === product.id ? (
                  <>
                    <Button onClick={handleSavePrice}>Save</Button>
                    <Button onClick={() => setEditingProductId(null)}>Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => handleEditPrice(product)}>Edit Price</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminPage;
