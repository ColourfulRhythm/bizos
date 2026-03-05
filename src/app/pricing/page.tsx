export default function Pricing() {
  const products = [
    { name: "Business Plan Only", price: "₦5,000", desc: "One-page comprehensive business plan" },
    { name: "Starter System", price: "₦8,000", desc: "3 folders with 10 strategic documents" },
    { name: "Full Business System", price: "₦25,000", desc: "7 folders with 24–30 documents" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16">
      <h1 className="text-4xl font-bold text-zinc-900">Pricing</h1>
      <p className="mt-2 text-zinc-600">Choose the plan that fits your business.</p>
      <div className="mt-12 grid max-w-3xl gap-6 md:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="mt-2 text-3xl font-bold text-amber-600">{p.price}</p>
            <p className="mt-4 text-sm text-zinc-600">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
