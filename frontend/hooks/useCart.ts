'use client';

import { useState, useEffect } from 'react';
import { CartItem, Product, Offer } from '@/lib/types';

interface AddToCartParams {
  product: Product;
  offer: Offer;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = ({ product, offer, quantity }: AddToCartParams) => {
    const lineId = `${product.slug}-${offer.id}`;
    const existingItem = items.find(item => item.lineId === lineId);

    if (existingItem) {
      setItems(items.map(item => 
        item.lineId === lineId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const { offers, ...productWithoutOffers } = product;
      const newItem: CartItem = {
        lineId,
        slug: product.slug,
        offerId: offer.id,
        quantity,
        product: productWithoutOffers,
        offer,
      };
      setItems([...items, newItem]);
    }
  };

  const removeFromCart = (lineId: string) => {
    setItems(items.filter(item => item.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setItems(items.map(item => 
      item.lineId === lineId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };
}
