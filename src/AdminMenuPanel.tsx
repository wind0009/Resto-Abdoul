import React, { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Trash2,
  Plus,
  Minus,
  Save,
  X,
  ImagePlus,
  Loader2,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import type { MenuItem, MenuCategory } from './types';
import {
  getSupabaseClient,
  RESTAURANT_MENU_ROW_ID,
  RESTAURANT_MENU_TABLE,
} from './supabaseClient';

const ADMIN_CODE = '7450';

function formatPriceString(n: number): string {
  return `${Number(n).toLocaleString('en-US')} FCFA`;
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

/* ─── Toast notification ────────────────────────────────────────────────── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3
        px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm whitespace-nowrap
        ${ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
      role="status"
      aria-live="polite"
    >
      {ok ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
      {msg}
    </div>
  );
}

/* ─── Single menu item editor card ──────────────────────────────────────── */
function ItemEditor({
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
  const [showDesc, setShowDesc] = useState(!!item.description);
  const [showImageUrl, setShowImageUrl] = useState(false);

  return (
    <article className="bg-stone-900 rounded-[1.5rem] overflow-hidden border border-stone-700/50">
      {/* ── Photo ── */}
      <div className="p-4 pb-0">
        <div className="w-full max-w-[280px] h-[180px] rounded-2xl overflow-hidden bg-stone-800">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>
      </div>

      {/* ── Upload button ── */}
      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={() => onImageClick(item.id)}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
            border-2 border-dashed border-amber-600/60 text-amber-500
            hover:border-amber-500 hover:text-amber-400 transition-colors text-sm font-bold"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
          {isUploading ? 'Envoi en cours…' : 'Photo (galerie ou appareil photo)'}
        </button>
      </div>

      {/* ── Fields ── */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-stone-400 text-xs font-bold uppercase tracking-wider">Nom du plat</label>
          <input
            value={item.name}
            onChange={(e) => onUpdate(item.id, { name: e.target.value })}
            placeholder="Nom du plat"
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3
              text-white text-sm font-medium focus:outline-none focus:border-amber-600
              placeholder:text-stone-500 transition-colors"
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-stone-400 text-xs font-bold uppercase tracking-wider">Prix (FCFA)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onUpdate(item.id, { price: Math.max(0, (item.price || 0) - 100) })}
              className="w-10 h-10 flex items-center justify-center rounded-xl
                bg-stone-800 border border-stone-700 text-stone-300 hover:border-amber-600
                hover:text-amber-500 transition-colors"
              aria-label="Réduire le prix"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={0}
              value={item.price}
              onChange={(e) => onUpdate(item.id, { price: Number(e.target.value) })}
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5
                text-white text-center text-lg font-bold focus:outline-none focus:border-amber-600
                transition-colors"
            />
            <button
              type="button"
              onClick={() => onUpdate(item.id, { price: (item.price || 0) + 100 })}
              className="w-10 h-10 flex items-center justify-center rounded-xl
                bg-stone-800 border border-stone-700 text-stone-300 hover:border-amber-600
                hover:text-amber-500 transition-colors"
              aria-label="Augmenter le prix"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-amber-500 font-bold text-sm text-center">{item.priceString}</p>
        </div>

        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="text-stone-400 text-xs font-bold uppercase tracking-wider">
            Où apparaît sur le site ?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Fast Food', 'Terrasse'] as MenuCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onUpdate(item.id, { category: cat })}
                className={`py-2.5 rounded-xl font-bold text-sm transition-all
                  ${item.category === cat
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                    : 'bg-stone-800 border border-stone-700 text-stone-400 hover:border-amber-600/50'
                  }`}
              >
                {cat === 'Fast Food' ? 'Fast food' : 'Terrasse'}
              </button>
            ))}
          </div>
        </div>

        {/* Description (collapsible) */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowDesc(!showDesc)}
            className="flex items-center gap-1 text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-amber-500 transition-colors"
          >
            Description (facultatif)
            <ChevronDown className={`w-3 h-3 transition-transform ${showDesc ? 'rotate-180' : ''}`} />
          </button>
          {showDesc && (
            <textarea
              value={item.description ?? ''}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              placeholder="Décrivez votre plat…"
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3
                text-white text-sm resize-none focus:outline-none focus:border-amber-600
                placeholder:text-stone-500 transition-colors"
            />
          )}
        </div>

        {/* Image URL (collapsible / advanced) */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowImageUrl(!showImageUrl)}
            className="text-amber-600/60 text-xs underline hover:text-amber-500 transition-colors"
          >
            Lien de l'image (pour utilisateurs avancés)
          </button>
          {showImageUrl && (
            <input
              value={item.image}
              onChange={(e) => onUpdate(item.id, { image: e.target.value })}
              placeholder="/image.png ou https://..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3
                text-white text-xs font-mono focus:outline-none focus:border-amber-600
                placeholder:text-stone-500 transition-colors"
            />
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
            border border-red-500/40 text-red-400 font-bold text-sm
            hover:bg-red-500/10 hover:border-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Enlever ce plat
        </button>
      </div>
    </article>
  );
}

/* ─── Main AdminMenuPanel component ─────────────────────────────────────── */
export function AdminMenuPanel({ isOpen, onClose, menu, setMenu }: Props) {
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [draft, setDraft] = useState<MenuItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Tous' | MenuCategory>('Tous');
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

  /* ── Save: push directly to Supabase ── */
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
        setMenu(finalized);
        pushToast('✅ Menu publié ! Visible par tous les visiteurs.', true);
      } else {
        setMenu(finalized);
        pushToast('Sauvegardé localement (Supabase non configuré)', false);
      }
    } catch (err) {
      console.error('[Admin] Save error:', err);
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
    const cat: MenuCategory = activeFilter === 'Tous' ? 'Fast Food' : activeFilter;
    setDraft((prev) => [newMenuItem(cat), ...prev]);
    // scroll to top
    document.getElementById('admin-items-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
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
      /* Fallback: base64 embed */
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

  /* ── Filtered items ── */
  const filteredItems =
    activeFilter === 'Tous' ? draft : draft.filter((i) => i.category === activeFilter);

  const tabs: { label: string; value: 'Tous' | MenuCategory }[] = [
    { label: 'Tous', value: 'Tous' },
    { label: 'Fast food', value: 'Fast Food' },
    { label: 'Terrasse', value: 'Terrasse' },
  ];

  /* ─────────────── LOGIN SCREEN ─────────────── */
  if (!isAuthed) {
    return (
      <>
        {toast && <Toast msg={toast.msg} ok={toast.ok} />}
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md" onClick={handleClose} />
          <div className="relative bg-stone-900 w-full max-w-sm rounded-[2rem] p-8 space-y-6 shadow-2xl border border-stone-700/50">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-600/30">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Mode Admin</h3>
              <p className="text-stone-400 text-xs">Saisissez le code d'accès pour gérer le menu</p>
            </div>
            <div className="relative">
              <input
                id="admin-code-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Code admin"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-stone-800 border border-stone-700 px-4 py-3 pr-12 rounded-xl font-bold
                  text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-amber-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-500 transition-colors"
                aria-label={showPass ? 'Masquer' : 'Afficher'}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl
                font-black text-sm uppercase tracking-widest transition-colors"
            >
              Connexion
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ─────────────── ADMIN DASHBOARD (full screen) ─────────────── */
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

      <div className="fixed inset-0 z-[130] bg-stone-950 flex flex-col">
        {/* ── Header ── */}
        <header className="flex items-start justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Mon menu</h2>
            <p className="text-stone-500 text-xs mt-0.5">Enregistre tout seul sur cet appareil</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-stone-800 border border-stone-700 text-stone-400
              hover:text-white hover:border-stone-500 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ── + Nouveau plat ── */}
        <div className="px-5 pb-3">
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
              bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm
              uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-5 h-5" />
            Nouveau plat
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 px-5 pb-4">
          {tabs.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all
                ${activeFilter === value
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Items list (scrollable) ── */}
        <div id="admin-items-scroll" className="flex-1 overflow-y-auto px-5 pb-28 space-y-5">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-stone-500">
              <ImagePlus className="w-12 h-12 opacity-30" />
              <p className="text-sm font-bold">Aucun plat dans cette catégorie</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemEditor
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
                onImageClick={handleImageClick}
                isUploading={uploadingId === item.id}
              />
            ))
          )}
        </div>

        {/* ── Fixed save button at bottom ── */}
        <div className="fixed bottom-0 left-0 right-0 z-[140] px-5 py-4 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent">
          <button
            type="button"
            onClick={saveAll}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
              bg-amber-600 hover:bg-amber-700 disabled:opacity-60
              text-white font-black text-sm uppercase tracking-widest
              transition-all shadow-xl shadow-amber-600/30"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Publication en cours…</>
            ) : (
              <><Save className="w-5 h-5" />Enregistrer et Publier</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
