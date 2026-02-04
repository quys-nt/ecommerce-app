export interface ProductVariant {
  size: string;
  color: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  status: "in_stock" | "out_of_stock";
  quantity: number;
  variants: ProductVariant[];
  mainImage: string;
  gallery: string[];
  descriptionHtml: string;
  externalLinks?: {
    youtube?: string;
    tiktok?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  mainImage: string;
}

export interface Order {
  id: number;
  user_id: string | null;
  email: string;
  total_amount: number;
  status: "pending" | "cancelled" | "paid";
  raw_cart: CartItem[];
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface MainVisual {
  id: string;
  image: string;
  link?: string;
  title?: string;
}

export interface SiteSettings {
  siteName: string;
  logoPath: string;
  mainVisuals: MainVisual[];
  showMainVisual: boolean;
  showCategories: boolean;
  showFeaturedProducts: boolean;
  contactEmail: string;
  contactInstagram: string;
  contactTiktok: string;
}
