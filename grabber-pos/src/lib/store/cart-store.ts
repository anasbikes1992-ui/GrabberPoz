import { create } from "zustand";
import type { CartLine, Product } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  isWholesale: boolean;
  serviceCharge: number;
  finalDiscount: number;
  customerName: string;
  customerMobile: string;
  employee: string;
  /** Selected loyalty customer (null for walk-in). */
  customerId: string | null;
  customerPoints: number;
  redeemPoints: number;

  addProduct: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setDiscount: (productId: string, discount: number) => void;
  remove: (productId: string) => void;
  clear: () => void;

  setWholesale: (on: boolean) => void;
  setServiceCharge: (v: number) => void;
  setFinalDiscount: (v: number) => void;
  setCustomerName: (v: string) => void;
  setCustomerMobile: (v: string) => void;
  setEmployee: (v: string) => void;
  selectCustomer: (c: {
    id: string;
    name: string;
    mobile: string;
    points: number;
  }) => void;
  clearCustomer: () => void;
  setRedeemPoints: (v: number) => void;
}

function clampDiscount(value: number, max: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.min(value, max);
}

/** Effective unit price given the current wholesale toggle. */
export function effectivePrice(line: CartLine, isWholesale: boolean): number {
  return isWholesale && line.wholesalePrice != null
    ? line.wholesalePrice
    : line.unitPrice;
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  isWholesale: false,
  serviceCharge: 0,
  finalDiscount: 0,
  customerName: "",
  customerMobile: "",
  employee: "",
  customerId: null,
  customerPoints: 0,
  redeemPoints: 0,

  addProduct: (product) =>
    set((state) => {
      const existing = state.lines.find((l) => l.productId === product.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.productId === product.id
              ? { ...l, quantity: Math.min(l.quantity + 1, l.available || 9999) }
              : l,
          ),
        };
      }
      const line: CartLine = {
        productId: product.id,
        name: product.name,
        unitPrice: product.salePrice,
        wholesalePrice: product.wholesalePrice,
        quantity: 1,
        discount: clampDiscount(product.singleDiscount, product.maxDiscount),
        maxDiscount: product.maxDiscount,
        available: product.quantity,
      };
      return { lines: [...state.lines, line] };
    }),

  setQuantity: (productId, quantity) =>
    set((state) => ({
      lines:
        quantity <= 0
          ? state.lines.filter((l) => l.productId !== productId)
          : state.lines.map((l) =>
              l.productId === productId ? { ...l, quantity } : l,
            ),
    })),

  setDiscount: (productId, discount) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.productId === productId
          ? { ...l, discount: clampDiscount(discount, l.maxDiscount) }
          : l,
      ),
    })),

  remove: (productId) =>
    set((state) => ({
      lines: state.lines.filter((l) => l.productId !== productId),
    })),

  clear: () =>
    set({
      lines: [],
      serviceCharge: 0,
      finalDiscount: 0,
      customerName: "",
      customerMobile: "",
      employee: "",
      customerId: null,
      customerPoints: 0,
      redeemPoints: 0,
    }),

  setWholesale: (on) => set({ isWholesale: on }),
  setServiceCharge: (v) => set({ serviceCharge: Math.max(0, v || 0) }),
  setFinalDiscount: (v) => set({ finalDiscount: Math.max(0, v || 0) }),
  setCustomerName: (v) => set({ customerName: v }),
  setCustomerMobile: (v) => set({ customerMobile: v }),
  setEmployee: (v) => set({ employee: v }),
  selectCustomer: (c) =>
    set({
      customerId: c.id,
      customerName: c.name,
      customerMobile: c.mobile,
      customerPoints: c.points,
      redeemPoints: 0,
    }),
  clearCustomer: () =>
    set({
      customerId: null,
      customerName: "",
      customerMobile: "",
      customerPoints: 0,
      redeemPoints: 0,
    }),
  setRedeemPoints: (v) => set({ redeemPoints: Math.max(0, Math.floor(v || 0)) }),
}));

export interface CartTotals {
  subtotal: number;
  lineDiscount: number;
  finalDiscount: number;
  serviceCharge: number;
  total: number;
}

export function cartTotals(state: {
  lines: CartLine[];
  isWholesale: boolean;
  serviceCharge: number;
  finalDiscount: number;
}): CartTotals {
  const subtotal = state.lines.reduce(
    (s, l) => s + effectivePrice(l, state.isWholesale) * l.quantity,
    0,
  );
  const lineDiscount = state.lines.reduce(
    (s, l) => s + l.discount * l.quantity,
    0,
  );
  const afterLines = subtotal - lineDiscount;
  const finalDiscount = Math.min(Math.max(0, state.finalDiscount), afterLines);
  const total =
    afterLines - finalDiscount + Math.max(0, state.serviceCharge);
  return {
    subtotal,
    lineDiscount,
    finalDiscount,
    serviceCharge: state.serviceCharge,
    total,
  };
}
