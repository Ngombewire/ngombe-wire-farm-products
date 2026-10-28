"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";

type Unit = "roll" | "coil" | "panel" | "package" | "sheet" | "piece" | "kg";
type ChoiceField = { key: string; label: string; options: string[] };
type SelectedSpec = { label: string; value: string };
type Product = {
  id: number;
  name: string;
  description: string;
  unit: Unit;
  image: string;
  price: number | null;
  fields: ChoiceField[];
  fixedSpecifications?: string[];
};
type CartItem = {
  key: string;
  productId: number;
  selections: SelectedSpec[];
  quantity: number;
};

const field = (key: string, label: string, options: string[]): ChoiceField => ({
  key, label, options,
});

// Product options below follow the shop owner's latest selection requirements.
// Verify physical stock and the scope of Clear View Fence packages before publishing.
// Published KSh prices come from the owner, including A142 at KSh 15,500.
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Chainlink Fencing",
    description: "14G chainlink fencing in normal and galvanized types, supplied in 4 ft wide rolls.",
    unit: "roll",
    image: "chainlink-fencing.jpg",
    price: null,
    fields: [
      field("type", "Chainlink type", ["Normal", "Galvanized"]),
      field("plot", "Farm / plot size (optional)", [
        "50 ft × 100 ft plot (5 rolls)",
        "100 ft × 100 ft plot (7 rolls)",
        "1 acre plot (14 rolls)",
      ]),
    ],
    fixedSpecifications: ["Wire gauge: 14G", "Roll width: 4 ft", "Roll length: 18 m"],
  },
  {
    id: 2,
    name: "Clear View Fence",
    description: "Close-aperture security fence sold as a plot-size selection; confirm package contents before placing your order.",
    unit: "package",
    image: "clear-view-fence.jpg",
    price: null,
    fields: [
      field("siteSize", "Plot size", ["50 ft × 100 ft", "100 ft × 100 ft"]),
    ],
    fixedSpecifications: ["Panel height: 8 ft"],
  },
  {
    id: 3,
    name: "Kuku Net Chicken Wire",
    description: "Ng'ombe Kuku Net chicken wire for poultry and farm enclosures.",
    unit: "roll",
    image: "metal-chicken-wire.jpg",
    price: 10500,
    fields: [],
    fixedSpecifications: ["Mesh size: 3/4'' mesh", "Roll length: 30 m"],
  },
  {
    id: 4,
    name: "Plastic Chicken Mesh",
    description: "Flexible HDPE poultry mesh for coops, garden partitions and lightweight farm enclosures. Rust-free and easy to trim.",
    unit: "roll",
    image: "plastic-chicken-mesh.jpg",
    price: 2200,
    fields: [],
    fixedSpecifications: ["Roll height: 4 ft", "Roll length: 30 m"],
  },
  {
    id: 5,
    name: "Barbed Wire",
    description: "Hot-dip galvanized Ng'ombe barbed wire for livestock boundaries, farms and perimeter fencing.",
    unit: "roll",
    image: "barbed-wire.jpg",
    price: 5500,
    fields: [],
    fixedSpecifications: ["Length: 610 m", "30 kg"],
  },
  {
    id: 6,
    name: "Razor Wire",
    description: "Ng'ombe concertina razor wire for securing walls and perimeters.",
    unit: "coil",
    image: "razor-wire.jpg",
    price: null,
    fields: [field("diameter", "Coil diameter", ["450 mm", "730 mm", "980 mm"])],
    fixedSpecifications: ["Type: Concertina", "Standard selling length: 10 m"],
  },
  {
    id: 7,
    name: "BRC Mesh",
    description: "Welded steel concrete reinforcement mesh for floor slabs, paths and paving. Choose the grade specified in your structural drawings.",
    unit: "roll", // A66, A98 and A142 are all 48 m rolls.
    image: "brc-mesh.jpg",
    price: null,
    fields: [field("grade", "Reinforcement grade", ["A66", "A98", "A142"])],
  },
  {
    id: 8,
    name: "Metal Poles",
    description: "8 ft round and square steel poles for farm fences and structures.",
    unit: "piece",
    image: "metal-poles.jpg",
    price: null,
    fields: [
      field("profile", "Pole type", ["Round", "Square"]),
    ],
    fixedSpecifications: ["Pole height: 8 ft"],
  },
  {
    id: 9,
    name: "Binding Wire",
    description: "Flexible black annealed wire for securely tying steel reinforcement and mesh during concrete work.",
    unit: "roll",
    image: "binding-wire.jpg",
    price: 2100,
    fields: [],
    fixedSpecifications: ["Wire gauge: 16 Gauge", "25 kg"],
  },
  {
    id: 10,
    name: "Hoop Iron",
    description: "Mild-steel hoop iron strapping for masonry reinforcement and construction tie-down work.",
    unit: "roll",
    image: "hoop-iron.jpg",
    price: 1700,
    fields: [],
    fixedSpecifications: ["16 Gauge", "20 kg"],
  },
  {
    id: 11,
    name: "Ordinary Nails",
    description: "Mild-steel common nails for timber work, formwork, construction and general repairs; sold by weight.",
    unit: "kg",
    image: "ordinary-nails.jpg",
    price: null,
    fields: [field("length", "Nail length", ["1 inch", "1½ inch", "2 inch", "2½ inch", "3 inch", "4 inch", "5 inch", "6 inch"])],
  },
  {
    id: 13,
    name: "U Nails",
    description: "Galvanized U-shaped fence staples for fastening chainlink or barbed wire to timber posts; sold by weight.",
    unit: "kg",
    image: "u-nails.jpg",
    price: null,
    fields: [field("length", "Staple length", ["½ inch", "1 inch"])],
  },
  {
    id: 12,
    name: "Roofing Nails",
    description: "Roofing nails for securing mabati sheets to suitable timber supports. Select the correct length and use appropriate washers.",
    unit: "kg",
    image: "roofing-nails.jpg",
    price: null,
    fields: [field("length", "Nail length", ["2 inch", "2½ inch", "3 inch"])],
  },
];

