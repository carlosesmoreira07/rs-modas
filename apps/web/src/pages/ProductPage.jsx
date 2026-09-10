import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { ProductImage, EmptyState } from "@/components/chrome";
import { useStore, formatBRL, availableOf, buildWhatsAppMessage, waLink } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams();
  const { products, config, favorites, toggleFavorite } = useStore();
  const product = products.find((item) => item.id === id && !item.archived);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const colors = useMemo(() => product ? [...new Set(product.variations.map((variation) => variation.color))] : [], [product]);
  const allSizes = useMemo(() => product ? [...new Set(product.variations.map((variation) => variation.size))] : [], [product]);
  const sizesForColor = useMemo(() => {
    if (!product || !color) return allSizes;
    return [...new Set(product.variations.filter((variation) => variation.color === color).map((variation) => variation.size))];
  }, [product, color, allSizes]);
  const variation = useMemo(() => {
    if (!product || !color || !size) return null;
    return product.variations.find((item) => item.color === color && item.size === size) || null;
  }, [product, color, size]);

  if (!product) {
    return (
      <div className="page-shell py-16">
        <Helmet><title>Produto não encontrado — RS Modas</title></Helmet>
        <EmptyState title="Peça não encontrada" action={<Link to="/catalogo" className="button-dark mt-2">Voltar ao catálogo</Link>}>
          <p>Ela pode ter sido arquivada ou o endereço não está mais disponível.</p>
        </EmptyState>
      </div>
    );
  }

  const available = variation ? availableOf(variation) : 0;
  const kind = variation && available === 0 ? "encomenda" : "consulta";
  const message = variation ? buildWhatsAppMessage({ product, variation, kind }) : "";
  const link = variation ? waLink(config.whatsapp, message) : null;
  const favorite = favorites.includes(product.id);

  const selectColor = (nextColor) => {
    setColor(nextColor);
    setSize(null);
    setShowPreview(false);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — RS Modas</title>
        <meta name="description" content={`${product.name}, ${product.brand}, na RS Modas em Botucatu. Consulte tamanhos, cores e disponibilidade pelo WhatsApp.`} />
      </Helmet>

      <div className="page-shell py-6 sm:py-10">
        <Link to="/catalogo" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div className="lg:grid lg:grid-cols-[82px_1fr] lg:gap-4">
            {product.photos.length > 1 && (
              <div className="order-first mb-3 flex gap-2 overflow-x-auto pb-1 lg:mb-0 lg:flex-col" aria-label="Galeria do produto">
                {product.photos.map((src, index) => (
                  <button
                    key={src}
                    onClick={() => setPhotoIndex(index)}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={photoIndex === index}
                    className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-xl border bg-secondary lg:h-24 lg:w-full", photoIndex === index ? "border-foreground ring-2 ring-ring/20" : "border-border")}
                  >
                    <ProductImage src={src} alt="" className="h-full w-full" />
                  </button>
                ))}
              </div>
            )}
            <div className={cn("relative aspect-[3/4] overflow-hidden rounded-[var(--radius-editorial)] bg-secondary", product.photos.length <= 1 && "lg:col-span-2")}>
              <ProductImage src={product.photos[photoIndex] || product.photos[0]} alt={product.name} eager className="h-full w-full" />
              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={favorite}
                className={cn("absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-white/80 bg-white/90 shadow-card backdrop-blur", favorite && "bg-foreground text-white")}
              >
                <Heart className={cn("h-5 w-5", favorite && "fill-current")} />
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">{product.brand}</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.08] tracking-[-0.04em] sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Cód. {product.code} · {product.category}</p>
            <p className="mt-6 text-2xl font-semibold tracking-tight">{formatBRL(product.price)}</p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-8 border-t border-border pt-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Escolha a cor</p>
                {color && <span className="text-xs text-muted-foreground">Selecionada: {color}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Escolha a cor">
                {colors.map((item) => (
                  <button key={item} onClick={() => selectColor(item)} aria-pressed={color === item} className={cn("min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors", color === item ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground")}>
                    {color === item && <Check className="mr-1.5 inline h-3.5 w-3.5" />} {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Escolha o tamanho</p>
                {!color && <span className="text-xs text-signal">Selecione uma cor primeiro</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Escolha o tamanho">
                {sizesForColor.map((item) => {
                  const itemVariation = color ? product.variations.find((candidate) => candidate.size === item && candidate.color === color) : null;
                  const out = itemVariation ? availableOf(itemVariation) === 0 : false;
                  return (
                    <button
                      key={item}
                      onClick={() => { setSize(item); setShowPreview(false); }}
                      disabled={!color}
                      aria-pressed={size === item}
                      aria-label={`${item}${out ? ", indisponível para pronta entrega" : ""}`}
                      className={cn("relative min-h-11 min-w-12 rounded-xl border px-3 text-sm font-semibold transition-colors", size === item ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground", !color && "cursor-not-allowed opacity-45", out && size !== item && "border-dashed text-muted-foreground")}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {variation && <p className={cn("mt-3 text-sm", available === 0 ? "font-medium text-signal" : "text-muted-foreground")} role="status">{available === 0 ? "Sem pronta entrega nesta variação. Consulte a possibilidade de encomenda." : `${available} ${available === 1 ? "unidade disponível" : "unidades disponíveis"} para consulta.`}</p>}
            </div>

            <div className="mt-7 rounded-[var(--radius-card)] bg-secondary p-4 sm:p-5">
              {!variation && <p className="mb-3 text-sm text-muted-foreground" role="status">Escolha cor e tamanho para preparar sua consulta.</p>}
              {variation && link ? (
                <a href={link} target="_blank" rel="noreferrer" className="button-dark w-full px-4">
                  <MessageCircle className="h-4 w-4" /> {available === 0 ? "Consultar encomenda" : "Consultar pelo WhatsApp"}
                </a>
              ) : (
                <button disabled className="button-dark w-full cursor-not-allowed opacity-45"><MessageCircle className="h-4 w-4" /> Consultar pelo WhatsApp</button>
              )}
              {variation && <button onClick={() => setShowPreview((value) => !value)} className="mt-3 min-h-10 w-full text-xs font-semibold text-muted-foreground hover:text-foreground">{showPreview ? "Ocultar mensagem" : "Ver mensagem antes de abrir"}</button>}
              {showPreview && variation && (
                <div className="mt-2 rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Mensagem preparada</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">{message}</pre>
                </div>
              )}
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> A consulta não confirma pedido, reserva ou prazo. A loja confirma tudo na conversa.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
