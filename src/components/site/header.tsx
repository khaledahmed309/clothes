import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { categoriesQuery } from "@/lib/catalog";

const primaryLinks = [
  { to: "/shop", label: "كل المنتجات", search: {} },
  { to: "/shop", label: "وصل حديثاً", search: { tag: "new" } },
  { to: "/shop", label: "الأكثر مبيعاً", search: { tag: "best" } },
  { to: "/shop", label: "التخفيضات", search: { tag: "sale" } },
];

export function Header() {
  const { count, setOpen } = useCart();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="bg-primary py-2 text-center text-[0.7rem] tracking-[0.2em] text-primary-foreground">
        شحن مجاني للطلبات فوق ٣٠٠٠ ج.م — توصيل لكل محافظات مصر
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="القائمة">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto">
            <div className="brand-wordmark px-4 pt-6 text-xl">Leon</div>
            <nav className="mt-6 flex flex-col gap-1 px-2 pb-10">
              {primaryLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  search={l.search}
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-3 py-2.5 text-sm hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <div className="eyebrow mt-4 px-3">الأقسام</div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ category: c.slug }}
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {c.name_ar}
                </Link>
              ))}
              <Link
                to="/track"
                onClick={() => setMenuOpen(false)}
                className="mt-4 rounded px-3 py-2.5 text-sm hover:bg-secondary"
              >
                تتبع طلبك
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="brand-wordmark text-xl sm:text-2xl">
          Leon
        </Link>

        <nav className="mx-auto hidden items-center gap-7 lg:flex">
          {primaryLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={l.search}
              className="text-sm text-foreground/80 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/track"
            className="text-sm text-foreground/80 transition-colors hover:text-accent"
          >
            تتبع طلبك
          </Link>
        </nav>

        <div className="mr-auto flex items-center gap-1 lg:mr-0">
          <Link to="/shop" search={{}} aria-label="بحث">
            <Button variant="ghost" size="icon">
              <Search className="size-5" />
            </Button>
          </Link>
          <Link to="/auth" aria-label="الحساب">
            <Button variant="ghost" size="icon">
              <User className="size-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="حقيبة التسوق"
            className="relative"
            onClick={() => setOpen(true)}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 left-0 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.62rem] font-bold text-accent-foreground"
              >
                {count}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
