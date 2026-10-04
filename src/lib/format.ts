export function egp(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`;
}

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  vodafone_cash: "فودافون كاش",
  card: "فيزا / ماستركارد",
};

export const ORDER_STATUS: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "تم التأكيد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

export const PAYMENT_STATUS: Record<string, string> = {
  pending: "في انتظار الدفع",
  awaiting_verification: "بانتظار المراجعة",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "تم الاسترجاع",
};
