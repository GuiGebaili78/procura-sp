// Função para simular o parsing do HTML (versão simplificada para testes)
function parseHTML(html: string) {
  const results: Array<{
    street: string;
    startStretch?: string;
    endStretch?: string;
    dates: string[];
    frequency: string;
    shift: string;
    schedule: string;
    trechos?: string[];
  }> = [];

  console.log(`[Debug] HTML length: ${html.length}`);
  
  // Debug: verificar se há conteúdo relevante no HTML
  const hasResults = html.includes("panel") || html.includes("logradouro") || html.includes("detalhes");
  console.log(`[Debug] HTML contém elementos esperados: ${hasResults}`);

  // Verificar se há mensagem de não atendimento
  const hasNaoAtendido = html.includes("Endereço não atendido pela LOCAT SP") || 
                        html.includes("não atendido") ||
                        html.includes("não possui cobertura");
  
  if (hasNaoAtendido) {
    console.log('[Debug] Detectada mensagem de não atendimento');
    return []; // Retorna array vazio para indicar não atendimento
  }

  // Simular parsing de painéis usando regex (versão simplificada para testes)
  const panelMatches = html.match(/<div class="panel panel-default">[\s\S]*?<\/div>/g);
  
  if (!panelMatches) {
    console.log('[Debug] Nenhum painel encontrado');
    return [];
  }

        panelMatches.forEach((panelHtml) => {
    try {
      // Extrair nome da rua usando regex
      const streetMatch = panelHtml.match(/<strong>([^<]+)<\/strong>/);
      if (!streetMatch) return;

      const streetName = streetMatch[1].trim();
      console.log(`[Debug] Processando painel: ${streetName}`);

      // Extrair início e fim
      const startMatch = panelHtml.match(/Início:\s*([^<\n]+)/);
      const endMatch = panelHtml.match(/Fim:\s*([^<\n]+)/);
      const startStretch = startMatch ? startMatch[1].trim() : undefined;
      const endStretch = endMatch ? endMatch[1].trim() : undefined;

      // Extrair frequência
      const freqMatch = panelHtml.match(/Freq\.:<\/div>\s*<div[^>]*>([^<]+)<\/div>/);
      const frequency = freqMatch ? freqMatch[1].trim() : '';

      // Extrair turno
      const turnoMatch = panelHtml.match(/Turno:<\/div>\s*<div[^>]*>([^<]+)<\/div>/);
      const shift = turnoMatch ? turnoMatch[1].trim() : '';

      // Extrair horário
      const horarioMatch = panelHtml.match(/Horário:<\/div>\s*<div[^>]*>([^<]+)<\/div>/);
      const schedule = horarioMatch ? horarioMatch[1].trim() : '';

      // Extrair datas
      const diasMatch = panelHtml.match(/Dias:<\/div>\s*<div[^>]*>([^<]+)<\/div>/);
      const dates: string[] = [];
      if (diasMatch) {
        const dateMatches = diasMatch[1].match(/\d{2}\/\d{2}\/\d{4}/g);
        if (dateMatches) {
          dates.push(...dateMatches);
        }
      }

      // Extrair trechos
      const trechoMatches = panelHtml.match(/trecho="([^"]+)"/g);
      const trechos: string[] = [];
      if (trechoMatches) {
            trechoMatches.forEach(match => {
          const trechoId = match.match(/trecho="([^"]+)"/)?.[1];
          if (trechoId) trechos.push(trechoId);
        });
      }

      console.log(`[Debug] Dados extraídos para ${streetName}:`, {
        startStretch,
        endStretch,
        frequency,
        shift,
        schedule,
        datesCount: dates.length,
        trechosCount: trechos.length,
        firstTrecho: trechos[0],
      });

      if (streetName) {
        results.push({
          street: streetName,
          startStretch,
          endStretch,
          dates,
          frequency,
          shift,
          schedule,
          trechos: trechos.length > 0 ? trechos : undefined,
        });
      }
    } catch (error) {
      console.error("Erro ao processar painel:", error);
    }
  });

  console.log(`[Cata-Bagulho] Encontrados ${results.length} resultados`);
  return results;
}

