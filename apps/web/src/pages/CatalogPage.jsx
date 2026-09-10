import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard, EmptyState } from "@/components/chrome";
import { useStore, productStatus } from "@/lib/store";

const PRICE_RANGES = [
  { id: "all", label: "Todos os preços" },
  { id: "0-150", label: "Até R$ 150" },
  { id: "150-250", label: "R$ 150 a R$ 250" },
  { id: "250-400", label: "R$ 250 a R$ 400" },
  { id: "400-99999", label: "Acima de R$ 400" },
];

const emptyFilters = { categoria: "all", marca: "all", tamanho: "all", cor: "all", preco: "all", disp: "all", origem: "all" };

function FilterFields({ filters, setFilter, categories, brands, sizes, colors }) {
  const fields = [
    ["categoria", "Categoria", "Todas", categories],
    ["marca", "Marca", "Todas", brands],
    ["tamanho", "Tamanho", "Todos", sizes],
    ["cor", "Cor", "Todas", colors],
  ];
  return (
    <div className="grid gap-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Origem</span>
        <select value={filters.origem} onChange={(event) => setFilter("origem", event.target.value)} className="control">
          <option value="all">Todas as peças</option>
          <option value="fornecedor">Referências de fornecedores</option>
          <option value="loja">Vitrine da loja</option>
        </select>
      </label>
      {fields.map(([key, label, allLabel, options]) => (
        <label key={key} className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
          <select value={filters[key]} onChange={(event) => setFilter(key, event.target.value)} className="control">
            <option value="all">{allLabel}</option>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      ))}
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preço</span>
        <select value={filters.preco} onChange={(event) => setFilter("preco", event.target.value)} className="control">
          {PRICE_RANGES.map((range) => <option key={range.id} value={range.id}>{range.label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Disponibilidade</span>
        <select value={filters.disp} onChange={(event) => setFilter("disp", event.target.value)} className="control">
          <option value="all">Todas</option>
          <option value="disponivel">Disponível na loja</option>
          <option value="baixo">Últimas unidades</option>
          <option value="indisponivel">Sob consulta / Encomenda</option>
        </select>
      </label>
    </div>
  );
}

export default function CatalogPage() {
  const { products, config, favorites, brands } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("busca") || "");
  const [filters, setFilters] = useState({
    ...emptyFilters,
    categoria: searchParams.get("categoria") || "all",
    marca: searchParams.get("marca") || "all",
    origem: searchParams.get("origem") || "all",
  });
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get("favoritos") === "1");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setBusca(searchParams.get("busca") || "");
    setFilters((current) => ({
      ...current,
      categoria: searchParams.get("categoria") || "all",
      marca: searchParams.get("marca") || "all",
      origem: searchParams.get("origem") || "all",
    }));
    setFavoritesOnly(searchParams.get("favoritos") === "1");
  }, [searchParams]);

  const visible = useMemo(() => products.filter((product) => !product.archived && product.publication !== "draft"), [products]);
  const categories = useMemo(() => [...new Set(visible.map((product) => product.category))].sort((a, b) => a.localeCompare(b, "pt-BR")), [visible]);
  const sizes = useMemo(() => [...new Set(visible.flatMap((product) => product.variations.map((variation) => variation.size)))], [visible]);
  const colors = useMemo(() => [...new Set(visible.flatMap((product) => product.variations.map((variation) => variation.color)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [visible]);

  const filtered = useMemo(() => {
    const query = busca.trim().toLocaleLowerCase("pt-BR");
    return visible.filter((product) => {
      const isSupplier = product.sourceType === "supplier-reference" || product.dataKind === "supplier-reference";
      if (favoritesOnly && !favorites.includes(product.id)) return false;
      if (filters.origem === "fornecedor" && !isSupplier) return false;
      if (filters.origem === "loja" && isSupplier) return false;
      if (query && !`${product.name} ${product.code} ${product.category} ${product.brand}`.toLocaleLowerCase("pt-BR").includes(query)) return false;
      if (filters.categoria !== "all" && product.category !== filters.categoria) return false;
      if (filters.marca !== "all" && product.brand !== filters.marca) return false;
      if (filters.tamanho !== "all" && !product.variations.some((variation) => variation.size === filters.tamanho)) return false;
      if (filters.cor !== "all" && !product.variations.some((variation) => variation.color === filters.cor)) return false;
      if (filters.preco !== "all") {
        const [min, max] = filters.preco.split("-").map(Number);
        if (product.price < min || product.price >= max) return false;
      }
      if (filters.disp !== "all" && productStatus(product, config.lowStockThreshold) !== filters.disp) return false;
      return true;
    });
  }, [visible, favoritesOnly, favorites, busca, filters, config.lowStockThreshold]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => {
    setBusca("");
    setFilters(emptyFilters);
    setFavoritesOnly(false);
    setSearchParams({});
  };

  const activeFilters = [
    busca.trim() && { key: "busca", label: `Busca: ${busca.trim()}`, clear: () => setBusca("") },
    favoritesOnly && { key: "favoritos", label: "Meus favoritos", clear: () => { setFavoritesOnly(false); setSearchParams({}); } },
    filters.origem !== "all" && {
      key: "origem",
      label: filters.origem === "fornecedor" ? "Referências de fornecedores" : "Vitrine da loja",
      clear: () => setFilter("origem", "all"),
    },
    ...Object.entries(filters)
      .filter(([key, value]) => key !== "origem" && value !== "all")
      .map(([key, value]) => ({ key, label: value, clear: () => setFilter(key, "all") })),
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{favoritesOnly ? "Favoritos" : "Catálogo"} — RS Modas</title>
        <meta name="description" content="Catálogo multimarcas da RS Modas: busque e filtre por categoria, marca, tamanho, cor e disponibilidade." />
      </Helmet>

      <div className="page-shell py-8 sm:py-12">
        <div className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow">Vitrine RS</p>
            <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] sm:text-5xl">{favoritesOnly ? "Seus favoritos" : "Encontre a sua peça"}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "peça encontrada" : "peças encontradas"}</p>
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar no catálogo</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Busque por peça, código ou marca" className="control pl-11" />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="button-light flex-1"><SlidersHorizontal className="h-4 w-4" /> Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}</button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-[var(--radius-editorial)] border-border p-5">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl">Filtrar catálogo</SheetTitle>
                <SheetDescription>Combine opções para encontrar a peça certa.</SheetDescription>
              </SheetHeader>
              <div className="mt-6"><FilterFields {...{ filters, setFilter, categories, brands, sizes, colors }} /></div>
              <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-2 bg-background pt-3">
                <button onClick={clearFilters} className="button-light">Limpar</button>
                <SheetClose asChild><button className="button-dark">Ver {filtered.length} resultados</button></SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <button onClick={() => setFavoritesOnly((value) => !value)} aria-pressed={favoritesOnly} className={favoritesOnly ? "button-dark px-4" : "button-light px-4"}><Heart className={favoritesOnly ? "h-4 w-4 fill-current" : "h-4 w-4"} /><span className="sr-only">Mostrar favoritos</span></button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Filtros selecionados">
            {activeFilters.map((filter) => (
              <button key={`${filter.key}-${filter.label}`} onClick={filter.clear} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:border-foreground">
                {filter.label} <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button onClick={clearFilters} className="min-h-9 px-2 text-xs font-semibold text-signal hover:underline">Limpar filtros</button>
          </div>
        )}

        <div className="mt-8 grid gap-9 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block" aria-label="Filtros do catálogo">
            <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold">Filtrar</p>
                <button onClick={clearFilters} className="text-xs font-semibold text-signal hover:underline">Limpar</button>
              </div>
              <FilterFields {...{ filters, setFilter, categories, brands, sizes, colors }} />
              <button onClick={() => setFavoritesOnly((value) => !value)} aria-pressed={favoritesOnly} className={favoritesOnly ? "button-dark mt-4 w-full" : "button-light mt-4 w-full"}>
                <Heart className={favoritesOnly ? "h-4 w-4 fill-current" : "h-4 w-4"} /> Somente favoritos
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            {visible.length === 0 ? (
              <EmptyState title="Catálogo vazio"><p>Novas peças cadastradas no painel aparecem aqui automaticamente.</p></EmptyState>
            ) : filtered.length === 0 ? (
              <EmptyState title={favoritesOnly && favorites.length === 0 ? "Você ainda não favoritou nenhuma peça" : "Nenhum resultado por aqui"} action={<button onClick={clearFilters} className="button-dark mt-2">Ver catálogo completo</button>}>
                <p>{favoritesOnly && favorites.length === 0 ? "Toque no coração dos produtos que quiser guardar." : "Tente uma busca mais ampla ou remova alguns filtros."}</p>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
