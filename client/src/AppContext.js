import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});

  return (
    <AppContext.Provider value={{ deviceInfo, setDeviceInfo, userInfo, setUserInfo }}>
      {children}
    </AppContext.Provider>
  );
};