import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { itemKey, useCart } from "@/context/cart";
import { egp } from "@/lib/format";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, remove, setQuantity } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex w-[92vw] max-w-md flex-col p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-right text-base">حقيبة التسوق</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">حقيبتك فارغة حالياً</p>
              <Button onClick={() => setOpen(false)} asChild>
                <Link to="/shop" search={{}}>
                  تصفح المنتجات
                </Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={itemKey(item)}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 border-b py-4"
                >
                  <img
                    src={item.image ?? "/images/tshirt-black.jpg"}
                    alt={item.name}
                    loading="lazy"
                    className="h-24 w-20 shrink-0 object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      المقاس {item.size} · {item.color}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border">
                        <button
                          className="px-2 py-1"
                          aria-label="إنقاص"
                          onClick={() => setQuantity(itemKey(item), item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                        <button
                          className="px-2 py-1"
                          aria-label="زيادة"
                          onClick={() => setQuantity(itemKey(item), item.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(itemKey(item))}
                        aria-label="حذف"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <span className="mr-auto text-sm font-bold">
                        {egp(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-secondary/50 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span>الإجمالي الفرعي</span>
              <span className="font-bold">{egp(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              تُحسب مصاريف الشحن حسب المحافظة في صفحة الدفع.
            </p>
            <Button className="mt-4 w-full" size="lg" onClick={() => setOpen(false)} asChild>
              <Link to="/checkout">إتمام الطلب</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
