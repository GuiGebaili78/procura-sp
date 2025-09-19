/**
 * Teste REAL de Conexão com Banco de Dados
 * 
 * Este teste NÃO usa mocks e realmente tenta conectar com o PostgreSQL.
 * Deve FALHAR quando o Docker estiver offline.
 * 
 * ⚠️ IMPORTANTE: Este teste requer o banco de dados rodando!
 */

// NÃO mockar o database - queremos conexão real
import database from '@/lib/database'

describe('Teste REAL de Conexão com Banco', () => {
  // Timeout maior para conexão real
  jest.setTimeout(10000)

  describe('Conexão Real com PostgreSQL', () => {
    it('deve conectar com o banco de dados real', async () => {
      // Este teste DEVE falhar se o Docker estiver offline
      const result = await database.query('SELECT 1 as test')
      
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].test).toBe(1)
    })

    it('deve verificar se tabelas existem', async () => {
      // Verificar se as tabelas principais existem
      const result = await database.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('cep_cache', 'catabagulho_cache', 'feiras_cache', 'coleta_lixo_cache', 'estabelecimentos_saude')
        ORDER BY table_name
      `)
      
      expect(result.rows).toBeDefined()
      expect(Array.isArray(result.rows)).toBe(true)
      
      // Verificar se pelo menos algumas tabelas existem
      const tableNames = result.rows.map(row => row.table_name)
      expect(tableNames.length).toBeGreaterThan(0)
    })

    it('deve executar query real de estabelecimentos', async () => {
      // Query real na tabela de estabelecimentos
      const result = await database.query(`
        SELECT COUNT(*) as total 
        FROM estabelecimentos_saude 
        WHERE ativo = true
      `)
      
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].total).toBeDefined()
      expect(Number(result.rows[0].total)).toBeGreaterThan(0)
    })

    it('deve testar performance de query espacial', async () => {
      const startTime = Date.now()
      
      // Query espacial real (sem PostGIS por enquanto)
      const result = await database.query(`
        SELECT id, nome, tipo, endereco, bairro, regiao, cep, latitude, longitude, esfera_administrativa
        FROM estabelecimentos_saude 
        WHERE ativo = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        LIMIT 5
      `)
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      expect(result.rows).toBeDefined()
      expect(Array.isArray(result.rows)).toBe(true)
      expect(executionTime).toBeLessThan(5000) // Menos de 5 segundos
    })

    it('deve testar cache de CEP', async () => {
      // Teste básico de query (cache não implementado ainda)
      const testCep = '01310-100'
      
      // Verificar se conseguimos fazer uma query simples
      const result = await database.query(`
        SELECT COUNT(*) as total
        FROM estabelecimentos_saude 
        WHERE cep LIKE $1
      `, [`%${testCep.replace('-', '')}%`])
      
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].total).toBeDefined()
    })
  })

  describe('Tratamento de Erros Reais', () => {
    it('deve tratar erro de query inválida', async () => {
      await expect(
        database.query('SELECT * FROM tabela_inexistente')
      ).rejects.toThrow()
    })

    it('deve tratar erro de parâmetros inválidos', async () => {
      await expect(
        database.query('SELECT * FROM estabelecimentos_saude WHERE id = $1', ['texto_invalido'])
      ).rejects.toThrow()
    })
  })

  describe('Performance e Estatísticas', () => {
    it('deve obter estatísticas reais do banco', async () => {
      const stats = await database.query(`
        SELECT 
          (SELECT COUNT(*) FROM estabelecimentos_saude WHERE ativo = true) as total_estabelecimentos,
          (SELECT COUNT(*) FROM estabelecimentos_saude WHERE ativo = true AND esfera_administrativa = 'Municipal') as municipais,
          (SELECT COUNT(*) FROM estabelecimentos_saude WHERE ativo = true AND esfera_administrativa = 'Estadual') as estaduais,
          (SELECT COUNT(*) FROM estabelecimentos_saude WHERE ativo = true AND esfera_administrativa = 'Privado') as privados
      `)
      
      expect(stats.rows).toHaveLength(1)
      const stat = stats.rows[0]
      
      expect(Number(stat.total_estabelecimentos)).toBeGreaterThan(0)
      expect(Number(stat.municipais)).toBeGreaterThanOrEqual(0)
      expect(Number(stat.estaduais)).toBeGreaterThanOrEqual(0)
      expect(Number(stat.privados)).toBeGreaterThanOrEqual(0)
    })
  })
})
