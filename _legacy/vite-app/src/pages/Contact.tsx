import { GLSLHills } from '@/components/ui/glsl-hills';

export default function Contact() {
  return (
    <div className="relative min-h-screen w-full bg-white">
      <div className="absolute inset-0 z-0"><GLSLHills /></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 text-zinc-900">
        <h1 className="text-4xl font-bold">Contact us</h1>
        <p className="mt-4 text-zinc-600">Questions or feedback? Message us below.</p>
        <iframe
          src="https://adparlay.com/form/WWstusrHtdKRLVdCA9FN"
          className="mt-8 h-[500px] w-full max-w-2xl rounded-xl border-0 shadow-lg"
          title="Contact form"
        />
      </div>
    </div>
  );
}
