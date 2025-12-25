import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../contexts/cart-context';
import { useLanguage } from '../contexts/language-context';

export default function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart } = useCart();
  const { language } = useLanguage();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="bg-background-primary min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <ShoppingBag className="w-24 h-24 text-text-tertiary mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-text-primary">
            Your Cart is Empty
          </h1>
          <p className="text-text-secondary mb-8">
            Discover our premium herbal blends and add them to your cart.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full transition-all"
          >
            Browse Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-text-primary">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const itemKey = item.customFormula ? `${item.product.id}-${item.customFormula.id}` : item.product.id;

              return (
                <div key={itemKey} className="bg-white rounded-lg p-6 shadow-sm border border-border-light">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={item.product.image}
                      alt={item.product.name[language]}
                      loading="lazy"
                      className="w-32 h-32 object-cover rounded-lg bg-gray-50"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/product/${item.product.id}`}
                              className="font-serif text-xl text-text-primary hover:text-brand transition-colors"
                            >
                              {item.product.name[language]}
                            </Link>
                            {item.customFormula && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-light text-brand-primary px-2 py-0.5 rounded-full border border-brand-outline">
                                Custom Mix
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            {item.product.category[language]}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(itemKey)}
                          className="text-text-tertiary hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {item.customFormula ? (
                        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">AI Formulation: {item.customFormula.name}</p>
                          <ul className="text-xs space-y-1 text-text-secondary">
                            {item.customFormula.ingredients.map((ing, i) => (
                              <li key={i} className="flex justify-between">
                                <span>{ing.name} ({ing.percentage}%)</span>
                                <span className="text-[10px] text-gray-400 italic">Target: {item.customFormula?.goal}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-blue-600 mt-2 font-medium italic">
                            Instructions: {item.customFormula.instructions}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary mb-4 italic">
                          {item.product.herbs.join(', ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-brand-light transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-text-primary font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-brand-light transition-colors"
                            disabled={item.quantity >= item.product.stockLevel}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-text-primary">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-text-secondary">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl mb-6 text-text-primary">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal < 50 && shipping > 0 && (
                  <p className="text-sm text-cta">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Tax (estimated)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary text-lg">Total</span>
                    <span className="font-semibold text-text-primary text-2xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-white border-2 border-brand text-brand hover:bg-brand-light font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/shop"
                className="w-full bg-white border-2 border-brand text-brand hover:bg-brand-light font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2"
              >
                Continue Shopping
              </Link>

              {/* Trust Signals */}
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Truck className="w-5 h-5 text-brand flex-shrink-0" />
                  <span>Free shipping on orders $50+</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <RotateCcw className="w-5 h-5 text-brand flex-shrink-0" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
