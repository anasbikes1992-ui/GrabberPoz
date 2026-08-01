// AUTO-VENDORED from D:\grabber-shared\packages\lk-payments-client - DO NOT EDIT HERE.
// Edit the source and re-run D:\grabber-shared\sync-payments.ps1.

/**
 * lk-payments-client â€” the thin, browser-safe client vendored into each app.
 *
 * Contains NO secrets and NO gateway logic. It only calls the shared
 * `create-checkout` edge function and carries the user to whatever the gateway
 * needs (a redirect URL, or an auto-submitting form). All signing and
 * verification happen server-side in the edge functions.
 *
 * This file is the single source of truth. `sync-payments.ps1` copies it into:
 *   grabber-pos\src\lib\payments\
 *   Grabber Jarvis Consultant\src\lib\payments\
 *   PEARL-HUB-PRO-main\src\lib\payments\
 * Do not edit the copies â€” edit here and re-run the sync.
 */

export type AppKey = "pos" | "jarvis" | "pearlhub";
export type CurrencyCode = "LKR" | "USD";
export type ProviderKey = "WEBXPAY" | "PAYHERE" | "ONEPAY" | "LANKAPAY" | "STRIPE";

export interface StartCheckoutInput {
  app: AppKey;
  reference: string;
  amountMinor: number; // cents
  currency: CurrencyCode;
  description: string;
  customer: { name: string; email: string; phone?: string };
  returnUrl: string;
  cancelUrl: string;
  provider?: ProviderKey; // optional override; otherwise the server picks
  ownerId?: string;
}

interface CheckoutResponse {
  provider: ProviderKey;
  mode: "redirect" | "form";
  url?: string;
  formAction?: string;
  formFields?: Record<string, string>;
  error?: string;
}

export interface PaymentsClientOptions {
  /** Supabase Edge Functions base, e.g. https://<ref>.functions.supabase.co */
  functionsUrl: string;
  /** Supabase anon key (public â€” safe in the browser). */
  anonKey: string;
  /** Optional signed-in user access token, for owner attribution + RLS. */
  accessToken?: string;
}

export class PaymentsClient {
  constructor(private readonly opts: PaymentsClientOptions) {}

  /**
   * Start a payment. On success this REDIRECTS the browser to the gateway (URL)
   * or auto-submits a POST form to it. It does not return on the happy path.
   * Throws on a configuration/validation error so the caller can show a message.
   */
  async startCheckout(input: StartCheckoutInput): Promise<never | void> {
    const res = await fetch(`${this.opts.functionsUrl}/create-checkout`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: this.opts.anonKey,
        authorization: `Bearer ${this.opts.accessToken ?? this.opts.anonKey}`,
      },
      body: JSON.stringify(input),
    });

    const data = (await res.json().catch(() => ({}))) as CheckoutResponse;
    if (!res.ok || data.error) {
      throw new Error(data.error ?? `Checkout failed (${res.status})`);
    }

    if (data.mode === "redirect") {
      if (!data.url) throw new Error("Gateway returned no redirect URL");
      window.location.assign(data.url);
      return;
    }

    if (data.mode === "form") {
      if (!data.formAction || !data.formFields) throw new Error("Gateway returned an incomplete form");
      submitHiddenForm(data.formAction, data.formFields);
      return;
    }

    throw new Error(`Unexpected checkout mode: ${(data as { mode?: string }).mode}`);
  }
}

/** Build and submit a hidden POST form (WebXPay/PayHere hosted checkout). */
function submitHiddenForm(action: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

