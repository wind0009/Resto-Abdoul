
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceString: string;
  category: 'Grillades' | 'Burgers' | 'Pizzas' | 'Salades' | 'Boissons' | 'Plats' | 'Accompagnements' | 'Sandwichs' | 'Fast Food';
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
}
