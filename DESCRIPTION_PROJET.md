# 📋 Description Détaillée du Projet Resto Abdoul

## 🏢 **Vue d'ensemble du projet**

**Resto Abdoul** est une application web moderne de commande en ligne pour restaurant, développée avec React, TypeScript et Vite. Le site permet aux clients de passer des commandes via WhatsApp avec intégration Orange Money et un système complet de suivi des commissions.

---

## 💰 **SYSTÈME DE TRANSACTION ET COMMISSION**

### 📊 **Structure des Coûts**

#### **Commission Fixe**
- **Montant** : 10 FCFA par commande (fixe et immuable)
- **Application** : Sur TOUTES les commandes, quel que soit le montant
- **Objectif** : Frais de service pour la plateforme

#### **Frais de Livraison**
- **Montant** : 500 FCFA (uniquement pour le mode livraison)
- **Application** : Seulement quand le client choisit "Livraison à domicile"
- **Gratuit** : Pour les modes "En route" et "Sur place"

#### **Calcul du Total**
```
Total Commande = Somme(articles) + Commission(10 FCFA) + Frais Livraison(0 ou 500 FCFA)
```

### 🔄 **Processus Transactionnel Complet**

#### **Étape 1: Sélection du Mode de Commande**
1. **🚗 En route** : Client vient chercher (0 FCFA livraison)
2. **🏠 Livraison** : Livraison à domicile (500 FCFA livraison)
3. **🍽️ Sur place** : Paiement direct au restaurant (0 FCFA livraison)

#### **Étape 2: Calcul Automatique**
```typescript
// Dans OrderService.calculateOrderTotal()
const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
const commission = 10; // Fixe
const finalTotal = total + commission;
const grandTotal = finalTotal + deliveryFee;
```

#### **Étape 3: Affichage Détaillé**
- **Commande** : Montant des articles
- **Commission** : 10 FCFA (toujours affiché)
- **Livraison** : 0 ou 500 FCFA selon mode
- **Total** : Montant final à payer

---

## 🏛️ **SYSTÈME DE SUIVI DES COMMISSIONS**

### 💾 **Stockage Local**
```javascript
// localStorage key: 'abdoul_commissions'
const commission = {
  id: Date.now(),
  date: new Date().toISOString(),
  amount: 10, // Fixe
  orderType: '🚗 EN ROUTE' | '🏠 LIVRAISON' | '🍽️ SUR PLACE',
  clientName: 'Nom du client',
  clientPhone: 'Téléphone du client',
  status: 'en_attente' | 'payee'
};
```

### 📈 **Fonctionnalités du Système**

#### **1. Ajout Automatique**
```javascript
window.commissionSystem.addCommission(
  amount,      // 10 FCFA
  orderType,   // Type de commande
  clientName,  // Nom client
  clientPhone  // Téléphone client
);
```

#### **2. Calcul des Totaux**
- **Total en attente** : Somme des commissions non payées
- **Total payé** : Somme des commissions réglées
- **Total global** : Somme de toutes les commissions

#### **3. Rappel Quotidien Automatique**
- **Heure** : 21h00 tous les jours
- **Destinataires** : 
  - Propriétaire (22666798031) - Rapport détaillé
  - Restaurant (22667609493) - Notification de vérification
- **Contenu** : Résumé complet des commissions du jour

---

## 💳 **INTÉGRATION PAIEMENT ORANGE MONEY**

### 📱 **Processus de Paiement**

#### **Mode 1: Paiement Standard**
```typescript
// Format Orange Money
const paymentCode = `*144*10*67609493*${grandTotal}#`;
window.location.href = `tel:${paymentCode}`;
```

#### **Mode 2: Paiement Sur Place**
- **Compte restaurant** : 67609493
- **Processus simplifié** : Orange Money s'ouvre pré-rempli
- **Validation** : Code secret uniquement

### 🔐 **Sécurité des Transactions**
- **Double notification** : Restaurant + Propriétaire
- **Suivi automatique** : Chaque commission enregistrée
- **Vérification manuelle** : Confirmation par le restaurant

---

## 📨 **SYSTÈME DE NOTIFICATION WHATSAPP**

### 🎯 **Messages Automatisés**

#### **Message Restaurant (22667609493)**
```
⚡ COMMANDE ⚡

