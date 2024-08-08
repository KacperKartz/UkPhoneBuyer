import React, { useEffect, useState } from 'react';
import './App.css';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
//import { data } from './data.js';
import DetailsPage from './DetailsPage';
import ShippingDetailsPage from './ShippingDetailsPage';

function HomePage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);


  const navigate = useNavigate();

  //db
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_API}/phones`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    console.log("Search input:", searchValue); // Log each character typed
  };
  const handleButtonClick = (itemModel) => {
    console.log("clicked", itemModel);
    navigate(`/details/${itemModel}`);
  };
  return (
    <div className="app">
      <div className="title-container">
        <h2> </h2>
        <h1 className="text-light">Sell your phone today</h1>
        <p className='text-white'>Make the most out of your old device and <br></br> make some money whilst you're at it</p>
      </div>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Enter your device, e.g. 'iPhone 13'"
          onChange={handleSearchChange}
        />
        <button className="search-button">Search</button>
      </div>

      <Table striped bordered hover className='shadow'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Brand</th>
            <th>Model</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.filter((item) => {
          const searchLowerCase = search.toLowerCase();
          const modelLowerCase = item.model.toLowerCase();
          const brandLowerCase = item.brand.toLowerCase();
          return searchLowerCase === '' ? true : modelLowerCase.includes(searchLowerCase) || brandLowerCase.includes(searchLowerCase);

          }).map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.brand}</td>
              <td>{item.model}</td>
              <td>
                <button className="btn btn-outline-primary" onClick={() => handleButtonClick(item.model)}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}




function App() {


  return (

    
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/details/:itemModel" element={<DetailsPage />} />
        <Route path='/shipping-details' element = {<ShippingDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
