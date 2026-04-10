import React, { useState } from 'react';
import { X, MapPin, Clock, Check } from 'lucide-react';
import type { ExperienceSpace } from './types';

interface OrderOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (
    mode: string,
    time?: string,
    address?: string,
    name?: string,
    phone?: string,
    experienceSpace?: ExperienceSpace
  ) => void;
  cartTotal: number;
}

export const OrderOptionsModal: React.FC<OrderOptionsModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  cartTotal
}) => {
  const [mode, setMode] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [experienceSpace, setExperienceSpace] = useState<ExperienceSpace | ''>('');

  // Fonction pour obtenir la localisation GPS
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Utiliser l'API de géocodage inversé pour obtenir l'adresse
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`);
            const data = await response.json();

            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              // Fallback: utiliser les coordonnées si l'adresse n'est pas trouvée
              setAddress(`📍 Localisation GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (error) {
            // En cas d'erreur, utiliser les coordonnées
            setAddress(`📍 Localisation GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Erreur de localisation:', error);
          alert('Impossible d\'obtenir votre localisation. Veuillez entrer votre adresse manuellement.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      setIsGettingLocation(false);
    }
  };

  const deliveryFee = mode === '2' ? 500 : 0;

  const handleModeSelect = (selectedMode: string) => {
    setMode(selectedMode);
  };

  const handleValidate = () => {
    // Vérifier les champs de base
    if (!experienceSpace) {
      alert('Veuillez choisir l\'espace : Fast Food ou Terrasse.');
      return;
    }
    if (!mode || !name || !phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifications spécifiques selon le mode
    if (mode === '2') {
      // Mode livraison
      if (!address) {
        alert('Veuillez renseigner votre adresse pour la livraison');
        return;
      }
      if (!time) {
        alert('Veuillez sélectionner un créneau horaire pour la livraison');
        return;
      }
    } else if (mode === '1') {
      // Mode retrait
      if (!time) {
        alert('Veuillez sélectionner l\'heure de retrait souhaitée');
        return;
      }
    }
    // Mode '3' (sur place) ne nécessite pas de temps spécifique

    onSelectMode(mode, time, address, name, phone, experienceSpace as ExperienceSpace);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] md:max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 flex flex-col animate-in fade-in slide-in-from-bottom">
        {/* Header Premium */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-6 md:p-8 flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Finalisez votre commande</h2>
              <p className="text-amber-100 text-xs md:text-sm">Choisissez votre mode de livraison</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative z-10 mt-4 md:mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium">Total actuel</span>
              <span className="text-xl md:text-2xl font-bold">{cartTotal.toLocaleString()} FCFA</span>
            </div>
            <div className="mt-1 text-[10px] text-amber-100">+ 10 FCFA de commission de service</div>
          </div>
        </div>

        <div className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 scrollbar-track-transparent">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Choisir l&apos;espace (obligatoire)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExperienceSpace('Fast Food')}
                className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all ${experienceSpace === 'Fast Food' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-200'}`}
              >
                Fast Food
                <span className="block text-xs font-normal text-gray-600 mt-1">Commande rapide, à emporter</span>
                {experienceSpace === 'Fast Food' && (
                  <span className="mt-2 inline-flex items-center text-amber-600 text-xs font-bold">
                    <Check className="w-3 h-3 mr-1" /> Sélectionné
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setExperienceSpace('Terrasse')}
                className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all ${experienceSpace === 'Terrasse' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-200'}`}
              >
                Terrasse
                <span className="block text-xs font-normal text-gray-600 mt-1">Repas sur place, ambiance cosy</span>
                {experienceSpace === 'Terrasse' && (
                  <span className="mt-2 inline-flex items-center text-amber-600 text-xs font-bold">
                    <Check className="w-3 h-3 mr-1" /> Sélectionné
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Options de commande */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">Comment souhaitez-vous recevoir votre commande ?</label>
            <div className="space-y-4">
              <button
                onClick={() => handleModeSelect('2')}
                className={`group relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${mode === '2'
                    ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🏠</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900 group-hover:text-amber-700 transition-colors">
                      Livraison à domicile
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Nous vous livrons directement à votre adresse</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 mr-1" />
                        30-45 minutes
                      </span>
                      <span className="text-lg font-bold text-amber-600">+500 FCFA</span>
                    </div>
                  </div>
                </div>
                {mode === '2' && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              <button
                onClick={() => handleModeSelect('1')}
                className={`group relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${mode === '1'
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🚗</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                      Je viens chercher
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Vous passez récupérer votre commande au restaurant</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Clock className="w-3 h-3 mr-1" />
                        15-30 minutes
                      </span>
                      <span className="text-lg font-bold text-green-600">Gratuit</span>
                    </div>
                  </div>
                </div>
                {mode === '1' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              <button
                onClick={() => handleModeSelect('3')}
                className={`group relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${mode === '3'
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🍽️</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                      Sur place
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Vous dinez au restaurant et commandez directement</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock className="w-3 h-3 mr-1" />
                        15-20 minutes
                      </span>
                      <span className="text-lg font-bold text-blue-600">Gratuit</span>
                    </div>
                  </div>
                </div>
                {mode === '3' && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {mode === '2' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Créneau horaire de livraison
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 bg-white shadow-sm"
                >
                  <option value="">Sélectionner un créneau</option>
                  <option value="1">12h00 - 12h30</option>
                  <option value="2">12h30 - 13h00</option>
                  <option value="3">13h00 - 13h30</option>
                  <option value="4">19h00 - 19h30</option>
                  <option value="5">19h30 - 20h00</option>
                  <option value="6">20h00 - 20h30</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Adresse de livraison
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Entrez votre adresse complète..."
                      className="flex-1 p-4 border-2 border-gray-300 rounded-xl resize-none focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 bg-white shadow-sm"
                      rows={3}
                    />
                    <button
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                      title="Utiliser ma position actuelle"
                    >
                      {isGettingLocation ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {isGettingLocation && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-blue-600 font-medium">📍 Recherche de votre position...</span>
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      Vous pouvez entrer manuellement votre adresse ou utiliser le bouton GPS pour votre position actuelle
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === '1' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Heure de retrait souhaitée
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300 bg-white shadow-sm"
              >
                <option value="">Sélectionner l'heure de retrait</option>
                <option value="15">Dans 15 minutes</option>
                <option value="20">Dans 20 minutes</option>
                <option value="25">Dans 25 minutes</option>
                <option value="30">Dans 30 minutes</option>
              </select>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  Votre commande sera prête pour le retrait à l'heure choisie
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Informations personnelles</label>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 bg-white shadow-sm"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Votre numéro (ex: 22612345678)"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6">
          <button
            onClick={handleValidate}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 rounded-2xl font-bold text-lg hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Check className="w-6 h-6" />
              Valider ma commande
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
