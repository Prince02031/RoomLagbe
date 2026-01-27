import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import wishlistService from '../services/wishlist.service';
import savedSearchService from '../services/savedSearch.service';

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
    if (!authService.isAuthenticated() || authService.getCurrentUser()?.role !== 'student') {
      return;
    }
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  };

  // Fetch saved searches from backend
  const fetchSavedSearches = async () => {
    if (!authService.isAuthenticated() || authService.getCurrentUser()?.role !== 'student') {
      return;
    }
    try {
      const data = await savedSearchService.getAll();
      setSavedSearches(data);
    } catch (error) {
      console.error('Failed to sync saved searches:', error);
    }
  };

  // Sync state and fetch data on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    setCurrentUser(user);
    setIsAuthenticated(authenticated);

    if (authenticated && user?.role === 'student') {
      fetchWishlist();
      fetchSavedSearches();
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
      // Fetch wishlist and saved searches immediately after login if student
      if (response.user?.role === 'student') {
        fetchWishlist();
        fetchSavedSearches();
      }
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
    setSavedSearches([]); // Clear saved searches on logout
  };

  const addToWishlist = async (listingId) => {
    if (!isAuthenticated || currentUser?.role !== 'student') return;
    try {
      // Optimistic update would be better but let's at least ensure we refresh
      await wishlistService.addToWishlist(listingId);
      await fetchWishlist(); // Await refresh to ensure state is current
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (listingId) => {
    if (!isAuthenticated || currentUser?.role !== 'student') return;
    try {
      await wishlistService.removeFromWishlist(listingId);
      // Immediately filter locally for instant snap
      setWishlist((prev) => prev.filter((item) => item.listing_id !== listingId && item.listingId !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (listingId) => {
    return wishlist.some((item) => item.listing_id === listingId || item.listingId === listingId);
  };

  const addSavedSearch = async (search) => {
    if (!isAuthenticated || currentUser?.role !== 'student') return;
    try {
      const searchData = {
        name: search.name,
        ...search.filters,
      };
      const createdSearch = await savedSearchService.create(searchData);
      setSavedSearches((prev) => [...prev, createdSearch]);
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  };

  const removeSavedSearch = async (id) => {
    if (!isAuthenticated || currentUser?.role !== 'student') return;
    try {
      await savedSearchService.delete(id);
      setSavedSearches((prev) => prev.filter((search) => search.saved_search_id !== id && search.id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
      throw error;
    }
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