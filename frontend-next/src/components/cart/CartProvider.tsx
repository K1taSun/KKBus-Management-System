"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface CartTicket {
  id: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  duration: string;
  route: string;
  passengers: string;
  price: string;
}

interface CartContextValue {
  items: CartTicket[];
  isOpen: boolean;
  addTicket: (ticket: CartTicket) => void;
  removeTicket: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const getPriceValue = (price: string) => Number(price.replace(/\D/g, "")) || 0;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartTicket[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + getPriceValue(item.price), 0);
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    total,
    addTicket: (ticket) => {
      setItems((current) => [ticket, ...current.filter((item) => item.id !== ticket.id)]);
      setIsOpen(true);
    },
    removeTicket: (id) => {
      setItems((current) => current.filter((item) => item.id !== id));
    },
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [items, isOpen, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart musi być użyty wewnątrz CartProvider");
  }

  return context;
}
