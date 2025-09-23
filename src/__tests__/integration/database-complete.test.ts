import database from '@/lib/database';

describe('Database - Integração Completa', () => {
  describe('Conexão com Banco', () => {
    it('deve conectar com o banco de dados', async () => {
      const result = await database.query('SELECT 1 as test');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test).toBe(1);
    });

    it('deve verificar se tabelas existem', async () => {
      const result = await database.query(`
        SELECT tablename FROM pg_catalog.pg_tables
        WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      const tableNames = result.rows.map((row: { tablename: string }) => row.tablename);
      expect(tableNames).toContain('estabelecimentos_saude');
    });
  });

  describe('Estabelecimentos de Saúde', () => {
    it('deve buscar estabelecimentos ativos', async () => {
      const result = await database.query(`
        SELECT COUNT(*) as total 
        FROM estabelecimentos_saude 
        WHERE ativo = true
      `);
      
      expect(result.rows).toHaveLength(1);
      expect(Number(result.rows[0].total)).toBeGreaterThan(0);
    });

    it('deve filtrar por tipo de estabelecimento', async () => {
      const result = await database.query(`
        SELECT tipo, COUNT(*) as total
        FROM estabelecimentos_saude 
        WHERE ativo = true
        GROUP BY tipo
        ORDER BY total DESC
        LIMIT 5
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row: { tipo: string; total: string }) => {
        expect(row.tipo).toBeDefined();
        expect(Number(row.total)).toBeGreaterThan(0);
      });
    });

    it('deve filtrar por esfera administrativa', async () => {
      const result = await database.query(`
        SELECT esfera_administrativa, COUNT(*) as total
        FROM estabelecimentos_saude 
        WHERE ativo = true
        GROUP BY esfera_administrativa
        ORDER BY total DESC
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row: { esfera_administrativa: string; total: string }) => {
        expect(row.esfera_administrativa).toBeDefined();
        expect(Number(row.total)).toBeGreaterThan(0);
      });
    });
  });

  describe('Queries Espaciais', () => {
    it('deve buscar estabelecimentos com coordenadas', async () => {
      const result = await database.query(`
        SELECT id, nome, latitude, longitude
        FROM estabelecimentos_saude 
        WHERE ativo = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row: { latitude: string; longitude: string }) => {
        expect(row.latitude).toBeDefined();
        expect(row.longitude).toBeDefined();
        expect(typeof row.latitude).toBe('string');
        expect(typeof row.longitude).toBe('string');
      });
    });

    it('deve calcular distâncias (query básica)', async () => {
      const result = await database.query(`
        SELECT 
          id,
          nome,
          latitude,
          longitude,
          SQRT(
            POWER(CAST(latitude AS FLOAT) - (-23.5505), 2) + 
            POWER(CAST(longitude AS FLOAT) - (-46.6333), 2)
          ) as distancia_aproximada
        FROM estabelecimentos_saude 
        WHERE ativo = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        ORDER BY distancia_aproximada
        LIMIT 5
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row: { distancia_aproximada: string }) => {
        expect(row.distancia_aproximada).toBeDefined();
        expect(Number(row.distancia_aproximada)).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('deve executar queries em tempo razoável', async () => {
      const startTime = Date.now();
      
      await database.query(`
        SELECT COUNT(*) as total
        FROM estabelecimentos_saude 
        WHERE ativo = true
      `);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(5000); // Menos de 5 segundos
    });

    it('deve executar query complexa em tempo razoável', async () => {
      const startTime = Date.now();
      
      await database.query(`
        SELECT 
          tipo,
          esfera_administrativa,
          COUNT(*) as total,
          AVG(CAST(latitude AS FLOAT)) as lat_media,
          AVG(CAST(longitude AS FLOAT)) as lng_media
        FROM estabelecimentos_saude 
        WHERE ativo = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        GROUP BY tipo, esfera_administrativa
        ORDER BY total DESC
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(10000); // Menos de 10 segundos
    });
  });
});






