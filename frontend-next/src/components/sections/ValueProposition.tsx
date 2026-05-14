import { Wifi, Sofa, Plug, Leaf } from "lucide-react";

const benefits = [
  {
    icon: <Wifi size={40} className="text-action" />,
    title: "Darmowe Wi-Fi",
    description: "Szybki internet na pokładzie pozwala pracować lub oglądać filmy przez całą podróż.",
  },
  {
    icon: <Sofa size={40} className="text-action" />,
    title: "Wygodne fotele",
    description: "Dużo miejsca na nogi i regulowane oparcia gwarantują relaks nawet na długich trasach.",
  },
  {
    icon: <Plug size={40} className="text-action" />,
    title: "Gniazdka i USB",
    description: "Ładuj swoje urządzenia w trakcie jazdy dzięki gniazdkom 230V i portom USB przy każdym fotelu.",
  },
  {
    icon: <Leaf size={40} className="text-action" />,
    title: "Ekologiczna podróż",
    description: "Nasze nowoczesne autokary spełniają najwyższe normy emisji spalin, dbając o środowisko.",
  },
];

export function ValueProposition() {
  return (
    <section className="py-20 md:py-32 bg-background-main">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Dlaczego warto wybrać KKBus?</h2>
          <p className="text-lg text-text-muted">
            Stawiamy na najwyższy komfort i bezpieczeństwo. Zobacz, co przygotowaliśmy dla Ciebie na pokładzie.
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
