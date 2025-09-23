// Mock do axios para testes

interface MockAxiosResponse<T = unknown> {
  data: T
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

interface MockAxiosInstance {
  get: jest.Mock
  post: jest.Mock
  put: jest.Mock
  delete: jest.Mock
  patch: jest.Mock
  defaults: {
    headers: Record<string, Record<string, unknown>>
  }
  interceptors: {
    request: { use: jest.Mock; eject: jest.Mock }
    response: { use: jest.Mock; eject: jest.Mock }
  }
}

interface MockAxios extends MockAxiosInstance {
  create: jest.Mock<MockAxiosInstance>
  isAxiosError: jest.Mock<boolean>
}

const axios: MockAxios = {
  get: jest.fn((): Promise<MockAxiosResponse> => Promise.resolve({ data: {} })),
  post: jest.fn((): Promise<MockAxiosResponse> => Promise.resolve({ data: {} })),
  put: jest.fn((): Promise<MockAxiosResponse> => Promise.resolve({ data: {} })),
  delete: jest.fn((): Promise<MockAxiosResponse> => Promise.resolve({ data: {} })),
  patch: jest.fn((): Promise<MockAxiosResponse> => Promise.resolve({ data: {} })),
  create: jest.fn((): MockAxiosInstance => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    defaults: {
      headers: {
        common: {},
        get: {},
        post: {},
        put: {},
        patch: {},
        delete: {},
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  })),
  isAxiosError: jest.fn((value: unknown): value is Error => value instanceof Error),
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      patch: {},
      delete: {},
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
}

export default axios
