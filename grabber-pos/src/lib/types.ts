export interface Product {
  id: string;
  name: string;
  nameLocal: string | null;
  barcodes: string[];
  brand: string | null;
  stockDate: string | null;
  costPrice: number;
  salePrice: number;
  wholesalePrice: number | null;
  maxDiscount: number;
  singleDiscount: number;
  quantity: number;
  category: string;
  expireDate: string | null;
  warrantyMonths: number;
  supplier: string | null;
  /** Optional product image URL. */
  imageUrl?: string | null;
}

export interface CartLine {
  productId: string;
  name: string;
  /** Retail unit price. */
  unitPrice: number;
  /** Wholesale unit price, if the product has one. */
  wholesalePrice: number | null;
  quantity: number;
  /** Per-unit discount amount (LKR), capped at product.maxDiscount */
  discount: number;
  maxDiscount: number;
  available: number;
}

export type PaymentMethod = "cash" | "card" | "wholesale";

export interface SaleLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  lines: SaleLine[];
  subtotal: number;
  /** Sum of per-line discounts. */
  discountTotal: number;
  /** Whole-bill discount applied after line discounts (LKR). */
  finalDiscount: number;
  /** Service charge added to the bill (LKR). */
  serviceCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  /** Wholesale pricing was used for this sale. */
  isWholesale: boolean;
  customerName: string | null;
  customerMobile: string | null;
  employee: string | null;
  cashReceived: number | null;
  change: number | null;
}

export type TicketStation = "KOT" | "BOT" | "RECEIPT";