// All available BRC Mesh grades are sold as 48 m rolls.
const BRC_DETAILS: Record<string, string> = {
  A66: "Roll length: 48 m",
  A98: "Roll length: 48 m",
  A142: "Roll length: 48 m",
};

function getFields(product: Product, _choices: Record<string, string>): ChoiceField[] {
  return product.fields;
}

const CHAINLINK_ROLLS_BY_PLOT: Record<string, number> = {
  "50 ft × 100 ft plot (5 rolls)": 5,
  "100 ft × 100 ft plot (7 rolls)": 7,
  "1 acre plot (14 rolls)": 14,
};

function validChoices(fields: ChoiceField[], choices: Record<string, string>): boolean {
  return fields.every((item) =>
    item.key === "plot"
      ? !choices.plot || item.options.includes(choices.plot)
      : item.options.includes(choices[item.key] ?? "")
  );
}

function makeCartKey(productId: number, specs: SelectedSpec[]): string {
  return JSON.stringify([productId, ...specs.map(({ label, value }) => [label, value])]);
}

function effectiveUnit(product: Product, _selections: SelectedSpec[]): Unit {
  return product.unit;
}

function getSelectedDetail(product: Product, selections: SelectedSpec[]): string | null {
  if (product.id !== 7) return null;
  const grade = selections.find((entry) => entry.label === "Reinforcement grade")?.value;
  return BRC_DETAILS[grade ?? ""] ?? null;
}

// Owner-provided prices in KSh. Keys use the exact selectable specification
// labels/values from PRODUCTS, so the selected variant drives the price.
// The owner supplied the A98 price of KSh 10,000, now available again.
// A142 is KSh 15,500 per 48 m roll, as confirmed by the owner.
const priceFor = (productId: number, label: string, value: string): string =>
  makeCartKey(productId, [{ label, value }]);

const VARIANT_PRICES: Record<string, number> = {
  // Chainlink Fencing: 14G, 4 ft wide, 18 m length.
  [priceFor(1, "Chainlink type", "Normal")]: 3900,
  [priceFor(1, "Chainlink type", "Galvanized")]: 8500,

  // Clear View Fence: prices supplied by plot option.
  // Treated as one plot-size package, NOT a per-panel price.
  [priceFor(2, "Plot size", "50 ft × 100 ft")]: 14000,
  [priceFor(2, "Plot size", "100 ft × 100 ft")]: 22000,

  // Razor Wire: Concertina type, 10 m coil length.
  [priceFor(6, "Coil diameter", "450 mm")]: 2800,
  [priceFor(6, "Coil diameter", "730 mm")]: 3500,
  [priceFor(6, "Coil diameter", "980 mm")]: 5000,

  // BRC Mesh: all offered as 48 m rolls, with confirmed prices.
  [priceFor(7, "Reinforcement grade", "A66")]: 5000,
  [priceFor(7, "Reinforcement grade", "A98")]: 10000,
  [priceFor(7, "Reinforcement grade", "A142")]: 15500,

  // Metal Poles: 8 ft high.
  [priceFor(8, "Pole type", "Round")]: 3200,
  [priceFor(8, "Pole type", "Square")]: 3600,

  // Ordinary Nails: KSh per kilogram (minimum 2 kg order).
  [priceFor(11, "Nail length", "1 inch")]: 170,
  [priceFor(11, "Nail length", "1½ inch")]: 170,
  [priceFor(11, "Nail length", "2 inch")]: 195,
  [priceFor(11, "Nail length", "2½ inch")]: 195,
  [priceFor(11, "Nail length", "3 inch")]: 200,
  [priceFor(11, "Nail length", "4 inch")]: 200,
  [priceFor(11, "Nail length", "5 inch")]: 200,
  [priceFor(11, "Nail length", "6 inch")]: 200,

  // U Nails: KSh per kilogram.
  [priceFor(13, "Staple length", "½ inch")]: 200,
  [priceFor(13, "Staple length", "1 inch")]: 200,

  // Roofing Nails: KSh per kilogram.
  [priceFor(12, "Nail length", "2 inch")]: 170,
  [priceFor(12, "Nail length", "2½ inch")]: 170,
  [priceFor(12, "Nail length", "3 inch")]: 180,
};
function getPrice(product: Product, key: string): number | null {
  return VARIANT_PRICES[key] ?? product.price;
}

