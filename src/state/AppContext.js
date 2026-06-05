import React, { createContext, useContext, useMemo, useState } from 'react';

import { createOrderFromProduct, initialOrders } from '../data/appData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [wishlist, setWishlist] = useState([1, 5]);
  const [orders, setOrders] = useState(initialOrders);
  const [styleProfile, setStyleProfile] = useState(null);
  const [notice, setNotice] = useState(null);

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const addOrder = (product) => {
    const newOrder = createOrderFromProduct(product, orders.length);
    setOrders((current) => [newOrder, ...current]);
    setNotice(`${product.name} masuk ke Tailor Track`);
    return newOrder;
  };

  const value = useMemo(
    () => ({
      wishlist,
      orders,
      styleProfile,
      notice,
      setNotice,
      toggleWishlist,
      addOrder,
      saveStyleProfile: setStyleProfile,
      resetStyleProfile: () => setStyleProfile(null)
    }),
    [wishlist, orders, styleProfile, notice]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }
  return context;
}
