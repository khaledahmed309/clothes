import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ShieldCheck, Truck, RefreshCw, Sparkles, Star, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/site/product-card";
import { categoriesQuery, productsQuery, settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leon | ستايل يعبّر عنك — ملابس رجالي فاخرة في مصر" },
      {
        name: "description",
        content:
          "تسوق مجموعة Leon الرجالي: تيشيرتات، قمصان، جينز، جواكيت وبدل بخامات فاخرة وأسعار بالجنيه المصري مع توصيل لكل المحافظات.",
      },
      { property: "og:title", content: "Leon | ستايل يعبّر عنك" },
      {
        property: "og:description",
        content: "مجموعة رجالي فاخرة بخامات مختارة بعناية وتوصيل لكل محافظات مصر.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Sparkles, title: "خامات فاخرة", desc: "أقمشة مختارة بعناية تدوم طويلاً" },
  { icon: Truck, title: "توصيل سريع", desc: "لكل محافظات مصر خلال ٢-٤ أيام" },
  { icon: RefreshCw, title: "استبدال سهل", desc: "خلال ١٤ يوم من الاستلام" },
  { icon: ShieldCheck, title: "دفع آمن", desc: "فيزا، فودافون كاش أو عند الاستلام" },
];

const TESTIMONIALS = [
  { name: "أحمد ماهر", text: "الخامة ممتازة والمقاسات مضبوطة، أفضل تجربة شراء أونلاين.", city: "القاهرة" },
  { name: "كريم السيد", text: "وصل الطلب في يومين والتغليف أنيق جداً. هكرر التجربة أكيد.", city: "الإسكندرية" },
  { name: "محمود فؤاد", text: "القميص طلع أحلى من الصور، والأسعار مناسبة للجودة.", city: "الجيزة" },
];

function Home() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [email, setEmail] = useState("");

  const newArrivals = products.filter((p) => p.is_new).slice(0, 8);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="مجموعة Leon الرجالي"
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/55 to-black/25" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl text-primary-foreground"
          >
            <span className="eyebrow text-accent">مجموعة الموسم الجديد</span>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight font-black sm:text-6xl">
              {settings?.hero_headline_ar ?? "ستايل يعبّر عنك"}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {settings?.hero_subline_ar ??
                "مجموعة رجالي فاخرة بخامات مختارة بعناية، مصممة لتناسب يومك بكل ثقة."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/shop" search={{ tag: "new" }}>
                  تسوق الوصول الجديد
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                asChild
              >
                <Link to="/shop" search={{}}>
                  استكشف المجموعة
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <f.icon className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <div className="text-sm font-bold">{f.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHead eyebrow="وصل حديثاً" title="أحدث القطع" to={{ tag: "new" }} />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Seasonal banner */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/banner-season.jpg"
          alt="تخفيضات الموسم"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center text-primary-foreground sm:px-6">
          <span className="eyebrow text-accent">عرض محدود</span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-black sm:text-4xl">
            {settings?.banner_text_ar ?? "تخفيضات نهاية الموسم — حتى ٤٠٪"}
          </h2>
          <Button size="lg" className="mt-7" asChild>
            <Link to="/shop" search={{ tag: "sale" }}>
              تسوق التخفيضات
            </Link>
          </Button>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead eyebrow="الأكثر مبيعاً" title="اختيارات العملاء" to={{ tag: "best" }} />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <SectionHead eyebrow="الأقسام" title="تسوق حسب القسم" />
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug }}
                className="border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                {c.name_ar}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead eyebrow="آراء العملاء" title="ثقة أكثر من ٥٠٠٠ عميل" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="border border-border bg-card p-6"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">
                {t.text}
              </blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">
                {t.name} — {t.city}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            اشترك في النشرة البريدية
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            كن أول من يعرف عن المجموعات الجديدة والعروض الحصرية.
          </p>
          <form
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setEmail("");
              toast.success("تم اشتراكك بنجاح");
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="h-11 border-white/25 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button type="submit" size="lg" variant="secondary">
              اشترك
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  to,
}: {
  eyebrow: string;
  title: string;
  to?: Record<string, string>;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <span className="eyebrow text-accent">{eyebrow}</span>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
      </div>
      {to && (
        <Link
          to="/shop"
          search={to}
          className="shrink-0 border-b border-accent pb-0.5 text-sm text-accent"
        >
          عرض الكل
        </Link>
      )}
    </div>
  );
}
