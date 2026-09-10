import React, { createContext, useContext, useEffect, useState } from "react";
import {
  accessibleAccent,
  moveVariation,
  transitionInquiry,
  formatBRL,
  availableOf,
  productAvailable,
  buildWhatsAppMessage,
} from "./operations";
import { SUPPLIER_REFERENCES } from "./supplierReferences";


const STORAGE_KEY = "rsmodas-demo-v1";

export const DEFAULT_BRANDS = ["Pit Bull Jeans", "Rhero", "Maria Dondoca"];

export const INQUIRY_STATUSES = [
  { id: "nova", label: "Interesse — aguardando resposta" },
  { id: "fornecedor", label: "Consultar fornecedor" },
  { id: "aguardando", label: "Aguardando cliente" },
  { id: "confirmada", label: "Encomenda confirmada" },
  { id: "recebida", label: "Recebido" },
  { id: "pronta", label: "Pronto para entregar" },
  { id: "entregue", label: "Entregue" },
  { id: "cancelada", label: "Cancelado" },
  { id: "encerrada", label: "Encerrada" },
];

export const MOVEMENT_TYPES = {
  entrada: "Entrada",
  ajuste: "Ajuste de cadastro",
  reserva: "Reserva",
  liberacao: "Liberação de reserva",
  venda: "Venda confirmada",
  correcao: "Correção de quantidade",
};

const IMG = {
  p1: "/catalog/rhero-calca.png",
  p2: "https://images.hostinger.com/38fa0bca-8fc9-4876-b3fc-1ed18a7d35f9.png",
  p3: "/catalog/jaqueta.png",
  p4: "https://images.hostinger.com/f40ea86f-52e1-4d01-acfc-83e66736d23a.png",
  p5: "https://images.hostinger.com/45a7bf61-450b-4b6a-8dd3-5e5509181384.png",
  p6: "https://images.hostinger.com/0bc4265f-e05e-4bb2-9c1a-92cb5f2f22e5.png",
  p7: "/catalog/saia.png",
  p8: "/catalog/shorts.png",
  p9: "/catalog/trico.png",
  p10: "https://images.hostinger.com/8e4a895c-3b32-486c-b7a9-5656b6c1769a.png",
  p11: "/catalog/body.png",
  p12: "https://images.hostinger.com/33dd4bc3-60f6-407b-b923-eddef55d1c88.png",
  hero: "/catalog/hero.png",
  pit1: [
    "/catalog/pit-81707-1.webp",
    "/catalog/pit-81707-2.webp",
    "/catalog/pit-81707-3.webp",
  ],
  pit2: [
    "/catalog/pit-83672-1.webp",
    "/catalog/pit-83672-2.webp",
  ],
  maria1: "/catalog/maria-ipanema.webp",
  maria2: "/catalog/maria-alessia.webp",
  rhero11989: ["/catalog/rhero-11989-1.webp", "/catalog/rhero-11989-2.webp"],
};

export const HERO_IMAGE = IMG.hero;

