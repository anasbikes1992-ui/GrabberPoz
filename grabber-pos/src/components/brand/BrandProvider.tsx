"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { DEFAULT_TENANT, type Brand, type License } from "@/lib/plans";

interface BrandState {
  brand: Brand;
  license: License;
  enabledKeys: Set<string>;
  expired: boolean;
  loading: boolean;
  refresh: () => void;
}

const BrandCtx = createContext<BrandState>({
  brand: DEFAULT_TENANT.brand,
  license: DEFAULT_TENANT.license,
  enabledKeys: new Set(),
  expired: false,
  loading: true,
  refresh: () => undefined,
});

export function useBrand() {
  return useContext(BrandCtx);
}

/** Applies the accent colour to the design tokens live. */
function applyAccent(color: string) {
  const root = document.documentElement;
  if (color) {
    root.style.setProperty("--accent", color);
    root.style.setProperty("--accent-strong", color);
  } else {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-strong");
  }
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<BrandState, "refresh">>({
    brand: DEFAULT_TENANT.brand,
    license: DEFAULT_TENANT.license,
    enabledKeys: new Set(),
    expired: false,
    loading: true,
  });

  const refresh = useCallback(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) return;
        applyAccent(j.data.brand.accentColor);
        setState({
          brand: j.data.brand,
          license: j.data.license,
          enabledKeys: new Set<string>(j.data.enabledKeys),
          expired: !!j.data.expired,
          loading: false,
        });
      })
      .catch(() => setState((s) => ({ ...s, loading: false })));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <BrandCtx.Provider value={{ ...state, refresh }}>
      {children}
    </BrandCtx.Provider>
  );
}
