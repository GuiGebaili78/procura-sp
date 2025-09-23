"use client";

import React from "react";

import { Layout } from "../components/layout/Layout";
import { LinkButton } from "../components/ui/LinkButton";
import { Card } from "../components/ui/Card";

export default function HomePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Procura SP
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto opacity-90">
            Encontre serviços públicos de São Paulo próximos ao seu endereço de
            forma rápida e fácil
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <LinkButton href="/servicos" variant="primary" size="lg">
              🔍 Buscar Serviços
            </LinkButton>
            <LinkButton href="#como-funciona" variant="primary" size="lg">
              📋 Como Funciona
            </LinkButton>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card padding="md" className="text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cata-Bagulho
            </h3>
            <p className="text-gray-600">
              Descubra quando passa a coleta de móveis velhos e eletrodomésticos
              na sua rua
            </p>
          </Card>

          <Card padding="md" className="text-center">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Saúde</h3>
            <p className="text-gray-600">
              Encontre unidades de saúde, postos de vacinação e hospitais
              próximos
            </p>
          </Card>

          <Card padding="md" className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Zeladoria
            </h3>
            <p className="text-gray-600">
              Consulte serviços de manutenção urbana, iluminação e poda de
              árvores
            </p>
          </Card>
        </div>

        {/* How it Works Section */}
        <Card id="como-funciona" padding="lg" className="md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como Funciona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Informe seu Endereço
              </h3>
              <p className="text-gray-600">
                Digite seu CEP e número para encontrarmos sua localização exata
                em São Paulo
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Escolha o Serviço
              </h3>
              <p className="text-gray-600">
                Selecione qual serviço público você deseja consultar na sua
                região
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Visualize os Resultados
              </h3>
              <p className="text-gray-600">
                Veja horários, datas e informações detalhadas com mapa
                interativo
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <LinkButton href="/servicos" variant="primary" size="lg">
              Começar Agora →
            </LinkButton>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💡 Informação Confiável
            </h3>
            <p className="text-gray-600 text-sm">
              Todos os dados são obtidos diretamente dos sistemas oficiais da
              Prefeitura de São Paulo
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
