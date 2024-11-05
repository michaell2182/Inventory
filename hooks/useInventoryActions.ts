import { useInventory } from '../store/InventoryContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types/inventory';

export const useInventoryActions = () => {
    const { dispatch } = useInventory();

    const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;

            dispatch({ type: 'ADD_PRODUCT', payload: data });
            return data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            dispatch({ type: 'UPDATE_PRODUCT', payload: data });
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            dispatch({ type: 'DELETE_PRODUCT', payload: id });
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    return {
        addProduct,
        updateProduct,
        deleteProduct,
    };
}; 