// src/interfaces/product.ts
export interface IProduct {
  id: string; // Stripe uses string IDs
  name: string;
  description: string;
  price: number; // Price in Baht (e.g., 49 for 49.00 THB)
  priceId: string; // Stripe price ID for checkout
  image: string;
  tag: string;
  images?: string[]; // Additional images from Stripe
  active?: boolean; // Whether the product is active in Stripe
}

export interface StripeProductWithPrice {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: {
    tag?: string;
    category?: string;
  };
  active: boolean;
  default_price: {
    id: string;
    unit_amount: number;
    currency: string;
  };
}