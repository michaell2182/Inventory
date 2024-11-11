import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/inventory';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

declare module '@supabase/supabase-js' {
  interface User {
    tier?: 'basic' | 'premium' | 'enterprise';
  }
}

const BASIC_TIER_MAX_PRODUCTS = 50;    // Maximum number of products for basic tier
const PREMIUM_TIER_MAX_PRODUCTS = 150;  // Maximum number of products for premium tier
const ENTERPRISE_TIER_MAX_PRODUCTS = Infinity; // No limit for enterprise tier

type State = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: State = {
  products: [],
  isLoading: false,
  error: null,
};

const inventoryReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

type InventoryContextType = {
  products: Product[];
  state: State;
  addProduct: (product: Omit<Product, 'id' | 'user_id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session?.user?.id]);

  const fetchProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      dispatch({ type: 'SET_PRODUCTS', payload: data || [] });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'user_id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Determine the maximum products based on user tier
      const maxProducts = (() => {
        switch (session?.user?.tier) {
          case 'basic': return BASIC_TIER_MAX_PRODUCTS;
          case 'premium': return PREMIUM_TIER_MAX_PRODUCTS;
          case 'enterprise': return ENTERPRISE_TIER_MAX_PRODUCTS;
          default: return BASIC_TIER_MAX_PRODUCTS; // fallback to basic tier
        }
      })();

      // Fetch the current count of products in the database
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('user_id', session?.user?.id);

      if (countError) throw countError;

      // Check if the user has reached the maximum number of products
      if (count !== null && count >= maxProducts) {
        const tierName = session?.user?.tier || 'basic';
        throw new Error(
          `You have reached the maximum limit of ${maxProducts} products for your ${tierName} tier. ` +
          `Please upgrade your plan to add more products.`
        );
      }

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            ...product,
            user_id: session?.user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_PRODUCT', payload: data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', session?.user?.id)
        .select()
        .single();

      if (error) throw error;
      
      dispatch({ type: 'UPDATE_PRODUCT', payload: data });
      checkLowStock(data);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkLowStock = async (product: Product) => {
    if (
      product.reorder_point && 
      product.quantity <= product.reorder_point && 
      product.quantity > 0
    ) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Low Stock Alert',
          body: `${product.title} has ${product.quantity} items remaining (threshold: ${product.reorder_point})`,
          data: { productId: product.id },
        },
        trigger: null, // null means show immediately
      });
    }
  };

  useEffect(() => {
    state.products.forEach(product => {
      checkLowStock(product);
    });
  }, [state.products]);

  return (
    <InventoryContext.Provider value={{
      products: state.products,
      state,
      addProduct,
      updateProduct,
      deleteProduct,
      fetchProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}