import React, { createContext, useContext, useState } from 'react';
import { mockCurrentUser } from '../lib/mockData';



const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(mockCurrentUser);
  const [wishlist, setWishlist] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

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