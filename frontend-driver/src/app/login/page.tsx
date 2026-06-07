"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldAlert, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";

export default function DriverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Zabezpieczony Panel Kierowcy - KKBus";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      await apiPost("/auth/login", { email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Brak autoryzacji. Nieprawidłowy identyfikator pracownika lub hasło.");
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
          <div className="mx-auto w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Lock size={28} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">System Zarządzania Flotą</CardTitle>
            <CardDescription className="text-text-muted text-sm font-medium tracking-wide">
              KKBUS SP. Z O.O. – DOSTĘP TYLKO DLA PRACOWNIKÓW
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldAlert size={18} className="shrink-0" />
            <p>Strefa zastrzeżona. Aktywność jest monitorowana.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm text-center border border-red-100 font-medium animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block uppercase tracking-wider text-xs">
                Identyfikator E-mail Kierowcy
              </label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="np. k.nowak@kkbus.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Mail className="text-gray-400" size={18} />}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block uppercase tracking-wider text-xs">
                Hasło Dostępowe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
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
                  TRWA AUTORYZACJA...
                </>
              ) : (
                <>
                  AUTORYZUJ DOSTĘP
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 pb-8 pt-4 border-t border-gray-50 text-center">
          <p className="text-xs text-text-muted">
            Brak konta lub zapomniane hasło?
          </p>
          <p className="text-xs text-text-muted opacity-80">
            Skontaktuj się z Działem IT lub Dyspozytorem.
          </p>
        </CardFooter>
      </Card>

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
