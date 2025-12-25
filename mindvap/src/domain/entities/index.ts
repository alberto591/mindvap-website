export interface Product {
  id: string;
  name: {
    en: string;
    es: string;
    it: string;
  };
  price: number;
  category: {
    en: string;
    es: string;
    it: string;
  };
  image: string;
  shortDescription: {
    en: string;
    es: string;
    it: string;
  };
  herbs: string[];
  temperature: string;
  inStock: boolean;
  stockLevel: number;
  rating: number;
  reviews: number;
  description: {
    en: string;
    es: string;
    it: string;
  };
  benefits: {
    en: string[];
    es: string[];
    it: string[];
  };
  usage: {
    en: string;
    es: string;
    it: string;
  };
  safety: {
    en: string;
    es: string;
    it: string;
  };
  isCustomizable?: boolean;
}

export interface FormulaIngredient {
  name: string;
  percentage: number;
  reason?: string;
}

export interface CustomFormula {
  id: string;
  name: string;
  goal: string;
  ingredients: FormulaIngredient[];
  instructions: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customFormula?: CustomFormula;
}

export interface AgeVerification {
  verified: boolean;
  timestamp?: number;
}
