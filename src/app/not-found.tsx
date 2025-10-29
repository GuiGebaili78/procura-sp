import React from "react";
import Link from "next/link";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col gradient-primary">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          {/* Ícone 404 */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-white/20 mb-4">404</div>
            <div className="text-6xl mb-6">🔍</div>
          </div>

          {/* Mensagem */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Página Não Encontrada
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← Voltar para Home
            </Link>
            <Link
              href="/buscar"
              className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Buscar Serviços
            </Link>
          </div>

          {/* Sugestões */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">
              Você pode estar procurando por:
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/servicos"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                📋 Serviços
              </Link>
              <Link
                href="/buscar?service=cata-bagulho"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                🚛 Cata-Bagulho
              </Link>
              <Link
                href="/buscar?service=feiras-livres"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                🍎 Feiras Livres
              </Link>
              <Link
                href="/buscar?service=coleta-lixo"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                🗑️ Coleta de Lixo
              </Link>
              <Link
                href="/buscar?service=saude"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                🏥 Saúde Pública
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

