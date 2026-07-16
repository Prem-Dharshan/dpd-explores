import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseCSV, extractPlaceIdFromUrl, validatePlace } from './csv-parser'
import Papa from 'papaparse'

// Mock Papa.parse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}))

describe('csv-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseCSV', () => {
    it('should successfully parse valid CSV data', async () => {
      const mockFile = new File([''], 'test.csv')
      const mockCSVData = {
        data: [
          {
            Title: ' Test Place ',
            Note: 'Test Note',
            URL: 'http://maps.google.com/test',
            Comment: 'Test Comment',
          },
          {
            Title: 'Another Place',
            Note: '',
            URL: '',
            Comment: '',
          },
        ],
      }

      // Setup the mock to call the complete callback
      vi.mocked(Papa.parse).mockImplementation((file, options: any) => {
        options.complete(mockCSVData)
        return null as any
      })

      const result = await parseCSV(mockFile)

      expect(Papa.parse).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        header: true,
        skipEmptyLines: true,
      }))

      expect(result).toHaveLength(2)

      // Check first place (should trim values)
      expect(result[0]).toEqual({
        name: 'Test Place',
        notes: 'Test Note',
        gmaps_url: 'http://maps.google.com/test',
        comment: 'Test Comment',
      })

      // Check second place (should handle empty values)
      expect(result[1]).toEqual({
        name: 'Another Place',
        notes: undefined,
        gmaps_url: undefined,
        comment: undefined,
      })
    })

    it('should filter out rows without a Title (name)', async () => {
      const mockFile = new File([''], 'test.csv')
      const mockCSVData = {
        data: [
          {
            Title: 'Valid Place',
            Note: 'Test Note',
          },
          {
            Title: '', // Empty title
            Note: 'Should be filtered',
          },
          {
            Title: '   ', // Whitespace only title
            Note: 'Should also be filtered',
          },
        ],
      }

      vi.mocked(Papa.parse).mockImplementation((file, options: any) => {
        options.complete(mockCSVData)
        return null as any
      })

      const result = await parseCSV(mockFile)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Valid Place')
    })

    it('should handle missing fields in row gracefully', async () => {
      const mockFile = new File([''], 'test.csv')
      const mockCSVData = {
        data: [
          {
            Title: 'Just A Title',
            // Missing Note, URL, Tags, Comment completely
          },
        ],
      }

      vi.mocked(Papa.parse).mockImplementation((file, options: any) => {
        options.complete(mockCSVData)
        return null as any
      })

      const result = await parseCSV(mockFile)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'Just A Title',
        notes: undefined,
        gmaps_url: undefined,
        comment: undefined,
      })
    })

    it('should reject when Papa.parse encounters an error', async () => {
      const mockFile = new File([''], 'test.csv')
      const mockError = new Error('Parsing failed')

      vi.mocked(Papa.parse).mockImplementation((file, options: any) => {
        options.error(mockError)
        return null as any
      })

      await expect(parseCSV(mockFile)).rejects.toThrow('CSV parsing error: Parsing failed')
    })

    it('should reject when mapping throws an error in complete callback', async () => {
      const mockFile = new File([''], 'test.csv')

      vi.mocked(Papa.parse).mockImplementation((file, options: any) => {
        // Pass something that will cause an error in the mapping
        options.complete(null)
        return null as any
      })

      await expect(parseCSV(mockFile)).rejects.toThrow()
    })
  })

  describe('extractPlaceIdFromUrl', () => {
    it('should extract place ID from a standard URL format', () => {
      const url = 'https://www.google.com/maps/place/Name/data=!4m2!3m1!1s0x89c259a9b3117469:0xd134e199a405a163'
      expect(extractPlaceIdFromUrl(url)).toBe('0x89c259a9b3117469:0xd134e199a405a163')
    })

    it('should return null for invalid URLs', () => {
      expect(extractPlaceIdFromUrl('https://www.google.com/maps')).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(extractPlaceIdFromUrl('')).toBeNull()
    })

    it('should handle different query string parameter formats', () => {
        const url = 'https://www.google.com/maps/search/?api=1&query=test!1s0x123:0x456&something=else'
        expect(extractPlaceIdFromUrl(url)).toBe('0x123:0x456')
    })
  })

  describe('validatePlace', () => {
    it('should return no errors for a valid place', () => {
      const validPlace = { name: 'Valid Place', gmaps_url: 'http://example.com' }
      expect(validatePlace(validPlace)).toEqual([])
    })

    it('should return error if name is missing', () => {
      const invalidPlace = { name: '', gmaps_url: 'http://example.com' }
      expect(validatePlace(invalidPlace)).toContain('Place name is required')
    })

    it('should return error if name is too long', () => {
      const longName = 'a'.repeat(256)
      const invalidPlace = { name: longName, gmaps_url: 'http://example.com' }
      expect(validatePlace(invalidPlace)).toContain('Place name must be less than 255 characters')
    })
  })
})
