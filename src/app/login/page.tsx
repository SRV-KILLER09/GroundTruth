import { LoginForm } from "@/components/auth/LoginForm";
import { WaveBackground } from "@/components/auth/WaveBackground";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <WaveBackground />
      <div className="relative z-10">
        <LoginForm />
      </div>
    </main>
  );
}
