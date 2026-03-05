import { GLSLHills } from '@/components/ui/glsl-hills';
import { PRODUCTS } from '@/lib/config';

export default function Pricing() {
  return (
    <div className="relative min-h-screen w-full bg-white">
      <div className="absolute inset-0 z-0"><GLSLHills /></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 text-zinc-900">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-2 text-zinc-600">Choose the plan that fits your business.</p>
        <div className="mt-12 grid max-w-3xl gap-6 md:grid-cols-3">
          {(['plan', 'starter', 'full'] as const).map((k) => {
            const p = PRODUCTS[k.toUpperCase() as keyof typeof PRODUCTS];
            const desc = 'description' in p ? (p as { description?: string }).description : '';
            return (
              <div key={k} className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-lg backdrop-blur">
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-2 text-3xl font-bold text-amber-600">{p.priceDisplay}</p>
                {desc && <p className="mt-4 text-sm text-zinc-600">{desc}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
