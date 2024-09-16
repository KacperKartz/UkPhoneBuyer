import React, { useState, useEffect } from 'react';
import SearchTable from './SearchTable';
import Modal from 'react-modal';
import axios from 'axios';
import './SellMultipleDevicesPage.css';

const SellMultipleDevicesPage = () => {
  const [data, setData] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deviceToAdd, setDeviceToAdd] = useState(null);
  const [deviceQuantity, setDeviceQuantity] = useState(1);

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
    setCondition("");      // Reset condition
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
  

  
      // Update selected devices state
      setSelectedDevices((prev) => {
        const existingDeviceIndex = prev.findIndex((d) => d.model === deviceToAdd.model);
        const newDevice = {
          ...deviceToAdd,
          quantity: deviceQuantity,
          storage,
          condition,
          serialNumber: serialNumber || null, // Include serialNumber if provided
        };
  
        if (existingDeviceIndex > -1) {
          // Update device quantity and details if it already exists
          const updatedDevices = [...prev];
          updatedDevices[existingDeviceIndex] = {
            ...updatedDevices[existingDeviceIndex],
            quantity: updatedDevices[existingDeviceIndex].quantity + deviceQuantity,
            storage,
            condition,
            serialNumber: serialNumber || null
          };
          return updatedDevices;
        } else {
          // Add new device with quantity and details
          return [...prev, newDevice];
        }
      });
  
      closeModal(); // Close the modal after adding the device
  };
  

  const handleRemoveDevice = (model) => {
    // Remove the selected device from the list
    setSelectedDevices(prev => prev.filter(device => device.model !== model));
  };

  const handleSubmit = async () => {
    
    console.log(selectedDevices);
    try {
      // Send the selected devices data to the backend
      await axios.post(`http://localhost:5000/sell-multiple-devices`, {
        devices: selectedDevices
      });
      alert('Devices submitted successfully!');
      // Reset the selection after submission
      setSelectedDevices([]);
    } catch (error) {
      console.error('Error submitting devices:', error);
      alert('Failed to submit devices.');
    }
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
        <div className="selected-devices">
          <h3>Selected Devices</h3>
          <ul>
            {selectedDevices.map((device) => (
              <li key={device.model}>
                <span>{device.brand} - {device.model} (x{device.quantity}) - {device.storage} - {device.condition}</span>
                {device.serialNumber && <span> - SN: {device.serialNumber}</span>}
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveDevice(device.model)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
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
