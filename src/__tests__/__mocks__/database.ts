// Mock do database para testes
interface QueryResult {
  rows: unknown[]
  rowCount: number
  fields: unknown[]
  command: string
}

interface MockClient {
  query: jest.Mock
  release: jest.Mock
}

const mockClient: MockClient = {
  query: jest.fn(),
  release: jest.fn(),
}

const database = {
  query: jest.fn((): Promise<QueryResult> => 
    Promise.resolve({
      rows: [],
      rowCount: 0,
      fields: [],
      command: 'SELECT',
    })
  ),
  
  getClient: jest.fn((): Promise<MockClient> => 
    Promise.resolve(mockClient)
  ),
}

export default database

// Helper para resetar os mocks
export const resetDatabaseMocks = (): void => {
  database.query.mockClear()
  database.getClient.mockClear()
  mockClient.query.mockClear()
  mockClient.release.mockClear()
}

// Helper para configurar mocks específicos
export const mockDatabaseQuery = (result: Partial<QueryResult>): void => {
  database.query.mockResolvedValue({
    rows: [],
    rowCount: 0,
    fields: [],
    command: 'SELECT',
    ...result,
  })
}

export const mockDatabaseError = (error: Error): void => {
  database.query.mockRejectedValue(error)
}
