import React, { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Trash2,
  PlusCircle,
  Save,
  X,
  Upload,
  Loader2,
  Check,
  ShoppingBag,
  Trees,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { MenuItem, MenuCategory } from './types';
import {
  getSupabaseClient,
  RESTAURANT_MENU_ROW_ID,
  RESTAURANT_MENU_TABLE,
} from './supabaseClient';

const ADMIN_CODE = '7450';

function formatPriceString(n: number): string {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function newMenuItem(category: MenuCategory): MenuItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    name: 'Nouveau plat',
    description: 'Description du plat',
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

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3
        px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm whitespace-nowrap
        ${ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        animate-bounce-once`}
    >
      {ok ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
      {msg}
    </div>
  );
}

/* ─── Item card (inside panel) ───────────────────────────────────────────── */
function ItemCard({
  item,
  onUpdate,
  onRemove,
  onImageClick,
  isUploading,
}: {
  item: MenuItem;
  onUpdate: (id: string, patch: Partial<MenuItem>) => void;
  onRemove: (id: string) => void;
  onImageClick: (id: string) => void;
  isUploading: boolean;
}) {
  return (
    <article className="group bg-white dark:bg-stone-800 rounded-[1.5rem] overflow-hidden border border-stone-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative w-full h-40 overflow-hidden bg-stone-100 dark:bg-stone-900">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
        />
        <button
          type="button"
          onClick={() => onImageClick(item.id)}
          disabled={isUploading}
          aria-label="Changer la photo"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2
            bg-stone-900/0 group-hover:bg-stone-900/50 transition-all duration-300
            text-white opacity-0 group-hover:opacity-100"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 drop-shadow" />
              <span className="text-xs font-bold uppercase tracking-widest drop-shadow">Changer la photo</span>
            </>
          )}
        </button>
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          {item.category}
        </span>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <input
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          placeholder="Nom du plat"
          className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10
            rounded-xl px-3 py-2 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 ring-amber-500"
        />

        {/* Price */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={item.price}
            onChange={(e) => onUpdate(item.id, { price: Number(e.target.value) })}
            className="w-32 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10
              rounded-xl px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 ring-amber-500"
          />
          <span className="text-amber-600 font-black text-sm flex-1">{item.priceString}</span>
        </div>

        {/* Description */}
        <textarea
          value={item.description ?? ''}
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          placeholder="Description (optionnel)"
          rows={2}
          className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10
            rounded-xl px-3 py-2 text-xs dark:text-white resize-none focus:outline-none focus:ring-2 ring-amber-500"
        />

        {/* Delete */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
            text-red-500 border border-red-100 dark:border-red-900/40
            hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </article>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function AdminMenuPanel({ isOpen, onClose, menu, setMenu }: Props) {
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [draft, setDraft] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<MenuCategory>('Fast Food');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingIdRef = useRef<string | null>(null);

  /* Sync draft with menu when opened */
  useEffect(() => {
    if (isOpen && isAuthed) {
      setDraft(JSON.parse(JSON.stringify(menu)) as MenuItem[]);
    }
  }, [isOpen, isAuthed, menu]);

  if (!isOpen) return null;

  /* ── helpers ── */
  const pushToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = () => {
    if (pass === ADMIN_CODE) {
      setIsAuthed(true);
      setDraft(JSON.parse(JSON.stringify(menu)) as MenuItem[]);
    } else {
      pushToast('Code incorrect', false);
    }
  };

  const handleClose = () => {
    setPass('');
    setIsAuthed(false);
    onClose();
  };

  /* ── Save: push directly to Supabase so all clients receive real-time update ── */
  const saveAll = async () => {
    setIsSaving(true);
    const finalized = draft.map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      priceString: formatPriceString(Number(item.price) || 0),
    }));

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from(RESTAURANT_MENU_TABLE).upsert(
          { id: RESTAURANT_MENU_ROW_ID, items: finalized, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
        if (error) throw error;
        // local state will be updated via the realtime channel subscription in App.tsx
        // but we force it immediately for the admin's own view
        setMenu(finalized);
        pushToast('✅ Menu publié en temps réel pour tous les visiteurs !', true);
      } else {
        // No Supabase — update local only
        setMenu(finalized);
        pushToast('Sauvegardé localement (Supabase non configuré)', false);
      }
    } catch (err) {
      console.error('[Admin] Save error:', err);
      // fallback: at least update local state
      setMenu(finalized);
      pushToast('Erreur réseau — sauvegardé localement', false);
    } finally {
      setIsSaving(false);
    }
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
    if (!window.confirm('Supprimer ce plat du menu ?')) return;
    setDraft((prev) => prev.filter((it) => it.id !== id));
  };

  const addItem = () => {
    setDraft((prev) => [...prev, newMenuItem(activeTab)]);
  };

  const handleImageClick = (id: string) => {
    editingIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = editingIdRef.current;
    if (!file || !itemId) return;

    setUploadingId(itemId);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `menu-${itemId}-${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
          .from('menu-images')
          .upload(fileName, file, { upsert: true });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('menu-images')
            .getPublicUrl(fileName);
          updateItem(itemId, { image: urlData.publicUrl });
          pushToast('Photo mise à jour !', true);
        } else {
          throw error;
        }
      } else {
        throw new Error('No Supabase');
      }
    } catch {
      /* Fallback: base64 embed (works locally or without storage) */
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateItem(itemId, { image: ev.target?.result as string });
        pushToast('Photo mise à jour (locale)', true);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  /* ── Displayed items for current tab ── */
  const tabItems = draft.filter((i) => i.category === activeTab);
  const fastCount = draft.filter((i) => i.category === 'Fast Food').length;
  const terrCount = draft.filter((i) => i.category === 'Terrasse').length;

  /* ─────────────── LOGIN SCREEN ─────────────── */
  if (!isAuthed) {
    return (
      <>
        {toast && <Toast msg={toast.msg} ok={toast.ok} />}
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-sm rounded-[2rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-600/30">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight dark:text-white">Mode Admin</h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs">Saisissez le code d'accès pour gérer le menu</p>
            </div>
            <div className="relative">
              <input
                id="admin-code-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Code admin"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-stone-50 dark:bg-stone-950 px-4 py-3 pr-12 rounded-xl font-bold
                  text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 ring-amber-500 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600"
                aria-label={showPass ? 'Masquer' : 'Afficher'}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
            >
              Connexion
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ─────────────── ADMIN DASHBOARD ─────────────── */
  return (
    <>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={handleClose} />

        <div className="relative bg-stone-50 dark:bg-stone-900 w-full max-w-4xl max-h-[92vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-4 px-6 py-5 bg-stone-900 dark:bg-stone-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/30">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Gestion du Menu</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Modifications en temps réel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 px-6 pt-4 pb-0 bg-stone-50 dark:bg-stone-900">
            {([
              { cat: 'Fast Food' as MenuCategory, icon: ShoppingBag, count: fastCount },
              { cat: 'Terrasse' as MenuCategory, icon: Trees, count: terrCount },
            ] as const).map(({ cat, icon: Icon, count }) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all
                  ${activeTab === cat
                    ? 'bg-white dark:bg-stone-800 text-amber-600 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {cat}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black
                  ${activeTab === cat ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Grid of cards ── */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-stone-800 p-6">
            {tabItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-stone-400">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <p className="text-sm font-bold">Aucun plat dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tabItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                    onImageClick={handleImageClick}
                    isUploading={uploadingId === item.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Footer actions ── */}
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={addItem}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2
                bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600
                text-stone-900 dark:text-white py-3 px-5 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter un plat
            </button>

            <button
              type="button"
              onClick={saveAll}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-2
                bg-amber-600 hover:bg-amber-700 disabled:opacity-60
                text-white py-3 px-6 rounded-xl font-black text-sm uppercase tracking-widest
                transition-all shadow-lg shadow-amber-600/30"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Publication en cours…</>
              ) : (
                <><Save className="w-4 h-4" />Enregistrer et Publier</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
