"use client";

import { useState } from "react";
import Link from "next/link";

export default function MyPozLandingPage() {
  const [salesVolume, setSalesVolume] = useState<number>(500000);

  // ROI estimation formulas
  const timeSavedHours = Math.round((salesVolume / 100000) * 12);
  const stockLossPrevented = Math.round(salesVolume * 0.035);
  const extraWebSales = Math.round(salesVolume * 0.18);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-emerald-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-sky-500/20">
            G
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
              MyPoz Studio
            </span>
            <span className="block text-[10px] text-sky-400 font-mono font-semibold tracking-wider">
              ENTERPRISE BUSINESS OS
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-sky-400 transition">
            Features & Verticals
          </a>
          <a href="#storefront" className="hover:text-sky-400 transition">
            Web Storefront
          </a>
          <a href="#marketing" className="hover:text-sky-400 transition">
            AI Marketing
          </a>
          <a href="#calculator" className="hover:text-sky-400 transition">
            ROI Calculator
          </a>
          <a href="#pricing" className="hover:text-sky-400 transition">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/store/main-store"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <span>🛍️ Demo Web Store</span>
          </Link>
          <Link
            href="/pos"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 transition shadow-lg shadow-sky-500/25 flex items-center gap-2"
          >
            <span>Launch POS Terminal →</span>
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-sky-500/30 text-sky-400 text-xs font-bold shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Next-Gen Cloud Business OS & Multi-Tenant POS Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Run Your Store, Restaurant & Services With{" "}
          <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            One Unified OS
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Every POS client automatically gets a **Multi-Branch POS Terminal**, **Free Public E-Commerce Website**, **AI Social & Google Ads Generator**, and **Real-Time Inventory Ledger**.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 hover:opacity-95 transition shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2"
          >
            <span>🚀 Open Admin Dashboard</span>
          </Link>
          <Link
            href="/store/main-store"
            target="_blank"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>🌐 View Live Client Storefront</span>
          </Link>
        </div>

        {/* Live System Stat Metrics */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl font-extrabold text-sky-400">2,509</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Seeded Product Catalog</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl font-extrabold text-emerald-400">12</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Vertical Business Modes</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl font-extrabold text-indigo-400">44+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Built-in App Modules</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl font-extrabold text-amber-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Auto Web Storefront Sync</div>
          </div>
        </div>
      </section>

      {/* 12 Vertical Modes Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-sky-400 tracking-widest uppercase">
            Built For Every Business Type
          </h2>
          <p className="text-3xl font-bold text-white">12 Tailored Vertical Operation Modes</p>
          <p className="text-slate-400 text-xs max-w-xl mx-auto">
            Switch between specialized POS interfaces designed specifically for retail, dining, services, and hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 text-2xl flex items-center justify-center font-bold">
              🛒
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-sky-400 transition">
              Retail & Supermarkets
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast barcode scanning, scale integrations, cash drawer triggers, and line/cart discount limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 text-2xl flex items-center justify-center font-bold">
              🍽️
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition">
              Restaurants & Cafes
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Table floorplans, split bill calculations, and ESC/POS Kitchen Order Ticket (KOT) printing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 text-2xl flex items-center justify-center font-bold">
              🔧
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition">
              Electronics Repair & Garages
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Repair job sheet tracking, status SMS notifications, mechanics assignment, and parts/labor billing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 text-2xl flex items-center justify-center font-bold">
              🏢
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-400 transition">
              Wholesale & Distribution
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tiered wholesale pricing, customer credit balances, bulk quantity tiers, and purchase order GRNs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 text-2xl flex items-center justify-center font-bold">
              🏨
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-rose-400 transition">
              Hotels & Room Bookings
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Room reservation grid, check-in/check-out management, room service billing, and guest folios.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 text-2xl flex items-center justify-center font-bold">
              💳
            </div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-teal-400 transition">
              Hire Purchase & Rent
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monthly installment schedules, down payments, rental equipment deposits, and overdue alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Free E-Commerce Website & AI Marketing Feature Showcase */}
      <section id="storefront" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              🎁 Included Free With Every Account
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              A Dedicated E-Commerce Website For Every POS Buyer
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stop paying extra for Shopify or WooCommerce. When your client signs up for MyPoz POS, they automatically get a fully functional, SEO-optimized online storefront connected directly to their inventory.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Real-time Stock Sync**: Web orders instantly deduct POS stock.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Google Shopping XML Feed**: Push product feeds into Google Ads automatically.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Meta & Google Pixel**: Embedded tracking for Facebook, IG, and Google Ads retargeting.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**SEO Rich Snippets**: Schema.org structured data for instant search visibility.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/store/main-store"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20"
              >
                <span>Preview Live Tenant Website →</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-slate-500">grabber-pos.vercel.app/store/main-store</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Grabber Demo Store</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">● Live Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">2,509 Products Available • Islandwide Delivery</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 text-xs border border-slate-800">
                  <div className="font-semibold text-slate-200 text-[11px]">Jasmine Bouquet Air Freshner</div>
                  <div className="text-emerald-400 font-bold mt-1">LKR 300.00</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 text-xs border border-slate-800">
                  <div className="font-semibold text-slate-200 text-[11px]">Khomba Baby Cologne 100ml</div>
                  <div className="text-emerald-400 font-bold mt-1">LKR 570.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI & Profit Savings Calculator */}
      <section id="calculator" className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 py-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-sky-400 tracking-widest uppercase">
            Interactive Business Savings
          </h2>
          <p className="text-3xl font-bold text-white">Calculate Your Monthly ROI</p>
          <p className="text-slate-400 text-xs">
            See how much time and money MyPoz POS saves your business every month.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-xl">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-300">Estimated Monthly Sales Volume</span>
              <span className="text-sky-400 font-mono font-bold text-base">
                LKR {salesVolume.toLocaleString("en-LK")}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={5000000}
              step={50000}
              value={salesVolume}
              onChange={(e) => setSalesVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-xs font-semibold text-slate-400">Monthly Time Saved</div>
              <div className="text-3xl font-extrabold text-sky-400">{timeSavedHours} Hours</div>
              <div className="text-[11px] text-slate-500">Automated checkout & billing</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-xs font-semibold text-slate-400">Stock Loss Prevented</div>
              <div className="text-3xl font-extrabold text-emerald-400">
                LKR {stockLossPrevented.toLocaleString("en-LK")}
              </div>
              <div className="text-[11px] text-slate-500">Real-time inventory audit</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-xs font-semibold text-slate-400">Extra Web Revenue</div>
              <div className="text-3xl font-extrabold text-indigo-400">
                LKR {extraWebSales.toLocaleString("en-LK")}
              </div>
              <div className="text-[11px] text-slate-500">From free public store</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-sky-400 tracking-widest uppercase">
            Simple Transparent Pricing
          </h2>
          <p className="text-3xl font-bold text-white">Choose Your Growth Plan</p>
          <p className="text-slate-400 text-xs">No hidden setup fees. Upgrade or cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-100">Starter Plan</h3>
              <p className="text-xs text-slate-400">Perfect for small single-terminal retail shops.</p>
              <div className="text-3xl font-extrabold text-white font-mono">
                LKR 4,900 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">✓ Single Branch POS</li>
                <li className="flex items-center gap-2">✓ Free Public E-Commerce Website</li>
                <li className="flex items-center gap-2">✓ Up to 1,000 Products</li>
                <li className="flex items-center gap-2">✓ Standard Cash/Card Billing</li>
              </ul>
            </div>

            <Link
              href="/pos"
              className="w-full py-3 rounded-xl font-bold text-xs text-center text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
            >
              Get Started Now
            </Link>
          </div>

          {/* Growth - Popular */}
          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-sky-500 relative flex flex-col justify-between space-y-6 shadow-2xl shadow-sky-500/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase">
              MOST POPULAR 🔥
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">Growth Plan</h3>
              <p className="text-xs text-slate-400">Ideal for growing multi-branch stores & dining.</p>
              <div className="text-3xl font-extrabold text-sky-400 font-mono">
                LKR 9,900 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2 font-semibold text-white">✓ Multi-Branch POS Terminals</li>
                <li className="flex items-center gap-2 font-semibold text-white">✓ Unlimited Product Catalog</li>
                <li className="flex items-center gap-2">✓ Free Public E-Commerce Website</li>
                <li className="flex items-center gap-2">✓ AI Marketing & Social Ads Suite</li>
                <li className="flex items-center gap-2">✓ Google Ads & Meta Pixel Matrix</li>
                <li className="flex items-center gap-2">✓ Restaurant KOT & Repair Job Cards</li>
              </ul>
            </div>

            <Link
              href="/pos"
              className="w-full py-3 rounded-xl font-bold text-xs text-center text-slate-950 bg-gradient-to-r from-sky-400 to-emerald-400 hover:opacity-95 transition shadow-lg shadow-sky-500/20"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-100">Enterprise Plan</h3>
              <p className="text-xs text-slate-400">Custom domain & dedicated infrastructure.</p>
              <div className="text-3xl font-extrabold text-white font-mono">
                LKR 24,900 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">✓ Everything in Growth</li>
                <li className="flex items-center gap-2">✓ Custom Domain Mapping (`shop.com`)</li>
                <li className="flex items-center gap-2">✓ White-Label Reseller Portal</li>
                <li className="flex items-center gap-2">✓ Dedicated Supabase DB Branch</li>
                <li className="flex items-center gap-2">✓ 24/7 Priority Support & SLA</li>
              </ul>
            </div>

            <Link
              href="/pos"
              className="w-full py-3 rounded-xl font-bold text-xs text-center text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 px-6 lg:px-12 py-12 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-300 text-sm">
          <span>MyPoz / GRABBER POS Studio</span>
        </div>
        <p>© {new Date().getFullYear()} MyPoz Commercial SaaS. All rights reserved.</p>
        <p className="text-[11px] text-slate-600">
          Powered by Next.js 16 (React 19 + Turbopack) & Supabase PostgreSQL (Multi-Tenant RLS).
        </p>
      </footer>
    </div>
  );
}
