import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState();
  const [userInfo, setUserInfo] = useState({});
  const [totalCost, setTotalCost] = useState({});

  return (
    <AppContext.Provider value={{ deviceInfo, setDeviceInfo, userInfo, setUserInfo, totalCost,setTotalCost }}>
      {children}
    </AppContext.Provider>
  );
};