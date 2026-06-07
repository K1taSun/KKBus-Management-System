"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Calendar, Phone, Eye, EyeOff, Loader2, Bus, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/LanguageContext";
import { apiPost } from "@/lib/api";

const localTranslations = {
  pl: {
    title: "Zarejestruj się",
    subtitle: "Załóż bezpłatne konto pasażera w systemie KKBus",
    firstNameLabel: "Imię",
    firstNamePlaceholder: "np. Jan",
    lastNameLabel: "Nazwisko",
    lastNamePlaceholder: "np. Kowalski",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "np. jan.kowalski@example.pl",
    dobLabel: "Data urodzenia",
    phoneLabel: "Numer telefonu",
    phonePlaceholder: "np. +48600100200",
    passwordLabel: "Hasło",
    passwordPlaceholder: "Min. 8 znaków, wielka litera, cyfra",
    confirmPasswordLabel: "Potwierdź hasło",
    confirmPasswordPlaceholder: "Wpisz hasło ponownie",
    loyaltyLabel: "Chcę dołączyć do programu lojalnościowego KKBus i zbierać punkty",
    registerBtn: "Załóż konto",
    loading: "Trwa rejestracja...",
    haveAccount: "Masz już konto?",
    loginLink: "Zaloguj się",
    errorPasswordsMatch: "Podane hasła nie są identyczne.",
    errorAge: "Rejestracja dozwolona dla osób powyżej 13 roku życia.",
    successTitle: "Rejestracja pomyślna! 🎉",
    successSubtitle: "Twoje konto zostało utworzone. Na podany adres e-mail wysłaliśmy instrukcje aktywacyjne wraz z bezpiecznym tokenem.",
    clientNumberLabel: "Twój unikalny numer klienta:",
    goToLogin: "Przejdź do logowania",
  },
  en: {
    title: "Sign Up",
    subtitle: "Create a free KKBus passenger account",
    firstNameLabel: "First Name",
    firstNamePlaceholder: "e.g. John",
    lastNameLabel: "Last Name",
    lastNamePlaceholder: "e.g. Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g. john.doe@example.com",
    dobLabel: "Date of Birth",
    phoneLabel: "Phone Number",
    phonePlaceholder: "e.g. +48600100200",
    passwordLabel: "Password",
    passwordPlaceholder: "Min. 8 chars, uppercase, digit",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    loyaltyLabel: "I want to join the KKBus loyalty program to earn points",
    registerBtn: "Create Account",
    loading: "Creating account...",
    haveAccount: "Already have an account?",
    loginLink: "Sign In",
    errorPasswordsMatch: "Passwords do not match.",
    errorAge: "You must be at least 13 years old to register.",
    successTitle: "Registration Complete! 🎉",
    successSubtitle: "Your account was created successfully. We have sent an activation email with a secure token to your inbox.",
    clientNumberLabel: "Your unique client number:",
    goToLogin: "Proceed to Sign In",
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loyaltyConsent, setLoyaltyConsent] = useState(true);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClientNumber, setSuccessClientNumber] = useState<string | null>(null);

  useEffect(() => {
    document.title = language === "pl" ? "Rejestracja - KKBus" : "Register - KKBus";
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hasła muszą się zgadzać
    if (password !== confirmPassword) {
      setError(tLocal.errorPasswordsMatch);
      return;
    }

    // Walidacja wieku (min. 13 lat)
    const dob = new Date(dateOfBirth);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 13) {
      setError(tLocal.errorAge);
      return;
    }

    setLoading(true);

    try {
      const res = await apiPost<{ message: string; clientNumber: string }>("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        dateOfBirth,
        phone,
        loyaltyProgramConsent: loyaltyConsent
      });
      
      setSuccessClientNumber(res.clientNumber);
    } catch (err: any) {
      setError(err.message || "Błąd podczas rejestracji.");
    } finally {
      setLoading(false);
    }
  };

  if (successClientNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-primary/95 via-primary to-primary-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <Card className="w-full max-w-lg shadow-2xl border-emerald-100 bg-white/95 backdrop-blur-md rounded-2xl animate-fade-in relative z-10">
          <CardHeader className="text-center space-y-4 pt-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold text-emerald-800">{tLocal.successTitle}</CardTitle>
              <CardDescription className="text-text-muted text-sm px-4">
                {tLocal.successSubtitle}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 text-center">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm inline-block w-full">
              <span className="text-xs text-text-muted font-semibold tracking-wider uppercase block mb-1">
                {tLocal.clientNumberLabel}
              </span>
              <span className="text-2xl font-mono font-bold text-primary tracking-wide">
                {successClientNumber}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pb-10 pt-4 px-8">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {tLocal.goToLogin}
              <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-primary/95 via-primary to-primary-light flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-action/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-action-hover/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <Card className="w-full max-w-xl shadow-2xl border-white/10 bg-white/95 backdrop-blur-md rounded-2xl animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-3 pt-8 pb-5">
          <Link href="/" className="mx-auto w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Bus size={24} />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">{tLocal.title}</CardTitle>
            <CardDescription className="text-text-muted text-sm px-6">{tLocal.subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm text-center border border-red-100 font-medium animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.firstNameLabel}</label>
                <Input
                  type="text"
                  required
                  placeholder={tLocal.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<User className="text-gray-400" size={16} />}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.lastNameLabel}</label>
                <Input
                  type="text"
                  required
                  placeholder={tLocal.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<User className="text-gray-400" size={16} />}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.dobLabel}</label>
                <Input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Calendar className="text-gray-400" size={16} />}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.phoneLabel}</label>
                <Input
                  type="text"
                  required
                  placeholder={tLocal.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Phone className="text-gray-400" size={16} />}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary block">{tLocal.emailLabel}</label>
              <Input
                type="email"
                required
                placeholder={tLocal.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                icon={<Mail className="text-gray-400" size={16} />}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.passwordLabel}</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={tLocal.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-10 h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                    icon={<Lock className="text-gray-400" size={16} />}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary block">{tLocal.confirmPasswordLabel}</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={tLocal.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-action focus:ring-action"
                  icon={<Lock className="text-gray-400" size={16} />}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                id="loyaltyConsent"
                type="checkbox"
                checked={loyaltyConsent}
                onChange={(e) => setLoyaltyConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-action focus:ring-action shrink-0 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="loyaltyConsent" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none">
                {tLocal.loyaltyLabel}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-action hover:bg-action-hover text-white py-6 rounded-xl text-sm font-semibold shadow-md shadow-action/20 transition-all flex items-center justify-center gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {tLocal.loading}
                </>
              ) : (
                <>
                  {tLocal.registerBtn}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 pt-4 border-t border-gray-50 text-center">
          <p className="text-sm text-text-muted">
            {tLocal.haveAccount}{" "}
            <Link href="/login" className="text-action font-semibold hover:underline">
              {tLocal.loginLink}
            </Link>
          </p>
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
