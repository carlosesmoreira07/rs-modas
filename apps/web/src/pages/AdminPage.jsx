import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Archive, ArchiveRestore, Pencil, Copy, Check, Sparkles } from "lucide-react";
import { useStore, formatBRL, availableOf, productAvailable, INQUIRY_STATUSES, MOVEMENT_TYPES, uid } from "@/lib/store";
import { ProductImage } from "@/components/chrome";
import { cn } from "@/lib/utils";

const input = "control";
const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors";
const btnPrimary = cn(btn, "bg-foreground text-background hover:bg-signal");
const btnGhost = cn(btn, "border border-border bg-card hover:border-foreground hover:bg-secondary");

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-signal">{error}</span>}
    </label>
  );
}

/* ---------------- Produtos ---------------- */

const emptyDraft = () => ({
  id: null, code: "", name: "", category: "", brand: "", price: "", description: "",
  photos: [], variations: [{ id: uid(), size: "", color: "", physical: 0 }],
});

function ProductForm({ initial, onSave, onCancel, products, brands }) {
  const [d, setD] = useState(initial);
  const [errors, setErrors] = useState({});
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState(null);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const setVar = (i, k, v) =>
    setD((p) => ({ ...p, variations: p.variations.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));

  const addFiles = (files) => {
    const list = [...files];
    if (d.photos.length + list.length > 4) {
      setErrors((e) => ({ ...e, photos: "Limite de 4 fotos por produto." }));
      return;
    }
    list.forEach((f) => {
      if (f.size > 2 * 1024 * 1024) {
        setErrors((e) => ({ ...e, photos: `A imagem ${f.name} passa de 2 MB.` }));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setD((p) => ({ ...p, photos: [...p.photos, reader.result].slice(0, 4) }));
      reader.readAsDataURL(f);
    });
  };

  const suggest = () => {
    const cores = [...new Set(d.variations.map((v) => v.color).filter(Boolean))].join(", ") || "cores a definir";
    const tams = [...new Set(d.variations.map((v) => v.size).filter(Boolean))].join(", ") || "tamanhos a definir";
    setDraft(
      `${d.name || "Esta peça"} — categoria ${d.category || "a definir"}, marca ${d.brand || "a definir"}. Disponível nas cores ${cores} e nos tamanhos ${tams}. Consulte a loja para detalhes de materiais, medidas e cuidados.`
    );
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!d.name.trim()) errs.name = "Informe o nome.";
    if (!d.code.trim()) errs.code = "Informe o código.";
    if (!d.brand.trim()) errs.brand = "Selecione ou cadastre uma marca.";
    if (products.some((p) => p.code === d.code.trim() && p.id !== d.id)) errs.code = "Código já usado por outro produto.";
    const price = Number(String(d.price).replace(",", "."));
    if (!Number.isFinite(price) || price < 0) errs.price = "Preço deve ser zero ou maior.";
    const vars = d.variations.filter((v) => v.size.trim() && v.color.trim());
    if (vars.length === 0) errs.variations = "Cadastre ao menos uma variação com tamanho e cor.";
    d.variations.forEach((v) => {
      const n = Number(v.physical);
      if (!Number.isInteger(n) || n < 0) errs.variations = "Quantidades devem ser inteiras e não negativas.";
    });
    if (d.photos.length === 0) errs.photos = "Adicione ao menos uma foto (upload ou link).";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      ...d,
      name: d.name.trim(), code: d.code.trim(), category: d.category.trim() || "Sem categoria",
      brand: d.brand.trim(), price, description: d.description.trim(),
      variations: vars.map((v) => ({ ...v, physical: Math.round(Number(v.physical) || 0) })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-card md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" error={errors.code}><input className={input} value={d.code} onChange={(e) => set("code", e.target.value)} placeholder="RS-013" /></Field>
        <Field label="Nome" error={errors.name}><input className={input} value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Categoria"><input className={input} value={d.category} onChange={(e) => set("category", e.target.value)} list="cats" />
          <datalist id="cats">{[...new Set(products.map((p) => p.category))].map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Marca" error={errors.brand}><input className={input} value={d.brand} onChange={(e) => set("brand", e.target.value)} list="brands" placeholder="Selecione ou digite uma nova" />
          <datalist id="brands">{brands.map((brand) => <option key={brand} value={brand} />)}</datalist>
        </Field>
        <Field label="Preço (R$)" error={errors.price}><input className={input} inputMode="decimal" value={d.price} onChange={(e) => set("price", e.target.value)} placeholder="199,90" /></Field>
      </div>

      <Field label="Descrição" error={errors.description}>
        <textarea className="min-h-24 w-full border border-foreground bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={d.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="border border-dashed border-muted-foreground/60 p-3">
        <button type="button" onClick={suggest} className={cn(btnGhost, "h-9 text-xs")}>
          <Sparkles className="h-3.5 w-3.5" /> Sugerir descrição (simulação)
        </button>
        <p className="mt-1 text-xs text-muted-foreground">Simulação: nenhum serviço de IA está conectado. O rascunho usa apenas os dados informados acima e precisa ser revisado.</p>
        {draft !== null && (
          <div className="mt-3 border border-foreground bg-secondary p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rascunho para revisão</p>
            <textarea className="mt-2 min-h-20 w-full border border-foreground bg-card px-3 py-2 text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className="mt-2 flex gap-2">
              <button type="button" className={cn(btnPrimary, "h-9 text-xs")} onClick={() => { set("description", draft); setDraft(null); }}>Usar rascunho</button>
              <button type="button" className={cn(btnGhost, "h-9 text-xs")} onClick={() => setDraft(null)}>Descartar</button>
            </div>
          </div>
        )}
      </div>

      <Field label="Fotos (até 4, máx. 2 MB cada)" error={errors.photos}>
        <div className="flex flex-wrap gap-2">
          {d.photos.map((src, i) => (
            <div key={i} className="relative h-20 w-20 border border-foreground bg-secondary">
              <ProductImage src={src} alt={`Foto ${i + 1}`} className="h-full w-full" />
              <button type="button" aria-label="Remover foto" onClick={() => set("photos", d.photos.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border border-foreground bg-signal text-white"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="text-sm file:mr-3 file:border file:border-foreground file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-semibold file:text-background" />
          <div className="flex flex-1 gap-2">
            <input className={input} placeholder="Ou cole o link de uma imagem" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button type="button" className={cn(btnGhost, "shrink-0")} onClick={() => { if (url.trim() && d.photos.length < 4) { set("photos", [...d.photos, url.trim()]); setUrl(""); } }}>Adicionar</button>
          </div>
        </div>
      </Field>

      <Field label="Variações (tamanho, cor e estoque físico)" error={errors.variations}>
        <div className="space-y-2">
          {d.variations.map((v, i) => (
            <div key={v.id} className="grid grid-cols-[1fr_1fr_5rem_2.75rem] items-center gap-2">
              <input className={input} placeholder="Tamanho" value={v.size} onChange={(e) => setVar(i, "size", e.target.value)} />
              <input className={input} placeholder="Cor" value={v.color} onChange={(e) => setVar(i, "color", e.target.value)} />
              <input className={input} inputMode="numeric" placeholder="Qtd." value={v.physical} onChange={(e) => setVar(i, "physical", e.target.value)} />
              <button type="button" aria-label="Remover variação" onClick={() => set("variations", d.variations.filter((_, j) => j !== i))} className="flex h-11 items-center justify-center border border-foreground bg-card hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" className={cn(btnGhost, "h-9 text-xs")} onClick={() => set("variations", [...d.variations, { id: uid(), size: "", color: "", physical: 0 }])}>
            <Plus className="h-3.5 w-3.5" /> Adicionar variação
          </button>
        </div>
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className={btnPrimary}>Salvar produto</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Cancelar</button>
      </div>
    </form>
  );
}

function AdminProducts() {
  const { products, brands, saveProduct, archiveProduct } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [saved, setSaved] = useState(false);

  if (editing) {
    return (
      <ProductForm
        initial={editing === "new" ? emptyDraft() : JSON.parse(JSON.stringify(editing))}
        products={products}
        brands={brands}
        onSave={(draft) => { saveProduct(draft); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados. Alterações aparecem na vitrine na hora.</p>
        <button onClick={() => setEditing("new")} className={cn(btnPrimary, "shrink-0")}><Plus className="h-4 w-4" /> Novo</button>
      </div>
      {saved && <p role="status" className="border border-foreground bg-secondary px-3 py-2 text-sm">Produto salvo — já visível na vitrine.</p>}
      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-card">
        {products.map((p) => (
          <li key={p.id} className={cn("flex items-center gap-3 p-3", p.archived && "opacity-50")}>
            <div className="h-14 w-14 shrink-0 border border-border bg-secondary"><ProductImage src={p.photos[0]} alt="" className="h-full w-full" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.code} · {p.category} · {formatBRL(p.price)} · {productAvailable(p)} un. disp.</p>
            </div>
            <button onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`} className="flex h-10 w-10 items-center justify-center border border-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => archiveProduct(p.id, !p.archived)} aria-label={p.archived ? "Desarquivar" : "Arquivar"} className="flex h-10 w-10 items-center justify-center border border-foreground hover:bg-secondary">
              {p.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Estoque ---------------- */

function AdminStock() {
  const { products, movements, addMovement, config } = useStore();
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({});
  const active = products.filter((p) => !p.archived);
  const low = active.flatMap((p) => p.variations.map((v) => ({ p, v }))).filter(({ v }) => { const a = availableOf(v); return a > 0 && a <= config.lowStockThreshold; });
  const out = active.flatMap((p) => p.variations.map((v) => ({ p, v }))).filter(({ v }) => availableOf(v) === 0);

  const send = (productId, variationId) => {
    const key = variationId;
    const f = form[key] || { type: "entrada", qty: "", reason: "" };
    const r = addMovement({ productId, variationId, type: f.type, qty: f.qty, reason: f.reason });
    setMsg((m) => ({ ...m, [key]: r.ok ? { ok: true, text: "Movimentação registrada." } : { ok: false, text: r.error } }));
    if (r.ok) setForm((s) => ({ ...s, [key]: { type: "entrada", qty: "", reason: "" } }));
  };

  return (
    <div className="space-y-6">
      {(low.length > 0 || out.length > 0) && (
        <div className="border border-foreground bg-card p-4 shadow-hard-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-signal">Alertas de estoque</p>
          <ul className="mt-2 space-y-1 text-sm">
            {low.map(({ p, v }) => <li key={v.id}>Estoque baixo: {p.name} ({v.size}/{v.color}) — {availableOf(v)} un. disponíveis.</li>)}
            {out.map(({ p, v }) => <li key={v.id}>Indisponível: {p.name} ({v.size}/{v.color}).</li>)}
          </ul>
        </div>
      )}

      {active.map((p) => (
        <div key={p.id} className="border border-foreground bg-card">
          <p className="border-b border-foreground bg-secondary px-3 py-2 text-sm font-semibold">{p.name} <span className="font-normal text-muted-foreground">({p.code})</span></p>
          <ul className="divide-y divide-border">
            {p.variations.map((v) => {
              const f = form[v.id] || { type: "entrada", qty: "", reason: "" };
              const m = msg[v.id];
              return (
                <li key={v.id} className="p-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-medium">{v.size} / {v.color}</span>
                    <span className="text-muted-foreground">Físico: {v.physical}</span>
                    <span className="text-muted-foreground">Reservado: {v.reserved}</span>
                    <span className={cn("font-semibold", availableOf(v) === 0 && "text-signal")}>Disponível: {availableOf(v)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[10rem_6rem_1fr_auto]">
                    <select aria-label="Tipo de movimentação" className={input} value={f.type} onChange={(e) => setForm((s) => ({ ...s, [v.id]: { ...f, type: e.target.value } }))}>
                      {Object.entries(MOVEMENT_TYPES).filter(([k]) => k !== "ajuste").map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                    <input aria-label="Quantidade" className={input} inputMode="numeric" placeholder="Qtd." value={f.qty} onChange={(e) => setForm((s) => ({ ...s, [v.id]: { ...f, qty: e.target.value } }))} />
                    <input aria-label="Motivo" className={input} placeholder="Motivo (opcional)" value={f.reason} onChange={(e) => setForm((s) => ({ ...s, [v.id]: { ...f, reason: e.target.value } }))} />
                    <button className={cn(btnPrimary, "col-span-2 sm:col-span-1")} onClick={() => send(p.id, v.id)}>Registrar</button>
                  </div>
                  {m && <p role="status" className={cn("mt-2 text-xs", m.ok ? "text-muted-foreground" : "font-medium text-signal")}>{m.text}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div>
        <h3 className="font-display text-xl">Histórico de movimentações</h3>
        {movements.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border border-foreground bg-card text-sm">
            {movements.slice(0, 40).map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 p-3">
                <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleString("pt-BR")}</span>
                <span className="font-medium">{MOVEMENT_TYPES[m.type]}</span>
                <span>{m.productName} ({m.variationLabel})</span>
                <span className="text-muted-foreground">{m.qty > 0 ? `+${m.qty}` : m.qty} un. · {m.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Procura ---------------- */

function AdminInquiries() {
  const { products, inquiries, addInquiry, setInquiryStatus } = useStore();
  const [f, setF] = useState({ ref: "", productId: "", size: "", color: "", qty: "1", note: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const active = products.filter((p) => !p.archived);

  const summary = useMemo(() => {
    const map = new Map();
    inquiries.filter((i) => i.status !== "encerrada").forEach((i) => {
      const key = `${i.productName}|${i.size}|${i.color}`;
      const cur = map.get(key) || { ...i, requests: 0, units: 0 };
      cur.requests += 1;
      cur.units += i.qty;
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.units - a.units);
  }, [inquiries]);

  const copySummary = () => {
    const lines = ["Resumo de procura — RS Modas (demonstração)", ""];
    summary.forEach((s) => lines.push(`• ${s.productName} — tam. ${s.size}, cor ${s.color}: ${s.requests} solicitação(ões), ${s.units} unidade(s) desejada(s)`));
    if (summary.length === 0) lines.push("Nenhuma solicitação em aberto.");
    const text = lines.join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const submit = (e) => {
    e.preventDefault();
    const r = addInquiry(f);
    if (!r.ok) { setError(r.error); return; }
    setError("");
    setF({ ref: "", productId: "", size: "", color: "", qty: "1", note: "" });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3 border border-foreground bg-card p-4 shadow-hard-sm">
        <p className="text-sm font-semibold">Registrar interesse manual</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Referência do atendimento (fictícia)"><input className={input} value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })} placeholder="Ex.: cliente da loja, 10h" /></Field>
          <Field label="Produto">
            <select className={input} value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
              <option value="">Selecione…</option>
              {active.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </Field>
          <Field label="Tamanho"><input className={input} value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} /></Field>
          <Field label="Cor"><input className={input} value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} /></Field>
          <Field label="Quantidade"><input className={input} inputMode="numeric" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></Field>
          <Field label="Observação"><input className={input} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        </div>
        {error && <p role="alert" className="text-sm font-medium text-signal">{error}</p>}
        <button type="submit" className={btnPrimary}>Registrar interesse</button>
      </form>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl">Solicitações</h3>
          <button onClick={copySummary} className={cn(btnGhost, "h-9 text-xs")}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copiado" : "Copiar resumo p/ fornecedor"}
          </button>
        </div>
        {inquiries.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma solicitação registrada. Interesses de clientes anotados aqui ficam separados de vendas confirmadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border border-foreground bg-card text-sm">
            {inquiries.map((i) => (
              <li key={i.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-medium">{i.productName}</span>
                  <span className="text-muted-foreground">tam. {i.size} · cor {i.color} · {i.qty} un.</span>
                  {i.ref && <span className="text-xs text-muted-foreground">ref.: {i.ref}</span>}
                </div>
                {i.note && <p className="text-xs text-muted-foreground">{i.note}</p>}
                <select aria-label="Estado da solicitação" className={cn(input, "h-9 text-xs")} value={i.status} onChange={(e) => setInquiryStatus(i.id, e.target.value)}>
                  {INQUIRY_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl">Mais solicitadas (em aberto)</h3>
        {summary.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border border-foreground bg-card text-sm">
            {summary.map((s, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 p-3">
                <span className="font-medium">{s.productName}</span>
                <span className="text-muted-foreground">tam. {s.size} · cor {s.color}</span>
                <span>{s.requests} solicitação(ões) · {s.units} unidade(s)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Configurações ---------------- */

function AdminSettings() {
  const { config, brands, addBrand, updateConfig, resetDemo } = useStore();
  const [f, setF] = useState(config);
  const [saved, setSaved] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [brandMessage, setBrandMessage] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = (e) => {
    e.preventDefault();
    updateConfig({ ...f, lowStockThreshold: Math.max(0, Math.round(Number(f.lowStockThreshold) || 0)) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <form onSubmit={save} className="space-y-5 rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-card md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da loja"><input className={input} value={f.storeName} onChange={(e) => set("storeName", e.target.value)} /></Field>
        <Field label="WhatsApp (somente números, com DDD)"><input className={input} inputMode="numeric" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} placeholder="5514999999999" /></Field>
        <Field label="Instagram (link)"><input className={input} value={f.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
        <Field label="Cor de destaque"><input type="color" className="h-11 w-full cursor-pointer border border-foreground bg-card p-1" value={f.accentColor} onChange={(e) => set("accentColor", e.target.value)} /></Field>
        <Field label="Endereço"><input className={input} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="A configurar pela loja" /></Field>
        <Field label="Horários de atendimento"><input className={input} value={f.hours} onChange={(e) => set("hours", e.target.value)} placeholder="A configurar pela loja" /></Field>
        <Field label="Limite para alerta de estoque baixo"><input className={input} inputMode="numeric" value={f.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} /></Field>
      </div>
      <Field label="Condições de atendimento e entrega">
        <textarea className="min-h-20 w-full border border-foreground bg-card px-3 py-2 text-sm" value={f.serviceInfo} onChange={(e) => set("serviceInfo", e.target.value)} />
      </Field>
      <Field label="Aviso de demonstração">
        <textarea className="min-h-16 w-full border border-foreground bg-card px-3 py-2 text-sm" value={f.demoNotice} onChange={(e) => set("demoNotice", e.target.value)} />
      </Field>
      <div className="rounded-2xl border border-border bg-secondary p-4">
        <p className="text-sm font-semibold">Marcas disponíveis</p>
        <p className="mt-1 text-xs text-muted-foreground">A lista é usada no cadastro e nos filtros da vitrine. Uma marca nova também é incluída automaticamente ao salvar um produto.</p>
        <div className="mt-3 flex flex-wrap gap-2">{brands.map((brand) => <span key={brand} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">{brand}</span>)}</div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input className={input} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Nome da nova marca" />
          <button type="button" className={cn(btnGhost, "shrink-0")} onClick={() => { const result = addBrand(newBrand); setBrandMessage(result.ok ? "Marca cadastrada." : result.error); if (result.ok) setNewBrand(""); }}>Cadastrar marca</button>
        </div>
        {brandMessage && <p role="status" className="mt-2 text-xs text-muted-foreground">{brandMessage}</p>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button type="submit" className={btnPrimary}>Salvar configurações</button>
        <button type="button" onClick={resetDemo} className={btnGhost}>Restaurar dados de demonstração</button>
        {saved && <span role="status" className="text-sm text-muted-foreground">Configurações salvas.</span>}
      </div>
    </form>
  );
}

/* ---------------- Painel ---------------- */

const TABS = [
  { id: "produtos", label: "Produtos" },
  { id: "estoque", label: "Estoque" },
  { id: "procura", label: "Procura" },
  { id: "config", label: "Configurações" },
];

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") || "produtos";
  return (
    <>
      <Helmet>
        <title>Painel de demonstração — RS Modas</title>
        <meta name="description" content="Painel interno de demonstração da RS Modas: produtos, estoque, procura e configurações." />
      </Helmet>
      <div className="page-shell py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Voltar à vitrine
        </Link>
        <div className="mt-4 rounded-[var(--radius-editorial)] bg-foreground p-5 text-background shadow-soft md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Operação local</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Painel de demonstração</h1>
          <p className="mt-1 text-sm text-background/70">
            Área interna simulada, sem autenticação nesta fase. Os dados ficam apenas neste navegador (armazenamento local), podem ser perdidos e não sincronizam entre dispositivos.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Áreas do painel">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setParams({ aba: t.id })}
              className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", tab === t.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground hover:bg-secondary")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === "produtos" && <AdminProducts />}
          {tab === "estoque" && <AdminStock />}
          {tab === "procura" && <AdminInquiries />}
          {tab === "config" && <AdminSettings />}
        </div>
      </div>
    </>
  );
}
