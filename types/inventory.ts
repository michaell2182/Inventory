export type Product = {
    id: string;
    user_id: string;
    title: string;
    price: number;
    quantity: number;
    image_url?: string;
    category?: string;
    sku?: string;
    reorder_point?: number;
    created_at?: string;
};

export interface InventoryState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
} 