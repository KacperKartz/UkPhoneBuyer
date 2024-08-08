import React, { useEffect, useState, useContext  } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './value.css'
import './DetailsPage.js'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { AppContext } from './AppContext';



function DetailsPage() {
  let { itemModel } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const { setDeviceInfo } = useContext(AppContext);
  const [shippingOption, setShippingOption] = useState("");
 // const []

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')

  console.log()
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_API}/phones`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Find the item details when data or itemModel changes
  useEffect(() => {
    if (data.length > 0) {
      const item = data.find(item => item.model === itemModel);
      setItemDetails(item);
    }
  }, [data, itemModel]);
  
  if (!itemDetails) {
    return <div>Loading...</div>;
  }
  
  const getConditionText = () => {
    switch (condition) {
      case 'poor':
        return [
          "System software, home button, Touch ID, Face ID, and NFC may malfunction.",
          "Physical damage to the screen or housing including damaged pixels, pressure marks, discoloration, or cracks.",
          "Signs of water damage.",
          "Missing parts, including styluses.",
          "Battery health is less than 70%.",
          "Dust under the screen and/or on the camera lens."
        ];
      case 'fair':
        return ['The item is in average condition.'];
      case 'good':
        return ['The item is in great condition.'];
      case 'excellent':
        return ['The item is new (sealed/unactivated).'];
      default:
        return ['Please select a condition.'];
    }
  };
  
  
  
  const handleSubmit = async (e) =>{
    e.preventDefault();
    setLoading(true);

      try{
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_API}/estimate-value`,{
          phoneModel: itemDetails.model,
          condition,
          storage
        });
        setTimeout(() =>{
          setEstimatedValue(response.data.estimatedValue);
          setLoading(false);
          setDeviceInfo({phoneModel: itemDetails.model,storage,condition, estimatedValue: response.data.estimatedValue,serialNumber})
        }, 2000)
      }catch(error){
        console.error(error);
        setLoading(false);
      }
    }

    const handleCheckboxChange = () => {
      setIsChecked(!isChecked);
    };
    const handleInputChange = (event) => {
      setSerialNumber(event.target.value);
    };

    const handleProceed =() =>{
      console.log("Proceed")
      navigate("/shipping-details");
    };

  return (
      <div className="container row p-4  pt-lg-5 align-items-center rounded-3 border shadow-lg">
        <div className="header">
          <h1>Device Value Estimation</h1>
          <p>Tell us more about your device below</p>
        </div>
        
        <div className="device-details p-4 p-md-5 border rounded-3 bg-body-tertiary">
          <h3>Device Model:</h3>
          <h5>{itemDetails.model}</h5>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="storage" className='fw-bold'>Storage</label>
            <select
            id="storage"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
            required
          >
            <option value="" disabled>Select storage</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
          </select>
          </div>

          <div className="form-group">
          <label htmlFor="condition" className='fw-bold'>Condition:</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="" disabled>Select condition</option>
            <option value="poor" >Broken</option>
            <option value="fair">Average condition</option>
            <option value="good">Great condition</option>
            <option value="excellent">New (Sealed/Unactivated)</option>
          </select>
          <div className="mt-3">
          <ul>
          {getConditionText().map((text, index) => (
            <li key={index}>
              {text}
            </li>
          ))}
        </ul>
          </div>
          <div>
            <label className="form-check-label fw-bold" htmlFor="defaultCheck1">
              Do you have a serial code?
           </label>
            <input className="form-check-input" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} id="defaultCheck1"/>
          </div>
          {isChecked && (
        <div>
          <input
            type="text"
            value={serialNumber}
            onChange={handleInputChange}
            maxLength={"20"}
            placeholder="Type here..."
          />
        </div>
      )}
      <div className='shipOption'>
        
      <input type="radio" className="btn-check" name="options" id="option1" autoComplete="off" />
      <label className="btn btn-outline-primary opBtn" htmlFor="option1">Post it yourself</label>
      <input type="radio" className="btn-check" name="options" id="option2" autoComplete="off"/>
      <label className="btn btn-outline-primary opBtn" htmlFor="option2">Print shipping label</label>
      </div>

        </div>
        <div>
          {loading ?(
            <LinearProgress className="progress-bar"/>
          ):(

            <button className='button-submit' type='submit'>Estimate Value</button>
          )}
        </div>

        
        </form>
        {estimatedValue && !loading &&(
        <div className="device-details-2 p-4 p-md-5 border rounded-3">
          <h3>
            We will pay you up to: £{estimatedValue}
          </h3>
          <button className='button-submit' onClick={() => handleProceed()} >Proceed</button>
        </div>

        )}
      </div>
    );
  }
  export default DetailsPage;