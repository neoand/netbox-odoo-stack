/**
 * Tests for Helpers Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatCurrency,
  formatRelativeTime,
  truncate,
  capitalize,
  debounce,
  sleep,
  deepClone,
  deepEqual,
  isEmpty,
  formatFileSize,
  generateId,
} from '~/utils/helpers'

describe('Helpers Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-12-06')
      const result = formatDate(date, 'pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      expect(result).toBe('6 de dezembro de 2025')
    })

    it('should return empty string for invalid date', () => {
      const result = formatDate('invalid' as any)
      expect(result).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1000, 'BRL', 'pt-BR')
      expect(result).toBe('R$ 1.000,00')
    })

    it('should return string for invalid value', () => {
      const result = formatCurrency(NaN)
      expect(typeof result).toBe('string')
    })
  })

  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const date = new Date(Date.now() - 3600000) // 1 hour ago
      const result = formatRelativeTime(date)
      expect(result).toBe('há 1 hora')
    })

    it('should return "agora mesmo" for recent dates', () => {
      const date = new Date()
      const result = formatRelativeTime(date)
      expect(result).toBe('agora mesmo')
    })
  })

  describe('truncate', () => {
    it('should truncate text with ellipsis', () => {
      const text = 'This is a very long text that needs to be truncated'
      const result = truncate(text, 20)
      expect(result).toBe('This is a very lo...')
    })

    it('should return original text if length is within limit', () => {
      const text = 'Short text'
      const result = truncate(text, 20)
      expect(result).toBe('Short text')
    })

    it('should use custom suffix', () => {
      const text = 'This is long'
      const result = truncate(text, 5, '...')
      expect(result).toBe('Th...')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(capitalize(null as any)).toBe('')
      expect(capitalize(undefined as any)).toBe('')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0
      const debouncedFn = debounce(() => {
        callCount++
      }, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(callCount).toBe(0)

      await sleep(150)
      expect(callCount).toBe(1)
    })

    it('should call immediately when immediate is true', async () => {
      let callCount = 0
      const debouncedFn = debounce(
        () => {
          callCount++
        },
        100,
        true
      )

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(callCount).toBe(1)

      await sleep(150)
      expect(callCount).toBe(1)
    })
  })

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now()
      await sleep(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(90)
    })
  })

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: [1, 2, 3],
        },
      }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('should handle dates', () => {
      const date = new Date('2025-01-01')
      const cloned = deepClone(date)
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('should handle arrays', () => {
      const arr = [1, 2, { a: 3 }]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[2]).not.toBe(arr[2])
    })
  })

  describe('deepEqual', () => {
    it('should return true for equal objects', () => {
      const a = { a: 1, b: { c: 2 } }
      const b = { a: 1, b: { c: 2 } }
      expect(deepEqual(a, b)).toBe(true)
    })

    it('should return false for different objects', () => {
      const a = { a: 1, b: { c: 2 } }
      const b = { a: 1, b: { c: 3 } }
      expect(deepEqual(a, b)).toBe(false)
    })

    it('should handle dates', () => {
      const a = new Date('2025-01-01')
      const b = new Date('2025-01-01')
      expect(deepEqual(a, b)).toBe(true)
    })

    it('should handle primitives', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual('hello', 'hello')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(false)
    })

    it('should return true for empty arrays', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty([1, 2])).toBe(false)
    })

    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true)
      expect(isEmpty({ a: 1 })).toBe(false)
    })

    it('should return false for non-empty values', () => {
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
      expect(isEmpty('hello')).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should use custom decimals', () => {
      expect(formatFileSize(1024, 3)).toBe('1 KB')
      expect(formatFileSize(1536, 2)).toBe('1.5 KB')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should use custom prefix', () => {
      const id = generateId('user')
      expect(id).toMatch(/^user-/)
    })

    it('should have expected format', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z]+-\d+-[a-z0-9]+$/)
    })
  })
})
