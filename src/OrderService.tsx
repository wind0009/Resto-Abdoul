import { OrderData, CartItem } from './types';

export class OrderService {
  static calculateOrderTotal(cart: CartItem[]): { total: number; commission: number; finalTotal: number } {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const commission = 10; // Fixe à 10 FCFA
    const finalTotal = total + commission;

    return { total, commission, finalTotal };
  }

  static getOrderType(mode: string): { orderType: string; deliveryFee: number; eta: string } {
    switch (mode) {
      case '2':
        return { orderType: '🏠 LIVRAISON À DOMICILE', deliveryFee: 500, eta: '30-45 minutes' };
      case '1':
        return { orderType: '🚗 RETRAIT SUR PLACE', deliveryFee: 0, eta: '15-20 minutes' };
      case '3':
        return { orderType: '🍽️ SUR PLACE', deliveryFee: 0, eta: '20-30 minutes' };
      default:
        return { orderType: '📦 COMMANDE', deliveryFee: 0, eta: '30 minutes' };
    }
  }

  static getTimeChoice(time: string): string {
    const timeMap: { [key: string]: string } = {
      '1': '12h00 - 12h30',
      '2': '12h30 - 13h00',
      '3': '13h00 - 13h30',
      '4': '19h00 - 19h30',
      '5': '19h30 - 20h00',
      '6': '20h00 - 20h30'
    };
    return timeMap[time] || '30 minutes';
  }

  static generatePaymentInstructions(grandTotal: number, eta: string, isOnSite: boolean = false): string {
    if (isOnSite) {
      return "💳 PAIEMENT SUR PLACE\n\n📞 Compte restaurant: 67609493\n💰 Montant: " + grandTotal.toLocaleString() + " FCFA\n\n✅ Montant déjà pré-rempli: *" + grandTotal + " FCFA*\n⏰ Votre commande sera prête en " + eta;
    } else {
      return "💳 PAIEMENT ORANGE MONEY\n\n📞 Compte restaurant: 67609493\n💰 Montant: " + grandTotal.toLocaleString() + " FCFA\n\n🔟 ÉTAPES SIMPLES:\n1️⃣ Composer *144*10*67609493*" + grandTotal + "#\n2️⃣ Confirmer le montant\n3️⃣ Entrer votre code secret\n\n✅ Paiement validé = Commande confirmée !\n⏰ Votre commande sera prête en " + eta;
    }
  }

  static getRestaurantUSSD(amount: number): string {
    return `*144*10*67609493*${amount}#`;
  }

  static getCommissionUSSD(): string {
    return `*144*2*1*66798031*10#`;
  }

  static async processOrder(order: OrderData, paymentScreenshot?: string, commissionScreenshot?: string): Promise<void> {
    return new Promise((resolve) => {
      const { orderType, deliveryFee, eta: defaultEta } = OrderService.getOrderType(order.mode);
      let eta = defaultEta;

      if (order.mode === '1' && order.eta) {
        eta = order.eta;
      }

      const grandTotal = order.total + order.commission + deliveryFee;

      // Message restaurant - SANS mention de commission, uniquement commande et capture
      let restaurantMessage = "⚡ NOUVELLE COMMANDE ⚡\n\n" + orderType + "\n👤 Client: " + order.name + "\n📞 Tel: " + order.phone;

      if (order.address) {
        restaurantMessage += "\n📍 " + order.address;
      }

      restaurantMessage += "\n\n🛒 Commande:\n" + order.cart.map((i: any) => "• " + i.quantity + "x " + i.name + " (" + (i.price * i.quantity).toLocaleString() + " FCFA)").join("\n");
      restaurantMessage += "\n\n💰 Total: " + order.total.toLocaleString() + " FCFA\n TOTAL À PAYER: " + grandTotal.toLocaleString() + " FCFA\n\n⏰ Préparation: " + eta + "\n💳 Paiement: Orange Money";

      // Ajouter les captures d'écran si présentes
      if (paymentScreenshot) {
        restaurantMessage += "\n\n📸 PREUVE PAIEMENT RESTAURANT:\n✅ Transaction confirmée";
      }
      if (commissionScreenshot) {
        restaurantMessage += "\n\n📸 PREUVE PAIEMENT COMMISSION:\n✅ Transaction confirmée";
      }

      const ownerMessage = "💰 NOUVELLE COMMISSION 💰\n\n📦 " + orderType + "\n👤 " + order.name + "\n📞 " + order.phone + "\n💵 " + order.commission.toLocaleString() + " FCFA\n💰 Total commande: " + grandTotal.toLocaleString() + " FCFA";

      // WhatsApp Restaurant - ouvrir immédiatement dans le même onglet pour éviter le blocage popup
      const restaurantUrl = `https://wa.me/22667609493?text=${encodeURIComponent(restaurantMessage)}`;
      window.location.href = restaurantUrl;

      // WhatsApp Propriétaire après un court délai
      setTimeout(() => {
        const ownerUrl = `https://wa.me/22666798031?text=${encodeURIComponent(ownerMessage)}`;
        const newWindow = window.open(ownerUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Si le popup est bloqué, essayer avec location.href
          window.location.href = ownerUrl;
        }
        resolve();
      }, 1500);
    });
  }
}