let seq = 0;
export const uid = () => `id-${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;

export const DEFAULT_CONFIG = {
  storeName: "RS Modas",
  whatsapp: "5514998184411",
  instagram: "https://instagram.com/rsmodas.25/",
  address: "Avenida Petrarca Bachi, 520 — Botucatu/SP",
  hours: "",
  serviceInfo:
    "Atendimento local em Botucatu/SP, com possibilidade de entrega na cidade. Condições, prazos e horários são confirmados diretamente com a loja pelo WhatsApp.",
  demoNotice:
    "Vitrine de demonstração — produtos, imagens, preços e estoques são ilustrativos.",
  lowStockThreshold: 3,
  accentColor: "#796022",
};

function mkVariations(sizes, colors, stock) {
  const out = [];
  sizes.forEach((size, i) => {
    colors.forEach((color, j) => {
      const physical = typeof stock === "function" ? stock(i, j) : stock;
      out.push({ id: uid(), size, color, physical: Math.max(0, physical), reserved: 0 });
    });
  });
  return out;
}

function seedProducts() {
  const base = Date.now();
  const defs = [
    { code: "81707", name: "Calça Jeans Cintura Perfeita", category: "Calças", brand: "Pit Bull Jeans", price: 209.99, photos: IMG.pit1, sizes: ["34", "36", "38", "40", "42", "44", "46"], colors: ["Azul médio"], stock: (i) => (i === 0 ? 0 : 4), sourceUrl: "https://www.pitbulljeans.com.br/calca-jeans-feminina-cintura-perfeita-81707-p9625", description: "Jeans de cintura alta e modelagem ajustada, com caimento confortável e acabamento marcante para produções do dia a dia." },
    { code: "83672", name: "Calça Skinny Modeladora Confort", category: "Calças", brand: "Pit Bull Jeans", price: 99.99, photos: IMG.pit2, sizes: ["36", "38", "40", "42", "44", "46"], colors: ["Azul escuro"], stock: (i) => (i === 4 ? 0 : 3), sourceUrl: "https://www.pitbulljeans.com.br/calca-feminina-skinny-modeladora-83672-p6108", description: "Calça skinny em jeans flexível, com cintura alta e lavagem escura. Uma base versátil para diferentes combinações." },
    { code: "57588", name: "Calça Jeans com Pedrarias", category: "Calças", brand: "Rhero", price: 249.9, photo: IMG.p1, sizes: ["36", "38", "40", "42", "44", "46", "48"], colors: ["Azul claro"], stock: (i) => (i === 2 ? 1 : 0), sourceUrl: "https://rhero.com.br/produtos/57588-calca-jeans-modeladora-com-pedrarias-1m5qu/", description: "Jeans claro com cós anatômico e detalhes de pedraria. Uma peça de presença, equilibrada por uma modelagem confortável." },
    { code: "11989", name: "Cropped Gola Alta com Zíper", category: "Blusas", brand: "Rhero", price: 199.9, photos: IMG.rhero11989, sizes: ["P", "M", "G"], colors: ["Branco", "Bege"], stock: (i, j) => (i + j === 3 ? 0 : 3), sourceUrl: "https://rhero.com.br/produtos/11989-cropped-gola-alta-com-ziper-frontal-e-detalhe-exclusivo-79fbr/", description: "Cropped de gola alta com recorte geométrico e zíper frontal. Funciona com jeans, saias e sobreposições leves." },
    { code: "MD-IPANEMA", name: "Vestido Ipanema", category: "Vestidos", brand: "Maria Dondoca", price: 319.8, photo: IMG.maria1, sizes: ["P", "M", "G"], colors: ["Azul/Off-white", "Preto/Marrom", "Preto/Bege"], stock: (i, j) => (i + j) % 4 === 0 ? 0 : 3, sourceUrl: "https://www.mariadondoca.com.br/produtos/vestido-ipanema-1ixox/", description: "Vestido longo com alças finas, decote delicado e blocos de cor. Leve para dias quentes e ocasiões especiais." },
    { code: "MD-ALESSIA", name: "Conjunto Alessia", category: "Conjuntos", brand: "Maria Dondoca", price: 379.8, photo: IMG.maria2, sizes: ["P", "M", "G"], colors: ["Preto/Verde", "Preto/Bege"], stock: () => 3, sourceUrl: "https://www.mariadondoca.com.br/produtos/conjunto-alessia-1t2vd/", description: "Top cropped canelado e calça reta com listras laterais, em uma composição urbana que une conforto e acabamento elegante." },
    { code: "RS-007", name: "Jaqueta Jeans Trucker", category: "Jaquetas", brand: "Pit Bull Jeans", price: 259.9, photo: IMG.p3, sizes: ["P", "M", "G", "GG"], colors: ["Azul médio"], stock: (i) => (i === 0 ? 2 : 5), description: "Jaqueta jeans estruturada com botões frontais e bolsos. Uma terceira peça prática para meia-estação." },
    { code: "RS-008", name: "Shorts Jeans Cintura Alta", category: "Shorts", brand: "Rhero", price: 189.9, photo: IMG.p8, sizes: ["36", "38", "40", "42"], colors: ["Azul médio"], stock: (i) => (i < 2 ? 0 : 4), description: "Shorts jeans de cintura alta e lavagem média, pensado para produções frescas e descomplicadas." },
    { code: "RS-009", name: "Saia Jeans Evasê", category: "Saias", brand: "Pit Bull Jeans", price: 179.9, photo: IMG.p7, sizes: ["36", "38", "40", "42"], colors: ["Azul escuro"], stock: (i) => (i === 3 ? 0 : 3), description: "Saia jeans evasê com fechamento frontal e caimento leve, fácil de combinar com básicos e peças marcantes." },
    { code: "RS-010", name: "Camisa Essencial Azul", category: "Camisas", brand: "Maria Dondoca", price: 219.8, photo: IMG.p6, sizes: ["P", "M", "G"], colors: ["Azul claro"], stock: () => 4, description: "Camisa leve em azul claro, com corte limpo para acompanhar dias de trabalho e fins de semana." },
    { code: "RS-011", name: "Body Canelado Vinho", category: "Blusas", brand: "Rhero", price: 149.9, photo: IMG.p11, sizes: ["P", "M", "G"], colors: ["Vinho"], stock: (i) => (i === 1 ? 2 : 4), description: "Body canelado em tom vinho, de caimento ajustado e toque macio para usar com jeans e saias." },
    { code: "RS-012", name: "Blusa de Tricô Natural", category: "Blusas", brand: "Maria Dondoca", price: 219.8, photo: IMG.p9, sizes: ["P", "M", "G"], colors: ["Bege"], stock: () => 0, description: "Tricô macio em tom natural, com textura delicada para looks confortáveis em dias mais frescos." },
  ];
  const operational = defs.map((d, idx) => ({
    id: uid(),
    code: d.code,
    name: d.name,
    category: d.category,
    brand: d.brand,
    price: d.price,
    description: d.description,
    photos: d.photos || [d.photo],
    sourceUrl: d.sourceUrl || "",
    variations: mkVariations(d.sizes, d.colors, d.stock),
    archived: false,
    dataKind: "demo",
    createdAt: base - (defs.length - idx) * 60000,
  }));
  return [...SUPPLIER_REFERENCES, ...operational];
}

function seedState() {
  const products = seedProducts();
  const movements = [];
  products.forEach((p) => {
    if (p.dataKind === "supplier-reference") return;
    p.variations.forEach((v) => {
      if (v.physical > 0) {
        movements.push({
          id: uid(),
          date: new Date().toISOString(),
          productId: p.id,
          productName: p.name,
          variationId: v.id,
          variationLabel: `${v.size} / ${v.color}`,
          type: "entrada",
          qty: v.physical,
          reason: "Estoque inicial (demonstração)",
        });
      }
    });
  });
  return { products, movements, inquiries: [], favorites: [], brands: [...DEFAULT_BRANDS], config: { ...DEFAULT_CONFIG } };
}

function migrateState(parsed) {
  const existingIds = new Set((parsed.products || []).map((p) => p.id));
  const missingSupplierRefs = SUPPLIER_REFERENCES.filter((r) => !existingIds.has(r.id));
  const migratedProducts = [
    ...missingSupplierRefs,
    ...(Array.isArray(parsed.products)
      ? parsed.products.map((p) => {
          const ref = SUPPLIER_REFERENCES.find((r) => r.id === p.id || (r.sourceUrl && r.sourceUrl === p.sourceUrl));
          if (ref) return { ...ref, ...p, dataKind: "supplier-reference", sourceType: "supplier-reference" };
          return { ...p, dataKind: p.dataKind || "legacy" };
        })
      : []),
  ];
  const productBrands = migratedProducts.map((p) => p.brand).filter(Boolean);
  const brands = [...new Set([...(parsed.brands || []), ...DEFAULT_BRANDS, ...productBrands])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const config = { ...DEFAULT_CONFIG, ...(parsed.config || {}) };
  if (!config.address) config.address = DEFAULT_CONFIG.address;
  if (config.accentColor === "#c22f1e") config.accentColor = DEFAULT_CONFIG.accentColor;
  return {
    ...parsed,
    products: migratedProducts,
    movements: Array.isArray(parsed.movements) ? parsed.movements : [],
    inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    brands,
    config,
  };
}

export { formatBRL, availableOf, productAvailable, buildWhatsAppMessage };

export function productStatus(p, threshold = 3) {
  const total = productAvailable(p);
  if (total <= 0) return "indisponivel";
  if (total <= threshold) return "baixo";
  return "disponivel";
}

export function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}


export function waLink(whatsapp, message) {
  const digits = (whatsapp || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && parsed.config) return migrateState(parsed);
      }
    } catch (_) {
      /* ignora e recria */
    }
    return seedState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      /* armazenamento cheio ou indisponível */
    }
  }, [state]);

  useEffect(() => {
    const hsl = hexToHsl(accessibleAccent(state.config.accentColor));
    if (hsl) document.documentElement.style.setProperty("--signal", hsl);
  }, [state.config.accentColor]);

  const saveProduct = (draft) => {
    const next = ((prev) => {
      const movements = [...prev.movements];
      const cleanVariations = (vars, oldMap, productId, productName) =>
        vars.map((v) => {
          const physical = Math.max(0, Math.round(Number(v.physical) || 0));
          const old = oldMap ? oldMap.get(v.id) : null;
          const label = `${v.size} / ${v.color}`;
          if (old && old.physical !== physical) {
            movements.unshift({
              id: uid(), date: new Date().toISOString(), productId, productName,
              variationId: v.id, variationLabel: label, type: "ajuste",
              qty: physical - old.physical, reason: "Ajuste manual no cadastro",
            });
          }
          if (!old && physical > 0) {
            movements.unshift({
              id: uid(), date: new Date().toISOString(), productId, productName,
              variationId: v.id, variationLabel: label, type: "entrada",
              qty: physical, reason: "Estoque inicial da variação",
            });
          }
          return { id: v.id || uid(), size: v.size, color: v.color, physical, reserved: old ? Math.min(old.reserved, physical) : 0 };
        });

      const existing = prev.products.find((p) => p.id === draft.id);
      if (existing) {
        const oldMap = new Map(existing.variations.map((v) => [v.id, v]));
        const variations = cleanVariations(draft.variations, oldMap, existing.id, draft.name);
        const products = prev.products.map((p) =>
          p.id === draft.id ? { ...existing, ...draft, id: existing.id, variations } : p
        );
        const brands = draft.brand && !prev.brands.includes(draft.brand) ? [...prev.brands, draft.brand].sort((a, b) => a.localeCompare(b, "pt-BR")) : prev.brands;
        return { ...prev, products, movements, brands };
      }
      const id = draft.id || uid();
      const variations = cleanVariations(draft.variations, null, id, draft.name);
      const product = { ...draft, id, variations, archived: false, createdAt: Date.now() };
        const brands = draft.brand && !prev.brands.includes(draft.brand) ? [...prev.brands, draft.brand].sort((a, b) => a.localeCompare(b, "pt-BR")) : prev.brands;
        return { ...prev, products: [product, ...prev.products], movements, brands };
      })(state);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { return { ok: false, error: "Não foi possível salvar neste navegador. O espaço pode estar cheio; reduza as fotos e tente novamente. Seus campos foram mantidos." }; }
    setState(next);
    return { ok: true };
  };

  const addBrand = (name) => {
    const clean = (name || "").trim();
    if (!clean) return { ok: false, error: "Informe o nome da marca." };
    if (state.brands.some((brand) => brand.toLocaleLowerCase("pt-BR") === clean.toLocaleLowerCase("pt-BR"))) {
      return { ok: false, error: "Esta marca já está cadastrada." };
    }
    setState((prev) => ({ ...prev, brands: [...prev.brands, clean].sort((a, b) => a.localeCompare(b, "pt-BR")) }));
    return { ok: true };
  };

  const toggleFavorite = (productId) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(productId)
        ? prev.favorites.filter((id) => id !== productId)
        : [...prev.favorites, productId],
    }));
  };

  const archiveProduct = (id, archived = true) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, archived } : p)),
    }));
  };

  const addMovement = ({ productId, variationId, type, qty, reason }) => {
    const q = Number(qty);
    if (!Number.isInteger(q) || q < 0 || (type !== "correcao" && q === 0)) {
      return { ok: false, error: "Informe uma quantidade inteira maior que zero." };
    }
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: "Produto não encontrado." };
    const variation = product.variations.find((v) => v.id === variationId);
    if (!variation) return { ok: false, error: "Variação não encontrada." };
    try { moveVariation(variation, type, q); } catch (error) { return { ok: false, error: error.message }; }
    const avail = availableOf(variation);
    if (type === "reserva" && q > avail) {
      return { ok: false, error: `Reserva acima do disponível (${avail} un.).` };
    }
    if (type === "liberacao" && q > variation.reserved) {
      return { ok: false, error: `Liberação acima do reservado (${variation.reserved} un.).` };
    }
    if (type === "venda" && (q > variation.reserved || q > variation.physical)) {
      return { ok: false, error: "A venda confirmada baixa unidades reservadas: a quantidade não pode passar do reservado." };
    }
    setState((prev) => {
      const products = prev.products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variations: p.variations.map((v) => {
            if (v.id !== variationId) return v;
            return moveVariation(v, type, q);
          }),
        };
      });
      const movement = {
        id: uid(), date: new Date().toISOString(), productId, productName: product.name,
        variationId, variationLabel: `${variation.size} / ${variation.color}`,
        type, qty: q, reason: reason || MOVEMENT_TYPES[type],
      };
      return { ...prev, products, movements: [movement, ...prev.movements] };
    });
    return { ok: true };
  };

  const addInquiry = ({ ref, productId, size, color, qty, note }) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: "Selecione um produto." };
    const q = Number(qty);
    if (!Number.isInteger(q) || q <= 0) return { ok: false, error: "Quantidade deve ser um inteiro maior que zero." };
    if (!size.trim() || !color.trim()) return { ok: false, error: "Informe tamanho e cor." };
    const inquiry = {
      id: uid(),
      ref: ref.trim(),
      productId,
      productName: product.name,
      productCode: product.code,
      size: size.trim(),
      color: color.trim(),
      qty: q,
      note: (note || "").trim(),
      status: "nova",
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, inquiries: [inquiry, ...prev.inquiries] }));
    return { ok: true };
  };

  const setInquiryStatus = (id, status) => {
    try {
      const next = transitionInquiry(state, id, status, uid);
      setState(next);
      return { ok: true };
    } catch (error) { return { ok: false, error: error.message }; }
  };

  const updateConfig = (patch) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, ...patch } }));
  };

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignora */
    }
    setState(seedState());
  };

  const value = {
    ...state,
    saveProduct,
    archiveProduct,
    addMovement,
    addInquiry,
    setInquiryStatus,
    updateConfig,
    resetDemo,
    addBrand,
    toggleFavorite,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}
