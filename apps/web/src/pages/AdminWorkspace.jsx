import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore, uid, formatBRL, availableOf, productAvailable, MOVEMENT_TYPES } from "@/lib/store";
import { CLOSED } from "@/lib/operations";
import { ProductImage } from "@/components/chrome";

const field = (label, value, onChange, extra = {}) => <label className="block text-sm font-medium">{label}<input className="control mt-1" value={value} onChange={e => onChange(e.target.value)} {...extra} /></label>;
const blank = () => ({ id: uid(), code: `RS-${Date.now().toString(36).toUpperCase()}`, name: "", brand: "", category: "", price: "", photos: [], description: "", variations: [], publication: "draft", dataKind: "operational" });

export function QuickProductForm({ initial, onSave, onCancel }) {
  const { products, brands, addBrand } = useStore();
  const [d, setD] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sizes, setSizes] = useState([...new Set(initial.variations.map(v => v.size))]);
  const [colors, setColors] = useState([...new Set(initial.variations.map(v => v.color))]);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const set = (key, value) => { setDirty(true); setD(p => ({ ...p, [key]: value })); };
  useEffect(() => {
    if (!dirty) return;
    const before = e => { e.preventDefault(); e.returnValue = ""; };
    const leave = e => { const link = e.target.closest("a"); const nav = e.target.closest('nav[aria-label="Áreas do painel"] button'); if (((link && !link.target) || nav) && !window.confirm("Há alterações não salvas. Sair sem salvar?")) { e.preventDefault(); e.stopPropagation(); } };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", before); document.removeEventListener("click", leave, true); };
  }, [dirty]);
  const rebuild = (nextSizes, nextColors) => {
    const removed = d.variations.filter(v => !nextSizes.includes(v.size) || !nextColors.includes(v.color));
    if (removed.some(v => v.physical > 0 || v.reserved > 0)) { setErrors({ variations: "Zere o saldo e libere as reservas antes de remover um tamanho ou cor." }); return; }
    setSizes(nextSizes); setColors(nextColors);
    set("variations", nextColors.flatMap(color => nextSizes.map(size => d.variations.find(v => v.size === size && v.color === color) || { id: uid(), size, color, physical: 0, reserved: 0 })));
  };
  const addFiles = async files => {
    const list = Array.from(files);
    if (list.length + d.photos.length > 4) { setErrors({ photos: "Escolha até 4 fotos." }); return; }
    if (list.some(f => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 2 * 1024 * 1024)) { setErrors({ photos: "Use JPG, PNG ou WebP com até 2 MB por foto." }); return; }
    setLoadingPhotos(true);
    try {
      const photos = await Promise.all(list.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); })));
      set("photos", [...d.photos, ...photos]); setErrors({});
    } catch { setErrors({ photos: "Não foi possível ler a foto. Tente outra imagem." }); }
    setLoadingPhotos(false);
  };
  const save = publication => {
    const e = {};
    const price = Number(String(d.price).replace(",", "."));
    if (!d.name.trim()) e.name = "Informe o nome da peça.";
    if (!d.code.trim() || products.some(p => p.id !== d.id && p.code === d.code.trim())) e.code = "Use um código único.";
    if (publication === "published") {
      if (!d.brand.trim()) e.brand = "Escolha a marca.";
      if (!d.photos.length) e.photos = "Adicione uma foto para publicar.";
      if (d.price === "" || !Number.isFinite(price) || price < 0) e.price = "Informe um preço válido.";
      if (!d.variations.length) e.variations = "Selecione ao menos um tamanho e uma cor.";
    }
    if (d.variations.some(v => !Number.isInteger(Number(v.physical)) || Number(v.physical) < (v.reserved || 0))) e.variations = "A quantidade deve ser inteira e não pode ser menor que as reservas.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const result = onSave({ ...d, name: d.name.trim(), code: d.code.trim(), price: Number.isFinite(price) ? price : 0, publication });
    if (result?.ok === false) setErrors({ save: result.error }); else setDirty(false);
  };
  const error = key => errors[key] && <p role="alert" className="mt-1 text-sm text-destructive">{errors[key]}</p>;
  return <form className="space-y-5" onSubmit={e => { e.preventDefault(); save("published"); }}>
    <section className="admin-surface space-y-4">
      <h2>1. Fotos e identificação</h2>
      <div className="rounded-xl border-2 border-dashed border-border p-4" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
        <label className="block text-sm font-medium">Selecione ou arraste as fotos<input className="mt-3 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => addFiles(e.target.files)} /></label>
        <p className="mt-2 text-xs text-muted-foreground">Até 4 fotos, com 2 MB cada. {loadingPhotos && "Carregando…"}</p>
        <div className="mt-3 flex flex-wrap gap-3">{d.photos.map((src, i) => <div key={i} className="w-20"><ProductImage src={src} alt={`Foto ${i + 1}`} className="h-24 w-20 rounded-lg" /><button type="button" className="min-h-11 text-sm underline" onClick={() => set("photos", d.photos.filter((_, n) => n !== i))}>Remover {i + 1}</button></div>)}</div>
      </div>{error("photos")}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>{field("Nome da peça", d.name, v => set("name", v), { placeholder: "Ex.: Blusa Aurora" })}{error("name")}</div>
        <div><label className="block text-sm font-medium">Marca<select className="control mt-1" value={d.brand} onChange={e => set("brand", e.target.value)}><option value="">Escolha a marca</option>{brands.map(b => <option key={b}>{b}</option>)}</select></label>{error("brand")}<button className="min-h-11 text-sm underline" type="button" onClick={() => setAddingBrand(!addingBrand)}>Adicionar marca</button>
          {addingBrand && <div className="flex flex-wrap gap-2">{field("Nova marca", newBrand, setNewBrand)}<button className="button-light" type="button" onClick={() => { const r = addBrand(newBrand); if (r.ok) { set("brand", newBrand.trim()); setAddingBrand(false); setNewBrand(""); } else setErrors({ brand: r.error }); }}>Cadastrar marca</button></div>}
        </div>
        {field("Categoria", d.category, v => set("category", v), { list: "categories-quick" })}
        <datalist id="categories-quick">{[...new Set(["Calças", "Vestidos", "Blusas", "Conjuntos", ...products.map(p => p.category)])].map(c => <option key={c}>{c}</option>)}</datalist>
      </div>
    </section>
    <section className="admin-surface space-y-4"><h2>2. Preço, tamanhos e quantidades</h2>
      <div className="max-w-xs">{field("Preço na vitrine (R$)", d.price, v => set("price", v), { inputMode: "decimal", placeholder: "149,90" })}{error("price")}</div>
      <fieldset><legend className="mb-2 text-sm font-semibold">Tamanhos</legend><div className="flex flex-wrap gap-2">{[...new Set(["PP", "P", "M", "G", "GG", "34", "36", "38", "40", "42", "44", "46", ...sizes])].map(s => <button type="button" key={s} aria-pressed={sizes.includes(s)} className={sizes.includes(s) ? "button-dark px-3" : "button-light px-3"} onClick={() => rebuild(sizes.includes(s) ? sizes.filter(x => x !== s) : [...sizes, s], colors)}>{s}</button>)}</div></fieldset>
      <details><summary className="min-h-11 text-sm">Outro tamanho</summary><div className="flex flex-wrap gap-2">{field("Tamanho personalizado", customSize, setCustomSize)}<button type="button" className="button-light" onClick={() => { if (customSize.trim()) rebuild([...new Set([...sizes, customSize.trim()])], colors); setCustomSize(""); }}>Incluir tamanho</button></div></details>
      <fieldset><legend className="mb-2 text-sm font-semibold">Cores</legend><div className="flex flex-wrap gap-2">{[...new Set(["Preto", "Branco", "Azul", "Bege", "Rosa", ...colors])].map(c => <button type="button" key={c} aria-pressed={colors.includes(c)} className={colors.includes(c) ? "button-dark" : "button-light"} onClick={() => rebuild(sizes, colors.includes(c) ? colors.filter(x => x !== c) : [...colors, c])}>{c}</button>)}</div></fieldset>
      <details><summary className="min-h-11 text-sm">Outra cor</summary><div className="flex flex-wrap gap-2">{field("Cor personalizada", customColor, setCustomColor)}<button type="button" className="button-light" onClick={() => { if (customColor.trim()) rebuild(sizes, [...new Set([...colors, customColor.trim()])]); setCustomColor(""); }}>Incluir cor</button></div></details>
      {d.variations.length > 0 && <div><p className="mb-3 text-sm text-muted-foreground">Quantas peças você tem? Zero permite consultar encomenda.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.variations.map(v => <label key={v.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3 text-sm"><span>{v.color} · {v.size}{v.reserved > 0 && <small className="block">{v.reserved} reservadas</small>}</span><input aria-label={`Quantidade ${v.color} ${v.size}`} className="control w-20 px-2" type="number" min={v.reserved || 0} step="1" value={v.physical} onChange={e => set("variations", d.variations.map(x => x.id === v.id ? { ...x, physical: e.target.value } : x))} /></label>)}</div></div>}{error("variations")}
    </section>
    <details className="admin-surface"><summary className="font-semibold">Detalhes opcionais e descrição</summary><div className="mt-4 space-y-4">
      {field("Código interno (gerado automaticamente)", d.code, v => set("code", v))}{error("code")}
      <label className="block text-sm">Descrição<textarea className="control mt-1 min-h-28 py-3" value={d.description} onChange={e => set("description", e.target.value)} /></label>
      <button type="button" className="button-light" onClick={() => setSuggestion([d.name, d.brand && `Marca: ${d.brand}.`, sizes.length && `Tamanhos cadastrados: ${sizes.join(", ")}.`, colors.length && `Cores cadastradas: ${colors.join(", ")}.`, "Consulte a loja sobre disponibilidade e detalhes."].filter(Boolean).join(" "))}>Sugerir descrição (simulação)</button>
      <p className="text-sm text-muted-foreground">Simulação local: usa somente o que você preencheu. Revise antes de aplicar.</p>
      {suggestion !== null && <div className="space-y-3 rounded-xl bg-secondary p-3"><label className="block text-sm">Rascunho da descrição<textarea className="control mt-1 min-h-28 py-3" value={suggestion} onChange={e => setSuggestion(e.target.value)} /></label><p className="text-sm">Aplicar substituirá a descrição atual.</p><div className="flex flex-wrap gap-2"><button type="button" className="button-dark" onClick={() => { set("description", suggestion); setSuggestion(null); }}>Aplicar descrição</button><button type="button" className="button-light" onClick={() => setSuggestion(null)}>Descartar sugestão</button></div></div>}
      <div className="flex flex-wrap items-end gap-2">{field("Link de imagem (opcional)", imageUrl, setImageUrl)}<button type="button" className="button-light" onClick={() => { if (/^(https?:\/\/|\/catalog\/)/.test(imageUrl) && d.photos.length < 4) { set("photos", [...d.photos, imageUrl]); setImageUrl(""); } else setErrors({ photos: "Use um link válido e até 4 fotos." }); }}>Adicionar imagem</button></div>
    </div></details>
    <section className="admin-surface space-y-4"><h2>3. Confira e publique</h2><div className="flex items-center gap-4"><ProductImage src={d.photos[0]} alt="Prévia da peça" className="h-28 w-20 shrink-0 rounded-xl" /><div className="min-w-0"><p className="font-semibold">{d.name || "Nome da peça"}</p><p>{formatBRL(Number(String(d.price).replace(",", ".")))}</p><p className="text-sm text-muted-foreground">{d.variations.length} combinações · {d.variations.reduce((n, v) => n + Number(v.physical || 0), 0)} peças</p></div></div><p className="text-sm text-muted-foreground">Rascunho fica só no painel. Publicar mostra a peça no catálogo deste navegador.</p>{error("save")}{error("code")}<div className="flex flex-wrap gap-2"><button type="submit" disabled={loadingPhotos} className="button-dark">Publicar na vitrine</button><button type="button" disabled={loadingPhotos} className="button-light" onClick={() => save("draft")}>Salvar rascunho</button><button type="button" className="button-light" onClick={() => { if (!dirty || window.confirm("Descartar alterações não salvas?")) onCancel(); }}>Cancelar</button></div></section>
  </form>;
}

export function ProductsWorkspace() {
  const { products, saveProduct, archiveProduct } = useStore();
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState("loja");
  if (editing) return <QuickProductForm initial={editing} onCancel={() => setEditing(null)} onSave={d => { const r = saveProduct(d); if (r?.ok === false) return r; setSaved(d); setEditing(null); return { ok: true }; }} />;
  
  const operational = products.filter(p => p.dataKind !== "supplier-reference");
  const supplier = products.filter(p => p.dataKind === "supplier-reference");
  const currentList = tab === "loja" ? operational : supplier;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Peças cadastradas</h2>
          <p className="text-sm text-muted-foreground">Gerencie o catálogo da loja e visualize referências de fornecedores.</p>
        </div>
        <button className="button-dark" onClick={() => setEditing(blank())}>Nova peça</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={tab === "loja" ? "button-dark" : "button-light"} onClick={() => setTab("loja")}>
          Peças da loja ({operational.length})
        </button>
        <button className={tab === "fornecedores" ? "button-dark" : "button-light"} onClick={() => setTab("fornecedores")}>
          Referências de fornecedores ({supplier.length})
        </button>
      </div>

      {saved && <div role="status" className="admin-surface">{saved.publication === "draft" ? "Rascunho salvo no painel." : "Peça publicada na vitrine."} {saved.publication !== "draft" && <Link className="ml-2 underline" to={`/produto/${saved.id}`}>Ver prévia</Link>}</div>}

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {currentList.map(p => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
            <ProductImage src={p.photos[0]} alt="" className="h-16 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 basis-40">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{p.name}</p>
                {p.dataKind === "supplier-reference" && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Fornecedor</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{p.code} · {formatBRL(p.price)}</p>
              <p className="text-sm">{p.archived ? "Arquivado" : p.publication === "draft" ? "Rascunho" : "Na vitrine"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="button-light px-3" to={`/produto/${p.id}`}>Ver</Link>
              {p.dataKind !== "supplier-reference" && (
                <>
                  <button className="button-light px-3" onClick={() => setEditing(structuredClone(p))}>Editar</button>
                  <button className="button-light px-3" onClick={() => setEditing({ ...structuredClone(p), ...blank(), name: `${p.name} (cópia)`, brand: p.brand, category: p.category, price: p.price, photos: [...p.photos], description: p.description, variations: p.variations.map(v => ({ ...v, id: uid(), physical: 0, reserved: 0 })) })}>Duplicar produto</button>
                  <button className="button-light px-3" onClick={() => archiveProduct(p.id, !p.archived)}>{p.archived ? "Restaurar" : "Arquivar"}</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Dashboard() {
  const { products, inquiries, config } = useStore();
  const operational = products.filter(p => !p.archived && p.publication !== "draft" && p.dataKind !== "supplier-reference");
  const low = operational.flatMap(p => p.variations.filter(v => availableOf(v) <= config.lowStockThreshold).map(v => ({ p, v })));
  const pending = inquiries.filter(i => !CLOSED.includes(i.status));
  const tiles = [
    ["Peças acabando", low.length, "estoque&filtro=acabando"],
    ["Aguardando cliente", pending.filter(i => i.status === "aguardando" || i.status === "nova").length, "procura&status=aguardando"],
    ["Consultar fornecedor", pending.filter(i => i.status === "fornecedor").length, "procura&status=fornecedor"],
    ["Pronto para entregar", pending.filter(i => ["confirmada", "recebida", "pronta"].includes(i.status)).length, "procura&status=entregas"]
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">O que precisa da minha atenção?</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([title, n, to]) => (
          <Link key={title} to={`/painel?aba=${to}`} className="admin-surface hover:border-foreground">
            <span className="block text-3xl font-semibold">{n}</span>
            <span className="mt-2 block text-sm">{title} →</span>
          </Link>
        ))}
      </div>
      <section className="admin-surface">
        <h2>O que fazer agora</h2>
        <ul className="mt-3 divide-y divide-border">
          {pending.map(i => (
            <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={i.id}>
              <div>
                <p className="font-medium">{i.productName} · {i.size} / {i.color}</p>
                <p className="text-sm text-muted-foreground">{i.qty} peça(s) · {i.ref || "Atendimento sem referência"}</p>
              </div>
              <Link className="button-light" to={`/painel?aba=procura&atendimento=${i.id}`}>
                {i.status === "nova" ? "Responder solicitação" : i.status === "fornecedor" ? "Consultar fornecedor" : i.status === "pronta" ? "Registrar entrega" : "Ver atendimento"}
              </Link>
            </li>
          ))}
          {low.slice(0, 8).map(({ p, v }) => (
            <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={v.id}>
              <div>
                <p className="font-medium">{p.name} · {v.size} / {v.color}</p>
                <p className="text-sm text-muted-foreground">{availableOf(v) === 0 ? "Sem estoque" : "Peças acabando"} · {availableOf(v)} disponíveis</p>
              </div>
              <Link to={`/painel?aba=estoque&produto=${p.id}`} className="button-light">Ver estoque</Link>
            </li>
          ))}
        </ul>
        {!pending.length && !low.length && <p className="mt-4 text-muted-foreground">Tudo em dia. Nenhuma pendência por aqui.</p>}
      </section>
    </div>
  );
}

export function StockWorkspace() {
  const { products, inquiries, movements, addMovement, config } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(params.get("produto"));
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState("");
  const filter = params.get("filtro") || "todos";
  const demand = p => inquiries.filter(i => i.productId === p.id && !CLOSED.includes(i.status)).reduce((n, i) => n + i.qty, 0);
  const attention = p => p.variations.some(v => availableOf(v) <= config.lowStockThreshold);
  const rows = products.filter(p => !p.archived && p.publication !== "draft" && p.dataKind !== "supplier-reference" && `${p.name} ${p.code}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (filter === "todos" || filter === "acabando" && attention(p) || filter === "sem" && p.variations.some(v => availableOf(v) === 0) || filter === "procura" && demand(p) > 0)).sort((a, b) => demand(b) - demand(a) || Number(attention(b)) - Number(attention(a)) || productAvailable(a) - productAvailable(b));
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Estoque físico da loja</h2>
      {field("Buscar produto ou código", query, setQuery, { type: "search" })}
      <div className="flex flex-wrap gap-2">
        {[["todos", "Todos"], ["acabando", "Acabando"], ["sem", "Sem estoque"], ["procura", "Com procura"]].map(([id, label]) => (
          <button key={id} className={filter === id ? "button-dark" : "button-light"} onClick={() => setParams({ aba: "estoque", filtro: id })}>{label}</button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{rows.length} produtos físicos cadastrados · Ordenados por procura e necessidade de reposição. Disponíveis = físico − reservado.</p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[2fr_1fr_6rem_6rem_1fr_6rem] gap-3 bg-secondary p-4 text-sm font-semibold lg:grid">
          <span>Foto e produto</span><span>Marca</span><span>Disponíveis</span><span>Reservados</span><span>Situação</span><span>Ação</span>
        </div>
        {rows.map(p => (
          <div key={p.id} className="border-t border-border">
            <div className="grid items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_6rem_6rem_1fr_6rem]">
              <div className="flex min-w-0 items-center gap-3">
                <ProductImage src={p.photos[0]} alt="" className="h-14 w-11 shrink-0 rounded-lg" />
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.code}</p>
                </div>
              </div>
              <span className="text-sm">{p.brand}</span>
              <span className="text-sm"><span className="lg:hidden">Disponíveis: </span>{productAvailable(p)}</span>
              <span className="text-sm"><span className="lg:hidden">Reservados: </span>{p.variations.reduce((n, v) => n + v.reserved, 0)}</span>
              <span className="text-sm text-signal">{demand(p) ? `${demand(p)} em procura` : attention(p) ? "Repor tamanhos" : "Em dia"}</span>
              <button className="button-light px-2" aria-expanded={expanded === p.id} onClick={() => { setExpanded(expanded === p.id ? null : p.id); setAction(null); }}>Detalhes</button>
            </div>
            {expanded === p.id && (
              <div className="space-y-3 border-t border-border bg-secondary p-4">
                {p.variations.map(v => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3">
                    <div>
                      <p className="font-semibold">{v.size} / {v.color}</p>
                      <p className="text-sm">Físico {v.physical} · Reservado {v.reserved} · Disponível {availableOf(v)}</p>
                    </div>
                    <button className="button-light" onClick={() => { setAction({ productId: p.id, variationId: v.id, type: "entrada", qty: "", reason: "" }); setMessage(""); }}>Ajustar peças</button>
                  </div>
                ))}
                {action?.productId === p.id && (
                  <form className="admin-surface space-y-3" onSubmit={e => { e.preventDefault(); const r = addMovement(action); setMessage(r.ok ? "Quantidade atualizada." : r.error); if (r.ok) setAction(null); }}>
                    <h3 className="font-semibold">{p.variations.find(v => v.id === action.variationId)?.size} / {p.variations.find(v => v.id === action.variationId)?.color}</h3>
                    <label className="block text-sm">O que você precisa fazer?<select className="control mt-1" value={action.type} onChange={e => setAction({ ...action, type: e.target.value })}>{[["entrada", "Recebi peças"], ["reserva", "Reservar"], ["correcao", "Corrigir quantidade"], ["liberacao", "Liberar reserva"], ["venda", "Confirmar venda reservada"]].map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                    {field(action.type === "correcao" ? "Quantidade física correta" : "Quantidade", action.qty, qty => setAction({ ...action, qty }), { type: "number", min: action.type === "correcao" ? 0 : 1, step: 1 })}
                    {field("Motivo (opcional)", action.reason, reason => setAction({ ...action, reason }))}
                    <button className="button-dark">Confirmar ajuste</button>
                  </form>
                )}
                <details>
                  <summary className="min-h-11 text-sm font-semibold">Histórico deste produto</summary>
                  <ul className="space-y-2 text-sm">{movements.filter(m => m.productId === p.id).slice(0, 40).map(m => <li key={m.id}>{new Date(m.date).toLocaleString("pt-BR")} · {MOVEMENT_TYPES[m.type]} · {m.variationLabel} · {m.qty} · {m.reason}</li>)}</ul>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
      {!rows.length && <p className="admin-surface">Nenhuma peça neste filtro.</p>}
      {message && <p role="status" className="admin-surface">{message}</p>}
    </div>
  );
}
