import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/cart";
import { settingsQuery, shippingQuery } from "@/lib/catalog";
import { egp } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | Leon" },
      {
        name: "description",
        content: "أكمل طلبك من Leon: الدفع عند الاستلام، فودافون كاش أو بالبطاقة، وشحن لكل مصر.",
      },
      { property: "og:title", content: "إتمام الطلب | Leon" },
      { property: "og:description", content: "دفع آمن وشحن سريع لكل محافظات مصر." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const { data: rates = [] } = useQuery(shippingQuery);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    governorate: "",
    city: "",
    address: "",
    notes: "",
  });
  const [payment, setPayment] = useState("cod");
  const [reference, setReference] = useState("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const rate = useMemo(
    () => rates.find((r) => r.governorate === form.governorate),
    [rates, form.governorate],
  );
  const threshold = Number(settings?.free_shipping_threshold ?? 3000);
  const shipping = !form.governorate ? 0 : subtotal >= threshold ? 0 : Number(rate?.fee ?? 70);
  const total = subtotal + shipping;

  const methods = [
    { id: "cod", label: "الدفع عند الاستلام", desc: "ادفع نقداً عند وصول الطلب", on: settings?.cod_enabled ?? true },
    {
      id: "vodafone_cash",
      label: "فودافون كاش",
      desc: `حوّل المبلغ إلى ${settings?.vodafone_cash_number ?? "—"} ثم أدخل رقم العملية`,
      on: settings?.vodafone_cash_enabled ?? true,
    },
    { id: "card", label: "فيزا / ماستركارد", desc: "دفع آمن بالبطاقة البنكية", on: settings?.card_enabled ?? true },
  ].filter((m) => m.on);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (payment === "vodafone_cash" && !reference.trim()) {
      toast.error("من فضلك أدخل رقم عملية التحويل");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("place_order", {
      p_customer: form,
      p_items: items.map((i) => ({
        product_id: i.product_id,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
      p_payment_method: payment,
      ...(coupon ? { p_coupon: coupon } : {}),
      ...(reference ? { p_payment_reference: reference } : {}),
    });
    setLoading(false);
    if (error || !data) {
      toast.error("تعذّر إتمام الطلب، حاول مرة أخرى");
      return;
    }
    const res = data as unknown as { order_number: string };
    clear();
    toast.success("تم استلام طلبك بنجاح");
    navigate({
      to: "/order/$number",
      params: { number: res.order_number },
      search: { phone: form.phone },
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">حقيبتك فارغة</h1>
        <p className="mt-2 text-sm text-muted-foreground">أضف بعض القطع قبل إتمام الطلب.</p>
        <Button className="mt-6" asChild>
          <Link to="/shop" search={{}}>
            تصفح المنتجات
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">الخطوة الأخيرة</div>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">إتمام الطلب</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="border bg-card p-6">
            <h2 className="text-base font-bold">بيانات التوصيل</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="الاسم بالكامل" required value={form.customer_name} onChange={(v) => set("customer_name", v)} />
              <Field label="رقم الهاتف" required value={form.phone} onChange={(v) => set("phone", v)} placeholder="01xxxxxxxxx" />
              <Field label="البريد الإلكتروني (اختياري)" value={form.email} onChange={(v) => set("email", v)} type="email" />
              <div>
                <Label htmlFor="gov">المحافظة</Label>
                <select
                  id="gov"
                  required
                  value={form.governorate}
                  onChange={(e) => set("governorate", e.target.value)}
                  className="mt-1.5 h-9 w-full border bg-background px-3 text-sm"
                >
                  <option value="">اختر المحافظة</option>
                  {rates.map((r) => (
                    <option key={r.id} value={r.governorate}>
                      {r.governorate} — {egp(r.fee)} ({r.days} أيام)
                    </option>
                  ))}
                </select>
              </div>
              <Field label="المدينة / المنطقة" required value={form.city} onChange={(v) => set("city", v)} />
              <div className="sm:col-span-2">
                <Label htmlFor="addr">العنوان بالتفصيل</Label>
                <Textarea
                  id="addr"
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">ملاحظات على الطلب (اختياري)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          <section className="border bg-card p-6">
            <h2 className="text-base font-bold">طريقة الدفع</h2>
            <div className="mt-4 space-y-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    payment === m.id ? "border-accent bg-accent/5" : "hover:bg-secondary/60",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-[var(--accent)]"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {payment === "vodafone_cash" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                <div className="border bg-secondary/50 p-4 text-sm">
                  حوّل <strong>{egp(total)}</strong> إلى رقم فودافون كاش{" "}
                  <strong dir="ltr">{settings?.vodafone_cash_number}</strong> ثم أدخل رقم عملية التحويل.
                  سيتم تأكيد الطلب بعد مراجعة التحويل.
                </div>
                <div className="mt-3">
                  <Label htmlFor="ref">رقم عملية التحويل</Label>
                  <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1.5" />
                </div>
              </motion.div>
            )}

            {payment === "card" && (
              <p className="mt-4 border bg-secondary/50 p-4 text-sm">
                سيتم التواصل معك بلينك دفع آمن لإتمام السداد بالبطاقة بعد تأكيد الطلب.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold">ملخص الطلب</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.product_id}${i.size}${i.color}`} className="flex gap-3 text-sm">
                <img src={i.image ?? "/images/tshirt-black.jpg"} alt="" loading="lazy" className="h-16 w-12 object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.size} / {i.color} × {i.quantity}
                  </div>
                </div>
                <div className="font-semibold">{egp(i.price * i.quantity)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2 border-t pt-4">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="كود الخصم" />
          </div>

          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <Row label="الإجمالي الفرعي" value={egp(subtotal)} />
            <Row
              label="الشحن"
              value={!form.governorate ? "يُحدد بعد اختيار المحافظة" : shipping === 0 ? "مجاني" : egp(shipping)}
            />
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <dt>الإجمالي</dt>
              <dd>{egp(total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
            {loading && <Loader2 className="ml-2 size-4 animate-spin" />}
            تأكيد الطلب
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> بياناتك محمية ولا تُشارك مع أي طرف آخر
          </p>
        </aside>
      </form>
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

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  const id = label.replace(/\s/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required ?? false}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      />
    </div>
  );
}
