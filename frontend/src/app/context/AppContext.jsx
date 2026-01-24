import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  // Initialize user from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authService.isAuthenticated();
  });
  const [wishlist, setWishlist] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  // Sync authentication state
  useEffect(() => {
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    setCurrentUser(user);
    setIsAuthenticated(authenticated);
  }, []);

  /**
   * Login handler
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} Login response
   */
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register handler
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration response
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const addToWishlist = (item) => {
    setWishlist((prev) => [...prev, item]);
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (listingId) => {
    return wishlist.some((item) => item.listingId === listingId);
  };

  const addSavedSearch = (search) => {
    setSavedSearches((prev) => [...prev, search]);
  };

  const removeSavedSearch = (id) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        register,
        logout,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        savedSearches,
        addSavedSearch,
        removeSavedSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}