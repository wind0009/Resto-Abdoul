import React, { useEffect, useState } from 'react';
import { Settings, Check, Trash2, PlusCircle, Save, X } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && isAuthed) {
      setDraft(JSON.parse(JSON.stringify(menu)) as MenuItem[]);
    }
  }, [isOpen, isAuthed, menu]);

  if (!isOpen) return null;

  const handleLogin = () => {
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
    onClose();
  };

  const saveAll = () => {
    setMenu(draft.map((item) => ({
      ...item,
      priceString: formatPriceString(Number(item.price) || 0),
      price: Number(item.price) || 0,
    })));
    alert('Menu enregistré. Les visiteurs verront les changements en direct.');
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
    if (!confirm('Supprimer ce plat ?')) return;
    setDraft((prev) => prev.filter((it) => it.id !== id));
  };

  const addItem = (category: MenuCategory) => {
    setDraft((prev) => [...prev, newMenuItem(category)]);
  };

  if (!isAuthed) {
    return (
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />
        <div className="relative bg-white dark:bg-stone-900 w-full max-w-sm rounded-[2rem] p-8 space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-3">
            <Settings className="w-12 h-12 text-amber-600 mx-auto" />
            <h3 className="text-xl font-bold tracking-tight dark:text-white">Admin</h3>
            <p className="text-stone-500 dark:text-stone-400 text-xs">Saisissez le code d&apos;accès</p>
          </div>
          <input
            type="password"
            placeholder="Code admin"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-950 border-none p-4 rounded-xl font-medium focus:ring-2 ring-amber-600 outline-none"
          />
          <button type="button" onClick={handleLogin} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm">
            Connexion
          </button>
        </div>
      </div>
    );
  }

  const fastFood = draft.filter((i) => i.category === 'Fast Food');
  const terrasse = draft.filter((i) => i.category === 'Terrasse');

  const renderEditor = (items: MenuItem[], cat: MenuCategory) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-amber-600">{cat}</h4>
        <button
          type="button"
          onClick={() => addItem(cat)}
          className="inline-flex items-center gap-1 text-xs font-bold bg-stone-100 dark:bg-white/10 px-3 py-2 rounded-xl hover:bg-amber-600 hover:text-white transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Ajouter
        </button>
      </div>
      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-stone-500 text-sm">Aucun plat dans cette section.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-4 space-y-3 border border-stone-100 dark:border-white/10"
            >
              <div className="flex gap-3">
                <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 p-2 rounded-lg text-sm font-bold"
                    placeholder="Nom"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                      className="w-28 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 p-2 rounded-lg text-sm"
                    />
                    <span className="text-xs text-stone-500 self-center">{item.priceString}</span>
                  </div>
                  <input
                    value={item.image}
                    onChange={(e) => updateItem(item.id, { image: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 p-2 rounded-lg text-xs font-mono"
                    placeholder="/image.png"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 p-2 rounded-lg text-xs min-h-[48px]"
                    placeholder="Description"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="self-start p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />
      <div className="relative bg-white dark:bg-stone-900 w-full max-w-lg max-h-[90vh] rounded-[2rem] flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-stone-100 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold dark:text-white">Gestion du menu</h3>
              <p className="text-xs text-stone-500">Modifications visibles en temps réel</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {renderEditor(fastFood, 'Fast Food')}
          {renderEditor(terrasse, 'Terrasse')}
        </div>
        <div className="p-6 border-t border-stone-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={saveAll}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-bold text-sm"
          >
            <Save className="w-4 h-4" /> Enregistrer et publier
          </button>
          <button type="button" onClick={handleClose} className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white py-3 rounded-xl font-bold text-sm">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
