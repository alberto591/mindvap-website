export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  weight?: number;
}

export interface PriceCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export class CalculationService {
  private static readonly FREE_SHIPPING_THRESHOLD = 50.0;
  private static readonly STANDARD_SHIPPING_RATE = 5.99;
  private static readonly EUROPEAN_SHIPPING_RATE = 12.99;
  private static readonly EUROPEAN_FREE_SHIPPING_THRESHOLD = 75.0;
  private static readonly TAX_RATE = 0.08; // 8% tax rate for US
  
  // European VAT rates by country
  private static readonly EUROPEAN_VAT_RATES: Record<string, number> = {
    'DE': 0.19, // Germany - 19%
    'FR': 0.20, // France - 20%
    'ES': 0.21, // Spain - 21%
    'IT': 0.22, // Italy - 22%
    'NL': 0.21, // Netherlands - 21%
    'BE': 0.21, // Belgium - 21%
    'AT': 0.20, // Austria - 20%
    'CH': 0.077, // Switzerland - 7.7%
    'SE': 0.25, // Sweden - 25%
    'NO': 0.25, // Norway - 25%
    'DK': 0.25, // Denmark - 25%
    'FI': 0.24, // Finland - 24%
    'GB': 0.20, // United Kingdom - 20%
    'PL': 0.23, // Poland - 23%
    'PT': 0.23, // Portugal - 23%
    'IE': 0.23, // Ireland - 23%
  };

  /**
   * Calculate shipping cost based on address and order value
   */
  static calculateShipping(subtotal: number, shippingAddress: ShippingAddress): number {
    const isEuropeanCountry = this.EUROPEAN_VAT_RATES.hasOwnProperty(shippingAddress.country);
    
    if (isEuropeanCountry) {
      // European shipping rates
      if (subtotal >= this.EUROPEAN_FREE_SHIPPING_THRESHOLD) {
        return 0;
      }
      return this.EUROPEAN_SHIPPING_RATE;
    } else {
      // US shipping rates
      if (subtotal >= this.FREE_SHIPPING_THRESHOLD) {
        return 0;
      }
      return this.STANDARD_SHIPPING_RATE;
    }
  }

  /**
   * Calculate tax based on shipping address and subtotal
   */
  static calculateTax(subtotal: number, shippingAddress: ShippingAddress): number {
    // Check if it's a European country with VAT
    const vatRate = this.EUROPEAN_VAT_RATES[shippingAddress.country];
    
    if (vatRate !== undefined) {
      // Apply European VAT rate
      return subtotal * vatRate;
    } else {
      // Use US tax rate for non-European countries
      return subtotal * this.TAX_RATE;
    }
  }

  /**
   * Get currency for the shipping address
   */
  static getCurrency(shippingAddress: ShippingAddress): string {
    const currencyMap: Record<string, string> = {
      'DE': 'EUR', 'FR': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'NL': 'EUR', 'BE': 'EUR',
      'AT': 'EUR', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'FI': 'EUR',
      'GB': 'GBP', 'PL': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'US': 'USD'
    };
    return currencyMap[shippingAddress.country] || 'EUR';
  }

  /**
   * Calculate total price including shipping and tax
   */
  static calculateTotals(
    cartItems: CartItem[], 
    shippingAddress: ShippingAddress
  ): PriceCalculation {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = this.calculateShipping(subtotal, shippingAddress);
    const tax = this.calculateTax(subtotal, shippingAddress);
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total
    };
  }

  /**
   * Estimate delivery date based on shipping address
   */
  static estimateDeliveryDate(shippingAddress: ShippingAddress): Date {
    const now = new Date();
    const isEuropeanCountry = this.EUROPEAN_VAT_RATES.hasOwnProperty(shippingAddress.country);
    
    let deliveryDays = 5; // Default 5 days
    
    if (isEuropeanCountry) {
      deliveryDays = 3; // European shipping is faster
    }
    
    const estimatedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
    return estimatedDate;
  }

  /**
   * Validate shipping address completeness
   */
  static validateShippingAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.firstName?.trim()) errors.push('First name is required');
    if (!address.lastName?.trim()) errors.push('Last name is required');
    if (!address.address?.trim()) errors.push('Street address is required');
    if (!address.city?.trim()) errors.push('City is required');
    if (!address.state?.trim()) errors.push('State/Region is required');
    if (!address.zipCode?.trim()) errors.push('Postal code is required');
    if (!address.country?.trim()) errors.push('Country is required');

    // Validate postal code format based on country
    if (address.zipCode && address.country) {
      const isEuropeanCountry = this.EUROPEAN_VAT_RATES.hasOwnProperty(address.country);
      
      if (isEuropeanCountry) {
        // European postal codes (4-6 digits, some with spaces)
        const europeanPostalRegex = /^[\d\s]{4,6}$/;
        if (!europeanPostalRegex.test(address.zipCode.trim())) {
          errors.push('Postal code must be 4-6 digits');
        }
      } else {
        // US ZIP codes (5 digits or 5+4 format)
        if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
          errors.push('ZIP code must be in format 12345 or 12345-6789');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}