import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CustomFormula } from '../../domain/entities';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, customFormula?: CustomFormula) => void;
    updateCartQuantity: (itemKey: string, quantity: number) => void;
    removeFromCart: (itemKey: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to generate a unique key for a cart item
const getItemKey = (item: CartItem): string => {
    return item.customFormula
        ? `${item.product.id}-${item.customFormula.id}`
        : item.product.id;
};

// Helper to generate a key for a product + optional formula
const getLookupKey = (productId: string, customFormulaId?: string): string => {
    return customFormulaId ? `${productId}-${customFormulaId}` : productId;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity: number = 1, customFormula?: CustomFormula) => {
        setCartItems(prevItems => {
            const lookKey = getLookupKey(product.id, customFormula?.id);
            const existingItem = prevItems.find(item => getItemKey(item) === lookKey);

            if (existingItem) {
                return prevItems.map(item =>
                    getItemKey(item) === lookKey
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { product, quantity, customFormula }];
        });
    };

    const updateCartQuantity = (itemKey: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemKey);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                getItemKey(item) === itemKey ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (itemKey: string) => {
        setCartItems(prevItems => prevItems.filter(item => getItemKey(item) !== itemKey));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateCartQuantity,
                removeFromCart,
                clearCart,
                cartCount,
                cartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
