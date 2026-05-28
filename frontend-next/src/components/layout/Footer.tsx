import Link from "next/link";
import { MessageCircle, Mail, Globe, Hash } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background-main border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-primary tracking-tight">
                KK<span className="text-action">Bus</span>
              </span>
            </div>
            <p className="text-text-muted mb-6">
              Nowoczesne linie autokarowe na trasie Kraków ↔ Katowice. Podróżuj bezpiecznie, wygodnie i zawsze na czas.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-action transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-action transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-action transition-colors"><Hash size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-action transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">Informacje</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-text-muted hover:text-action transition-colors">Rozkład jazdy</Link></li>
              <li><Link href="#" className="text-text-muted hover:text-action transition-colors">Przystanki i mapy</Link></li>
              <li><Link href="/cennik" className="text-text-muted hover:text-action transition-colors">Cennik biletów</Link></li>
              <li><Link href="/regulamin" className="text-text-muted hover:text-action transition-colors">Regulamin przewozów</Link></li>
              <li><Link href="/faq" className="text-text-muted hover:text-action transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">Firma</h4>
            <ul className="space-y-4">
              <li><Link href="/informacje" className="text-text-muted hover:text-action transition-colors">O nas</Link></li>
              <li><Link href="/kariera" className="text-text-muted hover:text-action transition-colors">Kariera</Link></li>
              <li><Link href="/dla-kierowcow" className="text-text-muted hover:text-action transition-colors">Dla kierowców</Link></li>
              <li><Link href="/kontakt" className="text-text-muted hover:text-action transition-colors">Kontakt</Link></li>
              <li><Link href="/biuro-prasowe" className="text-text-muted hover:text-action transition-colors">Biuro prasowe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">Metody płatności</h4>
            <div className="flex gap-2 flex-wrap mb-6">
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">BLIK</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">MC</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">P24</div>
            </div>
            <h4 className="font-semibold text-text-main mb-4 mt-6">Zaufanie</h4>
            <p className="text-sm text-text-muted">
              Certyfikat Bezpiecznego Przewoźnika 2026.
            </p>
          </div>

        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col items-center justify-center gap-4 text-sm text-text-muted text-center">
          <p className="font-medium text-gray-500">
            Projekt realizowany w ramach: Katedra Informatyki Stosowanej M-7, Wydział Mechaniczny, Politechnika Krakowska im. T. Kościuszki
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 mt-2">
            <p>© {new Date().getFullYear()} KKBus Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-action transition-colors">Polityka prywatności</Link>
              <Link href="#" className="hover:text-action transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