// Nails are sold from 2 kg in whole-kilogram increments; other products start at one unit.
const minQuantity = (product: Product) => product.unit === "kg" ? 2 : 1;
const quantityStep = (_product: Product) => 1;
const formatQuantity = (value: number, unit: Unit) =>
  unit === "kg" ? `${value} kg` : `${value} ${unit}${value === 1 ? "" : "s"}`;
// Fixed weights are PRODUCT SPECIFICATIONS, not quantities. The customer
// chooses 1, 2, 3... stocked items; their total weight is shown separately.
// Prices (when supplied) are per item rather than per kilogram.
const FIXED_WEIGHT_KG: Record<number, number> = {
  5: 30,  // Barbed Wire
  9: 25,  // Binding Wire
  10: 20, // Hoop Iron
};
function getTotalWeightKg(product: Product, quantity: number): number | null {
  const weight = FIXED_WEIGHT_KG[product.id];
  return weight === undefined ? null : weight * quantity;
}
function getDisplayedQuantity(product: Product, quantity: number, selections: SelectedSpec[]): string {
  if (FIXED_WEIGHT_KG[product.id] !== undefined) {
    return `${quantity} ${quantity === 1 ? "item" : "items"}`;
  }
  return formatQuantity(quantity, effectiveUnit(product, selections));
}
function getDisplayedUnit(product: Product, selections: SelectedSpec[]): string {
  return FIXED_WEIGHT_KG[product.id] !== undefined ? "items" : effectiveUnit(product, selections);
}
function getPriceUnit(product: Product, selections: SelectedSpec[]): string {
  return FIXED_WEIGHT_KG[product.id] !== undefined ? "item" : effectiveUnit(product, selections);
}
function clampQuantity(value: number, product: Product): number {
  const step = quantityStep(product);
  if (!Number.isFinite(value)) return minQuantity(product);
  return Math.max(minQuantity(product), Math.min(10000, Math.round(value / step) * step));
}

const FEATURED = [PRODUCTS[0], PRODUCTS[6], PRODUCTS[4], PRODUCTS[7], PRODUCTS[1]];
const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});
// Verified public business contacts. No environment file is needed for these links.
const whatsApp = "254785583204";
const phone = "+254737313229";
const email = "ngombewireproducts@gmail.com";
const facebook = "https://www.facebook.com/share/1Dh7SHuAoR/";
const validWhatsApp = /^\d{10,15}$/.test(whatsApp);
const validPhone = /^\+?[\d\s()-]{9,25}$/.test(phone);
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validFacebook = (() => {
  try {
    const url = new URL(facebook);
    return url.protocol === "https:" &&
      ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com"].includes(url.hostname);
  } catch {
    return false;
  }
})();

function ProductImage({ filename, alt, className = "" }: {
  filename: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#E8F0F1] ${className}`} style={{ position: "relative" }}>
      <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[#69838A]">
        Product image coming soon
      </div>
      {!error && (
        <Image
          src={`/images/products/${filename}`}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="image-pan object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block h-12 w-28 overflow-hidden rounded-lg bg-[#FFE135]" style={{ position: "relative" }}>
        <Image
          src="/images/branding/logo.png"
          alt="Ng'ombe Products logo"
          fill
          unoptimized
          sizes="112px"
          className="object-contain"
        />
      </span>
      <span className="hidden leading-tight sm:block">
        <strong className="block text-lg font-extrabold text-[#172F39]">Ng&apos;ombe</strong>
        <small className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#648089]">Farm Products</small>
      </span>
    </span>
  );
}


// Brand-coloured contact shortcuts use locally rendered SVGs, without external icon assets.
function WhatsAppBrandIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M16 3.4A12.5 12.5 0 0 0 5.1 22.1l-1.5 6 6.2-1.6A12.5 12.5 0 1 0 16 3.4Z" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.2 9.1c-.6-.3-1.2-.2-1.6.3-.8.8-1.1 1.8-.7 3.2 1.1 3.9 4.6 7.6 8.4 8.6 1.5.5 2.8.2 3.7-.7.6-.6.7-1.4.4-1.9l-3.2-1.5a.7.7 0 0 0-.9.2l-1.2 1.3a12 12 0 0 1-5-5l1.3-1.2c.3-.3.3-.6.2-.9l-1.4-2.4Z" fill="currentColor" />
    </svg>
  );
}

function FacebookBrandIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M15.45 21v-7.8h2.62l.39-3.03h-3.01V8.24c0-.88.24-1.48 1.51-1.48h1.61V4.05c-.28-.04-1.23-.12-2.35-.12-2.34 0-3.95 1.43-3.95 4.05v2.19H9.63v3.03h2.64V21h3.18Z" />
    </svg>
  );
}

type CartRow = CartItem & { product: Product; price: number | null };

