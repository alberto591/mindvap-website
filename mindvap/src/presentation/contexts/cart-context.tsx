import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../../domain/entities';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

    const addToCart = (product: Product, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { product, quantity }];
        });
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
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
