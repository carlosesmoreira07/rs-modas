import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "rsmodas-demo-v1";

export const INQUIRY_STATUSES = [
  { id: "nova", label: "Nova solicitação" },
  { id: "fornecedor", label: "Consultar fornecedor" },
  { id: "aguardando", label: "Aguardando confirmação" },
  { id: "confirmada", label: "Encomenda confirmada" },
  { id: "encerrada", label: "Encerrada" },
];

export const MOVEMENT_TYPES = {
  entrada: "Entrada",
  ajuste: "Ajuste de cadastro",
  reserva: "Reserva",
  liberacao: "Liberação de reserva",
  venda: "Venda confirmada",
};

const IMG = {
  p1: "https://images.hostinger.com/f68f3e2d-8c7f-4ffa-8fb9-58a1cdefc59b.png",
  p2: "https://images.hostinger.com/38fa0bca-8fc9-4876-b3fc-1ed18a7d35f9.png",
  p3: "https://images.hostinger.com/bd64f19c-3072-4f78-a0a3-87875f209c10.png",
  p4: "https://images.hostinger.com/f40ea86f-52e1-4d01-acfc-83e66736d23a.png",
  p5: "https://images.hostinger.com/45a7bf61-450b-4b6a-8dd3-5e5509181384.png",
  p6: "https://images.hostinger.com/0bc4265f-e05e-4bb2-9c1a-92cb5f2f22e5.png",
  p7: "https://images.hostinger.com/cf494e3a-199f-4de0-aa21-514336c4a1a8.png",
  p8: "https://images.hostinger.com/8942090e-5125-4918-96a4-b03bce78ea85.png",
  p9: "https://images.hostinger.com/9145d79e-1d15-45fa-95bd-a552c0180106.png",
  p10: "https://images.hostinger.com/8e4a895c-3b32-486c-b7a9-5656b6c1769a.png",
  p11: "https://images.hostinger.com/60077467-d902-4863-8d8b-587d58266988.png",
  p12: "https://images.hostinger.com/33dd4bc3-60f6-407b-b923-eddef55d1c88.png",
  hero: "https://images.hostinger.com/ba5d12be-b17f-4ca5-bdb9-7e55bc0c2bd2.png",
};

export const HERO_IMAGE = IMG.hero;

