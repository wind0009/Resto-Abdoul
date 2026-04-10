import React, { useEffect, useState } from 'react';
import { Settings, Check, Trash2, PlusCircle, Save, X, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';
import type { MenuItem, MenuCategory } from './types';

const ADMIN_CODE = '7450';

function formatPriceString(n: number): string {
  return `${n.toLocaleString('en-US')} FCFA`;
}

function newMenuItem(category: MenuCategory): MenuItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    name: 'Nouveau plat',
    description: '',
    price: 1000,
    priceString: formatPriceString(1000),
    image: '/logo.png',
  };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
};

export function AdminMenuPanel({ isOpen, onClose, menu, setMenu }: Props) {
  const [pass, setPass] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [draft, setDraft] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<MenuCategory>('Fast Food');

  useEffect(() => {
    if (isOpen && isAuthed) {
      setDraft(JSON.parse(JSON.stringify(menu)) as MenuItem[]);
    }
  }, [isOpen, isAuthed, menu]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pass === ADMIN_CODE) {
      setIsAuthed(true);
      setDraft(JSON.parse(JSON.stringify(menu)) as MenuItem[]);
    } else {
      alert('Code incorrect');
    }
  };

  const handleClose = () => {
    setPass('');
    setIsAuthed(false);
    setActiveTab('Fast Food');
    onClose();
  };

  const saveAll = () => {
    setMenu(draft.map((item) => ({
      ...item,
      priceString: formatPriceString(Number(item.price) || 0),
      price: Number(item.price) || 0,
    })));
    alert('Menu enregistré avec succès. Les modifications sont en direct !');
  };

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setDraft((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, ...patch };
        if (patch.price !== undefined) {
          next.price = Number(patch.price) || 0;
          next.priceString = formatPriceString(next.price);
        }
        return next;
      })
    );
  };

  const removeItem = (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
    setDraft((prev) => prev.filter((it) => it.id !== id));
  };

  const addItem = (category: MenuCategory) => {
    setDraft((prev) => [newMenuItem(category), ...prev]);
  };

  if (!isAuthed) {
    return (
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />
        <div className="relative bg-white dark:bg-stone-900 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in zoom-in-95 border border-stone-100 dark:border-white/10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
              <Settings className="w-10 h-10 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white">Administration</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Accès sécurisé réservé au gérant</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Code secret"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl font-medium focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all text-center tracking-widest text-lg dark:text-white"
              autoFocus
            />
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg shadow-amber-600/30">
              Déverrouiller
            </button>
          </form>
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const itemsToDisplay = draft.filter((i) => i.category === activeTab);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative bg-white dark:bg-stone-950 w-full max-w-6xl h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden border border-stone-100 dark:border-white/5">
        
        {/* HEADER */}
        <div className="bg-stone-50 dark:bg-stone-900 px-6 sm:px-10 py-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shadow-inner">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black dark:text-white tracking-tight">Gestion du Menu</h3>
              <p className="text-sm font-medium text-amber-600">En direct sur Resto Abdoul</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={saveAll}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-600/30"
            >
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
            <button onClick={handleClose} className="p-4 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 flex gap-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          {(['Fast Food', 'Terrasse'] as MenuCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-8 py-5 text-sm font-black uppercase tracking-[0.2em] border-b-4 transition-all ${
                activeTab === cat 
                  ? 'border-amber-600 text-amber-600' 
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
              }`}
            >
              Menu {cat}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-stone-100/50 dark:bg-[#0c0a09]">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <span className="text-stone-500 font-medium text-sm">
                <span className="font-black text-stone-900 dark:text-white mr-2">{itemsToDisplay.length}</span> 
                Plats dans la section {activeTab}
              </span>
              <button
                onClick={() => addItem(activeTab)}
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Ajouter un plat
              </button>
            </div>

            {/* Grid */}
            {itemsToDisplay.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[2rem] border border-dashed border-stone-300 dark:border-stone-700">
                <LayoutGrid className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-xl font-bold text-stone-500 dark:text-stone-400">Aucun plat ici.</p>
                <p className="text-sm text-stone-400 mt-2">Cliquez sur Ajouter pour commencer à remplir cette carte.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {itemsToDisplay.map((item) => (
                  <div key={item.id} className="group bg-white dark:bg-stone-900 p-5 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-800 hover:shadow-xl transition-all flex flex-col sm:flex-row gap-5">
                    
                    {/* Image Preview */}
                    <div className="sm:w-1/3 flex flex-col gap-3">
                      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 relative border border-stone-200 dark:border-stone-800 shadow-inner">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none">
                          <ImageIcon className="text-white w-8 h-8 opacity-50" />
                        </div>
                      </div>
                      <input
                        value={item.image}
                        onChange={(e) => updateItem(item.id, { image: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3 rounded-xl text-xs font-mono text-stone-500 focus:ring-2 focus:ring-amber-600 outline-none"
                        placeholder="Ex: /mon-image.png"
                        title="Chemin de l'image"
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="sm:w-2/3 flex flex-col gap-3 relative">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Nom du plat</label>
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl font-bold dark:text-white focus:ring-2 focus:ring-amber-600 outline-none"
                          placeholder="Nom du plat"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Prix (FCFA)</label>
                        <div className="flex bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 transition-shadow">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                            className="w-full bg-transparent px-4 py-3 font-black text-amber-600 outline-none appearance-none"
                            placeholder="0"
                          />
                          <div className="px-4 py-3 bg-stone-100 dark:bg-stone-900 text-stone-500 font-bold border-l border-stone-200 dark:border-stone-800 whitespace-nowrap">
                            {item.priceString}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 flex flex-col">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          className="w-full flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-xl text-sm text-stone-600 dark:text-stone-300 focus:ring-2 focus:ring-amber-600 outline-none resize-none"
                          placeholder="Donnez envie à vos clients..."
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 p-3 bg-white dark:bg-stone-800 text-red-500 hover:text-white hover:bg-red-500 rounded-full shadow-lg border border-stone-100 dark:border-stone-700 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        title="Supprimer ce produit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
