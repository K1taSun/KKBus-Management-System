"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ShoppingCart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
          <Link href="#" className="text-white hover:text-action transition-colors text-sm font-medium">Rozkład jazdy</Link>
          <Link href="#" className="text-white hover:text-action transition-colors text-sm font-medium">Przystanki</Link>
          <Link href="/cennik" className="text-white hover:text-action transition-colors text-sm font-medium">Cennik</Link>
          <Link href="/informacje" className="text-white hover:text-action transition-colors text-sm font-medium">Informacje</Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-white hover:text-action transition-colors" aria-label="Zmień język">
            <Globe size={20} />
          </button>
          <button className="text-white hover:text-action transition-colors" aria-label="Zaloguj się">
            <User size={20} />
          </button>
          <button className="text-white hover:text-action transition-colors" aria-label="Koszyk">
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
            <Link href="#" className="text-2xl font-medium text-white hover:text-action">Rozkład jazdy</Link>
            <Link href="#" className="text-2xl font-medium text-white hover:text-action">Przystanki</Link>
            <Link href="/cennik" className="text-2xl font-medium text-white hover:text-action">Cennik</Link>
            <Link href="/informacje" className="text-2xl font-medium text-white hover:text-action">Informacje</Link>
          </nav>
          <div className="mt-auto mb-10 flex flex-col gap-4">
            <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-primary justify-center gap-2">
              <User size={18} /> Zaloguj się
            </Button>
            <Button variant="default" className="w-full justify-center gap-2 bg-action hover:bg-action-hover text-white">
              <ShoppingCart size={18} /> Mój koszyk
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
