import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Truck, BadgeCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import { CornerFrame, ProductCard } from "@/components/chrome";
import { useStore, HERO_IMAGE, productStatus } from "@/lib/store";

export default function HomePage() {
  const { products, config } = useStore();
  const visible = products.filter((p) => !p.archived);
  const news = [...visible].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const available = visible
    .filter((p) => productStatus(p, config.lowStockThreshold) !== "indisponivel")
    .slice(0, 8);
  const categories = [...new Set(visible.map((p) => p.category))];
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <>
      <Helmet>
        <title>RS Modas — Moda em Botucatu/SP</title>
        <meta name="description" content="Vitrine da RS Modas em Botucatu/SP: roupas e jeans com consulta direta pelo WhatsApp. Revendedora autorizada Pit Bull Jeans." />
      </Helmet>

      <section aria-label="Destaque">
        <div className="relative h-[52dvh] overflow-hidden md:h-[68dvh]">
          <img
            src={HERO_IMAGE}
            alt="Modelo usando jeans e camisa branca em fundo claro"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <CornerFrame className="relative z-10 -mt-20 max-w-xl md:-mt-36">
            <div className="border border-foreground bg-background p-6 shadow-hard md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Botucatu/SP</p>
              <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">
                Seu próximo look está aqui.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Roupas e jeans escolhidos a dedo, com atendimento de perto e consulta direta pelo WhatsApp.
              </p>
              <Link
                to="/catalogo"
                className="mt-5 inline-flex h-12 items-center gap-2 border border-foreground bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-signal"
              >
                Explorar produtos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CornerFrame>
        </div>
      </section>

      <section aria-label="Categorias" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/catalogo?categoria=${encodeURIComponent(c)}`}
              className="border border-foreground bg-card px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-background"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Novidades" className="mx-auto max-w-6xl px-4 pt-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl md:text-3xl">Novidades</h2>
            <Link to="/catalogo" className="text-sm font-medium hover:text-signal hover:underline underline-offset-4">
              Ver tudo
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {news.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-label="Peças disponíveis" className="mx-auto max-w-6xl px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4 border-t border-foreground pt-10">
            <h2 className="font-display text-2xl md:text-3xl">Peças disponíveis</h2>
            <Link to="/catalogo" className="text-sm font-medium hover:text-signal hover:underline underline-offset-4">
              Catálogo completo
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {available.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-label="Revenda autorizada" className="mx-auto max-w-6xl px-4 pt-16">
        <Reveal>
          <div className="grid gap-6 border border-foreground bg-card p-6 shadow-hard-sm md:grid-cols-2 md:p-10">
            <div className="flex items-start gap-4">
              <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-signal" strokeWidth={1.75} />
              <div>
                <h2 className="font-display text-xl md:text-2xl">Revendedora autorizada Pit Bull Jeans</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A RS Modas é revendedora autorizada da Pit Bull Jeans, com preços alinhados aos praticados pela marca
                  e fornecedor disponível para reposição de peças.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Truck className="mt-1 h-6 w-6 shrink-0 text-signal" strokeWidth={1.75} />
              <div>
                <h2 className="font-display text-xl md:text-2xl">Atendimento e entrega local</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{config.serviceInfo}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="atendimento" aria-label="Atendimento" className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <CornerFrame className="mx-auto max-w-2xl">
            <div className="border border-foreground bg-foreground p-8 text-center text-background md:p-12">
              <h2 className="font-display text-2xl md:text-3xl">Fale com a loja</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/70">
                Tire dúvidas sobre tamanhos, cores e disponibilidade diretamente pelo WhatsApp. Sem cadastro, sem compromisso.
              </p>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex h-12 items-center gap-2 border border-background bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-signal hover:text-background hover:border-signal"
                >
                  <MessageCircle className="h-4 w-4" /> Conversar pelo WhatsApp
                </a>
              ) : (
                <p className="mt-6 text-sm text-background/60">Número de WhatsApp a configurar pela loja.</p>
              )}
            </div>
          </CornerFrame>
        </Reveal>
      </section>
    </>
  );
}
