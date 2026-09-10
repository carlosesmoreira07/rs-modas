import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ImageOff, Instagram, MapPin, Menu, MessageCircle, Search, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore, formatBRL, productStatus, productAvailable } from "@/lib/store";
import { cn } from "@/lib/utils";

const mapsLink = (address) => address
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  : null;

export function Logo({ compact = false }) {
  return (
    <span className="inline-flex items-center">
      <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-xl bg-black", compact ? "h-16 w-16" : "h-24 w-24")}>
        <img src="/rs-modas-logo.png" alt="RS Modas" width="150" height="150" className="h-full w-full object-contain" />
      </span>
    </span>
  );
}

export function DemoNotice() {
  const { config } = useStore();
  return (
    <div className="bg-foreground px-4 py-2 text-center text-background">
      <p className="text-xs leading-relaxed">{config.demoNotice}</p>
    </div>
  );
}

export function CornerFrame({ children, className }) {
  return <div className={cn("relative overflow-hidden rounded-[var(--radius-editorial)]", className)}>{children}</div>;
}

export function ProductImage({ src, alt, className, eager = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground", className)}>
        <ImageOff className="h-7 w-7" strokeWidth={1.5} />
        <span className="text-xs">Imagem indisponível</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function AvailabilityText({ product, className }) {
  const { config } = useStore();
  if (product.sourceType === "supplier-reference" || product.dataKind === "supplier-reference") {
    const hasLocal = productAvailable(product) > 0;
    if (hasLocal) return <span className={cn("text-xs font-semibold text-signal", className)}>Disponível na loja</span>;
    return <span className={cn("text-xs font-medium text-muted-foreground", className)}>Sob consulta / Encomenda</span>;
  }
  const status = productStatus(product, config.lowStockThreshold);
  if (status === "indisponivel") return <span className={cn("text-xs font-semibold text-signal", className)}>Sob consulta</span>;
  if (status === "baixo") return <span className={cn("text-xs font-semibold text-signal", className)}>Últimas unidades</span>;
  return <span className={cn("text-xs font-medium text-muted-foreground", className)}>Disponível na loja</span>;
}

export function ProductCard({ product }) {
  const { favorites, toggleFavorite } = useStore();
  const sizes = [...new Set(product.variations.map((v) => v.size))];
  const favorite = favorites.includes(product.id);
  const pixPrice = product.pixPrice || product.supplierPixPrice;

  return (
    <article className="group relative flex h-full min-w-0 flex-col justify-between">
      <div>
        <Link to={`/produto/${product.id}`} className="block rounded-[var(--radius-card)] focus-visible:outline-none">
          <div className="aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-secondary">
            <ProductImage src={product.photos[0]} alt={product.name} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]" />
          </div>
        </Link>
        <div className="px-1 pb-2 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-signal">{product.brand}</p>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}
              aria-pressed={favorite}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card"
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
            </button>
          </div>
          <Link to={`/produto/${product.id}`} className="mt-1 block font-display text-base leading-snug hover:text-signal md:text-lg">
            {product.name}
          </Link>
          <div className="mt-2.5">
            <p className="text-base font-semibold text-foreground">{formatBRL(product.price)}</p>
            {pixPrice ? (
              <p className="text-xs font-semibold text-signal">{formatBRL(pixPrice)} no Pix</p>
            ) : null}
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">{sizes.join(" · ")}</p>
          <AvailabilityText product={product} className="mt-1 block" />
        </div>
      </div>
      <div className="px-1 pt-2">
        <Link to={`/produto/${product.id}`} className="button-light w-full px-2 text-center">Ver peça</Link>
      </div>
    </article>
  );
}

