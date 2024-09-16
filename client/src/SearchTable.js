import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import './SearchTable.css'; // Ensure you have appropriate styling

const SearchTable = ({ data, onSearchChange, onSelect }) => {
  const [search, setSearch] = useState('');
  const [showTable, setShowTable] = useState(true);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (onSearchChange) {
      onSearchChange(value); 
    }

  };

  const filteredData = data.filter((item) => {
    const searchLowerCase = search.toLowerCase();
    const modelLowerCase = item.model.toLowerCase();
    const brandLowerCase = item.brand.toLowerCase();
    return searchLowerCase === ''
      ? true
      : modelLowerCase.includes(searchLowerCase) || brandLowerCase.includes(searchLowerCase);
  });

  return (
    <div>
    
      <div className="search-bar search-bar-extra">
        <input
          type="text"
          className="search-input"
          placeholder="Enter your device, e.g. 'iPhone 13'"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {showTable && (
        <Table striped bordered hover className="shadow specialTable">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Model</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.brand}</td>
                  <td>{item.model}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => onSelect(item.model)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No results found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      </div>
  )};

export default SearchTable;
