import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/catalog";

export function Footer() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="brand-wordmark text-2xl">Leon</div>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/70">
            ماركة رجالي مصرية تقدّم ملابس بخامات مختارة وتفاصيل مدروسة، لرجل يعرف ذوقه.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold">الأقسام</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link to="/shop" search={{ category: c.slug }} className="hover:text-accent">
                  {c.name_ar}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold">خدمة العملاء</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link to="/track" className="hover:text-accent">
                تتبع الطلب
              </Link>
            </li>
            <li>سياسة الاستبدال والاسترجاع خلال ١٤ يوم</li>
            <li>الشحن لكل محافظات مصر</li>
            <li>الدفع عند الاستلام متاح</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold">تواصل معنا</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>واتساب: 01000000000</li>
            <li>البريد: care@leon.eg</li>
            <li>القاهرة، مصر</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Leon — جميع الحقوق محفوظة. الأسعار بالجنيه المصري.
      </div>
    </footer>
  );
}
