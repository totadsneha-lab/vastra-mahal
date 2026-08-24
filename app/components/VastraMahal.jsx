"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  X,
  Plus,
  Minus,
  MessageCircle,
  Trash2,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------
   DESIGN TOKENS
   Ivory ground, deep maroon + antique gold + crimson accent.
   Signature element: a hand-drawn "gopuram" (temple-tower) border
   motif, echoing the woven zari borders on a Kanjeevaram/Banarasi
   saree — used as a real structural divider, not decoration.
------------------------------------------------------------------- */
const INK = "#2B2320";
const IVORY = "#FBF6EE";
const CARD = "#FFFDF9";
const MAROON = "#5B1420";
const MAROON_DEEP = "#3D0D16";
const GOLD = "#B08328";
const GOLD_SOFT = "#D9B978";
const CRIMSON = "#A22C2C";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap');
`;

/* Category → swatch gradient + weave color, standing in for photography
   with a woven-texture treatment instead of stock imagery. */
const CATEGORY_STYLE = {
  Banarasi: { from: "#4A0E18", to: "#8A5A1E", weave: "#E7C878" },
  Kanjeevaram: { from: "#123A34", to: "#8A5A1E", weave: "#E7C878" },
  Cotton: { from: "#EFE3C8", to: "#C9A45C", weave: "#5B1420" },
  "Daily Wear": { from: "#6E2340", to: "#B4784A", weave: "#F1DDB0" },
};

const PRODUCTS = [
  { id: 1, name: "Meenakari Zari Banarasi", category: "Banarasi", price: 8499, mrp: 10999, fabric: "Silk" },
  { id: 2, name: "Rani Pink Katan Silk", category: "Banarasi", price: 12999, mrp: 16499, fabric: "Silk" },
  { id: 3, name: "Temple Border Kanjeevaram", category: "Kanjeevaram", price: 15999, mrp: 19999, fabric: "Silk" },
  { id: 4, name: "Mustard Checks Kanjeevaram", category: "Kanjeevaram", price: 13499, mrp: 17999, fabric: "Silk" },
  { id: 5, name: "Handloom Ivory Cotton", category: "Cotton", price: 1899, mrp: 2399, fabric: "Cotton" },
  { id: 6, name: "Block Print Chanderi Cotton", category: "Cotton", price: 2299, mrp: 2999, fabric: "Cotton" },
  { id: 7, name: "Everyday Georgette", category: "Daily Wear", price: 1299, mrp: 1699, fabric: "Georgette" },
  { id: 8, name: "Office Wear Linen", category: "Daily Wear", price: 1599, mrp: 1999, fabric: "Linen" },
];

const CATEGORIES = ["All", "Banarasi", "Kanjeevaram", "Cotton", "Daily Wear"];
const FABRICS = ["Silk", "Cotton", "Georgette", "Linen"];

/* Repeating gopuram-tower border strip, drawn once and tiled via CSS. */
function GopuramBorder({ tone = GOLD, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 22"
      preserveAspectRatio="none"
      style={{ width: "100%", height: 14, display: "block" }}
    >
      <defs>
        <pattern id="gopuram" width="20" height="22" patternUnits="userSpaceOnUse">
          <polygon points="10,2 16,14 4,14" fill="none" stroke={tone} strokeWidth="1.1" />
          <circle cx="10" cy="18" r="1.3" fill={tone} />
          <line x1="0" y1="21" x2="20" y2="21" stroke={tone} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="120" height="22" fill="url(#gopuram)" />
    </svg>
  );
}

function FabricSwatch({ category }) {
  const s = CATEGORY_STYLE[category];
  return (
    <div
      className="relative w-full aspect-[3/4] overflow-hidden"
      style={{ background: `linear-gradient(155deg, ${s.from}, ${s.to})` }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
        <defs>
          <pattern id={`weave-${category}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={s.weave} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#weave-${category})`} />
      </svg>
      <div className="absolute bottom-0 left-0 right-0">
        <GopuramBorder tone={s.weave} />
      </div>
    </div>
  );
}

