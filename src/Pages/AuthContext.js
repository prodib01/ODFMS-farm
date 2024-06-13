import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a new context for authentication
const AuthContext = createContext();

// Custom hook to access authentication context values
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to manage authentication state
export const AuthProvider = ({ children }) => {
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, set isLoggedIn to true
      setIsLoggedIn(true);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
