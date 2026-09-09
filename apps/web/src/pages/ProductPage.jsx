import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { CornerFrame, ProductImage, EmptyState } from "@/components/chrome";
import { useStore, formatBRL, availableOf, buildWhatsAppMessage, waLink } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams();
  const { products, config } = useStore();
  const product = products.find((p) => p.id === id && !p.archived);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const colors = useMemo(
    () => (product ? [...new Set(product.variations.map((v) => v.color))] : []),
    [product]
  );
  const sizesForColor = useMemo(() => {
    if (!product) return [];
    const vars = color ? product.variations.filter((v) => v.color === color) : product.variations;
    return [...new Set(vars.map((v) => v.size))];
  }, [product, color]);

  const variation = useMemo(() => {
    if (!product || !color || !size) return null;
    return product.variations.find((v) => v.color === color && v.size === size) || null;
  }, [product, color, size]);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Helmet>
          <title>Produto não encontrado — RS Modas</title>
          <meta name="description" content="A peça procurada não está disponível no catálogo da RS Modas." />
        </Helmet>
        <EmptyState
          title="Peça não encontrada"
          action={
            <Link to="/catalogo" className="mt-1 inline-flex h-11 items-center border border-foreground bg-foreground px-5 text-sm font-semibold text-background hover:bg-signal">
              Voltar ao catálogo
            </Link>
          }
        >
          <p>Ela pode ter sido arquivada ou o endereço está incorreto.</p>
        </EmptyState>
      </div>
    );
  }

  const available = variation ? availableOf(variation) : 0;
  const kind = variation && available === 0 ? "encomenda" : "consulta";
  const message = variation ? buildWhatsAppMessage({ product, variation, kind }) : "";
  const link = variation ? waLink(config.whatsapp, message) : null;

  const selectColor = (c) => {
    setColor(c);
    setSize(null);
    setShowPreview(false);
  };

  const handleMainAction = () => {
    if (!variation) return;
    setShowPreview(true);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — RS Modas</title>
        <meta name="description" content={`${product.name} na RS Modas, Botucatu/SP. Consulte tamanhos, cores e disponibilidade pelo WhatsApp.`} />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div>
            <CornerFrame>
              <div className="aspect-[3/4] border border-foreground bg-secondary shadow-hard-sm">
                <ProductImage
                  src={product.photos[photoIndex] || product.photos[0]}
                  alt={product.name}
                  className="h-full w-full"
                />
              </div>
            </CornerFrame>
            {product.photos.length > 1 && (
              <div className="mt-4 flex gap-2">
                {product.photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={cn(
                      "h-16 w-16 overflow-hidden border bg-secondary",
                      i === photoIndex ? "border-signal ring-1 ring-signal" : "border-foreground"
                    )}
                  >
                    <ProductImage src={src} alt="" className="h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">{product.category}</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Cód. {product.code} · {product.brand}</p>
            <p className="mt-4 text-2xl font-semibold">{formatBRL(product.price)}</p>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cor</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Escolha a cor">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => selectColor(c)}
                    aria-pressed={color === c}
                    className={cn(
                      "h-11 border px-4 text-sm transition-colors",
                      color === c
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground bg-card hover:bg-secondary"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tamanho</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Escolha o tamanho">
                {sizesForColor.map((s) => {
                  const v = product.variations.find((x) => x.size === s && (!color || x.color === color));
                  const out = v ? availableOf(v) === 0 : false;
                  return (
                    <button
                      key={s}
                      onClick={() => { setSize(s); setShowPreview(false); }}
                      aria-pressed={size === s}
                      className={cn(
                        "relative h-11 min-w-12 border px-3 text-sm transition-colors",
                        size === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground bg-card hover:bg-secondary",
                        out && size !== s && "text-muted-foreground"
                      )}
                    >
                      {s}
                      {out && <span className="absolute -top-2 right-1 text-[9px] font-semibold uppercase text-signal">sem estoque</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              {!variation && (
                <p className="mb-3 text-sm text-muted-foreground" role="status">
                  Selecione a cor e o tamanho para consultar.
                </p>
              )}
              {variation && available === 0 && (
                <p className="mb-3 text-sm font-medium text-signal" role="status">
                  Esta variação está indisponível no momento. Você pode consultar a possibilidade de encomenda com a loja.
                </p>
              )}
              <button
                onClick={handleMainAction}
                disabled={!variation}
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-2 border border-foreground text-sm font-semibold transition-colors",
                  variation
                    ? "bg-foreground text-background hover:bg-signal"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                <MessageCircle className="h-4 w-4" />
                {variation && available === 0 ? "Consultar encomenda" : "Consultar pelo WhatsApp"}
              </button>

              {showPreview && variation && (
                <div className="mt-4 border border-foreground bg-card p-4 shadow-hard-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Prévia da mensagem
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">{message}</pre>
                  {link ? (
                    <>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 border border-foreground bg-signal px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <MessageCircle className="h-4 w-4" /> Abrir conversa no WhatsApp
                      </a>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Abrir o WhatsApp não envia a mensagem automaticamente nem confirma pedido — a confirmação é feita pela loja na conversa.
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      O número de WhatsApp ainda não foi configurado pela loja. Esta é apenas a prévia da mensagem.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
