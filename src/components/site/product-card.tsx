import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { discountPercent, priceOf, type Product } from "@/lib/catalog";
import { egp } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, setOpen, wishlist, toggleWishlist } = useCart();
  const [picker, setPicker] = useState(false);
  const off = discountPercent(product);
  const image = product.images?.[0] ?? "/images/tshirt-black.jpg";
  const hover = product.images?.[1] ?? image;
  const liked = wishlist.includes(product.slug);

  const quickAdd = (size: string) => {
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name_ar,
      image,
      price: priceOf(product),
      size,
      color: product.colors?.[0] ?? "-",
      quantity: 1,
    });
    setPicker(false);
    setOpen(true);
    toast.success("تمت الإضافة إلى الحقيبة");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group"
    >
      <div className="hover-zoom relative aspect-[3/4] bg-secondary">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <img
            src={image}
            alt={product.name_ar}
            loading="lazy"
            className="size-full object-cover"
          />
          <img
            src={hover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="bg-destructive px-2 py-1 text-[0.65rem] font-bold text-destructive-foreground">
              خصم {off}%
            </span>
          )}
          {product.is_new && (
            <span className="bg-primary px-2 py-1 text-[0.65rem] font-bold text-primary-foreground">
              جديد
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label="المفضلة"
          className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-card/85 backdrop-blur transition-colors hover:bg-card"
        >
          <Heart className={cn("size-4", liked && "fill-destructive text-destructive")} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {picker ? (
            <div className="flex flex-wrap gap-1 bg-card/95 p-2 backdrop-blur">
              {(product.sizes ?? []).map((s) => (
                <button
                  key={s}
                  onClick={() => quickAdd(s)}
                  className="min-w-9 border border-border px-2 py-1 text-xs hover:bg-primary hover:text-primary-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setPicker(true)}
              className="flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              <Plus className="size-3.5" /> إضافة سريعة
            </button>
          )}
        </div>
      </div>

      <div className="pt-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <h3 className="text-sm font-semibold">{product.name_ar}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold">{egp(priceOf(product))}</span>
          {product.sale_price && (
            <span className="text-xs text-muted-foreground line-through">{egp(product.price)}</span>
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          {(product.colors ?? []).slice(0, 4).map((c) => (
            <span key={c} className="text-[0.68rem] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