function SearchBox({ onDone, autoFocus = false, className }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    navigate(q.trim() ? `/catalogo?busca=${encodeURIComponent(q.trim())}` : "/catalogo");
    onDone?.();
  };
  return (
    <form onSubmit={submit} role="search" className={cn("flex h-12 w-full items-center rounded-xl border border-input bg-card", className)}>
      <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Buscar peças"
        aria-label="Buscar produtos"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" aria-label="Buscar" className="mr-1 grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background hover:bg-signal">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

const navLinks = [
  ["Novidades", "/catalogo"],
  ["Jeans", "/catalogo?categoria=Cal%C3%A7as"],
  ["Vestidos", "/catalogo?categoria=Vestidos"],
  ["Marcas", "/#marcas"],
  ["Visite a loja", "/#loja"],
];

export function Header() {
  const { config, favorites } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <header className="border-b border-border bg-background">
      <div className="page-shell flex min-h-20 items-center gap-2 py-2">
        <div className="lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menu" className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto border-border p-0">
              <SheetHeader className="border-b border-border p-5 text-left">
                <SheetTitle><Logo /></SheetTitle>
                <SheetDescription>Moda multimarcas com atendimento em Botucatu.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col p-3" aria-label="Menu móvel">
                {[['Início', '/'], ...navLinks, ['Favoritos', '/catalogo?favoritos=1']].map(([label, to]) => (
                  <Link key={`${label}-${to}`} to={to} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3.5 text-base font-medium hover:bg-secondary">
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-border p-4">
                {wa && <a className="button-dark w-full" href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> Falar com a loja</a>}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link to="/" aria-label="RS Modas — início" className="shrink-0"><Logo compact /></Link>
        <nav className="ml-5 hidden items-center gap-5 text-sm lg:flex" aria-label="Navegação principal">
          {navLinks.map(([label, to]) => <Link key={label} to={to} className="font-medium hover:text-signal">{label}</Link>)}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchBox className="hidden w-56 xl:flex" />
          <button onClick={() => setSearchOpen((value) => !value)} aria-label="Buscar" aria-expanded={searchOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card xl:hidden">
            <Search className="h-4 w-4" />
          </button>
          <Link to="/catalogo?favoritos=1" aria-label={`${favorites.length} favoritos`} className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-card hover:border-foreground">
            <Heart className={cn("h-4 w-4", favorites.length > 0 && "fill-current")} />
            {favorites.length > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold text-white">{favorites.length}</span>}
          </Link>
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="hidden h-11 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background hover:bg-signal sm:inline-flex"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
        </div>
      </div>
      {searchOpen && <div className="page-shell border-t border-border py-3 xl:hidden"><SearchBox autoFocus onDone={() => setSearchOpen(false)} /></div>}
    </header>
  );
}

export function Footer() {
  const { config, brands } = useStore();
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;
  const map = mapsLink(config.address);
  return (
    <footer className="mt-8 bg-foreground text-background">
      <div className="page-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/65">Curadoria multimarcas e atendimento próximo para você escolher com calma.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">
            <li><Link to="/catalogo" className="hover:text-white">Catálogo completo</Link></li>
            <li><Link to="/catalogo?favoritos=1" className="hover:text-white">Meus favoritos</Link></li>
            <li><Link to="/painel" className="hover:text-white">Painel de demonstração</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Marcas</p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">{brands.slice(0, 5).map((brand) => <li key={brand}><Link to={`/catalogo?marca=${encodeURIComponent(brand)}`} className="hover:text-white">{brand}</Link></li>)}</ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Fale e visite</p>
          <ul className="mt-4 space-y-3 text-sm text-background/75">
            {wa && <li><a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp da loja</a></li>}
            {config.instagram && <li><a href={config.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Instagram className="h-4 w-4" /> @rsmodas.25</a></li>}
            {map && <li><a href={map} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 hover:text-white"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {config.address}</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-2 py-5 text-xs text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {config.storeName}. Vitrine de demonstração.</p>
          <p className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-gold" /> Seu estilo, suas escolhas.</p>
        </div>
      </div>
    </footer>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-editorial)] border border-dashed border-border bg-card px-6 py-14 text-center">
      <Heart className="h-6 w-6 text-signal" strokeWidth={1.5} />
      <p className="font-display text-xl">{title}</p>
      {children && <div className="max-w-md text-sm text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}
