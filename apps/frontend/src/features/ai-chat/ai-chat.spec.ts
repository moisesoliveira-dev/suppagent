import { describe, expect, it } from 'vitest'
import { AiChatView } from './AiChatView'

describe('AiChatView', () => {
  it('exporta a view do chat com a ia', () => {
    expect(typeof AiChatView).toBe('function')
  })
})
