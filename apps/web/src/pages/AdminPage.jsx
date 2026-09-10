import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Archive, ArchiveRestore, Pencil, Copy, Check, Sparkles } from "lucide-react";
import { useStore, formatBRL, availableOf, productAvailable, INQUIRY_STATUSES, MOVEMENT_TYPES, uid } from "@/lib/store";
import { ProductImage } from "@/components/chrome";
import { cn } from "@/lib/utils";
import { Dashboard, ProductsWorkspace, StockWorkspace } from "./AdminWorkspace";
import { CLOSED, FLOW } from "@/lib/operations";

const input = "control";
const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors";
const btnPrimary = cn(btn, "bg-foreground text-background hover:bg-signal");
const btnGhost = cn(btn, "border border-border bg-card hover:border-foreground hover:bg-secondary");

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-signal">{error}</span>}
    </label>
  );
}


/* ---------------- Procura ---------------- */

function AdminInquiries() {
  const [params, setParams] = useSearchParams();
  const { products, inquiries, addInquiry, setInquiryStatus } = useStore();
  const [f, setF] = useState({ ref: "", productId: "", size: "", color: "", qty: "1", note: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const active = products.filter((p) => !p.archived);

  const summary = useMemo(() => {
    const map = new Map();
    inquiries.filter((i) => ["nova", "fornecedor", "aguardando"].includes(i.status)).forEach((i) => {
      const key = `${i.productId}|${i.size}|${i.color}`;
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
      <div className="flex flex-wrap gap-2"><button className={btnGhost} onClick={() => setParams({ aba: "procura" })}>Todos os atendimentos</button>{INQUIRY_STATUSES.filter(s => s.id !== "encerrada").map(s => <button className={params.get("status") === s.id ? btnPrimary : btnGhost} key={s.id} onClick={() => setParams({ aba: "procura", status: s.id })}>{s.label} ({inquiries.filter(i => i.status === s.id).length})</button>)}</div>
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
            {inquiries.filter(i => (!params.get("atendimento") || params.get("atendimento") === i.id) && (!params.get("status") || (params.get("status") === "entregas" ? ["confirmada", "recebida", "pronta"].includes(i.status) : params.get("status") === i.status))).map((i) => (
              <li key={i.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-medium">{i.productName}</span>
                  <span className="text-muted-foreground">tam. {i.size} · cor {i.color} · {i.qty} un.</span>
                  {i.ref && <span className="text-xs text-muted-foreground">ref.: {i.ref}</span>}
                </div>
                {i.note && <p className="text-xs text-muted-foreground">{i.note}</p>}
                <p className="font-semibold text-signal">{INQUIRY_STATUSES.find(s => s.id === i.status)?.label || i.status}</p>
                <div className="flex flex-wrap gap-2">{(FLOW[i.status] || []).map(status => <button key={status} className={btnGhost} onClick={() => { const r = setInquiryStatus(i.id, status); setError(r.ok ? "" : r.error); }}>{({ fornecedor: "Consultar fornecedor", aguardando: "Aguardar cliente", confirmada: "Confirmar encomenda", recebida: "Recebi a encomenda", pronta: "Pronto para entregar", entregue: "Registrar entrega", cancelada: "Cancelar atendimento" })[status]}</button>)}</div>
                {i.status === "confirmada" && <p className="text-sm text-muted-foreground">Ao receber, as peças entram no estoque e ficam reservadas para este atendimento.</p>}
                {i.status === "pronta" && <p className="text-sm text-muted-foreground">Registrar entrega baixa as peças reservadas uma única vez.</p>}
                {i.history?.length > 0 && <details><summary className="min-h-11 text-sm">Histórico do atendimento</summary>{i.history.map((h, n) => <p className="text-sm" key={n}>{new Date(h.date).toLocaleString("pt-BR")} · {INQUIRY_STATUSES.find(s => s.id === h.status)?.label}</p>)}</details>}
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
        <Field label="Cor de destaque"><input type="color" className="h-11 w-full cursor-pointer border border-foreground bg-card p-1" value={f.accentColor} onChange={(e) => set("accentColor", e.target.value)} /><span className="mt-1 block text-sm text-muted-foreground">Tons claros são escurecidos automaticamente nos textos e botões para manter a leitura.</span></Field>
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
        <button type="button" onClick={() => { if (window.confirm("Isso substitui os dados deste navegador pela demonstração inicial. Deseja continuar?")) resetDemo(); }} className={btnGhost}>Restaurar dados de demonstração</button>
        {saved && <span role="status" className="text-sm text-muted-foreground">Configurações salvas.</span>}
      </div>
    </form>
  );
}

/* ---------------- Painel ---------------- */

const TABS = [
  { id: "inicio", label: "Início" },
  { id: "produtos", label: "Produtos" },
  { id: "estoque", label: "Estoque" },
  { id: "procura", label: "Procura" },
  { id: "config", label: "Configurações" },
];

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") || "inicio";
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
        <div className="mt-4 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Operação local</p>
          <h1 className="mt-2 font-display text-3xl">Seu dia na RS Modas</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Área interna simulada, sem autenticação nesta fase. Os dados ficam apenas neste navegador (armazenamento local), podem ser perdidos e não sincronizam entre dispositivos.
          </p>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Áreas do painel">
          {TABS.map((t) => (
            <button
              key={t.id}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => setParams({ aba: t.id })}
              className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", tab === t.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground hover:bg-secondary")}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-6">
          {tab === "inicio" && <Dashboard />}
          {tab === "produtos" && <ProductsWorkspace />}
          {tab === "estoque" && <StockWorkspace />}
          {tab === "procura" && <AdminInquiries />}
          {tab === "config" && <AdminSettings />}
        </div>
      </div>
    </>
  );
}
