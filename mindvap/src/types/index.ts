export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  shortDescription: string;
  herbs: string[];
  temperature: string;
  inStock: boolean;
  stockLevel: number;
  rating: number;
  reviews: number;
  description: string;
  benefits: string[];
  usage: string;
  safety: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AgeVerification {
  verified: boolean;
  timestamp?: number;
}
