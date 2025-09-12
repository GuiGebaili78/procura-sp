import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import db from '../../../lib/database';

export async function POST() {
  try {
    console.log('🔄 Iniciando importação dos estabelecimentos...');
    
    // Caminho para o arquivo JSON
    const jsonPath = path.join(process.cwd(), 'public', 'dados_saude', 'estabelecimentos.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { error: "Arquivo JSON não encontrado" },
        { status: 404 }
      );
    }
    
    // Ler dados JSON
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Total de registros para importar: ${jsonData.length}`);
    
    // Usar db diretamente
    
    // Limpar tabela existente
    await db.query('DELETE FROM estabelecimentos_saude');
    console.log('🧹 Tabela limpa');
    
    let imported = 0;
    let errors = 0;
    
    // Processar cada registro
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Converter coordenadas (dividir por 1.000.000)
        const lat = parseFloat(String(row.LAT).replace(',', '.')) / 1000000;
        const lng = parseFloat(String(row.LONG).replace(',', '.')) / 1000000;
        
        // Validar coordenadas
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          console.log(`⚠️ Registro ${i + 1} com coordenadas inválidas, pulando...`);
          errors++;
          continue;
        }
        
        // Mapear esfera administrativa
        let esfera = 'Privado'; // Padrão
        if (row.DEPADM) {
          const depadm = row.DEPADM.toLowerCase();
          if (depadm.includes('municipal')) esfera = 'Municipal';
          else if (depadm.includes('estadual')) esfera = 'Estadual';
          else if (depadm.includes('privado')) esfera = 'Privado';
        }
        
        // Inserir no banco
        await db.query(`
          INSERT INTO estabelecimentos_saude (
            id, nome, tipo, endereco, bairro, regiao, cep, 
            latitude, longitude, esfera_administrativa
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          row.ID || null,
          row.ESTABELECIMENTO || 'Nome não informado',
          row.TIPO || 'Estabelecimento de Saúde',
          row.ENDERECO || 'Endereço não informado',
          row.BAIRRO || 'Bairro não informado',
          row.REGIAO || 'Região não informada',
          row.CEP || '00000-000',
          lat,
          lng,
          esfera
        ]);
        
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`📊 Importados: ${imported}/${jsonData.length}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar registro ${i + 1}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Importação concluída!`);
    console.log(`📊 Total importado: ${imported}`);
    console.log(`❌ Erros: ${errors}`);
    
    // Verificar dados importados
    const result = await db.query('SELECT COUNT(*) as total FROM estabelecimentos_saude');
    const total = result.rows[0]?.total || 0;
    
    return NextResponse.json({
      success: true,
      imported,
      errors,
      total,
      successRate: ((imported / jsonData.length) * 100).toFixed(1) + '%'
    });
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
