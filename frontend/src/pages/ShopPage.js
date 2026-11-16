import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { ArrowRight } from "lucide-react";
import { PRODUCTS, SHOP_URL } from "../lib/shop";
import { PHONE_DISPLAY, TEL_LINK } from "../lib/contact";

const PAGE_URL = "https://www.theshirtlesshandyman.com/shop";

const SHOP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Shirtless Handyman merch",
  itemListElement: PRODUCTS.map((product, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: product.name,
    url: product.url,
    image: `https://www.theshirtlesshandyman.com${product.image}`,
  })),
};

export default function ShopPage() {
  return (
    <>
      <SeoHead
        title="Shop | Rep the Shirtless Handyman — Tanks & Caps"
        description="Rep the Shirtless Handyman. Muscle tanks and a snapback from New Orleans' microcement and Venetian plaster pro. Cheeky name, high-end work. No grout. No seams. No shirt."
        canonical={PAGE_URL}
        ogImage="https://www.theshirtlesshandyman.com/merch/tattoo-torso-tank.webp"
      >
        <script type="application/ld+json">{JSON.stringify(SHOP_SCHEMA)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid="shop-page">
        <Navbar />

        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <p
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
              data-testid="shop-eyebrow"
            >
              Merch · New Orleans
            </p>
            <h1
              className="text-4xl md:text-6xl font-semibold tracking-tight mb-5"
              style={{ fontFamily: "'Fraunces', serif" }}
              data-testid="shop-heading"
            >
              Rep the Shirtless Handyman
            </h1>
            <p
              className="text-xl md:text-2xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No grout. No seams. No shirt.
            </p>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cheeky name, high-end work. Muscle tanks and a cap from the guy
              who installs seamless microcement and Venetian plaster across
              New Orleans. The joke&rsquo;s on the shirt. The bathrooms are serious.
            </p>
          </div>
        </section>

        <section className="pb-16 md:pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {PRODUCTS.map((product) => (
              <article
                key={product.slug}
                className="group rounded-3xl overflow-hidden border border-border/40 bg-card"
                data-testid={`product-card-${product.slug}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#F5F1EA]">
                  <img
                    src={product.image}
                    alt={product.alt}
                    width={864}
                    height={1152}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    {product.kind}
                  </p>
                  <h2
                    className="text-2xl font-semibold tracking-tight mb-2"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {product.name}
                  </h2>
                  <p className="text-muted-foreground mb-4">{product.detail}</p>
                  <p className="text-lg font-semibold text-foreground mb-5">
                    {product.price}
                  </p>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full bg-[#D97757] hover:bg-[#C56545] text-white text-sm font-semibold transition-colors w-full sm:w-auto"
                    data-testid={`shop-now-${product.slug}`}
                  >
                    Shop now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-12 pb-20 md:pb-28">
          <div className="max-w-5xl mx-auto rounded-3xl bg-primary/5 border border-primary/20 p-10 md:p-14 text-center">
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              The whole rack lives on the shop.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Sizes, shipping, and checkout are on Fourthwall. I just make the
              bathrooms.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#D97757] hover:bg-[#C56545] text-white font-semibold transition-colors"
                data-testid="shop-cta-visit"
              >
                Visit the full shop <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/#quote"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#1A3C34] hover:bg-[#0E2A24] text-white font-semibold transition-colors"
                data-testid="shop-cta-quote"
              >
                Need the bathroom too? Free quote <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="text-muted-foreground text-sm mt-5">
              Or call or text me:{" "}
              <a href={TEL_LINK} className="font-semibold text-foreground underline underline-offset-2" data-testid="shop-cta-phone">
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
