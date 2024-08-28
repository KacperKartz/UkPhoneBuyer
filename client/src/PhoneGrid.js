import React, { useEffect, useState, useRef } from 'react';
import './PhoneGrid.css';
import { useNavigate } from 'react-router-dom';

const PhoneCard = ({ phone, navigate, isSliding }) => {
    const phoneimg = `/phones/${phone.url}`;
    const handleButtonClick = () => {
        console.log("clicked", phone.model);
        navigate(`/details/${phone.model}`);
    };

    return (
        <div className={`phone-card shadow ${isSliding ? "scrollanimation" : ""}`} onClick={handleButtonClick}>
            <img src={phoneimg} alt={phone.name} className="card-image" />
            <h3 className="card-title">{phone.model}</h3>
        </div>
    );
};

const PhoneGrid = ({ data, isSliding, offsetClass }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Create a duplicate of the items to achieve infinite scrolling
    const items = [...data, ...data];

    useEffect(() => {
        const container = containerRef.current;

        if (isSliding && container) {
            // Reset scroll position when animation ends to create infinite loop
            container.addEventListener('animationiteration', () => {
                container.scrollTo({ left: 0 });
            });
        }

        return () => {
            if (container) {
                container.removeEventListener('animationiteration', () => {
                    container.scrollTo({ left: 0 });
                });
            }
        };
    }, [isSliding]);

    return (
        <div ref={containerRef} className={`${isSliding ? `phone-slider ${offsetClass}` : "phone-grid"}`}>
            {items.map((phone, index) => (
                <PhoneCard key={index} phone={phone} navigate={navigate} isSliding={isSliding} />
            ))}
        </div>
    );
};

export default PhoneGrid;
