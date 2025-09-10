import { SignupForm } from "@/components/auth/SignupForm";
import { WaveBackground } from "@/components/auth/WaveBackground";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <WaveBackground />
      <div className="relative z-10">
        <SignupForm />
      </div>
    </main>
  );
}
