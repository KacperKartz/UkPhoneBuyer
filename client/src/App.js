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
import PhoneGrid from './PhoneGrid';
import FAQ from "./FAQ.js";
import _ from 'lodash'; 
import OrderTracking from './OrderTracking.js';
import SellMultipleDevicesPage from "./SellMultipleDevicesPage.js";



function HomePage (){
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const searchBar = useRef(null);


    // Debounced search
    const debounceSearch = _.debounce((searchValue) => {
      fetch(`${process.env.REACT_APP_BACKEND_API}/phones?search=${searchValue}`)
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error('Error fetching data:', error));
    }, 300); 


    const handleSellMultiple = (e) =>{
      navigate("/sell-multiple")
    }

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
    debounceSearch(searchValue);
  };


  const handleButtonClick = (itemModel) => {
    console.log("clicked", itemModel);
    navigate(`/details/${itemModel}`);
  };


  const iPhoneClick = (e) => {
    navigate(`/PhonePage`)
  }

  const handleAlert = (e) => {
    alert("Currently unavailable")
  }



  return (
    <div className="app">
      <div className='intro-header shadow'>
        <img src='/phones/kindpng_2768230.png' className=''></img>

      <div className='container-sm py-5'>
      <button className='shadow btn btn-primary btn-lg sell-btn'
        onClick={() =>
          searchBar.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
          })
        }
      >
        Sell your device
      </button>
      <h2 className=' py-2'></h2>

      <button className='shadow btn btn-light btn-lg sell-btn' onClick={handleSellMultiple}>
        Sell multiple devices
      </button>



      </div>
      <div className='sliderContainer'>
      <PhoneGrid  data={data} isSliding={true} offsetClass={"offset-1"} />
    </div>


      <div className="title-container"  ref={tableRef}>
        <h2> </h2>
        <h1 className="text-light">Sell your Apple device today</h1>
        <p className='text-white'>Make the most out of your old device and <br></br> make some money whilst you're at it</p>
      </div>
      <div className="search-container shadow ">
        <input
          type="text"
          className="search-input"
          placeholder="Enter your device, e.g. 'iPhone 13'"
          onChange={handleSearchChange}
          ref={searchBar}
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
<div className='text-light cat-container'>
  <h2 className=' cat-h-text'>Select your Category</h2>
  <p className='cat-p'>Please select what kind of device you're trying to sell</p>
</div>
<div className='cat-div'>

      {/* iPhone Card */}
      <div className="phone-card order-1 order-lg-2 shadow" onClick={iPhoneClick}>
        <img
          src="https://ee.co.uk/medias/iphone-13-5g-pink-desktop-detail-1-WebP-Format-488?context=bWFzdGVyfHJvb3R8ODIyMHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oODUvaGVhLzk4ODg4ODYyNTk3NDIvaXBob25lLTEzLTVnLXBpbmstZGVza3RvcC1kZXRhaWwtMV9XZWJQLUZvcm1hdC00ODh8YmQ5NmZmZTQyMjgwNmE3NTE3ZTczMzQ4ZmEzMWE1YTcxZTYzNjk5N2FiNTljNmZkYmVlZWQ3NmI5YjViZWFkNw"
          className="card-img-top"
          alt="iPhone"
          />
        <div className="card-title">
          <h3 className="text-center">iPhone</h3>
        </div>
      </div>
      
      {/* iPad Card */}
      <div className="phone-card order-2 order-lg-1 shadow" onClick={handleAlert}>
        <img
          src="https://econtent.o2.co.uk/o/econtent/media/get/e120bb0d-ec2e-4507-bdef-2d3d60698a64"
          className="card-img-top"
          alt="iPad"
          />
        <div className="card-title">
          <h3 className="text-center">iPad</h3>
        </div>
      </div>
      
      {/* Apple Watch Card */}
      <div className="phone-card order-3 shadow"  onClick={handleAlert}>
        <img
          src="https://ee.co.uk/medias/apple-watch-se-2023-40mm-midnight-sm-desktop1-WebP-Format-488?context=bWFzdGVyfHJvb3R8OTA4OHxpbWFnZS93ZWJwfHN5cy1tYXN0ZXIvcm9vdC9oYzMvaGU5LzEwMDc3Nzg0Mzc1MzI2L2FwcGxlLXdhdGNoLXNlLTIwMjMtNDBtbS1taWRuaWdodC1zbS1kZXNrdG9wMV9XZWJQLUZvcm1hdC00ODh8MzFmNGVjMmQwYzI0NTIxODI1OGQ1Y2FjYjRkYmEyNzYwODgyNTliMWNkZDA4ZjRmZmM4ZTU4NzE4MWQ2ZWFhYg"
          className="card-img-top"
          alt="Apple Watch"
          />
        <div className="card-title">
          <h3 className="text-center ">Apple Watch</h3>
        </div>
      </div>
    </div>
    </div>
    <div>

    </div>

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
        <Route  path='/FAQ' element={<FAQ/>} />
        <Route path='/order-tracking' element={<OrderTracking />} />
        <Route path='/sell-multiple' element={<SellMultipleDevicesPage />} />
        </Route>
        <Route  path='/adminlogin' element={<AdminLogin/>} />
        <Route  path='/adminpage' element={<AdminPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
