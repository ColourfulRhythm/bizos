export default function Contact() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16">
      <h1 className="text-4xl font-bold text-zinc-900">Contact us</h1>
      <p className="mt-4 text-zinc-600">Questions or feedback? Message us below.</p>
      <iframe
        src="https://adparlay.com/form/WWstusrHtdKRLVdCA9FN"
        className="mt-8 h-[500px] w-full max-w-2xl rounded-xl border-0 shadow-lg"
        title="Contact form"
      />
    </div>
  );
}
