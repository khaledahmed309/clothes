import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { egp, ORDER_STATUS, PAYMENT_LABELS, PAYMENT_STATUS } from "@/lib/format";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "تتبع طلبك | Leon" },
      { name: "description", content: "تابع حالة طلبك من Leon برقم الطلب ورقم الهاتف." },
      { property: "og:title", content: "تتبع طلبك | Leon" },
      { property: "og:description", content: "اعرف حالة شحن طلبك خطوة بخطوة." },
    ],
  }),
  component: TrackPage,
});

type TrackOrder = {
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
};
type TrackItem = {
  image_url: string | null;
  name_ar: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
};
type TrackResult = { order: TrackOrder; items: TrackItem[] };

function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const { data, error: err } = await supabase.rpc("track_order", {
      p_order_number: orderNumber,
      p_phone: phone,
    });
    setLoading(false);
    if (err || !data) {
      setError("لم نتمكن من العثور على الطلب. تأكد من رقم الطلب ورقم الهاتف.");
      return;
    }
    setResult(data as unknown as TrackResult);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="eyebrow">خدمة العملاء</div>
      <h1 className="mt-2 text-3xl font-bold">تتبع طلبك</h1>
      <form onSubmit={submit} className="mt-8 space-y-4 border bg-card p-6">
        <div>
          <Label htmlFor="on">رقم الطلب</Label>
          <Input
            id="on"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="LN-260101-12345"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ph">رقم الهاتف</Label>
          <Input
            id="ph"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            required
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "جارٍ البحث..." : "عرض حالة الطلب"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      {result && (
        <div className="mt-8 border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">طلب {String(result.order.order_number)}</h2>
            <span className="bg-secondary px-3 py-1 text-xs">
              {ORDER_STATUS[String(result.order.status)] ?? String(result.order.status)}
            </span>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">طريقة الدفع</dt>
              <dd>{PAYMENT_LABELS[String(result.order.payment_method)]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">حالة الدفع</dt>
              <dd>{PAYMENT_STATUS[String(result.order.payment_status)]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">الإجمالي</dt>
              <dd className="font-bold">{egp(result.order.total)}</dd>
            </div>
          </dl>
          <ul className="mt-5 space-y-3 border-t pt-4">
            {result.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                {it.image_url && (
                  <img
                    src={String(it.image_url)}
                    alt=""
                    loading="lazy"
                    className="h-16 w-12 object-cover"
                  />
                )}
                <span>
                  {String(it.name_ar)} — {String(it.size)} / {String(it.color)} ×{" "}
                  {String(it.quantity)}
                </span>
                <span className="mr-auto font-semibold">
                  {egp(Number(it.unit_price) * Number(it.quantity))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
