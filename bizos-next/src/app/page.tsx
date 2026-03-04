"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8">
      <h1 className="text-center text-3xl font-semibold text-zinc-900 md:text-4xl">
        Good day, Let&apos;s make your business profitable.
      </h1>

      <div className="mt-8 w-full max-w-2xl rounded-2xl border border-stone-200/60 bg-white/90 shadow-xl backdrop-blur overflow-hidden">
        <div className="max-h-[280px] overflow-y-auto p-4">
          <p className="text-zinc-500 text-sm">Share your business name to get started.</p>
        </div>
        <div className="border-t border-stone-200/60 p-4 flex-shrink-0">
          <div className="flex gap-2">
            <label className="flex cursor-pointer items-center rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100">
              📎 Upload
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's your business name?"
              className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500"
            />
            <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
              Send
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        For full chat, payment & generation, use the Vite app in <code className="rounded bg-zinc-100 px-1">/app</code> or configure your API URL.
      </p>
    </div>
  );
}
