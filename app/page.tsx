import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero"
import { ProblemaSection } from "@/components/landing/problema"
import { SolucaoSection } from "@/components/landing/solucao"
import { DiferenciaisSection } from "@/components/landing/diferenciais"
import { ProdutoSection } from "@/components/landing/produto"
import { ComoFuncionaSection } from "@/components/landing/como-funciona"
import { CtaSection } from "@/components/landing/cta"
import { FooterSection } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProblemaSection />
      <SolucaoSection />
      <DiferenciaisSection />
      <ProdutoSection />
      <ComoFuncionaSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
