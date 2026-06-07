"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // Unique id for cart entry (e.g., `${scheduleId}-${seats.join(',')}`)
  scheduleId: number;
  routeName: string;
  departureTime: string;
  price: number; // Price per seat
  seats: number[];
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("kkbus_cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error("Failed to load cart from localStorage:", err);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("kkbus_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    const id = `${newItem.scheduleId}-${newItem.seats.sort((a,b)=>a-b).join(",")}`;
    setCartItems((prev) => {
      // Avoid duplicate items with the exact same schedule and seats
      const exists = prev.some((item) => item.id === id);
      if (exists) return prev;
      return [...prev, { ...newItem, id }];
    });
    setCartOpen(true); // Automatically open the cart drawer when adding an item
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
