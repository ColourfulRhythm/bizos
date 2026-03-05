"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { API_BASE, PRODUCTS, PAYSTACK_KEY } from "@/lib/config";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { buildBusinessPlanDocxBlob, buildDocxBlob, type BizData } from "@/lib/docx-builder";
import JSZip from "jszip";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: { custom_fields: { display_name: string; variable_name: string; value: string }[] };
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

type Phase = "chat" | "plans" | "generating" | "done";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PRODUCT_KEYS = ["PLAN", "STARTER", "FULL"] as const;
type ProductKey = (typeof PRODUCT_KEYS)[number];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bizData, setBizData] = useState<Record<string, unknown>>({});
  const [phase, setPhase] = useState<Phase>("chat");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState("");
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages, bizData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || res.statusText);
      }

      const data = await res.json();
      setBizData(data.bizData || bizData);

      if (data.text) {
        setMessages((m) => [...m, { role: "assistant", content: data.text }]);
      }
      if (data.readyForPlan) {
        setPhase("plans");
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, bizData]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 3072) {
      setUploadedFile(file);
    } else if (file) {
      alert("File must be 3KB or less. Please use a shorter text file.");
    }
    e.target.value = "";
  }, []);

  const mapBizDataForGenerate = useCallback(
    (): Record<string, unknown> => ({
      name: bizData.name,
      industry: bizData.industry,
      description: bizData.description,
      country: bizData.country || "Nigeria",
      city: bizData.city,
      salesChannel: bizData.salesChannel || bizData.marketing || "Multiple channels",
      delivery: bizData.delivery || bizData.description,
      paymentModel: bizData.paymentModel || "Full payment upfront",
      bizSize: bizData.bizSize || "Small team (2–10)",
      customer: bizData.customer || bizData.targetMarket,
      existingDocs: bizData.existingDocs || "None",
      products: bizData.products || bizData.description,
      brandTone: bizData.brandTone || "Professional & formal",
    }),
    [bizData]
  );

  const buildPlanZip = useCallback(
    async (overridePaymentRef?: string): Promise<Blob> => {
      const ref = overridePaymentRef ?? paymentRef;
      const uploadedFileContent = uploadedFile
        ? await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res((r.result as string) || "");
            r.onerror = rej;
            r.readAsText(uploadedFile);
          })
        : null;

      const body = {
        businessData: { ...bizData, paymentReference: ref },
        uploadedFileContent,
      };

      const res = await fetch(`${API_BASE}/api/generate-business-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || (err as { message?: string }).message || "Failed to generate business plan"
        );
      }

      const data = await res.json();
      const planDoc = data.plan || { sections: data.sections || [] };

      const docxBlob = await buildBusinessPlanDocxBlob(planDoc, bizData as BizData);
      const zip = new JSZip();
      const bizName = (bizData.name as string) || "Business";
      zip.file(`${bizName.replace(/\s+/g, "_")}_Business_Plan.docx`, docxBlob);
      return zip.generateAsync({ type: "blob" });
    },
    [bizData, uploadedFile, paymentRef]
  );

  const generateFullZip = useCallback(
    async (overridePaymentRef?: string): Promise<Blob> => {
      const ref = overridePaymentRef ?? paymentRef;
      const uploadedFileContent = uploadedFile
        ? await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res((r.result as string) || "");
            r.onerror = rej;
            r.readAsText(uploadedFile);
          })
        : null;

      const businessData = { ...mapBizDataForGenerate(), paymentReference: ref };

      setGenProgress("Generating document plan…");
      const genRes = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessData, uploadedFileContent }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || (err as { message?: string }).message || "Failed to generate plan"
        );
      }

      const genData = await genRes.json();
      const folders = genData.plan?.folders || [];

      const zip = new JSZip();
      const bizName = ((bizData.name as string) || "Business").replace(/[^a-z0-9]/gi, "_");

      for (let fi = 0; fi < folders.length; fi++) {
        const folder = folders[fi];
        const folderName = `${String(fi + 1).padStart(2, "0")} - ${folder.name}`;
        setGenProgress(`Generating ${folder.name} (${fi + 1}/${folders.length})…`);

        for (const doc of folder.docs || []) {
          try {
            const docxBlob = await buildDocxBlob(doc, bizData as BizData);
            zip
              .folder(bizName)!
              .folder(folderName)!
              .file(`${(doc.filename || doc.title || "doc").toString().replace(/\s+/g, "_")}.docx`, docxBlob);
          } catch (e) {
            console.warn("Doc generation failed:", doc.title, e);
          }
        }
      }

      return zip.generateAsync({ type: "blob" });
    },
    [bizData, uploadedFile, paymentRef, mapBizDataForGenerate]
  );

  const runGeneration = useCallback(
    async (productKey: ProductKey, ref?: string) => {
      const refToUse = ref ?? paymentRef;
      if (!refToUse) {
        setGenError("Payment reference missing.");
        return;
      }
      setPaymentRef(refToUse);
      setPhase("generating");
      setGenError(null);
      setGenProgress("Starting…");

      try {
        const blob =
          productKey === "PLAN" ? await buildPlanZip(refToUse) : await generateFullZip(refToUse);

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setPhase("done");
        setGenProgress("");
      } catch (err) {
        setGenError(err instanceof Error ? err.message : "Generation failed");
        setPhase("plans");
        setGenProgress("");
      }
    },
    [paymentRef, buildPlanZip, generateFullZip]
  );

  const startPayment = useCallback(
    (productKey: ProductKey) => {
      if (!PAYSTACK_KEY || PAYSTACK_KEY.includes("YOUR_")) {
        setGenError("Paystack is not configured.");
        return;
      }
      const emailVal = email.trim() || (bizData.email as string) || "";
      if (!emailVal || !emailVal.includes("@")) {
        setGenError("Please enter your email address.");
        return;
      }

      const product = PRODUCTS[productKey];
      const ref = `BIZOS_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      if (typeof window.PaystackPop === "undefined") {
        setGenError("Paystack is loading. Please wait and try again.");
        return;
      }

      const handler = window.PaystackPop!.setup({
        key: PAYSTACK_KEY,
        email: emailVal,
        amount: product.priceKobo,
        currency: "NGN",
        ref,
        metadata: {
          custom_fields: [
            { display_name: "Business Name", variable_name: "business_name", value: (bizData.name as string) || "N/A" },
            { display_name: "Customer Name", variable_name: "customer_name", value: emailVal.split("@")[0] },
          ],
        },
        callback: (response) => {
          setPaymentRef(response.reference);
          setBizData((prev) => ({ ...prev, paymentReference: response.reference }));
          runGeneration(productKey, response.reference);
        },
        onClose: () => {},
      });
      handler.openIframe();
    },
    [email, bizData, runGeneration]
  );

  const summary =
    bizData.name || bizData.industry ? (
      <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/80 p-3 text-sm text-stone-700">
        <strong>Summary:</strong> {String(bizData.name || "")}
        {bizData.industry != null ? ` · ${String(bizData.industry)}` : null}
      </div>
    ) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <GLSLHills />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {phase === "chat" && (
        <>
          <h1 className="text-center text-3xl font-semibold text-zinc-900 md:text-4xl">
            Good day, Let&apos;s make your business profitable.
          </h1>

          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-stone-200/60 bg-white/90 shadow-xl backdrop-blur overflow-hidden">
            <div className="max-h-[280px] overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-3 ${m.role === "user" ? "ml-8 text-right" : "mr-8 text-left"}`}
                >
                  <div
                    className={`inline-block max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                      m.role === "user" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-800"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-3 mr-8 text-left">
                  <div className="inline-block rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-600">…</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {summary}

            <div className="border-t border-stone-200/60 p-4 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
                >
                  {uploadedFile ? uploadedFile.name : "📎 Upload"}
                </label>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type your message…"
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {phase === "plans" && (
        <div className="mt-8 w-full max-w-2xl rounded-2xl border border-stone-200/60 bg-white/90 p-6 shadow-xl backdrop-blur">
          <h2 className="mb-4 font-serif text-xl font-semibold text-stone-900">Great! Here are your options</h2>
          {genError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{genError}</div>
          )}
          <div className="mb-4">
            <label className="mb-1 block text-sm text-stone-600">Your email</label>
            <input
              type="email"
              value={email || (bizData.email as string) || ""}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(PRODUCTS) as ProductKey[]).map((key) => {
              const p = PRODUCTS[key];
              return (
                <div
                  key={key}
                  className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 transition hover:border-amber-300"
                >
                  <h3 className="font-medium text-stone-900">{p.name}</h3>
                  <p className="mt-1 text-2xl font-semibold text-amber-700">{p.priceDisplay}</p>
                  <p className="mt-2 text-xs text-stone-600">{p.description}</p>
                  <button
                    onClick={() => startPayment(key)}
                    disabled={!PAYSTACK_KEY || PAYSTACK_KEY.includes("YOUR_")}
                    className="mt-4 w-full rounded-lg bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                  >
                    Pay {p.priceDisplay}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "generating" && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-stone-200/60 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="mt-4 text-stone-600">{genProgress || "Generating…"}</p>
          {genError && <p className="mt-2 text-sm text-red-600">{genError}</p>}
        </div>
      )}

      {phase === "done" && downloadUrl && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-stone-200/60 bg-white/90 p-8 shadow-xl backdrop-blur">
          <p className="text-lg font-medium text-stone-900">Your documents are ready!</p>
          <a
            href={downloadUrl}
            download={`${(bizData.name as string) || "BizOS"}_Business_System.zip`}
            className="mt-4 rounded-xl bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
          >
            Download ZIP
          </a>
        </div>
      )}
      </div>
    </div>
  );
}
