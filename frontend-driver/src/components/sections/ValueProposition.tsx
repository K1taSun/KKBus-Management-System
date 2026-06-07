"use client";

import { Wifi, Sofa, Plug, Leaf } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

export function ValueProposition() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Wifi size={40} className="text-action" />,
      title: t("val.wifi"),
      description: t("val.wifiDesc"),
    },
    {
      icon: <Sofa size={40} className="text-action" />,
      title: t("val.seats"),
      description: t("val.seatsDesc"),
    },
    {
      icon: <Plug size={40} className="text-action" />,
      title: t("val.power"),
      description: t("val.powerDesc"),
    },
    {
      icon: <Leaf size={40} className="text-action" />,
      title: t("val.eco"),
      description: t("val.ecoDesc"),
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background-main">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t("val.title")}</h2>
          <p className="text-lg text-text-muted">
            {t("val.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-background-alt rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-text-main mb-3">{benefit.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

