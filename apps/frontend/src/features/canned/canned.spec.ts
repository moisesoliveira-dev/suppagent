import { describe, expect, it } from 'vitest'
import { categoryLabel } from './canned'

describe('canned helpers', () => {
  it('rotula categorias', () => {
    expect(categoryLabel('todas')).toBe('todas')
    expect(categoryLabel('saudacao')).toBe('saudação')
    expect(categoryLabel('acesso')).toBe('acesso')
  })
})
