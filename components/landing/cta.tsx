import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #0077b6 0%, #00a8a8 100%)" }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-white/30" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full border border-white/20" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
          Pronto para transformar sua gestao comercial?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto text-pretty">
          Agende uma demonstracao personalizada e descubra como o Fluig Board pode elevar a maturidade da sua operacao comercial com inteligencia e governanca.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center justify-center gap-3 rounded-lg px-10 py-5 text-lg font-semibold bg-white text-[#0077b6] hover:bg-white/90 transition-colors shadow-xl hover:shadow-2xl"
        >
          Agendar Demonstracao
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
