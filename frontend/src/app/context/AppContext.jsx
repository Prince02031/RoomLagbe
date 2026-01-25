import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import wishlistService from '../services/wishlist.service';

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

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  };

  // Sync state and fetch data on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    setCurrentUser(user);
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchWishlist();
    }
  }, []);

  /**
   * Login handler
   */
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      // Fetch wishlist immediately after login
      fetchWishlist();
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register handler
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
    setWishlist([]); // Clear wishlist on logout
  };

  const addToWishlist = async (listingId) => {
    if (!isAuthenticated) return;
    try {
      await wishlistService.addToWishlist(listingId);
      // Update local state by re-fetching or optimistic update
      fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (listingId) => {
    if (!isAuthenticated) return;
    try {
      await wishlistService.removeFromWishlist(listingId);
      setWishlist((prev) => prev.filter((item) => item.listing_id !== listingId && item.listingId !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (listingId) => {
    return wishlist.some((item) => item.listing_id === listingId || item.listingId === listingId);
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