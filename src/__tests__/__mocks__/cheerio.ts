// Mock do cheerio para testes
interface CheerioElement {
  find: jest.Mock
  text: jest.Mock
  html: jest.Mock
  attr: jest.Mock
  each: jest.Mock
  filter: jest.Mock
  length: number
}

const createMockElement = (): CheerioElement => ({
  find: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnValue(''),
  html: jest.fn().mockReturnValue(''),
  attr: jest.fn().mockReturnValue(''),
  each: jest.fn(),
  filter: jest.fn().mockReturnThis(),
  length: 0,
})

interface MockCheerioStatic extends CheerioElement {
  fn: CheerioElement
}

const mockCheerio = {
  load: jest.fn((): MockCheerioStatic => {
    const $ = jest.fn(() => createMockElement()) as unknown as MockCheerioStatic
    
    // Adicionar métodos do $ diretamente
    Object.assign($, createMockElement())
    $.fn = createMockElement()
    
    return $
  }),
}

export default mockCheerio
export const load = mockCheerio.load
