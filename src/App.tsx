import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Instagram,
  Facebook,
  Menu as MenuIcon,
  X,
  Utensils,
  ShoppingBag,
  Send,
  Calendar,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Heart,
  Quote,
  Navigation,
  ExternalLink,
  Loader2,
  Sun,
  Moon,
  Settings,
  Edit2,
  Save,
  PlusCircle,
  Image as ImageIcon,
  Camera,
  Smartphone
} from 'lucide-react';
import { MenuItem, CartItem } from './types';
import { GoogleGenAI } from "@google/genai";
import { OrderButton } from './OrderButton';
import { useOrderFlow } from './useOrderFlow';
import { OrderOptionsModal } from './OrderOptionsModal';
import { OrderService } from './OrderService';
import { Check, Clipboard, Download, Loader2 as LoaderIcon } from 'lucide-react';

const WHATSAPP_NUMBER = "74503232";
const RESTAURANT_MAPS_URL = "https://maps.app.goo.gl/iQGzFA3ZEERyUYLw7";

const MENU_DATA: MenuItem[] = [
  {
    id: 'ff1',
    category: 'Fast Food',
    name: 'Poulet Pané - Petit',
    price: 1000,
    priceString: '1,000 FCFA',
    description: 'Morceau de poulet pané croustillant, idéal pour une petite faim.',
    image: '/poulet pané.png'
  },
  {
    id: 'ff2',
    category: 'Fast Food',
    name: 'Poulet Pané - Moyen',
    price: 1500,
    priceString: '1,500 FCFA',
    description: 'Poulet pané de taille moyenne avec frites et sauce.',
    image: '/poulet pané.png'
  },
  {
    id: 'ff3',
    category: 'Fast Food',
    name: 'Poulet Pané - Grand',
    price: 2000,
    priceString: '2,000 FCFA',
    description: 'Generux poulet pané avec double portion de frites et sauces.',
    image: '/poulet pané.png'
  },
  {
    id: 'ff4',
    category: 'Fast Food',
    name: 'Poulet Pané - Entier',
    price: 5000,
    priceString: '5,000 FCFA',
    description: 'Poulet entier pané, parfait pour partager, accompagné de frites.',
    image: '/poulet pané.png'
  },
  {
    id: 'ff5',
    category: 'Fast Food',
    name: 'Chawarma - Simple',
    price: 1500,
    priceString: '1,500 FCFA',
    description: 'Chawarma simple dans pain pita avec crudités et sauce.',
    image: '/charwarma.png'
  },
  {
    id: 'ff6',
    category: 'Fast Food',
    name: 'Chawarma - Complet',
    price: 2000,
    priceString: '2,000 FCFA',
    description: 'Chawarma complet avec double viande, frites et sauces variées.',
    image: '/charwarma.png'
  },
  {
    id: 'ff7',
    category: 'Fast Food',
    name: 'Pain Anglais',
    price: 1000,
    priceString: '1,000 FCFA',
    description: 'Pain anglais grillé avec beurre et confiture maison.',
    image: '/pain anglais.png'
  },
  {
    id: 'ff8',
    category: 'Fast Food',
    name: 'Frites',
    price: 1000,
    priceString: '1,000 FCFA',
    description: 'Frites maison croustillantes, sel et poivre.',
    image: '/frites.png'
  },
  {
    id: 'ff9',
    category: 'Fast Food',
    name: 'Saucisse',
    price: 500,
    priceString: '500 FCFA',
    description: 'Saucisse grillée au feu de bois, servie seule ou avec frites.',
    image: '/saucisse.png'
  },
  {
    id: 'ff10',
    category: 'Fast Food',
    name: 'Merguez (2 pièces)',
    price: 500,
    priceString: '500 FCFA',
    description: 'Deux merguez épicées grillées, servies avec harissa.',
    image: '/mergez.png'
  },
];

const REVIEWS = [
  { name: "Moussa Traoré", comment: "Le meilleur poulet braisé de tout Ouahigouya. Service impeccable même à 3h du matin !", rating: 5 },
  { name: "Alice Durand", comment: "Une pépite au centre-ville. Le cadre est magnifique et la carte est très variée.", rating: 5 },
];

