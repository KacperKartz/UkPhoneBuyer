import React, { useEffect, useState } from 'react';
import './catalogue.css';
import { useNavigate } from 'react-router-dom';

const PhoneCard = ({ phone, navigate }) => {
    let phoneimg = `/phones/${phone.url}`;
    const handleButtonClick = () => {
        console.log("clicked", phone.model);
        navigate(`/details/${phone.model}`);
    };

    return (
        <div className="card shadow" onClick={handleButtonClick}>
            <img src={phoneimg} alt={phone.name} className="card-image" />
            <h3 className="card-title">{phone.model}</h3>
        </div>
    );
};

const PhonePage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [sortDirection, setSortDirection] = useState(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_API}/phones`)
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleSort = (direction) => {
        setSortDirection(direction);

        const sortedData = [...data].sort((a, b) => {
            if (direction === 'asc') {
                return a.release_year - b.release_year;
            } else if (direction === 'desc') {
                return b.release_year - a.release_year;
            } else {
                return 0;
            }
        });

        setData(sortedData);
        console.log(`Sorted by release year: ${direction}`);
    };

    return (
        <div className="maindiv">
            <h1 className="heading catalogue">Phone Catalog</h1>
            <div className="holder">
                <div className='sort-buttons-container'>
                    <button 
                        onClick={() => handleSort('asc')}
                        className={`sort-button ${sortDirection === 'asc' ? 'active' : ''}`}
                    >
                        Sort Year ↑
                    </button>
                    <button 
                        onClick={() => handleSort('desc')}
                        className={`sort-button ${sortDirection === 'desc' ? 'active' : ''}`}
                    >
                        Sort Year ↓
                    </button>
                </div>
                <div className="phone-grid shadow">
                    {data.map((phone) => (
                        <PhoneCard key={phone.id} phone={phone} navigate={navigate} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhonePage;
