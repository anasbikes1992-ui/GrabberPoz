import { z } from "zod";
import type { FieldDef } from "./collections";

export interface SettingsSection {
  label: string;
  fields: FieldDef[];
}

/** Business settings, grouped for the Settings screen. */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    label: "Business profile",
    fields: [
      { key: "businessName", label: "Business name", type: "text", full: true },
      { key: "address", label: "Address", type: "textarea", full: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "email" },
      { key: "currency", label: "Currency", type: "text" },
      { key: "timezone", label: "Timezone", type: "text" },
    ],
  },
  {
    label: "Receipt",
    fields: [
      { key: "receiptHeader", label: "Header text", type: "textarea", full: true },
      { key: "receiptFooter", label: "Footer text", type: "textarea", full: true },
      { key: "paperWidth", label: "Paper width", type: "select", options: ["80mm", "58mm"] },
      { key: "showQr", label: "Show QR", type: "select", options: ["Yes", "No"] },
    ],
  },
  {
    label: "Tax",
    fields: [
      { key: "taxPercent", label: "Tax / VAT %", type: "number" },
      { key: "taxInclusive", label: "Prices include tax", type: "select", options: ["Yes", "No"] },
    ],
  },
  {
    label: "Printers (ESC/POS over TCP)",
    fields: [
      { key: "printerKotIp", label: "KOT printer IP", type: "text" },
      { key: "printerBotIp", label: "BOT printer IP", type: "text" },
    ],
  },
  {
    label: "WhatsApp invoices",
    fields: [
      { key: "whatsappCountryCode", label: "Default country code", type: "text" },
    ],
  },
  {
    label: "Loyalty points",
    fields: [
      { key: "pointsPerCurrency", label: "Spend per 1 point (LKR)", type: "number" },
      { key: "pointsValue", label: "1 point = (LKR)", type: "number" },
    ],
  },
];

export const settingsSchema = z.object({
  businessName: z.string().max(160).default("GRABBER POS Store"),
  address: z.string().max(300).default(""),
  phone: z.string().max(40).default(""),
  email: z.string().max(120).default(""),
  currency: z.string().max(10).default("LKR"),
  timezone: z.string().max(60).default("Asia/Colombo"),
  receiptHeader: z.string().max(300).default(""),
  receiptFooter: z.string().max(300).default("Thank you — come again!"),
  paperWidth: z.enum(["80mm", "58mm"]).default("80mm"),
  showQr: z.enum(["Yes", "No"]).default("No"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  taxInclusive: z.enum(["Yes", "No"]).default("Yes"),
  printerKotIp: z.string().max(60).default(""),
  printerBotIp: z.string().max(60).default(""),
  whatsappCountryCode: z.string().max(5).default("94"),
  pointsPerCurrency: z.coerce.number().min(1).default(100),
  pointsValue: z.coerce.number().min(0).default(1),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});