const LocationFinder = () => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<{ text: string, links: any[] } | null>(null);

  const findRestaurant = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let lat = 12.3714;
      let lng = -1.5197;

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) { console.log("Geolocation denied"); }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Où se trouve précisément le Resto Abdoul à Ouahigouya ? Indique qu'il est au centre-ville et comment y accéder.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
          }
        },
      });

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = [
        { maps: { uri: RESTAURANT_MAPS_URL, title: "Ouvrir Google Maps" } },
        ...rawChunks.filter((c: any) => c.maps?.uri && c.maps.uri !== RESTAURANT_MAPS_URL),
      ];
      setLocationData({ text: response.text || "Le restaurant est situé au centre-ville, Ouahigouya.", links });
    } catch (error) {
      setLocationData({
        text: "Le Resto Abdoul vous accueille au centre-ville, à Ouahigouya.",
        links: [{ maps: { uri: RESTAURANT_MAPS_URL, title: "Ouvrir Google Maps" } }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-themed rounded-[3rem] p-10 lg:p-16 space-y-10">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-amber-600 flex items-center justify-center rounded-2xl shadow-lg shadow-amber-600/30">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-black tracking-tighter dark:text-white">Nous Trouver</h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm">Chez Abdoul Fast Food - À côté du D DR Sport et Loisir</p>
        </div>
      </div>

      <div className="min-h-[100px] flex flex-col justify-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            Retrouvez-nous à Ouahigouya, centre-ville, juste à côté du D DR Sport et Loisir pour vos commandes rapides à emporter.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={RESTAURANT_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-stone-100 dark:bg-white/10 hover:bg-amber-600 hover:text-white text-stone-900 dark:text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Ouvrir Google Maps
            </a>
          </div>
        </div>
      </div>

      <a
        href={RESTAURANT_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-stone-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-4 shadow-xl"
      >
        <Navigation className="w-5 h-5" /> Obtenir l'itinéraire
      </a>
    </div>
  );
};


export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('abdoul_menu');
    return saved ? JSON.parse(saved) : MENU_DATA;
  });
  const [isMenuRemoteReady, setIsMenuRemoteReady] = useState(false);
  const [isMenuRemoteEnabled, setIsMenuRemoteEnabled] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initRemoteMenuSync = async () => {
      try {
        const hasFirebaseConfig = Boolean(
          import.meta.env.VITE_FIREBASE_API_KEY &&
          import.meta.env.VITE_FIREBASE_PROJECT_ID &&
          import.meta.env.VITE_FIREBASE_APP_ID
        );

        if (!hasFirebaseConfig) {
          setIsMenuRemoteReady(true);
          return;
        }

        const [{ app: firebaseApp }, { doc, getFirestore, onSnapshot }] = await Promise.all([
          import('./firebase'),
          import('firebase/firestore')
        ]);

        const db = getFirestore(firebaseApp);
        const menuDocRef = doc(db, 'public', 'menu');

        unsubscribe = onSnapshot(
          menuDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const remoteItems = snapshot.data()?.items;
              if (Array.isArray(remoteItems) && remoteItems.length > 0) {
                setMenu((prev) => {
                  const prevJson = JSON.stringify(prev);
                  const remoteJson = JSON.stringify(remoteItems);
                  return prevJson === remoteJson ? prev : (remoteItems as MenuItem[]);
                });
              }
            }
            setIsMenuRemoteEnabled(true);
            setIsMenuRemoteReady(true);
          },
          () => {
            setIsMenuRemoteReady(true);
          }
        );
      } catch {
        setIsMenuRemoteReady(true);
      }
    };

    initRemoteMenuSync();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('abdoul_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    if (!isMenuRemoteReady || !isMenuRemoteEnabled) return;

    const pushMenuToRemote = async () => {
      try {
        const [{ app: firebaseApp }, { doc, getFirestore, setDoc }] = await Promise.all([
          import('./firebase'),
          import('firebase/firestore')
        ]);
        const db = getFirestore(firebaseApp);
        const menuDocRef = doc(db, 'public', 'menu');
        await setDoc(menuDocRef, { items: menu }, { merge: true });
      } catch {
        // Keep localStorage as fallback when Firestore sync fails.
      }
    };

    pushMenuToRemote();
  }, [menu, isMenuRemoteReady, isMenuRemoteEnabled]);

  // Utiliser le hook de commande
  const {
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
  } = useOrderFlow(cart, setCart);

  const [verificationProgress, setVerificationProgress] = useState(0);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [commissionScreenshot, setCommissionScreenshot] = useState<string | null>(null);
  const [ussdState, setUssdState] = useState<'INIT' | 'USSD_READY' | 'USSD_OPENED' | 'USSD_DIALING' | 'USER_CONFIRMED' | 'PAYMENT_PASSED_GATE'>('INIT');
  const [paymentTimestamp, setPaymentTimestamp] = useState<number | null>(null);
  const restaurantAmount = completedOrder?.restaurantPrice ?? completedOrder?.total ?? 0;

  const cancelOrderValidation = () => {
    setCurrentStep('idle');
    setCompletedOrder(null);
    setPaymentScreenshot(null);
    setCommissionScreenshot(null);
    setUssdState('INIT');
    setPaymentTimestamp(null);
  };

  // Enregistrer l'état du paiement dans localStorage pour traçabilité
  const logPaymentState = (state: string, step: string) => {
    const log = {
      userId: 'user_' + Date.now(),
      orderId: (completedOrder as any)?.orderId || 'unknown',
      state,
      step,
      timestamp: new Date().toISOString(),
      deviceId: navigator.userAgent || 'unknown'
    };
    console.log('PAYMENT_LOG:', log);
    localStorage.setItem('payment_log_' + Date.now(), JSON.stringify(log));
  };

  // Simulation de vérification de 10 secondes
  useEffect(() => {
    let interval: any;
    if (currentStep === 'verifying') {
      setVerificationProgress(0);
      interval = setInterval(() => {
        setVerificationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCurrentStep('ticket');
            setUssdState('PAYMENT_PASSED_GATE');
            logPaymentState('PAYMENT_PASSED_GATE', 'verifying');
            finalizeOrder(paymentScreenshot || undefined, commissionScreenshot || undefined); // Envoyer WhatsApp avec les 2 captures
            return 100;
          }
          return prev + 1; // 100 steps over 10s (approx 100ms per step)
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  // Timer de 10 secondes après confirmation utilisateur
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 'ussd_dialing_restaurant') {
      timer = setTimeout(() => {
        setUssdState('USSD_OPENED');
        logPaymentState('USSD_OPENED', 'ussd_dialing_restaurant');
        setCurrentStep('ussd_opened_restaurant');
      }, 10000);
    } else if (currentStep === 'ussd_dialing_commission') {
      timer = setTimeout(() => {
        setUssdState('USSD_OPENED');
        logPaymentState('USSD_OPENED', 'ussd_dialing_commission');
        setCurrentStep('ussd_opened_commission');
      }, 10000);
    } else if (currentStep === 'user_confirmed_restaurant') {
      timer = setTimeout(() => {
        setUssdState('PAYMENT_PASSED_GATE');
        logPaymentState('PAYMENT_PASSED_GATE', 'user_confirmed_restaurant');
        setUssdState('INIT'); // Réinitialiser pour la commission
        setCommissionScreenshot(null); // Réinitialiser la capture pour la commission
        setCurrentStep('paying_commission'); // Passer à la commission après le paiement restaurant
      }, 10000);
    } else if (currentStep === 'user_confirmed_commission') {
      timer = setTimeout(() => {
        setUssdState('PAYMENT_PASSED_GATE');
        logPaymentState('PAYMENT_PASSED_GATE', 'user_confirmed_commission');
        setCurrentStep('verifying');
      }, 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);

    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    const themeColor = isDark ? '#0c0a09' : '#d97706';
    const statusBarStyle = isDark ? 'black-translucent' : 'default';

    const themeColorMeta = document.querySelector("meta[name='theme-color']");
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColor);
    }

    const appleStatusBarMeta = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']");
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', statusBarStyle);
    }
  }, [isDark]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true); // Open cart instead of forcing checkout
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      <div className="fixed inset-0 grainy-bg pointer-events-none z-[90]"></div>

      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-stone-900/95 backdrop-blur-lg shadow-2xl border-b border-amber-500/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div className="flex items-center gap-4">
              <div className={`relative ${scrolled ? 'scale-90' : 'scale-100'} transition-transform duration-500`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Resto Abdoul Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-12">
              {['accueil', 'menu', 'reservation', 'contact'].map(link => (
                <a key={link} href={`#${link}`} className={`relative text-[11px] font-black uppercase tracking-[0.6em] transition-all duration-300 hover:text-amber-400 ${scrolled ? 'text-white/90' : 'text-white/80'} group`}>
                  {link}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-full transition-all duration-300 ${scrolled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-4 rounded-full transition-all duration-300 ${scrolled ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="accueil" className="relative min-h-screen flex items-center pt-24 md:pt-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/restaurant-photo.png"
            className="w-full h-full object-cover brightness-[0.3] lg:brightness-[0.5]"
            alt="Chez Abdoul Restaurant"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full text-white">
          <div className="max-w-4xl space-y-12">
            <span className="inline-block bg-amber-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">Chez Abdoul</span>
            <h1 className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tight">
              Fast Food <br />
              <span className="text-amber-500 font-title italic font-medium">Express.</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 font-light leading-relaxed max-w-2xl">
              Commande rapide, à emporter. Découvrez nos spécialités fast food préparées avec amour.
            </p>
          </div>
        </div>
      </section>


      {/* Features & Location */}
      <section className="py-32 bg-stone-50 dark:bg-stone-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-amber-600 font-black uppercase tracking-[0.5em] text-[10px]">Notre Signature</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none dark:text-white">
                Qualité, Fraîcheur <br /> & <span className="text-amber-600">Passion.</span>
              </h2>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed">
              Plus qu'un restaurant, le Resto Abdoul est une institution à Ouahigouya. Nous cuisinons avec amour pour vous offrir une expérience mémorable à chaque bouchée.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-white/5">
                <span className="text-amber-600 font-black text-4xl mb-2 block">100%</span>
                <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Produits Locaux</p>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-white/5">
                <span className="text-amber-600 font-black text-4xl mb-2 block">QUALITÉ</span>
                <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Produits Frais</p>
              </div>
            </div>
          </div>
          <LocationFinder />
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-32 bg-white dark:bg-stone-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <span className="text-amber-600 font-black uppercase tracking-[0.5em] text-[10px]">Fast Food</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter dark:text-white">Notre Menu</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MENU_DATA.map((item) => (
              <div key={item.id} className="group relative bg-stone-50 dark:bg-stone-950 p-6 rounded-[2rem] flex flex-col gap-6 border border-transparent hover:border-amber-600/30 transition-all">
                <div className="w-full h-48 overflow-hidden rounded-[1.5rem] shadow-xl">
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-xl font-black tracking-tight dark:text-white">{item.name}</h4>
                    <span className="text-amber-600 font-black text-lg">{item.priceString}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{item.description}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Wizard Overlay */}
      {currentStep !== 'idle' && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"></div>

          <div className="relative bg-white dark:bg-stone-900 w-full max-w-lg max-h-[90dvh] sm:max-h-[92vh] rounded-3xl sm:rounded-[2.5rem] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            {currentStep === 'paying_restaurant' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Utensils className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Validation de votre commande</h3>
                  <p className="text-stone-500 dark:text-stone-400">Cliquez sur le code ci-dessous pour effectuer le transfert</p>
                </div>
                <div className="bg-stone-50 dark:bg-black/20 p-6 rounded-3xl">
                  <p className="text-sm text-stone-400 uppercase font-black tracking-widest mb-1">Montant à payer</p>
                  <p className="text-4xl font-black text-amber-600">{restaurantAmount.toLocaleString()} FCFA</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 text-left">
                  <p className="text-amber-700 dark:text-amber-300 text-sm font-bold">
                    ⚠️ Important: après le paiement, vous devez obligatoirement ajouter une image de la capture d'ecran de la transaction pour valider votre commande.
                  </p>
                </div>

                {/* Code USSD cliquable sans option d'annulation */}
                <div className="space-y-4">
                  <p className="text-sm font-black uppercase tracking-wide text-amber-600">
                    📱 CODE DE TRANSFERT OBLIGATOIRE
                  </p>
                  <button
                    onClick={() => {
                      // Ouvrir directement le code USSD
                      const ussd = OrderService.getRestaurantUSSD(restaurantAmount);
                      window.location.href = `tel:${encodeURIComponent(ussd)}`;
                      setUssdState('USSD_DIALING');
                      setPaymentTimestamp(Date.now());
                      logPaymentState('USSD_DIALING', 'paying_restaurant');
                      // Passer directement à l'étape d'attente
                      setCurrentStep('ussd_dialing_restaurant');
                    }}
                    className="w-full bg-amber-600 text-white py-5 sm:py-8 rounded-3xl font-black text-base sm:text-2xl uppercase tracking-wide sm:tracking-widest flex items-center justify-center gap-3 sm:gap-4 hover:bg-amber-700 transition-all shadow-xl animate-pulse break-all"
                  >
                    <Smartphone className="w-8 h-8" /> 
                    {OrderService.getRestaurantUSSD(restaurantAmount)}
                  </button>
                  <p className="text-xs text-red-600 font-bold">Cliquez obligatoirement sur ce bouton pour valider votre commande</p>
                </div>

                <button
                  onClick={cancelOrderValidation}
                  className="w-full bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-stone-300 dark:hover:bg-stone-600 transition-all"
                >
                  Retour au panier
                </button>
              </div>
            )}

            {currentStep === 'ussd_dialing_restaurant' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Smartphone className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Transfert en cours...</h3>
                  <p className="text-stone-500 dark:text-stone-400">Veuillez patienter pendant que le transfert s'effectue</p>
                  <p className="text-amber-600 text-sm font-bold">Le code USSD a été lancé. Validez le transfert dans votre application téléphone.</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                
                {/* Compte à rebours de 10 secondes */}
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100 dark:text-white/5" />
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * Math.max(0, 100 - ((Date.now() - (paymentTimestamp || 0)) / 100))) / 100} className="text-amber-600 transition-all duration-100" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-amber-600">{Math.max(0, Math.ceil(10 - (Date.now() - (paymentTimestamp || 0)) / 1000))}s</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">Vérification du transfert en cours</p>
                </div>
              </div>
            )}

            {currentStep === 'ussd_opened_restaurant' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Retour obligatoire</h3>
                  <p className="text-stone-500 dark:text-stone-400">Revenez dans l'application et ajoutez la capture d'écran de votre paiement</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                
                {/* Capture d'écran demandée APRÈS le transfert */}
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">📸 Capture d'écran du paiement restaurant</label>
                    <div
                      onClick={() => document.getElementById('restaurant-payment-screenshot')?.click()}
                      className="mt-2 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-2xl p-6 cursor-pointer hover:border-amber-600 transition-all"
                    >
                      {paymentScreenshot ? (
                        <div className="space-y-4">
                          <img src={paymentScreenshot} className="w-full h-48 object-cover rounded-xl" alt="Capture d'écran" />
                          <p className="text-xs text-stone-500 text-center">Cliquez pour remplacer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Camera className="w-8 h-8 text-amber-600 mx-auto" />
                          <p className="text-sm text-stone-500">Cliquez pour ajouter la capture d'écran du paiement restaurant</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="restaurant-payment-screenshot"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => setPaymentScreenshot(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (ussdState === 'USSD_OPENED' && paymentScreenshot) {
                      setUssdState('USER_CONFIRMED');
                      logPaymentState('USER_CONFIRMED', 'ussd_opened_restaurant');
                      setCurrentStep('user_confirmed_restaurant');
                    } else if (!paymentScreenshot) {
                      alert('📸 Veuillez ajouter une capture d\'écran de votre paiement restaurant pour continuer.');
                    }
                  }}
                  disabled={ussdState !== 'USSD_OPENED' || !paymentScreenshot}
                  className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-green-700 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" /> J'ai effectué le paiement
                </button>
                <button
                  onClick={() => {
                    setUssdState('INIT');
                    setPaymentTimestamp(null);
                    setPaymentScreenshot(null);
                    logPaymentState('INIT', 'paying_restaurant');
                    setCurrentStep('paying_restaurant');
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Annuler
                </button>
              </div>
            )}

            {currentStep === 'user_confirmed_restaurant' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Paiement en cours de validation</h3>
                  <p className="text-stone-500 dark:text-stone-400">Veuillez patienter pendant que nous vérifions votre paiement...</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                <div className="flex justify-center gap-2">
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Validation en cours (10 secondes)</p>
              </div>
            )}

            {currentStep === 'paying_commission' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-10 h-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Frais de service</h3>
                  <p className="text-stone-500 dark:text-stone-400">Cliquez sur le code ci-dessous pour effectuer le transfert</p>
                </div>
                <div className="bg-stone-50 dark:bg-black/20 p-6 rounded-3xl">
                  <p className="text-sm text-stone-400 uppercase font-black tracking-widest mb-1">Commission fixe</p>
                  <p className="text-4xl font-black text-blue-600">10 FCFA</p>
                </div>

                {/* Code USSD cliquable sans option d'annulation */}
                <div className="space-y-4">
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    📱 CODE DE TRANSFERT OBLIGATOIRE
                  </p>
                  <button
                    onClick={() => {
                      // Ouvrir directement le code USSD
                      const ussd = OrderService.getCommissionUSSD();
                      window.location.href = `tel:${encodeURIComponent(ussd)}`;
                      setUssdState('USSD_DIALING');
                      setPaymentTimestamp(Date.now());
                      logPaymentState('USSD_DIALING', 'paying_commission');
                      // Passer directement à l'étape d'attente
                      setCurrentStep('ussd_dialing_commission');
                    }}
                    className="w-full bg-blue-600 text-white py-5 sm:py-8 rounded-3xl font-black text-base sm:text-2xl uppercase tracking-wide sm:tracking-widest flex items-center justify-center gap-3 sm:gap-4 hover:bg-blue-700 transition-all shadow-xl animate-pulse break-all"
                  >
                    <Smartphone className="w-8 h-8" /> 
                    {OrderService.getCommissionUSSD()}
                  </button>
                  <p className="text-xs text-red-600 font-bold">Cliquez obligatoirement sur ce bouton pour valider votre commande</p>
                </div>
              </div>
            )}

            {currentStep === 'ussd_dialing_commission' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Transfert en cours...</h3>
                  <p className="text-stone-500 dark:text-stone-400">Veuillez patienter pendant que le transfert s'effectue</p>
                  <p className="text-blue-600 text-sm font-bold">Le code USSD a été lancé. Validez le transfert dans votre application téléphone.</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                
                {/* Compte à rebours de 10 secondes */}
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100 dark:text-white/5" />
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * Math.max(0, 100 - ((Date.now() - (paymentTimestamp || 0)) / 100))) / 100} className="text-blue-600 transition-all duration-100" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-blue-600">{Math.max(0, Math.ceil(10 - (Date.now() - (paymentTimestamp || 0)) / 1000))}s</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">Vérification du transfert en cours</p>
                </div>
              </div>
            )}

            {currentStep === 'ussd_opened_commission' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Retour obligatoire</h3>
                  <p className="text-stone-500 dark:text-stone-400">Revenez dans l'application et ajoutez la capture d'écran de votre transfert</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                
                {/* Capture d'écran demandée APRÈS le transfert */}
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">📸 Capture d'écran du transfert commission</label>
                    <div
                      onClick={() => document.getElementById('commission-payment-screenshot')?.click()}
                      className="mt-2 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-2xl p-6 cursor-pointer hover:border-blue-600 transition-all"
                    >
                      {commissionScreenshot ? (
                        <div className="space-y-4">
                          <img src={commissionScreenshot} className="w-full h-48 object-cover rounded-xl" alt="Capture d'écran" />
                          <p className="text-xs text-stone-500 text-center">Cliquez pour remplacer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Camera className="w-8 h-8 text-blue-600 mx-auto" />
                          <p className="text-sm text-stone-500">Cliquez pour ajouter la capture d'écran du transfert commission</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="commission-payment-screenshot"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => setCommissionScreenshot(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (ussdState === 'USSD_OPENED' && commissionScreenshot) {
                      setUssdState('USER_CONFIRMED');
                      logPaymentState('USER_CONFIRMED', 'ussd_opened_commission');
                      setCurrentStep('user_confirmed_commission');
                    } else if (!commissionScreenshot) {
                      alert('📸 Veuillez ajouter une capture d\'écran de votre transfert commission pour continuer.');
                    }
                  }}
                  disabled={ussdState !== 'USSD_OPENED' || !commissionScreenshot}
                  className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-green-700 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" /> J'ai effectué le transfert
                </button>
                <button
                  onClick={() => {
                    setUssdState('INIT');
                    setPaymentTimestamp(null);
                    setCommissionScreenshot(null);
                    logPaymentState('INIT', 'paying_commission');
                    setCurrentStep('paying_commission');
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Annuler
                </button>
              </div>
            )}

            {currentStep === 'user_confirmed_commission' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-10 h-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Paiement en cours de validation</h3>
                  <p className="text-stone-500 dark:text-stone-400">Veuillez patienter pendant que nous vérifions votre transfert...</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                <div className="flex justify-center gap-2">
                  <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Validation en cours (10 secondes)</p>
              </div>
            )}

            {currentStep === 'waiting' && (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white">Paiement en cours de validation</h3>
                  <p className="text-stone-500 dark:text-stone-400">Veuillez patienter pendant que nous vérifions votre paiement...</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                <div className="flex justify-center gap-2">
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Cela peut prendre jusqu'à 30 secondes</p>
              </div>
            )}

            {currentStep === 'verifying' && (
              <div className="p-6 sm:p-10 space-y-8 sm:space-y-10 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100 dark:text-white/5" />
                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * verificationProgress) / 100} className="text-amber-600 transition-all duration-100" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-amber-600">{verificationProgress}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight dark:text-white">Paiement en cours de validation</h3>
                  <p className="text-stone-500 dark:text-stone-400">Vérification de votre transaction en cours...</p>
                  <p className="text-red-600 text-sm font-bold">Toute fraude entraîne un blocage définitif et une amende du triple.</p>
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Ne fermez pas cette page</p>
              </div>
            )}

            {currentStep === 'ticket' && completedOrder && (
              <div className="p-8 space-y-6">
                <div className="bg-amber-600 text-white p-6 rounded-3xl text-center space-y-2">
                  <Check className="w-12 h-12 mx-auto" />
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Commande Validée !</h3>
                  <p className="text-amber-100 text-xs uppercase font-bold tracking-widest">Récupérez votre commande à l'arrivée</p>
                </div>

                <div id="order-ticket" className="bg-stone-50 dark:bg-black/40 p-6 rounded-3xl border-2 border-dashed border-stone-200 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-start border-b border-stone-200 dark:border-white/10 pb-4">
                    <div>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Client</p>
                      <p className="font-bold dark:text-white">{completedOrder.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Mode</p>
                      <p className="font-bold text-amber-600">{OrderService.getOrderType(completedOrder.mode).orderType.split(' ')[1]}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Articles</p>
                    {completedOrder.cart.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="dark:text-stone-300">{item.quantity}x {item.name}</span>
                        <span className="font-bold dark:text-white">{(item.price * item.quantity).toLocaleString()} F</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-stone-200 dark:border-white/10 flex justify-between items-center">
                    <p className="font-black text-xl dark:text-white">TOTAL PAYÉ</p>
                    <p className="font-black text-xl text-amber-600">{completedOrder.grandTotal.toLocaleString()} FCFA</p>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-stone-100 dark:border-white/5">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mb-1">Code de Retrait</p>
                    <p className="text-2xl font-black tracking-[0.5em] text-stone-900 dark:text-white uppercase">{Math.random().toString(36).substring(2, 8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      // Convertir le ticket en image et sauvegarder
                      const ticketElement = document.getElementById('order-ticket');
                      if (ticketElement) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          canvas.width = 800;
                          canvas.height = 1400;
                          
                          // Fond
                          ctx.fillStyle = '#ffffff';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          
                          // Bordure
                          ctx.strokeStyle = '#f59e0b';
                          ctx.lineWidth = 4;
                          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                          
                          // Texte
                          ctx.fillStyle = '#1c1917';
                          ctx.font = 'bold 32px Arial';
                          ctx.textAlign = 'center';
                          ctx.fillText('🍽️ RESTO ABDOUL', canvas.width / 2, 60);
                          
                          ctx.font = 'bold 24px Arial';
                          ctx.fillText('TICKET DE COMMANDE', canvas.width / 2, 100);
                          
                          // Ligne séparateur
                          ctx.beginPath();
                          ctx.moveTo(50, 120);
                          ctx.lineTo(canvas.width - 50, 120);
                          ctx.stroke();
                          
                          // Infos client
                          ctx.textAlign = 'left';
                          ctx.font = '20px Arial';
                          const orderType = OrderService.getOrderType(completedOrder.mode).orderType;
                          let y = 180;
                          ctx.fillText(`Client: ${completedOrder.name}`, 60, y);
                          y += 35;
                          ctx.fillText(`Tél: ${completedOrder.phone}`, 60, y);
                          y += 35;
                          ctx.fillText(`Mode: ${orderType}`, 60, y);
                          if (completedOrder.address) {
                            y += 35;
                            ctx.fillText(`Adresse: ${completedOrder.address.substring(0, 40)}`, 60, y);
                          }
                          
                          // Commande
                          y += 50;
                          ctx.font = 'bold 22px Arial';
                          ctx.fillText('COMMANDE:', 60, y);
                          y += 30;
                          ctx.font = '20px Arial';
                          completedOrder.cart.forEach((item: any) => {
                            const line = `${item.quantity}x ${item.name}`;
                            const price = `${(item.price * item.quantity).toLocaleString()} FCFA`;
                            ctx.fillText(`${line.substring(0, 30)}`, 60, y);
                            ctx.textAlign = 'right';
                            ctx.fillText(price, canvas.width - 60, y);
                            ctx.textAlign = 'left';
                            y += 30;
                          });
                          
                          // Totaux
                          y += 30;
                          ctx.beginPath();
                          ctx.moveTo(50, y - 10);
                          ctx.lineTo(canvas.width - 50, y - 10);
                          ctx.stroke();
                          
                          ctx.font = 'bold 22px Arial';
                          ctx.fillText('Sous-total:', 60, y + 25);
                          ctx.textAlign = 'right';
                          ctx.fillText(`${completedOrder.total.toLocaleString()} FCFA`, canvas.width - 60, y + 25);
                          ctx.textAlign = 'left';
                          
                          y += 35;
                          ctx.fillText('TOTAL PAYÉ:', 60, y + 25);
                          ctx.textAlign = 'right';
                          ctx.font = 'bold 28px Arial';
                          ctx.fillStyle = '#f59e0b';
                          ctx.fillText(`${completedOrder.grandTotal.toLocaleString()} FCFA`, canvas.width - 60, y + 25);
                          
                          // Captures d'écran - Charger les images de manière asynchrone
                          y += 60;
                          ctx.fillStyle = '#1c1917';
                          ctx.font = 'bold 18px Arial';
                          ctx.textAlign = 'center';
                          
                          const loadImagesAndGenerateTicket = async () => {
                            // Captures d'écran
                            if (paymentScreenshot) {
                              ctx.fillText('📸 PREUVE PAIEMENT RESTAURANT', canvas.width / 2, y);
                              y += 25;
                              
                              try {
                                const img = new Image();
                                await new Promise((resolve, reject) => {
                                  img.onload = resolve;
                                  img.onerror = reject;
                                  img.src = paymentScreenshot;
                                });
                                
                                // Dessiner l'image redimensionnée
                                const imgWidth = 300;
                                const imgHeight = 200;
                                const x = (canvas.width - imgWidth) / 2;
                                
                                ctx.drawImage(img, x, y, imgWidth, imgHeight);
                                y += imgHeight + 20;
                                
                                ctx.fillStyle = '#666';
                                ctx.font = '14px Arial';
                                ctx.fillText('Transaction confirmée', canvas.width / 2, y);
                                y += 30;
                              } catch (error) {
                                // En cas d'erreur, afficher un placeholder
                                ctx.fillStyle = '#f0f0f0';
                                ctx.fillRect(60, y, 300, 200);
                                ctx.fillStyle = '#666';
                                ctx.font = '14px Arial';
                                ctx.fillText('[Capture non disponible]', 210, y + 105);
                                y += 220;
                              }
                            }
                            
                            if (commissionScreenshot) {
                              ctx.fillStyle = '#1c1917';
                              ctx.font = 'bold 18px Arial';
                              ctx.textAlign = 'center';
                              ctx.fillText('📸 PREUVE PAIEMENT COMMISSION', canvas.width / 2, y);
                              y += 25;
                              
                              try {
                                const img = new Image();
                                await new Promise((resolve, reject) => {
                                  img.onload = resolve;
                                  img.onerror = reject;
                                  img.src = commissionScreenshot;
                                });
                                
                                // Dessiner l'image redimensionnée
                                const imgWidth = 300;
                                const imgHeight = 200;
                                const x = (canvas.width - imgWidth) / 2;
                                
                                ctx.drawImage(img, x, y, imgWidth, imgHeight);
                                y += imgHeight + 20;
                                
                                ctx.fillStyle = '#666';
                                ctx.font = '14px Arial';
                                ctx.fillText('Transaction confirmée', canvas.width / 2, y);
                                y += 30;
                              } catch (error) {
                                // En cas d'erreur, afficher un placeholder
                                ctx.fillStyle = '#f0f0f0';
                                ctx.fillRect(60, y, 300, 200);
                                ctx.fillStyle = '#666';
                                ctx.font = '14px Arial';
                                ctx.fillText('[Capture non disponible]', 210, y + 105);
                                y += 220;
                              }
                            }
                            
                            // Code de retrait
                            ctx.fillStyle = '#1c1917';
                            ctx.font = 'bold 18px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('CODE DE RETRAIT:', canvas.width / 2, y);
                            y += 35;
                            const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                            ctx.font = 'bold 36px Arial';
                            ctx.fillStyle = '#f59e0b';
                            ctx.fillText(ticketCode, canvas.width / 2, y);
                            
                            // Date
                            y += 50;
                            ctx.fillStyle = '#78716c';
                            ctx.font = '16px Arial';
                            ctx.fillText(new Date().toLocaleString('fr-FR'), canvas.width / 2, y);
                            
                            // Footer
                            y += 40;
                            ctx.font = 'bold 18px Arial';
                            ctx.fillStyle = '#1c1917';
                            ctx.fillText('Merci pour votre commande ! 🙏', canvas.width / 2, y);
                            
                            // Télécharger l'image après chargement
                            canvas.toBlob((blob) => {
                              if (blob) {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `ticket-abdoul-${ticketCode}.png`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }
                            }, 'image/png');
                          };
                          
                          loadImagesAndGenerateTicket();
                        }
                      }
                    }}
                    className="bg-stone-100 dark:bg-white/5 text-stone-900 dark:text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-white/10 transition-all"
                  >
                    <Download className="w-4 h-4" /> Enregistrer Ticket
                  </button>
                  <button
                    onClick={() => setCurrentStep('idle')}
                    className="bg-amber-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-6">
          <div className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-lg h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                <ShoppingBag className="w-8 h-8 text-amber-600" /> Panier
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-4 hover:bg-stone-100 dark:hover:bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 scrollbar-track-transparent">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <ShoppingBag className="w-24 h-24" />
                  <p className="text-xl font-bold uppercase tracking-widest">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl">
                      <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt={item.name} />
                      <div className="flex-1">
                        <h4 className="font-bold dark:text-white">{item.name}</h4>
                        <p className="text-amber-600 font-black">{item.priceString}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-stone-200 dark:border-white/10 pt-8 space-y-4">
                    <div className="flex justify-between text-lg font-bold dark:text-white">
                      <span>Total:</span>
                      <span>{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Commission:</span>
                      <span>10 FCFA</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setShowOptionsModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      Voir les options de commande
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Options Modal */}
      <OrderOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onSelectMode={handleOrderComplete}
        cartTotal={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
      />

      {/* Order Button */}
      <OrderButton
        cart={cart}
        onOrder={handleQuickOrder}
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
      />


      {/* Commission System Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.commissionSystem = {
            addCommission: function(amount, orderType, clientName, clientPhone) {
              try {
                let commissions = JSON.parse(localStorage.getItem('abdoul_commissions') || '[]');
                const commission = {
                  id: Date.now(),
                  date: new Date().toISOString(),
                  amount: amount,
                  orderType: orderType,
                  clientName: clientName,
                  clientPhone: clientPhone,
                  status: 'en_attente'
                };
                commissions.push(commission);
                localStorage.setItem('abdoul_commissions', JSON.stringify(commissions));
              } catch (err) {
                console.error('Erreur commission:', err);
              }
            },
            getTotalCommissions: function() {
              try {
                const commissions = JSON.parse(localStorage.getItem('abdoul_commissions') || '[]');
                return commissions.reduce((total, comm) => total + (comm.amount || 0), 0);
              } catch (e) {
                return 0;
              }
            }
          };
        `
      }} />

      {/* Reservation Section */}
      <section id="reservation" className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-amber-600 font-black uppercase tracking-[0.5em] text-[10px]">Votre Table</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter dark:text-white">Réserver</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Contactez-nous directement sur WhatsApp pour réserver votre table dans notre espace VIP ou en terrasse.</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 bg-amber-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl">
            <Send className="w-5 h-5" /> Réserver sur WhatsApp
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-stone-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-amber-600 font-black uppercase tracking-[0.5em] text-[10px]">Restons en contact</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter dark:text-white">Contact</h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <div className="flex items-center justify-center gap-4 p-8 bg-stone-50 dark:bg-stone-950 rounded-3xl border border-stone-100 dark:border-white/5">
              <Phone className="w-8 h-8 text-amber-600" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Téléphone</p>
                <p className="font-bold dark:text-white">+226 74503232</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 p-8 bg-stone-50 dark:bg-stone-950 rounded-3xl border border-stone-100 dark:border-white/5">
              <MapPin className="w-8 h-8 text-amber-600" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Adresse</p>
                <a
                  href={RESTAURANT_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold dark:text-white text-amber-600 dark:text-amber-500 hover:underline"
                >
                  Google Maps — Resto Abdoul
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer avec références */}
      <footer className="bg-stone-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Resto Abdoul</p>
            <p className="text-[10px] text-stone-400 mt-1">Version 2.0 • 2026</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Développé par Sawadogo Stephane & Dabire Windson</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] text-stone-500">Tous droits réservés © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
