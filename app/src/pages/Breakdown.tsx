import { GLSLHills } from '@/components/ui/glsl-hills';

export default function Breakdown() {
  return (
    <div className="relative min-h-screen w-full bg-white">
      <div className="absolute inset-0 z-0"><GLSLHills /></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 text-zinc-900">
        <h1 className="text-4xl font-bold">How it works</h1>
        <div className="mt-12 max-w-2xl space-y-6 text-left">
          <div className="rounded-xl border border-zinc-200 bg-white/90 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">1. Share your business</h2>
            <p className="mt-2 text-zinc-600">Tell us about your business in a short chat. We'll ask about your industry, team, and goals.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white/90 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">2. Choose your plan</h2>
            <p className="mt-2 text-zinc-600">Pick Business Plan Only, Starter System, or Full Business System depending on what you need.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white/90 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">3. Pay and generate</h2>
            <p className="mt-2 text-zinc-600">Complete payment with Paystack. We generate your documents and you download them as a ZIP.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
