import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard, EmptyState } from "@/components/chrome";
import { useStore, productStatus } from "@/lib/store";

const PRICE_RANGES = [
  { id: "all", label: "Todas as faixas" },
  { id: "0-100", label: "Até R$ 100" },
  { id: "100-200", label: "R$ 100 a R$ 200" },
  { id: "200-300", label: "R$ 200 a R$ 300" },
  { id: "300-99999", label: "Acima de R$ 300" },
];

const selectClass =
  "h-11 w-full border border-foreground bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function CatalogPage() {
  const { products, config } = useStore();
  const [searchParams] = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("busca") || "");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "all");
  const [tamanho, setTamanho] = useState("all");
  const [cor, setCor] = useState("all");
  const [preco, setPreco] = useState("all");
  const [disp, setDisp] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setBusca(searchParams.get("busca") || "");
    setCategoria(searchParams.get("categoria") || "all");
  }, [searchParams]);

  const visible = useMemo(() => products.filter((p) => !p.archived), [products]);
  const categories = useMemo(() => [...new Set(visible.map((p) => p.category))].sort(), [visible]);
  const sizes = useMemo(() => [...new Set(visible.flatMap((p) => p.variations.map((v) => v.size)))], [visible]);
  const colors = useMemo(() => [...new Set(visible.flatMap((p) => p.variations.map((v) => v.color)))].sort(), [visible]);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return visible.filter((p) => {
      if (q && !`${p.name} ${p.code} ${p.category}`.toLowerCase().includes(q)) return false;
      if (categoria !== "all" && p.category !== categoria) return false;
      if (tamanho !== "all" && !p.variations.some((v) => v.size === tamanho)) return false;
      if (cor !== "all" && !p.variations.some((v) => v.color === cor)) return false;
      if (preco !== "all") {
        const [min, max] = preco.split("-").map(Number);
        if (p.price < min || p.price >= max) return false;
      }
      if (disp !== "all" && productStatus(p, config.lowStockThreshold) !== disp) return false;
      return true;
    });
  }, [visible, busca, categoria, tamanho, cor, preco, disp, config.lowStockThreshold]);

  const hasActiveFilters =
    busca.trim() !== "" || categoria !== "all" || tamanho !== "all" || cor !== "all" || preco !== "all" || disp !== "all";

  const clearFilters = () => {
    setBusca("");
    setCategoria("all");
    setTamanho("all");
    setCor("all");
    setPreco("all");
    setDisp("all");
  };

  return (
    <>
      <Helmet>
        <title>Catálogo — RS Modas</title>
        <meta name="description" content="Catálogo da RS Modas: busque e filtre peças por categoria, tamanho, cor, preço e disponibilidade." />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl">Catálogo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "peça encontrada" : "peças encontradas"}
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou código"
              aria-label="Buscar no catálogo"
              className="h-11 w-full border border-foreground bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              className="flex h-11 shrink-0 items-center gap-2 border border-foreground bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
          </div>

          <div className={`${showFilters ? "grid" : "hidden"} grid-cols-1 gap-3 border border-foreground bg-card p-4 shadow-hard-sm sm:grid-cols-2 md:grid md:grid-cols-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selectClass}>
                <option value="all">Todas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tamanho</span>
              <select value={tamanho} onChange={(e) => setTamanho(e.target.value)} className={selectClass}>
                <option value="all">Todos</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cor</span>
              <select value={cor} onChange={(e) => setCor(e.target.value)} className={selectClass}>
                <option value="all">Todas</option>
                {colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço</span>
              <select value={preco} onChange={(e) => setPreco(e.target.value)} className={selectClass}>
                {PRICE_RANGES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponibilidade</span>
              <select value={disp} onChange={(e) => setDisp(e.target.value)} className={selectClass}>
                <option value="all">Todas</option>
                <option value="disponivel">Disponível</option>
                <option value="baixo">Últimas unidades</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-2 border border-foreground bg-card px-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
            >
              <X className="h-3.5 w-3.5" /> Limpar filtros
            </button>
          )}
        </div>

        <div className="mt-8">
          {visible.length === 0 ? (
            <EmptyState title="Catálogo vazio">
              <p>Nenhuma peça cadastrada no momento. Novos produtos cadastrados no painel aparecem aqui automaticamente.</p>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum resultado para esta busca"
              action={
                <button
                  onClick={clearFilters}
                  className="mt-1 inline-flex h-11 items-center border border-foreground bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-signal"
                >
                  Limpar filtros
                </button>
              }
            >
              <p>Tente ajustar a busca ou remover alguns filtros para ver mais peças.</p>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
