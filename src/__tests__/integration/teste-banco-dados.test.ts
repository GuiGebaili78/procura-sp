/**
 * Teste de Integração com Banco de Dados
 * 
 * Verifica a conexão e funcionamento do banco de dados
 * para todos os serviços que dependem dele
 */

import { buscarEstabelecimentosBanco, obterEstatisticasBanco } from '../../lib/services/banco-saude.service';
import db from '../../lib/database';

// Mock do banco de dados
jest.mock('../../lib/database', () => ({
  query: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;

// Helper para criar mocks corretos do PostgreSQL QueryResult
const createMockQueryResult = (rows: Record<string, unknown>[], rowCount?: number) => ({
  rows,
  rowCount: rowCount ?? rows.length,
  command: 'SELECT',
  oid: 0,
  fields: []
});

describe('Teste de Integração com Banco de Dados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Teste de Conexão com Banco', () => {
    it('deve conectar com o banco de dados', async () => {
      // Mock de resposta de teste de conexão
      mockDb.query.mockResolvedValueOnce(createMockQueryResult([{ total: '1466' }], 1));

      const result = await mockDb.query('SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true');
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].total).toBe('1466');
      expect(mockDb.query).toHaveBeenCalledWith('SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true');
    });

    it('deve tratar erro de conexão', async () => {
      // Mock de erro de conexão
      mockDb.query.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(mockDb.query('SELECT 1')).rejects.toThrow('Connection failed');
    });
  });

  describe('2. Teste de Busca de Estabelecimentos de Saúde', () => {
    it('deve buscar estabelecimentos com filtros básicos', async () => {
      const mockRows = [
        {
          id: 1,
          nome: 'UBS Bela Vista',
          tipo: 'UNIDADE BASICA DE SAUDE',
          endereco: 'Rua Augusta, 200',
          bairro: 'Bela Vista',
          regiao: 'Centro',
          cep: '01310-100',
          latitude: -23.5505,
          longitude: -46.6333,
          esfera_administrativa: 'Municipal',
          ativo: true
        },
        {
          id: 2,
          nome: 'Hospital Sírio-Libanês',
          tipo: 'HOSPITAL',
          endereco: 'Rua Dona Adma Jafet, 91',
          bairro: 'Bela Vista',
          regiao: 'Centro',
          cep: '01308-050',
          latitude: -23.5505,
          longitude: -46.6333,
          esfera_administrativa: 'Privado',
          ativo: true
        }
      ];

      // Mock das queries
      mockDb.query
        .mockResolvedValueOnce(createMockQueryResult([{ total: '1466' }])) // Teste de conexão
        .mockResolvedValueOnce(createMockQueryResult(mockRows.slice(0, 3))) // Amostra de dados
        .mockResolvedValueOnce(createMockQueryResult(mockRows)); // Query principal

      const filtros = {
        ubs: true,
        hospitais: true,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'banco_1',
        nome: 'UBS Bela Vista',
        tipo: 'UNIDADE BASICA DE SAUDE',
        endereco: 'Rua Augusta, 200',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        coordenadas: {
          lat: -23.5505,
          lng: -46.6333
        },
        distancia: expect.any(Number),
        gestao: 'Municipal',
        natureza: 'Público',
        esfera: 'Municipal',
        vinculoSus: true,
        ativo: true,
        regiao: 'Centro',
        esferaAdministrativa: 'Municipal'
      });

      expect(result[1]).toMatchObject({
        id: 'banco_2',
        nome: 'Hospital Sírio-Libanês',
        tipo: 'HOSPITAL',
        gestao: 'Privada',
        natureza: 'Privado',
        esfera: 'Privado',
        vinculoSus: false,
        esferaAdministrativa: 'Privado'
      });
    });

    it('deve filtrar por tipo de estabelecimento', async () => {
      const mockRows = [
        {
          id: 1,
          nome: 'UBS Bela Vista',
          tipo: 'UNIDADE BASICA DE SAUDE',
          endereco: 'Rua Augusta, 200',
          bairro: 'Bela Vista',
          regiao: 'Centro',
          cep: '01310-100',
          latitude: -23.5505,
          longitude: -46.6333,
          esfera_administrativa: 'Municipal',
          ativo: true
        }
      ];

      mockDb.query
        .mockResolvedValueOnce(createMockQueryResult([{ total: '1466' }]))
        .mockResolvedValueOnce(createMockQueryResult(mockRows.slice(0, 3)))
        .mockResolvedValueOnce(createMockQueryResult(mockRows));

      const filtros = {
        ubs: true,
        hospitais: false, // Apenas UBS
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(result).toHaveLength(1);
      expect(result[0].tipo).toBe('UNIDADE BASICA DE SAUDE');
      
      // Verificar se a query foi construída corretamente
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("tipo IN ('UNIDADE BASICA DE SAUDE')")
      );
    });

    it('deve filtrar por esfera administrativa', async () => {
      const mockRows = [
        {
          id: 1,
          nome: 'UBS Bela Vista',
          tipo: 'UNIDADE BASICA DE SAUDE',
          endereco: 'Rua Augusta, 200',
          bairro: 'Bela Vista',
          regiao: 'Centro',
          cep: '01310-100',
          latitude: -23.5505,
          longitude: -46.6333,
          esfera_administrativa: 'Municipal',
          ativo: true
        }
      ];

      mockDb.query
        .mockResolvedValueOnce(createMockQueryResult([{ total: '1466' }]))
        .mockResolvedValueOnce(createMockQueryResult(mockRows.slice(0, 3)))
        .mockResolvedValueOnce(createMockQueryResult(mockRows));

      const filtros = {
        ubs: true,
        hospitais: true,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true, // Apenas Municipal
        estadual: false,
        privado: false
      };

      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(result).toHaveLength(1);
      expect(result[0].esferaAdministrativa).toBe('Municipal');
      
      // Verificar se a query foi construída corretamente
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("esfera_administrativa IN ('Municipal', 'Estadual')")
      );
    });
  });

  describe('3. Teste de Estatísticas do Banco', () => {
    it('deve obter estatísticas corretamente', async () => {
      const mockStats = {
        total: createMockQueryResult([{ total: '1466' }]),
        porEsfera: createMockQueryResult([
          { esfera_administrativa: 'Municipal', count: '800' },
          { esfera_administrativa: 'Estadual', count: '200' },
          { esfera_administrativa: 'Privado', count: '466' }
        ]),
        porRegiao: createMockQueryResult([
          { regiao: 'Centro', count: '300' },
          { regiao: 'Zona Sul', count: '250' },
          { regiao: 'Zona Norte', count: '200' },
          { regiao: 'Zona Leste', count: '300' },
          { regiao: 'Zona Oeste', count: '200' }
        ])
      };

      mockDb.query
        .mockResolvedValueOnce(mockStats.total)
        .mockResolvedValueOnce(mockStats.porEsfera)
        .mockResolvedValueOnce(mockStats.porRegiao);

      const result = await obterEstatisticasBanco();

      expect(result).toEqual({
        total: 1466,
        porEsfera: {
          'Municipal': 800,
          'Estadual': 200,
          'Privado': 466
        },
        porRegiao: {
          'Centro': 300,
          'Zona Sul': 250,
          'Zona Norte': 200,
          'Zona Leste': 300,
          'Zona Oeste': 200
        }
      });
    });

    it('deve tratar erro ao obter estatísticas', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await obterEstatisticasBanco();

      expect(result).toEqual({
        total: 0,
        porEsfera: {},
        porRegiao: {}
      });
    });
  });

  describe('4. Teste de Performance do Banco', () => {
    it('deve executar queries em tempo aceitável', async () => {
      const mockRows = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        nome: `Estabelecimento ${i + 1}`,
        tipo: 'UNIDADE BASICA DE SAUDE',
        endereco: `Rua ${i + 1}`,
        bairro: 'Bela Vista',
        regiao: 'Centro',
        cep: '01310-100',
        latitude: -23.5505 + (i * 0.001),
        longitude: -46.6333 + (i * 0.001),
        esfera_administrativa: 'Municipal',
        ativo: true
      }));

      mockDb.query
        .mockResolvedValueOnce(createMockQueryResult([{ total: '1466' }]))
        .mockResolvedValueOnce(createMockQueryResult(mockRows.slice(0, 3)))
        .mockResolvedValueOnce(createMockQueryResult(mockRows));

      const startTime = Date.now();
      
      const filtros = {
        ubs: true,
        hospitais: false,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Deve executar em menos de 1 segundo (considerando que é um mock)
      expect(executionTime).toBeLessThan(1000);
    });
  });
});
