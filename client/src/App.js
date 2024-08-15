import React, { useEffect, useRef, useState } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
//import { data } from './data.js';
import DetailsPage from './DetailsPage';
import ShippingDetailsPage from './ShippingDetailsPage';
import AdminLogin from './adminLogin';
import AdminPage from './admin.js';
import Layout from './Layout.js';
import PhonePage from './phonePage.js'

function HomePage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const tableRef = useRef(null);
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
    setShowTable(searchValue.trim() !== '');
    console.log("Search input:", searchValue); // Log each character typed
  };
  const handleButtonClick = (itemModel) => {
    console.log("clicked", itemModel);
    navigate(`/details/${itemModel}`);
  };


  const iPhoneClick = (e) => {
    navigate(`/PhonePage`)
  }


  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (tableRef.current && !tableRef.current.contains(event.target)) {
  //       setShowTable(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  return (
    <div className="app">
      <div className='intro-header shadow'>

      <div className="title-container"  ref={tableRef}>
        <h2> </h2>
        <h1 className="text-light">Sell your device today</h1>
        <p className='text-white'>Make the most out of your old device and <br></br> make some money whilst you're at it</p>
      </div>
      <div className="search-container shadow ">
        <input
          type="text"
          className="search-input"
          placeholder="Enter your device, e.g. 'iPhone 13'"
          onChange={handleSearchChange}
        />
        <button className="search-button">Search</button>
      </div>

      {showTable && (
    

    <Table striped bordered hover className='shadow specialTable'>
      <thead>
        <tr>
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
            <td>{item.brand}</td>
            <td>{item.model}</td>
            <td>
              <button className="btn btn-outline-primary" onClick={() => handleButtonClick(item.model)}>Select</button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
          )}
        
      </div>




<div className="card-group shadow">
      {/* iPhone Card */}
      <div className="card order-1 order-lg-2 shadow" onClick={iPhoneClick}>
        <img
          src="https://ee.co.uk/medias/iphone-13-5g-pink-desktop-detail-1-WebP-Format-488?context=bWFzdGVyfHJvb3R8ODIyMHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oODUvaGVhLzk4ODg4ODYyNTk3NDIvaXBob25lLTEzLTVnLXBpbmstZGVza3RvcC1kZXRhaWwtMV9XZWJQLUZvcm1hdC00ODh8YmQ5NmZmZTQyMjgwNmE3NTE3ZTczMzQ4ZmEzMWE1YTcxZTYzNjk5N2FiNTljNmZkYmVlZWQ3NmI5YjViZWFkNw"
          className="card-img-top"
          alt="iPhone"
        />
        <div className="card-body">
          <h5 className="card-title">iPhone</h5>
          <p className="card-text">
            This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
          </p>
          <p className="card-text">
            <small className="text-body-secondary">Last updated 3 mins ago</small>
          </p>
        </div>
      </div>
      
      {/* iPad Card */}
      <div className="card order-2 order-lg-1 shadow">
        <img
          src="https://econtent.o2.co.uk/o/econtent/media/get/e120bb0d-ec2e-4507-bdef-2d3d60698a64"
          className="card-img-top"
          alt="iPad"
        />
        <div className="card-body">
          <h5 className="card-title">iPad</h5>
          <p className="card-text">
            This card has supporting text below as a natural lead-in to additional content.
          </p>
          <p className="card-text">
            <small className="text-body-secondary">Last updated 3 mins ago</small>
          </p>
        </div>
      </div>
      
      {/* Apple Watch Card */}
      <div className="card order-3 shadow">
        <img
          src="https://ee.co.uk/medias/apple-watch-se-2023-40mm-midnight-sm-desktop1-WebP-Format-488?context=bWFzdGVyfHJvb3R8OTA4OHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oYzMvaGU5LzEwMDc3Nzg0Mzc1MzI2L2FwcGxlLXdhdGNoLXNlLTIwMjMtNDBtbS1taWRuaWdodC1zbS1kZXNrdG9wMV9XZWJQLUZvcm1hdC00ODh8MzFmNGVjMmQwYzI0NTIxODI1OGQ1Y2FjYjRkYmEyNzYwODgyNTliMWNkZDA4ZjRmZmM4ZTU4NzE4MWQ2ZWFhYg"
          className="card-img-top"
          alt="Apple Watch"
        />
        <div className="card-body">
          <h5 className="card-title">Apple Watch</h5>
          <p className="card-text">
            This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.
          </p>
          <p className="card-text">
            <small className="text-body-secondary">Last updated 3 mins ago</small>
          </p>
        </div>
      </div>
    </div>

              
            {/* <div className='device-container'> */}
              {/* <div>
                  <a className="">
                    iPhone
                    <img className='device-image' src='https://ee.co.uk/medias/iphone-13-5g-pink-desktop-detail-1-WebP-Format-488?context=bWFzdGVyfHJvb3R8ODIyMHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oODUvaGVhLzk4ODg4ODYyNTk3NDIvaXBob25lLTEzLTVnLXBpbmstZGVza3RvcC1kZXRhaWwtMV9XZWJQLUZvcm1hdC00ODh8YmQ5NmZmZTQyMjgwNmE3NTE3ZTczMzQ4ZmEzMWE1YTcxZTYzNjk5N2FiNTljNmZkYmVlZWQ3NmI5YjViZWFkNw'></img>
                  </a>
              </div>
              <div>
                  <a className="">
                    iPad
                    <img className='device-image' src='https://econtent.o2.co.uk/o/econtent/media/get/e120bb0d-ec2e-4507-bdef-2d3d60698a64'></img>
                  </a>
              </div>
              <div>
                  <a className="">
                    Apple Watch
                    <img className='device-image' src='https://ee.co.uk/medias/apple-watch-se-2023-40mm-midnight-sm-desktop1-WebP-Format-488?context=bWFzdGVyfHJvb3R8OTA4OHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oYzMvaGU5LzEwMDc3Nzg0Mzc1MzI2L2FwcGxlLXdhdGNoLXNlLTIwMjMtNDBtbS1taWRuaWdodC1zbS1kZXNrdG9wMV9XZWJQLUZvcm1hdC00ODh8MzFmNGVjMmQwYzI0NTIxODI1OGQ1Y2FjYjRkYmEyNzYwODgyNTliMWNkZDA4ZjRmZmM4ZTU4NzE4MWQ2ZWFhYg'></img>
                  </a>
              </div>
            </div> */}

            </div>
    
  );
}




function App() {


  return (

    
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
        <Route index element={<HomePage />} />
        <Route path="/details/:itemModel" element={<DetailsPage />} />
        <Route path="/phonePage" element={<PhonePage />} />
        <Route path='/shipping-details' element = {<ShippingDetailsPage />} />
        </Route>
        <Route  path='/adminlogin' element={<AdminLogin/>} />
        <Route  path='/adminpage' element={<AdminPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
