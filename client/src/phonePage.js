import React, { useEffect, useState } from 'react';
import './catalogue.css';
import { useNavigate } from 'react-router-dom';
import PhoneGrid from './PhoneGrid';



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

    const handleGoBack = () => {
        try{
            navigate(-1);
        }catch{
            navigate("/")
        }
    }

    return (
        <div className="maindiv">
            <h1 className="heading catalogue">Phone Catalog</h1>
            <div className="holder">
                <div className='sort-buttons-container'>
                <button className='btn backButton sort-button' onClick={handleGoBack}>
                    Go Back
                 </button>
                    <button 
                        onClick={() => handleSort('asc')}
                        className={`btn sort-button ${sortDirection === 'asc' ? 'active' : ''}`}
                    >
                        Sort Year ↑
                    </button>
                    <button 
                        onClick={() => handleSort('desc')}
                        className={`btn sort-button ${sortDirection === 'desc' ? 'active' : ''}`}
                    >
                        Sort Year ↓
                    </button>
                </div>
                <PhoneGrid data={data} isSliding={false} />
            </div>
        </div>
    );
};

export default PhonePage;
