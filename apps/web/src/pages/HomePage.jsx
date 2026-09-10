import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Instagram, MapPin, MessageCircle, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import { ProductCard } from "@/components/chrome";
import { useStore, HERO_IMAGE, productStatus } from "@/lib/store";

const styleLinks = [
  { title: "Jeans para todos os dias", copy: "Modelagens que acompanham sua rotina.", to: "/catalogo?categoria=Cal%C3%A7as", number: "01" },
  { title: "Leve & arrumado", copy: "Vestidos e conjuntos para sair sem complicar.", to: "/catalogo?categoria=Vestidos", number: "02" },
  { title: "Camadas com personalidade", copy: "Blusas, camisas e jaquetas para combinar.", to: "/catalogo?categoria=Blusas", number: "03" },
];

export default function HomePage() {
  const { products, config, brands } = useStore();
  const visible = products.filter((product) => !product.archived && product.publication !== "draft");
  const realProducts = visible.filter((p) => p.sourceType === "supplier-reference" || p.dataKind === "supplier-reference");
  const demoProducts = visible.filter((p) => p.sourceType !== "supplier-reference" && p.dataKind !== "supplier-reference");
  const featured = (demoProducts.length > 0 ? demoProducts : visible)
    .filter((product) => productStatus(product, config.lowStockThreshold) !== "indisponivel")
    .slice(0, 4);

  const categoryNames = ["Calças", "Vestidos", "Conjuntos", "Blusas", "Jaquetas", "Shorts"];
  const categories = categoryNames
    .map((name) => ({ name, product: visible.find((product) => product.category === name) }))
    .filter((item) => item.product);
  const heroProduct = realProducts[0] || visible.find((product) => product.brand === "Pit Bull Jeans") || visible[0];
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : null;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`;

  return (
    <>
      <Helmet>
        <title>RS Modas — Boutique multimarcas em Botucatu</title>
        <meta name="description" content="Curadoria multimarcas da RS Modas em Botucatu: Pit Bull Jeans, Rhero, Maria Dondoca e outras marcas, com atendimento pelo WhatsApp." />
      </Helmet>

      <section className="page-shell py-5 sm:py-8 lg:py-10" aria-labelledby="hero-title">
        <div className="grid overflow-hidden rounded-[var(--radius-editorial)] bg-secondary lg:min-h-[620px] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
            <p className="eyebrow">Boutique multimarcas · Botucatu</p>
            <h1 id="hero-title" className="mt-5 max-w-xl font-display text-4xl leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Seu estilo, <em className="font-normal text-signal">suas escolhas.</em>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
              Uma curadoria feminina para vestir a vida real — com jeans, peças leves e atendimento de perto.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/catalogo" className="button-dark">Explorar coleção <ArrowRight className="h-4 w-4" /></Link>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="button-light"><MessageCircle className="h-4 w-4" /> Falar com a loja</a>}
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-foreground/10 pt-5 text-sm text-muted-foreground">
              <BadgeCheck className="h-5 w-5 shrink-0 text-signal" />
              <span>Revendedora oficial, conforme informado pela RS Modas.</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <img
              src={HERO_IMAGE}
              alt="Mulher com camisa branca e jeans em composição editorial clara"
              width="900"
              height="1100"
              fetchPriority="high"
              className="min-h-0 w-full flex-1 object-cover object-center"
            />
            <div className="flex items-center justify-between gap-3 bg-card p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-signal">Em destaque</p>
                <p className="mt-1 font-display text-lg leading-snug">{heroProduct?.name}</p>
              </div>
              {heroProduct && <Link to={`/produto/${heroProduct.id}`} aria-label={`Ver ${heroProduct.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-foreground text-background hover:bg-signal"><ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </div>
        </div>
      </section>

      {realProducts.length > 0 && (
        <section className="page-shell py-12 lg:py-16" aria-labelledby="real-products-title">
          <Reveal>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="eyebrow">Referências reais de fornecedores</p>
                <h2 id="real-products-title" className="mt-2 font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                  Peças verificadas das marcas oficiais
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Fotografia oficial e valores consultados diretamente nos fornecedores em 10/09/2026. Preços e disponibilidade de encomenda sujeitos à confirmação pela RS Modas.
                </p>
              </div>
              <Link to="/catalogo?origem=fornecedor" className="button-light justify-self-start">
                Ver referências <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
            {realProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="page-shell py-12 lg:py-16" aria-labelledby="categories-title">
        <Reveal>
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Comece por aqui</p>
              <h2 id="categories-title" className="mt-2 font-display text-3xl tracking-[-0.03em] sm:text-4xl">Escolha pelo que você procura</h2>
            </div>
            <Link to="/catalogo" className="hidden items-center gap-2 text-sm font-semibold hover:text-signal sm:flex">Ver tudo <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Reveal>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categories.map(({ name, product }, index) => (
            <Reveal key={name} delay={index * 0.04}>
              <Link to={`/catalogo?categoria=${encodeURIComponent(name)}`} className="group block overflow-hidden rounded-[var(--radius-card)] border border-border bg-card">
                <img src={product.photos[0]} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                <div className="px-3 py-3 text-center text-sm font-semibold text-foreground">{name}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-card py-14 lg:py-20" aria-labelledby="featured-title">
        <div className="page-shell">
          <Reveal>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="eyebrow">Seleção RS</p>
                <h2 id="featured-title" className="mt-2 font-display text-3xl tracking-[-0.03em] sm:text-4xl">Peças para olhar de perto</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Destaques da nossa vitrine demonstrativa. Escolha cor e tamanho antes de consultar a disponibilidade.</p>
              </div>
              <Link to="/catalogo" className="button-light justify-self-start">Catálogo completo <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-7">
            {featured.map((product, index) => <Reveal key={product.id} delay={index * 0.05}><ProductCard product={product} /></Reveal>)}
          </div>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20" aria-labelledby="style-title">
        <Reveal>
          <p className="eyebrow">Encontre seu estilo</p>
          <h2 id="style-title" className="mt-2 max-w-2xl font-display text-3xl tracking-[-0.03em] sm:text-4xl">Atalhos para chegar ao look que combina com seu momento</h2>
        </Reveal>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {styleLinks.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <Link to={item.to} className="group grid gap-3 py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-5 lg:py-8">
                <span className="font-display text-2xl italic text-gold">{item.number}</span>
                <span>
                  <span className="block font-display text-2xl tracking-[-0.02em] group-hover:text-signal">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.copy}</span>
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="marcas" className="page-shell pb-14 lg:pb-20" aria-labelledby="brands-title">
        <Reveal>
          <div className="rounded-[var(--radius-editorial)] border border-border bg-secondary p-7 sm:p-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14 lg:p-14">
            <div>
              <p className="eyebrow">Nossa curadoria</p>
              <h2 id="brands-title" className="mt-2 font-display text-3xl tracking-[-0.03em] sm:text-4xl">As marcas entram. A escolha tem assinatura RS.</h2>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="flex flex-wrap gap-2.5">
                {brands.map((brand) => <Link key={brand} to={`/catalogo?marca=${encodeURIComponent(brand)}`} className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-foreground">{brand}</Link>)}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Pit Bull Jeans, Rhero, Maria Dondoca e outras marcas selecionadas pela RS Modas.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="loja" className="bg-foreground py-14 text-background lg:py-20" aria-labelledby="store-title">
        <div className="page-shell grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Atendimento local</p>
            <h2 id="store-title" className="mt-3 max-w-xl font-display text-3xl tracking-[-0.03em] sm:text-4xl">Venha escolher com calma em Botucatu.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/65">{config.serviceInfo}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={mapLink} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-background px-5 text-sm font-semibold text-foreground hover:bg-gold"><MapPin className="h-4 w-4" /> Como chegar</a>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold hover:border-white"><MessageCircle className="h-4 w-4" /> Consultar atendimento</a>}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[var(--radius-editorial)] border border-white/15 bg-white/5 p-6 sm:p-8">
              <MapPin className="h-6 w-6 text-gold" />
              <p className="mt-5 font-display text-2xl leading-snug">{config.address}</p>
              <p className="mt-3 text-sm text-background/55">Confirme horário e condições de atendimento diretamente com a loja.</p>
              {config.instagram && <a href={config.instagram} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-white"><Instagram className="h-4 w-4" /> Acompanhar novidades no Instagram</a>}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
