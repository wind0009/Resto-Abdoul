import { useState, useCallback } from 'react';
import { CartItem, OrderData } from './types';
import { OrderService } from './OrderService';

export const useOrderFlow = (cart: CartItem[], setCart: React.Dispatch<React.SetStateAction<CartItem[]>>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'paying_restaurant' | 'ussd_opened_restaurant' | 'ussd_dialing_restaurant' | 'user_confirmed_restaurant' | 'paying_commission' | 'ussd_opened_commission' | 'ussd_dialing_commission' | 'user_confirmed_commission' | 'waiting' | 'verifying' | 'ticket'>('idle');
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null);

  const handleQuickOrder = useCallback(() => {
    if (cart.length === 0) {
      alert('🛒 Votre panier est vide');
      return;
    }
    setShowOptionsModal(true);
  }, [cart]);

  const handleOrderComplete = async (mode: string, time?: string, address?: string, name?: string, phone?: string) => {
    if (!name || !phone) {
      alert('Informations incomplètes. Veuillez remplir votre nom et numéro de téléphone.');
      return;
    }

    try {
      setIsProcessing(true);

      const { total, commission, finalTotal } = OrderService.calculateOrderTotal(cart);
      const { orderType, deliveryFee, eta: defaultEta } = OrderService.getOrderType(mode);

      let eta = defaultEta;
      if (mode === '1' && time) {
        eta = OrderService.getTimeChoice(time);
      }

      const grandTotal = finalTotal + deliveryFee;
      const restaurantPrice = total + deliveryFee;

      const orderData: OrderData = {
        cart,
        name,
        phone,
        address,
        mode,
        eta,
        total,
        restaurantPrice,
        commission,
        grandTotal
      };

      // On ne lance pas WhatsApp ici, on passe au paiement
      setCompletedOrder(orderData);
      setCurrentStep('paying_restaurant');
      setShowOptionsModal(false);

    } catch (error) {
      alert('❌ Erreur: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeOrder = useCallback(async (paymentScreenshot?: string, commissionScreenshot?: string) => {
    if (!completedOrder) return;

    try {
      setIsProcessing(true);
      // Envoyer les messages WhatsApp avec les captures d'écran
      await OrderService.processOrder(completedOrder, paymentScreenshot, commissionScreenshot);

      // Notification de commission locale si applicable
      try {
        if ((window as any).commissionSystem) {
          const { orderType } = OrderService.getOrderType(completedOrder.mode);
          (window as any).commissionSystem.addCommission(
            completedOrder.commission,
            orderType,
            completedOrder.name,
            completedOrder.phone
          );
        }
      } catch (e) { /* silent */ }

      // Vider le panier à la fin
      setCart([]);

    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedOrder, setCart]);

  return {
    handleQuickOrder,
    handleOrderComplete,
    finalizeOrder,
    isProcessing,
    showOptionsModal,
    setShowOptionsModal,
    currentStep,
    setCurrentStep,
    completedOrder,
    setCompletedOrder
  };
};
