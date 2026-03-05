// Empty string = same origin; Next.js API routes at /api/*
export const API_BASE = "";

export const PAYSTACK_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  "pk_live_65167bc2839df9c0dc11ca91e608ce2635abf44b";

export const PRODUCTS = {
  PLAN: {
    name: "Business Plan Only",
    priceKobo: 500000,
    priceDisplay: "₦5,000",
    tier: "plan" as const,
    description: "One-page comprehensive business plan",
  },
  STARTER: {
    name: "Starter System",
    priceKobo: 800000,
    priceDisplay: "₦8,000",
    tier: "starter" as const,
    description: "3 folders with 10 strategic documents",
  },
  FULL: {
    name: "Full Business System",
    priceKobo: 2500000,
    priceDisplay: "₦25,000",
    tier: "full" as const,
    description: "7 folders with 24–30 documents",
  },
};
