"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ShoppingCart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";
import { apiGet } from "@/lib/api";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, language, toggleLanguage } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    apiGet("/auth/profile")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled || !isHomePage
          ? "bg-primary shadow-md py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <span className="text-2xl font-bold text-white tracking-tight">
            KK<span className="text-action">Bus</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/rozklad-jazdy" className="text-white hover:text-action transition-colors text-sm font-medium">{t("nav.timetable")}</Link>
          <Link href="/przystanki" className="text-white hover:text-action transition-colors text-sm font-medium">{t("nav.stops")}</Link>
          <Link href="/cennik" className="text-white hover:text-action transition-colors text-sm font-medium">{t("nav.pricing")}</Link>
          <Link href="/informacje" className="text-white hover:text-action transition-colors text-sm font-medium">{t("nav.info")}</Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleLanguage} 
            className="text-white hover:text-action transition-colors flex items-center gap-1.5 font-semibold text-xs uppercase" 
            aria-label={t("nav.changeLang")}
            title={t("nav.changeLang")}
          >
            <Globe size={18} />
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{language}</span>
          </button>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="text-white hover:text-action transition-colors" aria-label={isLoggedIn ? t("nav.profile") : t("nav.login")} title={isLoggedIn ? t("nav.profile") : t("nav.login")}>
            <User size={20} />
          </Link>
          <button className="text-white hover:text-action transition-colors" aria-label={t("nav.cart")} title={t("nav.cart")}>
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Drawer */}
        <div
          className={cn(
            "fixed inset-0 bg-primary z-40 flex flex-col pt-24 px-6 transition-transform duration-300 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-6 text-center">
            <Link href="/rozklad-jazdy" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-white hover:text-action">{t("nav.timetable")}</Link>
            <Link href="/przystanki" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-white hover:text-action">{t("nav.stops")}</Link>
            <Link href="/cennik" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-white hover:text-action">{t("nav.pricing")}</Link>
            <Link href="/informacje" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-white hover:text-action">{t("nav.info")}</Link>
            <button
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 text-white hover:text-action transition-colors py-2 text-2xl font-medium"
            >
              <Globe size={24} /> <span className="uppercase">{language === "pl" ? "English" : "Polski"}</span>
            </button>
          </nav>
          <div className="mt-auto mb-10 flex flex-col gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-primary justify-center gap-2">
                <User size={18} /> {isLoggedIn ? t("nav.profile") : t("nav.login")}
              </Button>
            </Link>
            <Button variant="default" className="w-full justify-center gap-2 bg-action hover:bg-action-hover text-white">
              <ShoppingCart size={18} /> {t("nav.myCart")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