export default function VastraMahal() {
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedFabrics.length && !selectedFabrics.includes(p.fabric)) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [activeCategory, query, selectedFabrics, maxPrice]);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === Number(id)), qty }));

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  const addToCart = (id) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const p = PRODUCTS.find((x) => x.id === id);
    setToast(`${p.name} added to cart`);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 1600);
  };

  const changeQty = (id, delta) => {
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: next };
    });
  };

  const removeItem = (id) => {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  const toggleFabric = (f) => {
    setSelectedFabrics((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  const whatsappHref = useMemo(() => {
    const lines = cartItems.map(
      (i) => `• ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`
    );
    const text = [
      "Namaste NandrajTex, I'd like to order:",
      ...lines,
      `Total: ₹${cartTotal.toLocaleString("en-IN")}`,
    ].join("\n");
    return `https://wa.me/919148909543?text=${encodeURIComponent(text)}`;
  }, [cartItems, cartTotal]);

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: IVORY, color: INK }} className="min-h-screen w-full pb-8">
      <style>{FONTS}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-30" style={{ background: IVORY }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif", color: MAROON }}
            className="text-2xl tracking-[0.15em] font-semibold"
          >
            VASTRA MAHAL
          </h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-2"
            style={{ background: MAROON }}
            aria-label="Open cart"
          >
            <ShoppingBag size={18} color={IVORY} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: CRIMSON, color: IVORY }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2" style={{ background: CARD, border: `1px solid ${GOLD_SOFT}` }}>
            <Search size={16} color={GOLD} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, fabrics..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone-400"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen((v) => !v)}
            className="rounded-full p-2.5"
            style={{ background: isFilterOpen ? MAROON : CARD, border: `1px solid ${GOLD_SOFT}` }}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={16} color={isFilterOpen ? IVORY : MAROON} />
          </button>
        </div>

        {isFilterOpen && (
          <div className="mx-4 mb-3 rounded-xl p-4 space-y-4" style={{ background: CARD, border: `1px solid ${GOLD_SOFT}` }}>
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: MAROON }}>
                Fabric
              </p>
              <div className="flex flex-wrap gap-2">
                {FABRICS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFabric(f)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={
                      selectedFabrics.includes(f)
                        ? { background: MAROON, color: IVORY }
                        : { background: IVORY, color: INK, border: `1px solid ${GOLD_SOFT}` }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: MAROON }}>
                <span className="font-semibold tracking-wide uppercase">Max price</span>
                <span>₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#5B1420]"
              />
            </div>
          </div>
        )}

        <GopuramBorder tone={GOLD_SOFT} />
      </header>

      {/* HERO */}
      <section
        className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${MAROON_DEEP}, ${MAROON})` }}
      >
        <div className="px-5 pt-6 pb-5 relative z-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: GOLD_SOFT }}>
            New Arrivals
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl leading-tight text-[#FBF6EE] italic">
            Festive Collections
          </h2>
          <p className="text-sm mt-2 max-w-[220px]" style={{ color: "#E9D9C4" }}>
            Handwoven silks and everyday weaves, curated for this season.
          </p>
          <button
            onClick={() => setActiveCategory("Banarasi")}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: GOLD, color: MAROON_DEEP }}
          >
            Shop Banarasi <ChevronRight size={14} />
          </button>
        </div>
        <GopuramBorder tone={GOLD_SOFT} className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* CATEGORY SCROLLER */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 text-sm px-4 py-2 rounded-full whitespace-nowrap transition-colors"
            style={
              activeCategory === cat
                ? { background: MAROON, color: IVORY }
                : { background: CARD, color: INK, border: `1px solid ${GOLD_SOFT}` }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {filtered.map((p) => {
          const discount = Math.round(100 - (p.price / p.mrp) * 100);
          const qtyInCart = cart[p.id] || 0;
          return (
            <div key={p.id} className="rounded-xl overflow-hidden relative" style={{ background: CARD, border: `1px solid ${GOLD_SOFT}` }}>
              {discount > 0 && (
                <span
                  className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-1 rounded"
                  style={{ background: CRIMSON, color: IVORY }}
                >
                  {discount}% OFF
                </span>
              )}
              <FabricSwatch category={p.category} />
              <div className="p-3">
                <p className="text-[11px] uppercase tracking-wide" style={{ color: GOLD }}>
                  {p.category}
                </p>
                <h3 className="text-sm font-semibold leading-snug mt-0.5" style={{ color: INK }}>
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-sm font-bold" style={{ color: MAROON }}>
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  {discount > 0 && (
                    <span className="text-xs line-through text-stone-400">₹{p.mrp.toLocaleString("en-IN")}</span>
                  )}
                </div>

                {qtyInCart === 0 ? (
                  <button
                    onClick={() => addToCart(p.id)}
                    className="mt-3 w-full text-xs font-semibold py-2 rounded-lg transition-transform active:scale-95"
                    style={{ background: MAROON, color: IVORY }}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-lg overflow-hidden" style={{ border: `1px solid ${MAROON}` }}>
                    <button onClick={() => changeQty(p.id, -1)} className="p-2" style={{ color: MAROON }}>
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold" style={{ color: MAROON }}>
                      {qtyInCart}
                    </span>
                    <button onClick={() => changeQty(p.id, 1)} className="p-2" style={{ color: MAROON }}>
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-sm" style={{ color: "#8A7E6E" }}>
            No sarees match your search. Try clearing a filter.
          </div>
        )}
      </div>

      {/* ADD-TO-CART TOAST */}
      {toast && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 text-xs font-medium px-4 py-2 rounded-full shadow-lg"
          style={{ background: MAROON_DEEP, color: IVORY }}
        >
          {toast}
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm flex flex-col"
            style={{ background: IVORY, boxShadow: "-4px 0 24px rgba(0,0,0,0.25)" }}
          >
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${GOLD_SOFT}` }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: MAROON }} className="text-xl font-semibold">
                Your Cart
              </h3>
              <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                <X size={20} color={MAROON} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.length === 0 && (
                <p className="text-sm text-center py-10" style={{ color: "#8A7E6E" }}>
                  Your cart is empty. Add a saree to begin.
                </p>
              )}
              {cartItems.map((i) => (
                <div key={i.id} className="flex gap-3 rounded-lg p-2" style={{ background: CARD, border: `1px solid ${GOLD_SOFT}` }}>
                  <div className="w-16 shrink-0 rounded overflow-hidden">
                    <FabricSwatch category={i.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: INK }}>
                      {i.name}
                    </p>
                    <p className="text-xs" style={{ color: GOLD }}>
                      ₹{i.price.toLocaleString("en-IN")} × {i.qty}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${MAROON}` }}>
                        <button onClick={() => changeQty(i.id, -1)} className="p-1" style={{ color: MAROON }}>
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-semibold" style={{ color: MAROON }}>
                          {i.qty}
                        </span>
                        <button onClick={() => changeQty(i.id, 1)} className="p-1" style={{ color: MAROON }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(i.id)} aria-label="Remove item">
                        <Trash2 size={14} color={CRIMSON} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pt-3 pb-5 space-y-3" style={{ borderTop: `1px solid ${GOLD_SOFT}` }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A7E6E" }}>Subtotal</span>
                <span className="font-bold" style={{ color: MAROON }}>
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <a
                href={cartItems.length ? whatsappHref : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!cartItems.length) e.preventDefault();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-opacity"
                style={{
                  background: cartItems.length ? "#25D366" : "#B9DFC6",
                  color: MAROON_DEEP,
                  pointerEvents: cartItems.length ? "auto" : "none",
                }}
              >
                <MessageCircle size={16} />
                Proceed to Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
