// src/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '@/interfaces';

export interface CartItem extends IProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const CART_STORAGE_KEY = 'fatsprinkle_cart';

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isHydrated: false,
};

// Utility functions
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return {
        ...parsedCart,
        isHydrated: true,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return initialState;
};

const saveCartToStorage = (state: CartState): void => {
  try {
    const { isHydrated, ...cartToSave } = state;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { 
    totalItems, 
    totalPrice: Math.round(totalPrice * 100) / 100 // Round to 2 decimal places
  };
};

const updateCartState = (state: CartState): void => {
  const totals = calculateTotals(state.items);
  state.totalItems = totals.totalItems;
  state.totalPrice = totals.totalPrice;
  saveCartToStorage(state);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      const savedState = loadCartFromStorage();
      state.items = savedState.items;
      state.totalItems = savedState.totalItems;
      state.totalPrice = savedState.totalPrice;
      state.isHydrated = true;
    },

    addToCart: (state, action: PayloadAction<IProduct>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      updateCartState(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      const existingItem = state.items.find(item => item.id === action.payload);
      
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter(item => item.id !== action.payload);
        }
      }
      
      updateCartState(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        const existingItem = state.items.find(item => item.id === id);
        if (existingItem) {
          existingItem.quantity = quantity;
        }
      }
      
      updateCartState(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveCartToStorage(state);
    },
  },
});

export const { 
  initializeCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} = cartSlice.actions;

// Selectors
export const getItemQuantity = (state: { cart: CartState }, productId: string): number => {
  const item = state.cart.items.find(item => item.id === productId);
  return item?.quantity ?? 0;
};

export default cartSlice.reducer;