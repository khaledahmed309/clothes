import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { egp, ORDER_STATUS, PAYMENT_LABELS, PAYMENT_STATUS } from "@/lib/format";

type OrderSearch = { phone?: string | undefined };

export const Route = createFileRoute("/order/$number")({
  validateSearch: (search: Record<string, unknown>): OrderSearch => ({
    phone: typeof search["phone"] === "string" ? search["phone"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "تأكيد الطلب | Leon" },
      { name: "description", content: "تفاصيل طلبك من Leon وحالة الشحن والدفع." },
      { property: "og:title", content: "تأكيد الطلب | Leon" },
      { property: "og:description", content: "شكراً لطلبك من Leon — تابع حالة طلبك من هنا." },
    ],
  }),
  component: OrderPage,
});

const STEPS = [
  { id: "pending", label: "تم الاستلام", icon: CheckCircle2 },
  { id: "confirmed", label: "تم التأكيد", icon: Package },
  { id: "shipped", label: "تم الشحن", icon: Truck },
  { id: "delivered", label: "تم التسليم", icon: Home },
];

type OrderData = {
  order: {
    order_number: string;
    status: string;
    payment_method: string;
    payment_status: string;
    total: number;
    subtotal: number;
    shipping_fee: number;
    discount: number;
    customer_name: string;
    governorate: string;
    city: string;
    address: string;
  };
  items: Array<{
    image_url: string | null;
    name_ar: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
  }>;
};

function OrderPage() {
  const { number } = Route.useParams();
  const { phone } = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: ["order", number, phone],
    enabled: Boolean(phone),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_number: number,
        p_phone: phone ?? "",
      });
      if (error) throw error;
      return data as unknown as OrderData | null;
    },
  });

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.id === data?.order?.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border bg-card p-8 text-center"
      >
        <CheckCircle2 className="mx-auto size-12 text-accent" />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
          شكراً لطلبك!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          رقم طلبك <strong dir="ltr">{number}</strong> — احتفظ به لمتابعة الشحن.
        </p>
      </motion.div>

      {!phone && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          لعرض تفاصيل الطلب،{" "}
          <Link to="/track" className="text-accent underline">
            تابع طلبك برقم الهاتف
          </Link>
          .
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-sm text-muted-foreground">جارٍ التحميل...</p>}

      {data?.order && (
        <>
          <div className="mt-8 grid grid-cols-4 gap-2 border bg-card p-6">
            {STEPS.map((s, i) => (
              <div key={s.id} className="text-center">
                <s.icon
                  className={`mx-auto size-6 ${i <= stepIndex ? "text-accent" : "text-muted-foreground/40"}`}
                />
                <div
                  className={`mt-2 text-[0.7rem] ${i <= stepIndex ? "font-semibold" : "text-muted-foreground"}`}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="border bg-card p-6 text-sm">
              <h2 className="font-bold">تفاصيل الطلب</h2>
              <dl className="mt-3 space-y-2">
                <Row label="الحالة" value={ORDER_STATUS[data.order.status] ?? data.order.status} />
                <Row label="طريقة الدفع" value={PAYMENT_LABELS[data.order.payment_method] ?? "-"} />
                <Row label="حالة الدفع" value={PAYMENT_STATUS[data.order.payment_status] ?? "-"} />
                <Row label="الإجمالي الفرعي" value={egp(data.order.subtotal)} />
                <Row label="الشحن" value={egp(data.order.shipping_fee)} />
                {Number(data.order.discount) > 0 && (
                  <Row label="الخصم" value={`- ${egp(data.order.discount)}`} />
                )}
                <div className="flex justify-between border-t pt-2 font-bold">
                  <dt>الإجمالي</dt>
                  <dd>{egp(data.order.total)}</dd>
                </div>
              </dl>
            </div>
            <div className="border bg-card p-6 text-sm">
              <h2 className="font-bold">عنوان التوصيل</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {data.order.customer_name}
                <br />
                {data.order.address}
                <br />
                {data.order.city} — {data.order.governorate}
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 border bg-card p-6">
            {data.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                {it.image_url && (
                  <img src={it.image_url} alt="" loading="lazy" className="h-16 w-12 object-cover" />
                )}
                <span>
                  {it.name_ar} — {it.size} / {it.color} × {it.quantity}
                </span>
                <span className="mr-auto font-semibold">
                  {egp(Number(it.unit_price) * Number(it.quantity))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link to="/shop" search={{}}>
            متابعة التسوق
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
