import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from './types';

interface OrderButtonProps {
  cart: CartItem[];
  onOrder: () => void;
  showOptionsModal: boolean;
  setShowOptionsModal: (show: boolean) => void;
}

export const OrderButton: React.FC<OrderButtonProps> = ({ cart, onOrder, showOptionsModal, setShowOptionsModal }) => {
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleClick = () => {
    if (cart.length === 0) {
      alert('🛒 Veuillez ajouter des articles au panier');
      return;
    }
    setShowOptionsModal(true);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
    >
      <ShoppingBag className="w-6 h-6" />
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
          {cart.length}
        </span>
      )}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Voir les options de commande
      </span>
    </button>
  );
};
