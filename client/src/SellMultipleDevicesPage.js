import React, { useState, useEffect, useContext } from 'react';
import SearchTable from './SearchTable';
import Modal from 'react-modal';
import axios from 'axios';
import './SellMultipleDevicesPage.css';
import { AppContext } from './AppContext';
import {  useNavigate } from 'react-router-dom';

const SellMultipleDevicesPage = () => {
  const [data, setData] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deviceToAdd, setDeviceToAdd] = useState(null);
  const [deviceQuantity, setDeviceQuantity] = useState(1);
  const {setDeviceInfo} = useContext(AppContext);
  const {setTotalCost} = useContext(AppContext);

  const navigate = useNavigate();
  


  // New states for additional attributes
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  useEffect(() => {
    // Fetch data for the table
    axios
      .get(`${process.env.REACT_APP_BACKEND_API}/phones`)
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const openModal = (device) => {
    setDeviceToAdd(device);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setDeviceToAdd(null);
    setDeviceQuantity(1); // Reset quantity after closing modal
    setStorage("");        // Reset storage
    setCondition("");      // Reset condition-
    setSerialNumber("");   // Reset serial number
  };

  const handleSelectDevice = (model) => {
    // Find the selected device in the data
    const device = data.find(item => item.model === model);
    if (device) {
      openModal(device);  // Open modal to input quantity and other attributes
    }
  };

  const handleAddDevice = async () => {
    // Ensure storage and condition are selected
    if (!storage || !condition) {
      alert('Please select both storage and condition before adding the device.');
      return;
    }

    if (deviceQuantity < 1){
      alert("Quantity must be at least 1")
      return;
    }
  
    try {

  
      const response = await axios.post(`http://localhost:5000/estimate-value`, {
        phoneModel: deviceToAdd.model,
        condition,
        storage
      });
      // Extract the estimated value from the response
      const estimatedValue = parseFloat(response.data.estimatedValue);
  
      // Update selected devices state with the estimated value
      setSelectedDevices((prev) => {
        const existingDeviceIndex = prev.findIndex((d) => d.model === deviceToAdd.model);
        const newDevice = {
          ...deviceToAdd,
          quantity: deviceQuantity,
          storage,
          condition,
          serialNumber: serialNumber || null, // Include serialNumber if provided
          estimatedValue // Add the estimated value
        };
  
        if (existingDeviceIndex > -1) {
          // Update device quantity and details if it already exists
          const updatedDevices = [...prev];
          updatedDevices[existingDeviceIndex] = {
            ...updatedDevices[existingDeviceIndex],
            quantity: updatedDevices[existingDeviceIndex].quantity + deviceQuantity,
            storage,
            condition,
            serialNumber: serialNumber || null,
            estimatedValue // Update the estimated value
          };
          return updatedDevices;
        } else {
          // Add new device with quantity and details
          return [...prev, newDevice];
        }
      });
  
      closeModal(); // Close the modal after adding the device
  
    } catch (error) {
      console.error('Error estimating device value:', error);
      alert('Failed to estimate device value. Please try again.');
    }
  };
  

  const handleRemoveDevice = (model) => {
    // Remove the selected device from the list
    setSelectedDevices(prev => prev.filter(device => device.model !== model));
  };
  

  const getTotalCost = () => {
    return selectedDevices.reduce((total, device) => {
      return total + (device.estimatedValue * device.quantity);
    }, 0).toFixed(2);
  };



  const handleSubmit = async () => {
    
    console.log(selectedDevices);
    setDeviceInfo(selectedDevices);
    setTotalCost(getTotalCost());
    
    navigate("/shipping-details");
  
  };

  return (
    <div className="sell-multiple-devices-page">
      <h1>Sell Your Devices</h1>
      <div>
        <SearchTable
          data={data}
          onSelect={handleSelectDevice}
        />
      </div>

      {selectedDevices.length > 0 && (
        <div className="multiple-selected-devices">
          <h3>Selected Devices</h3>
          <ul>
            {selectedDevices.map((device) => (
              <li key={device.model}>
                <span className='multiple-span'>{device.brand} - {device.model} (x{device.quantity}) - {device.storage} - {device.condition} - £{device.estimatedValue}</span>
                {device.serialNumber && <span className='multiple-span'> - SN: {device.serialNumber}</span>}
                <button className="btn btn-danger btn-sm btn-mutiple-remove" onClick={() => handleRemoveDevice(device.model)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div>
          <h3 className='total-value'>Total Estimated Value: £{getTotalCost()}</h3>
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Devices
          </button>
        </div>
      )}

      {/* Modal for selecting device details */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Select Device Details"
        className="device-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Select Details for {deviceToAdd?.brand} - {deviceToAdd?.model}</h2>

        {/* Quantity Input */}
        <label>
          Quantity:
          <input
            type="number"
            value={deviceQuantity}
            onChange={(e) => setDeviceQuantity(parseInt(e.target.value, 10))}
            min="1"
          />
        </label>

        {/* Storage Selection */}
        <label>
          Storage:
          <select
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
        </label>

        {/* Condition Selection */}
        <label>
          Condition:
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="" disabled>Select condition</option>
            <option value="poor">Broken</option>
            <option value="fair">Average condition</option>
            <option value="good">Great condition</option>
            <option value="excellent">New (Sealed/Unactivated)</option>
          </select>
        </label>

        {/* Serial Number Input */}
        <label>
          Serial Number (optional):
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            maxLength="20"
            placeholder="Enter serial number"
          />
        </label>

        <div className="modal-actions">
          <button onClick={handleAddDevice} className="btn btn-success">Add Device</button>
          <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default SellMultipleDevicesPage;
