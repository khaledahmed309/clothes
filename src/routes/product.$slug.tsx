import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Ruler, ShieldCheck, Truck, Undo2, Star } from "lucide-react";
import { toast } from "sonner";
import { productQuery, productsQuery, priceOf, discountPercent } from "@/lib/catalog";
import { egp } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/site/product-card";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `منتج ${params.slug} | Leon` },
      { name: "description", content: "تفاصيل المنتج، المقاسات والألوان المتاحة من متجر Leon." },
      { property: "og:title", content: "تفاصيل المنتج | Leon" },
      { property: "og:description", content: "خامات فاخرة ومقاسات متعددة مع الدفع عند الاستلام." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: all = [] } = useQuery(productsQuery);
  const { add, setOpen, wishlist, toggleWishlist } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="text-sm text-muted-foreground">المنتج غير متاح.</p>
        <Button asChild className="mt-4">
          <Link to="/shop" search={{}}>
            العودة للمتجر
          </Link>
        </Button>
      </div>
    );
  }

  const chosenSize = size ?? product.sizes?.[0] ?? "-";
  const chosenColor = color ?? product.colors?.[0] ?? "-";
  const variant = product.product_variants?.find(
    (v) => v.size === chosenSize && v.color === chosenColor,
  );
  const inStock = (variant?.quantity ?? 0) > 0;
  const off = discountPercent(product);
  const related = all.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
  const approved = (product.reviews ?? []).filter((r) => r.is_approved);

  const addToCart = () => {
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name_ar,
      image: product.images?.[0] ?? null,
      price: priceOf(product),
      size: chosenSize,
      color: chosenColor,
      quantity: 1,
    });
    setOpen(true);
    toast.success("تمت الإضافة إلى الحقيبة");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          الرئيسية
        </Link>
        {" / "}
        <Link to="/shop" search={{}} className="hover:text-foreground">
          المتجر
        </Link>
        {" / "}
        <span className="text-foreground">{product.name_ar}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover-zoom aspect-[3/4] bg-secondary"
          >
            <img
              src={product.images?.[active] ?? "/images/tshirt-black.jpg"}
              alt={product.name_ar}
              className="size-full object-cover"
            />
          </motion.div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  className={cn("h-24 w-20 border", active === i ? "border-accent" : "border-transparent")}
                >
                  <img src={img} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow">{product.name_en}</div>
          <h1 className="mt-2 text-3xl font-bold">{product.name_ar}</h1>
          <div className="mt-2 flex items-center gap-1 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
            <span className="mr-2 text-xs text-muted-foreground">({approved.length} تقييم)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{egp(priceOf(product))}</span>
            {product.sale_price && (
              <>
                <span className="text-muted-foreground line-through">{egp(product.price)}</span>
                <span className="bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                  وفر {off}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-8 text-muted-foreground">{product.description_ar}</p>

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold">اللون: {chosenColor}</div>
            <div className="flex flex-wrap gap-2">
              {(product.colors ?? []).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "border px-3 py-1.5 text-xs",
                    chosenColor === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">المقاس: {chosenSize}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Ruler className="size-3.5" /> دليل المقاسات بالأسفل
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(product.sizes ?? []).map((s) => {
                const q =
                  product.product_variants?.find((v) => v.size === s && v.color === chosenColor)
                    ?.quantity ?? 0;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    disabled={q === 0}
                    className={cn(
                      "min-w-12 border px-3 py-2 text-xs",
                      chosenSize === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                      q === 0 && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {inStock ? `متاح — باقي ${variant?.quantity} قطعة` : "غير متوفر بهذا المقاس/اللون"}
            </p>
          </div>

          <div className="mt-7 flex gap-2">
            <Button size="lg" className="flex-1" disabled={!inStock} onClick={addToCart}>
              أضف إلى الحقيبة
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => toggleWishlist(product.slug)}
              aria-label="المفضلة"
            >
              <Heart
                className={cn("size-5", wishlist.includes(product.slug) && "fill-destructive text-destructive")}
              />
            </Button>
          </div>
          <Button asChild size="lg" variant="outline" className="mt-2 w-full" disabled={!inStock}>
            <Link to="/checkout" onClick={addToCart}>
              اشترِ الآن
            </Link>
          </Button>

          <div className="mt-6 grid grid-cols-3 gap-3 border-y py-4 text-center text-[0.7rem] text-muted-foreground">
            <div>
              <Truck className="mx-auto mb-1 size-4" /> شحن سريع لكل مصر
            </div>
            <div>
              <Undo2 className="mx-auto mb-1 size-4" /> استبدال خلال ١٤ يوم
            </div>
            <div>
              <ShieldCheck className="mx-auto mb-1 size-4" /> دفع آمن
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="sku">
              <AccordionTrigger className="text-sm">تفاصيل المنتج</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                كود المنتج: {product.sku} — {product.description_en}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="size">
              <AccordionTrigger className="text-sm">دليل المقاسات</AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2">المقاس</th>
                      <th>الصدر (سم)</th>
                      <th>الطول (سم)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["S", "96", "68"],
                      ["M", "102", "70"],
                      ["L", "108", "72"],
                      ["XL", "114", "74"],
                      ["XXL", "120", "76"],
                    ].map((r) => (
                      <tr key={r[0]} className="border-b last:border-0">
                        <td className="py-2 font-semibold">{r[0]}</td>
                        <td>{r[1]}</td>
                        <td>{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews">
              <AccordionTrigger className="text-sm">آراء العملاء ({approved.length})</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {approved.length === 0 && (
                  <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
                )}
                {approved.map((r) => (
                  <div key={r.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{r.customer_name}</span>
                      <span className="text-xs text-accent">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold">منتجات مشابهة</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
