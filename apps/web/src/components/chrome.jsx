import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, MessageCircle, Instagram, MapPin, Clock, ImageOff, X } from "lucide-react";
import { useStore, formatBRL, productStatus, productAvailable } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DemoNotice() {
  const { config } = useStore();
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-7 items-center justify-center bg-foreground px-3 text-background">
      <p className="truncate text-[11px] tracking-wide">{config.demoNotice}</p>
    </div>
  );
}

export function CornerFrame({ children, className }) {
  const c = "pointer-events-none absolute h-4 w-4 border-signal";
  return (
    <div className={cn("relative", className)}>
      <span aria-hidden className={cn(c, "-left-1.5 -top-1.5 border-l-2 border-t-2")} />
      <span aria-hidden className={cn(c, "-right-1.5 -top-1.5 border-r-2 border-t-2")} />
      <span aria-hidden className={cn(c, "-bottom-1.5 -left-1.5 border-b-2 border-l-2")} />
      <span aria-hidden className={cn(c, "-bottom-1.5 -right-1.5 border-b-2 border-r-2")} />
      {children}
    </div>
  );
}

export function ProductImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground", className)}>
        <ImageOff className="h-8 w-8" strokeWidth={1.5} />
        <span className="text-xs">Imagem indisponível</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function AvailabilityText({ product, className }) {
  const { config } = useStore();
  const status = productStatus(product, config.lowStockThreshold);
  if (status === "indisponivel") {
    return <span className={cn("text-[11px] font-semibold uppercase tracking-wider text-signal", className)}>Indisponível</span>;
  }
  if (status === "baixo") {
    return <span className={cn("text-[11px] font-semibold uppercase tracking-wider text-signal", className)}>Últimas unidades</span>;
  }
  return <span className={cn("text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>Disponível</span>;
}

export function ProductCard({ product }) {
  const sizes = [...new Set(product.variations.map((v) => v.size))];
  return (
    <Link
      to={`/produto/${product.id}`}
      className="group block border border-foreground bg-card shadow-hard-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-[3/4] overflow-hidden bg-secondary">
        <ProductImage
          src={product.photos[0]}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-1.5 border-t border-foreground p-3">
        <h3 className="font-display text-base leading-snug">{product.name}</h3>
        <p className="text-sm font-semibold">{formatBRL(product.price)}</p>
        <p className="text-xs text-muted-foreground">Tamanhos: {sizes.join(", ")}</p>
        <AvailabilityText product={product} />
      </div>
    </Link>
  );
}

function SearchBox({ onDone, autoFocus }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/catalogo?busca=${encodeURIComponent(q.trim())}` : "/catalogo");
    if (onDone) onDone();
  };
  return (
    <form onSubmit={submit} role="search" className="flex w-full items-center border border-foreground bg-card">
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar peça, código..."
        aria-label="Buscar produtos"
        className="h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" aria-label="Buscar" className="flex h-10 w-11 shrink-0 items-center justify-center border-l border-foreground bg-foreground text-background transition-colors hover:bg-signal">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

export function Header() {
  const { config } = useStore();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <header className="sticky top-7 z-40 border-b border-foreground bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <button
          className="flex h-10 w-10 items-center justify-center border border-foreground md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          {config.storeName}
        </Link>
        <nav className="ml-6 hidden items-center gap-5 text-sm md:flex" aria-label="Navegação principal">
          <Link to="/catalogo" className="hover:text-signal hover:underline underline-offset-4">Catálogo</Link>
          <Link to="/catalogo?categoria=Calças" className="hover:text-signal hover:underline underline-offset-4">Calças</Link>
          <Link to="/catalogo?categoria=Blusas" className="hover:text-signal hover:underline underline-offset-4">Blusas</Link>
          <Link to="/#atendimento" className="hover:text-signal hover:underline underline-offset-4">Atendimento</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-56 lg:block">
            <SearchBox />
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center border border-foreground lg:hidden"
            onClick={() => setShowSearch((s) => !s)}
            aria-label="Buscar"
            aria-expanded={showSearch}
          >
            <Search className="h-4 w-4" />
          </button>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-2 border border-foreground bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-signal"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : (
            <span className="hidden items-center gap-2 border border-dashed border-muted-foreground px-3 text-xs text-muted-foreground sm:flex sm:h-10">
              WhatsApp a configurar
            </span>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="border-t border-foreground px-4 py-2 lg:hidden">
          <SearchBox autoFocus onDone={() => setShowSearch(false)} />
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-foreground bg-background">
            <div className="flex h-14 items-center justify-between border-b border-foreground px-4">
              <span className="font-display text-lg font-bold">{config.storeName}</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center border border-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 text-base" aria-label="Menu móvel">
              {[
                ["Início", "/"],
                ["Catálogo completo", "/catalogo"],
                ["Calças", "/catalogo?categoria=Calças"],
                ["Blusas", "/catalogo?categoria=Blusas"],
                ["Vestidos", "/catalogo?categoria=Vestidos"],
                ["Atendimento e entrega", "/#atendimento"],
              ].map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3.5 hover:text-signal"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { config } = useStore();
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;
  return (
    <footer className="border-t border-foreground bg-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold">{config.storeName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revendedora autorizada Pit Bull Jeans em Botucatu/SP.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contato</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-signal hover:underline underline-offset-4">
                  <MessageCircle className="h-4 w-4" /> WhatsApp da loja
                </a>
              ) : (
                <span className="text-muted-foreground">WhatsApp a configurar</span>
              )}
            </li>
            <li>
              {config.instagram ? (
                <a href={config.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-signal hover:underline underline-offset-4">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              ) : (
                <span className="text-muted-foreground">Instagram a configurar</span>
              )}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loja</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{config.address || "Endereço a configurar"}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{config.hours || "Horários a configurar"}</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atendimento</p>
          <p className="mt-3 text-sm text-muted-foreground">{config.serviceInfo}</p>
        </div>
      </div>
      <div className="border-t border-foreground/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {config.storeName} — demonstração. {config.demoNotice}</p>
          <Link to="/painel" className="font-medium hover:text-signal hover:underline underline-offset-4">
            Painel de demonstração
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-muted-foreground/60 bg-card px-6 py-12 text-center">
      <p className="font-display text-lg">{title}</p>
      {children && <div className="max-w-md text-sm text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}
