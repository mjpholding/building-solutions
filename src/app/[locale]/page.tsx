import SaturnHero from "@/components/sections/SaturnHero";
import StatsSection from "@/components/sections/StatsSection";
import ProcessSection from "@/components/sections/ProcessSection";
import IndustriesSection from "@/components/sections/IndustriesSection";
import PartnersSection from "@/components/sections/PartnersSection";
import CTASection from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <SaturnHero />
      <StatsSection />
      <ProcessSection />
      <IndustriesSection />
      <PartnersSection />
      <CTASection />
    </>
  );
}
