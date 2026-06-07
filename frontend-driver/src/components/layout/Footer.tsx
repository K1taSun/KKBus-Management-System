"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/LanguageContext";

export function Footer() {
  const { t } = useTranslation();

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
              {t("footer.desc")}
            </p>

          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">{t("nav.info")}</h4>
            <ul className="space-y-4">
              <li><Link href="/rozklad-jazdy" className="text-text-muted hover:text-action transition-colors">{t("footer.timetable")}</Link></li>
              <li><Link href="/przystanki" className="text-text-muted hover:text-action transition-colors">{t("footer.stopsAndMaps")}</Link></li>
              <li><Link href="/cennik" className="text-text-muted hover:text-action transition-colors">{t("footer.pricing")}</Link></li>
              <li><Link href="/regulamin" className="text-text-muted hover:text-action transition-colors">{t("footer.terms")}</Link></li>
              <li><Link href="/faq" className="text-text-muted hover:text-action transition-colors">{t("footer.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">{t("footer.company")}</h4>
            <ul className="space-y-4">
              <li><Link href="/informacje" className="text-text-muted hover:text-action transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link href="/kontakt" className="text-text-muted hover:text-action transition-colors">{t("footer.contact")}</Link></li>
              <li><Link href="/biuro-prasowe" className="text-text-muted hover:text-action transition-colors">{t("footer.press")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main mb-6">{t("footer.payments")}</h4>
            <div className="flex gap-2 flex-wrap mb-6">
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">BLIK</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">MC</div>
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold text-gray-500">P24</div>
            </div>
            <h4 className="font-semibold text-text-main mb-4 mt-6">{t("footer.trust")}</h4>
            <p className="text-sm text-text-muted">
              {t("footer.certificate")}
            </p>
          </div>

        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col items-center justify-center gap-4 text-sm text-text-muted text-center">
          <p className="font-medium text-gray-500">
            {t("footer.project")}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 mt-2">
            <p>© {new Date().getFullYear()} KKBus Sp. z o.o. {t("footer.rights")}</p>
            <div className="flex gap-6">
              <Link href="/polityka-prywatnosci" className="hover:text-action transition-colors">{t("footer.privacy")}</Link>
              <Link href="/cookies" className="hover:text-action transition-colors">{t("footer.cookies")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

