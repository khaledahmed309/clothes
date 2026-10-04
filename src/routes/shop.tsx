import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { categoriesQuery, priceOf, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/site/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ShopSearch = {
  category?: string | undefined;
  tag?: string | undefined;
  collection?: string | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    tag: typeof search["tag"] === "string" ? search["tag"] : undefined,
    collection: typeof search["collection"] === "string" ? search["collection"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "تسوق ملابس رجالي | Leon" },
      {
        name: "description",
        content: "تصفح كل منتجات Leon الرجالي: تيشيرتات، قمصان، جينز، جواكيت، أحذية وإكسسوارات.",
      },
      { property: "og:title", content: "تسوق ملابس رجالي | Leon" },
      { property: "og:description", content: "كل منتجات Leon بأسعار بالجنيه المصري وشحن لكل مصر." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products, isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState(search.q ?? "");

  const filtered = useMemo(() => {
    let list = [...(products ?? [])];
    if (search.category) {
      const cat = categories.find((c) => c.slug === search.category);
      if (cat) list = list.filter((p) => p.category_id === cat.id);
    }
    if (search.collection) list = list.filter((p) => p.collection === search.collection);
    if (search.tag === "new") list = list.filter((p) => p.is_new);
    if (search.tag === "best") list = list.filter((p) => p.is_best_seller);
    if (search.tag === "sale") list = list.filter((p) => p.sale_price);
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((p) => p.name_ar.includes(q) || p.name_en.toLowerCase().includes(q.toLowerCase()));
    }
    if (sort === "price-asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [products, categories, search, sort, query]);

  const title =
    search.tag === "new"
      ? "وصل حديثاً"
      : search.tag === "best"
        ? "الأكثر مبيعاً"
        : search.tag === "sale"
          ? "التخفيضات"
          : (categories.find((c) => c.slug === search.category)?.name_ar ?? "كل المنتجات");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="eyebrow">المتجر</div>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/shop"
          search={{}}
          className={cn(
            "border px-3 py-1.5 text-xs transition-colors",
            !search.category && !search.tag ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
          )}
        >
          الكل
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ category: c.slug }}
            className={cn(
              "border px-3 py-1.5 text-xs transition-colors",
              search.category === c.slug
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary",
            )}
          >
            {c.name_ar}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-y py-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }) });
          }}
          placeholder="ابحث عن منتج..."
          className="w-full max-w-xs border bg-card px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex items-center gap-2 sm:mr-auto">
          <span className="text-xs text-muted-foreground">{filtered.length} منتج</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border bg-card px-3 py-2 text-sm"
            aria-label="ترتيب"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          لا توجد منتجات مطابقة لبحثك.
        </p>
      ) : (
        <motion.div layout className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
