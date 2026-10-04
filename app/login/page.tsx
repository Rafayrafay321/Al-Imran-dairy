// filepath: app/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF9]">
      <main className="flex flex-1 items-center justify-center p-4">
        {/* Mobile-first centered max-w-md container */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