let seq = 0;
export const uid = () => `id-${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;

export const DEFAULT_CONFIG = {
  storeName: "RS Modas",
  whatsapp: "5514998184411",
  instagram: "https://instagram.com/rsmodas.25/",
  address: "",
  hours: "",
  serviceInfo:
    "Atendimento local em Botucatu/SP, com possibilidade de entrega na cidade. Condições, prazos e horários são confirmados diretamente com a loja pelo WhatsApp.",
  demoNotice:
    "Vitrine de demonstração — produtos, imagens, preços e estoques são ilustrativos.",
  lowStockThreshold: 3,
  accentColor: "#c22f1e",
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
    { code: "RS-001", name: "Calça Jeans Skinny Lavagem Escura", category: "Calças", price: 189.9, photo: IMG.p1, sizes: ["36", "38", "40", "42", "44"], colors: ["Azul escuro", "Preto"], stock: (i, j) => (i + j) % 4 === 0 ? 0 : 5 - ((i + j) % 3), description: "Calça jeans de modelagem skinny e cós médio, em lavagem escura. Peça versátil para compor looks do dia a dia." },
    { code: "RS-002", name: "Calça Jeans Wide Leg Clara", category: "Calças", price: 219.9, photo: IMG.p2, sizes: ["36", "38", "40", "42"], colors: ["Azul claro"], stock: (i) => (i === 2 ? 0 : 4), description: "Calça jeans de modelagem wide leg, com caimento amplo e lavagem clara. Confortável e atual." },
    { code: "RS-003", name: "Jaqueta Jeans Trucker", category: "Jaquetas", price: 259.9, photo: IMG.p3, sizes: ["P", "M", "G", "GG"], colors: ["Azul médio"], stock: (i) => (i === 0 ? 2 : 5), description: "Jaqueta jeans de modelagem trucker, com botões frontais e bolsos. Clássica para meia-estação." },
    { code: "RS-004", name: "Vestido Midi Preto", category: "Vestidos", price: 179.9, photo: IMG.p4, sizes: ["P", "M", "G"], colors: ["Preto"], stock: () => 6, description: "Vestido midi de caimento fluido. Peça única que funciona em ocasiões casuais e arrumadas." },
    { code: "RS-005", name: "Camiseta Básica Branca", category: "Camisetas", price: 59.9, photo: IMG.p5, sizes: ["P", "M", "G", "GG"], colors: ["Branco", "Preto"], stock: (i, j) => (j === 0 ? 2 : 1), description: "Camiseta básica de gola redonda. Essencial para o guarda-roupa." },
    { code: "RS-006", name: "Camisa Azul Clara", category: "Camisas", price: 149.9, photo: IMG.p6, sizes: ["P", "M", "G"], colors: ["Azul claro"], stock: () => 4, description: "Camisa de botões em tom azul claro, de tecido leve. Serve para trabalho e fins de semana." },
    { code: "RS-007", name: "Saia Jeans Evasê", category: "Saias", price: 129.9, photo: IMG.p7, sizes: ["36", "38", "40", "42"], colors: ["Azul escuro"], stock: (i) => (i === 3 ? 0 : 3), description: "Saia jeans de modelagem evasê, com fechamento frontal. Feminina e fácil de combinar." },
    { code: "RS-008", name: "Shorts Jeans Cintura Alta", category: "Shorts", price: 119.9, photo: IMG.p8, sizes: ["36", "38", "40", "42"], colors: ["Azul médio"], stock: (i) => (i < 2 ? 0 : 4), description: "Shorts jeans de cintura alta e lavagem média. Básico para os dias quentes." },
    { code: "RS-009", name: "Blusa de Tricô Bege", category: "Blusas", price: 139.9, photo: IMG.p9, sizes: ["P", "M", "G"], colors: ["Bege"], stock: () => 5, description: "Blusa de tricô em tom bege, toque macio. Ideal para dias mais frescos." },
    { code: "RS-010", name: "Calça Jogger Preta", category: "Calças", price: 159.9, photo: IMG.p10, sizes: ["P", "M", "G", "GG"], colors: ["Preto"], stock: () => 7, description: "Calça jogger com punhos em elástico e cós ajustável. Conforto para o dia inteiro." },
    { code: "RS-011", name: "Body Canelado Vinho", category: "Blusas", price: 99.9, photo: IMG.p11, sizes: ["P", "M", "G"], colors: ["Vinho"], stock: (i) => (i === 1 ? 2 : 4), description: "Body canelado em tom vinho, modelagem justa. Combina com jeans e saias." },
    { code: "RS-012", name: "Cropped Branco Reto", category: "Blusas", price: 79.9, photo: IMG.p12, sizes: ["P", "M", "G"], colors: ["Branco"], stock: () => 0, description: "Cropped de decote reto em branco. Leve e versátil para sobreposições." },
  ];
  return defs.map((d, idx) => ({
    id: uid(),
    code: d.code,
    name: d.name,
    category: d.category,
    brand: "RS Modas",
    price: d.price,
    description: d.description,
    photos: [d.photo],
    variations: mkVariations(d.sizes, d.colors, d.stock),
    archived: false,
    createdAt: base - (defs.length - idx) * 60000,
  }));
}

function seedState() {
  const products = seedProducts();
  const movements = [];
  products.forEach((p) => {
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
  return { products, movements, inquiries: [], config: { ...DEFAULT_CONFIG } };
}

export function formatBRL(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const availableOf = (v) => Math.max(0, (v.physical || 0) - (v.reserved || 0));

export function productAvailable(p) {
  return p.variations.reduce((sum, v) => sum + availableOf(v), 0);
}

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

export function buildWhatsAppMessage({ product, variation, kind }) {
  const lines =
    kind === "encomenda"
      ? [
          `Olá, ${"RS Modas"}! Gostaria de consultar a possibilidade de encomenda:`,
          `• Produto: ${product.name}`,
          `• Código: ${product.code}`,
          `• Tamanho: ${variation.size}`,
          `• Cor: ${variation.color}`,
          "Podem me informar se é possível encomendar?",
        ]
      : [
          "Olá, RS Modas! Vi uma peça no site e tenho interesse:",
          `• Produto: ${product.name}`,
          `• Código: ${product.code}`,
          `• Tamanho: ${variation.size}`,
          `• Cor: ${variation.color}`,
          "Podem confirmar a disponibilidade?",
        ];
  return lines.join("\n");
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
        if (parsed && Array.isArray(parsed.products) && parsed.config) return parsed;
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
    const hsl = hexToHsl(state.config.accentColor);
    if (hsl) document.documentElement.style.setProperty("--signal", hsl);
  }, [state.config.accentColor]);

  const saveProduct = (draft) => {
    setState((prev) => {
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
        return { ...prev, products, movements };
      }
      const id = draft.id || uid();
      const variations = cleanVariations(draft.variations, null, id, draft.name);
      const product = { ...draft, id, variations, archived: false, createdAt: Date.now() };
      return { ...prev, products: [product, ...prev.products], movements };
    });
  };

  const archiveProduct = (id, archived = true) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, archived } : p)),
    }));
  };

  const addMovement = ({ productId, variationId, type, qty, reason }) => {
    const q = Math.round(Number(qty));
    if (!Number.isFinite(q) || q <= 0) {
      return { ok: false, error: "Informe uma quantidade inteira maior que zero." };
    }
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: "Produto não encontrado." };
    const variation = product.variations.find((v) => v.id === variationId);
    if (!variation) return { ok: false, error: "Variação não encontrada." };
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
            const nv = { ...v };
            if (type === "entrada") nv.physical += q;
            if (type === "reserva") nv.reserved += q;
            if (type === "liberacao") nv.reserved -= q;
            if (type === "venda") { nv.physical -= q; nv.reserved -= q; }
            return nv;
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
    const q = Math.round(Number(qty));
    if (!Number.isFinite(q) || q <= 0) return { ok: false, error: "Quantidade deve ser um inteiro maior que zero." };
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
    setState((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
    }));
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
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}