🏠 LIVRAISON
👤 Client: Jean Dupont
📞 Tel: +225 07 00 00 00 00
📍 Rue du Commerce, Abidjan
📍 Coordonnées GPS: 5.360017, -3.987234

🛒 Commande:
• 2x Burger (4,000 FCFA)
• 1x Frites (1,500 FCFA)

💰 Total: 6,010 FCFA
⏰ 30-45 minutes

💳 PAIEMENT ORANGE MONEY
```

#### **Message Propriétaire (22666798031)**
```
💰 NOUVELLE COMMISSION 💰

📦 🏠 LIVRAISON
👤 Jean Dupont
📞 +225 07 00 00 00 00
💵 10 FCFA
💰 Total: 6,010 FCFA

⏰ Paiement en cours...
📊 Suivi automatique activé
```

---

## 🗂️ **ARCHITECTURE TECHNIQUE**

### 📁 **Structure des Fichiers**
```
├── components/
│   ├── OrderOptionsModal.tsx    # Modal de commande
│   ├── OrderService.tsx         # Logique métier
│   └── OrderButton.tsx          # Bouton flottant
├── hooks/
│   └── useOrderFlow.tsx         # Hook de gestion
├── types/
│   ├── order.ts                 # Types commande
│   └── index.ts                 # Types généraux
└── App.tsx                      # Application principale
```

### 🔧 **Technologies**
- **Frontend** : React 19 + TypeScript + Vite
- **Styling** : Tailwind CSS + CSS personnalisé
- **Hébergement** : Firebase Hosting
- **Stockage** : localStorage (commissions)
- **APIs** : OpenStreetMap (géocodage)

---

## 📱 **FONCTIONNALITÉS AVANCÉES**

### 📍 **Localisation Automatique**
- **GPS** : Détection automatique pour livraison
- **Géocodage inversé** : Conversion coordonnées → adresse
- **Intégration** : Adresse + coordonnées dans WhatsApp

### 🎯 **Modes de Commande**
1. **🚗 En Route** : Client vient chercher (5-30 min)
2. **🏠 Livraison** : Livraison domicile (30-45 min + 500 FCFA)
3. **🍽️ Sur Place** : Paiement direct (15-20 min)

### 📊 **Tableau de Bord Commissions**
- **Suivi en temps réel** : localStorage + interface JavaScript
- **Rapports quotidiens** : WhatsApp automatique à 21h
- **Historique complet** : Toutes les commissions enregistrées

---

## 🔄 **FLUX COMPLET D'UNE COMMANDE**

1. **Sélection** → Client ajoute des articles au panier
2. **Options** → Modal avec 3 modes de commande
3. **Localisation** → GPS automatique pour livraison
4. **Calcul** → Total + commission(10) + livraison(0/500)
5. **Validation** → Vérification des informations
6. **Enregistrement** → Commission sauvegardée localement
7. **Notification** → WhatsApp restaurant + propriétaire
8. **Paiement** → Orange Money automatique
9. **Suivi** → Commission dans système de suivi

---

## 💡 **POINTS CLÉS**

- **Commission fixe** : 10 FCFA sur TOUTES les commandes
- **Double notification** : Restaurant + Propriétaire systématique
- **Suivi automatique** : localStorage + rappels quotidiens
- **Intégration complète** : WhatsApp + Orange Money + GPS
- **Architecture moderne** : React + TypeScript + Vite
- **Déploiement optimisé** : Firebase Hosting

Le système garantit une traçabilité parfaite de toutes les transactions tout en offrant une expérience utilisateur fluide et moderne. 🎯

---

## 📞 **INFORMATIONS DE CONTACT**

- **Restaurant WhatsApp** : 22667609493
- **Propriétaire WhatsApp** : 22666798031
- **Compte Orange Money** : 67609493
- **URL de production** : https://amed-cafe-resto.web.app

---

## 🚀 **DÉPLOIEMENT**

```bash
# Build
npm run build

# Déploiement Firebase
firebase deploy --only hosting

# URL: https://amed-cafe-resto.web.app
```

---

*Document généré le 31 janvier 2026*