describe('Cata-Bagulho HTML Parsing', () => {
  describe('Detecção de "Endereço não atendido"', () => {
    it('deve detectar quando o endereço não é atendido pela LOCAT SP', () => {
      // HTML simulado com mensagem de não atendimento
      const htmlNaoAtendido = `
        <html>
          <body>
            <div class="container">
              <div class="alert alert-warning">
                <strong>Endereço não atendido pela LOCAT SP para o serviço: Cata-bagulho</strong>
              </div>
              <p>O endereço informado não possui cobertura para este serviço.</p>
            </div>
          </body>
        </html>
      `;

      const results = parseHTML(htmlNaoAtendido);

      expect(results).toHaveLength(0); // Deve retornar array vazio
    });

    it('deve detectar HTML vazio ou sem painéis', () => {
      // HTML vazio ou sem estrutura esperada
      const htmlVazio = `
        <html>
          <body>
            <div class="container">
              <p>Nenhum resultado encontrado para esta localização.</p>
            </div>
          </body>
        </html>
      `;

      const results = parseHTML(htmlVazio);

      expect(results).toHaveLength(0); // Deve retornar array vazio
    });

    it('deve processar HTML com resultados válidos', () => {
      // HTML com estrutura válida de resultados
      const htmlComResultados = `
        <html>
          <body>
            <div class="panel panel-default">
              <div class="logradouro">
                <strong>Rua Augusta</strong>
                <br>Início: Avenida Paulista
                <br>Fim: Rua da Consolação
              </div>
              <div class="detalhes">
                <div class="row">
                  <div class="col-xs-3">Freq.:</div>
                  <div class="col-xs-9">Quinzenal</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Turno:</div>
                  <div class="col-xs-9">Manhã</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Horário:</div>
                  <div class="col-xs-9">07:00 às 12:00</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Dias:</div>
                  <div class="col-xs-9">15/01/2024, 29/01/2024</div>
                </div>
              </div>
              <button class="btn-ver-trecho" trecho="12345">Ver trecho</button>
            </div>
          </body>
        </html>
      `;

      const results = parseHTML(htmlComResultados);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        street: 'Rua Augusta',
        startStretch: 'Avenida Paulista',
        endStretch: 'Rua da Consolação',
        frequency: 'Quinzenal',
        shift: 'Manhã',
        schedule: '07:00 às 12:00',
        dates: ['15/01/2024', '29/01/2024'],
        trechos: ['12345']
      });
    });

    it('deve detectar diferentes variações da mensagem de não atendimento', () => {
      const variacoes = [
        'Endereço não atendido pela LOCAT SP para o serviço: Cata-bagulho',
        'Este endereço não é atendido pela LOCAT SP',
        'O endereço informado não possui cobertura para este serviço',
        'Não há cobertura para este endereço'
      ];

      variacoes.forEach((mensagem) => {
        const html = `
          <html>
            <body>
              <div class="container">
                <div class="alert alert-warning">
                  <strong>${mensagem}</strong>
                </div>
              </div>
            </body>
          </html>
        `;

        const results = parseHTML(html);
        expect(results).toHaveLength(0); // Deve retornar array vazio para todas as variações
      });
    });

    it('deve processar múltiplos painéis com resultados válidos', () => {
      const htmlMultiplosResultados = `
        <html>
          <body>
            <div class="panel panel-default">
              <div class="logradouro">
                <strong>Rua Augusta</strong>
                <br>Início: Avenida Paulista
                <br>Fim: Rua da Consolação
              </div>
              <div class="detalhes">
                <div class="row">
                  <div class="col-xs-3">Freq.:</div>
                  <div class="col-xs-9">Quinzenal</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Turno:</div>
                  <div class="col-xs-9">Manhã</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Horário:</div>
                  <div class="col-xs-9">07:00 às 12:00</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Dias:</div>
                  <div class="col-xs-9">15/01/2024, 29/01/2024</div>
                </div>
              </div>
              <button class="btn-ver-trecho" trecho="12345">Ver trecho</button>
            </div>
            <div class="panel panel-default">
              <div class="logradouro">
                <strong>Rua da Consolação</strong>
                <br>Início: Avenida Paulista
                <br>Fim: Rua Augusta
              </div>
              <div class="detalhes">
                <div class="row">
                  <div class="col-xs-3">Freq.:</div>
                  <div class="col-xs-9">Semanal</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Turno:</div>
                  <div class="col-xs-9">Tarde</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Horário:</div>
                  <div class="col-xs-9">13:00 às 17:00</div>
                </div>
                <div class="row">
                  <div class="col-xs-3">Dias:</div>
                  <div class="col-xs-9">20/01/2024, 27/01/2024</div>
                </div>
              </div>
              <button class="btn-ver-trecho" trecho="67890">Ver trecho</button>
            </div>
          </body>
        </html>
      `;

      const results = parseHTML(htmlMultiplosResultados);

      expect(results).toHaveLength(2);
      expect(results[0].street).toBe('Rua Augusta');
      expect(results[1].street).toBe('Rua da Consolação');
      expect(results[0].trechos).toEqual(['12345']);
      expect(results[1].trechos).toEqual(['67890']);
    });
  });
});
