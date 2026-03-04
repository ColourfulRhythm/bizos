import { GLSLHills } from '@/components/ui/glsl-hills';

export default function Info() {
  return (
    <div className="relative min-h-screen w-full bg-white">
      <div className="absolute inset-0 z-0"><GLSLHills /></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 text-zinc-900">
        <h1 className="text-4xl font-bold">About BizOS</h1>
        <p className="mt-6 max-w-xl text-center text-zinc-600">
          BizOS uses AI to create professional business documentation tailored to your business. 
          Get investor-ready business plans and operating systems in minutes, not weeks.
        </p>
      </div>
    </div>
  );
}
