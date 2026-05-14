import { HeroSection } from "@/components/sections/HeroSection";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { CompletedRoutes } from "@/components/sections/CompletedRoutes";
import { RouteMap } from "@/components/sections/RouteMap";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <ValueProposition />
      <CompletedRoutes />
      <RouteMap />
    </main>
  );
}

