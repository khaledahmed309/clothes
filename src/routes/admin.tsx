import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { uploadProductImage } from "@/lib/product-images.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { egp, ORDER_STATUS, PAYMENT_LABELS, PAYMENT_STATUS } from "@/lib/format";

type ProductForm = {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  category_id: string;
  price: string;
  sale_price: string;
  images: string;
  sizes: string;
  colors: string;
  is_active: boolean;
};

const EMPTY_FORM: ProductForm = {
  slug: "",
  name_ar: "",
  name_en: "",
  description_ar: "",
  category_id: "",
  price: "",
  sale_price: "",
  images: "",
  sizes: "S, M, L, XL, XXL",
  colors: "",
  is_active: true,
};

const listToArray = (v: string) =>
  v
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

// يحوّل الأرقام العربية إلى إنجليزية ويشيل أي رموز غير رقمية
const toNumber = (v: string) => {
  const normalized = v
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^0-9.]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsDataURL(file);
  });

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة التحكم | Leon" },
      { name: "description", content: "إدارة طلبات ومنتجات متجر Leon للملابس الرجالي." },
      { property: "og:title", content: "لوحة التحكم | Leon" },
      { property: "og:description", content: "متابعة الطلبات وحالة المنتجات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const upload = useServerFn(uploadProductImage);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const dataBase64 = await fileToBase64(file);
        const res = await upload({
          data: { fileName: file.name, contentType: file.type || "image/jpeg", dataBase64 },
        });
        urls.push(res.url);
      }
      setForm((f) => (f ? { ...f, images: [...listToArray(f.images), ...urls].join("\n") } : f));
      toast.success("تم رفع الصور");
    } catch {
      toast.error("فشل رفع الصورة، جرّب صورة أصغر");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    enabled: ready,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    enabled: ready,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name_ar");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    enabled: ready,
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name_ar").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  async function saveProduct() {
    if (!form) return;
    if (!form.name_ar.trim() || !form.price) {
      toast.error("اكتب اسم المنتج والسعر");
      return;
    }
    const slug =
      form.slug.trim() ||
      form.name_en.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      `product-${Date.now()}`;
    const price = toNumber(form.price);
    const salePrice = form.sale_price.trim() ? toNumber(form.sale_price) : null;
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("السعر غير صحيح");
      return;
    }
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0)) {
      toast.error("سعر الخصم غير صحيح");
      return;
    }
    const payload = {
      slug,
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim() || form.name_ar.trim(),
      description_ar: form.description_ar.trim() || null,
      category_id: form.category_id || null,
      price,
      sale_price: salePrice,
      images: listToArray(form.images),
      sizes: listToArray(form.sizes),
      colors: listToArray(form.colors),
      is_active: form.is_active,
    };
    setSaving(true);
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("لم يتم الحفظ: " + error.message);
      return;
    }
    toast.success(form.id ? "تم تعديل المنتج" : "تمت إضافة المنتج");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function removeProduct(id: string) {
    if (!confirm("حذف المنتج نهائيًا؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("لم يتم الحذف، جرّب إخفاء المنتج بدل الحذف");
      return;
    }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  if (!ready) return <div className="py-24 text-center text-sm text-muted-foreground">جارٍ التحميل...</div>;

  async function updateOrder(id: string, patch: { status?: string; payment_status?: string }) {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) {
      toast.error("لم يتم الحفظ");
      return;
    }
    toast.success("تم التحديث");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  async function toggleProduct(id: string, isActive: boolean) {
    const { error } = await supabase.from("products").update({ is_active: !isActive }).eq("id", id);
    if (error) {
      toast.error("لم يتم الحفظ");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">لوحة التحكم</div>
          <h1 className="mt-2 text-3xl font-bold">إدارة Leon</h1>
        </div>
        <Button variant="outline" onClick={signOut}>
          خروج
        </Button>
      </div>

      <h2 className="mt-10 text-xl font-semibold">الطلبات ({orders.length})</h2>
      <div className="mt-4 overflow-x-auto border">
        <table className="w-full min-w-[820px] text-right text-sm">
          <thead className="bg-secondary text-xs">
            <tr>
              <th className="p-3">رقم الطلب</th>
              <th className="p-3">العميل</th>
              <th className="p-3">الإجمالي</th>
              <th className="p-3">الدفع</th>
              <th className="p-3">حالة الدفع</th>
              <th className="p-3">حالة الطلب</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  لا توجد طلبات بعد.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium">{o.order_number}</td>
                <td className="p-3">
                  {o.customer_name}
                  <div className="text-xs text-muted-foreground" dir="ltr">
                    {o.phone}
                  </div>
                </td>
                <td className="p-3">{egp(Number(o.total))}</td>
                <td className="p-3">
                  {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}
                  {o.payment_reference && (
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {o.payment_reference}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <select
                    className="border bg-card px-2 py-1 text-xs"
                    value={o.payment_status}
                    onChange={(e) => updateOrder(o.id, { payment_status: e.target.value })}
                    aria-label="حالة الدفع"
                  >
                    {Object.keys(PAYMENT_STATUS).map((s) => (
                      <option key={s} value={s}>
                        {PAYMENT_STATUS[s] ?? s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <select
                    className="border bg-card px-2 py-1 text-xs"
                    value={o.status}
                    onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                    aria-label="حالة الطلب"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS[s] ?? s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-xl font-semibold">المنتجات ({products.length})</h2>
        <Button onClick={() => setForm({ ...EMPTY_FORM })}>+ إضافة منتج</Button>
      </div>

      {form && (
        <div className="mt-4 space-y-4 border bg-card p-4">
          <h3 className="font-semibold">{form.id ? "تعديل منتج" : "منتج جديد"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              اسم المنتج (عربي)
              <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
            </label>
            <label className="text-sm">
              الاسم بالإنجليزي
              <Input dir="ltr" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            </label>
            <label className="text-sm">
              القسم
              <select
                className="mt-1 h-10 w-full border bg-background px-2 text-sm"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">بدون قسم</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              الرابط (slug) — اختياري
              <Input dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
            <label className="text-sm">
              السعر (ج.م)
              <Input
                type="text"
                dir="ltr"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="text-sm">
              سعر الخصم (اختياري)
              <Input
                type="text"
                dir="ltr"
                inputMode="decimal"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </label>
            <label className="text-sm">
              المقاسات (مفصولة بفاصلة)
              <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            </label>
            <label className="text-sm">
              الألوان (مفصولة بفاصلة)
              <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
            </label>
          </div>
          <div className="text-sm">
            <div className="mb-2">صور المنتج</div>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
              className="block w-full cursor-pointer border bg-background p-2 text-xs file:ml-3 file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {uploading ? "جارٍ رفع الصور..." : "اختر صورة أو أكثر من جهازك (حتى ٨ ميجا للصورة)."}
            </p>
            {listToArray(form.images).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {listToArray(form.images).map((src) => (
                  <div key={src} className="relative">
                    <img src={src} alt="صورة المنتج" className="h-24 w-20 border object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) =>
                          f ? { ...f, images: listToArray(f.images).filter((i) => i !== src).join("\n") } : f,
                        )
                      }
                      className="absolute -top-2 -left-2 h-6 w-6 border bg-card text-xs"
                      aria-label="حذف الصورة"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="block text-sm">
            الوصف
            <Textarea rows={3} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            معروض في المتجر
          </label>
          <div className="flex gap-3">
            <Button onClick={saveProduct} disabled={saving}>
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto border">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-secondary text-xs">
            <tr>
              <th className="p-3">المنتج</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name_ar} className="h-12 w-10 border object-cover" />}
                    {p.name_ar}
                  </div>
                </td>
                <td className="p-3" dir="ltr">
                  {Number(p.sale_price ?? p.price).toLocaleString("en-US")} EGP
                </td>
                <td className="p-3">
                  <Button size="sm" variant={p.is_active ? "outline" : "default"} onClick={() => toggleProduct(p.id, p.is_active)}>
                    {p.is_active ? "معروض" : "مخفي"}
                  </Button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setForm({
                          id: p.id,
                          slug: p.slug,
                          name_ar: p.name_ar,
                          name_en: p.name_en,
                          description_ar: p.description_ar ?? "",
                          category_id: p.category_id ?? "",
                          price: String(p.price),
                          sale_price: p.sale_price == null ? "" : String(p.sale_price),
                          images: (p.images ?? []).join("\n"),
                          sizes: (p.sizes ?? []).join(", "),
                          colors: (p.colors ?? []).join(", "),
                          is_active: p.is_active,
                        })
                      }
                    >
                      تعديل
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}>
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
