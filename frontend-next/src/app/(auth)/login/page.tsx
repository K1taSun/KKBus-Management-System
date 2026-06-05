"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, Bus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/LanguageContext";
import { apiPost } from "@/lib/api";

const localTranslations = {
  pl: {
    title: "Zaloguj się",
    subtitle: "Zarządzaj swoimi biletami i punktami lojalnościowymi",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "np. jan.kowalski@example.pl",
    passwordLabel: "Hasło",
    passwordPlaceholder: "Wprowadź hasło",
    loginBtn: "Zaloguj się",
    loading: "Trwa logowanie...",
    noAccount: "Nie masz jeszcze konta?",
    registerLink: "Zarejestruj się",
    errorDefault: "Błędny e-mail lub hasło.",
    backToHome: "Powrót do strony głównej",
  },
  en: {
    title: "Sign In",
    subtitle: "Manage your tickets and loyalty points",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g. john.doe@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginBtn: "Sign In",
    loading: "Signing in...",
    noAccount: "Don't have an account?",
    registerLink: "Sign Up",
    errorDefault: "Invalid email or password.",
    backToHome: "Back to Home",
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = language === "pl" ? "Logowanie - KKBus" : "Login - KKBus";
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      await apiPost("/auth/login", { email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || tLocal.errorDefault);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-primary/95 via-primary to-primary-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-action/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-action-hover/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-white/10 bg-white/95 backdrop-blur-md rounded-2xl animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <Link href="/" className="mx-auto w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Bus size={28} />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">{tLocal.title}</CardTitle>
            <CardDescription className="text-text-muted text-sm">{tLocal.subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm text-center border border-red-100 font-medium animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block">{tLocal.emailLabel}</label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder={tLocal.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Mail className="text-gray-400" size={18} />}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-primary block">{tLocal.passwordLabel}</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={tLocal.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Lock className="text-gray-400" size={18} />}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-action hover:bg-action-hover text-white py-6 rounded-xl text-sm font-semibold shadow-md shadow-action/20 transition-all flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {tLocal.loading}
                </>
              ) : (
                <>
                  {tLocal.loginBtn}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 pt-4 border-t border-gray-50 text-center">
          <p className="text-sm text-text-muted">
            {tLocal.noAccount}{" "}
            <Link href="/register" className="text-action font-semibold hover:underline">
              {tLocal.registerLink}
            </Link>
          </p>
          <Link href="/" className="text-xs text-text-muted hover:text-primary hover:underline transition-colors">
            {tLocal.backToHome}
          </Link>
        </CardFooter>
      </Card>

      {/* Fade-in animation style */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
