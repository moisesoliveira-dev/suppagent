import { describe, expect, it } from 'vitest'
import { PencilIcon, TrashIcon } from './icons'

describe('action icons', () => {
  it('exporta ícones de editar e excluir', () => {
    expect(typeof PencilIcon).toBe('function')
    expect(typeof TrashIcon).toBe('function')
  })
})
