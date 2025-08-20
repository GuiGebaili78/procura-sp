export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏢</span>
              <span className="text-xl font-bold">Procura SP</span>
            </div>
            <p className="text-gray-400 text-sm">
              Facilitando o acesso aos serviços públicos de São Paulo.
              Encontre informações sobre coleta de lixo, cata-bagulho e muito mais.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>🚛 Cata-Bagulho</li>
              <li>🗑️ Coleta de Lixo</li>
              <li>🏥 Saúde Pública</li>
              <li>💉 Vacinação</li>
              <li>🐕 Bem-estar Animal</li>
              <li>🔧 Zeladoria Urbana</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Informações</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 São Paulo, SP</li>
              <li>🌐 Dados da Prefeitura de SP</li>
              <li>🕒 Atualizado diariamente</li>
              <li>📱 Interface responsiva</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            © 2024 Procura SP. Projeto educacional utilizando dados públicos da Prefeitura de São Paulo.
          </p>
          <p className="mt-2">
            by Guilherme Gebaili.
          </p>
        </div>
      </div>
    </footer>
  );
}