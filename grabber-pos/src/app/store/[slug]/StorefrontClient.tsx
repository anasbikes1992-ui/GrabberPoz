"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import type { Settings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";

interface Props {
  slug: string;
  settings: Settings;
  initialProducts: Product[];
  categories: { name: string; count: number }[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorefrontClient({
  settings,
  initialProducts,
  categories,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "success">("cart");

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "card">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReceiptNo, setLastReceiptNo] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcodes.some((b) => b.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCat === "all" || p.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [initialProducts, search, selectedCat]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Trigger Meta / Google Pixel AddToCart event if present
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq("track", "AddToCart", { content_name: product.name, value: product.salePrice, currency: settings.currency || "LKR" });
      if (w.gtag) w.gtag("event", "add_to_cart", { items: [{ item_name: product.name, price: product.salePrice }] });
    }
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  }, [cart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientUuid: `web-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          customerName,
          customerMobile: customerPhone,
          paymentMethod: paymentType === "cash" ? "cash" : "card",
          lines: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            discount: 0,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastReceiptNo(data.data?.id || "ORD-ONLINE");
        setCart([]);
        setCheckoutStep("success");

        // Track conversion
        if (typeof window !== "undefined") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w = window as any;
          if (w.fbq) w.fbq("track", "Purchase", { value: totalAmount, currency: settings.currency || "LKR" });
          if (w.gtag) w.gtag("event", "purchase", { value: totalAmount, currency: settings.currency || "LKR" });
        }
      } else {
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide">
        🚀 {settings.storeSlogan} | Fast Local Delivery & Best Prices Guaranteed!
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">
            {settings.businessName.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-100">{settings.businessName}</h1>
            <p className="text-xs text-slate-400">Official Online Store</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {settings.phone && (
            <a
              href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <span>💬 WhatsApp Order</span>
            </a>
          )}
          <button
            onClick={() => {
              setShowCart(true);
              setCheckoutStep("cart");
            }}
            className="relative bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <span>🛒 Cart</span>
            {cart.length > 0 && (
              <span className="bg-slate-950 text-sky-400 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {cart.reduce((a, c) => a + c.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search products or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCat === "all"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              All Products ({initialProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCat(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCat === cat.name
                    ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 mb-4 tracking-wider uppercase">
            Available Items ({filteredProducts.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-600 text-3xl font-bold border border-slate-800 group-hover:border-slate-700 transition">
                    📦
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-sky-400 transition">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{product.barcodes[0] || product.id}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="font-bold text-sm text-emerald-400">
                      {formatMoney(product.salePrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-700 hover:border-sky-400"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              No products match your search query.
            </div>
          )}
        </section>
      </main>

      {/* Cart & Checkout Modal / Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="font-bold text-lg text-slate-100">
                  {checkoutStep === "cart" && "Your Order Cart"}
                  {checkoutStep === "form" && "Checkout Details"}
                  {checkoutStep === "success" && "Order Confirmed!"}
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-slate-400 hover:text-slate-100 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {checkoutStep === "cart" && (
                <div className="py-4 space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-12">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800/80"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-200">{item.product.name}</p>
                          <p className="text-xs text-emerald-400 font-mono">
                            {formatMoney(item.product.salePrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-slate-100 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {checkoutStep === "form" && (
                <form onSubmit={handleCheckout} className="py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Nimal Perera"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full delivery address"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentType("cash")}
                        className={`p-3 rounded-xl text-xs font-bold border transition ${
                          paymentType === "cash"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        💵 Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType("card")}
                        className={`p-3 rounded-xl text-xs font-bold border transition ${
                          paymentType === "card"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        💳 Card Payment
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition mt-4 shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? "Placing Order..." : `Confirm & Place Order (${formatMoney(totalAmount)})`}
                  </button>
                </form>
              )}

              {checkoutStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Thank you for your order!</h3>
                  <p className="text-xs text-slate-400">
                    Order Reference: <strong className="text-sky-400 font-mono">{lastReceiptNo}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Your order has been sent directly to our store POS terminal. We will call you at{" "}
                    <strong className="text-slate-200">{customerPhone}</strong> to confirm delivery.
                  </p>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setCheckoutStep("cart");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Back to Store
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary in Cart Mode */}
            {checkoutStep === "cart" && cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    {formatMoney(totalAmount)}
                  </span>
                </div>
                <button
                  onClick={() => setCheckoutStep("form")}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-sky-500/20"
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
