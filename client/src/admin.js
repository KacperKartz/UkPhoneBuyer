import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
const AdminPage = () => {
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <div>
      <h2>{message}</h2>
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
          {data.map((user) => (
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
    </div>
  );
};

export default AdminPage;
