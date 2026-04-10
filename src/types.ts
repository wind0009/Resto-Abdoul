
export type MenuCategory =
  | 'Grillades'
  | 'Burgers'
  | 'Pizzas'
  | 'Salades'
  | 'Boissons'
  | 'Plats'
  | 'Accompagnements'
  | 'Sandwichs'
  | 'Fast Food'
  | 'Terrasse';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceString: string;
  category: MenuCategory;
  image: string;
  popular?: boolean;
  prepTime?: number; // en minutes
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type ExperienceSpace = 'Fast Food' | 'Terrasse';

export interface OrderData {
  cart: CartItem[];
  name: string;
  phone: string;
  address?: string;
  mode: string;
  eta: string;
  total: number;
  restaurantPrice: number;
  commission: number;
  grandTotal: number;
  /** Espace choisi par le client (commande / ticket / WhatsApp) */
  experienceSpace: ExperienceSpace;
}