// Build a clear order summary for each requested product, including its chosen
// variant, the number of selling units, and any verified price. This helper is
// shared by the product-card shortcut and the full-cart WhatsApp checkout.
function formatWhatsAppItem(item: CartRow, index: number): string[] {
  const gradeDetail = getSelectedDetail(item.product, item.selections);
  return [
    `${index + 1}. ${item.product.name}`,
    ...item.selections.map(({ label, value }) => `   ${label}: ${value}`),
    ...(item.product.fixedSpecifications ?? []).map((spec) => `   ${spec}`),
    ...(gradeDetail ? [`   ${gradeDetail}`] : []),
    `   Quantity: ${getDisplayedQuantity(item.product, item.quantity, item.selections)}`,
    ...(getTotalWeightKg(item.product, item.quantity) === null
      ? []
      : [`   Total weight: ${getTotalWeightKg(item.product, item.quantity)} kg`]),
    ...(item.price === null ? ["   Price: To be confirmed"] : [
      `   Unit price: ${currency.format(item.price)} / ${getPriceUnit(item.product, item.selections)}`,
      `   Subtotal: ${currency.format(item.price * item.quantity)}`,
    ]),
    "",
  ];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<number, Record<string, string>>>({});
  const [draftQuantities, setDraftQuantities] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [pauseSlides, setPauseSlides] = useState(false);
  const [deliveryTown, setDeliveryTown] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const visibleProducts = useMemo(() => PRODUCTS.filter((product) => {
    const searchText = [
      product.name, product.description,
      ...(product.fixedSpecifications ?? []),
      ...(product.id === 7 ? Object.values(BRC_DETAILS) : []),
      ...product.fields.flatMap((item) => item.options),
    ].join(" ").toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  }), [query]);

  const cartLines: CartRow[] = cart.flatMap((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    if (!product) return [];
    return [{ ...item, product, price: getPrice(product, item.key) }];
  });
  // The cart badge counts different product selections, not weight or item count.
  const cartCount = cartLines.length;
  const hasTotal = cartLines.length > 0 && cartLines.every((item) => item.price !== null);
  const cartTotal = cartLines.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const hasUnpricedItems = cartLines.some((item) => item.price === null);

  useEffect(() => {
    if (pauseSlides) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlide((old) => (old + 1) % FEATURED.length), 6000);
    return () => window.clearInterval(timer);
  }, [pauseSlides]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen]);

  useEffect(() => {
    if (!recentlyAdded) return;
    const timer = window.setTimeout(() => setRecentlyAdded(null), 1500);
    return () => window.clearTimeout(timer);
  }, [recentlyAdded]);

  function setChoice(productId: number, fieldKey: string, value: string) {
    setSelectedOptions((previous) => ({
      ...previous,
      [productId]: { ...(previous[productId] ?? {}), [fieldKey]: value },
    }));
    if (productId === 1 && fieldKey === "plot") {
      const recommendedRolls = CHAINLINK_ROLLS_BY_PLOT[value];
      if (recommendedRolls) {
        setDraftQuantities((previous) => ({ ...previous, [productId]: recommendedRolls }));
      }
    }
  }

  function changeDraftQuantity(product: Product, value: number) {
    setDraftQuantities((previous) => ({
      ...previous,
      [product.id]: clampQuantity(value, product),
    }));
  }

  function addToCart(product: Product) {
    const choices = selectedOptions[product.id] ?? {};
    const fields = getFields(product, choices);
    if (!validChoices(fields, choices)) return;
    // Farm size is an optional roll-count helper, not a product variant.
    const selections = fields
      .filter((item) => item.key !== "plot")
      .map((item) => ({ label: item.label, value: choices[item.key] }));
    const key = makeCartKey(product.id, selections);
    const quantity = draftQuantities[product.id] ?? minQuantity(product);
    setCart((previous) => {
      const matching = previous.find((entry) => entry.key === key);
      if (matching) return previous.map((entry) => entry.key === key
        ? { ...entry, quantity: clampQuantity(entry.quantity + quantity, product) }
        : entry);
      return [...previous, { key, productId: product.id, selections, quantity }];
    });
    setRecentlyAdded(key);
  }

  function updateCartQuantity(key: string, difference: number) {
    setCart((previous) => previous.flatMap((item) => {
      if (item.key !== key) return [item];
      const product = PRODUCTS.find((entry) => entry.id === item.productId);
      if (!product) return [];
      const next = Math.round((item.quantity + difference) * 10) / 10;
      if (next < minQuantity(product)) return [];
      return [{ ...item, quantity: clampQuantity(next, product) }];
    }));
  }

  function focusProduct(product: Product) {
    setQuery("");
    window.setTimeout(() => document.getElementById(`product-${product.id}`)?.scrollIntoView({
      behavior: "smooth", block: "center",
    }), 100);
  }

  function openWhatsAppOrder(message: string) {
    if (!validWhatsApp) {
      window.alert("The business WhatsApp number has not been configured.");
      return;
    }
    // WhatsApp displays this prefilled text; the customer still taps Send.
    const url = `https://wa.me/${whatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Allow ordering a single product directly, without requiring Add to Cart.
  function orderProductOnWhatsApp(product: Product) {
    const choices = selectedOptions[product.id] ?? {};
    const fields = getFields(product, choices);
    if (!validChoices(fields, choices)) return;

    // The optional plot-size estimator is not an item variant; roll count is.
    const selections: SelectedSpec[] = fields
      .filter((entry) => entry.key !== "plot")
      .map((entry) => ({ label: entry.label, value: choices[entry.key] }));
    const key = makeCartKey(product.id, selections);
    const item: CartRow = {
      key,
      productId: product.id,
      product,
      selections,
      quantity: draftQuantities[product.id] ?? minQuantity(product),
      price: getPrice(product, key),
    };
    const message = [
      "Hello Ng'ombe Farm Products, I would like to order:",
      "",
      ...formatWhatsAppItem(item, 0),
      "Thank you for shopping with us. We value you our customer.",
    ].join("\n");
    openWhatsAppOrder(message);
  }

  // Full-cart checkout also lists every item and its individual specifications.
  function orderOnWhatsApp() {
    if (!cartLines.length) return;
    const lines = cartLines.flatMap((item, index) => formatWhatsAppItem(item, index));
    const message = [
      "Hello Ng'ombe Farm Products, I would like to order:",
      "",
      ...lines,
      ...(hasTotal ? [`Items total: ${currency.format(cartTotal)}`, ""] : []),
      ...(!hasTotal && cartLines.some((item) => item.price !== null)
        ? [`Known items subtotal: ${currency.format(cartTotal)} (excludes unpriced items)`, ""]
        : []),
      "Free Delivery Countrywide",
      ...(deliveryTown.trim() ? [`Delivery location: ${deliveryTown.trim()}`] : []),
      ...(specifications.trim() ? [`Other specifications: ${specifications.trim()}`] : []),
      "",
      "Thank you for shopping with us. We value you our customer.",
    ].join("\n");
    openWhatsAppOrder(message);
  }

  const feature = FEATURED[slide];

  return (
    <main className="site-surface min-h-screen bg-[#F4F7F8] text-[#172F39]">
      <div className="site-top-strip flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-white sm:text-sm">
        <Truck size={17} className="text-[#F2C977]" /> FREE DELIVERY COUNTRYWIDE
      </div>

      <header className="site-header sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <a href="#home" aria-label="Ng'ombe Farm Products home"><Brand /></a>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Main navigation">
            <a className="nav-link" href="#home">Home</a>
            <a className="nav-link" href="#products">Products</a>
            <a className="nav-link" href="#why-us">Why Us</a>
            <a className="nav-link" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCartOpen(true)} className="header-cart-btn btn-interactive flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white" aria-label={`Open cart with ${cartCount} product selections`}>
              <ShoppingCart size={18} /> <span className="hidden sm:inline">Cart</span>
              <span className="rounded-full bg-[#F2C977] px-2 py-0.5 text-xs font-extrabold text-[#172F39]">{cartCount}</span>
            </button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-4 border-t bg-white px-6 py-5 text-sm font-semibold md:hidden" aria-label="Mobile navigation">
            {[["Home", "#home"], ["Products", "#products"], ["Why Us", "#why-us"], ["Contact", "#contact"]].map(([text, href]) =>
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{text}</a>)}
          </nav>
        )}
      </header>

      <section id="home" className="site-hero relative overflow-hidden bg-[#0E2A35] text-white" style={{ position: "relative" }}>
        <Image src="/images/hero/farm-products-banner.jpg" alt="" fill priority unoptimized sizes="100vw" className="hero-photo object-cover object-center" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071D27]/95 via-[#103441]/75 to-[#0B2D38]/40" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck size={16} className="text-[#F2C977]" /> Farm fencing and quality hardware
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Stronger boundaries. <span className="hero-highlight">Better supplies.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#E0EBEB]">
              Browse fencing, wire mesh, steel poles and essential hardware. Select your materials and send your order through WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="hero-primary btn-interactive inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-extrabold text-[#173B2C]">Shop Products <ArrowRight size={18} /></a>
              <button type="button" onClick={() => setCartOpen(true)} className="hero-secondary btn-interactive inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white">View Cart <ShoppingCart size={18} /></button>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/85"><Truck size={19} className="text-[#F2C977]" /> Free Delivery Countrywide</p>
          </div>

          <div className="min-w-0" role="region" aria-roledescription="carousel" aria-label="Featured products"
            onMouseEnter={() => setPauseSlides(true)} onMouseLeave={() => setPauseSlides(false)}
            onFocusCapture={() => setPauseSlides(true)}
            onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPauseSlides(false); }}>
            <div className="featured-panel overflow-hidden rounded-3xl border border-white/20 bg-white text-[#172F39]">
              <div className="flex justify-between border-b px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-[#567680]"><span>Featured products</span><span>{slide + 1} / {FEATURED.length}</span></div>
              <div key={feature.id} className="slide-in">
                <ProductImage filename={feature.image} alt={feature.name} className="h-64 w-full sm:h-72" />
                <div className="flex items-center justify-between gap-3 px-5 py-5">
                  <div><h2 className="text-xl font-extrabold">{feature.name}</h2><p className="mt-1 text-sm text-[#71868C]">{feature.description}</p></div>
                  <button type="button" onClick={() => focusProduct(feature)} className="btn-interactive shrink-0 rounded-xl bg-[#106D68] p-3 text-white" aria-label={`Select ${feature.name}`}><ArrowRight size={22} /></button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">{FEATURED.map((entry, index) =>
                <button type="button" key={entry.id} onClick={() => setSlide(index)} aria-label={`Show ${entry.name}`} aria-pressed={slide === index} className={`h-2.5 rounded-full transition-all ${slide === index ? "w-8 bg-[#F2C977]" : "w-2.5 bg-white/40"}`} />)}</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSlide((old) => (old + FEATURED.length - 1) % FEATURED.length)} className="btn-interactive rounded-full border border-white/30 bg-white/10 p-3" aria-label="Previous slide"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => setSlide((old) => (old + 1) % FEATURED.length)} className="btn-interactive rounded-full border border-white/30 bg-white/10 p-3" aria-label="Next slide"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-us" className="border-b border-[#E0E8E9] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {[
            { icon: <ShieldCheck size={24} />, title: "Reliable Materials", info: "Fencing and construction essentials" },
            { icon: <ShoppingCart size={24} />, title: "Easy Add to Cart", info: "Choose materials, sizes and quantities" },
            { icon: <Truck size={24} />, title: "Free Delivery Countrywide", info: "Delivery available across Kenya" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#E7F3F2] p-3 text-[#16746E]">{item.icon}</div>
              <div><strong className="block text-sm font-extrabold">{item.title}</strong><p className="mt-1 text-xs text-[#667E83]">{item.info}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F827B]">Our Products</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Shop Our Products</h2>
          </div>
          <label className="search-control flex w-full items-center gap-3 rounded-xl border border-[#DDE7E8] bg-white px-4 py-3 md:max-w-xs">
            <Search size={18} className="text-[#789097]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
        {/* General checkout for orders containing multiple product selections. */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#CDE4DC] bg-[#ECF8F2] p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D3EBE3] text-[#106D68]">
              <ShoppingCart size={21} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#183A3B]">Ordering several products?</h3>
              <p className="mt-1 text-xs leading-5 text-[#4E6D6D]">
                Add each product to your cart, then press the general Order button to send everything together.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#436D68]" aria-live="polite">
              {cartCount} {cartCount === 1 ? "selection" : "selections"}
            </span>
            <button
              type="button"
              disabled={cartCount === 0}
              onClick={() => setCartOpen(true)}
              aria-label={`View shopping cart subtotal: ${hasUnpricedItems ? "partially priced" : currency.format(cartTotal)}`}
              className="ng-subtotal-btn btn-interactive inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold"
            >
              <ShoppingCart size={16} aria-hidden="true" />
              <span>Subtotal: {cartCount === 0 ? "KSh 0" : currency.format(cartTotal)}</span>
              {hasUnpricedItems && <span aria-hidden="true">*</span>}
            </button>
            <button
              type="button"
              disabled={cartCount === 0}
              onClick={orderOnWhatsApp}
              aria-label="General order for all cart items (opens WhatsApp)"
              className="whatsapp-btn btn-interactive inline-flex min-h-11 items-center justify-center rounded-xl px-7 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Order
            </button>
          </div>
        </div>
         <p className="mt-6 text-xs font-semibold text-[#758A8E]">{visibleProducts.length} of {PRODUCTS.length} products</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => {
            const choices = selectedOptions[product.id] ?? {};
            const fields = getFields(product, choices);
            const valid = validChoices(fields, choices);
            const selections = fields
              .filter((entry) => entry.key !== "plot")
              .map((entry) => ({ label: entry.label, value: choices[entry.key] ?? "" }));
            const key = makeCartKey(product.id, selections);
            const quantity = draftQuantities[product.id] ?? minQuantity(product);
            const price = valid ? getPrice(product, key) : null;

            return (
              <article id={`product-${product.id}`} key={product.id} className="catalogue-card product-lift flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-[#DEE7E8] bg-white">
                <ProductImage filename={product.image} alt={product.name} className="h-52 w-full" />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-extrabold">{product.name}</h3>
                  {product.fixedSpecifications?.map((spec) => (
                    <p key={spec} className="mt-2 text-xs font-semibold leading-5 text-[#46636A]">{spec}</p>
                  ))}
                  {product.id === 7 && choices.grade && BRC_DETAILS[choices.grade] && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#46636A]">
                      {BRC_DETAILS[choices.grade]}
                    </p>
                  )}

                  {fields.map((entry) => (
                    <label key={entry.key} className="mt-3 block text-xs font-bold text-[#38545D]">
                      {entry.key === "plot" ? "Optional farm-size roll guide" : `Select ${entry.label.toLowerCase()}`}
                      <select
                        value={choices[entry.key] ?? ""}
                        onChange={(event) => setChoice(product.id, entry.key, event.target.value)}
                        className="mt-1 block w-full rounded-xl border border-[#D4E2E3] bg-white p-3 text-sm font-normal outline-none focus:border-[#106D68]"
                      >
                        <option value="">{entry.key === "plot" ? "Custom size — enter rolls manually" : `Choose ${entry.label.toLowerCase()}`}</option>
                        {entry.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                  ))}

                  <label className="mt-4 block text-xs font-bold text-[#38545D]" htmlFor={`quantity-${product.id}`}>
                    Quantity ({getDisplayedUnit(product, selections)})
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" onClick={() => changeDraftQuantity(product, quantity - quantityStep(product))} disabled={quantity <= minQuantity(product)} aria-label={`Decrease quantity of ${product.name}`} className="btn-interactive flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4E2E3] bg-white disabled:opacity-40"><Minus size={17} /></button>
                    <input
                      id={`quantity-${product.id}`}
                      type="number"
                      inputMode="numeric"
                      min={minQuantity(product)}
                      max={10000}
                      step={quantityStep(product)}
                      value={quantity}
                      onChange={(event) => changeDraftQuantity(product, Number(event.target.value))}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#D4E2E3] bg-white px-3 text-center text-sm font-bold outline-none focus:border-[#106D68]"
                    />
                    <button type="button" onClick={() => changeDraftQuantity(product, quantity + quantityStep(product))} disabled={quantity >= 10000} aria-label={`Increase quantity of ${product.name}`} className="btn-interactive flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4E2E3] bg-white disabled:opacity-40"><Plus size={17} /></button>
                  </div>
                  {getTotalWeightKg(product, quantity) !== null && (
                    <p className="mt-2 text-xs font-semibold text-[#46636A]">
                      Total weight: {getTotalWeightKg(product, quantity)} kg
                    </p>
                  )}
                  {product.unit === "kg" && <p className="mt-1 text-[11px] text-[#789097]">Minimum 2 kg · Whole kilograms</p>}
                  {price !== null && (
                    <div className="mt-3">
                      <p className="text-base font-extrabold text-[#106D68]">
                        {currency.format(price)} <span className="text-xs font-normal text-[#779096]">/ {getPriceUnit(product, selections)}</span>
                      </p>
                      <output className="ng-product-subtotal" aria-live="polite">
                        <span>Subtotal</span>
                        <strong>{currency.format(price * quantity)}</strong>
                      </output>
                    </div>
                  )}
                  {valid && price === null && (
                    <p className="mt-3 text-sm font-semibold text-[#A15B27]">Price to be confirmed</p>
                  )}

                  <button type="button" disabled={!valid} onClick={() => addToCart(product)} className="product-add-btn btn-interactive mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {recentlyAdded === key
                      ? <><Check size={17} /> Added to Cart</>
                      : <><ShoppingCart size={17} /> {valid ? "Add to Cart" : "Select Specifications"}</>}
                  </button>
                  <button
                    type="button"
                    disabled={!valid}
                    onClick={() => orderProductOnWhatsApp(product)}
                    aria-label={`Order ${product.name} (opens WhatsApp)`}
                    className="whatsapp-btn btn-interactive mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    Order
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {visibleProducts.length === 0 && <div className="mt-8 rounded-2xl bg-white px-5 py-12 text-center text-sm">No matching products found.</div>}
      </section>

      <section id="contact" className="contact-panel text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F2C977]">Contact Ng&apos;ombe</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Connect With Us</h2>
          <div className="ng-contact-links" aria-label="Business contact links">
            {validWhatsApp && (
              <a className="ng-social-link ng-social-link--whatsapp" href={`https://wa.me/${whatsApp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="WhatsApp">
                <WhatsAppBrandIcon size={43} />
              </a>
            )}
            {validFacebook && (
              <a className="ng-social-link ng-social-link--facebook" href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Open our Facebook page" title="Facebook">
                <FacebookBrandIcon size={48} />
              </a>
            )}
            {validEmail && (
              <a className="ng-social-link ng-social-link--email" href={`mailto:${email}`} aria-label="Send us an email" title="Email">
                <Mail size={43} strokeWidth={2.25} aria-hidden="true" />
              </a>
            )}
            {validPhone && (
              <a className="ng-social-link ng-social-link--call" href={`tel:${phone.replace(/[^+\d]/g, "")}`} aria-label="Call Ng'ombe Farm Products" title="Call">
                <Phone size={39} strokeWidth={2.35} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer text-[#B8D0D4]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 text-xs sm:px-8 md:flex-row md:items-center">
          <span><strong className="block text-sm text-white">Ng&apos;ombe Farm Products</strong>Fencing, mesh, steel and hardware</span>
          <div className="flex flex-wrap gap-5 font-semibold"><a href="#products">Products</a><a href="#contact">Contact</a></div>
          <span>© 2026 Ng&apos;ombe Farm Products. All rights reserved.</span>
        </div>
      </footer>

      {/* Keep the all-products Order action easy to reach while browsing. */}
      {cartCount > 0 && !cartOpen && (
        <div
          role="region"
          aria-label="General order for items in your cart"
          className="fixed bottom-28 left-4 right-4 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DBE9E5] bg-white p-3 shadow-[0_12px_40px_rgba(10,44,49,0.22)] sm:bottom-6 sm:left-6 sm:right-auto sm:w-[465px]"
        >
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#143B3A]">
              {cartCount} {cartCount === 1 ? "product selected" : "products selected"}
            </p>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="mt-1 text-xs font-semibold text-[#106D68] underline underline-offset-2"
            >
              Review cart
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Review subtotal: ${hasUnpricedItems ? "partially priced" : currency.format(cartTotal)}`}
              className="ng-subtotal-btn btn-interactive inline-flex min-h-11 items-center justify-center gap-2 px-3 py-2 text-sm font-extrabold"
            >
              <span>Subtotal</span>
              <strong>{currency.format(cartTotal)}{hasUnpricedItems ? "*" : ""}</strong>
            </button>
            <button
              type="button"
              onClick={orderOnWhatsApp}
              aria-label={`Order all ${cartCount} selected products on WhatsApp`}
              className="whatsapp-btn btn-interactive inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-extrabold text-white"
            >
              Order
            </button>
          </div>
        </div>
      )}

      {/* Icon-only floating call shortcut with outward-moving wave animation. */}
      {validPhone && (
        <a
          href={`tel:${phone.replace(/[^+\d]/g, "")}`}
          className="ng-floating-call"
          aria-label="Call Ng'ombe Farm Products"
          title="Call Ng'ombe Farm Products"
        >
          <span className="ng-floating-call__halo" aria-hidden="true">
            <span className="ng-floating-call__ring ng-floating-call__ring--one" />
            <span className="ng-floating-call__ring ng-floating-call__ring--two" />
            <span className="ng-floating-call__disc"><Phone size={23} strokeWidth={2.4} /></span>
          </span>
        </a>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button type="button" onClick={() => setCartOpen(false)} className="absolute inset-0 h-full w-full bg-[#071B25]/60" aria-label="Close cart" />
          <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className="cart-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#F5F8F9]">
            <div className="flex items-center justify-between border-b bg-white px-6 py-5">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#106D68]">Your Selection</p><h2 className="mt-1 text-xl font-extrabold">Shopping Cart</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" className="rounded-full bg-[#E7F2F1] p-2"><X size={20} /></button>
            </div>
            <div className="cart-contents flex-1 space-y-4 overflow-y-auto p-5">
              {cartLines.length === 0 && <div className="py-16 text-center"><ShoppingCart className="mx-auto text-[#84A2A6]" size={40} /><p className="mt-4 font-bold">Your cart is empty</p></div>}
              {cartLines.map((item) => (
                <div key={item.key} className="rounded-xl border border-[#DEE8E9] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-sm">{item.product.name}</strong>
                      {item.selections.map(({ label, value }) => <p key={label} className="mt-1 text-xs text-[#6A8086]">{label}: {value}</p>)}
                      {item.product.fixedSpecifications?.map((spec) => <p key={spec} className="mt-1 text-xs text-[#6A8086]">{spec}</p>)}
                      {getSelectedDetail(item.product, item.selections) && <p className="mt-1 text-xs text-[#6A8086]">{getSelectedDetail(item.product, item.selections)}</p>}
                      {getTotalWeightKg(item.product, item.quantity) !== null && (
                        <p className="mt-1 text-xs font-semibold text-[#38545D]">
                          Total weight: {getTotalWeightKg(item.product, item.quantity)} kg
                        </p>
                      )}
                      {item.price !== null && <p className="mt-2 text-sm font-bold text-[#106D68]">{currency.format(item.price * item.quantity)}</p>}
                    </div>
                    <button type="button" onClick={() => updateCartQuantity(item.key, -item.quantity)} aria-label={`Remove ${item.product.name}`}><Trash2 size={17} /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">Quantity</span>
                    <div className="flex items-center gap-3 rounded-lg bg-[#EDF4F4] p-2">
                      <button type="button" onClick={() => updateCartQuantity(item.key, -quantityStep(item.product))} aria-label="Reduce quantity"><Minus size={16} /></button>
                      <span className="text-sm font-bold">{getDisplayedQuantity(item.product, item.quantity, item.selections)}</span>
                      <button type="button" onClick={() => updateCartQuantity(item.key, quantityStep(item.product))} aria-label="Increase quantity"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {cartLines.length > 0 && <div className="rounded-xl border bg-white p-4">
                <label className="block text-sm font-bold" htmlFor="specification">Other measurements or specifications</label>
                <textarea id="specification" rows={3} maxLength={600} value={specifications} onChange={(event) => setSpecifications(event.target.value)} placeholder="Optional additional sizes, measurements or requests" className="mt-2 w-full rounded-xl border p-3 text-sm" />
                <label htmlFor="deliveryTown" className="mt-3 block text-sm font-bold">Delivery location (optional)</label>
                <input id="deliveryTown" maxLength={120} value={deliveryTown} onChange={(event) => setDeliveryTown(event.target.value)} placeholder="e.g. Nairobi, Kenya" className="mt-2 w-full rounded-xl border p-3 text-sm" />
              </div>}
            </div>
            <div className="border-t bg-white p-5">
              <div className="mb-2 flex justify-between text-sm"><span>Product selections</span><strong>{cartCount}</strong></div>
              {cartCount > 0 && (
                <div className="ng-cart-subtotal mb-3" aria-live="polite">
                  <span className="ng-cart-subtotal__label">
                    {hasTotal ? "Order subtotal" : "Subtotal (priced items only)"}
                  </span>
                  <strong className="ng-cart-subtotal__amount">{currency.format(cartTotal)}</strong>
                </div>
              )}
              {hasUnpricedItems && <p className="mb-3 text-xs text-[#A15B27]">One or more prices need confirmation and are not included in this subtotal.</p>}
              <p className="mb-4 rounded-xl bg-[#E9F7F1] px-4 py-3 text-xs font-bold text-[#106454]">Free Delivery Countrywide</p>
              <button type="button" disabled={!cartLines.length} onClick={orderOnWhatsApp} aria-label="General order for all cart items (opens WhatsApp)" className="whatsapp-btn btn-interactive flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-extrabold text-white disabled:opacity-40">Order</button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}