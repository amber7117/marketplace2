import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product, Offer } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, offer: Offer, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getItemCount: (slug: string, offerId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, offer, quantity) => {
        const existing = get().items.find(
          (item) => item.slug === product.slug && item.offerId === offer.id
        );

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.lineId === existing.lineId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            lineId: uuidv4(),
            slug: product.slug,
            offerId: offer.id,
            quantity,
            addedAt: new Date().toISOString(),
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemCount: (slug, offerId) => {
        const item = get().items.find((i) => i.slug === slug && i.offerId === offerId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
