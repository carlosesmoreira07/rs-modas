export const CLOSED = ["entregue", "cancelada", "encerrada"];
export const FLOW = {
  nova: ["fornecedor", "aguardando", "cancelada"],
  fornecedor: ["aguardando", "confirmada", "cancelada"],
  aguardando: ["fornecedor", "confirmada", "cancelada"],
  confirmada: ["recebida", "cancelada"],
  recebida: ["pronta", "cancelada"],
  pronta: ["entregue", "cancelada"],
};

export function moveVariation(v, type, qty) {
  const q = Number(qty);
  if (!Number.isInteger(q) || q < 0 || (type !== "correcao" && q === 0)) throw new Error("Informe uma quantidade inteira válida.");
  const next = { ...v };
  if (type === "entrada") next.physical += q;
  else if (type === "reserva") next.reserved += q;
  else if (type === "liberacao") next.reserved -= q;
  else if (type === "venda") { next.physical -= q; next.reserved -= q; }
  else if (type === "correcao") next.physical = q;
  else throw new Error("Ação desconhecida.");
  if (next.reserved < 0 || next.physical < 0 || next.reserved > next.physical) throw new Error("Quantidade incompatível com o saldo ou com as reservas existentes.");
  return next;
}

export function transitionInquiry(state, id, status, makeId, date = new Date().toISOString()) {
  const inquiry = state.inquiries.find(i => i.id === id);
  if (!inquiry || !FLOW[inquiry.status]?.includes(status)) throw new Error("Essa mudança de situação não está disponível.");
  let products = state.products;
  let movements = state.movements;
  const changesStock = status === "recebida" || status === "entregue" || (status === "cancelada" && inquiry.receivedAt);
  if (changesStock) {
    const p = products.find(p => p.id === inquiry.productId);
    const v = p?.variations.find(v => v.size === inquiry.size && v.color === inquiry.color);
    if (!v) throw new Error("Cadastre o tamanho e a cor desta solicitação antes de receber ou entregar.");
    let next;
    if (status === "recebida") next = moveVariation(moveVariation(v, "entrada", inquiry.qty), "reserva", inquiry.qty);
    else next = moveVariation(v, status === "entregue" ? "venda" : "liberacao", inquiry.qty);
    products = products.map(x => x.id === p.id ? { ...x, variations: x.variations.map(x => x.id === v.id ? next : x) } : x);
    const types = status === "recebida" ? ["entrada", "reserva"] : [status === "entregue" ? "venda" : "liberacao"];
    movements = [...types.map(type => ({ id: makeId(), date, productId: p.id, productName: p.name, variationId: v.id, variationLabel: `${v.size} / ${v.color}`, type, qty: inquiry.qty, reason: `Encomenda ${inquiry.ref || inquiry.id}` })), ...movements];
  }
  return { ...state, products, movements, inquiries: state.inquiries.map(i => i.id === id ? { ...i, status, ...(status === "recebida" ? { receivedAt: date } : {}), history: [...(i.history || []), { status, date }] } : i) };
}

// Darken any selected hue until it is legible against both cream and white.
export function accessibleAccent(hex) {
  let rgb = /^#[0-9a-f]{6}$/i.test(hex || "") ? hex.slice(1).match(/../g).map(c => parseInt(c, 16)) : [121, 96, 34];
  const luminance = values => values.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
  while ((0.94 + 0.05) / (luminance(rgb) + 0.05) < 4.5) rgb = rgb.map(c => Math.floor(c * 0.94));
  return `#${rgb.map(c => c.toString(16).padStart(2, "0")).join("")}`;
}

export function formatBRL(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const availableOf = (v) => Math.max(0, (v.physical || 0) - (v.reserved || 0));

export function productAvailable(p) {
  return (p.variations || []).reduce((sum, v) => sum + availableOf(v), 0);
}

export function buildWhatsAppMessage({ product, variation, kind }) {
  const isSupplierRef = product.sourceType === "supplier-reference" || product.dataKind === "supplier-reference";
  const refLine = product.supplierReference
    ? `• Ref. do fornecedor: ${product.supplierReference}`
    : `• Código: ${product.code || product.id}`;
  const priceLine = isSupplierRef && product.price
    ? `• Preço de referência: ${formatBRL(product.price)}${product.pixPrice ? ` (${formatBRL(product.pixPrice)} no Pix)` : ""}`
    : null;

  const lines =
    kind === "encomenda"
      ? [
          "Olá, RS Modas! Gostaria de consultar a possibilidade de encomenda:",
          `• Produto: ${product.name}`,
          `• Marca: ${product.brand}`,
          refLine,
          `• Tamanho: ${variation.size}`,
          `• Cor: ${variation.color}`,
          ...(priceLine ? [priceLine] : []),
          "Podem me informar se é possível encomendar e o valor atualizado?",
        ]
      : [
          "Olá, RS Modas! Vi uma peça no site e tenho interesse:",
          `• Produto: ${product.name}`,
          `• Marca: ${product.brand}`,
          refLine,
          `• Tamanho: ${variation.size}`,
          `• Cor: ${variation.color}`,
          "Podem confirmar a disponibilidade?",
        ];
  return lines.join("\n");
}

